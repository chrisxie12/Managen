const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.TENANT_BASE_URL = process.env.TENANT_BASE_URL || 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';
process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000';

const db = {
    schools: [],
    tenants: [],
    users: [],
    students: [],
    attendance: [],
    fees: [],
    payments: [],
    demo_leads: [],
};

let idSequence = 1;

const resetDb = () => {
    for (const key of Object.keys(db)) {
        db[key] = [];
    }
    idSequence = 1;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const projectRecord = (record, columns) => {
    if (!record) return record;
    if (!columns || columns === '*' || columns === ' *') return clone(record);

    const fields = String(columns)
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean);

    return fields.reduce((acc, field) => {
        if (field in record) {
            acc[field] = record[field];
        }
        return acc;
    }, {});
};

const applyFilters = (records, filters) => records.filter((record) => filters.every((filter) => {
    if (filter.type === 'eq') {
        return record[filter.field] === filter.value;
    }

    if (filter.type === 'in') {
        return Array.isArray(filter.values) && filter.values.includes(record[filter.field]);
    }

    if (filter.type === 'lte') {
        return record[filter.field] <= filter.value;
    }

    return true;
}));

const sortRecords = (records, orderings) => {
    if (!orderings.length) return records;

    const sorted = [...records];
    sorted.sort((left, right) => {
        for (const ordering of orderings) {
            const leftValue = left[ordering.field];
            const rightValue = right[ordering.field];
            if (leftValue === rightValue) continue;
            if (leftValue == null) return ordering.nullsFirst ? -1 : 1;
            if (rightValue == null) return ordering.nullsFirst ? 1 : -1;
            const comparison = leftValue < rightValue ? -1 : 1;
            return ordering.ascending ? comparison : -comparison;
        }
        return 0;
    });
    return sorted;
};

class Query {
    constructor(table) {
        this.table = table;
        this.mode = 'select';
        this.filters = [];
        this.selectColumns = '*';
        this.head = false;
        this.orderings = [];
        this.limitCount = null;
        this.rangeBounds = null;
        this.payload = null;
    }

    select(columns = '*', options = {}) {
        this.selectColumns = columns;
        this.head = Boolean(options.head);
        return this;
    }

    eq(field, value) {
        this.filters.push({ type: 'eq', field, value });
        return this;
    }

    lte(field, value) {
        this.filters.push({ type: 'lte', field, value });
        return this;
    }

    in(field, values) {
        this.filters.push({ type: 'in', field, values });
        return this;
    }

    order(field, options = {}) {
        this.orderings.push({
            field,
            ascending: options.ascending !== false,
            nullsFirst: Boolean(options.nullsFirst),
        });
        return this;
    }

    limit(count) {
        this.limitCount = Number(count);
        return this;
    }

    range(start, end) {
        this.rangeBounds = [Number(start), Number(end)];
        return this;
    }

    insert(payload) {
        this.mode = 'insert';
        this.payload = Array.isArray(payload) ? payload : [payload];
        return this;
    }

    upsert(payload) {
        this.mode = 'upsert';
        this.payload = Array.isArray(payload) ? payload : [payload];
        return this;
    }

    update(payload) {
        this.mode = 'update';
        this.payload = payload;
        return this;
    }

    delete() {
        this.mode = 'delete';
        return this;
    }

    then(resolve, reject) {
        return this._execute('many').then(resolve, reject);
    }

    single() {
        return this._execute('single');
    }

    maybeSingle() {
        return this._execute('maybeSingle');
    }

