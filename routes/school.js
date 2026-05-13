const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const schoolService = require('../services/schoolService');
const examService = require('../services/examService');
const feeReminderService = require('../services/feeReminderService');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
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
router.get('/students', protect, allowRoles('admin', 'teacher'), async (req, res) => {
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
router.post('/students', protect, allowRoles('admin'), validate(studentSchema), async (req, res) => {
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
router.post('/attendance', protect, allowRoles('admin', 'teacher'), async (req, res) => {
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
router.get('/fees', protect, requireModule('fees'), allowRoles('admin'), async (req, res) => {
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
router.post('/fees/reminders/send', protect, requireModule('fees'), allowRoles('admin'), validate(feeReminderSchema), async (req, res) => {
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
router.get('/exams', protect, allowRoles('admin', 'teacher'), async (req, res) => {
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
router.post('/exams', protect, allowRoles('admin', 'teacher'), validate(examSchema), async (req, res) => {
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
router.delete('/exams/:id', protect, allowRoles('admin'), async (req, res) => {
    try {
        await examService.deleteExam(req.tenant.id, req.params.id);
        return res.json({ data: { message: 'Exam removed.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error removing exam.' });
    }
});

// GET /api/school/results
router.get('/results', protect, allowRoles('admin', 'teacher'), async (req, res) => {
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
router.post('/results', protect, allowRoles('admin', 'teacher'), validate(resultSchema), async (req, res) => {
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

// ─── Teachers ────────────────────────────────────────────────
router.get('/teachers', protect, async (req, res) => {
    try {
        const teachers = await schoolService.getTeachers(req.tenant.id);
        return res.json({ data: { teachers } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching teachers.' });
    }
});

router.post('/teachers', protect, allowRoles('admin'), async (req, res) => {
    try {
        const teacher = await schoolService.createTeacher(req.tenant.id, req.body);
        return res.status(201).json({ data: { teacher } });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating teacher.' });
    }
});

router.put('/teachers/:id', protect, allowRoles('admin'), async (req, res) => {
    try {
        const teacher = await schoolService.updateTeacher(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { teacher } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating teacher.' });
    }
});

router.delete('/teachers/:id', protect, allowRoles('admin'), async (req, res) => {
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

router.post('/classes', protect, allowRoles('admin'), async (req, res) => {
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

router.post('/library/books', protect, allowRoles('admin'), async (req, res) => {
    try {
        const book = await schoolService.addBook(req.tenant.id, req.body);
        return res.status(201).json({ data: { book } });
    } catch (err) {
        return res.status(500).json({ error: 'Error adding book.' });
    }
});

router.post('/library/issue', protect, allowRoles('admin', 'teacher'), async (req, res) => {
    try {
        const issue = await schoolService.issueBook(req.tenant.id, req.body);
        return res.status(201).json({ data: { issue } });
    } catch (err) {
        return res.status(500).json({ error: 'Error issuing book.' });
    }
});

router.put('/library/return/:id', protect, allowRoles('admin', 'teacher'), async (req, res) => {
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

router.post('/timetable', protect, allowRoles('admin', 'teacher'), async (req, res) => {
    try {
        const session = await schoolService.assignPeriod(req.tenant.id, req.body);
        return res.status(201).json({ data: { session } });
    } catch (err) {
        return res.status(500).json({ error: 'Error assigning period.' });
    }
});

// ─── Payroll ─────────────────────────────────────────────────
router.get('/payroll', protect, allowRoles('admin'), async (req, res) => {
    try {
        const payroll = await schoolService.getPayroll(req.tenant.id);
        return res.json({ data: { payroll } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching payroll.' });
    }
});

router.post('/payroll/run', protect, allowRoles('admin'), async (req, res) => {
    try {
        const record = await schoolService.runPayroll(req.tenant.id, req.body);
        return res.status(201).json({ data: { record } });
    } catch (err) {
        return res.status(500).json({ error: 'Error running payroll.' });
    }
});

// ─── Communications ──────────────────────────────────────────
router.post('/notifications/broadcast', protect, allowRoles('admin'), async (req, res) => {
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

module.exports = router;
