const crypto = require('crypto');
const supabase = require('../config/db');

class ExamService {
    calculateGrade(marksObtained, totalMarks) {
        if (totalMarks === 0) return 'F';
        const percentage = (marksObtained / totalMarks) * 100;
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    }

    async getExams(tenantId) {
        const { data, error } = await supabase.from('exams')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('date', { ascending: false });

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return data || [];
    }

    async createExam(tenantId, examPayload) {
        const { data, error } = await supabase.from('exams')
            .insert({
                id: crypto.randomUUID(),
                ...examPayload,
                tenant_id: tenantId
            })
            .select()
            .single();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return data;
    }

    async getResults(tenantId, examId) {
        const { data, error } = await supabase.from('results')
            .select(`
                *,
                student:students(name, admission_no, class_name)
            `)
            .eq('tenant_id', tenantId)
            .eq('exam_id', examId);

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        const results = data || [];
        
        let classAverage = 0;
        let highestScore = 0;

        if (results.length > 0) {
            const totalScore = results.reduce((sum, r) => sum + r.marks_obtained, 0);
            classAverage = Math.round(totalScore / results.length);
            highestScore = Math.max(...results.map(r => r.marks_obtained));
        }

        return {
            results,
            classAverage,
            highestScore
        };
    }

    async submitResult(tenantId, resultPayload) {
        // Fetch exam to get total_marks for grading
        const { data: exam, error: examError } = await supabase.from('exams')
            .select('total_marks')
            .eq('id', resultPayload.exam_id)
            .eq('tenant_id', tenantId)
            .single();

        if (examError || !exam) {
            const err = new Error('Exam not found.');
            err.statusCode = 404;
            throw err;
        }

        const grade = this.calculateGrade(resultPayload.marks_obtained, exam.total_marks);

        const { data, error } = await supabase.from('results')
            .upsert({
                id: crypto.randomUUID(), // In upsert without specifying conflict it might duplicate if no unique constraint is on, but we have UNIQUE(exam_id, student_id) in SQL. Wait, upsert needs conflict column if we are generating UUIDs.
                // It's safer to check if it exists or rely on the unique constraint and use insert with on_conflict.
                // Since Supabase JS `upsert` uses the primary key by default, we need to pass `onConflict: 'exam_id,student_id'`. But the id will be generated on DB side if we don't pass it?
                // Actually, let's just use insert on conflict. But wait, we can just do a select first or rely on the db.
                // Let's pass the payload.
                ...resultPayload,
                grade,
                tenant_id: tenantId
            }, { onConflict: 'exam_id,student_id' })
            .select()
            .single();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return data;
    }

