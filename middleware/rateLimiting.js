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
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis');

/**
 * Create a rate limiter with optional Redis store
 * Falls back to in-memory if Redis is not configured
 */
function createLimiter(options = {}) {
  const defaults = {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path?.includes('/status') || req.path?.includes('/health');
    },
  };

  const config = { ...defaults, ...options };

  // Use Redis store if available
  if (redis.isRedisConfigured()) {
    try {
      config.store = new RedisStore({
        client: redis.getRedisClient(),
        prefix: config.prefix || 'rate-limit:',
      });
    } catch (err) {
      console.warn('[RateLimit] Redis not available, falling back to in-memory store');
    }
  }

  return rateLimit(config);
}

/**
 * Auth endpoint rate limiter
 * Stricter: 5 attempts per minute per IP
 */
const authLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 1 minute.',
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  prefix: 'auth-limit:',
});

/**
 * API endpoint limiter
 * Standard: 100 requests per minute per IP
 */
const apiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  prefix: 'api-limit:',
});

/**
 * Payment endpoint limiter
 * Moderate: 20 requests per minute per IP
 * Prevents payment spam and webhook flooding
 */
const paymentLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Payment endpoint rate limited. Please try again shortly.',
  prefix: 'payment-limit:',
});

/**
 * Notification endpoint limiter
 * Strict: 10 requests per minute per IP
 * Prevents WhatsApp/SMS quota abuse
 */
const notificationLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Notification service rate limited. Please try again shortly.',
  prefix: 'notification-limit:',
});

/**
 * Report generation limiter
 * Moderate: 5 reports per minute per school
 * Prevents resource exhaustion during term-end
 */
const reportLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Report generation rate limited. Please try again in a moment.',
  keyGenerator: (req) => {
    // Rate limit by school_id (from tenant middleware)
    return req.tenant?.id || req.ip || 'unknown';
  },
  prefix: 'report-limit:',
});

/**
 * File upload limiter
 * Strict: 3 uploads per minute per IP
 * Prevents abuse of storage quota
 */
const uploadLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 3,
  message: 'File upload rate limited. Please try again shortly.',
  prefix: 'upload-limit:',
});

/**
 * Search limiter
 * Moderate: 50 searches per minute
 * Prevents database scan attacks
 */
const searchLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 50,
  keyGenerator: (req) => {
    return req.tenant?.id || req.ip || 'unknown';
  },
  prefix: 'search-limit:',
});

/**
 * Email/SMS sender limiter
 * Per recipient: 5 per hour
 * Prevents spam to individual parents
 */
const emailSmsLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Message rate limited to this recipient.',
  keyGenerator: (req) => {
    // Rate limit by recipient + school
    const recipient = req.body?.to || req.body?.recipient || '';
    const schoolId = req.tenant?.id || '';
    return `${schoolId}:${recipient}`;
  },
  prefix: 'email-sms-limit:',
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
