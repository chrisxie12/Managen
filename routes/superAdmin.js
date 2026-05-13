const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const supabase = require('../config/db');
const redis = require('../config/redis');
const {
    suspendSchool,
    reactivateSchool,
    PLAN_CATALOG,
} = require('../services/provisionService');

const SUPERADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const SUPERADMIN_MAX_ATTEMPTS = 5;
const MFA_SETUP_WINDOW_MS = 10 * 60 * 1000;

const parseInteger = (value, fallback, min = 1, max = 1000) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
};

// ─── Redis Resiliency Fallbacks ────────────────────────────────
const MEMORY_CACHE = {
    loginAttempts: new Map(),
    mfaSessions: new Map(),
    mfaConfig: new Map()
};

const isRedisHealthy = () => redis && redis.status === 'ready';

const cleanupMemoryCache = () => {
    const now = Date.now();
    for (const [key, val] of MEMORY_CACHE.loginAttempts.entries()) {
        if (val.resetAt < now) MEMORY_CACHE.loginAttempts.delete(key);
    }
    for (const [key, val] of MEMORY_CACHE.mfaSessions.entries()) {
        if (val.expiresAt < now) MEMORY_CACHE.mfaSessions.delete(key);
    }
};
const cleanupMemoryCacheTimer = setInterval(cleanupMemoryCache, 60 * 1000);
cleanupMemoryCacheTimer.unref?.();

const mapTenant = (tenant) => ({
    id: tenant.id,
    schoolName: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    slug: tenant.slug,
    subdomain: tenant.slug,
    plan: tenant.plan,
    status: tenant.is_active ? 'active' : 'suspended',
    modules: PLAN_CATALOG[tenant.plan]?.modules || [],
    maxStudents: PLAN_CATALOG[tenant.plan]?.maxStudents || null,
    trialEndsAt: null,
    createdAt: tenant.created_at,
});

const mapPayment = (payment) => ({
    id: payment.id,
    amount: payment.amount,
    paidAt: payment.paid_at || payment.created_at,
});

const sumPayments = (payments = []) => payments.reduce((total, payment) => total + Number(payment.amount || 0), 0);

const isBcryptHash = (value) => /^\$2[aby]\$/.test(String(value || ''));

const timingSafeStringEqual = (left, right) => {
    const leftBuffer = Buffer.from(String(left || ''));
    const rightValue = String(right || '');
    const normalizedRight = Buffer.from(rightValue.slice(0, leftBuffer.length).padEnd(leftBuffer.length, '\0'));

    if (!leftBuffer.length) return false;
    return crypto.timingSafeEqual(leftBuffer, normalizedRight);
};

const compareSecret = async (provided, stored) => {
    if (isBcryptHash(stored)) {
        return bcrypt.compare(String(provided || ''), String(stored || ''));
    }

    return timingSafeStringEqual(String(stored || ''), String(provided || ''));
};

const getLoginAttemptKey = (req, email) => `${String(email || '').toLowerCase()}:${req.ip || 'unknown'}`;

const getLoginAttemptState = async (key) => {
    try {
        if (isRedisHealthy()) {
            const redisKey = `superadmin:login_attempt:${key}`;
            const data = await redis.get(redisKey);
            if (data) return JSON.parse(data);
        } else {
            const inMem = MEMORY_CACHE.loginAttempts.get(key);
            if (inMem && inMem.resetAt > Date.now()) return inMem;
        }
        return { count: 0, resetAt: Date.now() + SUPERADMIN_LOGIN_WINDOW_MS };
    } catch (err) {
        console.error('Redis getLoginAttemptState error:', err);
        return { count: 0, resetAt: Date.now() + SUPERADMIN_LOGIN_WINDOW_MS };
    }
};

const recordFailedLogin = async (key) => {
    try {
        const current = await getLoginAttemptState(key);
        const next = { count: current.count + 1, resetAt: current.resetAt || (Date.now() + SUPERADMIN_LOGIN_WINDOW_MS) };
        
        if (isRedisHealthy()) {
            const redisKey = `superadmin:login_attempt:${key}`;
            const ttlSeconds = Math.max(1, Math.ceil((next.resetAt - Date.now()) / 1000));
            await redis.setex(redisKey, ttlSeconds, JSON.stringify(next));
        } else {
            MEMORY_CACHE.loginAttempts.set(key, next);
        }
        return next;
    } catch (err) {
        console.error('Redis recordFailedLogin error:', err);
        return { count: 1, resetAt: Date.now() + SUPERADMIN_LOGIN_WINDOW_MS };
    }
};

