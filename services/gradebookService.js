const crypto = require('crypto');
const supabase = require('../config/db');

class GradebookService {
    /**
     * Calculate the term average for a single student.
     * Category average = average of (score/max_score * 100) across all assessments in that category
     * Term average = weighted average of category averages
     * Missing scores are skipped (not treated as zero).
     */
    async calculateTermAverage(studentId, classId, termId, schoolId) {
        const { data: assessmentTypes, error: atErr } = await supabase
            .from('assessment_types')
            .select('id, name, weight')
            .eq('school_id', schoolId);
        if (atErr) {
            const err = new Error(atErr.message);
            err.statusCode = 400;
            throw err;
        }

        const { data: assessments, error: aErr } = await supabase
            .from('assessments')
            .select('id, assessment_type_id, max_score')
            .eq('school_id', schoolId)
            .eq('class_id', classId)
            .eq('term_id', termId)
            .neq('status', 'draft');
        if (aErr) {
            const err = new Error(aErr.message);
            err.statusCode = 400;
            throw err;
        }

        if (!assessments || assessments.length === 0) {
            return {
                percentage: 0,
                grade: 'N/A',
                grade_remark: 'No assessments found',
                category_breakdown: [],
            };
        }

        const assessmentIds = assessments.map(a => a.id);
        const { data: scores, error: sErr } = await supabase
            .from('assessment_scores')
            .select('assessment_id, score')
            .eq('school_id', schoolId)
            .eq('student_id', studentId)
            .in('assessment_id', assessmentIds);
        if (sErr) {
            const err = new Error(sErr.message);
            err.statusCode = 400;
            throw err;
        }

        const scoreMap = {};
        if (scores) {
            for (const s of scores) {
                scoreMap[s.assessment_id] = Number(s.score);
            }
        }

        const typeMap = {};
        for (const at of assessmentTypes) {
            typeMap[at.id] = { name: at.name, weight: Number(at.weight), assessments: [] };
        }

        for (const a of assessments) {
            const tid = a.assessment_type_id;
            if (typeMap[tid]) {
                typeMap[tid].assessments.push(a);
            }
        }

        const categoryBreakdown = [];
        let totalWeightedScore = 0;
        let totalWeight = 0;

        for (const typeId of Object.keys(typeMap)) {
            const cat = typeMap[typeId];
            if (cat.assessments.length === 0) continue;

            let percentageSum = 0;
            let scoredCount = 0;

            for (const a of cat.assessments) {
                const scoreVal = scoreMap[a.id];
                if (scoreVal !== undefined && Number(a.max_score) > 0) {
                    percentageSum += (scoreVal / Number(a.max_score)) * 100;
                    scoredCount++;
                }
            }

            if (scoredCount > 0) {
                const catAverage = Math.round((percentageSum / scoredCount) * 100) / 100;
                categoryBreakdown.push({
                    category_name: cat.name,
                    average: catAverage,
                    weight: cat.weight,
                    scored: scoredCount,
                    total: cat.assessments.length,
                });
                totalWeightedScore += catAverage * cat.weight;
                totalWeight += cat.weight;
            }
        }

        const termPercentage = totalWeight > 0
            ? Math.round((totalWeightedScore / totalWeight) * 100) / 100
            : 0;

        let grade = 'N/A';
        let gradeRemark = 'Not graded';

        try {
            const result = await this._lookupGrade(schoolId, termPercentage);
            grade = result.grade;
            gradeRemark = result.remark;
        } catch (_) { }

        return {
            percentage: termPercentage,
            grade,
            grade_remark: gradeRemark,
            category_breakdown: categoryBreakdown,
        };
    }

