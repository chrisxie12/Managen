const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const bcrypt   = require('bcryptjs');
const supabase = require('../config/db');
const schoolService = require('../services/schoolService');
const examService = require('../services/examService');
const feeReminderService = require('../services/feeReminderService');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { requirePermission } = require('../middleware/permission');
const { getPlanConfig } = require('../services/provisionService');
const parseInteger = (value, fallback, min = 1, max = 1000) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
};

const getTenantModules = (tenant) => {
    if (!tenant) return [];
    const plan = getPlanConfig(tenant.plan);
    return plan.modules || [];
};

const ensureMatchingTenant = (decoded, tenant) => {
    const tokenTenantId = decoded?.tenantId || decoded?.schoolId || null;
    if (tenant && tokenTenantId && tokenTenantId !== tenant.id) {
        const error = new Error('Token does not match the requested school.');
        error.statusCode = 403;
        throw error;
    }
};

const protect = (req, res, next) => {
    try {
        const token = req.cookies?.schoolos_token;
        if (!token)
            return res.status(401).json({ error: 'No token provided.' });
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        ensureMatchingTenant(req.user, req.tenant);
        next();
    } catch (err) {
        const statusCode = err.statusCode || 401;
        return res.status(statusCode).json({ error: statusCode === 403 ? 'Token does not match the requested school.' : 'Invalid or expired token.' });
    }
};

const allowRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(403).json({ error: 'Access denied for your role.' });
    next();
};

const requireModule = (mod) => (req, res, next) => {
    const modules = getTenantModules(req.tenant);
    if (!modules.includes('all') && !modules.includes(String(mod).toLowerCase()))
        return res.status(403).json({ error: `${mod} module not available on your plan.` });
    next();
};

// GET /api/school/info
router.get('/info', protect, (req, res) => {
    return res.json({
        data: {
            school: {
                id: req.tenant.id,
                name: req.tenant.name,
                slug: req.tenant.slug,
                subdomain: req.tenant.slug,
                plan: req.tenant.plan,
                status: req.tenant.is_active ? 'active' : 'suspended',
                modules: getTenantModules(req.tenant),
                maxStudents: getPlanConfig(req.tenant.plan).maxStudents,
                trialEndsAt: null,
            }
        }
    });
});

// GET /api/school/dashboard
router.get('/dashboard', protect, async (req, res) => {
    try {
        const stats = await schoolService.getDashboardStats(req.tenant.id);
        return res.json({ data: stats });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching dashboard stats.' });
    }
});

// GET /api/school/students
router.get('/students', protect, requirePermission('students.view'), async (req, res) => {
    try {
        const page = parseInteger(req.query.page, 1, 1, 1000000);
        const limit = parseInteger(req.query.limit, 20, 1, 100);
        
        const { students, count } = await schoolService.getStudents(req.tenant.id, page, limit, req.query.className);
        
        return res.json({ data: { students, total: count, page, limit } });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Error fetching students.' });
    }
});

// ─── Zod Schemas ──────────────────────────────────────────────
const studentSchema = {
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        class_name: z.string().min(1, 'Class name is required'),
        gender: z.enum(['Male', 'Female', 'Other']).optional(),
        dob: z.string().optional(),
        admission_no: z.string().optional(),
        parent_name: z.string().optional(),
        parent_phone: z.string().optional(),
        parent_email: z.string().email('Invalid email').optional().or(z.literal('')),
        address: z.string().optional()
    })
};

const feeReminderSchema = {
    body: z.object({
        limit: z.number().int().min(1).max(500).optional(),
        dryRun: z.boolean().optional(),
    }).optional(),
};

// POST /api/school/students
router.post('/students', protect, requirePermission('students.create', 'students.edit'), validate(studentSchema), async (req, res) => {
    try {
        const count = await schoolService.getStudentCount(req.tenant.id);

        const maxStudents = getPlanConfig(req.tenant.plan).maxStudents;
        if (maxStudents != null && count >= maxStudents)
            return res.status(403).json({ error: `Student limit (${maxStudents}) reached. Upgrade your plan.` });

        const studentPayload = req.body;

        const student = await schoolService.createStudent(req.tenant.id, studentPayload);
        
        return res.status(201).json({ data: { message: 'Student created.', student } });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Error creating student.' });
    }
});

// POST /api/school/attendance
router.post('/attendance', protect, requirePermission('attendance.create', 'attendance.edit'), async (req, res) => {
    try {
        const data = await schoolService.submitAttendance(req.tenant.id, req.body.records);
        return res.status(201).json({ data: { message: 'Attendance recorded.', data } });
    } catch (err) {
        return res.status(500).json({ error: 'Error recording attendance.' });
    }
});

// GET /api/school/attendance/stats
router.get('/attendance/stats', protect, async (req, res) => {
    try {
        const stats = await schoolService.getDashboardStats(req.tenant.id);
        return res.json({ data: { attendanceRate: stats.attendanceRate } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching attendance stats.' });
    }
});

// GET /api/school/fees
router.get('/fees', protect, requireModule('fees'), requirePermission('fees.view'), async (req, res) => {
    try {
        const fees = await schoolService.getFees(req.tenant.id, req.query.status);
        return res.json({ data: { fees } });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Error fetching fees.' });
    }
});

// POST /api/school/fees/reminders/send
router.post('/fees/reminders/send', protect, requireModule('fees'), requirePermission('fees.create', 'fees.edit'), validate(feeReminderSchema), async (req, res) => {
    try {
        const payload = req.body || {};
        
        // Check if Redis is available
        const redis = require('../config/redis');
        const redisAvailable = redis.isRedisConfigured();
        
        if (!redisAvailable) {
            console.warn('⚠️  Redis not configured. Fee reminders will run synchronously.');
        }

        const summary = await feeReminderService.sendDueFeeReminders({
            tenant: req.tenant,
            actorId: req.user && req.user.userId,
            limit: payload.limit || 100,
            dryRun: Boolean(payload.dryRun),
        });

        return res.json({
            data: {
                message: payload.dryRun ? 'Dry-run completed.' : 'Fee reminder dispatch completed.',
                ...summary,
            },
        });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Error sending fee reminders.' });
    }
});

// ─── Finance Routes ──────────────────────────────────────────────

// Fee Structures
router.get('/fee-structures', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const fees = await schoolService.getFeeStructures(req.tenant.id);
        return res.json({ data: { feeStructures: fees } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching fee structures.' }); }
});

router.post('/fee-structures', protect, requirePermission('fees.create', 'fees.edit'), async (req, res) => {
    try {
        const fee = await schoolService.createFeeStructure(req.tenant.id, req.body);
        return res.status(201).json({ data: { feeStructure: fee } });
    } catch (err) { return res.status(500).json({ error: 'Error creating fee structure.' }); }
});

router.put('/fee-structures/:id', protect, requirePermission('fees.edit'), async (req, res) => {
    try {
        const fee = await schoolService.updateFeeStructure(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { feeStructure: fee } });
    } catch (err) { return res.status(500).json({ error: 'Error updating fee structure.' }); }
});

router.delete('/fee-structures/:id', protect, requirePermission('fees.delete'), async (req, res) => {
    try {
        await schoolService.deleteFeeStructure(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Fee structure deleted.' } });
    } catch (err) { return res.status(500).json({ error: 'Error deleting fee structure.' }); }
});

// Invoices
router.get('/invoices', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const result = await schoolService.getInvoices(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) { return res.status(500).json({ error: 'Error fetching invoices.' }); }
});

router.post('/invoices/generate', protect, requirePermission('fees.create', 'fees.edit'), async (req, res) => {
    try {
        const invoice = await schoolService.generateInvoice(req.tenant.id, req.body);
        return res.status(201).json({ data: { invoice } });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: 'Error generating invoice.' });
    }
});

