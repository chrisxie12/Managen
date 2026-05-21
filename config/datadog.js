let tracer = null;
let statsd = null;

if (process.env.DD_ENABLED === 'true') {
  tracer = require('dd-trace').init({
    service: 'schoolos-backend',
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    logInjection: true,
    profiling: true,
    runtimeMetrics: true,
    ingestion: {
      sampler: 1.0,
    },
  });
  statsd = tracer.dogstatsd;
}

module.exports = { tracer, statsd };