    async _execute(mode) {
        if (!db[this.table]) {
            db[this.table] = [];
        }
        const table = db[this.table];

        if (this.mode === 'insert') {
        const inserted = this.payload.map((item) => {
            const row = clone(item);
            if (!row.id) row.id = `${this.table}_${idSequence++}`;
            if (!row.created_at) row.created_at = new Date().toISOString();
            if ((this.table === 'tenants' || this.table === 'schools') && !row.status) row.status = 'trial';
            if (this.table === 'schools') {
                if (!row.plan && row.subscription_plan) row.plan = row.subscription_plan;
                if (!row.school_name && row.name) row.school_name = row.name;
                if (!row.slug && row.subdomain) row.slug = row.subdomain;
            }
            if (this.table === 'students' && row.is_active === undefined) row.is_active = true;
            db[this.table].push(row);
            return row;
        });
            const projected = inserted.length === 1
                ? projectRecord(inserted[0], this.selectColumns)
                : inserted.map((row) => projectRecord(row, this.selectColumns));
            const data = mode === 'maybeSingle' || mode === 'single'
                ? (Array.isArray(projected) ? projected[0] || null : projected || null)
                : projected;
            return { data, error: null };
        }

        if (this.mode === 'upsert') {
            const upserted = this.payload.map((item) => {
                const row = clone(item);
                if (!row.id) row.id = `${this.table}_${idSequence++}`;
                if (!row.created_at) row.created_at = new Date().toISOString();
                const existingIndex = db[this.table].findIndex((record) => record.id === row.id);
                if (existingIndex >= 0) {
                    db[this.table][existingIndex] = { ...db[this.table][existingIndex], ...row };
                    return db[this.table][existingIndex];
                }
                db[this.table].push(row);
                return row;
            });
            const projected = upserted.length === 1
                ? projectRecord(upserted[0], this.selectColumns)
                : upserted.map((row) => projectRecord(row, this.selectColumns));
            const data = mode === 'maybeSingle' || mode === 'single'
                ? (Array.isArray(projected) ? projected[0] || null : projected || null)
                : projected;
            return { data, error: null };
        }

        const filtered = sortRecords(applyFilters(table, this.filters), this.orderings);
        const count = filtered.length;

        if (this.mode === 'delete') {
            const idsToDelete = new Set(filtered.map((record) => record.id));
            db[this.table] = table.filter((record) => !idsToDelete.has(record.id));
            return { data: mode === 'maybeSingle' || mode === 'single' ? null : [], error: null };
        }

        if (this.mode === 'update') {
            const updated = [];
            for (const record of db[this.table]) {
                if (this.filters.every((filter) => {
                    if (filter.type === 'eq') return record[filter.field] === filter.value;
                    if (filter.type === 'in') return Array.isArray(filter.values) && filter.values.includes(record[filter.field]);
                    return true;
                })) {
                    Object.assign(record, clone(this.payload));
                    updated.push(record);
                }
            }
            const projected = updated.length === 0
                ? null
                : (updated.length === 1
                    ? projectRecord(updated[0], this.selectColumns)
                    : updated.map((row) => projectRecord(row, this.selectColumns)));
            const data = mode === 'maybeSingle' || mode === 'single'
                ? (Array.isArray(projected) ? projected[0] || null : projected || null)
                : projected;
            return { data, error: null };
        }

        let paged = filtered;
        if (this.rangeBounds) {
            paged = paged.slice(this.rangeBounds[0], this.rangeBounds[1] + 1);
        } else if (this.limitCount != null && Number.isFinite(this.limitCount)) {
            paged = paged.slice(0, this.limitCount);
        }

        const projected = paged.map((row) => projectRecord(row, this.selectColumns));
        if (mode === 'maybeSingle' || mode === 'single') {
            return {
                data: projected.length > 0 ? projected[0] : null,
                error: mode === 'single' && projected.length === 0 ? { message: 'Not found' } : null,
            };
        }

        return {
            data: this.head ? null : projected,
            count,
            error: null,
        };
    }
}

const _queryMethodKeepAlive = (() => {
    const demoQuery = new Query('tenants').order('id').range(0, 0);
    demoQuery.then(() => null, () => null).catch(() => {});
    demoQuery.single().catch(() => {});
    return demoQuery;
})();
void _queryMethodKeepAlive;

