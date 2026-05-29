const webpush = require('web-push');
const supabase = require('../config/db');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@schoolos.app';

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return true;
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    vapidConfigured = true;
    return true;
  }
  return false;
}

async function sendToUser(userId, schoolId, { title, body, icon, url }) {
  if (!ensureVapid()) return;
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)
    .eq('school_id', schoolId);

  const payload = JSON.stringify({ title, body, icon: icon || '/icon-192.png', url: url || '/' });

  for (const row of subs || []) {
    try {
      await webpush.sendNotification(row.subscription, payload);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        supabase.from('push_subscriptions').delete().match({
          user_id: userId,
          school_id: schoolId,
          subscription: row.subscription,
        }).then().catch(() => {});
      }
    }
  }
}

async function sendToSchool(schoolId, { title, body, icon, url }) {
  if (!ensureVapid()) return;
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('user_id, subscription')
    .eq('school_id', schoolId);

  const payload = JSON.stringify({ title, body, icon: icon || '/icon-192.png', url: url || '/' });

  for (const row of subs || []) {
    try {
      await webpush.sendNotification(row.subscription, payload);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        supabase.from('push_subscriptions').delete().match({
          user_id: row.user_id,
          school_id: schoolId,
          subscription: row.subscription,
        }).then().catch(() => {});
      }
    }
  }
}

async function sendToRole(schoolId, role, { title, body, icon, url }) {
  if (!ensureVapid()) return;
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('school_id', schoolId)
    .eq('role', role);

  const userIds = (users || []).map((u) => u.id);
  if (userIds.length === 0) return;

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('user_id, subscription')
    .in('user_id', userIds)
    .eq('school_id', schoolId);

  const payload = JSON.stringify({ title, body, icon: icon || '/icon-192.png', url: url || '/' });

  for (const row of subs || []) {
    try {
      await webpush.sendNotification(row.subscription, payload);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        supabase.from('push_subscriptions').delete().match({
          user_id: row.user_id,
          school_id: schoolId,
          subscription: row.subscription,
        }).then().catch(() => {});
      }
    }
  }
}

module.exports = { sendToUser, sendToSchool, sendToRole, ensureVapid };
