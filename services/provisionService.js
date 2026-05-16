const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const supabase = require('../config/db');

const PLAN_CATALOG = {
    trial: {
        name: 'trial',
        displayName: 'Free Trial',
        price: 0,
        maxStudents: 50,
        modules: ['attendance', 'fees'],
        durationDays: 7,
    },
    growth: {
        name: 'growth',
        displayName: 'Growth',
        price: 499,
        maxStudents: 300,
        modules: ['attendance', 'fees', 'exams', 'admissions'],
        durationDays: null,
    },
    pro: {
        name: 'pro',
        displayName: 'Pro',
        price: 999,
        maxStudents: 800,
        modules: ['attendance', 'fees', 'exams', 'admissions', 'library', 'hostel', 'transport', 'payroll', 'chat'],
        durationDays: null,
    },
    enterprise: {
        name: 'enterprise',
        displayName: 'Enterprise',
        price: null,
        maxStudents: null,
        modules: ['all'],
        durationDays: null,
    },
};

const RESERVED_SUBDOMAINS = new Set(['app', 'api', 'www', 'admin', 'mail']);

const slugifySchoolName = (schoolName) => {
    const base = String(schoolName || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20);

    return base || 'school';
};

const getPlanConfig = (plan = 'trial') => {
    const key = String(plan || 'trial').toLowerCase();
    return PLAN_CATALOG[key] || PLAN_CATALOG.trial;
};

const getPublicPlans = () => Object.values(PLAN_CATALOG).map(({ durationDays, ...plan }) => ({
    ...plan,
    trialDays: durationDays,
}));

const buildTenantLoginUrl = (subdomain) => {
    const baseUrl = (process.env.TENANT_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    return `${baseUrl}/login?subdomain=${encodeURIComponent(subdomain)}`;
};

const toTenantResponse = (tenant) => ({
    ...tenant,
    id: tenant.id,
    tenantId: tenant.id,
    schoolName: tenant.name,
    plan: tenant.plan,
    isActive: tenant.is_active,
});

const normalizeError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const cleanupProvisioning = async ({ tenantId, authUserId }) => {
    const cleanupTasks = [];

    if (authUserId) {
        cleanupTasks.push(supabase.auth.admin.deleteUser(authUserId));
    }

    if (tenantId) {
        cleanupTasks.push(supabase.from('schools').delete().eq('id', tenantId));
    }

    const results = await Promise.allSettled(cleanupTasks);
    for (const result of results) {
        if (result.status === 'rejected') {
            console.error('Provisioning cleanup error:', result.reason?.message || result.reason);
        }
    }
};

const generateSubdomain = async (schoolName) => {
    let base = slugifySchoolName(schoolName);
    if (RESERVED_SUBDOMAINS.has(base)) {
        base = `school${base}`;
    }
    let candidate = base;

    for (let attempt = 0; attempt < 50; attempt += 1) {
        const { data, error } = await supabase
            .from('schools')
            .select('id')
            .eq('slug', candidate)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return candidate;
        }

        candidate = `${base}${attempt + 1}`;
    }

    throw normalizeError('Unable to generate a unique subdomain.', 409);
};

const provisionSchool = async ({
    schoolName,
    email,
    phone,
    adminName,
    adminPassword,
    plan = 'trial',
}) => {
    if (!schoolName || !email || !adminName || !adminPassword) {
        throw normalizeError('schoolName, email, adminName, and adminPassword are required.', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanSchoolName = String(schoolName).trim();
    const cleanAdminName = String(adminName).trim();
    const cleanPhone = phone ? String(phone).trim() : null;
    const planConfig = getPlanConfig(plan);

    const { data: existingTenant, error: existingTenantError } = await supabase
        .from('schools')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (existingTenantError) {
        throw existingTenantError;
    }

    if (existingTenant) {
        throw normalizeError('A school with this email already exists.', 409);
    }

    const slug = await generateSubdomain(cleanSchoolName);
    const passwordHash = await bcrypt.hash(String(adminPassword), 12);
    const trialEndsAt = planConfig.durationDays
        ? new Date(Date.now() + planConfig.durationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const tenantPayload = {
        id: crypto.randomUUID(),
        name: cleanSchoolName,
        email: normalizedEmail,
        phone: cleanPhone,
        slug,
        plan: planConfig.name,
        is_active: true,
    };

    const { data: tenant, error: tenantError } = await supabase
        .from('schools')
        .insert(tenantPayload)
        .select('*')
        .single();

    if (tenantError) {
        throw tenantError;
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: cleanAdminName, schoolName: cleanSchoolName }
    });

    if (authError) {
        await cleanupProvisioning({ tenantId: tenant.id });
        throw authError;
    }

    if (!authUser?.user?.id) {
        await cleanupProvisioning({ tenantId: tenant.id });
        throw normalizeError('Supabase Auth user was not created.', 502);
    }

    const { data: adminRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'school_admin')
        .maybeSingle();

    const userPayload = {
        id: authUser.user.id,
        school_id: tenant.id,
        full_name: cleanAdminName,
        email: normalizedEmail,
        password: passwordHash, 
        role: 'admin',
        role_id: adminRole?.id || null,
        is_active: true,
    };
    const { data: adminUser, error: userError } = await supabase
        .from('users')
        .upsert(userPayload)
        .select('id, full_name, email, role, role_id')
        .single();

    if (userError) {
        await cleanupProvisioning({ tenantId: tenant.id, authUserId: authUser.user.id });
        throw userError;
    }

    return {
        tenant: toTenantResponse(tenant),
        adminUser,
        slug,
        loginUrl: buildTenantLoginUrl(slug),
        plan: planConfig,
    };
};

const suspendSchool = async (tenantId) => {
    if (!tenantId) {
        throw normalizeError('tenantId is required.', 400);
    }

    const { data, error } = await supabase
        .from('schools')
        .update({ is_active: false })
        .eq('id', tenantId)
        .select('id, is_active')
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw normalizeError('School not found.', 404);
    }

    return data;
};

const reactivateSchool = async (tenantId, plan = 'growth') => {
    if (!tenantId) {
        throw normalizeError('tenantId is required.', 400);
    }

    const { data, error } = await supabase
        .from('schools')
        .update({ is_active: true, plan })
        .eq('id', tenantId)
        .select('id, is_active, plan')
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw normalizeError('School not found.', 404);
    }

    return data;
};

module.exports = {
    PLAN_CATALOG,
    slugifySchoolName,
    getPlanConfig,
    getPublicPlans,
    buildTenantLoginUrl,
    toTenantResponse,
    generateSubdomain,
    provisionSchool,
    suspendSchool,
    reactivateSchool,
};