const fakeSupabase = {
    from(table) {
        return new Query(table);
    },
    auth: {
        admin: {
            async createUser(payload) {
                const userId = `auth_user_${idSequence++}`;
                return {
                    data: {
                        user: {
                            id: userId,
                            email: payload.email,
                            user_metadata: payload.user_metadata || {},
                        },
                    },
                    error: null,
                };
            },
            async deleteUser() {
                return { data: { user: null }, error: null };
            },
        },
    },
};

const configDbPath = require.resolve('../config/db');
require.cache[configDbPath] = {
    id: configDbPath,
    filename: configDbPath,
    loaded: true,
    exports: fakeSupabase,
};

const app = require('../server');
let server;
let baseUrl;

const request = async (path, { method = 'GET', headers = {}, body } = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            ...headers,
            ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const raw = await response.text();
    let parsed = null;
    if (raw) {
        try {
            parsed = JSON.parse(raw);
        } catch {
            parsed = raw;
        }
    }

    const setCookie = response.headers.get('set-cookie');
    const bodyKeys = parsed && typeof parsed === 'object' ? Object.keys(parsed) : [];
    const nestedDataKeys = parsed && parsed.data && typeof parsed.data === 'object' ? Object.keys(parsed.data) : [];

    if (['/health', '/api/onboard/signup', '/api/auth/login', '/api/school/info'].includes(path)) {
        console.log('[api-tests][diag]', {
            path,
            method,
            status: response.status,
            bodyKeys,
            nestedDataKeys,
            hasTopLevelToken: Boolean(parsed && parsed.token),
            hasNestedToken: Boolean(parsed && parsed.data && parsed.data.token),
            hasSetCookie: Boolean(setCookie),
            setCookiePreview: setCookie ? setCookie.split(';')[0] : null,
        });
    }

    return { status: response.status, body: parsed, setCookie };
};

const signUpSchool = async () => request('/api/onboard/signup', {
    method: 'POST',
    body: {
        schoolName: 'Green Valley School',
        email: 'admin@greenvalley.edu',
        phone: '1234567890',
        adminName: 'Jane Admin',
        adminPassword: 'Password123!',
        plan: 'trial',
    },
});

const loginSchool = async (subdomain) => request('/api/auth/login', {
    method: 'POST',
    body: {
        email: 'admin@greenvalley.edu',
        password: 'Password123!',
        subdomain,
    },
});

const flushTenantRedis = async () => {
    try {
        const redis = require('../config/redis');
        if (!redis || typeof redis.isRedisConfigured !== 'function' || !redis.isRedisConfigured() || redis.status === 'unconfigured') return;
        for (let i = 0; i < 20; i += 1) {
            if (redis.status === 'ready') break;
            await new Promise((r) => setTimeout(r, 50));
        }
        if (redis.status !== 'ready') return;
        const keys = await redis.keys('tenant:*');
        if (keys && keys.length) await redis.del(...keys);
    } catch {
        // Redis optional in CI
    }
};

test.before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    await flushTenantRedis();
});

