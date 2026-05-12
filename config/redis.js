const Redis = require('ioredis');

// Check if Redis is configured via environment variable
const isRedisConfigured = () => {
  return !!process.env.REDIS_URL;
};

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 0,
  retryStrategy: () => null,
});

redis.on('error', () => {});

/**
 * Safely test Redis connectivity
 * @returns {Promise<boolean>} true if Redis is available, false otherwise
 */
const testRedisConnection = async () => {
  if (!isRedisConfigured()) {
    return false;
  }

  try {
    await redis.ping();
    return true;
  } catch (err) {
    console.warn('⚠️  Redis connection failed:', err.message);
    return false;
  }
};

module.exports = redis;
module.exports.isRedisConfigured = isRedisConfigured;
module.exports.testRedisConnection = testRedisConnection;
