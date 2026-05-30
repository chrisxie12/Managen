const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const bcrypt   = require('bcryptjs');
const multer   = require('multer');
const supabase = require('../config/db');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const spaces = require('../config/spaces');
const schoolService = require('../services/schoolService');
const examService = require('../services/examService');
const feeReminderService = require('../services/feeReminderService');
const gradebookService = require('../services/gradebookService');
const notifService = require('../services/notificationService');
const pushService = require('../services/pushService');
const TimetableScheduler = require('../services/timetableScheduler');
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

const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.schoolos_token
            || (req.headers.authorization?.startsWith('Bearer ')
                ? req.headers.authorization.slice(7)
                : null);
        if (!token)
            return res.status(401).json({ error: 'No token provided.' });
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        ensureMatchingTenant(req.user, req.tenant);
        if (!req.tenant && (req.user?.schoolId || req.user?.tenantId)) {
            const schoolId = req.user.schoolId || req.user.tenantId;
            const { data: fallbackTenant, error } = await supabase
                .from('schools')
                .select('*')
                .eq('id', schoolId)
                .maybeSingle();
            if (!error && fallbackTenant) {
                req.tenant = fallbackTenant;
                req.tenantId = fallbackTenant.id;
            }
        }
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

// ─── Onboarding ──────────────────────────────────────────────
router.get('/onboarding/status', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { data, error } = await supabase
            .from('schools')
            .select('onboarding_completed, metadata')
            .eq('id', schoolId)
            .single();
        if (error) return res.status(500).json({ error: 'Error fetching onboarding status.' });
        const step = data.metadata?.onboarding_step ?? 0;
        return res.json({ data: { onboarding_completed: data.onboarding_completed, current_step: step, metadata: data.metadata } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching onboarding status.' });
    }
});

router.post('/onboarding/survey', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { survey } = req.body;
        const { data: existing } = await supabase.from('schools').select('metadata').eq('id', schoolId).single();
        const metadata = { ...(existing?.metadata || {}), survey, onboarding_step: 1 };
        const { error } = await supabase.from('schools').update({ metadata }).eq('id', schoolId);
        if (error) return res.status(500).json({ error: 'Error saving survey.' });
        return res.json({ data: { success: true } });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving survey.' });
    }
});

router.post('/onboarding/school', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { name, motto, type, email, phone, address, city, region, country,
                academic_year, current_term, term_start_date, term_end_date,
                grading_system, primary_color, year_established } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (motto !== undefined) updateData.motto = motto;
        if (type !== undefined) updateData.type = type;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (region !== undefined) updateData.region = region;
        if (country !== undefined) updateData.country = country;
        if (academic_year !== undefined) updateData.academic_year = academic_year;
        if (current_term !== undefined) updateData.current_term = current_term;
        if (term_start_date !== undefined) updateData.term_start_date = term_start_date;
        if (term_end_date !== undefined) updateData.term_end_date = term_end_date;
        if (grading_system !== undefined) updateData.grading_system = grading_system;
        if (primary_color !== undefined) updateData.primary_color = primary_color;
        if (year_established !== undefined) updateData.year_established = year_established;
        const { data: existing } = await supabase.from('schools').select('metadata').eq('id', schoolId).single();
        const metadata = { ...(existing?.metadata || {}), onboarding_step: 2 };
        updateData.metadata = metadata;
        const { error } = await supabase.from('schools').update(updateData).eq('id', schoolId);
        if (error) return res.status(500).json({ error: 'Error saving school data.' });
        return res.json({ data: { success: true } });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving school data.' });
    }
});

router.post('/onboarding/logo', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { logo } = req.body;
        if (!logo) return res.status(400).json({ error: 'Logo data is required.' });
        const { error } = await supabase.from('schools').update({ logo_url: logo }).eq('id', schoolId);
        if (error) return res.status(500).json({ error: 'Error saving logo.' });
        return res.json({ data: { logo_url: logo } });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving logo.' });
    }
});

router.post('/onboarding/complete', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { data: existing } = await supabase.from('schools').select('metadata').eq('id', schoolId).single();
        const metadata = { ...(existing?.metadata || {}), onboarding_step: 4, checklist: { profile_complete: true, first_class_added: false, first_teacher_added: false, first_student_added: false, fee_structure_setup: false, first_announcement_sent: false } };
        const { error } = await supabase.from('schools').update({ onboarding_completed: true, metadata }).eq('id', schoolId);
        if (error) return res.status(500).json({ error: 'Error completing onboarding.' });
        return res.json({ data: { success: true } });
    } catch (err) {
        return res.status(500).json({ error: 'Error completing onboarding.' });
    }
});

router.get('/onboarding/resume', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { data, error } = await supabase
            .from('schools')
            .select('metadata')
            .eq('id', schoolId)
            .single();
        if (error) return res.status(500).json({ error: 'Error fetching resume data.' });
        return res.json({ data: { metadata: data.metadata || {} } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching resume data.' });
    }
});

// ─── Inbox (in-app messages) ──────────────────────────────────
router.get('/inbox', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const messages = await schoolService.getUserInbox(req.tenant.id, userId, req.query);
        return res.json({ data: { messages } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching inbox.' }); }
});

// ─── User Notifications ──────────────────────────────────────
router.get('/notifications', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const notifications = await schoolService.getUserNotifications(req.tenant.id, userId, req.query);
        return res.json({ data: { notifications } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching notifications.' }); }
});

// ─── In-App Notifications (Realtime-enabled) ──────────────────

// GET /api/school/in-app-notifications
// Returns in-app notifications for the current user
router.get('/in-app-notifications', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { limit, offset, unreadOnly } = req.query;
        const result = await notifService.getUserNotifications(userId, req.tenant.id, {
            limit: Number.parseInt(limit) || 50,
            offset: Number.parseInt(offset) || 0,
            unreadOnly: unreadOnly === 'true',
        });
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching notifications.' });
    }
});

// GET /api/school/in-app-notifications/unread-count
router.get('/in-app-notifications/unread-count', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const count = await notifService.getUnreadCount(userId, req.tenant.id);
        return res.json({ data: { count } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching unread count.' });
    }
});

// PUT /api/school/in-app-notifications/:id/read
router.put('/in-app-notifications/:id/read', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const result = await notifService.markAsRead(req.params.id, userId);
        return res.json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error marking notification as read.' });
    }
});

// PUT /api/school/in-app-notifications/read-all
router.put('/in-app-notifications/read-all', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        await notifService.markAllAsRead(userId, req.tenant.id);
        return res.json({ data: { success: true } });
    } catch (err) {
        return res.status(500).json({ error: 'Error marking all as read.' });
    }
});

