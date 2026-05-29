/**
 * Rate Limiting Middleware for Critical Endpoints
 * 
 * Protects against:
 * - WhatsApp/SMS blasts causing rate limit errors
 * - Brute force attacks on auth
 * - Report card generation DoS
 * - Fee payment spam
 */

const rateLimit = require('express-rate-limit');

/**
 * Create a rate limiter with in-memory store.
 * Falls back gracefully if Redis or external store is unavailable.
 */
function createLimiter(options = {}) {
  const defaults = {
    windowMs: 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path?.includes('/status') || req.path?.includes('/health');
    },
  };

  return rateLimit({ ...defaults, ...options });
}

const authLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 1 minute.',
});

const apiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
});

const paymentLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Payment endpoint rate limited. Please try again shortly.',
});

const notificationLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Notification service rate limited. Please try again shortly.',
});

const reportLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Report generation rate limited. Please try again in a moment.',
  keyGenerator: (req) => {
    return req.tenant?.id || 'unknown';
  },
});

const uploadLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 3,
  message: 'File upload rate limited. Please try again shortly.',
});

const searchLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 50,
  keyGenerator: (req) => {
    return req.tenant?.id || 'unknown';
  },
});

const emailSmsLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Message rate limited to this recipient.',
  keyGenerator: (req) => {
    const recipient = req.body?.to || req.body?.recipient || '';
    const schoolId = req.tenant?.id || '';
    return `${schoolId}:${recipient}`;
  },
});

module.exports = {
  createLimiter,
  authLimiter,
  apiLimiter,
  paymentLimiter,
  notificationLimiter,
  reportLimiter,
  uploadLimiter,
  searchLimiter,
  emailSmsLimiter,
};
