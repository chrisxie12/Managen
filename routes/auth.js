const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const authService = require('../services/authService');
const { sendPasswordReset, sendEmailVerification } = require('../services/emailService');
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

// ─── POST /api/auth/forgot-password ──────────────────────────
router.post('/forgot-password', async (req, res) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const subdomain = String(req.body?.subdomain || '').trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        const school = subdomain ? await authService.loadSchoolBySubdomain(subdomain) : null;
        const user = school
            ? await authService.getUserByEmailAndSchool(email, school.id)
            : await authService.getUserByEmail(email);

        if (!user) {
            return res.json({ data: { message: 'If an account exists, a reset link has been sent.' } });
        }

        const token = crypto.randomBytes(32).toString('hex');
        await authService.setPasswordResetToken(user.id, token);

        const frontendUrl = process.env.TENANT_BASE_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/auth?mode=reset-password&token=${token}`;

        if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
            await sendPasswordReset({ to: email, name: user.full_name, resetLink });
        }

        return res.json({ data: { message: 'If an account exists, a reset link has been sent.' } });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.json({ data: { message: 'If an account exists, a reset link has been sent.' } });
    }
});

// ─── POST /api/auth/reset-password ───────────────────────────
router.post('/reset-password', async (req, res) => {
    try {
        const token = String(req.body?.token || '').trim();
        const newPassword = String(req.body?.password || '');

        if (!token || !newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Valid token and password (min 6 chars) are required.' });
        }

        const user = await authService.getUserByResetToken(token);
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await authService.updatePassword(user.id, hashedPassword);

        return res.json({ data: { message: 'Password reset successfully. You can now sign in.' } });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ error: 'Failed to reset password.' });
    }
});

// ─── POST /api/auth/verify-email ─────────────────────────────
router.post('/verify-email', async (req, res) => {
    try {
        const token = String(req.body?.token || '').trim();
        if (!token) {
            return res.status(400).json({ error: 'Verification token is required.' });
        }

        const user = await authService.getUserByResetToken(token);
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token.' });
        }

        await authService.verifyUserEmail(user.id);

        return res.json({ data: { message: 'Email verified successfully.' } });
    } catch (err) {
        console.error('Verify email error:', err);
        return res.status(500).json({ error: 'Failed to verify email.' });
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
        if (!school) {
            res.clearCookie('schoolos_token', { path: '/' });
            return res.status(401).json({ error: 'Invalid token: school not found.' });
        }

        ensureMatchingTenant(decoded, school);

        const user = await authService.getUserById(decoded.userId);
        if (!user) {
            res.clearCookie('schoolos_token', { path: '/' });
            return res.status(401).json({ error: 'Invalid token: user not found.' });
        }

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
