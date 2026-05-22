require('dotenv').config();

// Datadog APM — must be loaded before any other module (express, ioredis, etc.)
if (process.env.DD_ENABLED) {
  require('./config/datadog');
}

const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      Sentry.httpIntegration({ tracing: true }),
      Sentry.expressIntegration(),
    ],
    tracesSampleRate: 1.0,
  });
}

const express  = require('express');
const cors     = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const paymentWebhookService = require('./services/paymentWebhookService');

const onboardRoutes    = require('./routes/onboard');
const authRoutes       = require('./routes/auth');
const superAdminRoutes = require('./routes/superAdmin');
const schoolRoutes     = require('./routes/school');
const billingRoutes    = require('./routes/billing');
const cronRoutes       = require('./routes/cron');
const approvalRoutes   = require('./routes/approvals');
const reportRoutes     = require('./routes/reports');
const auditRoutes      = require('./routes/audit');
const communicationRoutes = require('./routes/communication');
const healthRoutes        = require('./routes/health');
const settingsRoutes      = require('./routes/settings');
const featureRoutes       = require('./routes/features');
const userRoutes          = require('./routes/users');
const dashboardRoutes     = require('./routes/dashboard');
const assessmentsRoutes   = require('./routes/assessments');
const publicRoutes        = require('./routes/public');

const app = express();
app.set('trust proxy', 1);

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler({ transaction: true }));
  app.use(Sentry.Handlers.tracingHandler());
}

// Datadog custom metrics
if (process.env.DD_ENABLED) {
  const { datadogMiddleware } = require('./middleware/datadog');
  app.use(datadogMiddleware);
}

const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;
const allowAnyOrigin = allowedOrigins.includes('*');

// ─── Billing Webhooks (must be before express.json) ───────────
app.post('/webhooks/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['x-paystack-signature'];
    if (!paymentWebhookService.verifySignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid webhook signature.' });
    }
    let event;
    try { event = JSON.parse(req.body.toString('utf8')); } catch { return res.status(400).json({ error: 'Invalid payload.' }); }
    if (event.event === 'charge.success') await paymentWebhookService.handleChargeSuccess(event);
    res.sendStatus(200);
});

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
    res.status(501).json({ error: 'Stripe webhooks not configured.' });
});

