const IORedis = require('ioredis');
const { Redis: UpstashRedis } = require('@upstash/redis');

let bullmqClient = null;
let restClient = null;
let _isUpstash = false;

const isRedisConfigured = () => !!process.env.REDIS_URL;

const isUpstashConnection = () => _isUpstash;

const detectUpstash = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.includes('upstash.io');
  } catch {
    return url.includes('upstash.io');
  }
};

const createClients = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.log('REDIS_URL not set. Redis disabled. Background queues will not start.');
    return;
  }

  _isUpstash = detectUpstash(url);

  if (url.startsWith('https://')) {
    if (_isUpstash) {
      console.log('Detected Upstash HTTPS REST URL. Creating REST client only.');
      console.warn('BullMQ requires a TCP connection (rediss://). Background queues will not start.');
      restClient = new UpstashRedis({ url });
    }
    return;
  }

  const ioredisOpts = {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    retryStrategy: (times) => {
      if (times > 10) {
        console.error('Redis (BullMQ) connection retries exhausted.');
        return null;
      }
      return Math.min(times * 200, 5000);
    },
    connectTimeout: 10000,
  };

  if (_isUpstash && !url.startsWith('rediss:')) {
    ioredisOpts.tls = {};
  }

  bullmqClient = new IORedis(url, ioredisOpts);

  if (_isUpstash) {
    try {
      const parsed = new URL(url);
      const restUrl = `https://${parsed.hostname}`;
      const restToken = parsed.password || '';
      restClient = new UpstashRedis({ url: restUrl, token: restToken });
      console.log('Upstash REST client created for cache operations');
    } catch (e) {
      console.warn('Failed to create Upstash REST client:', e.message);
    }
  }

  bullmqClient.on('error', (err) => console.error('Redis (BullMQ) error:', err.message));
  bullmqClient.on('connect', () => console.log('Redis (BullMQ) connected'));
  bullmqClient.on('ready', () => console.log('Redis (BullMQ) ready'));
  bullmqClient.on('close', () => console.log('Redis (BullMQ) connection closed'));
};

createClients();

const getCacheClient = () => restClient || bullmqClient;

const testRedisConnection = async () => {
  if (!bullmqClient) return false;
  try {
    await bullmqClient.ping();
    return true;
  } catch (err) {
    console.warn('Redis ping failed:', err.message);
    return false;
  }
};

if (bullmqClient) {
  bullmqClient.isRedisConfigured = isRedisConfigured;
  bullmqClient.testRedisConnection = testRedisConnection;
  bullmqClient.isUpstash = _isUpstash;
  bullmqClient.rest = restClient;
  bullmqClient.getCache = getCacheClient;
  module.exports = bullmqClient;
} else if (restClient) {
  restClient.isRedisConfigured = isRedisConfigured;
  restClient.testRedisConnection = async () => { try { await restClient.ping(); return true; } catch { return false; } };
  restClient.isUpstash = _isUpstash;
  restClient.rest = restClient;
  restClient.getCache = () => restClient;
  restClient.status = 'rest-only';
  module.exports = restClient;
} else {
  module.exports = {
    isRedisConfigured,
    testRedisConnection,
    isUpstash: false,
    rest: null,
    status: 'unconfigured',
    get: () => Promise.resolve(null),
    setex: () => Promise.resolve('OK'),
    set: () => Promise.resolve('OK'),
    getset: () => Promise.resolve(null),
    del: () => Promise.resolve(1),
    incr: () => Promise.resolve(1),
    expire: () => Promise.resolve(1),
    on: () => {},
    ping: async () => 'PONG',
    getCache: () => module.exports,
  };
}
