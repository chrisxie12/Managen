require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const cookieParser = require('cookie-parser');

const { handleWebhook }     = require('./services/billingService');

const onboardRoutes    = require('./routes/onboard');
const authRoutes       = require('./routes/auth');
const superAdminRoutes = require('./routes/superAdmin');
const schoolRoutes     = require('./routes/school');
const billingRoutes    = require('./routes/billing');

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

// ─── Stripe Webhook (must be before express.json) ─────────────
app.post(
    '/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    handleWebhook
);

// ─── Global Middleware ────────────────────────────────────────
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://schoolos.vercel.app',
    /\.vercel\.app$/,
    /\.schoolos\.io$/,
    /\.railway\.app$/
  ],
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

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Public Routes ────────────────────────────────────────────
app.use('/api/onboard',    onboardRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/billing',    billingRoutes);

// ─── Tenant Middleware ────────────────────────────────────────
const { tenantMiddleware } = require('./middleware/tenant');
app.use(tenantMiddleware);
app.use('/api/auth',   authRoutes);
app.use('/api/school', schoolRoutes);

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
    
    // Initialize background jobs
    const { scheduleTrialCheck } = require('./jobs/trialQueue');
    scheduleTrialCheck();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
}

module.exports = app;
