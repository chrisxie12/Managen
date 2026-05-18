// services/gradebookService.js
// Weighted gradebook computation for term averages and report cards

const supabase = require('../config/db');

/**
 * Calculate term average for a single student
 * @param {string} studentId - UUID of student
 * @param {string} classId - UUID of class
 * @param {string} termId - UUID of academic term
 * @param {string} schoolId - UUID of school (tenant)
 * @returns {Promise<Object>} { percentage, grade, grade_remark, category_breakdown }
 */
async function calculateTermAverage(studentId, classId, termId, schoolId) {
    // 1. Get all assessment types with weights for this school
    const { data: assessmentTypes, error: typeError } = await supabase
        .from('assessment_types')
        .select('id, name, weight')
        .eq('school_id', schoolId)
        .eq('is_active', true);

    if (typeError) throw typeError;
    if (!assessmentTypes || assessmentTypes.length === 0) return null;

    // 2. Get all assessments for this class and term
    const { data: assessments, error: assessmentError } = await supabase
        .from('assessments')
        .select('id, assessment_type_id, max_score, name')
        .eq('class_id', classId)
        .eq('term_id', termId);

    if (assessmentError) throw assessmentError;
    if (!assessments || assessments.length === 0) return null;

    // 3. Get all scores for this student
    const assessmentIds = assessments.map(a => a.id);
    const { data: scores, error: scoreError } = await supabase
        .from('assessment_scores')
        .select('assessment_id, score_obtained')
        .eq('student_id', studentId)
        .in('assessment_id', assessmentIds);

    if (scoreError) throw scoreError;

    // Create map: assessment_id -> score
    const scoreMap = new Map();
    scores.forEach(s => scoreMap.set(s.assessment_id, s.score_obtained));

    // 4. Calculate average per assessment type (category)
    const categoryBreakdown = {};
    let totalWeight = 0;
    let weightedSum = 0;

    for (const type of assessmentTypes) {
        const typeAssessments = assessments.filter(a => a.assessment_type_id === type.id);
        
        if (typeAssessments.length === 0) continue;

        let totalPercentage = 0;
        let validCount = 0;

        for (const assessment of typeAssessments) {
            const score = scoreMap.get(assessment.id);
            if (score !== undefined && score !== null) {
                const percentage = (score / assessment.max_score) * 100;
                totalPercentage += percentage;
                validCount++;
            }
        }

        if (validCount > 0) {
            const categoryAverage = totalPercentage / validCount;
            const weight = type.weight || 0;
            
            categoryBreakdown[type.name] = {
                average: Math.round(categoryAverage * 100) / 100,
                weight: weight,
                weighted_score: (categoryAverage * weight) / 100,
                assessments_count: validCount,
                total_assessments: typeAssessments.length
            };
            
            weightedSum += categoryAverage * weight;
            totalWeight += weight;
        }
    }

    if (totalWeight === 0) return null;

    // 5. Calculate final percentage
    const finalPercentage = weightedSum / totalWeight;
    const roundedPercentage = Math.round(finalPercentage * 100) / 100;

    // 6. Get grade from grading scale
    const grade = await getGradeFromPercentage(roundedPercentage, schoolId);

    return {
        percentage: roundedPercentage,
        grade: grade.grade,
        grade_remark: grade.remark,
        category_breakdown: categoryBreakdown,
        total_weight: totalWeight
    };
}

/**
 * Get grade letter and remark based on percentage
 */
