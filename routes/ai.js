const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const { protect } = require('../routes/school');
const { requirePermission } = require('../middleware/permission');
const { aiRateLimit } = require('../middleware/aiRateLimit');
const { isAIAvailable } = require('../services/ai/geminiClient');
const reportCommentsService = require('../services/ai/reportCommentsService');
const chatbotService = require('../services/ai/chatbotService');

const AI_SETUP_URL = 'https://aistudio.google.com/app/apikey';

function requireAI(req, res, next) {
  if (!isAIAvailable()) {
    return res.status(503).json({ error: 'AI service not configured', setupUrl: AI_SETUP_URL });
  }
  next();
}

// POST /api/school/ai/report-comment
router.post('/report-comment', protect, requirePermission('reports.generate'), aiRateLimit, requireAI, async (req, res) => {
  try {
    const { studentId, termId } = req.body;
    if (!studentId || !termId) {
      return res.status(400).json({ error: 'studentId and termId are required.' });
    }

    const result = await reportCommentsService.generateComments(studentId, termId, req.tenant.id);

    const { data: card } = await supabase
      .from('report_cards')
      .select('id')
      .eq('student_id', studentId)
      .eq('term_id', termId)
      .eq('school_id', req.tenant.id)
      .single();

    await supabase.from('ai_usage').insert({
      school_id: req.tenant.id,
      user_id: req.user?.userId || null,
      endpoint: 'report-comment',
      tokens_used: 0,
      model: 'gemini-1.5-flash',
    }).catch(() => {});

    return res.json({
      data: {
        comment: result.comment,
        draftId: card?.id || null,
        status: result.status || 'draft',
        cached: result.cached || false,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to generate comment.' });
  }
});

// POST /api/school/ai/chatbot
router.post('/chatbot', protect, aiRateLimit, async (req, res) => {
  try {
    const { parentPhone, message, studentId } = req.body;
    if (!parentPhone || !message) {
      return res.status(400).json({ error: 'parentPhone and message are required.' });
    }

    let context = {};

    if (studentId) {
      const { data: student } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('id', studentId)
        .eq('school_id', req.tenant.id)
        .single();

      if (student) {
        context.studentName = `${student.first_name} ${student.last_name}`;

        const { data: invoices } = await supabase
          .from('invoices')
          .select('total_amount, paid_amount')
          .eq('student_id', studentId)
          .in('status', ['pending', 'overdue']);

        const total = (invoices || []).reduce((s, i) => s + Number(i.total_amount), 0);
        const paid = (invoices || []).reduce((s, i) => s + Number(i.paid_amount), 0);
        context.balance = total - paid;

        const { data: attendance } = await supabase
          .from('attendance_records')
          .select('status')
          .eq('student_id', studentId);

        const present = (attendance || []).filter(a => a.status === 'present').length;
        const totalDays = (attendance || []).length;
        context.attendance = totalDays > 0 ? Math.round((present / totalDays) * 100) + '%' : 'N/A';

        const { data: term } = await supabase
          .from('academic_terms')
          .select('name, end_date')
          .eq('school_id', req.tenant.id)
          .eq('is_current', true)
          .single()
          .catch(() => ({ data: null }));

        if (term?.end_date) {
          context.deadline = `${term.name} ends ${new Date(term.end_date).toLocaleDateString()}`;
        }
      }
    }

    const { reply, intent } = chatbotService.handleParentQuery(parentPhone, message, context);

    await supabase.from('ai_usage').insert({
      school_id: req.tenant.id,
      user_id: req.user?.userId || null,
      endpoint: 'chatbot',
      tokens_used: 0,
      model: 'gemini-1.5-flash',
    }).catch(() => {});

    return res.json({ data: { reply, intent, studentName: context.studentName || null } });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to process message.' });
  }
});

module.exports = router;