const clearLoginAttempts = async (key) => {
    try {
        if (isRedisHealthy()) {
            await redis.del(`superadmin:login_attempt:${key}`);
        } else {
            MEMORY_CACHE.loginAttempts.delete(key);
        }
    } catch (err) {
        console.error('Redis clearLoginAttempts error:', err);
    }
};

const setSecureAuthCookie = (res, token, name = 'schoolos_admin_token') => {
    res.cookie(name, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/api/superadmin',
    });
};

const readAuthCookie = (req, name = 'schoolos_admin_token') => {
    return req.cookies?.[name] || null;
};

const generateTOTPSecret = (email) => {
    return speakeasy.generateSecret({
        name: `SchoolOS Super Admin (${email})`,
        issuer: 'SchoolOS',
    });
};

const verifyTOTPToken = (secret, token, window = 2) => {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: String(token).trim(),
        window,
    });
};

const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 5; i++) {
        codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
};

const isBackupCode = (code, backedUpCodes) => {
    return backedUpCodes?.includes(String(code).toUpperCase());
};

const removeBackupCode = (code, backedUpCodes) => {
    return (backedUpCodes || []).filter(c => String(c).toUpperCase() !== String(code).toUpperCase());
};

// ─── Super Admin Auth Middleware ──────────────────────────────
const superAdminAuth = async (req, res, next) => {
    try {
        const token = readAuthCookie(req, 'schoolos_admin_token');
        if (!token) {
            return res.status(401).json({ error: 'No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.kind !== 'superadmin' || decoded.scope !== 'platform' || decoded.role !== 'superadmin') {
            return res.status(403).json({ error: 'Super admin access only.' });
        }

        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

const superAdminAuthOptional = async (req, res, next) => {
    try {
        const token = readAuthCookie(req, 'schoolos_admin_token');
        if (!token) {
            req.admin = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.kind === 'superadmin' && decoded.scope === 'platform' && decoded.role === 'superadmin') {
            req.admin = decoded;
        }
        next();
    } catch (err) {
        req.admin = null;
        next();
    }
};

// ─── POST /api/superadmin/mfa/setup ──────────────────────────
router.post('/mfa/setup', superAdminAuthOptional, async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({ error: 'You must be logged in to set up MFA.' });
        }

        const email = req.admin.email;
        const secret = generateTOTPSecret(email);
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
        const backups = generateBackupCodes();

        const setupKey = `superadmin:mfa_setup:${email}:${Date.now()}`;
        const mfaData = {
            secret: secret.base32,
            backups,
            createdAt: Date.now(),
            expiresAt: Date.now() + MFA_SETUP_WINDOW_MS
        };

        if (isRedisHealthy()) {
            await redis.setex(setupKey, Math.ceil(MFA_SETUP_WINDOW_MS / 1000), JSON.stringify(mfaData));
        } else {
            MEMORY_CACHE.mfaSessions.set(setupKey, mfaData);
        }

        return res.json({
            data: {
                qrCode,
                secret: secret.base32,
                backupCodes: backups,
                setupKey,
                message: 'Scan the QR code with your authenticator app, then verify with the code.',
            }
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error setting up MFA.' });
    }
});

// ─── POST /api/superadmin/mfa/confirm ────────────────────────
router.post('/mfa/confirm', superAdminAuthOptional, async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({ error: 'No authenticated session.' });
        }

        const { setupKey, code } = req.body;
        if (!setupKey || !code) {
            return res.status(400).json({ error: 'Setup key and verification code are required.' });
        }

        let mfaData;
        try {
            if (isRedisHealthy()) {
                const dataStr = await redis.get(setupKey);
                if (dataStr) mfaData = JSON.parse(dataStr);
            } else {
                mfaData = MEMORY_CACHE.mfaSessions.get(setupKey);
            }
        } catch (e) {}

        if (!mfaData || (mfaData.expiresAt && mfaData.expiresAt < Date.now())) {
            return res.status(400).json({ error: 'Setup key expired or invalid.' });
        }

        const isValid = verifyTOTPToken(mfaData.secret, code);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid verification code.' });
        }

        const config = { secret: mfaData.secret, backups: mfaData.backups };
        if (isRedisHealthy()) {
            await redis.set(`superadmin_mfa:${req.admin.email}`, JSON.stringify(config));
            await redis.del(setupKey);
        } else {
            MEMORY_CACHE.mfaConfig.set(req.admin.email, config);
            MEMORY_CACHE.mfaSessions.delete(setupKey);
        }

        return res.json({ data: { message: 'MFA enabled successfully.', backupCodes: mfaData.backups } });
    } catch (err) {
        return res.status(500).json({ error: 'Error confirming MFA.' });
    }
});

