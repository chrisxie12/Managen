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

// GET /api/grades/items?class_id=&subject_id=&term_id=
router.get('/items', protect, requirePermission('assessments.view'), async (req, res) => {
  try {
    const schoolId = requireSchool(req);
    const { class_id, subject_id, term_id } = req.query;
    const { data, error } = await supabase
      .from('assessment_items')
      .select('*')
      .eq('school_id', schoolId)
      .eq('class_id', class_id)
      .eq('subject_id', subject_id)
      .eq('term_id', term_id)
      .order('assessment_type', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('GET /api/grades/items error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to load assessment items' });
  }
});

// POST /api/grades/items  — create assessment item
router.post('/items', protect, requirePermission('assessments.manage'), async (req, res) => {
  try {
    const schoolId = requireSchool(req);
    const { class_id, subject_id, term_id, assessment_type, name, max_points, sort_order } = req.body;
    if (!class_id || !subject_id || !term_id || !assessment_type || !name || max_points == null) {
      return res.status(400).json({ error: 'Missing required fields: class_id, subject_id, term_id, assessment_type, name, max_points' });
    }
    if (!['SBA', 'EXAM'].includes(assessment_type)) {
      return res.status(400).json({ error: 'assessment_type must be SBA or EXAM' });
    }
    const { data, error } = await supabase
      .from('assessment_items')
      .insert({ school_id: schoolId, class_id, subject_id, term_id, assessment_type, name, max_points, sort_order: sort_order || 0 })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'An assessment item with this name already exists for this class/subject/term' });
      throw error;
    }
    res.status(201).json({ data });
  } catch (err) {
    console.error('POST /api/grades/items error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to create assessment item' });
  }
});

// DELETE /api/grades/items/:id
router.delete('/items/:id', protect, requirePermission('assessments.manage'), async (req, res) => {
  try {
    const schoolId = requireSchool(req);
    const { id } = req.params;
    const { error } = await supabase
      .from('assessment_items')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/grades/items error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to delete assessment item' });
  }
});

// GET /api/grades/scores?class_id=&subject_id=&term_id=
router.get('/scores', protect, requirePermission('assessments.view'), async (req, res) => {
  try {
    const schoolId = requireSchool(req);
    const { class_id, subject_id, term_id } = req.query;
    const { data: items, error: itemsError } = await supabase
      .from('assessment_items')
      .select('id')
      .eq('school_id', schoolId)
      .eq('class_id', class_id)
      .eq('subject_id', subject_id)
      .eq('term_id', term_id);
    if (itemsError) throw itemsError;
    if (!items.length) return res.json({ data: [] });

    const itemIds = items.map(i => i.id);
    const { data, error } = await supabase
      .from('student_grades')
      .select('*')
      .eq('school_id', schoolId)
      .in('assessment_item_id', itemIds);
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('GET /api/grades/scores error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to load scores' });
  }
});

// POST /api/grades/save  — batch upsert scores
router.post('/save', protect, requirePermission('assessments.manage'), async (req, res) => {
  try {
    const schoolId = requireSchool(req);
    const { scores } = req.body;
    if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ error: 'scores must be a non-empty array of { student_id, assessment_item_id, score_achieved }' });
    }

    const records = scores.map(s => ({
      school_id: schoolId,
      student_id: s.student_id,
      assessment_item_id: s.assessment_item_id,
      score_achieved: Math.max(0, parseFloat(s.score_achieved) || 0),
    }));

    const { data, error } = await supabase
      .from('student_grades')
      .upsert(records, { onConflict: 'student_id, assessment_item_id', ignoreDuplicates: false })
      .select();
    if (error) throw error;
    res.json({ data, count: data?.length || 0 });
  } catch (err) {
    console.error('POST /api/grades/save error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to save grades' });
  }
});

// GET /api/grades/summary?class_id=&subject_id=&term_id=
router.get('/summary', protect, requirePermission('assessments.view'), async (req, res) => {
  try {
    const { class_id, subject_id, term_id } = req.query;
    const { data, error } = await supabase
      .from('v_nacca_terminal_summary')
      .select('*')
      .eq('class_id', class_id)
      .eq('subject_id', subject_id)
      .eq('term_id', term_id);
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('GET /api/grades/summary error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to load summary' });
  }
});

module.exports = router;
