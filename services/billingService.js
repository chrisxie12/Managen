const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * Initialize a transaction with Paystack
 * @param {string} email - Customer email
 * @param {number} amount - Amount in GHS
 * @returns {Promise<Object>} - Paystack response data
 */
const initializePayment = async (email, amount) => {
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

/**
 * Placeholder for future Paystack webhook handling
 * Keeping the export to prevent server.js from crashing
 */
const handleWebhook = async (req, res) => {
    console.log('Webhook received (placeholder)');
    return res.status(200).json({ received: true });
};

module.exports = { 
    initializePayment,
    handleWebhook 
};