router.get('/invoices/:id', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const invoice = await schoolService.getInvoice(req.tenant.id, req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
        return res.json({ data: { invoice } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching invoice.' }); }
});

router.put('/invoices/:id/status', protect, requirePermission('fees.edit'), async (req, res) => {
    try {
        const invoice = await schoolService.updateInvoiceStatus(req.tenant.id, req.params.id, req.body.status);
        return res.json({ data: { invoice } });
    } catch (err) { return res.status(500).json({ error: 'Error updating invoice status.' }); }
});

// Payments
router.get('/payments', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const result = await schoolService.getPayments(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) { return res.status(500).json({ error: 'Error fetching payments.' }); }
});

router.post('/payments', protect, requirePermission('fees.create', 'fees.edit'), async (req, res) => {
    try {
        const payment = await schoolService.recordPayment(req.tenant.id, req.body, req.user?.userId);
        return res.status(201).json({ data: { payment } });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: 'Error recording payment.' });
    }
});

router.get('/payments/invoice/:invoiceId', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const payments = await schoolService.getPaymentsByInvoice(req.tenant.id, req.params.invoiceId);
        return res.json({ data: { payments } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching payments.' }); }
});

// Waivers
router.get('/waivers', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const result = await schoolService.getWaivers(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) { return res.status(500).json({ error: 'Error fetching waivers.' }); }
});

router.post('/waivers', protect, requirePermission('fees.create', 'fees.edit'), async (req, res) => {
    try {
        const waiver = await schoolService.createWaiver(req.tenant.id, req.body);
        return res.status(201).json({ data: { waiver } });
    } catch (err) { return res.status(500).json({ error: 'Error creating waiver.' }); }
});

router.put('/waivers/:id/approve', protect, requirePermission('fees.edit'), async (req, res) => {
    try {
        const waiver = await schoolService.approveWaiver(req.tenant.id, req.params.id, req.user?.userId);
        return res.json({ data: { waiver } });
    } catch (err) { return res.status(500).json({ error: 'Error approving waiver.' }); }
});

router.put('/waivers/:id/reject', protect, requirePermission('fees.edit'), async (req, res) => {
    try {
        const waiver = await schoolService.rejectWaiver(req.tenant.id, req.params.id, req.user?.userId);
        return res.json({ data: { waiver } });
    } catch (err) { return res.status(500).json({ error: 'Error rejecting waiver.' }); }
});

// Discounts
router.get('/discounts', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const discounts = await schoolService.getDiscounts(req.tenant.id);
        return res.json({ data: { discounts } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching discounts.' }); }
});

router.post('/discounts', protect, requirePermission('fees.create', 'fees.edit'), async (req, res) => {
    try {
        const discount = await schoolService.createDiscount(req.tenant.id, req.body);
        return res.status(201).json({ data: { discount } });
    } catch (err) { return res.status(500).json({ error: 'Error creating discount.' }); }
});

router.put('/discounts/:id', protect, requirePermission('fees.edit'), async (req, res) => {
    try {
        const discount = await schoolService.updateDiscount(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { discount } });
    } catch (err) { return res.status(500).json({ error: 'Error updating discount.' }); }
});

router.delete('/discounts/:id', protect, requirePermission('fees.delete'), async (req, res) => {
    try {
        await schoolService.deleteDiscount(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Discount deleted.' } });
    } catch (err) { return res.status(500).json({ error: 'Error deleting discount.' }); }
});

// Finance Analytics
router.get('/finance/summary', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const summary = await schoolService.getFinanceSummary(req.tenant.id);
        return res.json({ data: summary });
    } catch (err) { return res.status(500).json({ error: 'Error fetching finance summary.' }); }
});

router.get('/finance/revenue', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const { start, end } = req.query;
        const endDate = end || new Date().toISOString().split('T')[0];
        const startDate = start || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        const analytics = await schoolService.getRevenueAnalytics(req.tenant.id, startDate, endDate);
        return res.json({ data: analytics });
    } catch (err) { return res.status(500).json({ error: 'Error fetching revenue analytics.' }); }
});

