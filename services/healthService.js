const os = require('os');
const supabase = require('../config/db');
const redis = require('../config/redis');
const { isRedisConfigured, testRedisConnection } = redis;

const START_TIME = Date.now();

function msSince(start) {
  return Date.now() - start;
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
  return `${val.toFixed(1)} ${units[i]}`;
}

class HealthService {
  async checkDatabase() {
    const start = Date.now();
    try {
      const { error } = await supabase.from('schools').select('id', { count: 'exact', head: true }).limit(1);
      if (error) return { status: 'down', latency: msSince(start), detail: error.message };
      return { status: 'healthy', latency: msSince(start) };
    } catch (err) {
      return { status: 'down', latency: msSince(start), detail: err.message };
    }
  }

  checkServer() {
    const mem = process.memoryUsage();
    const uptimeSeconds = Math.floor(process.uptime());
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    return {
      status: 'healthy',
      uptime: `${days}d ${hours}h ${minutes}m`,
      uptimeSeconds,
      startTime: new Date(START_TIME).toISOString(),
      memory: {
        rss: formatBytes(mem.rss),
        heapTotal: formatBytes(mem.heapTotal),
        heapUsed: formatBytes(mem.heapUsed),
        rssBytes: mem.rss,
        heapUsedBytes: mem.heapUsed,
      },
      platform: os.platform(),
      hostname: os.hostname(),
      cpuCores: os.cpus().length,
      loadAvg: os.loadavg().slice(0, 3),
      freeMem: formatBytes(os.freemem()),
      totalMem: formatBytes(os.totalmem()),
      nodeVersion: process.version,
    };
  }

  async checkRedis() {
    if (!isRedisConfigured()) return { status: 'unconfigured', detail: 'REDIS_URL not set' };
    const start = Date.now();
    try {
      const ok = await testRedisConnection();
      if (!ok) return { status: 'down', latency: msSince(start), detail: 'Redis ping failed' };
      return { status: 'healthy', latency: msSince(start) };
    } catch (err) {
      return { status: 'down', latency: msSince(start), detail: err.message };
    }
  }

  async checkQueue() {
    if (!isRedisConfigured()) return { status: 'unconfigured', detail: 'Redis not available' };
    const start = Date.now();
    try {
      const { getTrialQueue } = require('../jobs/trialQueue');
      const queue = getTrialQueue();
      if (!queue) return { status: 'unconfigured', latency: msSince(start), detail: 'Queue not initialized' };
      const counts = await queue.getJobCounts();
      return {
        status: 'healthy',
        latency: msSince(start),
        counts: {
          waiting: counts.waiting || 0,
          active: counts.active || 0,
          completed: counts.completed || 0,
          failed: counts.failed || 0,
          delayed: counts.delayed || 0,
        },
      };
    } catch (err) {
      return { status: 'degraded', latency: msSince(start), detail: err.message };
    }
  }

  async checkStorage() {
    const start = Date.now();
    try {
      const { data, error } = await supabase.rpc('get_db_size');
      if (!error && data) return { status: 'healthy', latency: msSince(start), storage: formatBytes(data), storageBytes: data };

      const queries = [
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
        supabase.from('notification_logs').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
      ];

      const results = await Promise.all(queries.map(q => q.catch(() => ({ count: 0 }))));
      const totalRows = results.reduce((sum, r) => sum + (r.count || 0), 0);

      return { status: 'degraded', latency: msSince(start), detail: 'RPC unavailable, row estimate', estimatedRows: totalRows };
    } catch (err) {
      return { status: 'degraded', latency: msSince(start), detail: err.message };
    }
  }

