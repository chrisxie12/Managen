const { statsd } = require('../config/datadog');

const skippedPaths = ['/health', '/health/queues', '/'];

function datadogMiddleware(req, res, next) {
  if (skippedPaths.includes(req.path)) return next();

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    const baseTags = [
      `method:${req.method}`,
      `route:${route}`,
      `status_code:${res.statusCode}`,
      `status_group:${Math.floor(res.statusCode / 100)}xx`,
    ];

    statsd.increment('schoolos.api.requests', 1, baseTags);
    statsd.histogram('schoolos.api.response_time', duration, baseTags);
  });

  next();
}

function reportQueueGauges(getTrialQueue, getReportCardQueue) {
  const report = async () => {
    try {
      const tq = getTrialQueue ? getTrialQueue() : null;
      const rq = getReportCardQueue ? getReportCardQueue() : null;

      const [trialCounts, reportCounts] = await Promise.all([
        tq ? tq.getJobCounts() : Promise.resolve(null),
        rq ? rq.getJobCounts() : Promise.resolve(null),
      ]);

      if (trialCounts) {
        statsd.gauge('schoolos.redis.queue_depth', trialCounts.waiting || 0, ['queue:trial-expiration', 'type:waiting']);
        statsd.gauge('schoolos.redis.queue_depth', trialCounts.active || 0, ['queue:trial-expiration', 'type:active']);
        statsd.gauge('schoolos.redis.queue_depth', trialCounts.failed || 0, ['queue:trial-expiration', 'type:failed']);
      }
      if (reportCounts) {
        statsd.gauge('schoolos.redis.queue_depth', reportCounts.waiting || 0, ['queue:report-card-generation', 'type:waiting']);
        statsd.gauge('schoolos.redis.queue_depth', reportCounts.active || 0, ['queue:report-card-generation', 'type:active']);
        statsd.gauge('schoolos.redis.queue_depth', reportCounts.failed || 0, ['queue:report-card-generation', 'type:failed']);
      }
    } catch {
      // Queue metrics are best-effort
    }
  };

  report();
  setInterval(report, 30_000);
}

module.exports = { datadogMiddleware, reportQueueGauges };
