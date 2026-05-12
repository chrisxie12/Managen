const express  = require('express');
const router   = express.Router();
const supabase = require('../config/db');
const axios    = require('axios');
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
                if (email && process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
                    promises.push(emailService.sendWelcome({ to: email, name: adminName, schoolName }));
                }
                if (phone && process.env.ARKESEL_API_KEY) {
                    promises.push(smsService.sendWelcome({ to: phone, name: adminName, schoolName }));
                }
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

// ─── POST /api/onboard/demo-request ───────────────────────────
router.post('/demo-request', async (req, res) => {
    try {
        const name = String(req.body?.name || '').trim();
        const email = String(req.body?.email || '').trim().toLowerCase();
        const schoolName = String(req.body?.schoolName || '').trim();
        const country = String(req.body?.country || 'Ghana').trim();
        const message = String(req.body?.message || '').trim();
        const variant = String(req.body?.variant || '').trim();
        const source = String(req.body?.source || 'landing_demo_modal').trim();
        const requestedAt = req.body?.createdAt ? String(req.body.createdAt) : null;

        if (!name || !email || !schoolName) {
            return res.status(400).json({
                error: 'name, email, and schoolName are required.',
            });
        }

        const { data: lead, error } = await supabase
            .from('demo_leads')
            .insert({
                name,
                email,
                school_name: schoolName,
                country,
                message: message || null,
                source: source || null,
                variant: variant || null,
                metadata: requestedAt ? { requestedAt } : {},
            })
            .select('id, created_at')
            .single();

        if (error) {
            console.error('Demo lead insert error:', error);
            return res.status(500).json({ error: 'Failed to store demo request.' });
        }

        const demoWebhookUrl = process.env.DEMO_WEBHOOK_URL;
        if (demoWebhookUrl) {
            setImmediate(async () => {
                try {
                    await axios.post(
                        demoWebhookUrl,
                        {
                            leadId: lead.id,
                            name,
                            email,
                            schoolName,
                            country,
                            message,
                            variant,
                            source,
                            createdAt: lead.created_at,
                            requestedAt,
                        },
                        {
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 8000,
                        }
                    );
                } catch (webhookError) {
                    console.error('Demo webhook forwarding error:', webhookError?.message || webhookError);
                }
            });
        }

        return res.status(201).json({
            data: {
                message: 'Demo request received.',
                leadId: lead.id,
            },
        });
    } catch (err) {
        console.error('Demo request error:', err);
        return res.status(500).json({ error: 'Failed to submit demo request.' });
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
            .from('schools')
            .select('id')
            .eq('slug', subdomain)
            .maybeSingle();

        if (error) {
            console.error('Check subdomain error:', error);
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