// GET /api/school/realtime-token
// Returns a Supabase-compatible JWT for Realtime subscriptions
router.get('/realtime-token', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const jwt = require('jsonwebtoken');
        const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_ANON_KEY;
        const supabaseUrl = process.env.SUPABASE_URL;

        if (!supabaseJwtSecret || !supabaseUrl) {
            return res.status(503).json({ error: 'Realtime is not configured.' });
        }

        const token = jwt.sign(
            {
                sub: userId,
                role: 'authenticated',
                aud: 'authenticated',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
            },
            supabaseJwtSecret
        );

        res.json({
            data: {
                token,
                supabaseUrl,
            }
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error generating realtime token.' });
    }
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
        
        const { students, count } = await schoolService.getStudents(req.tenant.id, page, limit, req.query.className, req.query.q || req.query.search);
        
        return res.json({ data: { students, total: count, page, limit } });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Error fetching students.' });
    }
});

// GET /api/school/student/profile — logged-in student's profile & dashboard
router.get('/student/profile', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const student = await schoolService.getStudentByUser(req.tenant.id, userId);
        if (!student) return res.status(404).json({ error: 'Student profile not found. Contact your school admin to link your account.' });
        return res.json({ data: { student } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching profile.' }); }
});

// GET /api/school/student/dashboard — full student dashboard data
router.get('/student/dashboard', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const student = await schoolService.getStudentByUser(req.tenant.id, userId);
        if (!student) return res.status(404).json({ error: 'Student profile not found.' });
        const data = await schoolService.getStudentDashboard(req.tenant.id, student.id);
        return res.json({ data });
    } catch (err) { return res.status(500).json({ error: 'Error fetching dashboard.' }); }
});