async function getGradeFromPercentage(percentage, schoolId) {
    const { data: gradingScale, error } = await supabase
        .from('grading_scales')
        .select('grade, min_score, max_score, remark')
        .eq('school_id', schoolId)
        .lte('min_score', percentage)
        .gte('max_score', percentage)
        .single();

    if (!error && gradingScale) {
        return { grade: gradingScale.grade, remark: gradingScale.remark };
    }

    // Fallback default grading scale
    if (percentage >= 80) return { grade: 'A', remark: 'Excellent' };
    if (percentage >= 70) return { grade: 'B', remark: 'Very Good' };
    if (percentage >= 60) return { grade: 'C', remark: 'Good' };
    if (percentage >= 50) return { grade: 'D', remark: 'Pass' };
    if (percentage >= 45) return { grade: 'E', remark: 'Marginal Pass' };
    return { grade: 'F', remark: 'Fail' };
}

/**
 * Calculate term averages for all students in a class
 * @returns {Promise<Array>} Array of student results with averages
 */
async function calculateClassTermAverages(classId, termId, schoolId) {
    // Get all students in the class
    const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, name, roll_number, admission_number')
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('status', 'active');

    if (studentError) throw studentError;
    if (!students || students.length === 0) return [];

    const results = [];
    for (const student of students) {
        try {
            const average = await calculateTermAverage(student.id, classId, termId, schoolId);
            results.push({
                student_id: student.id,
                name: student.name,
                roll_number: student.roll_number,
                admission_number: student.admission_number,
                ...average
            });
        } catch (err) {
            console.error(`Error calculating for student ${student.id}:`, err.message);
            results.push({
                student_id: student.id,
                name: student.name,
                roll_number: student.roll_number,
                error: err.message
            });
        }
    }

    return results;
}

/**
 * Update or create report card record for a student
 */
async function updateReportCard(studentId, classId, termId, schoolId) {
    const average = await calculateTermAverage(studentId, classId, termId, schoolId);
    
    if (!average) {
        return { success: false, message: 'No assessment data found' };
    }

    // Check if report card already exists
    const { data: existing, error: findError } = await supabase
        .from('report_cards')
        .select('id')
        .eq('student_id', studentId)
        .eq('term_id', termId)
        .eq('school_id', schoolId)
        .single();

    if (findError && findError.code !== 'PGRST116') throw findError;

    let result;
    if (existing) {
        // Update existing
        result = await supabase
            .from('report_cards')
            .update({
                total_score: average.percentage,
                grade: average.grade,
                remark: average.grade_remark,
                updated_at: new Date().toISOString(),
                status: 'draft'
            })
            .eq('id', existing.id);
    } else {
        // Create new
        result = await supabase
            .from('report_cards')
            .insert({
                student_id: studentId,
                class_id: classId,
                term_id: termId,
                school_id: schoolId,
                total_score: average.percentage,
                grade: average.grade,
                remark: average.grade_remark,
                status: 'draft',
                created_at: new Date().toISOString()
            });
    }

    if (result.error) throw result.error;

    // Notify student about report card update
    try {
        const { createNotification } = require('./notificationService');
        const { data: classData } = await supabase
            .from('classes')
            .select('name')
            .eq('id', classId)
            .single();
        const className = classData?.name || 'Class';
        await createNotification({
            userId: studentId,
            schoolId,
            title: 'Report Card Updated',
            message: `Your report card for ${className} has been updated. Grade: ${average.grade} (${average.percentage}%)`,
            type: 'report_card',
            referenceId: existing?.id || studentId,
            referenceType: 'report_cards',
        });
    } catch (err) {
        console.error('Failed to send report card notification:', err.message);
    }
    
    return {
        success: true,
        student_id: studentId,
        percentage: average.percentage,
        grade: average.grade
    };
}

/**
 * Batch update report cards for entire class
 */
async function batchUpdateReportCards(classId, termId, schoolId) {
    const students = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('status', 'active');

    if (students.error) throw students.error;

    const results = [];
    for (const student of students.data) {
        const result = await updateReportCard(student.id, classId, termId, schoolId);
        results.push(result);
    }

    return results;
}

module.exports = {
    calculateTermAverage,
    calculateClassTermAverages,
    updateReportCard,
    batchUpdateReportCards,
    getGradeFromPercentage
};
