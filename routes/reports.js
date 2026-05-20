const express  = require('express');
const router   = express.Router();
const supabase = require('../config/db');
const reportService = require('../services/reportService');
const { protect } = require('./school');
const { requirePermission } = require('../middleware/permission');

const parsePage = (v) => Math.max(1, Number.parseInt(v) || 1);
const parseLimit = (v) => Math.min(500, Math.max(1, Number.parseInt(v) || 50));

// ─── Student Attendance Report ──────────────────────────────────
router.get('/attendance', protect, requirePermission('reports.view', 'attendance.view'), async (req, res) => {
    try {
        const data = await reportService.getAttendanceReport(req.tenant.id, { ...req.query, page: parsePage(req.query.page), limit: parseLimit(req.query.limit) });
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error generating attendance report.' }); }
});

// ─── Staff Attendance Report ────────────────────────────────────
router.get('/staff-attendance', protect, requirePermission('reports.view'), async (req, res) => {
    try {
        const data = await reportService.getStaffAttendanceReport(req.tenant.id, { ...req.query, page: parsePage(req.query.page), limit: parseLimit(req.query.limit) });
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error generating staff attendance report.' }); }
});

// ─── Academic Performance Report ────────────────────────────────
router.get('/academic-performance', protect, requirePermission('reports.view', 'grades.view'), async (req, res) => {
    try {
        const data = await reportService.getAcademicPerformanceReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error generating academic performance report.' }); }
});

// ─── Class Comparison Report ────────────────────────────────────
router.get('/class-comparison', protect, requirePermission('reports.view', 'grades.view'), async (req, res) => {
    try {
        const data = await reportService.getClassComparisonReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: 'Error generating class comparison report.' });
    }
});

// ─── Subject Performance Report ─────────────────────────────────
router.get('/subject-performance', protect, requirePermission('reports.view', 'grades.view'), async (req, res) => {
    try {
        const data = await reportService.getSubjectPerformanceReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: 'Error generating subject performance report.' });
    }
});

// ─── Fee Collection Report ──────────────────────────────────────
router.get('/fee-collection', protect, requirePermission('reports.view', 'fees.view'), async (req, res) => {
    try {
        const data = await reportService.getFeeCollectionReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error generating fee collection report.' }); }
});

// ─── Outstanding Balance Report ─────────────────────────────────
router.get('/outstanding-balance', protect, requirePermission('reports.view', 'fees.view'), async (req, res) => {
    try {
        const data = await reportService.getOutstandingBalanceReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error generating outstanding balance report.' }); }
});

// ─── Admissions / Enrollment Report ─────────────────────────────
router.get('/admissions', protect, requirePermission('reports.view'), async (req, res) => {
    try {
        const data = await reportService.getAdmissionsReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error generating admissions report.' }); }
});

// ─── Incidents / Disciplinary Report ────────────────────────────
router.get('/incidents', protect, requirePermission('reports.view', 'students.view'), async (req, res) => {
    try {
        const data = await reportService.getIncidentsReport(req.tenant.id, req.query);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error generating incidents report.' }); }
});

// ─── User Activity Report ───────────────────────────────────────
router.get('/activity', protect, requirePermission('reports.view', 'audit_logs.view'), async (req, res) => {
    try {
        const data = await reportService.getActivityReport(req.tenant.id, { ...req.query, page: parsePage(req.query.page), limit: parseLimit(req.query.limit) });
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error generating activity report.' }); }
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
        return res.status(500).json({ error: 'Error exporting report.' });
    }
});

// ─── AI Report Card Comments ──────────────────────────────────
const reportCommentsService = require('../services/reportCommentsService');
const queueService = require('../services/queueService');

router.post('/generate-comments', protect, requirePermission('grades.edit'), async (req, res) => {
    try {
        const { student_id, term_id } = req.body;
        if (!student_id || !term_id) return res.status(400).json({ error: 'student_id and term_id are required.' });
        const result = await reportCommentsService.generateComments(student_id, term_id, req.tenant.id);
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to generate comments.' });
    }
});

router.post('/generate-comments/bulk', protect, requirePermission('grades.edit'), async (req, res) => {
    try {
        const { class_id, term_id } = req.body;
        if (!class_id || !term_id) return res.status(400).json({ error: 'class_id and term_id are required.' });
        const jobs = await reportCommentsService.bulkGenerateComments(class_id, term_id, req.tenant.id);
        const reportCardQueue = queueService.getQueue();
        if (reportCardQueue) {
            const job = await reportCardQueue.add('generate-comments', {
                schoolId: req.tenant.id,
                jobs,
            }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
            return res.json({ data: { jobId: job.id, total: jobs.length } });
        }
        // Fallback: synchronous
        const results = [];
        for (const j of jobs) {
            const r = await reportCommentsService.generateComments(j.studentId, j.termId, j.schoolId);
            results.push(r);
        }
        return res.json({ data: { results, total: results.length } });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to start bulk comment generation.' });
    }
});

router.post('/generate-comments/approve', protect, requirePermission('grades.edit'), async (req, res) => {
    try {
        const { student_id, term_id, comment } = req.body;
        if (!student_id || !term_id || !comment) return res.status(400).json({ error: 'student_id, term_id, and comment are required.' });
        await reportCommentsService.approveComment(student_id, term_id, req.tenant.id, comment);
        return res.json({ data: { message: 'Comment approved.' } });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to approve comment.' });
    }
});

module.exports = router;