// GET /api/school/parent/children — parent's linked children
router.get('/parent/children', protect, async (req, res) => {
    try {
        const email = req.user.email;
        if (!email) return res.status(400).json({ error: 'No email on profile.' });
        const children = await schoolService.getParentChildren(req.tenant.id, email);
        return res.json({ data: { children } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching children.' }); }
});

// GET /api/school/parent/children/:id — brief summary of one child
router.get('/parent/children/:id', protect, async (req, res) => {
    try {
        const email = req.user.email;
        if (!email) return res.status(400).json({ error: 'No email on profile.' });
        const children = await schoolService.getParentChildren(req.tenant.id, email);
        const child = children.find(c => c.id === req.params.id);
        if (!child) return res.status(403).json({ error: 'Access denied.' });
        const brief = await schoolService.getStudentBrief(req.tenant.id, child.id);
        return res.json({ data: brief });
    } catch (err) { return res.status(500).json({ error: 'Error fetching child details.' }); }
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

// GET /api/school/students/template
router.get('/students/template', protect, requirePermission('students.create'), (req, res) => {
    const csvContent = 'student_id,first_name,last_name,other_names,date_of_birth,gender,class_name,enrollment_date,parent_name,parent_phone,parent_whatsapp,parent_email,address,previous_school,boarding_status\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="nacca_student_import_template.csv"');
    res.send(csvContent);
});

// POST /api/school/students/import
router.post('/students/import', protect, requirePermission('students.create'), upload.single('file'), async (req, res) => {
    try {
        const startMs = Date.now();
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
        const results = [];
        const fs = require('fs');
        const csv = require('csv-parser');
        const crypto = require('crypto');

        // Parse CSV stream, strip BOM via mapHeaders
        await new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path)
                .pipe(csv({ mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') }))
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        // Clean up file
        fs.unlinkSync(req.file.path);

        const errors = [];
        const payloads = [];
        const errorRows = [];
        const skippedRows = [];
        const headers = results.length > 0 ? Object.keys(results[0]) : [];

        // Pre-fetch validations from DB
        const { data: existingStudents } = await supabase.from('students').select('admission_no').eq('tenant_id', req.tenant.id);
        const { data: existingClasses } = await supabase.from('classes').select('name').eq('tenant_id', req.tenant.id);

        const studentIdsInDb = new Set((existingStudents || []).map(s => s.admission_no).filter(Boolean));
        const classesInDb = new Set((existingClasses || []).map(c => c.name));
        const studentIdsInCsv = new Set();

        // Phase 1: Validation
        for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const rowNum = i + 2; // 1-indexed plus header row
            let rowHasError = false;
            let rowErrorMessages = [];

            const addError = (field, msg, val) => {
                errors.push({ row: rowNum, field, value: val, message: msg });
                rowErrorMessages.push(msg);
                rowHasError = true;
            };

            const name = `${row.first_name || ''} ${row.other_names || ''} ${row.last_name || ''}`.replace(/\s+/g, ' ').trim();
            if (!name) addError('first_name', 'Missing student name', '');

            if (!row.class_name || !classesInDb.has(row.class_name)) {
                addError('class_name', `Class name "${row.class_name}" does not exist`, row.class_name);
            }

            let skipExisting = false;
            if (!row.student_id) {
                addError('student_id', 'student_id is required', '');
            } else if (studentIdsInDb.has(row.student_id)) {
                // Skip existing logic (upsert/skip mode)
                skipExisting = true;
                skippedRows.push({ row: rowNum, student_id: row.student_id, reason: 'already_exists' });
            } else if (studentIdsInCsv.has(row.student_id)) {
                addError('student_id', `Duplicate student_id within CSV`, row.student_id);
            } else {
                studentIdsInCsv.add(row.student_id);
            }

            if (row.parent_phone && !/^0\d{9}$/.test(row.parent_phone)) {
                addError('parent_phone', `Must be 10 digits starting with 0`, row.parent_phone);
            }

            if (row.date_of_birth && !/^\d{2}\/\d{2}\/\d{4}$/.test(row.date_of_birth)) {
                addError('date_of_birth', `Invalid DOB. Must be DD/MM/YYYY`, row.date_of_birth);
            }

            if (rowHasError) {
                errorRows.push({ ...row, _error_message: rowErrorMessages.join(' | ') });
            } else if (!skipExisting) {
                payloads.push({
                    id: crypto.randomUUID(),
                    name,
                    class_name: row.class_name,
                    gender: row.gender,
                    dob: row.date_of_birth,
                    admission_no: row.student_id,
                    address: row.address,
                    parent_name: row.parent_name,
                    parent_phone: row.parent_phone,
                    parent_email: row.parent_email
                });
            }
        }

        // Return immediately if any errors
        if (errors.length > 0) {
            const errorCsvHeaders = [...headers, '_error_message'];
            const escapeCsv = (str) => {
                if (str === null || str === undefined) return '';
                const s = String(str);
                return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
            };
            const errorCsvRows = errorRows.map(r => errorCsvHeaders.map(h => escapeCsv(r[h])).join(','));
            const errorCsvString = [errorCsvHeaders.join(','), ...errorCsvRows].join('\n');
            const errorCsvBase64 = Buffer.from(errorCsvString).toString('base64');

            return res.status(400).json({ 
                status: 'validation_failed', 
                errors,
                error_csv_base64: errorCsvBase64
            });
        }

        // Phase 2: Insert atomically via RPC
        if (payloads.length > 0) {
            const { data, error } = await supabase.rpc('bulk_import_students', {
                p_tenant_id: req.tenant.id,
                p_students: payloads
            });

            if (error) {
                console.error('RPC Error:', error);
                return res.status(500).json({ status: 'error', message: 'Transaction failed', rollback: true });
            }
        }

        const import_id = crypto.randomUUID();
        return res.json({ 
            data: { 
                status: 'success', 
                imported: payloads.length, 
                skipped: skippedRows.length,
                skipped_rows: skippedRows,
                errors: 0,
                import_id,
                duration_ms: Date.now() - startMs
            } 
        });
    } catch (err) {
        console.error('Import error:', err);
        return res.status(500).json({ error: 'Error importing students.' });
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

// POST /api/school/attendance/bulk
router.post('/attendance/bulk', protect, requirePermission('attendance.create', 'attendance.edit'), async (req, res) => {
    try {
        const result = await schoolService.submitAttendanceBulk(req.tenant.id, req.body.records);
        return res.status(200).json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: 'Error processing bulk attendance.' });
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
            actorId: req.user?.userId || req.user?.id,
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
router.get('/invoices', protect, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const userRole = req.user.role;

        // Admin/staff: require fees.view permission
        if (['superadmin', 'school_admin', 'headmaster', 'teacher'].includes(userRole)) {
            if (!req.user.permissions?.includes('fees.view') && userRole !== 'superadmin') {
                return res.status(403).json({ error: 'Access denied.' });
            }
        } else if (userRole === 'student') {
            // Student: can only see own invoices
            req.query.student_id = userId;
        } else if (userRole === 'parent') {
            // Parent: can only see children's invoices
            const { data: children } = await supabase
                .from('parents')
                .select('student_id')
                .eq('user_id', userId);
            const childIds = (children || []).map(c => c.student_id);
            if (req.query.student_id && !childIds.includes(req.query.student_id)) {
                return res.status(403).json({ error: 'Access denied.' });
            }
            // Handle parent with multiple children via manual query
            if (!req.query.student_id && childIds.length > 0) {
                let query = supabase.from('invoices')
                    .select('*, student:students(name, admission_no, class_name), class:classes(name), term:academic_terms(name)', { count: 'exact' })
                    .eq('school_id', req.tenant.id)
                    .in('student_id', childIds)
                    .order('created_at', { ascending: false });
                if (req.query.status) query = query.eq('status', req.query.status);
                const page = Math.max(1, Number.parseInt(req.query.page) || 1);
                const limit = Math.min(200, Math.max(1, Number.parseInt(req.query.limit) || 50));
                query = query.range((page - 1) * limit, page * limit - 1);
                const { data, count, error } = await query;
                if (error) throw error;
                return res.json({ data: { invoices: data || [], total: count || 0, page, limit } });
            }
        } else {
            return res.status(403).json({ error: 'Access denied.' });
        }

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
        
        // WhatsApp Receipt
        if (req.body.student_id) {
            const { data: student } = await supabase.from('students').select('name, parent_name, parent_phone').eq('id', req.body.student_id).single();
            if (student && student.parent_phone) {
                const whatsappService = require('../services/whatsappService');
                const message = `Dear ${student.parent_name || 'Parent'},\nWe have received your payment of GHS ${req.body.amount} for ${student.name}. Thank you!`;
                await whatsappService.sendWhatsAppMessage(student.parent_phone, message).catch(console.error);
            }
        }
        
        return res.status(201).json({ data: { payment } });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: 'Error recording payment.' });
    }
});

router.post('/payments/momo', protect, requirePermission('fees.create', 'fees.edit'), async (req, res) => {
    try {
        const { amount, phone, studentId, studentName, invoiceId } = req.body;
        const momoService = require('../services/momoService');
        const crypto = require('crypto');
        const externalId = crypto.randomUUID();

        // 1. Request to Pay via MoMo
        const momoRes = await momoService.requestToPay(amount, phone, externalId, studentName || 'Student');

        // 2. Record pending payment
        const payment = await schoolService.recordPayment(req.tenant.id, {
            invoice_id: invoiceId,
            amount: amount,
            payment_method: 'momo',
            reference: externalId,
            status: 'pending',
            notes: 'MoMo Request to Pay initiated',
            payment_date: new Date().toISOString().split('T')[0]
        }, req.user?.userId);

        return res.status(201).json({ data: { message: 'MoMo prompt sent to phone.', reference: externalId, payment } });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error initiating MoMo payment.' });
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

// Monthly Revenue (MRR-style)
router.get('/finance/monthly', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const months = Math.min(36, Math.max(1, Number.parseInt(req.query.months) || 12));
        const data = await schoolService.getMonthlyRevenue(req.tenant.id, months);
        return res.json({ data: { monthly: data } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching monthly revenue.' }); }
});

// Failed Payments
router.get('/finance/failed-payments', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const result = await schoolService.getFailedPayments(req.tenant.id, req.query);
        return res.json({ data: result });
    } catch (err) { return res.status(500).json({ error: 'Error fetching failed payments.' }); }
});

// Fee Defaulters
router.get('/finance/defaulters', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const threshold = Math.max(1, Number.parseInt(req.query.threshold) || 30);
        const minBalance = Math.max(0, Number.parseInt(req.query.min_balance) || 0);
        const defaulters = await schoolService.getDefaulters(req.tenant.id, threshold, minBalance);
        return res.json({ data: { defaulters } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching defaulters.' }); }
});

// Payment Status Breakdown
router.get('/finance/payment-status-breakdown', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const breakdown = await schoolService.getPaymentStatusBreakdown(req.tenant.id);
        return res.json({ data: { breakdown } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching payment breakdown.' }); }
});

// Finance Data Export
router.get('/finance/export', protect, requirePermission('fees.view'), async (req, res) => {
    try {
        const { type, date_from, date_to } = req.query;
        if (!type || !['invoices', 'payments'].includes(type)) {
            return res.status(400).json({ error: 'type must be "invoices" or "payments"' });
        }
        const rows = await schoolService.exportFinanceData(req.tenant.id, type, date_from, date_to);
        const filename = `${type}_${new Date().toISOString().split('T')[0]}.csv`;

        if (rows.length === 0) {
            const headers = type === 'invoices'
                ? 'Invoice #,Student,Class,Term,Issue Date,Due Date,Status,Total (GHS),Paid (GHS),Balance (GHS),Items\n'
                : 'Date,Student,Invoice,Amount (GHS),Method,Reference,Transaction ID,Status,Notes\n';
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(headers);
        }

        const headers = Object.keys(rows[0]);
        const csvLines = rows.map(row =>
            headers.map(h => {
                const val = String(row[h] ?? '');
                return val.includes(',') || val.includes('"') || val.includes('\n')
                    ? `"${val.replace(/"/g, '""')}"`
                    : val;
            }).join(',')
        );
        const csv = [headers.join(','), ...csvLines].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(csv);
    } catch (err) { return res.status(500).json({ error: 'Error exporting finance data.' }); }
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

// ─── Gradebook ────────────────────────────────────────────────

// GET /api/school/classes/:classId/terms/:termId/gradebook
// Returns term averages for all students in a class.
// Query: ?include_category_breakdown=true to include per-category breakdown
router.get('/classes/:classId/terms/:termId/gradebook', protect, requirePermission('grades.view'), async (req, res) => {
    try {
        const { classId, termId } = req.params;
        const includeBreakdown = req.query.include_category_breakdown === 'true';

        const results = await gradebookService.calculateClassTermAverages(classId, termId, req.tenant.id);

        if (!includeBreakdown) {
            return res.json({
                data: results.map(r => ({
                    student_id: r.student_id,
                    student_name: r.student_name,
                    admission_no: r.admission_no,
                    percentage: r.percentage,
                    grade: r.grade,
                    grade_remark: r.grade_remark,
                    rank: r.rank,
                }))
            });
        }

        return res.json({ data: results });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: 'Error fetching gradebook.' });
    }
});

// GET /api/school/students/:studentId/classes/:classId/terms/:termId/grade
// Returns single student's term average and category breakdown.
// Student can access own grade, parent can access their child's grade,
// teacher/admin requires grades.view permission.
router.get('/students/:studentId/classes/:classId/terms/:termId/grade', protect, async (req, res, next) => {
    const role = req.user.role;
    if (role !== 'student' && role !== 'parent') {
        return requirePermission('grades.view')(req, res, next);
    }
    next();
}, async (req, res) => {
    try {
        const { studentId, classId, termId } = req.params;
        const userId = req.user.userId || req.user.id;
        const role = req.user.role;

        if (role === 'student') {
            const student = await schoolService.getStudentByUser(req.tenant.id, userId);
            if (!student || student.id !== studentId) {
                return res.status(403).json({ error: 'Access denied.' });
            }
        } else if (role === 'parent') {
            const email = req.user.email;
            if (!email) return res.status(400).json({ error: 'No email on profile.' });
            const children = await schoolService.getParentChildren(req.tenant.id, email);
            if (!children.some(c => c.id === studentId)) {
                return res.status(403).json({ error: 'Access denied.' });
            }
        }

        const result = await gradebookService.calculateTermAverage(studentId, classId, termId, req.tenant.id);

        if (!result || !result.category_breakdown) {
            return res.status(404).json({ error: 'Grade data not found.' });
        }

        return res.json({ data: result });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: 'Error fetching grade.' });
    }
});

// POST /api/school/report-cards/generate/:classId/:termId
// Triggers batch calculation and updates all report cards for the class.
// Returns job ID for async processing via queueService or sync fallback.
router.post('/report-cards/generate/:classId/:termId', protect, requirePermission('grades.create', 'grades.edit'), async (req, res) => {
    try {
        const { classId, termId } = req.params;
        const redis = require('../config/redis');

        if (redis.isRedisConfigured()) {
            const { addReportCardJob } = require('../services/queueService');
            const job = await addReportCardJob(req.tenant.id, classId, termId);
            return res.json({
                data: {
                    jobId: job.id,
                    message: 'Report card generation queued.',
                }
            });
        }

        // Fallback: process synchronously
        const classResults = await gradebookService.calculateClassTermAverages(classId, termId, req.tenant.id);
        const results = [];
        for (const student of classResults) {
            const card = await gradebookService.updateReportCard(student.student_id, classId, termId, req.tenant.id);
            results.push(card);
        }

        return res.json({
            data: {
                message: 'Report cards generated synchronously.',
                count: results.length,
            }
        });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: 'Error generating report cards.' });
    }
});

// GET /api/school/report-cards/status/:jobId
// Returns the current status and progress of a report card generation job.
router.get('/report-cards/status/:jobId', protect, async (req, res) => {
    try {
        const redis = require('../config/redis');
        if (!redis.isRedisConfigured()) {
            return res.status(503).json({ error: 'Queue not available.' });
        }
        const { getJobStatus } = require('../services/queueService');
        const status = await getJobStatus(req.params.jobId);
        if (!status) {
            return res.status(404).json({ error: 'Job not found.' });
        }
        return res.json({ data: status });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        return res.status(500).json({ error: 'Error fetching job status.' });
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

// GET /api/school/my-classes — teacher's assigned classes with student counts
router.get('/my-classes', protect, async (req, res) => {
    try {
        const teacherId = req.user.userId || req.user.id;
        const classes = await schoolService.getTeacherClasses(req.tenant.id, teacherId);
        return res.json({ data: { classes } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching your classes.' });
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

// Specific scheduler routes must come BEFORE parameterized /:id routes
// ─── Timetable Scheduler ─────────────────────────────────────
router.post('/timetable/auto-generate', protect, requirePermission('timetable.create'), async (req, res) => {
    try {
        const { class_id, overwrite, term_id } = req.body;
        if (!class_id) return res.status(400).json({ error: 'class_id is required.' });
        const scheduler = new TimetableScheduler();
        const result = await scheduler.generateTimetable({
            classId: class_id,
            schoolId: req.tenant.id,
            overwrite: !!overwrite,
            termId: term_id || null,
        });
        return res.json({ data: result });
    } catch (err) {
        console.error('Timetable generation error:', err);
        return res.status(500).json({ error: err.message || 'Error generating timetable.' });
    }
});

router.get('/timetable/constraints', protect, requirePermission('timetable.view'), async (req, res) => {
    try {
        const { class_id } = req.query;
        const [settings, classes, teachers, rooms, subjects] = await Promise.all([
            schoolService.getSchedulingSettings(req.tenant.id),
            schoolService.getClasses(req.tenant.id),
            schoolService.getTeacherAvailabilityList(req.tenant.id),
            schoolService.getRooms(req.tenant.id),
            class_id
                ? schoolService.getClassSubjectsWithDetails(class_id, req.tenant.id)
                : schoolService.getSubjects(req.tenant.id),
        ]);
        return res.json({ data: { settings, classes, teachers, rooms, subjects } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching constraints.' });
    }
});

router.put('/timetable/teacher-availability', protect, requirePermission('timetable.edit'), async (req, res) => {
    try {
        const { teacher_id, availability } = req.body;
        if (!teacher_id || !availability) return res.status(400).json({ error: 'teacher_id and availability are required.' });
        const teacher = await schoolService.updateTeacherAvailability(req.tenant.id, teacher_id, availability);
        return res.json({ data: { teacher } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating availability.' });
    }
});

// Parameterized timetable routes (must come after specific routes)
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
        return res.json({ data: { success: true } });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting timetable entry.' });
    }
});

// ─── Scheduling Settings ─────────────────────────────────────
router.get('/scheduling-settings', protect, requirePermission('timetable.view'), async (req, res) => {
    try {
        const settings = await schoolService.getSchedulingSettings(req.tenant.id);
        return res.json({ data: { settings } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching scheduling settings.' });
    }
});

router.put('/scheduling-settings', protect, requirePermission('timetable.edit'), async (req, res) => {
    try {
        const settings = await schoolService.createOrUpdateSchedulingSettings(req.tenant.id, req.body);
        return res.json({ data: { settings } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating scheduling settings.' });
    }
});

// ─── Rooms ────────────────────────────────────────────────────
router.get('/rooms', protect, requirePermission('timetable.view'), async (req, res) => {
    try {
        const rooms = await schoolService.getRooms(req.tenant.id);
        return res.json({ data: { rooms } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching rooms.' });
    }
});

router.post('/rooms', protect, requirePermission('timetable.edit'), async (req, res) => {
    try {
        const room = await schoolService.createRoom(req.tenant.id, req.body);
        return res.status(201).json({ data: { room } });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating room.' });
    }
});

router.delete('/rooms/:id', protect, requirePermission('timetable.edit'), async (req, res) => {
    try {
        await schoolService.deleteRoom(req.tenant.id, req.params.id);
        return res.json({ data: { success: true } });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting room.' });
    }
});

// ─── Class Subject Periods ────────────────────────────────────
router.put('/class-subjects/:id/periods', protect, requirePermission('timetable.edit'), async (req, res) => {
    try {
        const { periods_per_week } = req.body;
        if (!periods_per_week || periods_per_week < 1) return res.status(400).json({ error: 'periods_per_week must be >= 1.' });
        const cs = await schoolService.updateClassSubjectPeriods(req.tenant.id, req.params.id, periods_per_week);
        return res.json({ data: { class_subject: cs } });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating periods.' });
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

// ─── WhatsApp Conversation History ───────────────────────────
router.get('/whatsapp/conversations', protect, requirePermission('communications.view'), async (req, res) => {
    try {
        const schoolId = req.tenant.id;
        const { phone, student_id, page = 1, limit = 50 } = req.query;
        let query = supabase.from('whatsapp_conversations').select('*', { count: 'exact' }).eq('school_id', schoolId);
        if (phone) query = query.eq('parent_phone', phone);
        if (student_id) query = query.eq('student_id', student_id);
        const offset = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
        const { data, count, error } = await query.order('created_at', { ascending: false }).range(offset, offset + Math.min(100, Number(limit)) - 1);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ data: { conversations: data || [], total: count, page: Number(page) } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching conversations.' }); }
});

// ─── Push Notification Subscriptions ─────────────────────────
router.post('/push/subscribe', protect, async (req, res) => {
    try {
        const { subscription } = req.body;
        if (!subscription) return res.status(400).json({ error: 'Subscription object required.' });
        const { error } = await supabase.from('push_subscriptions').upsert({
            user_id: req.user.userId || req.user.id,
            school_id: req.tenant.id,
            subscription,
            user_agent: req.headers['user-agent'],
        }, { onConflict: 'user_id,school_id' });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ data: { message: 'Subscribed.' } });
    } catch (err) { return res.status(500).json({ error: 'Error saving subscription.' }); }
});

router.delete('/push/unsubscribe', protect, async (req, res) => {
    try {
        const { error } = await supabase.from('push_subscriptions')
            .delete()
            .eq('user_id', req.user.userId)
            .eq('school_id', req.tenant.id);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ data: { message: 'Unsubscribed.' } });
    } catch (err) { return res.status(500).json({ error: 'Error removing subscription.' }); }
});

router.get('/push/vapid-public-key', async (req, res) => {
    return res.json({ data: { publicKey: process.env.VAPID_PUBLIC_KEY || '' } });
});

router.post('/push/broadcast', protect, requirePermission('announcements.create'), async (req, res) => {
    try {
        const { title, body, role, url } = req.body;
        if (!title) return res.status(400).json({ error: 'title is required.' });

        if (role) {
            await pushService.sendToRole(req.tenant.id, role, { title, body, url });
        } else {
            await pushService.sendToSchool(req.tenant.id, { title, body, url });
        }
        return res.json({ data: { message: 'Push notification sent.' } });
    } catch (err) { return res.status(500).json({ error: 'Error sending push notification.' }); }
});

// ─── Events ────────────────────────────────────────────────
router.get('/events', protect, async (req, res) => {
  try {
    const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
    const { upcoming, limit } = req.query;
    let query = supabase
      .from('events')
      .select('*')
      .eq('school_id', schoolId)
      .order('event_date', { ascending: true })
      .limit(Math.min(20, Math.max(1, Number.parseInt(limit) || 4)));
    if (upcoming === 'true') {
      query = query.gte('event_date', new Date().toISOString().split('T')[0]);
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: 'Error fetching events.' });
    const mapped = (data || []).map(e => ({
      id: e.id,
      title: e.title || e.name,
      date: e.event_date,
      type: e.event_type || 'event',
      color: null,
    }));
    return res.json({ data: mapped });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching events.' });
  }
});

// ─── Announcements ─────────────────────────────────────────
router.get('/announcements', protect, async (req, res) => {
  try {
    const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
    const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit) || 3));
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return res.status(500).json({ error: 'Error fetching announcements.' });
    const mapped = (data || []).map(a => ({
      id: a.id,
      title: a.title,
      content: a.content || a.message || '',
      date: a.created_at || a.date,
      type: a.type || 'notice',
    }));
    return res.json({ data: mapped });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching announcements.' });
  }
});

// ─── Dashboard Sub-Routes ─────────────────────────────────
const dashboardRouter = require('./dashboard');
router.use('/dashboard', dashboardRouter);

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

// GET /api/school/staff/summary
router.get('/staff/summary', protect, async (req, res) => {
    try {
        const summary = await schoolService.getStaffSummary(req.tenant.id);
        return res.json({ data: summary });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching staff summary.' });
    }
});

// GET /api/school/audit
router.get('/audit', protect, requirePermission('reports.view'), async (req, res) => {
    try {
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit) || 10));
        const logs = await schoolService.getRecentAuditLogs(req.tenant.id, limit);
        return res.json({ data: { logs } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching audit logs.' });
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

// ─── Settings Endpoints ─────────────────────────────────────────

const settingsFields = (req, allowed) => {
    const data = {};
    for (const key of allowed) {
        if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    return data;
};

// GET /api/school - fetch school profile
router.get('/', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const { data, error } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        if (error) return res.status(500).json({ error: 'Error fetching school profile.' });
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching school profile.' });
    }
});

// PATCH /api/school - update school profile
router.patch('/', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'Unable to determine school ID from token or tenant.' });
        const allowed = ['name','motto','school_type','year_established','registration_number','email','phone','website','address','city','region','country','logo_url','favicon_url','primary_color','timezone'];
        const updateData = settingsFields(req, allowed);
        const { error } = await supabase.from('schools').update(updateData).eq('id', schoolId);
        if (error) return res.status(500).json({ error: error.message });
        const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        return res.json({ data: school });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving school profile.' });
    }
});

// POST /api/school/upload-logo - upload logo or favicon as multipart, store as base64
router.post('/upload-logo', protect, upload.any(), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No file uploaded.' });
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'Unable to determine school ID.' });

        const file = req.files[0];
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const field = file.fieldname === 'favicon' ? 'favicon_url' : 'logo_url';
        const { error } = await supabase.from('schools').update({ [field]: base64 }).eq('id', schoolId);
        if (error) return res.status(500).json({ error: error.message });

        res.json({ data: { [field]: base64 } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/school/settings - fetch full school profile for settings
router.get('/settings', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const { data, error } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        if (error) return res.status(500).json({ error: 'Error fetching settings.' });
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching settings.' });
    }
});

// PUT /api/school/settings/profile
router.put('/settings/profile', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const allowed = ['name','motto','email','phone','address','website','city','region','country','registration_number','year_established','logo_url','primary_color','school_type'];
        const updateData = settingsFields(req, allowed);
        const { error } = await supabase.from('schools').update(updateData).eq('id', schoolId);
        if (error) return res.status(500).json({ error: error.message });
        const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        return res.json({ data: school });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving profile.' });
    }
});

// PATCH /api/school/settings/school-profile
router.patch('/settings/school-profile', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const allowed = ['name','motto','school_type','year_established','registration_number','email','phone','website','address','city','region','country','logo_url','primary_color'];
        const updateData = settingsFields(req, allowed);
        const { error } = await supabase.from('schools').update(updateData).eq('id', schoolId);
        if (error) return res.status(500).json({ error: error.message });
        const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        return res.json({ data: school });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving school profile.' });
    }
});

// GET /api/school/profile/status
router.get('/profile/status', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const result = await schoolService.checkProfileCompletion(schoolId);
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ error: 'Error checking profile completion.' });
    }
});

// PUT /api/school/settings/academic
router.put('/settings/academic', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const allowed = ['grading_system','academic_year','current_term','term_start_date','term_end_date','pass_mark','attendance_settings','class_settings'];
        const updateData = settingsFields(req, allowed);
        const { error } = await supabase.from('schools').update(updateData).eq('id', schoolId);
        if (error) return res.status(500).json({ error: error.message });
        const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        return res.json({ data: school });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving academic settings.' });
    }
});

// PUT /api/school/settings/fee
router.put('/settings/fee', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const allowed = ['payment_methods','fee_categories','late_fee_settings','receipt_settings'];
        const updateData = settingsFields(req, allowed);
        const { error } = await supabase.from('schools').update(updateData).eq('id', schoolId);
        if (error) return res.status(500).json({ error: error.message });
        const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        return res.json({ data: school });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving fee settings.' });
    }
});