router.get('/finance/outstanding', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const balances = await schoolService.getOutstandingBalances(req.tenant.id);
        return res.json({ data: { outstanding: balances } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching outstanding balances.' }); }
});

router.get('/finance/overdue-alerts', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const alerts = await schoolService.getOverdueAlerts(req.tenant.id);
        return res.json({ data: { overdueAlerts: alerts } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching overdue alerts.' }); }
});

// ─── Analytics Routes ───────────────────────────────────────────

// GET /api/school/analytics/attendance-trend
router.get('/analytics/attendance-trend', protect, async (req, res) => {
    try {
        const data = await schoolService.getAttendanceTrend(req.tenant.id, Number(req.query.days) || 30);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error fetching attendance trend.' }); }
});

// GET /api/school/analytics/performance-trend
router.get('/analytics/performance-trend', protect, async (req, res) => {
    try {
        const { term_id } = req.query;
        if (!term_id) return res.status(400).json({ error: 'term_id required.' });
        const data = await schoolService.getPerformanceTrend(req.tenant.id, term_id);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error fetching performance trend.' }); }
});

// GET /api/school/analytics/subject-comparison
router.get('/analytics/subject-comparison', protect, async (req, res) => {
    try {
        const { term_id } = req.query;
        if (!term_id) return res.status(400).json({ error: 'term_id required.' });
        const data = await schoolService.getSubjectComparison(req.tenant.id, term_id);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error fetching subject comparison.' }); }
});

// GET /api/school/analytics/class-comparison
router.get('/analytics/class-comparison', protect, async (req, res) => {
    try {
        const { term_id } = req.query;
        if (!term_id) return res.status(400).json({ error: 'term_id required.' });
        const data = await schoolService.getClassComparison(req.tenant.id, term_id);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error fetching class comparison.' }); }
});

// GET /api/school/analytics/risk-alerts
router.get('/analytics/risk-alerts', protect, async (req, res) => {
    try {
        const data = await schoolService.getRiskAlerts(req.tenant.id);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error fetching risk alerts.' }); }
});

// GET /api/school/analytics/top-bottom
router.get('/analytics/top-bottom', protect, async (req, res) => {
    try {
        const { term_id, class_id, limit } = req.query;
        if (!term_id) return res.status(400).json({ error: 'term_id required.' });
        const data = await schoolService.getTopBottomPerformers(req.tenant.id, term_id, class_id, Number(limit) || 5);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error fetching performers.' }); }
});

// ─── Exams & Results Routes ─────────────────────────────────────

const examSchema = {
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        subject: z.string().min(1, 'Subject is required'),
        class_name: z.string().min(1, 'Class is required'),
        date: z.string().min(1, 'Date is required'),
        total_marks: z.number().positive('Total marks must be positive')
    })
};

const resultSchema = {
    body: z.object({
        exam_id: z.string().uuid(),
        student_id: z.string().uuid(),
        marks_obtained: z.number().min(0, 'Marks cannot be negative'),
        remarks: z.string().optional()
    })
};

// GET /api/school/exams
router.get('/exams', protect, requirePermission('grades.view'), async (req, res) => {
    try {
        const exams = await examService.getExams(req.tenant.id);
        return res.json({ data: { exams } });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Error fetching exams.' });
    }
});

// POST /api/school/exams
router.post('/exams', protect, requirePermission('grades.create', 'grades.edit'), validate(examSchema), async (req, res) => {
    try {
        const exam = await examService.createExam(req.tenant.id, req.body);
        return res.status(201).json({ data: { message: 'Exam created.', exam } });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Error creating exam.' });
    }
});

// DELETE /api/school/exams/:id
router.delete('/exams/:id', protect, requirePermission('grades.create', 'grades.edit'), async (req, res) => {
    try {
        await examService.deleteExam(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Exam removed.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error removing exam.' });
    }
});

// GET /api/school/results
router.get('/results', protect, requirePermission('grades.view'), async (req, res) => {
    try {
        const { exam_id } = req.query;
        if (!exam_id) return res.status(400).json({ error: 'exam_id query param is required' });
        
        const data = await examService.getResults(req.tenant.id, exam_id);
        return res.json({ data });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Error fetching results.' });
    }
});

// POST /api/school/results
router.post('/results', protect, requirePermission('grades.create', 'grades.edit'), validate(resultSchema), async (req, res) => {
    try {
        const result = await examService.submitResult(req.tenant.id, req.body);
        return res.status(201).json({ data: { message: 'Result saved.', result } });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Error saving result.' });
    }
});

// GET /api/school/results/student/:studentId
router.get('/results/student/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const results = await examService.getStudentResults(req.tenant.id, studentId);
        return res.json({ data: { results } });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Error fetching student results.' });
    }
});

// ─── Assessment Types ────────────────────────────────────────
router.get('/assessment-types', protect, async (req, res) => {
    try {
        const types = await examService.getAssessmentTypes(req.tenant.id);
        return res.json({ data: { types } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching assessment types.' }); }
});
router.post('/assessment-types', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const type = await examService.createAssessmentType(req.tenant.id, req.body);
        return res.status(201).json({ data: { type } });
    } catch (err) { return res.status(500).json({ error: 'Error creating assessment type.' }); }
});
router.put('/assessment-types/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const type = await examService.updateAssessmentType(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { type } });
    } catch (err) { return res.status(500).json({ error: 'Error updating assessment type.' }); }
});
router.delete('/assessment-types/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        await examService.deleteAssessmentType(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Assessment type deleted.' } });
    } catch (err) { return res.status(500).json({ error: 'Error deleting assessment type.' }); }
});

// ─── Grading Scales ──────────────────────────────────────────
router.get('/grading-scales', protect, async (req, res) => {
    try {
        const scales = await examService.getGradingScales(req.tenant.id);
        return res.json({ data: { scales } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching grading scales.' }); }
});
router.post('/grading-scales', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const scale = await examService.createGradingScale(req.tenant.id, req.body);
        return res.status(201).json({ data: { scale } });
    } catch (err) { return res.status(500).json({ error: 'Error creating grading scale.' }); }
});
router.delete('/grading-scales/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        await examService.deleteGradingScale(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Grading scale deleted.' } });
    } catch (err) { return res.status(500).json({ error: 'Error deleting grading scale.' }); }
});

// ─── Grade Rules ─────────────────────────────────────────────
router.get('/grade-rules', protect, async (req, res) => {
    try {
        const { scale_id } = req.query;
        if (!scale_id) return res.status(400).json({ error: 'scale_id query param required.' });
        const rules = await examService.getGradeRules(scale_id);
        return res.json({ data: { rules } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching grade rules.' }); }
});
router.post('/grade-rules', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const { scale_id } = req.query;
        if (!scale_id) return res.status(400).json({ error: 'scale_id query param required.' });
        const rule = await examService.setGradeRule(scale_id, req.body);
        return res.status(201).json({ data: { rule } });
    } catch (err) { return res.status(500).json({ error: 'Error creating grade rule.' }); }
});
router.delete('/grade-rules/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        await examService.deleteGradeRule(req.params.id);
        return res.json({ data: { message: 'Grade rule deleted.' } });
    } catch (err) { return res.status(500).json({ error: 'Error deleting grade rule.' }); }
});

