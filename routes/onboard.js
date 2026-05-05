const express  = require('express');
const router   = express.Router();
const supabase = require('../config/db');
const { provisionSchool, getPublicPlans } = require('../services/provisionService');

// ─── POST /api/onboard/signup ─────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { schoolName, email, phone, adminName, adminPassword, plan } = req.body;

        if (!schoolName || !email || !adminName || !adminPassword) {
            return res.status(400).json({
                error: 'schoolName, email, adminName and adminPassword are required.',
            });
        }

        const result = await provisionSchool({
            schoolName,
            email,
            phone,
            adminName,
            adminPassword,
            plan: plan || 'trial',
        });

        // Fire-and-forget welcome notifications
        setImmediate(async () => {
            try {
                const emailService    = require('../services/emailService');
                const smsService      = require('../services/smsService');
                const whatsappService = require('../services/whatsappService');

                const promises = [];
                if (email) promises.push(emailService.sendWelcome({ to: email, name: adminName, schoolName }));
                if (phone)  promises.push(smsService.sendWelcome({ to: phone, name: adminName, schoolName }));
                if (
                    phone &&
                    process.env.TWILIO_ACCOUNT_SID &&
                    process.env.TWILIO_AUTH_TOKEN &&
                    process.env.TWILIO_WHATSAPP_FROM
                ) {
                    promises.push(whatsappService.sendWelcome({ to: phone, name: adminName, schoolName }));
                }

                await Promise.allSettled(promises);
            } catch (err) {
                console.error('Onboard notifications error:', err);
            }
        });

        return res.status(201).json({
            data: {
                message:     'School created successfully!',
                loginUrl:    result.loginUrl,
                subdomain:   result.subdomain,
                tenantId:    result.tenant.id,
                plan:        result.tenant.plan,
                trialEndsAt: result.tenant.trialEndsAt,
            }
        });
    } catch (err) {
        console.error('Onboard error:', err);
        return res.status(err.statusCode || 500).json({
            error: err.statusCode && err.statusCode < 500 ? err.message : 'Failed to create school.',
        });
    }
});

// ─── GET /api/onboard/check-subdomain/:subdomain ──────────────
router.get('/check-subdomain/:subdomain', async (req, res) => {
    try {
        const subdomain = String(req.params.subdomain || '').trim().toLowerCase();

        if (!subdomain) {
            return res.status(400).json({ error: 'Subdomain is required.' });
        }

        const { data, error } = await supabase
            .from('tenants')
            .select('id')
            .eq('subdomain', subdomain)
            .maybeSingle();

        if (error) {
            return res.status(500).json({ error: 'Error checking subdomain.' });
        }

        return res.json({ data: { available: !data } });
    } catch (err) {
        console.error('Check subdomain error:', err);
        return res.status(500).json({ error: 'Error checking subdomain.' });
    }
});

// ─── GET /api/onboard/plans ───────────────────────────────────
router.get('/plans', (req, res) => {
    try {
        return res.json({ data: { plans: getPublicPlans() } });
    } catch (err) {
        console.error('Plans error:', err);
        return res.status(500).json({ error: 'Error fetching plans.' });
    }
});

module.exports = router;