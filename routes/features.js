const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const supabase = require('../config/db');
const featureService = require('../services/featureService');
const { requirePermission } = require('../middleware/permission');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowed.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.docx')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload .xlsx, .csv, or .docx files only.'));
        }
    },
});

const parseInteger = (value, fallback, min = 1, max = 1000) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
};

// ─── Feature 1: Geofenced Attendance Link ───────────────────────

// POST /api/school/features/attendance-link/generate
router.post('/attendance-link/generate', requirePermission('attendance.create', 'attendance.edit'), async (req, res) => {
    try {
        const link = await featureService.generateAttendanceLink(req.tenant.id, req.user.userId || req.user.id, req.body);
        return res.status(201).json({ data: { link, message: 'Attendance link generated successfully.' } });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message || 'Error generating attendance link.' });
    }
});

// POST /api/school/features/attendance-link/verify
router.post('/attendance-link/verify', async (req, res) => {
    try {
        const { linkCode, latitude, longitude } = req.body;
        const userId = req.user?.userId || req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Authentication required.' });
        if (!linkCode || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'linkCode, latitude, and longitude are required.' });
        }
        const record = await featureService.verifyGeofenceAndRecord(req.tenant.id, linkCode, userId, Number(latitude), Number(longitude));
        return res.json({ data: { record, message: 'Attendance recorded successfully.' } });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message || 'Error recording attendance.' });
    }
});

// GET /api/school/features/attendance-links
router.get('/attendance-links', requirePermission('attendance.view'), async (req, res) => {
    try {
        const links = await featureService.getAttendanceLinks(req.tenant.id);
        return res.json({ data: { links } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching attendance links.' });
    }
});

// GET /api/school/features/geofence-attendance
router.get('/geofence-attendance', requirePermission('attendance.view'), async (req, res) => {
    try {
        const result = await featureService.getGeofenceAttendanceRecords(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching geofence attendance.' });
    }
});

// ─── Feature 2: Report Card Generation ──────────────────────────

// POST /api/school/features/report-card/upload-template
router.post('/report-card/upload-template', requirePermission('settings.edit'), upload.single('template'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'A .docx file is required.' });
        if (!req.file.originalname.endsWith('.docx')) {
            return res.status(400).json({ error: 'Only .docx files are accepted as templates.' });
        }
        const template = await featureService.uploadReportCardTemplate(req.tenant.id, req.user.userId || req.user.id, req.file);
        return res.status(201).json({ data: { template, message: 'Template uploaded successfully.' } });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error uploading template.' });
    }
});

// GET /api/school/features/report-card/templates
router.get('/report-card/templates', async (req, res) => {
    try {
        const templates = await featureService.getReportCardTemplates(req.tenant.id);
        return res.json({ data: { templates } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching templates.' });
    }
});

// POST /api/school/features/report-card/generate
router.post('/report-card/generate', requirePermission('grades.create', 'grades.edit'), async (req, res) => {
    try {
        const result = await featureService.generateReportCards(req.tenant.id, req.body);
        return res.json({ data: { ...result, message: `Generated ${result.generated} report cards.` } });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message || 'Error generating report cards.' });
    }
});

// GET /api/school/features/report-cards
router.get('/report-cards', async (req, res) => {
    try {
        const cards = await featureService.getStudentReportCards(req.tenant.id, req.query);
        return res.json({ data: { cards } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching report cards.' });
    }
});

// GET /api/school/features/report-cards/download-zip
router.get('/report-cards/download-zip', requirePermission('reports.view'), async (req, res) => {
    try {
        const { zipPath, count } = await featureService.downloadReportCardsZip(req.tenant.id, req.query);
        res.download(zipPath, `report_cards_${Date.now()}.zip`, (err) => {
            if (err) console.error('Download error:', err);
            setTimeout(() => fs.unlink(zipPath, () => {}), 5000);
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error downloading report cards.' });
    }
});

// ─── Feature 3: Bulk Data Import ───────────────────────────────

// POST /api/school/features/import/preview
router.post('/import/preview', requirePermission('students.create', 'students.edit'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'A spreadsheet file is required.' });
        const entityType = req.body.entityType || 'students';
        const preview = await featureService.previewImport(req.tenant.id, entityType, req.file);
        return res.json({ data: preview });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message || 'Error previewing import.' });
    }
});

