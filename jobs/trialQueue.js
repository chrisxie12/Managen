const { Queue, Worker } = require('bullmq');
const redis = require('../config/redis');
const supabase = require('../config/db');
const { getPlanConfig, suspendSchool } = require('../services/provisionService');

let trialQueue = null;
let trialWorker = null;
const LOG_PREFIX = '[TrialQueue]';

const log = (msg, data) => {
  const ts = new Date().toISOString();
  if (data) console.log(`${ts} ${LOG_PREFIX} ${msg}`, data);
  else console.log(`${ts} ${LOG_PREFIX} ${msg}`);
};

const logWarn = (msg, err) => {
  const ts = new Date().toISOString();
  console.warn(`${ts} ${LOG_PREFIX} ${msg}`, err?.message || err);
};

const logError = (msg, err) => {
  const ts = new Date().toISOString();
  console.error(`${ts} ${LOG_PREFIX} ${msg}`, err?.message || err, err?.stack || '');
};

const initializeTrialQueue = async () => {
  try {
    if (!redis.isRedisConfigured()) {
      log('REDIS_URL not configured. Skipping trial queue initialization.');
      return { queue: null, worker: null };
    }

    log('Creating queue...');

    trialQueue = new Queue('trial-expiration', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    trialQueue.on('waiting', (jobId) => log(`Job ${jobId} is waiting`));
    trialQueue.on('progress', (jobId, progress) => log(`Job ${jobId} progress: ${progress}%`));

    try {
      await trialQueue.client.ping();
      log('Connected to Redis. Queue ready.');
      const counts = await trialQueue.getJobCounts();
      log('Initial queue counts:', counts);
    } catch (err) {
      logWarn('Queue creation failed — Redis unavailable:', err);
      trialQueue = null;
      return { queue: null, worker: null };
    }

    trialWorker = new Worker(
      'trial-expiration',
      async (job) => {
        log(`Processing job ${job.id} (attempt ${job.attemptsMade + 1})`);

        const { data: trialSchools, error } = await supabase
          .from('schools')
          .select('id, name, slug, plan, created_at')
          .eq('plan', 'trial')
          .eq('is_active', true);

        if (error) {
          logError('Failed to fetch trial schools:', error);
          return { processed: 0, error: error.message };
        }

        const trialDays = getPlanConfig('trial').durationDays;
        const now = Date.now();
        const results = [];
        let deactivated = 0;
        let reminders = 0;

        for (const school of trialSchools || []) {
          const createdMs = new Date(school.created_at).getTime();
          const daysSince = Math.floor((now - createdMs) / (1000 * 60 * 60 * 24));
          const daysLeft = trialDays - daysSince;

          if (daysLeft <= 0) {
            try {
              await suspendSchool(school.id);
              results.push({ schoolId: school.id, slug: school.slug, action: 'deactivated' });
              deactivated++;
              log(`Trial expired — deactivated school: ${school.slug}`);
            } catch (e) {
              results.push({ schoolId: school.id, slug: school.slug, action: 'error', error: e.message });
              logError(`Failed to deactivate ${school.slug}:`, e);
            }
          } else {
            results.push({ schoolId: school.id, slug: school.slug, action: daysLeft <= 3 ? 'reminder_due' : 'ok', daysLeft });
            if (daysLeft <= 3) reminders++;
          }
        }

        const summary = { total: trialSchools?.length || 0, deactivated, reminders };
        log(`Job ${job.id} complete:`, summary);
        return { processed: summary.total, results };
      },
      {
        connection: redis,
        concurrency: 1,
        lockDuration: 120000,
      }
    );

    trialWorker.on('completed', (job, returnValue) => {
      log(`Job ${job.id} completed successfully:`, returnValue);
    });

    trialWorker.on('failed', (job, err) => {
      logError(`Job ${job.id} failed after ${job.attemptsMade} attempts:`, err);
    });

    trialWorker.on('error', (err) => {
      logError('Worker error:', err);
    });

    trialWorker.on('active', (job) => {
      log(`Worker started job ${job.id}`);
    });

    trialWorker.on('drained', () => {
      log('Queue drained — no more pending jobs');
    });

    trialWorker.on('paused', () => log('Worker paused'));
    trialWorker.on('resumed', () => log('Worker resumed'));
    trialWorker.on('closing', (msg) => log('Worker closing:', msg));

    const counts = await trialQueue.getJobCounts();
    log('Trial queue initialized. Current counts:', counts);

    return { queue: trialQueue, worker: trialWorker };
  } catch (err) {
    logError('Failed to initialize trial queue:', err);
    return { queue: null, worker: null };
  }
};

const scheduleTrialCheck = async () => {
  try {
    const { queue, worker } = await initializeTrialQueue();

    if (!queue || !worker) {
      logWarn('Trial queue unavailable. Expiration checks will not run.');
      trialQueue = null;
      trialWorker = null;
      return;
    }

    trialQueue = queue;
    trialWorker = worker;

    const existingJobs = await trialQueue.getRepeatableJobs();
    const alreadyScheduled = existingJobs.some(j => j.name === 'check-trials');
    if (!alreadyScheduled) {
      await trialQueue.add(
        'check-trials',
        {},
        { repeat: { pattern: '0 0 * * *' }, removeOnComplete: true }
      );
      log('Daily trial check scheduled (cron: 0 0 * * *)');
    } else {
      log('Daily trial check already scheduled');
    }
  } catch (err) {
    logError('Error scheduling trial check:', err);
    trialQueue = null;
    trialWorker = null;
  }
};

const getTrialQueue = () => trialQueue;

const closeTrialQueue = async () => {
  try {
    if (trialWorker) await trialWorker.close();
    if (trialQueue) await trialQueue.close();
    log('Connections closed');
  } catch (err) {
    logWarn('Error closing connections:', err);
  }
};

module.exports = {
  trialQueue,
  trialWorker,
  scheduleTrialCheck,
  closeTrialQueue,
  initializeTrialQueue,
  getTrialQueue,
};
