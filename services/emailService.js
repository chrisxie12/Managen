const axios = require('axios');
const { attemptRequest, wrapServiceCall } = require('./notificationUtils');

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM = process.env.MAILGUN_FROM || `Managen <no-reply@${MAILGUN_DOMAIN || 'example.com'}>`;

async function sendMailgunMessage({ to, subject, text, html }) {
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
        throw new Error('Mailgun not configured (MAILGUN_API_KEY or MAILGUN_DOMAIN missing)');
    }

    const url = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;
    const params = new URLSearchParams();
    params.append('from', MAILGUN_FROM);
    params.append('to', to);
    params.append('subject', subject || 'Managen Notification');
    if (text) params.append('text', text);
    if (html) params.append('html', html);

    const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');

    return attemptRequest(() => axios.post(url, params.toString(), {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }));
}

async function sendWelcome({ to, name, schoolName }) {
    const subject = `Welcome to ${schoolName || 'Managen'}`;
    const text = `Hello ${name || ''},\n\nWelcome to ${schoolName || 'your new school on Managen'}. Your account has been created.\n\nLogin at your subdomain to get started.`;
    return wrapServiceCall(sendMailgunMessage({ to, subject, text }), 'sendWelcome email');
}

async function sendTrialReminder({ to, name, daysLeft, schoolName }) {
    const subject = `Your ${schoolName || 'Managen'} trial ends in ${daysLeft} day(s)`;
    const text = `Hi ${name || ''},\n\nYour trial for ${schoolName || 'Managen'} ends in ${daysLeft} day(s). Please add a payment method to avoid suspension.`;
    return wrapServiceCall(sendMailgunMessage({ to, subject, text }), 'sendTrialReminder email');
}

async function sendPaymentReceipt({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    const subject = `Payment received — ${schoolName || 'Managen'}`;
    const text = `Hello ${name || ''},\n\nWe received your payment of ${amount} ${currency} for ${schoolName || ''}. Invoice: ${invoiceId}. Thank you.`;
    return wrapServiceCall(sendMailgunMessage({ to, subject, text }), 'sendPaymentReceipt email');
}

async function sendPaymentFailed({ to, name, amount, currency = 'GHS', invoiceId, schoolName }) {
    const subject = `Payment failed — ${schoolName || 'Managen'}`;
    const text = `Hello ${name || ''},\n\nWe were unable to process payment of ${amount} ${currency} for ${schoolName || ''}. Invoice: ${invoiceId}. Please update your payment method.`;
    return wrapServiceCall(sendMailgunMessage({ to, subject, text }), 'sendPaymentFailed email');
}

async function sendPasswordReset({ to, name, resetLink }) {
    const subject = 'Reset your Managen password';
    const text = `Hello ${name || ''},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you did not request this, please ignore this email.`;
    return wrapServiceCall(sendMailgunMessage({ to, subject, text }), 'sendPasswordReset email');
}

async function sendEmailVerification({ to, name, verifyLink }) {
    const subject = 'Verify your Managen email address';
    const text = `Hello ${name || ''},\n\nWelcome to Managen! Click the link below to verify your email address:\n\n${verifyLink}\n\nThis link expires in 24 hours.`;
    return wrapServiceCall(sendMailgunMessage({ to, subject, text }), 'sendEmailVerification email');
}

async function sendFeeReminder({ to, subject, message }) {
    const resolvedSubject = subject || 'Managen fee reminder';
    const resolvedMessage = message || 'You have an outstanding school fee payment.';
    return wrapServiceCall(sendMailgunMessage({ to, subject: resolvedSubject, text: resolvedMessage }), 'sendFeeReminder email');
}

module.exports = {
    sendWelcome,
    sendTrialReminder,
    sendPaymentReceipt,
    sendPaymentFailed,
    sendPasswordReset,
    sendEmailVerification,
    sendFeeReminder,
};