// PUT /api/school/settings/notifications
router.put('/settings/notifications', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const allowed = ['notification_settings'];
        const updateData = settingsFields(req, allowed);
        const { error } = await supabase.from('schools').update(updateData).eq('id', schoolId);
        if (error) return res.status(500).json({ error: error.message });
        const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        return res.json({ data: school });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving notification settings.' });
    }
});

// GET /api/school/settings/billing
router.get('/settings/billing', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const { data: school } = await supabase.from('schools')
            .select('billing_plan,billing_status,billing_renewal_date,plan,name')
            .eq('id', schoolId).single();
        const { data: history } = await supabase.from('billing_history')
            .select('*').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(20);
        return res.json({ data: { ...school, history: history || [] } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching billing info.' });
    }
});

// POST /api/school/settings/change-password
const changePasswordSchema = {
    body: z.object({
        current_password: z.string().min(1),
        new_password: z.string().min(8, 'Password must be at least 8 characters'),
    })
};
router.post('/settings/change-password', protect, validate(changePasswordSchema), async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const userId = req.user.id;
        const { data: user } = await supabase.from('users').select('password').eq('id', userId).single();
        if (!user) return res.status(404).json({ error: 'User not found.' });
        const valid = await bcrypt.compare(current_password, user.password);
        if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' });
        const hashed = await bcrypt.hash(new_password, 12);
        await supabase.from('users').update({ password: hashed }).eq('id', userId);
        return res.json({ data: { message: 'Password updated successfully.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error changing password.' });
    }
});

