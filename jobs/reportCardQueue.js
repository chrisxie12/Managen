const { Queue, Worker } = require('bullmq');
const redis = require('../config/redis');
const gradebookService = require('../services/gradebookService');

let reportCardQueue = null;
let reportCardWorker = null;

const initializeReportCardQueue = async () => {
  try {
    if (!redis.isRedisConfigured()) {
      console.log('ℹ️  REDIS_URL not configured. Skipping report card queue initialization.');
      return { queue: null, worker: null };
    }

    const queue = new Queue('report-card-generation', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      },
    });

    try {
      await queue.client.ping();
      console.log('✅ Report card queue initialized successfully (Redis connected)');
    } catch (err) {
      console.warn('⚠️  Report card queue creation failed - Redis unavailable:', err.message);
      return { queue: null, worker: null };
    }

    const worker = new Worker(
      'report-card-generation',
      async (job) => {
        const { schoolId, classId, termId } = job.data;
        console.log(`Processing report card batch: class=${classId}, term=${termId}`);

        const students = await gradebookService.calculateClassTermAverages(classId, termId, schoolId);
        const results = [];

        for (const student of students) {
          try {
            await gradebookService.updateReportCard(student.student_id, classId, termId, schoolId);
            results.push({ student_id: student.student_id, status: 'success' });
          } catch (e) {
            console.error(`Report card failed for student ${student.student_id}:`, e.message);
            results.push({ student_id: student.student_id, status: 'error', error: e.message });
          }
        }

        return { total: students.length, processed: results.length, results };
      },
      {
        connection: redis,
        concurrency: 1,
      }
    );

    worker.on('failed', (job, err) => {
      console.error(`Report card job ${job.id} failed:`, err.message);
    });

    worker.on('error', (err) => {
      console.error('Report card worker error:', err.message);
    });

    reportCardQueue = queue;
    reportCardWorker = worker;

    return { queue, worker };
  } catch (err) {
    console.warn('⚠️  Failed to initialize report card queue:', err.message);
    return { queue: null, worker: null };
  }
};

const getReportCardQueue = () => reportCardQueue;

module.exports = {
  initializeReportCardQueue,
  getReportCardQueue,
};