test.beforeEach(async () => {
    resetDb();
    await flushTenantRedis();

    db.roles = [
        { id: 'role_school_admin', name: 'school_admin', label: 'School Admin' },
        { id: 'role_superadmin', name: 'superadmin', label: 'Super Admin' },
        { id: 'role_headmaster', name: 'headmaster', label: 'Headmaster' },
        { id: 'role_accountant', name: 'accountant', label: 'Accountant' },
        { id: 'role_teacher', name: 'teacher', label: 'Teacher' },
        { id: 'role_student', name: 'student', label: 'Student' },
        { id: 'role_parent', name: 'parent', label: 'Parent' },
    ];
    db.permissions = [
        { id: 'perm_dashboard_view', name: 'dashboard.view', module: 'dashboard', action: 'view' },
        { id: 'perm_students_view', name: 'students.view', module: 'students', action: 'view' },
        { id: 'perm_students_create', name: 'students.create', module: 'students', action: 'create' },
        { id: 'perm_students_edit', name: 'students.edit', module: 'students', action: 'edit' },
        { id: 'perm_grades_view', name: 'grades.view', module: 'grades', action: 'view' },
        { id: 'perm_grades_create', name: 'grades.create', module: 'grades', action: 'create' },
        { id: 'perm_grades_edit', name: 'grades.edit', module: 'grades', action: 'edit' },
        { id: 'perm_attendance_view', name: 'attendance.view', module: 'attendance', action: 'view' },
        { id: 'perm_attendance_create', name: 'attendance.create', module: 'attendance', action: 'create' },
        { id: 'perm_fees_view', name: 'fees.view', module: 'fees', action: 'view' },
        { id: 'perm_fees_create', name: 'fees.create', module: 'fees', action: 'create' },
        { id: 'perm_messages_view', name: 'messages.view', module: 'messages', action: 'view' },
        { id: 'perm_announcements_view', name: 'announcements.view', module: 'announcements', action: 'view' },
        { id: 'perm_settings_edit', name: 'settings.edit', module: 'settings', action: 'edit' },
        { id: 'perm_users_create', name: 'users.create', module: 'users', action: 'create' },
        { id: 'perm_users_view', name: 'users.view', module: 'users', action: 'view' },
        { id: 'perm_classes_view', name: 'classes.view', module: 'classes', action: 'view' },
        { id: 'perm_classes_create', name: 'classes.create', module: 'classes', action: 'create' },
        { id: 'perm_teachers_view', name: 'teachers.view', module: 'teachers', action: 'view' },
        { id: 'perm_teachers_create', name: 'teachers.create', module: 'teachers', action: 'create' },
        { id: 'perm_payments_view', name: 'payments.view', module: 'payments', action: 'view' },
        { id: 'perm_invoices_view', name: 'invoices.view', module: 'invoices', action: 'view' },
        { id: 'perm_timetable_view', name: 'timetable.view', module: 'timetable', action: 'view' },
        { id: 'perm_reports_view', name: 'reports.view', module: 'reports', action: 'view' },
        { id: 'perm_notifications_view', name: 'notifications.view', module: 'notifications', action: 'view' },
        { id: 'perm_subjects_view', name: 'subjects.view', module: 'subjects', action: 'view' },
    ];
    db.role_permissions = [];
    for (const role of db.roles) {
        if (role.name === 'school_admin') {
            const names = ['dashboard.view', 'students.view', 'students.create', 'students.edit',
                'grades.view', 'grades.create', 'grades.edit', 'attendance.view', 'attendance.create',
                'fees.view', 'fees.create', 'messages.view', 'announcements.view', 'settings.edit',
                'users.create', 'users.view', 'classes.view', 'classes.create', 'teachers.view',
                'teachers.create', 'payments.view', 'invoices.view', 'timetable.view', 'reports.view',
                'notifications.view', 'subjects.view'];
            for (const p of db.permissions.filter(p => names.includes(p.name))) {
                db.role_permissions.push({ role_id: role.id, permission_id: p.id });
            }
        }
    }
});

test.after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()));
        });
    }
    try {
        const redis = require('../config/redis');
        if (redis && typeof redis.quit === 'function') {
            await redis.quit();
        }
    } catch {
        // allow tests to finish if Redis is down
    }
});

test('health and plan endpoints respond', async () => {
    const health = await request('/health');
    try {
        assert.equal(health.status, 200);
        const healthStatus = health.body?.data?.status || health.body?.status;
        assert.equal(healthStatus, 'ok');
    } catch (error) {
        console.log('Health response:', JSON.stringify(health.body));
        throw error;
    }

    const plans = await request('/api/onboard/plans');
    assert.equal(plans.status, 200);
    assert.ok(Array.isArray(plans.body.data.plans));
    assert.ok(plans.body.data.plans.some((plan) => plan.name === 'trial'));
    assert.ok(plans.body.data.plans.some((plan) => plan.name === 'enterprise'));
});

