const { Queue, Worker } = require('bullmq');
const redis = require('../config/redis');
const gradebookService = require('./gradebookService');

const QUEUE_NAME = 'report-card-generation';
let queue = null;
let worker = null;

const initializeQueue = async () => {
    try {
        if (!redis.isRedisConfigured()) {
            console.log('ℹ️  REDIS_URL not configured. Skipping queue initialization.');
            return { queue: null, worker: null };
        }

        queue = new Queue(QUEUE_NAME, {
            connection: redis,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: false,
                removeOnFail: false,
            },
        });

        try {
            await queue.client.ping();
            console.log('✅ Report card queue initialized (Redis connected)');
        } catch (err) {
            console.warn('⚠️  Queue creation failed - Redis unavailable:', err.message);
            queue = null;
            return { queue: null, worker: null };
        }

        worker = new Worker(
            QUEUE_NAME,
            async (job) => {
                const { schoolId, classId, termId } = job.data;
                console.log(`Processing report card batch: class=${classId}, term=${termId}`);

                await job.updateProgress(0);

                const students = await gradebookService.calculateClassTermAverages(classId, termId, schoolId);

                if (!students || students.length === 0) {
                    return { total: 0, processed: 0, results: [] };
                }

                const total = students.length;
                const results = [];

                for (let i = 0; i < total; i++) {
                    const student = students[i];
                    try {
                        await gradebookService.updateReportCard(student.student_id, classId, termId, schoolId);
                        results.push({ student_id: student.student_id, status: 'success' });
                    } catch (e) {
                        console.error(`Report card failed for student ${student.student_id}:`, e.message);
                        results.push({ student_id: student.student_id, status: 'error', error: e.message });
                    }
                    await job.updateProgress(Math.round(((i + 1) / total) * 100));
                }

                return { total, processed: results.length, results };
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
            console.error('Queue worker error:', err.message);
        });

        return { queue, worker };
    } catch (err) {
        console.warn('⚠️  Failed to initialize queue:', err.message);
        return { queue: null, worker: null };
    }
};

const addReportCardJob = async (schoolId, classId, termId) => {
    if (!queue) {
        const err = new Error('Queue not initialized. Redis may be unavailable.');
        err.statusCode = 503;
        throw err;
    }
    return queue.add('generate-batch', { schoolId, classId, termId });
};

const getJobStatus = async (jobId) => {
    if (!queue) {
        const err = new Error('Queue not initialized.');
        err.statusCode = 503;
        throw err;
    }
    const job = await queue.getJob(jobId);
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

module.exports = {
    initializeQueue,
    addReportCardJob,
    getJobStatus,
};
