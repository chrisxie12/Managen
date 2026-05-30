// services/whatsappService.js
// Meta WhatsApp Business API v21.0 with Arkesel SMS fallback
const crypto = require('crypto');
const { wrapServiceCall } = require('./notificationUtils');

const META_API = 'https://graph.facebook.com/v21.0';

// ─── Core send via Meta Graph API ─────────────────────────────────────────────

async function sendMetaMessage(phoneNumberId, accessToken, to, payload) {
  const res = await fetch(`${META_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, ...payload }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data.error?.message || `HTTP ${res.status}`;
    throw new Error(`Meta API: ${msg}`);
  }
  return data;
}

// ─── Resolve per-school credentials ──────────────────────────────────────────

async function resolveCredentials(schoolId) {
  if (!schoolId) {
    return {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    };
  }
  try {
    const db = require('../config/db');
    const { data } = await db.from('schools')
      .select('whatsapp_phone_id, whatsapp_access_token')
      .eq('id', schoolId)
      .maybeSingle();
    if (data?.whatsapp_phone_id && data?.whatsapp_access_token) {
      return { phoneNumberId: data.whatsapp_phone_id, accessToken: data.whatsapp_access_token };
    }
  } catch { /* fall through to env */ }
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * send({ to, body, schoolId? })
 * Sends a plain text WhatsApp message. Falls back to Arkesel SMS if Meta
 * credentials are not configured.
 * Returns { success: boolean, messageId?, error? }
 */
async function send({ to, body, schoolId } = {}) {
  const { phoneNumberId, accessToken } = await resolveCredentials(schoolId);

  if (phoneNumberId && accessToken) {
    try {
      const data = await sendMetaMessage(phoneNumberId, accessToken, to, {
        type: 'text',
        text: { body, preview_url: false },
      });
      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (err) {
      console.error('[whatsapp] Meta send failed, falling back to SMS:', err.message);
    }
  }

  // Arkesel SMS fallback
  return sendSms(to, body);
}

/**
 * sendTemplate({ to, templateName, languageCode?, components?, schoolId? })
 * Sends a pre-approved Meta template message.
 */
async function sendTemplate({ to, templateName, languageCode = 'en_US', components = [], schoolId } = {}) {
  const { phoneNumberId, accessToken } = await resolveCredentials(schoolId);
  if (!phoneNumberId || !accessToken) {
    return { success: false, error: 'WhatsApp Business API not configured' };
  }
  try {
    const data = await sendMetaMessage(phoneNumberId, accessToken, to, {
      type: 'template',
      template: { name: templateName, language: { code: languageCode }, components },
    });
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * sendWelcome({ to, name, schoolName, schoolId? })
 * Welcome message sent after school onboarding.
 */
async function sendWelcome({ to, name, schoolName, schoolId } = {}) {
  const body =
    `👋 Welcome to *${schoolName}* on SchoolOS!\n\n` +
    `Hello ${name}, your school is now live. Parents can reach you here for fee receipts, ` +
    `attendance alerts, and more.\n\n` +
    `Reply *HELP* at any time to see available commands.`;
  return wrapServiceCall(send({ to, body, schoolId }), 'sendWelcome whatsapp');
}

/**
 * sendPaymentReceipt({ to, schoolName, studentName, className, amount, method, date, reference, schoolId? })
 */
async function sendPaymentReceipt(params) {
  const receiptData = {
    schoolName: params.schoolName || 'SchoolOS',
    studentName: params.name || params.studentName || 'Student',
    className: params.className || 'Class',
    amount: params.amount,
    method: params.method || 'Cash',
    date: params.date || new Date().toLocaleDateString(),
    reference: params.invoiceId || params.reference || 'N/A',
  };
  const body = buildReceiptMessage(receiptData);
  return wrapServiceCall(send({ to: params.to, body, schoolId: params.schoolId }), 'sendPaymentReceipt whatsapp');
}

/**
 * sendFeeReminder({ to, studentName, amount, dueDate, schoolName, schoolId? })
 */
async function sendFeeReminder({ to, studentName, amount, dueDate, schoolName, schoolId } = {}) {
  const body =
    `📋 *Fee Reminder — ${schoolName}*\n\n` +
    `Dear Parent/Guardian,\n\n` +
    `This is a reminder that fees for *${studentName}* amount to *GHS ${amount}*, ` +
    `due on *${dueDate}*.\n\n` +
    `Please visit the school or use MoMo to settle the outstanding balance.\n\n` +
    `Reply *STOP* to opt out of reminders.`;
  return wrapServiceCall(send({ to, body, schoolId }), 'sendFeeReminder whatsapp');
}

/**
 * sendAttendanceAlert({ to, studentName, date, status, schoolName, schoolId? })
 */
async function sendAttendanceAlert({ to, studentName, date, status, schoolName, schoolId } = {}) {
  const emoji = status === 'absent' ? '🔴' : status === 'late' ? '🟡' : '🟢';
  const body =
    `${emoji} *Attendance Alert — ${schoolName}*\n\n` +
    `*${studentName}* was marked *${status}* on ${date}.\n\n` +
    `If this is incorrect, please contact the school office.`;
  return wrapServiceCall(send({ to, body, schoolId }), 'sendAttendanceAlert whatsapp');
}

// ─── Webhook signature verification ──────────────────────────────────────────

/**
 * Verifies the X-Hub-Signature-256 header from Meta webhooks.
 * rawBody must be the raw Buffer (not parsed JSON).
 */
function verifyWebhookSignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret || !signatureHeader) return false;
  const expected = `sha256=${crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ─── Legacy / Arkesel helpers ─────────────────────────────────────────────────

async function sendReceipt(parentPhone, receiptData) {
  const res = await fetch('https://api.arkesel.com/v2/sms/whatsapp/send', {
    method: 'POST',
    headers: { 'api-key': process.env.ARKESEL_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: receiptData.schoolName.replace(/\s/g, ''),
      recipient: [parentPhone],
      message: buildReceiptMessage(receiptData),
    }),
  });
  return res.json();
}

async function sendSms(to, message, senderName = 'SchoolOS') {
  if (!process.env.ARKESEL_API_KEY) {
    return { success: false, error: 'No messaging credentials configured' };
  }
  try {
    const res = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: { 'api-key': process.env.ARKESEL_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: senderName.substring(0, 11).replace(/\s/g, ''),
        message,
        recipients: [to],
      }),
    });
    const data = await res.json();
    return { success: res.ok, messageId: data.data?.message_id, error: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function buildReceiptMessage(data) {
  return (
    `*${data.schoolName}* — Fee Receipt ✅\n\n` +
    `Student: ${data.studentName}\n` +
    `Class: ${data.className}\n` +
    `Amount: GHS ${data.amount}\n` +
    `Method: ${data.method}\n` +
    `Date: ${data.date}\n` +
    `Ref: ${data.reference}\n\n` +
    `Thank you for your payment!`
  );
}

module.exports = {
  send,
  sendTemplate,
  sendWelcome,
  sendPaymentReceipt,
  sendFeeReminder,
  sendAttendanceAlert,
  verifyWebhookSignature,
  // Legacy exports kept for backward compatibility
  sendReceipt,
  sendSms,
  buildReceiptMessage,
};
