const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.TENANT_BASE_URL = process.env.TENANT_BASE_URL || 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';
process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000';

const db = {
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
        const table = db[this.table] || [];

        if (this.mode === 'insert') {
            const inserted = this.payload.map((item) => {
                const row = clone(item);
                if (!row.id) row.id = `${this.table}_${idSequence++}`;
                if (!row.created_at) row.created_at = new Date().toISOString();
                if (this.table === 'tenants' && !row.status) row.status = 'trial';
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

test.before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.beforeEach(resetDb);

test.after(async () => {
    await new Promise((resolve) => server.close(resolve));
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
    assert.ok(plans.body.data.plans.some((plan) => plan.name === 'premium'));
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