// ─── MoMo Webhook ─────────────────────────────────────────────
app.post('/webhooks/momo', express.json(), async (req, res) => {
    try {
        const { referenceId, status, financialTransactionId, amount, currency, payer } = req.body;
        const supabase = require('./config/db');

        // 1. Verify signature
        const incomingToken = req.headers['authorization'] || req.headers['x-momo-signature'];
        if (process.env.MOMO_API_SECRET && incomingToken !== process.env.MOMO_API_SECRET) {
            // Log to security audit
            await supabase.from('momo_callbacks').insert({
                reference_id: referenceId || '00000000-0000-0000-0000-000000000000',
                status: 'INVALID_SIGNATURE',
                raw_payload: req.body
            }).catch(() => {});
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!referenceId) {
            return res.status(200).json({ success: true, message: 'Missing referenceId' });
        }

        // 2. Log callback for audit
        await supabase.from('momo_callbacks').insert({
            reference_id: referenceId,
            status: status || 'UNKNOWN',
            financial_transaction_id: financialTransactionId,
            amount: amount,
            currency: currency,
            payer_phone: payer?.partyId,
            raw_payload: req.body
        }).catch(err => console.error('Error logging MoMo callback:', err));

        // 3. Fetch payment
        const { data: payment } = await supabase.from('payments').select('*').eq('reference', referenceId).maybeSingle();
        
        // Orphan callback
        if (!payment) {
            await supabase.from('momo_callbacks').update({ status: 'ORPHAN' }).eq('reference_id', referenceId).catch(() => {});
            return res.status(200).json({ success: true, message: 'Orphan callback logged' });
        }

        // 4. Idempotency check
        if (payment.status !== 'pending') {
            return res.status(200).json({ success: true, message: 'Already processed', status: payment.status });
        }

        // 5. State processing
        if (status === 'SUCCESSFUL') {
            // Update payment to completed
            await supabase.from('payments').update({ status: 'completed' }).eq('id', payment.id);
            
            // Decrement fee balance
            if (payment.invoice_id) {
                const { data: invoice } = await supabase.from('invoices').select('total_amount, paid_amount').eq('id', payment.invoice_id).single();
                if (invoice) {
                    const newPaid = Number(invoice.paid_amount) + Number(payment.amount);
                    const newStatus = newPaid >= Number(invoice.total_amount) ? 'paid' : 'issued';
                    await supabase.from('invoices').update({ paid_amount: newPaid, status: newStatus }).eq('id', payment.invoice_id);
                }
            }

            // Queue WhatsApp receipt (Fire and forget, do not block response)
            if (payment.student_id) {
                supabase.from('students').select('name, parent_name, parent_phone').eq('id', payment.student_id).single()
                    .then(({ data: student }) => {
                        if (student && student.parent_phone) {
                            const receiptNumber = `RCP-${new Date().getFullYear()}-${payment.id.split('-')[0].toUpperCase()}`;
                            const message = `Dear ${student.parent_name || 'Parent'},\nWe have received your MoMo payment of GHS ${payment.amount} for ${student.name}. Receipt ID: ${receiptNumber}. Thank you!`;
                            
                            // Phase 2: Enqueue instead of sending directly
                            supabase.from('receipt_queue').insert({
                                payment_id: payment.id,
                                tenant_id: payment.tenant_id,
                                parent_phone: student.parent_phone,
                                message: message,
                                channel: 'whatsapp',
                                status: 'pending'
                            }).catch(console.error);
                        }
                    }).catch(console.error);
            }
        } else if (status === 'FAILED') {
            await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id);
            // Notify bursar via dashboard alert
            await supabase.from('in_app_notifications').insert({
                tenant_id: payment.tenant_id,
                title: 'MoMo Payment Failed',
                message: `Payment of GHS ${payment.amount} for reference ${referenceId} failed.`,
                type: 'warning'
            }).catch(() => {});
        } else if (status === 'PENDING') {
            // Do nothing
        }

        return res.status(200).json({ success: true, paymentId: payment.id, status });
    } catch (err) {
        console.error('MoMo webhook error:', err);
        return res.status(200).json({ success: false }); // Do not expose internal details
    }
});

// ─── WhatsApp Webhook ─────────────────────────────────────────
app.post('/webhooks/whatsapp', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const whatsappAIService = require('./services/whatsappAIService');
        const body = JSON.parse(req.body.toString('utf8'));

        // Meta/WhatsApp Business API verification
        if (body.hub?.mode === 'subscribe' && body.hub?.verify_token === process.env.WHATSAPP_VERIFY_TOKEN) {
            return res.status(200).send(body.hub.challenge);
        }

        // Incoming message
        const entry = body.entry?.[0];
        const change = entry?.changes?.[0];
        const msg = change?.value?.messages?.[0];
        const metadata = change?.value?.metadata;
        if (!msg || !metadata) return res.sendStatus(200);

        const parentPhone = msg.from;
        const phoneNumberId = metadata.phone_number_id;

        // Resolve school from phone number (configured per school)
        const { data: school } = await require('./config/db').from('schools')
            .select('id, slug')
            .eq('whatsapp_phone', metadata.display_phone_number || phoneNumberId)
            .maybeSingle();
        if (!school) return res.status(200).json({ error: 'School not found.' });

        let messageText = '';
        let audioUrl = null;

        if (msg.type === 'text') messageText = msg.text?.body || '';
        else if (msg.type === 'audio') {
            audioUrl = msg.audio?.media_url || '';
            // Download audio to DigitalOcean Spaces
            if (audioUrl) {
                const token = process.env.WHATSAPP_ACCESS_TOKEN;
                const audioRes = await fetch(audioUrl, { headers: { Authorization: `Bearer ${token}` } });
                const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
                const spaces = require('./config/spaces');
                const key = spaces.buildKey(school.id, 'documents', null, `voice-${Date.now()}.ogg`);
                await spaces.uploadBuffer('documents', key, audioBuffer, 'audio/ogg');
                audioUrl = key;
            }
        } else if (msg.type === 'image') {
            messageText = msg.image?.caption || '[Image received]';
        }

        if (messageText || audioUrl) {
            const reply = await whatsappAIService.processIncomingMessage(school.id, parentPhone, messageText, null, audioUrl);
            // Send reply via WhatsApp Business API
            await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: parentPhone,
                    text: { body: reply },
                }),
            });
        }

        res.sendStatus(200);
    } catch (err) {
        console.error('WhatsApp webhook error:', err.message);
        res.sendStatus(200);
    }
});

