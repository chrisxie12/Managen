const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * Initialize a transaction with Paystack
 * @param {string} email - Customer email
 * @param {number} amount - Amount in GHS
 * @param {object} [metadata] - Optional metadata (tenant_id, invoice_id, student_id, custom_fields)
 * @returns {Promise<Object>} - Paystack response data
 */
const initializePayment = async (email, amount, metadata) => {
    if (!PAYSTACK_SECRET_KEY) {
        const error = new Error('PAYSTACK_SECRET_KEY is not configured.');
        error.statusCode = 503;
        throw error;
    }

    try {
        const payload = {
            email,
            amount: amount * 100,
            currency: 'GHS',
        };
        if (metadata) payload.metadata = metadata;

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Paystack Initialization Error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = { initializePayment };