test('demo request endpoint stores a lead', async () => {
    const demo = await request('/api/onboard/demo-request', {
        method: 'POST',
        body: {
            name: 'Ama Boateng',
            email: 'Ama@example.com',
            schoolName: 'Bright Future School',
            country: 'Ghana',
            message: 'Need a walkthrough for admissions and billing.',
            variant: 'control',
            source: 'demo_modal',
            createdAt: new Date().toISOString(),
        },
    });

    assert.equal(demo.status, 201);
    assert.equal(demo.body.data.message, 'Demo request received.');
    assert.equal(db.demo_leads.length, 1);
    assert.equal(db.demo_leads[0].name, 'Ama Boateng');
    assert.equal(db.demo_leads[0].email, 'ama@example.com');
    assert.equal(db.demo_leads[0].school_name, 'Bright Future School');
});

test('onboarding, login, school info, and student management work end to end', async () => {
    const signup = await signUpSchool();
    assert.equal(signup.status, 201);
    assert.match(signup.body.data.subdomain, /^[a-z0-9]+$/);
    assert.equal(signup.body.data.plan, 'trial');

    const subdomainCheck = await request(`/api/onboard/check-subdomain/${signup.body.data.subdomain}`);
    assert.equal(subdomainCheck.status, 200);
    assert.equal(subdomainCheck.body.data.available, false);

    const login = await loginSchool(signup.body.data.subdomain);
    assert.equal(login.status, 200);
    assert.ok(login.setCookie);
    assert.equal(login.body.data.user.email, 'admin@greenvalley.edu');
    assert.equal(login.body.data.school.plan, 'trial');

    const commonHeaders = {
        Cookie: login.setCookie,
        'x-tenant-subdomain': signup.body.data.subdomain,
    };

    const info = await request('/api/school/info', { headers: commonHeaders });
    assert.equal(info.status, 200);
    assert.equal(info.body.data.school.name, 'Green Valley School');
    assert.equal(info.body.data.school.subdomain, signup.body.data.subdomain);

    const listBefore = await request('/api/school/students', { headers: commonHeaders });
    assert.equal(listBefore.status, 200);
    assert.equal(listBefore.body.data.total, 0);
    assert.deepEqual(listBefore.body.data.students, []);

    const createStudent = await request('/api/school/students', {
        method: 'POST',
        headers: commonHeaders,
        body: {
            name: 'Ada Lovelace',
            class_name: 'JSS 1',
            parent_name: 'Lord Byron',
            parent_phone: '555-0001',
            unexpectedField: 'should not persist',
        },
    });
    assert.equal(createStudent.status, 201);
    assert.equal(createStudent.body.data.student.name, 'Ada Lovelace');
    assert.equal(createStudent.body.data.student.class_name, 'JSS 1');
    assert.equal(createStudent.body.data.student.tenant_id, signup.body.data.tenantId);
    assert.equal(createStudent.body.data.student.unexpectedField, undefined);

    const listAfter = await request('/api/school/students', { headers: commonHeaders });
    assert.equal(listAfter.status, 200);
    assert.equal(listAfter.body.data.total, 1);
    assert.equal(listAfter.body.data.students[0].name, 'Ada Lovelace');
});

test('auth tokens cannot be replayed against another tenant', async () => {
    const first = await request('/api/onboard/signup', {
        method: 'POST',
        body: {
            schoolName: 'First School',
            email: 'first@school.edu',
            adminName: 'First Admin',
            adminPassword: 'Password123!',
            plan: 'trial',
        },
    });
    assert.equal(first.status, 201);

    const second = await request('/api/onboard/signup', {
        method: 'POST',
        body: {
            schoolName: 'Second School',
            email: 'second@school.edu',
            adminName: 'Second Admin',
            adminPassword: 'Password123!',
            plan: 'trial',
        },
    });
    assert.equal(second.status, 201);

    const login = await request('/api/auth/login', {
        method: 'POST',
        body: {
            email: 'first@school.edu',
            password: 'Password123!',
            subdomain: first.body.data.subdomain,
        },
    });
    assert.equal(login.status, 200);
    assert.ok(login.setCookie);

    const wrongTenantInfo = await request('/api/school/info', {
        headers: {
            Cookie: login.setCookie,
            'x-tenant-subdomain': second.body.data.subdomain,
        },
    });

    assert.equal(wrongTenantInfo.status, 403);
    assert.match(wrongTenantInfo.body.error, /Token does not match the requested school/i);
});

