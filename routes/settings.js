const express  = require('express');
const router   = express.Router();
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const settingsService = require('../services/settingsService');
const { protect } = require('./school');
const { requirePermission } = require('../middleware/permission');

const profileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  website: z.string().max(255).optional(),
  country: z.string().max(100).optional(),
  currency: z.string().max(10).optional(),
  currency_symbol: z.string().max(5).optional(),
  timezone: z.string().max(50).optional(),
  locale: z.string().max(10).optional(),
  date_format: z.string().max(20).optional(),
  week_starts_on: z.string().max(10).optional(),
}).strict();

const brandingSchema = z.object({
  logo_url: z.string().max(500).optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color').optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color').optional(),
}).strict();

const notifPrefSchema = z.object({
  notification_email: z.string().email().optional().or(z.literal('')),
  notification_phone: z.string().max(50).optional().or(z.literal('')),
  enable_sms_notifications: z.boolean().optional(),
  enable_email_notifications: z.boolean().optional(),
  enable_whatsapp_notifications: z.boolean().optional(),
  enable_in_app_notifications: z.boolean().optional(),
  auto_publish_report_cards: z.boolean().optional(),
  enable_fee_reminders: z.boolean().optional(),
}).strict();

const termSchema = z.object({
  name: z.string().min(1).max(100),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  is_current: z.boolean().optional(),
});

const sessionSchema = termSchema;

const gradingScaleSchema = z.object({
  name: z.string().min(1).max(200),
  is_default: z.boolean().optional(),
});

const gradeRuleSchema = z.object({
  grade: z.string().max(5),
  min_percent: z.number().min(0).max(100),
  max_percent: z.number().min(0).max(100),
  points: z.number().optional(),
  remark: z.string().max(255).optional(),
});

const testEmailSchema = z.object({ to: z.string().email(), subject: z.string().min(1), text: z.string().min(1) });
const testSmsSchema = z.object({ to: z.string().min(1), message: z.string().min(1) });
const testWhatsAppSchema = z.object({ to: z.string().min(1), body: z.string().min(1) });

const whatsappConfigSchema = z.object({
  phone_id: z.string().max(50).optional(),
  access_token: z.string().max(500).optional(),
  business_account_id: z.string().max(50).optional(),
  verify_token: z.string().max(100).optional(),
}).strict();

