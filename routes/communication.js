const express  = require('express');
const router   = express.Router();
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
  } catch (err) { return res.status(500).json({ error: 'Error fetching communication stats.' }); }
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
  } catch (err) { return res.status(500).json({ error: 'Error fetching messages.' }); }
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
  } catch (err) { return res.status(500).json({ error: 'Error saving draft.' }); }
});

router.get('/recipient-options', protect, requirePermission('messages.view'), async (req, res) => {
  try {
    const data = await communicationService.getRecipientOptions(req.tenant.id);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error fetching recipient options.' }); }
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
  } catch (err) { return res.status(500).json({ error: 'Error fetching recipients.' }); }
});

router.delete('/:id', protect, requirePermission('messages.delete'), async (req, res) => {
  try {
    await communicationService.deleteMessage(req.tenant.id, req.params.id);
    return res.json({ data: { success: true } });
  } catch (err) { return res.status(500).json({ error: 'Error deleting message.' }); }
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
  } catch (err) { return res.status(500).json({ error: 'Error fetching templates.' }); }
});

router.post('/templates', protect, requirePermission('messages.create', 'messages.edit'), async (req, res) => {
  try {
    const data = await communicationService.createTemplate(req.tenant.id, req.body);
    return res.status(201).json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error creating template.' }); }
});

router.put('/templates/:id', protect, requirePermission('messages.edit'), async (req, res) => {
  try {
    const data = await communicationService.updateTemplate(req.tenant.id, req.params.id, req.body);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error updating template.' }); }
});

router.delete('/templates/:id', protect, requirePermission('messages.delete'), async (req, res) => {
  try {
    await communicationService.deleteTemplate(req.tenant.id, req.params.id);
    return res.json({ data: { success: true } });
  } catch (err) { return res.status(500).json({ error: 'Error deleting template.' }); }
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
  } catch (err) { return res.status(500).json({ error: 'Error fetching announcements.' }); }
});

router.post('/announcements', protect, requirePermission('announcements.create'), async (req, res) => {
  try {
    const data = await communicationService.createAnnouncement(req.tenant.id, req.user.userId, req.body);
    return res.status(201).json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error creating announcement.' }); }
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

module.exports = router;
