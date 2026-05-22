const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const { protect } = require('./school');
const { requirePermission } = require('../middleware/permission');

const requireSchool = (req) => {
    if (!req.tenant?.id && !req.tenant?.school_id) {
        throw Object.assign(new Error('Tenant context required'), { statusCode: 400 });
    }
    return req.tenant?.school_id || req.tenant?.id;
};

// GET /api/assessments/grid?class_id=...&subject_id=...&term_id=...
router.get('/grid', protect, requirePermission('assessments.view'), async (req, res) => {
    try {
        const schoolId = requireSchool(req);
        const { class_id, subject_id, term_id } = req.query;

        if (!class_id || !subject_id || !term_id) {
            return res.status(400).json({ error: 'class_id, subject_id, and term_id are required' });
        }

        // 1. Fetch Students in the class
        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('id, name, roll_number, admission_number')
            .eq('school_id', schoolId)
            .eq('current_class_id', class_id)
            .order('name', { ascending: true });

        if (studentsError) throw studentsError;

        // 2. Fetch Assessment Types (The Columns)
        const { data: assessmentTypes, error: typesError } = await supabase
            .from('assessment_types')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: true });

        if (typesError) throw typesError;

        // 3. Fetch Grade Rules
        const { data: gradeRules, error: rulesError } = await supabase
            .from('grade_rules')
            .select('*')
            .order('min_percent', { ascending: false });
            
        // We filter manually since grade_rules links to grading_scales, but for now just send all rules or default rules
        // Ideally we fetch the school's default grading scale. Assuming there's a default one:
        const { data: scales } = await supabase.from('grading_scales').select('id').eq('school_id', schoolId).eq('is_default', true).limit(1);
        const scaleId = scales?.[0]?.id;
        const filteredRules = gradeRules?.filter(r => r.grading_scale_id === scaleId) || [];

        // 4. Fetch the Assessments for this context
        const { data: assessments, error: assessmentsError } = await supabase
            .from('assessments')
            .select('id, assessment_type_id, max_score')
            .eq('school_id', schoolId)
            .eq('class_id', class_id)
            .eq('subject_id', subject_id)
            .eq('term_id', term_id);

        if (assessmentsError) throw assessmentsError;

        const assessmentIds = assessments.map(a => a.id);

        // 5. Fetch Scores
        let scores = [];
        if (assessmentIds.length > 0) {
            const { data: scoresData, error: scoresError } = await supabase
                .from('assessment_scores')
                .select('*')
                .in('assessment_id', assessmentIds);

            if (scoresError) throw scoresError;
            scores = scoresData || [];
        }

        // Check if grades are locked (can use the class/term status or a specific lock flag if it exists)
        // For now, assume a mock `is_locked` based on term status.
        
        res.json({
            data: {
                students,
                assessmentTypes,
                assessments,
                scores,
                gradeRules: filteredRules,
                is_locked: false // Placeholder, can be derived from term status or headmaster settings
            }
        });
    } catch (err) {
        console.error('GET /api/assessments/grid error:', err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Failed to load gradebook grid' });
    }
});

// PATCH /api/assessments/scores/:id
// Optimistic update per cell
router.patch('/scores/:id', protect, requirePermission('assessments.manage'), async (req, res) => {
    try {
        const schoolId = requireSchool(req);
        const { id } = req.params;
        const { score } = req.body;

        if (score === undefined || isNaN(parseFloat(score))) {
            return res.status(400).json({ error: 'Valid numeric score is required' });
        }

        const { data, error } = await supabase
            .from('assessment_scores')
            .update({ score: parseFloat(score) })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Note: The trigger `trigger_audit_assessment_scores` handles the audit log automatically!
        res.json({ data });
    } catch (err) {
        console.error('PATCH /api/assessments/scores error:', err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Failed to save score' });
    }
});

// POST /api/assessments/scores
// Create a new score if it doesn't exist yet (for new cells)
router.post('/scores', protect, requirePermission('assessments.manage'), async (req, res) => {
    try {
        const schoolId = requireSchool(req);
        const { student_id, assessment_id, score } = req.body;

        if (!student_id || !assessment_id || score === undefined) {
            return res.status(400).json({ error: 'student_id, assessment_id, and score are required' });
        }

        const { data, error } = await supabase
            .from('assessment_scores')
            .insert({
                school_id: schoolId,
                student_id,
                assessment_id,
                score: parseFloat(score)
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                // If it exists, update it instead
                const { data: updateData, error: updateError } = await supabase
                    .from('assessment_scores')
                    .update({ score: parseFloat(score) })
                    .eq('student_id', student_id)
                    .eq('assessment_id', assessment_id)
                    .select()
                    .single();
                if (updateError) throw updateError;
                return res.json({ data: updateData });
            }
            throw error;
        }
        res.json({ data });
    } catch (err) {
        console.error('POST /api/assessments/scores error:', err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Failed to save score' });
    }
});

// DELETE /api/assessments/scores/:id
// When teacher deletes a score (clears the cell)
router.delete('/scores/:id', protect, requirePermission('assessments.manage'), async (req, res) => {
    try {
        const schoolId = requireSchool(req);
        const { id } = req.params;

        // To maintain audit, we can't truly delete, or we delete and log it.
        // For simplicity with the trigger, we'll actually delete, but a robust system might soft-delete.
        const { error } = await supabase
            .from('assessment_scores')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/assessments/scores error:', err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Failed to delete score' });
    }
});

module.exports = router;