// ─── POST /api/superadmin/login ───────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const password = String(req.body?.password || '');
        const totpCode = String(req.body?.totpCode || '').trim();
        const backupCode = String(req.body?.backupCode || '').trim();
        const attemptKey = getLoginAttemptKey(req, email || 'superadmin');
        const attemptState = await getLoginAttemptState(attemptKey);

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        if (attemptState.count >= SUPERADMIN_MAX_ATTEMPTS) {
            const retryAfterSeconds = Math.max(1, Math.ceil((attemptState.resetAt - Date.now()) / 1000));
            res.set('Retry-After', String(retryAfterSeconds));
            return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
        }

        const configuredEmail = String(process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
        const configuredPassword = String(process.env.SUPER_ADMIN_PASSWORD || '');

        const emailMatches = timingSafeStringEqual(configuredEmail, email);
        if (!emailMatches) {
            await recordFailedLogin(attemptKey);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const passwordMatches = await compareSecret(password, configuredPassword);
        if (!passwordMatches) {
            await recordFailedLogin(attemptKey);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // ── MFA / TOTP check (if configured) ──
        let mfaConfig = null;
        try {
            if (isRedisHealthy()) {
                const dataStr = await redis.get(`superadmin_mfa:${email}`);
                if (dataStr) mfaConfig = JSON.parse(dataStr);
            } else {
                mfaConfig = MEMORY_CACHE.mfaConfig.get(email);
            }
        } catch (e) {}

        if (mfaConfig) {
            if (backupCode && isBackupCode(backupCode, mfaConfig.backups)) {
                const remaining = removeBackupCode(backupCode, mfaConfig.backups);
                mfaConfig.backups = remaining;
                if (isRedisHealthy()) {
                    await redis.set(`superadmin_mfa:${email}`, JSON.stringify(mfaConfig));
                } else {
                    MEMORY_CACHE.mfaConfig.set(email, mfaConfig);
                }
            } else if (totpCode && verifyTOTPToken(mfaConfig.secret, totpCode)) {
                // valid TOTP
            } else {
                await recordFailedLogin(attemptKey);
                return res.status(401).json({ error: 'Invalid or missing MFA code.' });
            }
        }

        await clearLoginAttempts(attemptKey);

        const token = jwt.sign(
            { kind: 'superadmin', scope: 'platform', role: 'superadmin', email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        setSecureAuthCookie(res, token, 'schoolos_admin_token');
        return res.json({ data: { message: 'Welcome, Super Admin!' } });
    } catch (err) {
        return res.status(500).json({ error: 'Login failed.' });
    }
});

// ─── POST /api/superadmin/logout ──────────────────────────────
router.post('/logout', (req, res) => {
    try {
        res.clearCookie('schoolos_admin_token', { path: '/api/superadmin' });
        return res.json({ data: { message: 'Logged out successfully.' } });
    } catch (err) {
        return res.status(500).json({ error: 'Logout failed.' });
    }
});

// ─── GET /api/superadmin/dashboard ───────────────────────────
router.get('/dashboard', superAdminAuth, async (req, res) => {
    try {
        const [totalSchools, activeSchools, suspended] = await Promise.all([
            supabase.from('schools').select('id', { count: 'exact', head: true }),
            supabase.from('schools').select('id', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('schools').select('id', { count: 'exact', head: true }).eq('is_active', false),
        ]);

        for (const result of [totalSchools, activeSchools, suspended]) {
            if (result.error) return res.status(400).json({ error: result.error.message });
        }

        const { data: paidPayments, error: paymentsError } = await supabase
            .from('payments')
            .select('amount');

        if (paymentsError) return res.status(400).json({ error: paymentsError.message });

        const { data: tenantPlans, error: plansError } = await supabase
            .from('schools')
            .select('plan');

        if (plansError) return res.status(400).json({ error: plansError.message });

        const planBreakdown = Object.values(
            tenantPlans.reduce((acc, tenant) => {
                const plan = tenant.plan || 'trial';
                acc[plan] = acc[plan] || { plan, count: 0 };
                acc[plan].count += 1;
                return acc;
            }, {})
        );

        return res.json({
            data: {
                stats: {
                    totalSchools: totalSchools.count || 0,
                    activeSchools: activeSchools.count || 0,
                    trialSchools: 0,
                    suspended: suspended.count || 0,
                    totalRevenue: sumPayments(paidPayments),
                },
                planBreakdown,
            }
        });
    } catch (err) {
        return res.status(500).json({ error: 'Dashboard error.' });
    }
});

// ─── GET /api/superadmin/schools ─────────────────────────────
router.get('/schools', superAdminAuth, async (req, res) => {
    try {
        const { status, plan, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (plan)   filter.plan   = plan;

        const currentPage = parseInteger(page, 1, 1, 1000000);
        const pageSize = parseInteger(limit, 20, 1, 100);

        let query = supabase
            .from('schools')
            .select('id, name, email, phone, slug, plan, is_active, created_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        if (filter.status === 'active' || filter.status === 'trial') query = query.eq('is_active', true);
        if (filter.status === 'suspended') query = query.eq('is_active', false);
        if (filter.plan) query = query.eq('plan', filter.plan);

        const { data: schools, count, error } = await query;

        if (error) return res.status(400).json({ error: error.message });

        return res.json({
            data: {
                schools: (schools || []).map(mapTenant),
                total: count || 0,
                page: currentPage,
                pages: Math.ceil((count || 0) / pageSize),
            }
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching schools.' });
    }
});

// ─── GET /api/superadmin/schools/:id ─────────────────────────
router.get('/schools/:id', superAdminAuth, async (req, res) => {
    try {
        const { data: school, error: schoolError } = await supabase
            .from('schools')
            .select('id, name, email, phone, slug, plan, is_active, created_at')
            .eq('id', req.params.id)
            .maybeSingle();

        if (schoolError) return res.status(400).json({ error: schoolError.message });
        if (!school) return res.status(404).json({ error: 'School not found.' });

        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('id, amount, paid_at, created_at')
            .order('paid_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

        if (paymentsError) return res.status(400).json({ error: paymentsError.message });

        return res.json({ data: { school: mapTenant(school), payments: (payments || []).map(mapPayment) } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching school.' });
    }
});

// ─── PUT /api/superadmin/schools/:id/suspend ─────────────────
router.put('/schools/:id/suspend', superAdminAuth, async (req, res) => {
    try {
        await suspendSchool(req.params.id);
        return res.json({ data: { message: 'School suspended successfully.' } });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.statusCode && err.statusCode < 500 ? err.message : 'Error suspending school.' });
    }
});

// ─── PUT /api/superadmin/schools/:id/reactivate ───────────────
router.put('/schools/:id/reactivate', superAdminAuth, async (req, res) => {
    try {
        const { plan } = req.body;
        if (!plan) return res.status(400).json({ error: 'Plan is required.' });
        if (!Object.prototype.hasOwnProperty.call(PLAN_CATALOG, String(plan).toLowerCase())) {
            return res.status(400).json({ error: 'Invalid plan selected.' });
        }
        await reactivateSchool(req.params.id, plan);
        return res.json({ data: { message: 'School reactivated successfully.' } });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.statusCode && err.statusCode < 500 ? err.message : 'Error reactivating school.' });
    }
});

// ─── GET /api/superadmin/payments ────────────────────────────
router.get('/payments', superAdminAuth, async (req, res) => {
    try {
        const { data: payments, error } = await supabase
            .from('payments')
            .select('id, amount, paid_at, created_at')
            .order('paid_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) return res.status(400).json({ error: error.message });

        return res.json({ data: { payments: (payments || []).map(mapPayment) } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching payments.' });
    }
});

module.exports = router;