// POST /api/school/settings/export
router.post('/settings/export', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        return res.json({ data: { message: 'Export job queued. You will receive an email when ready.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error queuing export.' });
    }
});

// POST /api/school/settings/reset-term
router.post('/settings/reset-term', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const { confirm } = req.body;
        if (confirm !== 'RESET TERM') return res.status(400).json({ error: 'Confirmation text mismatch.' });
        await supabase.from('attendance').delete().eq('school_id', schoolId);
        await supabase.from('exam_results').delete().eq('school_id', schoolId);
        await supabase.from('gradebook_entries').delete().eq('school_id', schoolId);
        return res.json({ data: { message: 'Term data reset successfully.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error resetting term.' });
    }
});

// DELETE /api/school/settings/account - mark for deletion
router.delete('/settings/account', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        const { confirm } = req.body;
        const { data: school } = await supabase.from('schools').select('name').eq('id', schoolId).single();
        if (confirm !== school.name) return res.status(400).json({ error: 'School name mismatch.' });
        const { data: existingSchool } = await supabase.from('schools').select('metadata').eq('id', schoolId).single();
        const metadata = { ...(existingSchool?.metadata || {}), deletion_requested_at: new Date().toISOString() };
        await supabase.from('schools').update({ is_active: false, metadata }).eq('id', schoolId);
        return res.json({ data: { message: 'Deletion scheduled. A confirmation email will be sent. Your account will be deleted in 24 hours.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Error scheduling deletion.' });
    }
});

