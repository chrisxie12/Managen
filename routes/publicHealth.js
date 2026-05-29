/**
 * PUBLIC Health Check Endpoint
 * 
 * No authentication required. Used by UptimeRobot and load balancers.
 * Pings every 5 minutes to detect outages immediately.
 * 
 * Returns:
 * - 200 OK: System is healthy (all critical services up)
 * - 503 Service Unavailable: One or more critical services down
 */

const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const redis = require('../config/redis');

/**
 * Quick health check - hits critical services
 * Used by uptime monitoring (UptimeRobot, Datadog, etc.)
 */
router.get('/status', async (req, res) => {
  try {
    const checks = {
      database: false,
      redis: false,
      timestamp: new Date().toISOString(),
    };

    // Check database (critical)
    try {
      const { error } = await supabase
        .from('schools')
        .select('id', { count: 'exact', head: true })
        .limit(1);
      checks.database = !error;
    } catch (err) {
      checks.database = false;
    }

    // Check Redis if configured (not critical, but note it)
    if (redis.isRedisConfigured()) {
      try {
        const ok = await redis.testRedisConnection();
        checks.redis = ok;
      } catch (err) {
        checks.redis = false;
      }
    } else {
      checks.redis = true; // OK if not configured
    }

    // Determine overall status
    const isHealthy = checks.database && checks.redis;

    // Return 200 if healthy, 503 if down
    const status = isHealthy ? 200 : 503;
    const statusText = isHealthy ? 'OK' : 'Service Unavailable';

    res.status(status).json({
      status: statusText,
      code: status,
      healthy: isHealthy,
      checks,
      message: isHealthy
        ? 'System is operational'
        : 'One or more critical services are down. See checks for details.',
    });
  } catch (err) {
    res.status(503).json({
      status: 'Service Unavailable',
      code: 503,
      healthy: false,
      message: 'Health check failed',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Detailed health check - full diagnostics
 * Requires minimal auth (could be API key for internal tools)
 */
router.get('/detailed', async (req, res) => {
  try {
    const start = Date.now();
    const checks = {
      database: { status: 'unknown', latency: 0, detail: null },
      redis: { status: 'unknown', latency: 0, detail: null },
      storage: { status: 'unknown', latency: 0, detail: null },
      memory: {
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    // Database check
    try {
      const dbStart = Date.now();
      const { error } = await supabase
        .from('schools')
        .select('id', { count: 'exact', head: true })
        .limit(1);
      checks.database.latency = Date.now() - dbStart;
      if (error) {
        checks.database.status = 'down';
        checks.database.detail = error.message;
      } else {
        checks.database.status = 'healthy';
      }
    } catch (err) {
      checks.database.status = 'down';
      checks.database.detail = err.message;
    }

    // Redis check
    if (redis.isRedisConfigured()) {
      try {
        const redisStart = Date.now();
        const ok = await redis.testRedisConnection();
        checks.redis.latency = Date.now() - redisStart;
        checks.redis.status = ok ? 'healthy' : 'down';
      } catch (err) {
        checks.redis.status = 'down';
        checks.redis.detail = err.message;
      }
    } else {
      checks.redis.status = 'not_configured';
    }

    // Overall check
    const isHealthy =
      checks.database.status === 'healthy' &&
      (checks.redis.status === 'healthy' || checks.redis.status === 'not_configured');

    res.status(isHealthy ? 200 : 503).json({
      healthy: isHealthy,
      checks,
      totalTime: Date.now() - start,
    });
  } catch (err) {
    res.status(503).json({
      healthy: false,
      error: err.message,
    });
  }
});

/**
 * Liveness probe (for Kubernetes deployments)
 * App is "alive" if it can respond
 */
router.get('/live', (req, res) => {
  res.json({ alive: true, timestamp: new Date().toISOString() });
});

/**
 * Readiness probe (for Kubernetes deployments)
 * App is "ready" if critical services are up
 */
router.get('/ready', async (req, res) => {
  try {
    const { error } = await supabase
      .from('schools')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      return res.status(503).json({ ready: false, detail: error.message });
    }

    res.json({ ready: true, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ ready: false, detail: err.message });
  }
});

module.exports = router;