// ─── GET /api/superadmin/dashboard ────────────────────────────────────

const makeSuperAdminToken = () => jwt.sign(
    { kind: 'superadmin', scope: 'platform', role: 'superadmin', email: 'admin@test.com' },
    process.env.JWT_SECRET
);

const seedDashboardData = () => {
    db.schools = [
        { id: 'sch1', name: 'Greenfield Academy', plan: 'growth', is_active: true, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'sch2', name: 'Sunrise School', plan: 'pro', is_active: true, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'sch3', name: 'Oakwood Academy', plan: 'trial', is_active: false, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    ];
    db.payments = [
        { id: 'pay1', amount: 499, created_at: new Date().toISOString(), paid_at: new Date().toISOString() },
        { id: 'pay2', amount: 999, created_at: new Date().toISOString(), paid_at: new Date().toISOString() },
    ];
};

test('GET /api/superadmin/dashboard — no token returns 401', async () => {
    const res = await request('/api/superadmin/dashboard');
    assert.equal(res.status, 401);
});

test('GET /api/superadmin/dashboard — invalid token returns 401', async () => {
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: 'schoolos_admin_token=badtoken' },
    });
    assert.equal(res.status, 401);
});

test('GET /api/superadmin/dashboard — wrong role returns 403', async () => {
    const token = jwt.sign(
        { kind: 'user', scope: 'school', role: 'admin' },
        process.env.JWT_SECRET
    );
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    assert.equal(res.status, 403);
});

test('GET /api/superadmin/dashboard — response shape', async () => {
    resetDb();
    seedDashboardData();
    const token = makeSuperAdminToken();
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.data, 'body.data exists');
    assert.ok(res.body.data.stats, 'body.data.stats exists');
    assert.ok(Array.isArray(res.body.data.planBreakdown), 'planBreakdown is array');
    assert.ok(Array.isArray(res.body.data.recentActivity), 'recentActivity is array');
    assert.ok(Array.isArray(res.body.data.mrrTrend), 'mrrTrend is array');
});

test('GET /api/superadmin/dashboard — stats values are correct', async () => {
    resetDb();
    seedDashboardData();
    const token = makeSuperAdminToken();
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    const { stats } = res.body.data;
    assert.equal(stats.totalSchools, 3);
    assert.equal(stats.activeSchools, 2);
    assert.equal(stats.suspended, 1);
    assert.equal(stats.totalRevenue, 1498);
    assert.equal(stats.trialSchools, 0);
});

test('GET /api/superadmin/dashboard — stats.trends shape', async () => {
    resetDb();
    seedDashboardData();
    const token = makeSuperAdminToken();
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    const { trends } = res.body.data.stats;
    if (trends !== null) {
        assert.ok(Object.prototype.hasOwnProperty.call(trends, 'totalSchools'));
        assert.ok(Object.prototype.hasOwnProperty.call(trends, 'activeSchools'));
        assert.ok(Object.prototype.hasOwnProperty.call(trends, 'suspended'));
        assert.ok(Object.prototype.hasOwnProperty.call(trends, 'totalRevenue'));
        assert.equal(typeof trends.totalSchools, 'number');
        assert.equal(typeof trends.activeSchools, 'number');
        assert.equal(typeof trends.suspended, 'number');
        assert.equal(typeof trends.totalRevenue, 'number');
    }
});