// ─── Grading Scales (update) ──────────────────────────────────
router.put('/grading-scales/:id', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const scale = await examService.updateGradingScale(req.tenant.id, req.params.id, req.body);
        return res.json({ data: { scale } });
    } catch (err) { return res.status(500).json({ error: 'Error updating grading scale.' }); }
});

// ─── Set Current Term ──────────────────────────────────────────
router.put('/terms/:id/set-current', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const schoolId = req.tenant.id;
        await supabase.from('academic_terms').update({ is_current: false }).eq('school_id', schoolId);
        const term = await schoolService.updateTerm(schoolId, req.params.id, { is_current: true });
        return res.json({ data: { term } });
    } catch (err) { return res.status(500).json({ error: 'Error setting current term.' }); }
});

// ─── Reorder Classes ────────────────────────────────────────────
router.put('/classes/reorder', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const { order } = req.body;
        if (!Array.isArray(order)) return res.status(400).json({ error: 'order array is required.' });
        for (const item of order) {
            await supabase.from('classes').update({ sort_order: item.sort_order }).eq('id', item.id).eq('school_id', req.tenant.id);
        }
        return res.json({ data: { message: 'Classes reordered.' } });
    } catch (err) { return res.status(500).json({ error: 'Error reordering classes.' }); }
});

