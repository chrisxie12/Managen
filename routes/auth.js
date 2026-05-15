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
        slug: z.string().optional().transform(v => v ? v.trim().toLowerCase() : ''),
    })
};

// ─── POST /api/auth/login ─────────────────────────────────────
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { email, password, subdomain: bodySubdomain, slug: bodySlug } = req.body;

        const subdomain = bodySlug || bodySubdomain || String(
            req.query?.slug ||
            req.query?.subdomain ||
            req.headers['x-tenant-subdomain'] || ''
        ).trim().toLowerCase();

        // Resolve school
        const school = req.tenant || (subdomain ? await authService.loadSchoolBySubdomain(subdomain) : null);
        if (!school) return invalidLogin(res);

        // Load user
        const user = await authService.getUserByEmailAndSchool(email, school.id);

        if (!user) return invalidLogin(res);
        if (user.is_active === false) return invalidLogin(res);
        if (!user.password) return invalidLogin(res);

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return invalidLogin(res);

        // Fetch permissions
        const permissions = await authService.getUserPermissions(user.id);

        // Sign JWT
        const token = jwt.sign(
            {
                kind:      'school',
                userId:    user.id,
                roleId:    user.role_id,
                role:      user.role,
                tenantId:  school.id,
                schoolId:  school.id,
                subdomain: school.slug,
                slug: school.slug,
                permissions: permissions,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.cookie('schoolos_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });

        return res.json({
            data: {
                message: 'Login successful',
                token,
                user: {
                    id:       user.id,
                    fullName: user.full_name,
                    email:    user.email,
                    roleId:   user.role_id,
                    permissions: permissions,
                },
                school: {
                    name:      school.name,
                    slug:      school.slug,
                    subdomain: school.slug,
                    plan:      school.plan,
                    modules:   school.modules,
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
        const token = req.cookies?.schoolos_token;
        if (!token) {
            return res.status(401).json({ error: 'No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const school = req.tenant || await authService.loadSchoolById(decoded.schoolId);
        if (!school) return res.status(404).json({ error: 'School not found.' });

        ensureMatchingTenant(decoded, school);

        const user = await authService.getUserById(decoded.userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const permissions = await authService.getUserPermissions(user.id);

        return res.json({
            data: {
                user: {
                    ...user,
                    permissions,
                },
                school: {
                    name:      school.name,
                    slug:      school.slug,
                    subdomain: school.slug,
                    plan:      school.plan,
                    modules:   school.modules,
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
    res.clearCookie('schoolos_token', { path: '/' });
    return res.json({ data: { message: 'Logged out successfully.' } });
});

module.exports = router;