  async checkEmail() {
    const start = Date.now();
    const configured = !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN);
    return { status: configured ? 'healthy' : 'unconfigured', latency: msSince(start), detail: configured ? 'Mailgun configured' : 'MAILGUN_API_KEY or MAILGUN_DOMAIN missing' };
  }

  async checkSms() {
    const start = Date.now();
    const configured = !!process.env.ARKESEL_API_KEY;
    return { status: configured ? 'healthy' : 'unconfigured', latency: msSince(start), detail: configured ? 'Arkesel configured' : 'ARKESEL_API_KEY missing' };
  }

  async checkWhatsApp() {
    const start = Date.now();
    const configured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_WHATSAPP_FROM);
    return { status: configured ? 'healthy' : 'unconfigured', latency: msSince(start), detail: configured ? 'Twilio WhatsApp configured' : 'TWILIO_ACCOUNT_SID or TWILIO_WHATSAPP_FROM missing' };
  }

  async getRecentFailures(schoolId) {
    try {
      const { data, count, error } = await supabase.from('notification_logs')
        .select('*, school:schools!inner(id)', { count: 'exact' })
        .eq('status', 'failed')
        .gte('created_at', new Date(Date.now() - 86400000 * 7).toISOString())
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) return { total: 0, records: [] };
      return { total: count || 0, records: (data || []).map(r => ({
        id: r.id, type: r.type, channel: r.channel,
        recipient: r.recipient, error: r.error_message,
        created_at: r.created_at,
      })) };
    } catch {
      return { total: 0, records: [] };
    }
  }

  async getIncidents(schoolId) {
    try {
      const sevenDaysAgo = new Date(Date.now() - 86400000 * 7).toISOString();
      const { data, count, error } = await supabase.rpc('get_db_size');

      const { data: logs, error: logsErr } = await supabase.from('audit_logs')
        .select('*, user:users(name, email)', { count: 'exact' })
        .eq('school_id', schoolId)
        .in('action', ['deleted'])
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(20);

      if (logsErr) return { total: 0, records: [] };
      return {
        total: logsErr ? 0 : (logs?.length || 0),
        records: (logs || []).map(l => ({
          id: l.id, type: 'delete_event',
          resource: l.resource, resource_id: l.resource_id,
          actor: l.user?.name || 'System',
          action: l.action, created_at: l.created_at,
        })),
      };
    } catch {
      return { total: 0, records: [] };
    }
  }

  async getNotificationStats(schoolId) {
    try {
      const sevenDaysAgo = new Date(Date.now() - 86400000 * 7).toISOString();
      const { data, error } = await supabase.from('notification_logs')
        .select('status, channel')
        .eq('school_id', schoolId)
        .gte('created_at', sevenDaysAgo);

      if (error) return { total: 0, sent: 0, failed: 0, rate: 0, byChannel: {} };

      const total = data?.length || 0;
      const sent = (data || []).filter(r => r.status === 'sent').length;
      const failed = total - sent;
      const rate = total > 0 ? Math.round((sent / total) * 100) : 0;

      const byChannel = {};
      (data || []).forEach(r => {
        if (!byChannel[r.channel]) byChannel[r.channel] = { sent: 0, failed: 0, total: 0 };
        byChannel[r.channel].total += 1;
        if (r.status === 'sent') byChannel[r.channel].sent += 1;
        else byChannel[r.channel].failed += 1;
      });

      return { total, sent, failed, rate, byChannel };
    } catch {
      return { total: 0, sent: 0, failed: 0, rate: 0, byChannel: {} };
    }
  }

  async checkPushNotifications() {
    const hasPublic = !!process.env.VAPID_PUBLIC_KEY;
    const hasPrivate = !!process.env.VAPID_PRIVATE_KEY;
    if (!hasPublic || !hasPrivate) {
      return { status: 'unconfigured', message: 'VAPID keys not set. Push notifications disabled.', vapidConfigured: false };
    }
    return { status: 'healthy', message: 'Push notifications configured.', vapidConfigured: true };
  }

  async getFullHealth(schoolId) {
    const [db, server, redis, queue, storage, email, sms, whatsapp, push, failures, incidents, notifStats] = await Promise.all([
      this.checkDatabase(),
      this.checkServer(),
      this.checkRedis(),
      this.checkQueue(),
      this.checkStorage(),
      this.checkEmail(),
      this.checkSms(),
      this.checkWhatsApp(),
      this.checkPushNotifications(),
      this.getRecentFailures(schoolId),
      this.getIncidents(schoolId),
      this.getNotificationStats(schoolId),
    ]);

    const checks = { db, server, redis, queue, storage, email, sms, whatsapp, push };
    const downCount = Object.values(checks).filter(c => c.status === 'down').length;
    const degradedCount = Object.values(checks).filter(c => c.status === 'degraded').length;
    const unconfiguredCount = Object.values(checks).filter(c => c.status === 'unconfigured').length;
    const total = Object.keys(checks).length;
    const healthy = total - downCount - degradedCount - unconfiguredCount;

    const overallStatus = downCount > 0 ? 'degraded' : degradedCount > 0 ? 'degraded' : unconfiguredCount === total ? 'unconfigured' : 'healthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      summary: { total, healthy, degraded: degradedCount, down: downCount, unconfigured: unconfiguredCount },
      checks,
      notifications: notifStats,
      recentFailures: failures,
      incidents,
    };
  }
}

module.exports = new HealthService();
