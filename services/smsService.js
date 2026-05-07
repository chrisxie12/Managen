const axios = require('axios');

const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY;
const ARKESEL_SENDER_ID = process.env.SMS_SENDER_ID || process.env.ARKESEL_SENDER_ID || 'SchoolOS';
const ARKESEL_BASE_URL = process.env.ARKESEL_BASE_URL || 'https://sms.arkesel.com/api/v2/send';

const DEFAULT_RETRIES = Number(process.env.MESSAGE_MAX_RETRIES) || 3;
const RETRY_BASE_MS = Number(process.env.MESSAGE_RETRY_BASE_MS) || 500;

async function backoffDelay(attempt) {
    const ms = RETRY_BASE_MS * Math.pow(2, attempt - 1);
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attemptRequest(fn, maxAttempts = DEFAULT_RETRIES) {
    let attempt = 0;
    while (attempt < maxAttempts) {
        attempt += 1;
        try {
            const res = await fn();
            return { success: true, res };
        } catch (err) {
            const status = err && err.response && err.response.status;
            if (status && status >= 400 && status < 500) {
                return { success: false, error: err };
            }
            if (attempt >= maxAttempts) {
                return { success: false, error: err };
            }
            await backoffDelay(attempt);
        }
    }
    return { success: false, error: new Error('Max attempts reached') };
}

async function sendArkeselSms({ to, message }) {
    if (!ARKESEL_API_KEY) {
        throw new Error('Arkesel not configured (ARKESEL_API_KEY missing)');
    }

    const payload = {
        api_key: ARKESEL_API_KEY,
        to: to,
        sender: ARKESEL_SENDER_ID,
        message: message,
    };

    const result = await attemptRequest(() => axios.post(ARKESEL_BASE_URL, payload, {
        headers: { 'Content-Type': 'application/json' }
    }));

    if (!result.success) throw result.error;
    return { success: true, providerId: result.res.data && result.res.data.request_id };
}

async function sendWelcome({ to, name, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const message = `Welcome ${name || ''} to ${schoolName || 'SchoolOS'}. Login at your subdomain to get started.`;
    try {
        const r = await sendArkeselSms({ to, message });
        return r;
    } catch (err) {
        console.error('sendWelcome sms error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

async function sendTrialReminder({ to, name, daysLeft, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const message = `Hi ${name || ''}, your trial for ${schoolName || 'SchoolOS'} ends in ${daysLeft} day(s). Please add payment to avoid suspension.`;
    try {
        const r = await sendArkeselSms({ to, message });
        return r;
    } catch (err) {
        console.error('sendTrialReminder sms error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

async function sendPaymentReceipt({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const message = `Payment received: ${amount} ${currency} for ${schoolName || ''}. Invoice ${invoiceId}. Thank you.`;
    try {
        const r = await sendArkeselSms({ to, message });
        return r;
    } catch (err) {
        console.error('sendPaymentReceipt sms error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

async function sendPaymentFailed({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const message = `Payment failed: ${amount} ${currency} for ${schoolName || ''}. Invoice ${invoiceId}. Please update payment method.`;
    try {
        const r = await sendArkeselSms({ to, message });
        return r;
    } catch (err) {
        console.error('sendPaymentFailed sms error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

async function sendFeeReminder({ to, message }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    if (!message) return { success: false, error: 'Message is required' };

    try {
        const r = await sendArkeselSms({ to, message });
        return r;
    } catch (err) {
        console.error('sendFeeReminder sms error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

module.exports = {
    sendWelcome,
    sendTrialReminder,
    sendPaymentReceipt,
    sendPaymentFailed,
    sendFeeReminder,
};