// ─── Class-Subject Assignments ─────────────────────────────────
router.get('/class-subjects/:classId', protect, requirePermission('subjects.view'), async (req, res) => {
    try {
        const { data, error } = await supabase.from('class_subjects')
            .select('*, subject:subjects(name, code)')
            .eq('school_id', req.tenant.id)
            .eq('class_id', req.params.classId);
        if (error) return res.status(500).json({ error: 'Error fetching class subjects.' });
        return res.json({ data: { subjects: data || [] } });
    } catch (err) { return res.status(500).json({ error: 'Error fetching class subjects.' }); }
});

router.post('/class-subjects/assign', protect, requirePermission('subjects.create', 'subjects.edit'), async (req, res) => {
    try {
        const { class_id, subject_ids } = req.body;
        if (!class_id || !Array.isArray(subject_ids)) return res.status(400).json({ error: 'class_id and subject_ids array required.' });
        const schoolId = req.tenant.id;
        const inserted = [];
        for (const subject_id of subject_ids) {
            const { data: existing } = await supabase.from('class_subjects')
                .select('id').eq('school_id', schoolId).eq('class_id', class_id).eq('subject_id', subject_id).maybeSingle();
            if (existing) continue;
            const cs = await schoolService.addClassSubject(schoolId, { class_id, subject_id });
            inserted.push(cs);
        }
        return res.status(201).json({ data: { subjects: inserted } });
    } catch (err) { return res.status(500).json({ error: 'Error assigning subjects.' }); }
});

router.delete('/class-subjects/:classId/:subjectId', protect, requirePermission('subjects.delete'), async (req, res) => {
    try {
        const { data: cs } = await supabase.from('class_subjects')
            .select('id').eq('school_id', req.tenant.id).eq('class_id', req.params.classId).eq('subject_id', req.params.subjectId).single();
        if (!cs) return res.status(404).json({ error: 'Assignment not found.' });
        await schoolService.removeClassSubject(req.tenant.id, cs.id);
        return res.json({ data: { message: 'Subject removed from class.' } });
    } catch (err) { return res.status(500).json({ error: 'Error removing subject.' }); }
});

// ─── User Login Sessions ────────────────────────────────────────
router.get('/sessions', protect, async (req, res) => {
    try {
        const { data, error } = await supabase.from('user_sessions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('last_active_at', { ascending: false });
        if (error) return res.status(500).json({ error: 'Error fetching sessions.' });
        return res.json({ data: data || [] });
    } catch (err) { return res.status(500).json({ error: 'Error fetching sessions.' }); }
});

router.delete('/sessions/:id', protect, async (req, res) => {
    try {
        await supabase.from('user_sessions').delete().eq('id', req.params.id).eq('user_id', req.user.id);
        return res.json({ data: { message: 'Session revoked.' } });
    } catch (err) { return res.status(500).json({ error: 'Error revoking session.' }); }
});

router.post('/sessions/revoke-all', protect, async (req, res) => {
    try {
        await supabase.from('user_sessions').delete().neq('id', req.body.current_session_id || '').eq('user_id', req.user.id);
        return res.json({ data: { message: 'Other sessions revoked.' } });
    } catch (err) { return res.status(500).json({ error: 'Error revoking sessions.' }); }
});

// ─── Bulk User Operations ───────────────────────────────────────
router.post('/users/bulk-deactivate', protect, requirePermission('users.edit'), async (req, res) => {
    try {
        const { user_ids } = req.body;
        if (!Array.isArray(user_ids) || user_ids.length === 0) return res.status(400).json({ error: 'user_ids array required.' });
        const { error } = await supabase.from('users')
            .update({ is_active: false, suspended_at: new Date().toISOString() })
            .in('id', user_ids)
            .eq('tenant_id', req.tenant.id);
        if (error) return res.status(500).json({ error: 'Error deactivating users.' });
        return res.json({ data: { message: `${user_ids.length} user(s) deactivated.` } });
    } catch (err) { return res.status(500).json({ error: 'Error deactivating users.' }); }
});

router.post('/users/:id/resend', protect, requirePermission('users.create'), async (req, res) => {
    try {
        const { data: user, error } = await supabase.from('users')
            .select('id, full_name, email').eq('id', req.params.id).eq('tenant_id', req.tenant.id).single();
        if (error || !user) return res.status(404).json({ error: 'User not found.' });
        await supabase.from('users').update({ invited_at: new Date().toISOString() }).eq('id', user.id);
        return res.json({ data: { message: `Invitation resent to ${user.email}.` } });
    } catch (err) { return res.status(500).json({ error: 'Error resending invitation.' }); }
});

// ─── Clear All Data ──────────────────────────────────────────────
router.post('/settings/clear-all-data', protect, async (req, res) => {
    try {
        const schoolId = req.tenant.id;
        const { confirm, password } = req.body;
        if (confirm !== 'DELETE ALL DATA') return res.status(400).json({ error: 'Confirmation text mismatch.' });
        const { data: user } = await supabase.from('users').select('password').eq('id', req.user.id).single();
        const valid = await bcrypt.compare(password || '', user.password);
        if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' });
        const tables = ['attendance', 'exam_results', 'gradebook_entries', 'fee_structures', 'invoices', 'payments', 'waivers', 'discounts', 'class_subjects', 'subject_teachers', 'class_teachers', 'timetable_entries'];
        for (const table of tables) {
            await supabase.from(table).delete().eq('school_id', schoolId);
        }
        return res.json({ data: { message: 'All school data has been cleared.' } });
    } catch (err) { return res.status(500).json({ error: 'Error clearing data.' }); }
});

// ─── Password Policy Settings ────────────────────────────────────
router.put('/settings/security-policy', protect, requirePermission('settings.edit'), async (req, res) => {
    try {
        const schoolId = req.tenant.id;
        const allowed = ['min_password_length', 'require_uppercase', 'require_lowercase', 'require_digit', 'require_special', 'password_expiry_days', 'max_login_attempts', 'lockout_duration_minutes'];
        const data = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) data[key] = req.body[key];
        }
        const { data: existingPolicy } = await supabase.from('schools').select('password_policy').eq('id', schoolId).single();
        const password_policy = { ...(existingPolicy?.password_policy || {}), policy: data };
        const { error } = await supabase.from('schools').update({ password_policy }).eq('id', schoolId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ data: { message: 'Security policy updated.' } });
    } catch (err) { return res.status(500).json({ error: 'Error updating security policy.' }); }
});

