const { Queue, Worker } = require('bullmq');
const redis = require('../config/redis');
const gradebookService = require('../services/gradebookService');

let reportCardQueue = null;
let reportCardWorker = null;
const LOG_PREFIX = '[ReportCardQueue]';

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

const QUEUE_NAME = 'report-card-generation';

const initializeReportCardQueue = async () => {
  try {
    if (!redis.isRedisConfigured()) {
      log('REDIS_URL not configured. Skipping report card queue initialization.');
      return { queue: null, worker: null };
    }

    log('Creating queue...');

    reportCardQueue = new Queue(QUEUE_NAME, {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    });

    try {
      await reportCardQueue.client.ping();
      log('Connected to Redis. Queue ready.');
      const counts = await reportCardQueue.getJobCounts();
      log('Initial queue counts:', counts);
    } catch (err) {
      logWarn('Queue creation failed — Redis unavailable:', err);
      reportCardQueue = null;
      return { queue: null, worker: null };
    }

    reportCardWorker = new Worker(
      QUEUE_NAME,
      async (job) => {
        const { schoolId, classId, termId } = job.data;
        log(`Processing job ${job.id}: class=${classId}, term=${termId} (attempt ${job.attemptsMade + 1})`);

        await job.updateProgress(0);

        const students = await gradebookService.calculateClassTermAverages(classId, termId, schoolId);

        if (!students || students.length === 0) {
          log(`Job ${job.id}: No students found for class=${classId}, term=${termId}`);
          return { total: 0, processed: 0, results: [] };
        }

        const total = students.length;
        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < total; i++) {
          const student = students[i];
          try {
            await gradebookService.updateReportCard(student.student_id, classId, termId, schoolId);
            results.push({ student_id: student.student_id, status: 'success' });
            successCount++;
          } catch (e) {
            logError(`Report card failed for student ${student.student_id}:`, e);
            results.push({ student_id: student.student_id, status: 'error', error: e.message });
            errorCount++;
          }
          await job.updateProgress(Math.round(((i + 1) / total) * 100));
        }

        const summary = { total, success: successCount, failed: errorCount };
        log(`Job ${job.id} complete:`, summary);
        return { total, processed: results.length, results };
      },
      {
        connection: redis,
        concurrency: 1,
        lockDuration: 300000,
      }
    );

    reportCardWorker.on('completed', (job, returnValue) => {
      log(`Job ${job.id} completed:`, returnValue);
    });

    reportCardWorker.on('failed', (job, err) => {
      logError(`Job ${job.id} failed after ${job.attemptsMade} attempts:`, err);
    });

    reportCardWorker.on('error', (err) => {
      logError('Worker error:', err);
    });

    reportCardWorker.on('active', (job) => {
      log(`Worker started job ${job.id}`);
    });

    reportCardWorker.on('drained', () => {
      log('Queue drained — no more pending jobs');
    });

    reportCardWorker.on('paused', () => log('Worker paused'));
    reportCardWorker.on('resumed', () => log('Worker resumed'));
    reportCardWorker.on('closing', (msg) => log('Worker closing:', msg));

    const counts = await reportCardQueue.getJobCounts();
    log('Report card queue initialized. Current counts:', counts);

    return { queue: reportCardQueue, worker: reportCardWorker };
  } catch (err) {
    logError('Failed to initialize report card queue:', err);
    return { queue: null, worker: null };
  }
};

const addReportCardJob = async (schoolId, classId, termId) => {
  if (!reportCardQueue) {
    const err = new Error('Queue not initialized. Redis may be unavailable.');
    err.statusCode = 503;
    throw err;
  }
  const job = await reportCardQueue.add('generate-batch', { schoolId, classId, termId });
  log(`Added job ${job.id} for class=${classId}, term=${termId}`);
  return job;
};

const getJobStatus = async (jobId) => {
  if (!reportCardQueue) {
    const err = new Error('Queue not initialized.');
    err.statusCode = 503;
    throw err;
  }
  const job = await reportCardQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();

  return {
    jobId: job.id,
    status: state,
    progress: job.progress || 0,
    result: job.returnvalue || null,
    failedReason: job.failedReason || null,
    finishedOn: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
    createdAt: job.timestamp ? new Date(job.timestamp).toISOString() : null,
  };
};

const getReportCardQueue = () => reportCardQueue;

const closeReportCardQueue = async () => {
  try {
    if (reportCardWorker) await reportCardWorker.close();
    if (reportCardQueue) await reportCardQueue.close();
    log('Connections closed');
  } catch (err) {
    logWarn('Error closing connections:', err);
  }
};

module.exports = {
  reportCardQueue,
  reportCardWorker,
  initializeReportCardQueue,
  getReportCardQueue,
  addReportCardJob,
  getJobStatus,
  closeReportCardQueue,
};