// ─── All Settings ──────────────────────────────────────────────
router.get('/', protect, requirePermission('settings.view'), async (req, res) => {
  try {
    const data = await settingsService.getAll(req.tenant.id);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error fetching settings.' }); }
});

// ─── Profile ───────────────────────────────────────────────────
router.put('/profile', protect, requirePermission('settings.edit'), validate(profileSchema), async (req, res) => {
  try {
    const data = await settingsService.updateProfile(req.tenant.id, req.body);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error updating profile.' }); }
});

// ─── Branding ──────────────────────────────────────────────────
router.put('/branding', protect, requirePermission('settings.edit'), validate(brandingSchema), async (req, res) => {
  try {
    const data = await settingsService.updateBranding(req.tenant.id, req.body);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error updating branding.' }); }
});

// ─── Notification Preferences ─────────────────────────────────
router.put('/notifications', protect, requirePermission('settings.edit'), validate(notifPrefSchema), async (req, res) => {
  try {
    const data = await settingsService.updateNotificationPrefs(req.tenant.id, req.body);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error updating notification preferences.' }); }
});

router.post('/test-email', protect, requirePermission('settings.edit'), validate(testEmailSchema), async (req, res) => {
  try {
    const result = await settingsService.testEmail(req.body.to, req.body.subject, req.body.text);
    return res.json({ data: result });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/test-sms', protect, requirePermission('settings.edit'), validate(testSmsSchema), async (req, res) => {
  try {
    const result = await settingsService.testSms(req.body.to, req.body.message);
    return res.json({ data: result });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/test-whatsapp', protect, requirePermission('settings.edit'), validate(testWhatsAppSchema), async (req, res) => {
  try {
    const result = await settingsService.testWhatsApp(req.body.to, req.body.body);
    return res.json({ data: result });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Academic Settings ─────────────────────────────────────────
router.put('/academic', protect, requirePermission('settings.edit'), async (req, res) => {
  try {
    const data = await settingsService.updateAcademic(req.tenant.id, req.body);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error updating academic settings.' }); }
});

// ─── Fee Settings ──────────────────────────────────────────────
router.put('/fee', protect, requirePermission('settings.edit'), async (req, res) => {
  try {
    const data = await settingsService.updateFee(req.tenant.id, req.body);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error updating fee settings.' }); }
});

// ─── Academic Terms ────────────────────────────────────────────
router.get('/terms', protect, requirePermission('settings.view'), async (req, res) => {
  try { const data = await settingsService.getTerms(req.tenant.id); return res.json({ data }); }
  catch (err) { return res.status(500).json({ error: 'Error fetching terms.' }); }
});

router.post('/terms', protect, requirePermission('settings.edit'), validate(termSchema), async (req, res) => {
  try { const data = await settingsService.createTerm(req.tenant.id, req.body); return res.status(201).json({ data }); }
  catch (err) { return res.status(500).json({ error: 'Error creating term.' }); }
});

router.put('/terms/:id', protect, requirePermission('settings.edit'), async (req, res) => {
  try {
    const data = await settingsService.updateTerm(req.tenant.id, req.params.id, req.body);
    return res.json({ data });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Error updating term.' });
  }
});

router.delete('/terms/:id', protect, requirePermission('settings.edit'), async (req, res) => {
  try { await settingsService.deleteTerm(req.tenant.id, req.params.id); return res.json({ data: { success: true } }); }
  catch (err) { return res.status(500).json({ error: 'Error deleting term.' }); }
});

// ─── Academic Sessions ─────────────────────────────────────────
router.get('/sessions', protect, requirePermission('settings.view'), async (req, res) => {
  try { const data = await settingsService.getSessions(req.tenant.id); return res.json({ data }); }
  catch (err) { return res.status(500).json({ error: 'Error fetching sessions.' }); }
});

router.post('/sessions', protect, requirePermission('settings.edit'), validate(sessionSchema), async (req, res) => {
  try { const data = await settingsService.createSession(req.tenant.id, req.body); return res.status(201).json({ data }); }
  catch (err) { return res.status(500).json({ error: 'Error creating session.' }); }
});

router.put('/sessions/:id', protect, requirePermission('settings.edit'), async (req, res) => {
  try {
    const data = await settingsService.updateSession(req.tenant.id, req.params.id, req.body);
    return res.json({ data });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Error updating session.' });
  }
});

router.delete('/sessions/:id', protect, requirePermission('settings.edit'), async (req, res) => {
  try { await settingsService.deleteSession(req.tenant.id, req.params.id); return res.json({ data: { success: true } }); }
  catch (err) { return res.status(500).json({ error: 'Error deleting session.' }); }
});

// ─── Grading Scales ────────────────────────────────────────────
router.get('/grading-scales', protect, requirePermission('settings.view'), async (req, res) => {
  try { const data = await settingsService.getGradingScales(req.tenant.id); return res.json({ data }); }
  catch (err) { return res.status(500).json({ error: 'Error fetching grading scales.' }); }
});

router.post('/grading-scales', protect, requirePermission('settings.edit'), validate(gradingScaleSchema), async (req, res) => {
  try { const data = await settingsService.createGradingScale(req.tenant.id, req.body); return res.status(201).json({ data }); }
  catch (err) { return res.status(500).json({ error: 'Error creating grading scale.' }); }
});

router.delete('/grading-scales/:id', protect, requirePermission('settings.edit'), async (req, res) => {
  try { await settingsService.deleteGradingScale(req.tenant.id, req.params.id); return res.json({ data: { success: true } }); }
  catch (err) { return res.status(500).json({ error: 'Error deleting grading scale.' }); }
});

router.post('/grade-rules', protect, requirePermission('settings.edit'), validate(gradeRuleSchema), async (req, res) => {
  try { const data = await settingsService.setGradeRule(req.body.grading_scale_id, req.body); return res.status(201).json({ data }); }
  catch (err) { return res.status(500).json({ error: 'Error creating grade rule.' }); }
});

router.delete('/grade-rules/:id', protect, requirePermission('settings.edit'), async (req, res) => {
  try { await settingsService.deleteGradeRule(req.params.id); return res.json({ data: { success: true } }); }
  catch (err) { return res.status(500).json({ error: 'Error deleting grade rule.' }); }
});

// ─── Key-Value Settings ────────────────────────────────────────
router.get('/kv/:key', protect, async (req, res) => {
  try { const data = await settingsService.getSetting(req.tenant.id, req.params.key); return res.json({ data }); }
  catch (err) { return res.status(500).json({ error: 'Error fetching setting.' }); }
});

router.put('/kv', protect, requirePermission('settings.edit'), async (req, res) => {
  try { const data = await settingsService.updateSetting(req.tenant.id, req.body.key, req.body.value); return res.json({ data }); }
  catch (err) { return res.status(500).json({ error: 'Error updating setting.' }); }
});

router.delete('/kv/:key', protect, requirePermission('settings.edit'), async (req, res) => {
  try { await settingsService.deleteSetting(req.tenant.id, req.params.key); return res.json({ data: { success: true } }); }
  catch (err) { return res.status(500).json({ error: 'Error deleting setting.' }); }
});

// ─── WhatsApp Business API Config ─────────────────────────────
router.get('/whatsapp-config', protect, requirePermission('settings.view'), async (req, res) => {
  try {
    const data = await settingsService.getWhatsAppConfig(req.tenant.id);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error fetching WhatsApp config.' }); }
});

router.put('/whatsapp-config', protect, requirePermission('settings.edit'), validate(whatsappConfigSchema), async (req, res) => {
  try {
    const data = await settingsService.updateWhatsAppConfig(req.tenant.id, req.body);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: 'Error saving WhatsApp config.' }); }
});

// ─── Integrations ──────────────────────────────────────────────
router.get('/integrations', protect, requirePermission('settings.view'), async (req, res) => {
  try {
    const [sysIntegrations, dbIntegrations] = await Promise.all([
      settingsService.getIntegrations(),
      settingsService.getDBIntegrations(req.tenant.id),
    ]);
    return res.json({ data: { system: sysIntegrations, custom: dbIntegrations } });
  } catch (err) { return res.status(500).json({ error: 'Error fetching integrations.' }); }
});

module.exports = router;
