const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const authService = require('../services/authService');
const { z } = require('zod');
const { validate } = require('../middleware/validate');

// ─── Helpers ──────────────────────────────────────────────────

const ensureMatchingTenant = (decoded, tenant) => {
    if (decoded?.tenantId && tenant?.id && decoded.tenantId !== tenant.id) {
        const err = new Error('Token does not match the requested school.');
        err.statusCode = 403;
        throw err;
    }
};

const invalidLogin = (res) =>
    res.status(401).json({ error: 'Invalid email, password, or school.' });

// ─── Zod Schemas ──────────────────────────────────────────────
const loginSchema = {
    body: z.object({
        email: z.string().email('Invalid email format.').transform(v => v.trim().toLowerCase()),
        password: z.string().min(1, 'Password is required.'),
        subdomain: z.string().optional().transform(v => v ? v.trim().toLowerCase() : ''),
    })
};

// ─── POST /api/auth/login ─────────────────────────────────────
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { email, password, subdomain: bodySubdomain } = req.body;
        
        const subdomain = bodySubdomain || String(
            req.query?.subdomain ||
            req.headers['x-tenant-subdomain'] || ''
        ).trim().toLowerCase();

        // Resolve tenant
        const tenant = req.tenant || (subdomain ? await authService.loadTenantBySubdomain(subdomain) : null);
        if (!tenant) return invalidLogin(res);

        // Load user — explicitly select password so bcrypt can compare
        const user = await authService.getUserByEmailAndTenant(email, tenant.id);

        if (!user) return invalidLogin(res);
        if (!user.is_active) return invalidLogin(res);
        if (!user.password) return invalidLogin(res);

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return invalidLogin(res);

        // Sign JWT
        const token = jwt.sign(
            {
                kind:      'tenant',
                userId:    user.id,
                role:      user.role,
                tenantId:  tenant.id,
                subdomain: tenant.subdomain,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.cookie('schoolos_tenant_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });

        return res.json({
            data: {
                message: 'Login successful',
                token,
                user: {
                    id:    user.id,
                    name:  user.name,
                    email: user.email,
                    role:  user.role,
                },
                school: {
                    name:    tenant.school_name,
                    subdomain: tenant.subdomain,
                    plan:    tenant.plan,
                    modules: tenant.modules,
                },
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(err.statusCode || 500).json({
            error: err.statusCode && err.statusCode < 500 ? err.message : 'Login failed.',
        });
    }
});

// ─── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies?.schoolos_tenant_token;
        if (!token) {
            return res.status(401).json({ error: 'No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const tenant = req.tenant || await authService.loadTenantById(decoded.tenantId);
        if (!tenant) return res.status(404).json({ error: 'School not found.' });

        ensureMatchingTenant(decoded, tenant);

        const user = await authService.getUserById(decoded.userId);

        if (!user) return res.status(404).json({ error: 'User not found.' });

        return res.json({
            data: {
                user,
                school: {
                    name:    tenant.school_name,
                    plan:    tenant.plan,
                    modules: tenant.modules,
                },
            }
        });
    } catch (err) {
        console.error('Me error:', err);
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
});

// ─── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', (req, res) => {
    res.clearCookie('schoolos_tenant_token', { path: '/' });
    return res.json({ data: { message: 'Logged out successfully.' } });
});

module.exports = router;