// ─── Assessments ─────────────────────────────────────────────
router.get('/assessments', protect, async (req, res) => {
    try {
        const assessments = await examService.getAssessments(req.tenant.id, req.query);
        return res.json({ data: { assessments } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching assessments.' }); }
});
router.post('/assessments', protect, requirePermission('grades.create', 'grades.edit'), async (req, res) => {
    try {
        const assessment = await examService.createAssessment(req.tenant.id, req.body, req.user?.userId);
        return res.status(201).json({ data: { assessment } });
    } catch (err) { return res.status(500).json({ error: 'Error creating assessment.' }); }
});
router.put('/assessments/:id', protect, requirePermission('grades.edit'), async (req, res) => {
    try {
        const assessment = await examService.updateAssessment(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { assessment } });
    } catch (err) { return res.status(500).json({ error: 'Error updating assessment.' }); }
});
router.delete('/assessments/:id', protect, requirePermission('grades.create', 'grades.edit'), async (req, res) => {
    try {
        await examService.deleteAssessment(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Assessment deleted.' } });
    } catch (err) { return res.status(500).json({ error: 'Error deleting assessment.' }); }
});

// ─── Assessment Scores ───────────────────────────────────────
router.get('/assessment-scores', protect, async (req, res) => {
    try {
        const { assessment_id } = req.query;
        if (!assessment_id) return res.status(400).json({ error: 'assessment_id query param required.' });
        const scores = await examService.getAssessmentScores(req.tenant.id, assessment_id);
        return res.json({ data: { scores } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching scores.' }); }
});
router.post('/assessment-scores/bulk', protect, requirePermission('grades.create', 'grades.edit'), async (req, res) => {
    try {
        const scores = await examService.bulkSubmitScores(req.tenant.id, req.body.scores);
        return res.status(201).json({ data: { scores, message: `${scores.length} scores saved.` } });
    } catch (err) { return res.status(500).json({ error: 'Error saving scores.' }); }
});

// ─── Term Grade Calculation ───────────────────────────────────
router.get('/assessments/calculate-grades', protect, requirePermission('grades.view'), async (req, res) => {
    try {
        const { class_id, term_id, session_id, scale_id } = req.query;
        if (!class_id || !term_id) return res.status(400).json({ error: 'class_id and term_id required.' });
        const result = await examService.calculateTermGrades(req.tenant.id, class_id, term_id, session_id, scale_id);
        return res.json({ data: result });
    } catch (err) { return res.status(500).json({ error: 'Error calculating grades.' }); }
});

// ─── Report Cards ────────────────────────────────────────────
router.get('/report-cards', protect, async (req, res) => {
    try {
        const cards = await examService.getReportCards(req.tenant.id, req.query);
        return res.json({ data: { reportCards: cards } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching report cards.' }); }
});
router.post('/report-cards/generate', protect, requirePermission('grades.create', 'grades.edit'), async (req, res) => {
    try {
        const card = await examService.generateReportCard(req.tenant.id, req.body, req.user?.userId);
        return res.status(201).json({ data: { reportCard: card, message: 'Report card generated.' } });
    } catch (err) { return res.status(500).json({ error: err.message || 'Error generating report card.' }); }
});
router.put('/report-cards/:id/publish', protect, requirePermission('grades.edit'), async (req, res) => {
    try {
        const card = await examService.publishReportCard(req.tenant.id, req.params.id, req.user?.userId);
        return res.json({ data: { reportCard: card, message: 'Report card published.' } });
    } catch (err) { return res.status(500).json({ error: 'Error publishing report card.' }); }
});
router.put('/report-cards/:id/approve', protect, requirePermission('settings.edit', 'grades.edit'), async (req, res) => {
    try {
        const card = await examService.approveReportCard(req.tenant.id, req.params.id, req.user?.userId);
        return res.json({ data: { reportCard: card, message: 'Report card approved.' } });
    } catch (err) { return res.status(500).json({ error: 'Error approving report card.' }); }
});

// ─── Teachers ────────────────────────────────────────────────
router.get('/teachers', protect, async (req, res) => {
    try {
        const teachers = await schoolService.getTeachers(req.tenant.id);
        return res.json({ data: { teachers } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching teachers.' });
    }
});

router.post('/teachers', protect, requirePermission('teachers.create', 'teachers.edit'), async (req, res) => {
    try {
        const teacher = await schoolService.createTeacher(req.tenant.id, req.body);
        return res.status(201).json({ data: { teacher } });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating teacher.' });
    }
});

router.put('/teachers/:id', protect, requirePermission('teachers.create', 'teachers.edit'), async (req, res) => {
    try {
        const teacher = await schoolService.updateTeacher(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { teacher } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating teacher.' });
    }
});

router.delete('/teachers/:id', protect, requirePermission('teachers.create', 'teachers.edit'), async (req, res) => {
    try {
        await schoolService.deleteTeacher(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Teacher removed.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error removing teacher.' });
    }
});

// ─── Classes ─────────────────────────────────────────────────
router.get('/classes', protect, async (req, res) => {
    try {
        const classes = await schoolService.getClasses(req.tenant.id);
        return res.json({ data: { classes } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching classes.' });
    }
});

router.post('/classes', protect, requirePermission('classes.create', 'classes.edit'), async (req, res) => {
    try {
        const cls = await schoolService.createClass(req.tenant.id, req.body);
        return res.status(201).json({ data: { class: cls } });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating class.' });
    }
});

// ─── Library ─────────────────────────────────────────────────
router.get('/library/books', protect, async (req, res) => {
    try {
        const books = await schoolService.getBooks(req.tenant.id);
        return res.json({ data: { books } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching books.' });
    }
});

router.post('/library/books', protect, requirePermission('classes.create', 'classes.edit'), async (req, res) => {
    try {
        const book = await schoolService.addBook(req.tenant.id, req.body);
        return res.status(201).json({ data: { book } });
    } catch (err) {
        return res.status(500).json({ error: 'Error adding book.' });
    }
});

router.post('/library/issue', protect, requirePermission('students.view'), async (req, res) => {
    try {
        const issue = await schoolService.issueBook(req.tenant.id, req.body);
        return res.status(201).json({ data: { issue } });
    } catch (err) {
        return res.status(500).json({ error: 'Error issuing book.' });
    }
});

router.put('/library/return/:id', protect, requirePermission('students.view'), async (req, res) => {
    try {
        const issue = await schoolService.returnBook(req.tenant.id, req.params.id);
        return res.json({ data: { issue } });
    } catch (err) {
        return res.status(500).json({ error: 'Error returning book.' });
    }
});

// ─── Timetable ───────────────────────────────────────────────
router.get('/timetable', protect, async (req, res) => {
    try {
        const timetable = await schoolService.getTimetable(req.tenant.id);
        return res.json({ data: { timetable } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching timetable.' });
    }
});

router.post('/timetable', protect, requirePermission('timetable.create', 'timetable.edit'), async (req, res) => {
    try {
        const session = await schoolService.assignPeriod(req.tenant.id, req.body);
        return res.status(201).json({ data: { session } });
    } catch (err) {
        return res.status(500).json({ error: 'Error assigning period.' });
    }
});

// ─── Payroll ─────────────────────────────────────────────────
router.get('/payroll', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const payroll = await schoolService.getPayroll(req.tenant.id);
        return res.json({ data: { payroll } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching payroll.' });
    }
});

router.post('/payroll/run', protect, requirePermission('fees.create', 'fees.edit'), async (req, res) => {
    try {
        const record = await schoolService.runPayroll(req.tenant.id, req.body);
        return res.status(201).json({ data: { record } });
    } catch (err) {
        return res.status(500).json({ error: 'Error running payroll.' });
    }
});

// ─── Communications ──────────────────────────────────────────
router.post('/notifications/broadcast', protect, requirePermission('announcements.create', 'announcements.edit'), async (req, res) => {
    try {
        const log = await schoolService.broadcastNotification(req.tenant.id, req.body);
        return res.status(201).json({ data: { log } });
    } catch (err) {
        return res.status(500).json({ error: 'Error broadcasting notification.' });
    }
});

router.get('/notifications/log', protect, async (req, res) => {
    try {
        const logs = await schoolService.getNotificationLogs(req.tenant.id);
        return res.json({ data: { logs } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching notification logs.' });
    }
});

// ─── Attendance Routes ────────────────────────────────────────

// GET /api/school/attendance - list attendance records (paginated)
router.get('/attendance', protect, requirePermission('attendance.view'), async (req, res) => {
    try {
        const result = await schoolService.getAttendanceRecords(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching attendance records.' });
    }
});

// GET /api/school/attendance/stats/range - attendance stats for date range
router.get('/attendance/stats/range', protect, async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: 'start and end query params required.' });
        const stats = await schoolService.getAttendanceStats(req.tenant.id, start, end);
        return res.json({ data: { stats } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching attendance stats.' });
    }
});

// GET /api/school/attendance/student/:studentId - per-student history
router.get('/attendance/student/:studentId', protect, async (req, res) => {
    try {
        const result = await schoolService.getAttendanceRecords(req.tenant.id, { student_id: req.params.studentId, ...req.query });
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching student attendance.' });
    }
});

// GET /api/school/attendance/trends - daily attendance trends for date range
router.get('/attendance/trends', protect, async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: 'start and end query params required.' });
        const trends = await schoolService.getAttendanceTrends(req.tenant.id, start, end);
        return res.json({ data: { trends } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching attendance trends.' });
    }
});

// GET /api/school/attendance/absentees/repeated - students with repeated absences
router.get('/attendance/absentees/repeated', protect, async (req, res) => {
    try {
        const min = Math.max(2, Number.parseInt(req.query.min) || 3);
        const results = await schoolService.getRepeatedAbsences(req.tenant.id, min);
        return res.json({ data: { absentees: results } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching repeated absences.' });
    }
});

// POST /api/school/attendance/staff - bulk staff attendance
router.post('/attendance/staff', protect, requirePermission('attendance.create', 'attendance.edit'), async (req, res) => {
    try {
        const markedBy = req.user?.userId;
        const data = await schoolService.submitStaffAttendance(req.tenant.id, req.body.records, markedBy);
        return res.status(201).json({ data: { message: 'Staff attendance recorded.', data } });
    } catch (err) {
        return res.status(500).json({ error: 'Error recording staff attendance.' });
    }
});

// GET /api/school/attendance/staff - list staff attendance records
router.get('/attendance/staff', protect, requirePermission('attendance.view'), async (req, res) => {
    try {
        const result = await schoolService.getStaffAttendanceRecords(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching staff attendance.' });
    }
});

// ─── Subjects ─────────────────────────────────────────────────
router.get('/subjects', protect, requirePermission('subjects.view'), async (req, res) => {
    try {
        const subjects = await schoolService.getSubjects(req.tenant.id);
        return res.json({ data: { subjects } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching subjects.' });
    }
});

const subjectSchema = {
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        code: z.string().optional(),
        is_core: z.boolean().optional(),
    })
};
router.post('/subjects', protect, requirePermission('subjects.create', 'subjects.edit'), validate(subjectSchema), async (req, res) => {
    try {
        const subject = await schoolService.createSubject(req.tenant.id, req.body);
        return res.status(201).json({ data: { subject } });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating subject.' });
    }
});

router.put('/subjects/:id', protect, requirePermission('subjects.edit'), validate(subjectSchema), async (req, res) => {
    try {
        const subject = await schoolService.updateSubject(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { subject } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating subject.' });
    }
});

router.delete('/subjects/:id', protect, requirePermission('subjects.delete'), async (req, res) => {
    try {
        await schoolService.deleteSubject(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Subject deleted.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting subject.' });
    }
});

// ─── Academic Terms ───────────────────────────────────────────
router.get('/terms', protect, async (req, res) => {
    try {
        const terms = await schoolService.getTerms(req.tenant.id);
        return res.json({ data: { terms } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching terms.' });
    }
});

const termSchema = {
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        start_date: z.string().min(1),
        end_date: z.string().min(1),
        is_current: z.boolean().optional(),
    })
};
router.post('/terms', protect, requirePermission('settings.edit'), validate(termSchema), async (req, res) => {
    try {
        if (req.body.is_current) {
            await supabase.from('academic_terms').update({ is_current: false }).eq('school_id', req.tenant.id);
        }
        const term = await schoolService.createTerm(req.tenant.id, req.body);
        return res.status(201).json({ data: { term } });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating term.' });
    }
});

router.put('/terms/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        if (req.body.is_current) {
            await supabase.from('academic_terms').update({ is_current: false }).eq('school_id', req.tenant.id);
        }
        const term = await schoolService.updateTerm(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { term } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating term.' });
    }
});

router.delete('/terms/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        await schoolService.deleteTerm(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Term deleted.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting term.' });
    }
});

// ─── Interventions ────────────────────────────────────────────
router.get('/interventions', protect, async (req, res) => {
    try {
        const interventions = await schoolService.getInterventions(req.tenant.id, req.query.student_id);
        return res.json({ data: { interventions } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching interventions.' });
    }
});

const interventionSchema = {
    body: z.object({
        student_id: z.string().uuid(),
        type: z.enum(['attendance', 'performance', 'behavior']),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        notes: z.string().optional(),
        assigned_to: z.string().uuid().optional(),
    })
};
router.post('/interventions', protect, requirePermission('students.edit'), validate(interventionSchema), async (req, res) => {
    try {
        const intervention = await schoolService.createIntervention(req.tenant.id, {
            ...req.body,
            created_by: req.user.userId,
            status: 'open',
        });
        return res.status(201).json({ data: { intervention } });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating intervention.' });
    }
});

router.put('/interventions/:id', protect, requirePermission('students.edit'), async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.status === 'resolved') payload.resolved_at = new Date().toISOString();
        const intervention = await schoolService.updateIntervention(req.tenant.id, req.params.id, payload);
        return res.json({ data: { intervention } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating intervention.' });
    }
});

// ─── Class Update/Delete ──────────────────────────────────────
router.put('/classes/:id', protect, requirePermission('classes.edit'), async (req, res) => {
    try {
        const cls = await schoolService.updateClass(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { class: cls } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating class.' });
    }
});

router.delete('/classes/:id', protect, requirePermission('classes.delete'), async (req, res) => {
    try {
        await schoolService.deleteClass(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Class deleted.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting class.' });
    }
});

// ─── Timetable Update/Delete ──────────────────────────────────
router.put('/timetable/:id', protect, requirePermission('timetable.edit'), async (req, res) => {
    try {
        const entry = await schoolService.updateTimetableEntry(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { entry } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating timetable entry.' });
    }
});

router.delete('/timetable/:id', protect, requirePermission('timetable.delete'), async (req, res) => {
    try {
        await schoolService.deleteTimetableEntry(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Timetable entry deleted.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting timetable entry.' });
    }
});

// GET /api/school/timetable/conflicts - detect timetable conflicts
router.get('/timetable/conflicts', protect, async (req, res) => {
    try {
        const conflicts = await schoolService.checkTimetableConflicts(req.tenant.id, req.query);
        return res.json({ data: { conflicts } });
    } catch (err) {
        return res.status(500).json({ error: 'Error checking timetable conflicts.' });
    }
});

// GET /api/school/teachers/workload - teacher workload summary
router.get('/teachers/workload', protect, async (req, res) => {
    try {
        const workload = await schoolService.getTeacherWorkload(req.tenant.id);
        return res.json({ data: { workload } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching teacher workload.' });
    }
});

// ─── Streams ──────────────────────────────────────────────────
router.get('/streams', protect, async (req, res) => {
    try {
        const streams = await schoolService.getStreams(req.tenant.id);
        return res.json({ data: { streams } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching streams.' });
    }
});

router.post('/streams', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const stream = await schoolService.createStream(req.tenant.id, req.body);
        return res.status(201).json({ data: { stream } });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating stream.' });
    }
});

router.put('/streams/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const stream = await schoolService.updateStream(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { stream } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating stream.' });
    }
});

router.delete('/streams/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        await schoolService.deleteStream(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Stream deleted.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting stream.' });
    }
});

// ─── Academic Sessions ─────────────────────────────────────────
router.get('/sessions', protect, async (req, res) => {
    try {
        const sessions = await schoolService.getSessions(req.tenant.id);
        return res.json({ data: { sessions } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching sessions.' });
    }
});

router.post('/sessions', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const session = await schoolService.createSession(req.tenant.id, req.body);
        return res.status(201).json({ data: { session } });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating session.' });
    }
});

router.put('/sessions/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const session = await schoolService.updateSession(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { session } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating session.' });
    }
});

router.delete('/sessions/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        await schoolService.deleteSession(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Session deleted.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting session.' });
    }
});

// ─── Class-Subject Association ─────────────────────────────────
router.get('/class-subjects', protect, async (req, res) => {
    try {
        const associations = await schoolService.getClassSubjects(req.tenant.id);
        return res.json({ data: { associations } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching class-subject associations.' });
    }
});

router.post('/class-subjects', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const association = await schoolService.addClassSubject(req.tenant.id, req.body);
        return res.status(201).json({ data: { association } });
    } catch (err) {
        return res.status(500).json({ error: 'Error adding class-subject association.' });
    }
});

router.delete('/class-subjects/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        await schoolService.removeClassSubject(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Association removed.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error removing class-subject association.' });
    }
});

// ─── Subject-Teacher Assignment ────────────────────────────────
router.get('/subject-teachers', protect, async (req, res) => {
    try {
        const assignments = await schoolService.getSubjectTeachers(req.tenant.id);
        return res.json({ data: { assignments } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching subject-teacher assignments.' });
    }
});

router.post('/subject-teachers', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const assignment = await schoolService.assignSubjectTeacher(req.tenant.id, req.body);
        return res.status(201).json({ data: { assignment } });
    } catch (err) {
        return res.status(500).json({ error: 'Error assigning subject teacher.' });
    }
});

router.delete('/subject-teachers/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        await schoolService.removeSubjectTeacher(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Assignment removed.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error removing subject-teacher assignment.' });
    }
});

