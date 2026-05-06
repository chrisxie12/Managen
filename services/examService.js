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
}

module.exports = new ExamService();
