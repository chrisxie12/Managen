const axios = require('axios');
const { attemptRequest, wrapServiceCall } = require('./notificationUtils');

const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY;
const ARKESEL_SENDER_ID = process.env.SMS_SENDER_ID || process.env.ARKESEL_SENDER_ID || 'SchoolOS';
const ARKESEL_BASE_URL = process.env.ARKESEL_BASE_URL || 'https://sms.arkesel.com/api/v2/send';

async function sendArkeselSms({ to, message }) {
    if (!ARKESEL_API_KEY) {
        throw new Error('Arkesel not configured (ARKESEL_API_KEY missing)');
    }

    const payload = {
        api_key: ARKESEL_API_KEY,
        to,
        sender: ARKESEL_SENDER_ID,
        message,
    };

    return attemptRequest(() => axios.post(ARKESEL_BASE_URL, payload, {
        headers: { 'Content-Type': 'application/json' }
    }));
}

async function sendWelcome({ to, name, schoolName }) {
    const message = `Welcome ${name || ''} to ${schoolName || 'SchoolOS'}. Login at your subdomain to get started.`;
    return wrapServiceCall(sendArkeselSms({ to, message }), 'sendWelcome sms', (res) => res.data?.request_id);
}

async function sendTrialReminder({ to, name, daysLeft, schoolName }) {
    const message = `Hi ${name || ''}, your trial for ${schoolName || 'SchoolOS'} ends in ${daysLeft} day(s). Please add payment to avoid suspension.`;
    return wrapServiceCall(sendArkeselSms({ to, message }), 'sendTrialReminder sms', (res) => res.data?.request_id);
}

async function sendPaymentReceipt({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    const message = `Payment received: ${amount} ${currency} for ${schoolName || ''}. Invoice ${invoiceId}. Thank you.`;
    return wrapServiceCall(sendArkeselSms({ to, message }), 'sendPaymentReceipt sms', (res) => res.data?.request_id);
}

async function sendPaymentFailed({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    const message = `Payment failed: ${amount} ${currency} for ${schoolName || ''}. Invoice ${invoiceId}. Please update payment method.`;
    return wrapServiceCall(sendArkeselSms({ to, message }), 'sendPaymentFailed sms', (res) => res.data?.request_id);
}

async function sendFeeReminder({ to, message }) {
    return wrapServiceCall(sendArkeselSms({ to, message }), 'sendFeeReminder sms', (res) => res.data?.request_id);
}

module.exports = {
    sendWelcome,
    sendTrialReminder,
    sendPaymentReceipt,
    sendPaymentFailed,
    sendFeeReminder,
};

