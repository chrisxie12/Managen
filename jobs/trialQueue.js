const { Queue, Worker } = require('bullmq');
const redis = require('../config/redis');

let trialQueue = null;
let trialWorker = null;

/**
 * Initialize the trial check queue
 * Returns null if Redis is not configured or unavailable
 */
const initializeTrialQueue = async () => {
  try {
    // Skip if REDIS_URL is not set
    if (!redis.isRedisConfigured()) {
      console.log('ℹ️  REDIS_URL not configured. Skipping trial queue initialization.');
      return { queue: null, worker: null };
    }

    // Create queue with Redis connection
    const queue = new Queue('trial-expiration', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    });

    // Test Redis connection
    try {
      await queue.client.ping();
      console.log('✅ Trial queue initialized successfully (Redis connected)');
    } catch (err) {
      console.warn('⚠️  Trial queue creation failed - Redis unavailable:', err.message);
      return { queue: null, worker: null };
    }

    // Create worker for processing trial expiration checks
    const worker = new Worker(
      'trial-expiration',
      async (job) => {
        console.log(`Processing trial expiration check job: ${job.id}`);
        // Placeholder for trial check logic
        return { success: true, jobId: job.id };
      },
      {
        connection: redis,
        concurrency: 1,
      }
    );

    worker.on('failed', (job, err) => {
      console.error(`Trial queue job ${job.id} failed:`, err.message);
    });

    worker.on('error', (err) => {
      console.error('Trial queue worker error:', err.message);
    });

    return { queue, worker };
  } catch (err) {
    console.warn('⚠️  Failed to initialize trial queue:', err.message);
    return { queue: null, worker: null };
  }
};

/**
 * Schedule a trial expiration check
 * Only works if Redis is available
 */
const scheduleTrialCheck = async () => {
  try {
    const { queue, worker } = await initializeTrialQueue();

    if (!queue || !worker) {
      console.warn('⚠️  Trial queue unavailable. Trial expiration checks will not run.');
      trialQueue = null;
      trialWorker = null;
      return;
    }

    trialQueue = queue;
    trialWorker = worker;

    // Example: Schedule recurring job (optional, can be customized)
    // await queue.add('check-trials', {}, { repeat: { pattern: '0 0 * * *' } });

    console.log('✅ Trial check scheduler initialized');
  } catch (err) {
    console.error('Error scheduling trial check:', err.message);
    trialQueue = null;
    trialWorker = null;
  }
};

/**
 * Gracefully close queue and worker connections
 */
const closeTrialQueue = async () => {
  try {
    if (trialWorker) {
      await trialWorker.close();
    }
    if (trialQueue) {
      await trialQueue.close();
    }
    console.log('✅ Trial queue connections closed');
  } catch (err) {
    console.warn('⚠️  Error closing trial queue:', err.message);
  }
};

module.exports = {
  trialQueue,
  trialWorker,
  scheduleTrialCheck,
  closeTrialQueue,
  initializeTrialQueue,
};
