const axios = require('axios');

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM = process.env.MAILGUN_FROM || `SchoolOS <no-reply@${MAILGUN_DOMAIN || 'example.com'}>`;

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
            // do not retry on 4xx
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

async function sendMailgunMessage({ to, subject, text, html }) {
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
        throw new Error('Mailgun not configured (MAILGUN_API_KEY or MAILGUN_DOMAIN missing)');
    }

    const url = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;
    const params = new URLSearchParams();
    params.append('from', MAILGUN_FROM);
    params.append('to', to);
    params.append('subject', subject || 'SchoolOS Notification');
    if (text) params.append('text', text);
    if (html) params.append('html', html);

    const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');

    const result = await attemptRequest(() => axios.post(url, params.toString(), {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }));

    if (!result.success) throw result.error;

    return { success: true, providerId: result.res.data && result.res.data.id };
}

async function sendWelcome({ to, name, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const subject = `Welcome to ${schoolName || 'SchoolOS'}`;
    const text = `Hello ${name || ''},\n\nWelcome to ${schoolName || 'your new school on SchoolOS'}. Your account has been created.\n\nLogin at your subdomain to get started.`;
    try {
        const r = await sendMailgunMessage({ to, subject, text });
        return r;
    } catch (err) {
        console.error('sendWelcome email error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

async function sendTrialReminder({ to, name, daysLeft, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const subject = `Your ${schoolName || 'SchoolOS'} trial ends in ${daysLeft} day(s)`;
    const text = `Hi ${name || ''},\n\nYour trial for ${schoolName || 'SchoolOS'} ends in ${daysLeft} day(s). Please add a payment method to avoid suspension.`;
    try {
        const r = await sendMailgunMessage({ to, subject, text });
        return r;
    } catch (err) {
        console.error('sendTrialReminder email error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

async function sendPaymentReceipt({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const subject = `Payment received — ${schoolName || 'SchoolOS'}`;
    const text = `Hello ${name || ''},\n\nWe received your payment of ${amount} ${currency} for ${schoolName || ''}. Invoice: ${invoiceId}. Thank you.`;
    try {
        const r = await sendMailgunMessage({ to, subject, text });
        return r;
    } catch (err) {
        console.error('sendPaymentReceipt email error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

async function sendPaymentFailed({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const subject = `Payment failed — ${schoolName || 'SchoolOS'}`;
    const text = `Hello ${name || ''},\n\nWe were unable to process payment of ${amount} ${currency} for ${schoolName || ''}. Invoice: ${invoiceId}. Please update your payment method.`;
    try {
        const r = await sendMailgunMessage({ to, subject, text });
        return r;
    } catch (err) {
        console.error('sendPaymentFailed email error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

module.exports = {
    sendWelcome,
    sendTrialReminder,
    sendPaymentReceipt,
    sendPaymentFailed,
};