    async getStudentResults(tenantId, studentId) {
        const { data, error } = await supabase.from('results')
            .select(`
                *,
                exam:exams(name, subject, date, total_marks)
            `)
            .eq('tenant_id', tenantId)
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return data || [];
    }
    async deleteExam(tenantId, id) {
        const { error } = await supabase.from('exams')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);
        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return true;
    }

    // ─── Assessment Types ──────────────────────────────────────
    async getAssessmentTypes(schoolId) {
        const { data, error } = await supabase.from('assessment_types')
            .select('*')
            .eq('school_id', schoolId)
            .order('name');
        if (error) throw error;
        return data || [];
    }

    async createAssessmentType(schoolId, payload) {
        const { data, error } = await supabase.from('assessment_types')
            .insert({ id: crypto.randomUUID(), school_id: schoolId, ...payload })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateAssessmentType(schoolId, id, payload) {
        const { data, error } = await supabase.from('assessment_types')
            .update(payload)
            .eq('id', id)
            .eq('school_id', schoolId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteAssessmentType(schoolId, id) {
        const { error } = await supabase.from('assessment_types')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);
        if (error) throw error;
        return true;
    }

    // ─── Grading Scales ────────────────────────────────────────
    async getGradingScales(schoolId) {
        const { data, error } = await supabase.from('grading_scales')
            .select('*')
            .eq('school_id', schoolId)
            .order('name');
        if (error) throw error;
        return data || [];
    }

    async createGradingScale(schoolId, payload) {
        const { data, error } = await supabase.from('grading_scales')
            .insert({ id: crypto.randomUUID(), school_id: schoolId, ...payload })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteGradingScale(schoolId, id) {
        const { error } = await supabase.from('grading_scales')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);
        if (error) throw error;
        return true;
    }

    async getGradeRules(scaleId) {
        const { data, error } = await supabase.from('grade_rules')
            .select('*')
            .eq('grading_scale_id', scaleId)
            .order('min_percent');
        if (error) throw error;
        return data || [];
    }

    async setGradeRule(scaleId, payload) {
        const { data, error } = await supabase.from('grade_rules')
            .insert({ id: crypto.randomUUID(), grading_scale_id: scaleId, ...payload })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteGradeRule(id) {
        const { error } = await supabase.from('grade_rules')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }

    calculateGradeFromRules(percentage, rules) {
        if (!rules || rules.length === 0) return { grade: 'F', points: 0 };
        for (const rule of rules) {
            if (percentage >= rule.min_percent && percentage <= rule.max_percent) {
                return { grade: rule.grade, points: rule.points || 0 };
            }
        }
        const sorted = [...rules].sort((a, b) => b.max_percent - a.max_percent);
        if (sorted.length > 0 && percentage > sorted[0].max_percent) {
            return { grade: sorted[0].grade, points: sorted[0].points || 0 };
        }
        return { grade: 'F', points: 0 };
    }

    // ─── Assessments ───────────────────────────────────────────
    async getAssessments(schoolId, filters = {}) {
        let query = supabase.from('assessments')
            .select('*, class:classes(name), subject:subjects(name, code), type:assessment_types(name, weight), term:academic_terms(name), session:academic_sessions(name)')
            .eq('school_id', schoolId);

        if (filters.class_id) query = query.eq('class_id', filters.class_id);
        if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);
        if (filters.term_id) query = query.eq('term_id', filters.term_id);
        if (filters.session_id) query = query.eq('session_id', filters.session_id);
        if (filters.assessment_type_id) query = query.eq('assessment_type_id', filters.assessment_type_id);
        if (filters.status) query = query.eq('status', filters.status);

        query = query.order('date', { ascending: false });
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async createAssessment(schoolId, payload, userId) {
        const { data, error } = await supabase.from('assessments')
            .insert({ id: crypto.randomUUID(), school_id: schoolId, created_by: userId || null, ...payload })
            .select('*, class:classes(name), subject:subjects(name, code), type:assessment_types(name)')
            .single();
        if (error) throw error;
        return data;
    }

    async updateAssessment(schoolId, id, payload) {
        const { data, error } = await supabase.from('assessments')
            .update(payload)
            .eq('id', id)
            .eq('school_id', schoolId)
            .select('*, class:classes(name), subject:subjects(name, code), type:assessment_types(name)')
            .single();
        if (error) throw error;
        return data;
    }

    async deleteAssessment(schoolId, id) {
        const { error } = await supabase.from('assessments')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);
        if (error) throw error;
        return true;
    }

    // ─── Assessment Scores ─────────────────────────────────────
    async getAssessmentScores(schoolId, assessmentId) {
        const { data, error } = await supabase.from('assessment_scores')
            .select('*, student:students(name, admission_no)')
            .eq('school_id', schoolId)
            .eq('assessment_id', assessmentId);
        if (error) throw error;
        return data || [];
    }

    async submitAssessmentScore(schoolId, payload) {
        const { data, error } = await supabase.from('assessment_scores')
            .upsert({ id: crypto.randomUUID(), school_id: schoolId, ...payload }, { onConflict: 'assessment_id,student_id' })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async bulkSubmitScores(schoolId, scores) {
        const payload = scores.map(s => ({
            id: crypto.randomUUID(),
            school_id: schoolId,
            ...s,
        }));
        const { data, error } = await supabase.from('assessment_scores')
            .upsert(payload, { onConflict: 'assessment_id,student_id' })
            .select();
        if (error) throw error;
        return data || [];
    }

    // ─── Term Grade Calculation ────────────────────────────────
    async calculateTermGrades(schoolId, classId, termId, sessionId, scaleId) {
        const subjects = await supabase.from('class_subjects')
            .select('subject_id, subject:subjects(name)')
            .eq('school_id', schoolId)
            .eq('class_id', classId);
        const subjectList = subjects.data || [];

        const students = await supabase.from('students')
            .select('id, name, admission_no')
            .eq('tenant_id', schoolId)
            .eq('is_active', true);
        const studentList = students.data || [];

        const assessmentTypes = await supabase.from('assessment_types')
            .select('id, name, weight')
            .eq('school_id', schoolId);
        const typeList = assessmentTypes.data || [];

        const assessments = await supabase.from('assessments')
            .select('id, subject_id, assessment_type_id, max_score, date, name')
            .eq('school_id', schoolId)
            .eq('class_id', classId)
            .eq('term_id', termId)
            .eq('session_id', sessionId)
            .neq('status', 'draft');
        const assessmentList = assessments.data || [];

        const scores = await supabase.from('assessment_scores')
            .select('assessment_id, student_id, score')
            .in('assessment_id', assessmentList.map(a => a.id))
            .eq('school_id', schoolId);
        const scoreList = scores.data || [];

        const gradeRules = scaleId
            ? (await supabase.from('grade_rules').select('*').eq('grading_scale_id', scaleId).order('min_percent')).data || []
            : [];

        const typeWeightMap = {};
        let totalWeight = 0;
        typeList.forEach(t => { typeWeightMap[t.id] = t.weight; totalWeight += t.weight; });

        const results = [];
        for (const student of studentList) {
            let totalWeightedScore = 0;
            let totalWeightedMax = 0;
            let subjectScores = [];

            for (const subj of subjectList) {
                const subjAssessments = assessmentList.filter(a => a.subject_id === subj.subject_id);
                if (subjAssessments.length === 0) continue;

                for (const type of typeList) {
                    const typeAssessments = subjAssessments.filter(a => a.assessment_type_id === type.id);
                    if (typeAssessments.length === 0) continue;

                    let typeScoreSum = 0;
                    let typeMaxSum = 0;
                    for (const a of typeAssessments) {
                        const s = scoreList.find(sc => sc.assessment_id === a.id && sc.student_id === student.id);
                        if (s) {
                            typeScoreSum += Number(s.score);
                            typeMaxSum += Number(a.max_score);
                        }
                    }

                    if (typeMaxSum > 0) {
                        const typePct = (typeScoreSum / typeMaxSum) * 100;
                        const weight = typeWeightMap[type.id] || 0;
                        totalWeightedScore += typePct * weight;
                        totalWeightedMax += 100 * weight;
                    }
                }

                const subjAssessmentsAll = subjAssessments;
                let subjScoreSum = 0;
                let subjMaxSum = 0;
                for (const a of subjAssessmentsAll) {
                    const s = scoreList.find(sc => sc.assessment_id === a.id && sc.student_id === student.id);
                    if (s) {
                        subjScoreSum += Number(s.score);
                        subjMaxSum += Number(a.max_score);
                    }
                }
                if (subjMaxSum > 0) {
                    subjectScores.push({
                        subject_id: subj.subject_id,
                        subject_name: subj.subject?.name || 'Unknown',
                        score: subjScoreSum,
                        max_score: subjMaxSum,
                        percentage: (subjScoreSum / subjMaxSum) * 100,
                    });
                }
            }

            const overallPct = totalWeightedMax > 0 ? (totalWeightedScore / totalWeightedMax) * 100 : 0;
            const { grade, points } = this.calculateGradeFromRules(overallPct, gradeRules);

            results.push({
                student_id: student.id,
                student_name: student.name,
                admission_no: student.admission_no,
                total_score: totalWeightedScore.toFixed(2),
                total_max_score: totalWeightedMax.toFixed(2),
                average: overallPct.toFixed(2),
                grade,
                points,
                subjects: subjectScores,
            });
        }

        results.sort((a, b) => Number(b.average) - Number(a.average));
        results.forEach((r, i) => { r.rank = i + 1; });

        return {
            results,
            subjectCount: subjectList.length,
            assessmentCount: assessmentList.length,
            studentCount: studentList.length,
        };
    }

    // ─── Report Cards ──────────────────────────────────────────
    async getReportCards(schoolId, filters = {}) {
        let query = supabase.from('report_cards')
            .select('*, student:students(name, admission_no), class:classes(name), term:academic_terms(name), session:academic_sessions(name)')
            .eq('school_id', schoolId);

        if (filters.term_id) query = query.eq('term_id', filters.term_id);
        if (filters.class_id) query = query.eq('class_id', filters.class_id);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.student_id) query = query.eq('student_id', filters.student_id);

        query = query.order('created_at', { ascending: false });
        if (filters.limit) query = query.limit(Number(filters.limit));

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async generateReportCard(schoolId, payload, userId) {
        const { class_id, term_id, session_id, student_id, scale_id } = payload;
        const gradResult = await this.calculateTermGrades(schoolId, class_id, term_id, session_id, scale_id);
        const studentResult = gradResult.results.find(r => r.student_id === student_id);
        if (!studentResult) throw Object.assign(new Error('No results found for this student'), { statusCode: 404 });

        const { data, error } = await supabase.from('report_cards')
            .upsert({
                id: crypto.randomUUID(),
                school_id: schoolId,
                student_id,
                class_id,
                term_id,
                session_id: session_id || null,
                total_score: studentResult.total_score,
                total_max_score: studentResult.total_max_score,
                average: studentResult.average,
                grade: studentResult.grade,
                rank: studentResult.rank,
                subject_count: studentResult.subjects.length,
                status: 'draft',
                created_at: new Date().toISOString(),
            }, { onConflict: 'student_id,term_id,session_id' })
            .select('*, student:students(name, admission_no), class:classes(name), term:academic_terms(name), session:academic_sessions(name)')
            .single();

        if (error) throw error;
        return { ...data, subjectDetails: studentResult.subjects };
    }

    async publishReportCard(schoolId, id, userId) {
        const { data, error } = await supabase.from('report_cards')
            .update({ status: 'published', published_at: new Date().toISOString(), published_by: userId })
            .eq('id', id)
            .eq('school_id', schoolId)
            .select('*, student:students(name, admission_no), class:classes(name), term:academic_terms(name), session:academic_sessions(name)')
            .single();
        if (error) throw error;
        return data;
    }

    async approveReportCard(schoolId, id, userId) {
        const { data, error } = await supabase.from('report_cards')
            .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: userId })
            .eq('id', id)
            .eq('school_id', schoolId)
            .select('*, student:students(name, admission_no), class:classes(name), term:academic_terms(name), session:academic_sessions(name)')
            .single();
        if (error) throw error;
        return data;
    }
}

module.exports = new ExamService();
