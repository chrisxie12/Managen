const express  = require('express');
const router   = express.Router();
const auditService = require('../services/auditService');
const { protect } = require('./school');
const { requirePermission } = require('../middleware/permission');

const parsePage = (v) => Math.max(1, Number.parseInt(v) || 1);
const parseLimit = (v) => Math.min(500, Math.max(1, Number.parseInt(v) || 50));

router.get('/', protect, requirePermission('audit_logs.view'), async (req, res) => {
  try {
    const data = await auditService.getAuditLogs(req.tenant.id, {
      ...req.query,
      page: parsePage(req.query.page),
      limit: parseLimit(req.query.limit),
    });
    return res.json({ data });
  } catch (err) { return res.status(500).json({ error: err.message || 'Error fetching audit logs.' }); }
});

router.get('/export', protect, requirePermission('audit_logs.view'), async (req, res) => {
  try {
    const rows = await auditService.exportAuditLogsCsv(req.tenant.id, req.query);
    if (rows.length === 0) return res.json({ data: [] });
    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(h => {
          const val = String(row[h] ?? '');
          return val.includes(',') || val.includes('"') || val.includes('\n')
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        }).join(',')
      ),
    ];
    const csv = csvLines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    return res.send(csv);
  } catch (err) { return res.status(500).json({ error: err.message || 'Error exporting audit logs.' }); }
});

router.get('/:id', protect, requirePermission('audit_logs.view'), async (req, res) => {
  try {
    const data = await auditService.getAuditLogById(req.tenant.id, req.params.id);
    return res.json({ data });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Error fetching audit log.' });
  }
});

module.exports = router;
