const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const feeReminderService = require('../services/feeReminderService');

const getCronSecret = () => process.env.CRON_SECRET || process.env.WEBHOOK_SECRET_SALT || '';

const isAuthorized = (req) => {
    const secret = getCronSecret();
    if (!secret) return false;

    const headerSecret = req.headers['x-cron-secret'];
    if (headerSecret && headerSecret === secret) return true;

    const auth = String(req.headers.authorization || '').trim();
    if (auth.toLowerCase().startsWith('bearer ')) {
        const token = auth.slice(7).trim();
        return token === secret;
    }

    return false;
};

const parseInteger = (value, fallback, min = 1, max = 1000) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
};

// POST /api/cron/fees/reminders/send
router.post('/fees/reminders/send', async (req, res) => {
    try {
        if (!isAuthorized(req)) {
            return res.status(401).json({ error: 'Unauthorized cron request.' });
        }

        const dryRun = Boolean(req.body?.dryRun);
        const limit = parseInteger(req.body?.limit, 100, 1, 500);
        const subdomain = String(req.body?.subdomain || '').trim().toLowerCase() || null;

        let schools = [];
        if (subdomain) {
            const { data, error } = await supabase
                .from('schools')
                .select('id, name, slug, is_active')
                .eq('slug', subdomain)
                .maybeSingle();

            if (error) return res.status(500).json({ error: 'Error loading school.' });
            if (!data) return res.status(404).json({ error: 'School not found.' });
            schools = [data];
        } else {
            const { data, error } = await supabase
                .from('schools')
                .select('id, name, slug, is_active')
                .eq('is_active', true);

            if (error) return res.status(500).json({ error: 'Error loading schools.' });
            schools = data || [];
        }

        const results = [];
        for (const school of schools) {
            const tenant = {
                id: school.id,
                school_name: school.name,
                slug: school.slug,
            };

            const summary = await feeReminderService.sendDueFeeReminders({
                tenant,
                actorId: null,
                limit,
                dryRun,
            });

            results.push({
                schoolId: school.id,
                subdomain: school.slug,
                ...summary,
            });
        }

        return res.json({
            data: {
                totalSchools: schools.length,
                dryRun,
                results,
            },
        });
    } catch (err) {
        console.error('Cron fee reminder error:', err);
        return res.status(500).json({ error: 'Cron fee reminder failed.' });
    }
});

module.exports = router;
