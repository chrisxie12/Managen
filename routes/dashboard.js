const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dashboardService = require('../services/dashboardService');

const protect = (req, res, next) => {
  try {
    const token = req.cookies?.schoolos_token;
    if (!token) return res.status(401).json({ error: 'No token provided.' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const getSchoolId = (req) => req.tenant?.id || req.user?.schoolId || req.user?.tenantId;

// GET /api/school/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'School not found.' });
    const data = await dashboardService.getStats(schoolId);
    return res.json({ data });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ error: 'Error fetching dashboard stats.' });
  }
});

// GET /api/school/dashboard/financial-performance?days=25
router.get('/financial-performance', protect, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'School not found.' });
    const days = Math.min(365, Math.max(1, Number.parseInt(req.query.days) || 25));
    const data = await dashboardService.getFinancialPerformance(schoolId, days);
    return res.json({ data });
  } catch (err) {
    console.error('Financial performance error:', err);
    return res.status(500).json({ error: 'Error fetching financial performance.' });
  }
});

// GET /api/school/dashboard/activity?limit=20
router.get('/activity', protect, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'School not found.' });
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit) || 20));
    const data = await dashboardService.getActivity(schoolId, limit);
    return res.json({ data });
  } catch (err) {
    console.error('Activity error:', err);
    return res.status(500).json({ error: 'Error fetching activity.' });
  }
});

// GET /api/school/dashboard/birthdays?days=7
router.get('/birthdays', protect, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'School not found.' });
    const days = Math.min(31, Math.max(1, Number.parseInt(req.query.days) || 7));
    const data = await dashboardService.getBirthdays(schoolId, days);
    return res.json({ data });
  } catch (err) {
    console.error('Birthdays error:', err);
    return res.status(500).json({ error: 'Error fetching birthdays.' });
  }
});

// GET /api/school/dashboard/alerts
router.get('/alerts', protect, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'School not found.' });
    const data = await dashboardService.getAlerts(schoolId);
    return res.json({ data });
  } catch (err) {
    console.error('Alerts error:', err);
    return res.status(500).json({ error: 'Error fetching alerts.' });
  }
});

// GET /api/school/dashboard/staff-today
router.get('/staff-today', protect, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'School not found.' });
    const data = await dashboardService.getStaffToday(schoolId);
    return res.json({ data });
  } catch (err) {
    console.error('Staff today error:', err);
    return res.status(500).json({ error: 'Error fetching staff today.' });
  }
});

module.exports = router;
