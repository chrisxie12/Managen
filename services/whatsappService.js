const { attemptRequest, wrapServiceCall } = require('./notificationUtils');

let twilioClient;
try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} catch (err) {
    // twilio may not be installed/configured in all environments
    twilioClient = null;
}

const FROM = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+1415...

async function sendWhatsApp({ to, body }) {
    if (!twilioClient || !FROM) {
        throw new Error('Twilio WhatsApp not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM)');
    }

    const payload = {
        from: FROM,
        to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
        body,
    };

    return attemptRequest(() => twilioClient.messages.create(payload));
}

async function sendWelcome({ to, name, schoolName }) {
    const body = `Welcome ${name || ''} to ${schoolName || 'Managen'}! Login at your subdomain to get started.`;
    return wrapServiceCall(sendWhatsApp({ to, body }), 'sendWelcome whatsapp');
}

async function sendTrialReminder({ to, name, daysLeft, schoolName }) {
    const body = `Hi ${name || ''}, your trial for ${schoolName || 'Managen'} ends in ${daysLeft} day(s). Please add payment to avoid suspension.`;
    return wrapServiceCall(sendWhatsApp({ to, body }), 'sendTrialReminder whatsapp');
}

async function sendPaymentReceipt({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    const body = `Payment received: ${amount} ${currency} for ${schoolName || ''}. Invoice ${invoiceId}. Thank you.`;
    return wrapServiceCall(sendWhatsApp({ to, body }), 'sendPaymentReceipt whatsapp');
}

async function sendPaymentFailed({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    const body = `Payment failed: ${amount} ${currency} for ${schoolName || ''}. Invoice ${invoiceId}. Please update payment method.`;
    return wrapServiceCall(sendWhatsApp({ to, body }), 'sendPaymentFailed whatsapp');
}

async function sendFeeReminder({ to, message }) {
    return wrapServiceCall(sendWhatsApp({ to, body: message }), 'sendFeeReminder whatsapp');
}

module.exports = {
    sendWelcome,
    sendTrialReminder,
    sendPaymentReceipt,
    sendPaymentFailed,
    sendFeeReminder,
};