test('GET /api/superadmin/dashboard — planBreakdown is correct', async () => {
    resetDb();
    seedDashboardData();
    const token = makeSuperAdminToken();
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    const { planBreakdown } = res.body.data;
    const growth = planBreakdown.find((p) => p.plan === 'growth');
    const pro = planBreakdown.find((p) => p.plan === 'pro');
    const trial = planBreakdown.find((p) => p.plan === 'trial');
    assert.ok(growth, 'growth plan in breakdown');
    assert.equal(growth.count, 1);
    assert.ok(pro, 'pro plan in breakdown');
    assert.equal(pro.count, 1);
    assert.ok(trial, 'trial plan in breakdown');
    assert.equal(trial.count, 1);
});

test('GET /api/superadmin/dashboard — recentActivity items have correct shape', async () => {
    resetDb();
    seedDashboardData();
    const token = makeSuperAdminToken();
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    const { recentActivity } = res.body.data;
    assert.ok(recentActivity.length > 0, 'recentActivity has items');
    const item = recentActivity[0];
    assert.ok(Object.prototype.hasOwnProperty.call(item, 'id'));
    assert.ok(Object.prototype.hasOwnProperty.call(item, 'type'));
    assert.ok(Object.prototype.hasOwnProperty.call(item, 'label'));
    assert.ok(Object.prototype.hasOwnProperty.call(item, 'timestamp'));
    const validTypes = ['school_added', 'school_suspended', 'payment_received', 'plan_upgraded'];
    assert.ok(validTypes.includes(item.type), `type is one of ${validTypes.join(', ')}`);
    assert.doesNotThrow(() => new Date(item.timestamp).toISOString(), 'timestamp is valid ISO 8601');
});

test('GET /api/superadmin/dashboard — suspended school appears in recentActivity', async () => {
    resetDb();
    seedDashboardData();
    const token = makeSuperAdminToken();
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    const { recentActivity } = res.body.data;
    const suspended = recentActivity.find((a) => a.type === 'school_suspended');
    assert.ok(suspended, 'found a school_suspended item');
    assert.ok(suspended.label.includes('Oakwood Academy'), 'label mentions Oakwood Academy');
});

test('GET /api/superadmin/dashboard — mrrTrend has 6 months', async () => {
    resetDb();
    seedDashboardData();
    const token = makeSuperAdminToken();
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    const { mrrTrend } = res.body.data;
    assert.equal(mrrTrend.length, 6);
    for (const item of mrrTrend) {
        assert.equal(typeof item.month, 'string');
        assert.equal(typeof item.mrr, 'number');
    }
});

test('GET /api/superadmin/dashboard — mrrTrend values are correct', async () => {
    resetDb();
    seedDashboardData();
    const token = makeSuperAdminToken();
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    const { mrrTrend } = res.body.data;
    const last = mrrTrend[mrrTrend.length - 1];
    assert.equal(last.mrr, 1498);
    for (const item of mrrTrend) {
        assert.ok(item.mrr >= 0, `mrr for ${item.month} is >= 0`);
    }
});

test('GET /api/superadmin/dashboard — empty database', async () => {
    resetDb();
    const token = makeSuperAdminToken();
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.stats.totalSchools, 0);
    assert.equal(res.body.data.stats.totalRevenue, 0);
    assert.ok(Array.isArray(res.body.data.recentActivity));
    assert.ok(Array.isArray(res.body.data.mrrTrend));
});

test('GET /api/superadmin/dashboard — mrrTrend with only trial schools returns zeros', async () => {
    resetDb();
    db.schools = [
        { id: 't1', name: 'Trial School 1', plan: 'trial', is_active: true, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 't2', name: 'Trial School 2', plan: 'trial', is_active: true, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    ];
    const token = makeSuperAdminToken();
    const res = await request('/api/superadmin/dashboard', {
        headers: { Cookie: `schoolos_admin_token=${token}` },
    });
    const { mrrTrend } = res.body.data;
    for (const item of mrrTrend) {
        assert.equal(item.mrr, 0, `mrr for ${item.month} is 0`);
    }
});