// POST /api/school/features/import/confirm
router.post('/import/confirm', requirePermission('students.create', 'students.edit'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'A spreadsheet file is required.' });
        const entityType = req.body.entityType || 'students';
        const result = await featureService.confirmImport(req.tenant.id, entityType, req.file);
        return res.json({ data: { ...result, message: `Imported ${result.imported} records. ${result.skipped} skipped. ${result.errors.length} errors.` } });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message || 'Error confirming import.' });
    }
});

// ─── Feature 4: Enhanced Students/Staff Queries ────────────────

// GET /api/school/features/students
router.get('/students', requirePermission('students.view'), async (req, res) => {
    try {
        const result = await featureService.getStudentsEnhanced(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching students.' });
    }
});

// GET /api/school/features/teachers
router.get('/teachers', async (req, res) => {
    try {
        const result = await featureService.getTeachersEnhanced(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching teachers.' });
    }
});

// GET /api/school/features/non-teaching-staff
router.get('/non-teaching-staff', async (req, res) => {
    try {
        const result = await featureService.getNonTeachingStaff(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching non-teaching staff.' });
    }
});

// ─── Feature 5: Daily Staff Sign-in/Sign-out ───────────────────

// POST /api/school/features/daily-attendance/generate-links (admin/cron)
router.post('/daily-attendance/generate-links', requirePermission('attendance.create'), async (req, res) => {
    try {
        const links = await featureService.generateDailyAttendanceLinks(req.tenant.id);
        return res.status(201).json({ data: { links, message: 'Daily attendance links generated.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error generating daily links.' });
    }
});

// POST /api/school/features/daily-attendance/signin (public link)
router.post('/daily-attendance/signin', async (req, res) => {
    try {
        const { linkCode } = req.body;
        const userId = req.user?.userId || req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Authentication required.' });
        const record = await featureService.processSignInOut(req.tenant.id, linkCode, userId);
        return res.json({ data: { record, message: 'Sign-in recorded successfully.' } });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message || 'Error recording sign-in.' });
    }
});

// POST /api/school/features/daily-attendance/signout (public link)
router.post('/daily-attendance/signout', async (req, res) => {
    try {
        const { linkCode } = req.body;
        const userId = req.user?.userId || req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Authentication required.' });
        const record = await featureService.processSignInOut(req.tenant.id, linkCode, userId);
        return res.json({ data: { record, message: 'Sign-out recorded successfully.' } });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message || 'Error recording sign-out.' });
    }
});

// PUT /api/school/features/daily-attendance/override/:id
router.put('/daily-attendance/override/:id', requirePermission('attendance.edit'), async (req, res) => {
    try {
        const record = await featureService.overrideStaffAttendance(req.tenant.id, req.params.id, req.user.userId || req.user.id, req.body);
        return res.json({ data: { record, message: 'Attendance record updated.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error overriding attendance.' });
    }
});

// GET /api/school/features/daily-attendance
router.get('/daily-attendance', requirePermission('attendance.view'), async (req, res) => {
    try {
        const result = await featureService.getDailyStaffAttendance(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching daily attendance.' });
    }
});

// GET /api/school/features/daily-attendance/current-links
router.get('/daily-attendance/current-links', async (req, res) => {
    try {
        const links = await featureService.getCurrentDailyLinks(req.tenant.id);
        return res.json({ data: { links } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching current links.' });
    }
});

// ─── Cron: Generate daily attendance links for all schools ─────
router.post('/cron/generate-daily-links', async (req, res) => {
    try {
        const secret = process.env.CRON_SECRET;
        const auth = req.headers['x-cron-secret'] || req.headers.authorization?.replace('Bearer ', '');
        if (secret && auth !== secret) return res.status(401).json({ error: 'Unauthorized.' });

        const { data: schools } = await supabase.from('schools').select('id').eq('is_active', true);
        const results = [];
        for (const school of schools || []) {
            try {
                const links = await featureService.generateDailyAttendanceLinks(school.id);
                results.push({ schoolId: school.id, links: links.length });
            } catch (e) {
                results.push({ schoolId: school.id, error: e.message });
            }
        }
        return res.json({ data: { schoolsProcessed: schools?.length || 0, results } });
    } catch (err) {
        return res.status(500).json({ error: 'Cron job failed.' });
    }
});

module.exports = router;