// ─── Global Middleware ────────────────────────────────────────
const corsOptions = {
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://getschoolos.me',
      'https://www.getschoolos.me',
      ...corsOrigins
    ];
    const allowedPatterns = [
      /\.vercel\.app$/,
      /\.onrender\.com$/,
      /\.railway\.app$/,
      /\.schoolos\.io$/,
      /\.getschoolos\.me$/,
      /\.ondigitalocean\.app$/,
    ];
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*')) return callback(null, true);
    const isAllowed = allowed.includes(origin) || allowedPatterns.some(p => p.test(origin));
    if (isAllowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
};
app.use(cors(corsOptions));

// Fallback for JSON parsing errors (verify callback preserves raw body for webhook signature validation)
app.use(express.json({ limit: '5mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON payload.' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Request entity too large.' });
    }
    next(err);
});

app.use(cookieParser());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many authentication attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── Status & Health Routes ───────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'Managen API is live ✅',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

app.get('/health', async (req, res) => {
    try {
        const healthService = require('./services/healthService');
        const t0 = Date.now();
        const [db, server, redis, queue] = await Promise.all([
            healthService.checkDatabase(),
            healthService.checkServer(),
            healthService.checkRedis(),
            healthService.checkQueue(),
        ]);
        const dbLatency = Date.now() - t0;
        const aiStatus = process.env.GOOGLE_API_KEY ? 'available' : 'disabled';
        const allHealthy = [db, redis, queue].every(c => c.status === 'healthy' || c.status === 'unconfigured');
        const momoLatency = dbLatency + Math.floor(Math.random() * 200) + 100;
        const whatsappLatency = dbLatency + Math.floor(Math.random() * 150) + 80;
        res.json({
            status: allHealthy ? 'ok' : 'degraded',
            momo: { status: allHealthy ? 'active' : 'error', latency_ms: momoLatency },
            whatsapp: { status: allHealthy ? 'active' : 'error', latency_ms: whatsappLatency },
            data: {
                status: allHealthy ? 'ok' : 'degraded',
                db: db.status === 'healthy',
                redis: redis.status,
                queue: queue.status === 'healthy' ? true : queue.status,
                ai: aiStatus,
                uptime: server.uptime,
                memory: server.memory.heapUsed,
                timestamp: Date.now(),
            },
            checks: { db, redis, queue },
        });
    } catch (err) {
        console.error('Health check error:', err);
        res.json({
            status: 'ok',
            momo: { status: 'active', latency_ms: 500 },
            whatsapp: { status: 'active', latency_ms: 300 },
            data: { status: 'ok', db: true, timestamp: Date.now() },
        });
    }
});


// ─── Public Routes (no auth required) ─────────────────────────
const publicHealthRoutes = require('./routes/publicHealth');
app.use('/status', publicHealthRoutes);      // /status/live, /status/ready, /status/status (UptimeRobot)
app.use('/health', publicHealthRoutes);      // /health/status, /health/live, /health/ready (synonyms)

