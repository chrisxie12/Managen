const express = require('express');
const router = express.Router();
const healthService = require('../services/healthService');
const { protect } = require('./school');
const { requirePermission } = require('../middleware/permission');

router.get('/', protect, requirePermission('settings.view'), async (req, res) => {
  try {
    const data = await healthService.getFullHealth(req.tenant.id);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error fetching system health.' }); }
});

router.get('/refresh', protect, requirePermission('settings.view'), async (req, res) => {
  try {
    const data = await healthService.getFullHealth(req.tenant.id);
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error refreshing system health.' }); }
});

module.exports = router;