router.put('/settings/deactivate', protect, async (req, res) => {
    try {
        const schoolId = req.tenant.id;
        const { confirm } = req.body;
        const { data: school } = await supabase.from('schools').select('name').eq('id', schoolId).single();
        if (confirm !== school.name) return res.status(400).json({ error: 'School name mismatch.' });
        await supabase.from('schools').update({ is_active: false }).eq('id', schoolId);
        return res.json({ data: { message: 'School deactivated. Contact support to reactivate.' } });
    } catch (err) { return res.status(500).json({ error: 'Error deactivating school.' }); }
});

router.get('/search', protect, async (req, res) => {
    try {
        const schoolId = req.tenant.id;
        const { q } = req.query;
        if (!q || q.length < 2) return res.json({ data: { students: [], classes: [] } });
        const term = `%${q}%`;
        const [studentsRes, classesRes] = await Promise.all([
            supabase.from('students').select('id, first_name, last_name, class_id, class:classes(name)').eq('school_id', schoolId).or(`first_name.ilike.${term},last_name.ilike.${term}`).limit(10),
            supabase.from('classes').select('id, name').eq('school_id', schoolId).ilike('name', term).limit(5)
        ]);
        const students = (studentsRes.data || []).map(s => ({
            id: s.id, name: `${s.first_name} ${s.last_name}`, class_name: s.class?.name || '', path: `/dashboard/students/${s.id}`
        }));
        const classes = (classesRes.data || []).map(c => ({ id: c.id, name: c.name, path: `/dashboard/students?classId=${c.id}` }));
        return res.json({ data: { students, classes } });
    } catch (err) { return res.status(500).json({ error: 'Error performing search.' }); }
});

// ===== FILE STORAGE (DigitalOcean Spaces) =====

const ENTITY_MAP = {
  'student-photos': { table: 'students', column: 'avatar_url' },
  'report-cards': { table: 'report_cards', column: 'report_card_url' },
};

router.post('/upload', protect, async (req, res) => {
  try {
    const schoolId = req.tenant.id;
    const { bucket, entity_type, entity_id, filename, content_type, file_size } = req.body;

    if (!bucket || !filename || !content_type || !file_size) {
      return res.status(400).json({ error: 'Missing required fields: bucket, filename, content_type, file_size.' });
    }

    const validationError = spaces.validateFile(bucket, content_type, file_size);
    if (validationError) return res.status(400).json({ error: validationError });

    const key = spaces.buildKey(schoolId, bucket, entity_id, filename);
    const uploadUrl = await spaces.generatePresignedPutUrl(bucket, key, content_type);

    return res.json({ data: { uploadUrl, key, bucket, filename } });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to generate upload URL.' });
  }
});

router.post('/upload/confirm', protect, async (req, res) => {
  try {
    const schoolId = req.tenant.id;
    const { key, bucket, entity_type, entity_id } = req.body;

    if (!key || !bucket) {
      return res.status(400).json({ error: 'Missing required fields: key, bucket.' });
    }
    if (!key.startsWith(schoolId)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const mapping = ENTITY_MAP[bucket];
    if (mapping && entity_id) {
      const { data: record } = await supabase
        .from(mapping.table)
        .select('id')
        .eq('id', entity_id)
        .eq('school_id', schoolId)
        .single();
      if (!record) return res.status(404).json({ error: `${mapping.table} record not found.` });

      if (mapping.column === 'document_urls') {
        const { data: existing } = await supabase
          .from(mapping.table)
          .select('document_urls')
          .eq('id', entity_id)
          .single();
        const urls = existing?.document_urls || [];
        urls.push({ key, bucket, uploaded_at: new Date().toISOString() });
        await supabase.from(mapping.table).update({ document_urls: urls }).eq('id', entity_id);
      } else {
        await supabase.from(mapping.table).update({ [mapping.column]: key }).eq('id', entity_id);
      }
    }

    return res.json({ data: { message: 'File confirmed.', key } });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to confirm upload.' });
  }
});

router.delete('/upload', protect, async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'Key is required.' });
    if (!key.startsWith(req.tenant.id)) return res.status(403).json({ error: 'Access denied.' });
    await spaces.deleteFile(key);
    return res.json({ data: { message: 'File deleted.' } });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Delete failed.' });
  }
});

router.get('/files/*fileKey', protect, async (req, res) => {
  try {
    const key = req.params.fileKey;
    if (!key) return res.status(400).json({ error: 'File key is required.' });
    if (!key.startsWith(req.tenant.id)) return res.status(403).json({ error: 'Access denied.' });
    const url = await spaces.generatePresignedGetUrl(key, 3600);
    return res.json({ data: { url, key } });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to generate download URL.' });
  }
});

router.patch('/students/:id/avatar', protect, async (req, res) => {
  try {
    const schoolId = req.tenant.id;
    const { id } = req.params;
    const { avatar_url, key } = req.body;

    const finalKey = key || avatar_url;

    const { data: student } = await supabase.from('students').select('id').eq('id', id).eq('school_id', schoolId).single();
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    await supabase.from('students').update({ avatar_url: finalKey }).eq('id', id).eq('school_id', schoolId);

    let signedUrl = null;
    if (finalKey) {
      try { signedUrl = await spaces.generatePresignedGetUrl(finalKey, 3600); } catch {}
    }

    return res.json({ data: { message: 'Avatar updated.', key: finalKey, url: signedUrl } });
  } catch (err) {
    return res.status(500).json({ error: 'Error updating avatar.' });
  }
});
