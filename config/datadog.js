const tracer = require('dd-trace').init({
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

const statsd = tracer.dogstatsd;

module.exports = { tracer, statsd };