    /**
     * Calculate term averages for all students in a class.
     * Returns array sorted by percentage descending with rank.
     */
    async calculateClassTermAverages(classId, termId, schoolId) {
        const { data: cls, error: clsErr } = await supabase
            .from('classes')
            .select('name')
            .eq('id', classId)
            .eq('school_id', schoolId)
            .single();
        if (clsErr || !cls) {
            const err = new Error('Class not found.');
            err.statusCode = 404;
            throw err;
        }
        const className = cls.name;

        const { data: students, error: stErr } = await supabase
            .from('students')
            .select('id, name, admission_no')
            .eq('tenant_id', schoolId)
            .eq('class_name', className)
            .eq('is_active', true);
        if (stErr) {
            const err = new Error(stErr.message);
            err.statusCode = 400;
            throw err;
        }

        if (!students || students.length === 0) {
            return [];
        }

        const results = [];
        for (const student of students) {
            try {
                const termResult = await this.calculateTermAverage(
                    student.id, classId, termId, schoolId
                );
                results.push({
                    student_id: student.id,
                    student_name: student.name,
                    admission_no: student.admission_no,
                    percentage: termResult.percentage,
                    grade: termResult.grade,
                    grade_remark: termResult.grade_remark,
                    category_breakdown: termResult.category_breakdown,
                });
            } catch (e) {
                console.error(`Gradebook error for student ${student.id}:`, e.message);
                results.push({
                    student_id: student.id,
                    student_name: student.name,
                    admission_no: student.admission_no,
                    percentage: 0,
                    grade: 'ERR',
                    grade_remark: e.message,
                    category_breakdown: [],
                });
            }
        }

        results.sort((a, b) => b.percentage - a.percentage);
        results.forEach((r, i) => { r.rank = i + 1; });

        return results;
    }

    /**
     * Update or create a report card record with the calculated average.
     * Falls back to session-less upsert if no current session found.
     */
    async updateReportCard(studentId, classId, termId, schoolId) {
        const termAverage = await this.calculateTermAverage(
            studentId, classId, termId, schoolId
        );

        const { data: session } = await supabase
            .from('academic_sessions')
            .select('id')
            .eq('school_id', schoolId)
            .eq('is_current', true)
            .maybeSingle();

        const classResult = await this.calculateClassTermAverages(classId, termId, schoolId);
        const studentRank = classResult.find(r => r.student_id === studentId)?.rank || null;
        const subjectCount = classResult.length > 0
            ? (classResult[0].category_breakdown || []).length
            : 0;

        let totalScore = 0;
        let totalMaxScore = 0;
        for (const cat of termAverage.category_breakdown) {
            totalScore += cat.average * cat.weight;
            totalMaxScore += 100 * cat.weight;
        }

        const record = {
            id: crypto.randomUUID(),
            school_id: schoolId,
            student_id: studentId,
            class_id: classId,
            term_id: termId,
            session_id: session?.id || null,
            total_score: Math.round(totalScore * 100) / 100,
            total_max_score: Math.round(totalMaxScore * 100) / 100,
            average: termAverage.percentage,
            grade: termAverage.grade,
            rank: studentRank,
            subject_count: subjectCount,
            status: 'draft',
        };

        const conflictColumns = session?.id
            ? 'student_id,term_id,session_id'
            : 'student_id,term_id';

        const { data, error } = await supabase
            .from('report_cards')
            .upsert(record, { onConflict: conflictColumns })
            .select('*, student:students(name, admission_no), class:classes(name), term:academic_terms(name), session:academic_sessions(name)')
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        return {
            ...data,
            category_breakdown: termAverage.category_breakdown,
        };
    }

    /**
     * Look up the grade and remark for a percentage using the school's default grading scale.
     */
    async _lookupGrade(schoolId, percentage) {
        const { data: scale, error: scErr } = await supabase
            .from('grading_scales')
            .select('id')
            .eq('school_id', schoolId)
            .eq('is_default', true)
            .maybeSingle();

        if (scErr || !scale) {
            return { grade: 'N/A', remark: 'No default grading scale configured', points: 0 };
        }

        const { data: rules, error: grErr } = await supabase
            .from('grade_rules')
            .select('grade, min_percent, max_percent, points, remark')
            .eq('grading_scale_id', scale.id)
            .order('min_percent', { ascending: false });

        if (grErr || !rules || rules.length === 0) {
            return { grade: 'N/A', remark: 'No grade rules defined', points: 0 };
        }

        for (const rule of rules) {
            if (percentage >= Number(rule.min_percent) && percentage <= Number(rule.max_percent)) {
                return {
                    grade: rule.grade,
                    remark: rule.remark || '',
                    points: Number(rule.points) || 0,
                };
            }
        }

        const highest = rules[rules.length - 1];
        if (highest && percentage > Number(highest.max_percent)) {
            return {
                grade: highest.grade,
                remark: highest.remark || '',
                points: Number(highest.points) || 0,
            };
        }

        return { grade: 'F', remark: 'Below minimum threshold', points: 0 };
    }
}

module.exports = new GradebookService();
