const express  = require('express');
const router   = express.Router();
const crypto   = require('crypto');
const supabase = require('../config/db');
const communicationService = require('../services/communicationService');
const { protect } = require('./school');
const { requirePermission } = require('../middleware/permission');

const parsePage = (v) => Math.max(1, Number.parseInt(v) || 1);
const parseLimit = (v) => Math.min(100, Math.max(1, Number.parseInt(v) || 20));

// ─── Stats ────────────────────────────────────────────────────────
router.get('/stats', protect, requirePermission('messages.view'), async (req, res) => {
  try {
    const data = await communicationService.getStats(req.tenant.id);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error fetching communication stats.' }); }
});

// ─── Messages ─────────────────────────────────────────────────────
router.get('/', protect, requirePermission('messages.view'), async (req, res) => {
  try {
    const data = await communicationService.getMessages(req.tenant.id, {
      ...req.query,
      page: parsePage(req.query.page),
      limit: parseLimit(req.query.limit),
    });
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error fetching messages.' }); }
});

router.post('/send', protect, requirePermission('messages.create'), async (req, res) => {
  try {
    const data = await communicationService.sendMessage(req.tenant.id, req.user.userId, req.body);
    return res.status(201).json({ data });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Error sending message.' });
  }
});

router.post('/drafts', protect, requirePermission('messages.create'), async (req, res) => {
  try {
    const data = await communicationService.saveDraft(req.tenant.id, req.user.userId, req.body);
    return res.status(201).json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error saving draft.' }); }
});

router.get('/recipient-options', protect, requirePermission('messages.view'), async (req, res) => {
  try {
    const data = await communicationService.getRecipientOptions(req.tenant.id);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error fetching recipient options.' }); }
});

router.get('/:id', protect, requirePermission('messages.view'), async (req, res) => {
  try {
    const data = await communicationService.getMessageById(req.tenant.id, req.params.id);
    return res.json({ data });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Error fetching message.' });
  }
});

router.get('/:id/recipients', protect, requirePermission('messages.view'), async (req, res) => {
  try {
    const data = await communicationService.getRecipients(req.tenant.id, req.params.id);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error fetching recipients.' }); }
});

router.delete('/:id', protect, requirePermission('messages.delete'), async (req, res) => {
  try {
    await communicationService.deleteMessage(req.tenant.id, req.params.id);
    return res.json({ data: { success: true } });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error deleting message.' }); }
});

router.post('/:id/resend', protect, requirePermission('messages.create'), async (req, res) => {
  try {
    const data = await communicationService.resendFailed(req.tenant.id, req.params.id);
    return res.json({ data });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Error resending message.' });
  }
});

// ─── Templates ────────────────────────────────────────────────────
router.get('/templates/list', protect, requirePermission('messages.view'), async (req, res) => {
  try {
    const data = await communicationService.getTemplates(req.tenant.id, req.query.category);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error fetching templates.' }); }
});

router.post('/templates', protect, requirePermission('messages.create', 'messages.edit'), async (req, res) => {
  try {
    const data = await communicationService.createTemplate(req.tenant.id, req.body);
    return res.status(201).json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error creating template.' }); }
});

router.put('/templates/:id', protect, requirePermission('messages.edit'), async (req, res) => {
  try {
    const data = await communicationService.updateTemplate(req.tenant.id, req.params.id, req.body);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error updating template.' }); }
});

router.delete('/templates/:id', protect, requirePermission('messages.delete'), async (req, res) => {
  try {
    await communicationService.deleteTemplate(req.tenant.id, req.params.id);
    return res.json({ data: { success: true } });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error deleting template.' }); }
});

// ─── Announcements ────────────────────────────────────────────────
router.get('/announcements/list', protect, requirePermission('announcements.view'), async (req, res) => {
  try {
    const data = await communicationService.getAnnouncements(req.tenant.id, {
      ...req.query,
      page: parsePage(req.query.page),
      limit: parseLimit(req.query.limit),
    });
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error fetching announcements.' }); }
});

router.post('/announcements', protect, requirePermission('announcements.create'), async (req, res) => {
  try {
    const data = await communicationService.createAnnouncement(req.tenant.id, req.user.userId, req.body);
    return res.status(201).json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error creating announcement.' }); }
});

router.put('/announcements/:id/publish', protect, requirePermission('announcements.edit'), async (req, res) => {
  try {
    const data = await communicationService.publishAnnouncement(req.tenant.id, req.params.id);
    return res.json({ data });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Error publishing announcement.' });
  }
});

// ─── Events ───────────────────────────────────────────────────────
router.get('/events/list', protect, async (req, res) => {
  try {
    const schoolId = req.tenant.id;
    const { upcoming, status, page = 1, limit = 50 } = req.query;
    let query = supabase.from('events').select('*', { count: 'exact' }).eq('school_id', schoolId);

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.eq('status', 'published');
    }

    if (upcoming === 'true') {
      query = query.gte('event_date', new Date().toISOString().split('T')[0]);
    }

    query = query.order('event_date', { ascending: true }).order('event_time', { ascending: true });

    const p = Math.max(1, Number(page));
    const l = Math.min(100, Math.max(1, Number(limit)));
    query = query.range((p - 1) * l, p * l - 1);

    const { data, count, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: { records: data || [], total: count || 0, page: p, limit: l } });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error fetching events.' }); }
});

router.post('/events', protect, requirePermission('announcements.create'), async (req, res) => {
  try {
    const { title, description, event_date, event_time, event_type, location } = req.body;
    if (!title || !event_date) return res.status(400).json({ error: 'title and event_date are required.' });

    const { data: event, error } = await supabase.from('events').insert({
      id: crypto.randomUUID(),
      school_id: req.tenant.id,
      title,
      description: description || null,
      event_date,
      event_time: event_time || null,
      event_type: event_type || 'general',
      location: location || null,
      created_by: req.user.userId,
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ data: { event } });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error creating event.' }); }
});

router.put('/events/:id/cancel', protect, requirePermission('announcements.edit'), async (req, res) => {
  try {
    const { error } = await supabase.from('events')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id)
      .eq('school_id', req.tenant.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: { message: 'Event cancelled.' } });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error cancelling event.' }); }
});

module.exports = router;
