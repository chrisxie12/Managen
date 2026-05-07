const axios = require('axios');
const crypto = require('crypto');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * Initialize a transaction with Paystack
 * @param {string} email - Customer email
 * @param {number} amount - Amount in GHS
 * @returns {Promise<Object>} - Paystack response data
 */
const initializePayment = async (email, amount) => {
    if (!PAYSTACK_SECRET_KEY) {
        const error = new Error('PAYSTACK_SECRET_KEY is not configured.');
        error.statusCode = 503;
        throw error;
    }

    try {
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email: email,
                amount: amount * 100, // Paystack uses pesewas (GHS 1 = 100 pesewas)
                currency: 'GHS'
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Paystack Initialization Error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const verifyPaystackSignature = (rawBody, signature) => {
    if (!PAYSTACK_SECRET_KEY || !signature || !Buffer.isBuffer(rawBody)) {
        return false;
    }

    const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(rawBody)
        .digest('hex');

    const expected = Buffer.from(hash, 'hex');
    const provided = Buffer.from(String(signature), 'hex');

    return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
};

const handlePaystackWebhook = async (req, res) => {
    if (!PAYSTACK_SECRET_KEY) {
        return res.status(503).json({ error: 'PAYSTACK_SECRET_KEY is not configured.' });
    }

    const signature = req.headers['x-paystack-signature'];
    if (!verifyPaystackSignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    let event;
    try {
        event = JSON.parse(req.body.toString('utf8'));
    } catch (error) {
        return res.status(400).json({ error: 'Invalid webhook payload.' });
    }

    // TODO: persist successful charges/subscription events once billing tables are finalized.
    return res.status(200).json({ received: true, event: event.event || null });
};

const handleStripeWebhook = async (req, res) => {
    return res.status(501).json({ error: 'Stripe webhooks are not configured for this service.' });
};

module.exports = { 
    initializePayment,
    handlePaystackWebhook,
    handleStripeWebhook,
    verifyPaystackSignature,
};
