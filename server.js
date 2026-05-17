require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const {
    handlePaystackWebhook,
    handleStripeWebhook,
} = require('./services/billingService');

const onboardRoutes    = require('./routes/onboard');
const authRoutes       = require('./routes/auth');
const superAdminRoutes = require('./routes/superAdmin');
const schoolRoutes     = require('./routes/school');
const billingRoutes    = require('./routes/billing');
const cronRoutes       = require('./routes/cron');
const approvalRoutes   = require('./routes/approvals');
const reportRoutes     = require('./routes/reports');
const auditRoutes      = require('./routes/audit');

const app = express();
app.set('trust proxy', 1);

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
app.post(
    '/webhooks/paystack',
    express.raw({ type: 'application/json' }),
    handlePaystackWebhook
);

app.post(
    '/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    handleStripeWebhook
);

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

// Fallback for JSON parsing errors
app.use(express.json());
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON payload.' });
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

// ─── Status Routes ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'Managen API is live ✅',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
    res.json({
        data: {
            status: 'ok',
            db: true,
            timestamp: Date.now(),
        },
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// ─── Public Routes ────────────────────────────────────────────
app.use('/api/onboard', onboardRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/billing',    billingRoutes);
app.use('/api/cron',       cronRoutes);

// ─── Tenant Middleware (only for school-scoped routes) ─────────
const { tenantMiddleware } = require('./middleware/tenant');
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/school', tenantMiddleware, schoolRoutes);
app.use('/api/approvals', tenantMiddleware, approvalRoutes);
app.use('/api/school/reports', tenantMiddleware, reportRoutes);
app.use('/api/school/audit-logs', tenantMiddleware, auditRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────
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
    
    // Initialize background jobs (gracefully handle Redis unavailability)
    const initializeQueues = async () => {
        try {
            const { scheduleTrialCheck } = require('./jobs/trialQueue');
            await scheduleTrialCheck();
        } catch (err) {
            console.warn('⚠️  Queue initialization error (non-fatal):', err.message);
            console.warn('ℹ️  Server will continue running without background jobs.');
        }
    };

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/health`);
        
        // Initialize queues after server starts
        initializeQueues();
    });
}

module.exports = app;