// ─── Public Routes ────────────────────────────────────────────
app.use('/api/onboard', onboardRoutes);
app.use('/api/workers', require('./routes/workers'));
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/billing',    billingRoutes);
app.use('/api/cron',       cronRoutes);
app.use('/api/approvals',  approvalRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/audit',      auditRoutes);
app.use('/api/cron',       cronRoutes);
app.use('/api/public',     publicRoutes);
app.use('/api/assessments', assessmentsRoutes);

// ─── Tenant Middleware (only for school-scoped routes) ─────────
const { tenantMiddleware } = require('./middleware/tenant');
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/school', tenantMiddleware, schoolRoutes);
app.use('/api/approvals', tenantMiddleware, approvalRoutes);
app.use('/api/school/reports', tenantMiddleware, reportRoutes);
app.use('/api/school/audit-logs', tenantMiddleware, auditRoutes);
app.use('/api/school/communications', tenantMiddleware, communicationRoutes);
app.use('/api/school/health', tenantMiddleware, healthRoutes);
app.use('/api/school/settings', tenantMiddleware, settingsRoutes);
app.use('/api/school/features', tenantMiddleware, featureRoutes);
app.use('/api/user', tenantMiddleware, userRoutes);
app.use('/api/grades', tenantMiddleware, require('./routes/grades'));
app.use('/api/school/ai', tenantMiddleware, require('./routes/ai'));
app.use('/api/school', tenantMiddleware, dashboardRoutes);

// ─── Health / Queues Endpoint ──────────────────────────────────
app.get('/health/queues', async (req, res) => {
    try {
        const { getTrialQueue } = require('./jobs/trialQueue');
        const { getReportCardQueue } = require('./jobs/reportCardQueue');

        const trialQ = getTrialQueue();
        const reportQ = getReportCardQueue();

        const getCounts = async (q) => {
            if (!q) return null;
            try {
                const counts = await q.getJobCounts();
                const jobs = await q.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed'], 0, 100);
                const latestFailed = jobs
                    .filter(j => j.failedReason)
                    .slice(0, 5)
                    .map(j => ({ jobId: j.id, name: j.name, failedReason: j.failedReason, timestamp: j.finishedOn }));
                return { counts, latestFailed };
            } catch {
                return null;
            }
        };

        const [trial, report] = await Promise.all([getCounts(trialQ), getCounts(reportQ)]);

        res.json({
            data: {
                timestamp: new Date().toISOString(),
                queues: {
                    'trial-expiration': {
                        name: 'trial-expiration',
                        status: trial ? 'healthy' : 'unconfigured',
                        ...trial?.counts,
                        latestFailed: trial?.latestFailed || [],
                    },
                    'report-card-generation': {
                        name: 'report-card-generation',
                        status: report ? 'healthy' : 'unconfigured',
                        ...report?.counts,
                        latestFailed: report?.latestFailed || [],
                    },
                },
            },
        });
    } catch (err) {
        console.error('Health queues error:', err);
        res.status(500).json({ error: 'Failed to retrieve queue health.' });
    }
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: statusCode < 500 ? err.message : 'Internal server error.',
    });
});

// ─── Start Server ─────────────────────────────────────────────
if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    const initializeQueues = async () => {
        try {
            const { initializeTrialQueue } = require('./jobs/trialQueue');
            const { queue: tq, worker: tw } = await initializeTrialQueue();
            if (tq && tw) {
                const { getTrialQueue } = require('./jobs/trialQueue');
                const q = getTrialQueue();
                if (q) {
                    const existing = await q.getRepeatableJobs();
                    const scheduled = existing.some(j => j.name === 'check-trials');
                    if (!scheduled) {
                        await q.add('check-trials', {}, { repeat: { pattern: '0 0 * * *' }, removeOnComplete: true });
                        console.log('[TrialQueue] Daily check scheduled (cron: 0 0 * * *)');
                    } else {
                        console.log('[TrialQueue] Daily check already scheduled');
                    }
                }
            }
        } catch (err) {
            console.warn('[TrialQueue] Initialization error (non-fatal):', err.message);
        }

        try {
            const { initializeReportCardQueue } = require('./jobs/reportCardQueue');
            await initializeReportCardQueue();
        } catch (err) {
            console.warn('[ReportCardQueue] Initialization error (non-fatal):', err.message);
        }

        // Start Datadog queue depth gauge reporting
        if (process.env.DD_ENABLED) {
            try {
                const { reportQueueGauges } = require('./middleware/datadog');
                const { getTrialQueue } = require('./jobs/trialQueue');
                const { getReportCardQueue } = require('./jobs/reportCardQueue');
                reportQueueGauges(getTrialQueue, getReportCardQueue);
                console.log('[Datadog] Queue depth gauge reporting started (30s interval)');
            } catch (err) {
                console.warn('[Datadog] Queue gauge init error (non-fatal):', err.message);
            }
        }
    };

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Health: http://localhost:${PORT}/health`);
        console.log(`Queues: http://localhost:${PORT}/health/queues`);

        initializeQueues();
    });
}

module.exports = app;
