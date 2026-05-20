const { createClient } = require('@supabase/supabase-js');

const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.SUPABASE_URL || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables.');
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    serviceKey
);

let statsd = null;
try { statsd = require('./datadog').statsd; } catch { /* datadog not configured */ }

function timedQuery(label, queryFn) {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await queryFn(...args);
      const duration = Date.now() - start;
      if (statsd) {
        statsd.histogram('schoolos.db.query_time', duration, [`query:${label}`, `table:${label.split('.')[0] || 'unknown'}`]);
        if (duration > 1000) {
          statsd.increment('schoolos.db.slow_query', 1, [`query:${label}`, `duration_ms:${duration}`]);
        }
      }
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      if (statsd) {
        statsd.histogram('schoolos.db.query_time', duration, [`query:${label}`, `table:${label.split('.')[0] || 'unknown'}`, 'error:true']);
      }
      throw err;
    }
  };
}

supabase.timedQuery = timedQuery;

module.exports = supabase;
