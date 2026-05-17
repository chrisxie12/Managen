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
