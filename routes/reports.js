const express  = require('express');
const router   = express.Router();
const supabase = require('../config/db');
const reportService = require('../services/reportService');
const { protect } = require('./school');
const { requirePermission } = require('../middleware/permission');

const parsePage = (v) => Math.max(1, Number.parseInt(v) || 1);
const parseLimit = (v) => Math.min(500, Math.max(1, Number.parseInt(v) || 50));

// ─── Generate Report Cards (Queue) ──────────────────────────────
router.post('/generate', protect, requirePermission('reports.manage'), async (req, res) => {
    try {
        const schoolId = req.tenant.id;
        const { class_id, term_id, student_id } = req.body;

        if (!class_id || !term_id) {
            return res.status(400).json({ error: 'class_id and term_id are required' });
        }

        // Insert job into queue
        const { data, error } = await supabase.from('report_job_queue').insert({
            school_id: schoolId,
            class_id,
            term_id,
            student_id: student_id || null // if null, generates for whole class
        }).select().single();

        if (error) throw error;

        return res.status(202).json({ message: 'Report generation queued successfully', jobId: data.id });
    } catch (err) {
        console.error('Report generate error:', err);
        return res.status(500).json({ error: err.message || 'Failed to queue report generation' });
    }
});

// ─── Student Attendance Report ──────────────────────────────────
router.get('/attendance', protect, requirePermission('reports.view', 'attendance.view'), async (req, res) => {
    try {
        const data = await reportService.getAttendanceReport(req.tenant.id, { ...req.query, page: parsePage(req.query.page), limit: parseLimit(req.query.limit) });
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: err.message || 'Error generating attendance report.' }); }
});

// ─── Staff Attendance Report ────────────────────────────────────
router.get('/staff-attendance', protect, requirePermission('reports.view'), async (req, res) => {
    try {
        const data = await reportService.getStaffAttendanceReport(req.tenant.id, { ...req.query, page: parsePage(req.query.page), limit: parseLimit(req.query.limit) });
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: err.message || 'Error generating staff attendance report.' }); }
});

// ─── Academic Performance Report ────────────────────────────────
router.get('/academic-performance', protect, requirePermission('reports.view', 'grades.view'), async (req, res) => {
    try {
        const data = await reportService.getAcademicPerformanceReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: err.message || 'Error generating academic performance report.' }); }
});

// ─── Class Comparison Report ────────────────────────────────────
router.get('/class-comparison', protect, requirePermission('reports.view', 'grades.view'), async (req, res) => {
    try {
        const data = await reportService.getClassComparisonReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: err.message || 'Error generating class comparison report.' });
    }
});

// ─── Subject Performance Report ─────────────────────────────────
router.get('/subject-performance', protect, requirePermission('reports.view', 'grades.view'), async (req, res) => {
    try {
        const data = await reportService.getSubjectPerformanceReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: err.message || 'Error generating subject performance report.' });
    }
});

// ─── Fee Collection Report ──────────────────────────────────────
router.get('/fee-collection', protect, requirePermission('reports.view', 'fees.view'), async (req, res) => {
    try {
        const data = await reportService.getFeeCollectionReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: err.message || 'Error generating fee collection report.' }); }
});

// ─── Outstanding Balance Report ─────────────────────────────────
router.get('/outstanding-balance', protect, requirePermission('reports.view', 'fees.view'), async (req, res) => {
    try {
        const data = await reportService.getOutstandingBalanceReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: err.message || 'Error generating outstanding balance report.' }); }
});

// ─── Admissions / Enrollment Report ─────────────────────────────
router.get('/admissions', protect, requirePermission('reports.view'), async (req, res) => {
    try {
        const data = await reportService.getAdmissionsReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: err.message || 'Error generating admissions report.' }); }
});

// ─── Incidents / Disciplinary Report ────────────────────────────
router.get('/incidents', protect, requirePermission('reports.view', 'students.view'), async (req, res) => {
    try {
        const data = await reportService.getIncidentsReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: err.message || 'Error generating incidents report.' }); }
});

// ─── User Activity Report ───────────────────────────────────────
router.get('/activity', protect, requirePermission('reports.view', 'audit_logs.view'), async (req, res) => {
    try {
        const data = await reportService.getActivityReport(req.tenant.id, { ...req.query, page: parsePage(req.query.page), limit: parseLimit(req.query.limit) });
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: err.message || 'Error generating activity report.' }); }
});

// ─── CSV Export ──────────────────────────────────────────────────
router.get('/export', protect, requirePermission('reports.view'), async (req, res) => {
    try {
        const { type } = req.query;
        const validTypes = ['attendance', 'staff-attendance', 'fee-collection', 'outstanding', 'admissions', 'incidents', 'activity'];
        if (!type || !validTypes.includes(type)) {
            return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
        }

        const csv = await reportService.exportReportCsv(req.tenant.id, type, req.query);
        const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        if (!csv || csv.length === 0) {
            return res.send(`No ${type} data found for the given filters.\n`);
        }
        return res.send(csv);
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: err.message || 'Error exporting report.' });
    }
});

module.exports = router;
