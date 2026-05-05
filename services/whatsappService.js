let twilioClient;
try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} catch (err) {
    // twilio may not be installed/configured in all environments
    twilioClient = null;
}

const FROM = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+1415...

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
            const status = err && err.status;
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

async function sendWhatsApp({ to, body }) {
    if (!twilioClient || !FROM) {
        throw new Error('Twilio WhatsApp not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM)');
    }

    const payload = {
        from: FROM,
        to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
        body,
    };

    const result = await attemptRequest(() => twilioClient.messages.create(payload));
    if (!result.success) throw result.error;
    return { success: true, providerId: result.res && result.res.sid };
}

async function sendWelcome({ to, name, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const body = `Welcome ${name || ''} to ${schoolName || 'SchoolOS'}! Login at your subdomain to get started.`;
    try {
        const r = await sendWhatsApp({ to, body });
        return r;
    } catch (err) {
        console.error('sendWelcome whatsapp error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

async function sendTrialReminder({ to, name, daysLeft, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const body = `Hi ${name || ''}, your trial for ${schoolName || 'SchoolOS'} ends in ${daysLeft} day(s). Please add payment to avoid suspension.`;
    try {
        const r = await sendWhatsApp({ to, body });
        return r;
    } catch (err) {
        console.error('sendTrialReminder whatsapp error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

async function sendPaymentReceipt({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const body = `Payment received: ${amount} ${currency} for ${schoolName || ''}. Invoice ${invoiceId}. Thank you.`;
    try {
        const r = await sendWhatsApp({ to, body });
        return r;
    } catch (err) {
        console.error('sendPaymentReceipt whatsapp error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

async function sendPaymentFailed({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    if (!to) return { success: false, error: 'Recipient (to) is required' };
    const body = `Payment failed: ${amount} ${currency} for ${schoolName || ''}. Invoice ${invoiceId}. Please update payment method.`;
    try {
        const r = await sendWhatsApp({ to, body });
        return r;
    } catch (err) {
        console.error('sendPaymentFailed whatsapp error:', err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

module.exports = {
    sendWelcome,
    sendTrialReminder,
    sendPaymentReceipt,
    sendPaymentFailed,
};