// ─── Class-Teacher Assignment ──────────────────────────────────
router.get('/class-teachers', protect, async (req, res) => {
    try {
        const assignments = await schoolService.getClassTeachers(req.tenant.id);
        return res.json({ data: { assignments } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching class-teacher assignments.' });
    }
});

router.post('/class-teachers', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const assignment = await schoolService.assignClassTeacher(req.tenant.id, req.body);
        return res.status(201).json({ data: { assignment } });
    } catch (err) {
        return res.status(500).json({ error: 'Error assigning class teacher.' });
    }
});

router.delete('/class-teachers/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        await schoolService.removeClassTeacher(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Assignment removed.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error removing class-teacher assignment.' });
    }
});

// ─── Exam Update ──────────────────────────────────────────────
const updateExamSchema = {
    body: z.object({
        name: z.string().min(1).optional(),
        subject: z.string().min(1).optional(),
        class_name: z.string().min(1).optional(),
        date: z.string().min(1).optional(),
        total_marks: z.number().positive().optional(),
    })
};
router.put('/exams/:id', protect, requirePermission('grades.edit'), validate(updateExamSchema), async (req, res) => {
    try {
        const { data: exam, error } = await supabase.from('exams')
            .update(req.body)
            .eq('id', req.params.id)
            .eq('tenant_id', req.tenant.id)
            .select()
            .single();
        if (error) return res.status(500).json({ error: 'Error updating exam.' });
        return res.json({ data: { exam } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating exam.' });
    }
});

// ─── Single Student ───────────────────────────────────────────
router.get('/students/:id', protect, async (req, res) => {
    try {
        const student = await schoolService.getStudent(req.tenant.id, req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found.' });
        return res.json({ data: { student } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching student.' });
    }
});

module.exports = router;
module.exports.protect = protect;

// ─── Role & Permission Management ──────────────────────────────

// GET /api/school/roles - list all roles (system + school-specific)
router.get('/roles', protect, requirePermission('roles.view'), async (req, res) => {
    try {
        const { data: systemRoles, error: sysErr } = await supabase
            .from('roles')
            .select('*')
            .is('school_id', null)
            .order('label');
        if (sysErr) return res.status(500).json({ error: 'Error fetching roles.' });

        const { data: schoolRoles, error: schErr } = await supabase
            .from('roles')
            .select('*')
            .eq('school_id', req.tenant.id)
            .order('label');
        if (schErr) return res.status(500).json({ error: 'Error fetching custom roles.' });

        return res.json({ data: { roles: [...systemRoles, ...schoolRoles] } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching roles.' });
    }
});

// GET /api/school/permissions - list all permissions grouped by module
router.get('/permissions', protect, requirePermission('permissions.view'), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('permissions')
            .select('*')
            .order('module')
            .order('name');
        if (error) return res.status(500).json({ error: 'Error fetching permissions.' });

        const grouped = (data || []).reduce((acc, p) => {
            if (!acc[p.module]) acc[p.module] = [];
            acc[p.module].push(p);
            return acc;
        }, {});

        return res.json({ data: { permissions: data || [], grouped } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching permissions.' });
    }
});

// POST /api/school/roles - create a custom role
const createRoleSchema = {
    body: z.object({
        name: z.string().min(1).max(50).regex(/^[a-z_]+$/, 'Use lowercase letters and underscores only'),
        label: z.string().min(1).max(100),
        description: z.string().optional(),
        permission_ids: z.array(z.string().uuid()).optional(),
    })
};
router.post('/roles', protect, requirePermission('roles.create', 'roles.edit'), validate(createRoleSchema), async (req, res) => {
    try {
        const { name, label, description, permission_ids } = req.body;

        const { data: existing } = await supabase.from('roles')
            .select('id')
            .or(`name.eq.${name},and(name.eq.${name},school_id.eq.${req.tenant.id})`)
            .maybeSingle();
        if (existing) return res.status(409).json({ error: 'A role with this name already exists.' });

        const { data: role, error: roleErr } = await supabase.from('roles')
            .insert({ id: crypto.randomUUID(), name, label, description, school_id: req.tenant.id, is_system: false })
            .select()
            .single();
        if (roleErr) return res.status(500).json({ error: 'Error creating role.' });

        if (permission_ids && permission_ids.length > 0) {
            const mappings = permission_ids.map(pid => ({
                role_id: role.id,
                permission_id: pid,
                school_id: req.tenant.id
            }));
            const { error: mapErr } = await supabase.from('role_permissions').insert(mappings);
            if (mapErr) console.error('Error mapping permissions:', mapErr);
        }

        return res.status(201).json({ data: { role } });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating role.' });
    }
});

// PUT /api/school/roles/:id
const updateRoleSchema = {
    body: z.object({
        label: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
    })
};
router.put('/roles/:id', protect, requirePermission('roles.edit'), validate(updateRoleSchema), async (req, res) => {
    try {
        const { data: role, error: checkErr } = await supabase.from('roles')
            .select('*').eq('id', req.params.id).maybeSingle();
        if (checkErr || !role) return res.status(404).json({ error: 'Role not found.' });
        if (role.is_system) return res.status(403).json({ error: 'Cannot edit system roles.' });
        if (role.school_id !== req.tenant.id) return res.status(403).json({ error: 'Access denied.' });

        const { data, error } = await supabase.from('roles')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) return res.status(500).json({ error: 'Error updating role.' });
        return res.json({ data: { role: data } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating role.' });
    }
});

// DELETE /api/school/roles/:id
router.delete('/roles/:id', protect, requirePermission('roles.delete'), async (req, res) => {
    try {
        const { data: role, error: checkErr } = await supabase.from('roles')
            .select('*').eq('id', req.params.id).maybeSingle();
        if (checkErr || !role) return res.status(404).json({ error: 'Role not found.' });
        if (role.is_system) return res.status(403).json({ error: 'Cannot delete system roles.' });
        if (role.school_id !== req.tenant.id) return res.status(403).json({ error: 'Access denied.' });

        const { error } = await supabase.from('roles').delete().eq('id', req.params.id);
        if (error) return res.status(500).json({ error: 'Error deleting role.' });
        return res.json({ data: { message: 'Role deleted.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting role.' });
    }
});

// PUT /api/school/roles/:id/permissions - update role-permission mappings
router.put('/roles/:id/permissions', protect, requirePermission('roles.edit', 'permissions.edit'), async (req, res) => {
    try {
        const { permission_ids } = req.body;
        if (!Array.isArray(permission_ids)) return res.status(400).json({ error: 'permission_ids array is required.' });

        const { data: role, error: checkErr } = await supabase.from('roles')
            .select('*').eq('id', req.params.id).maybeSingle();
        if (checkErr || !role) return res.status(404).json({ error: 'Role not found.' });
        if (role.school_id && role.school_id !== req.tenant.id) return res.status(403).json({ error: 'Access denied.' });

        // Delete existing mappings
        await supabase.from('role_permissions').delete()
            .eq('role_id', req.params.id)
            .is('school_id', role.school_id ? req.tenant.id : null);

        // Insert new mappings
        if (permission_ids.length > 0) {
            const mappings = permission_ids.map(pid => ({
                role_id: req.params.id,
                permission_id: pid,
                school_id: role.school_id ? req.tenant.id : null
            }));
            const { error: insErr } = await supabase.from('role_permissions').insert(mappings);
            if (insErr) return res.status(500).json({ error: 'Error updating permissions.' });
        }

        return res.json({ data: { message: 'Permissions updated.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating permissions.' });
    }
});

// ─── User Management ──────────────────────────────────────────

// GET /api/school/users - list users for this school
router.get('/users', protect, requirePermission('users.view'), async (req, res) => {
    try {
        const page = parseInteger(req.query.page, 1, 1, 1000000);
        const limit = parseInteger(req.query.limit, 20, 1, 100);
        const { role, search, status } = req.query;

        let query = supabase
            .from('users')
            .select('id, full_name, email, phone, role, is_active, suspended_at, invited_at, created_at, last_login, role_id', { count: 'exact' })
            .eq('tenant_id', req.tenant.id)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (role) query = query.eq('role', role);
        if (status === 'active') query = query.eq('is_active', true);
        if (status === 'suspended') query = query.eq('is_active', false);
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data, count, error } = await query;
        if (error) return res.status(500).json({ error: 'Error fetching users.' });

        // Attach role names
        const userIds = (data || []).map(u => u.role_id).filter(Boolean);
        let roleMap = {};
        if (userIds.length > 0) {
            const { data: roles } = await supabase.from('roles').select('id, name, label').in('id', userIds);
            roleMap = (roles || []).reduce((acc, r) => ({ ...acc, [r.id]: r }), {});
        }

        const users = (data || []).map(u => ({
            ...u,
            role_name: roleMap[u.role_id]?.label || u.role,
            role_identifier: roleMap[u.role_id]?.name || u.role,
        }));

        return res.json({ data: { users, total: count || 0, page, limit } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching users.' });
    }
});

// POST /api/school/users/invite - invite a new user
const inviteUserSchema = {
    body: z.object({
        full_name: z.string().min(1, 'Name is required'),
        email: z.string().email('Valid email is required'),
        phone: z.string().optional(),
        role_id: z.string().uuid('Valid role is required'),
        role: z.string().optional(), // fallback role name if no role_id
    })
};
router.post('/users/invite', protect, requirePermission('users.create'), validate(inviteUserSchema), async (req, res) => {
    try {
        const { full_name, email, phone, role_id, role } = req.body;

        const { data: existing } = await supabase.from('users')
            .select('id').eq('email', email).eq('tenant_id', req.tenant.id).maybeSingle();
        if (existing) return res.status(409).json({ error: 'A user with this email already exists.' });

        // Resolve role name
        let roleName = role;
        if (role_id) {
            const { data: roleData } = await supabase.from('roles').select('name').eq('id', role_id).single();
            if (roleData) roleName = roleData.name;
        }

        const tempPassword = crypto.randomBytes(12).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        const { data: user, error } = await supabase.from('users')
            .insert({
                id: crypto.randomUUID(),
                full_name,
                email,
                phone: phone || null,
                role: roleName || 'staff',
                role_id: role_id || null,
                tenant_id: req.tenant.id,
                password: hashedPassword,
                is_active: false,
                invited_at: new Date().toISOString(),
            })
            .select('id, full_name, email, phone, role, is_active, invited_at')
            .single();

        if (error) return res.status(500).json({ error: 'Error creating user.' });

        return res.status(201).json({
            data: {
                user,
                tempPassword,
                message: 'User invited. Share the temporary password with them.',
            }
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error inviting user.' });
    }
});

// PUT /api/school/users/:id - update user
const updateUserSchema = {
    body: z.object({
        full_name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role_id: z.string().uuid().optional(),
        role: z.string().optional(),
    }).partial()
};
router.put('/users/:id', protect, requirePermission('users.edit'), validate(updateUserSchema), async (req, res) => {
    try {
        const { full_name, email, phone, role_id, role } = req.body;

        let roleName = role;
        if (role_id) {
            const { data: roleData } = await supabase.from('roles').select('name').eq('id', role_id).single();
            if (roleData) roleName = roleData.name;
        }

        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (role_id !== undefined) updateData.role_id = role_id;
        if (roleName !== undefined) updateData.role = roleName;

        const { data, error } = await supabase.from('users')
            .update(updateData)
            .eq('id', req.params.id)
            .eq('tenant_id', req.tenant.id)
            .select('id, full_name, email, phone, role, is_active, role_id')
            .single();

        if (error) return res.status(500).json({ error: 'Error updating user.' });
        return res.json({ data: { user: data } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating user.' });
    }
});

// PUT /api/school/users/:id/suspend
router.put('/users/:id/suspend', protect, requirePermission('users.edit'), async (req, res) => {
    try {
        const { data, error } = await supabase.from('users')
            .update({ is_active: false, suspended_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('tenant_id', req.tenant.id)
            .select('id, full_name, email, is_active, suspended_at')
            .single();
        if (error) return res.status(500).json({ error: 'Error suspending user.' });
        return res.json({ data: { user: data } });
    } catch (err) {
        return res.status(500).json({ error: 'Error suspending user.' });
    }
});

// PUT /api/school/users/:id/activate
router.put('/users/:id/activate', protect, requirePermission('users.edit'), async (req, res) => {
    try {
        const { data, error } = await supabase.from('users')
            .update({ is_active: true, suspended_at: null })
            .eq('id', req.params.id)
            .eq('tenant_id', req.tenant.id)
            .select('id, full_name, email, is_active')
            .single();
        if (error) return res.status(500).json({ error: 'Error activating user.' });
        return res.json({ data: { user: data } });
    } catch (err) {
        return res.status(500).json({ error: 'Error activating user.' });
    }
});
