const Redis = require('ioredis');

// Check if Redis is configured via environment variable
const isRedisConfigured = () => {
  return !!process.env.REDIS_URL;
};

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 0,
  retryStrategy: (times) => {
    if (times > 10) return null;
    return Math.min(times * 200, 5000);
  },
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('ready', () => {
  console.log('Redis ready');
});

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
