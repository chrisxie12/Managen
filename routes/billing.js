const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const jwt     = require('jsonwebtoken');
const axios   = require('axios');
const supabase = require('../config/db');
const schoolService = require('../services/schoolService');
const { getPublicPlans } = require('../services/provisionService');
const { initializePayment } = require('../services/billingService');
const { createNotification } = require('../services/notificationService');
const paymentWebhookService = require('../services/paymentWebhookService');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.schoolos_token
            || (req.headers.authorization?.startsWith('Bearer ')
                ? req.headers.authorization.slice(7)
                : null);
        if (!token)
            return res.status(401).json({ error: 'No token provided.' });
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        if (!req.tenant && (req.user?.schoolId || req.user?.tenantId)) {
            const schoolId = req.user.schoolId || req.user.tenantId;
            const { data: fallbackTenant, error } = await supabase
                .from('schools')
                .select('*')
                .eq('id', schoolId)
                .maybeSingle();
            if (!error && fallbackTenant) {
                req.tenant = fallbackTenant;
                req.tenantId = fallbackTenant.id;
            }
        }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

/**
 * POST /api/billing/webhook
 * Paystack webhook listener for charge.success events
 * Signature verified via HMAC-SHA512; uses req.rawBody captured by server.js express.json verify callback
 */
router.post('/webhook', async (req, res) => {
    const signature = req.headers['x-paystack-signature'];
    if (!paymentWebhookService.verifySignature(req.rawBody, signature)) {
        return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body;
    if (!event || !event.event) {
        return res.status(400).json({ error: 'Invalid webhook payload.' });
    }

    if (event.event === 'charge.success') {
        await paymentWebhookService.handleChargeSuccess(event);
    }

    res.sendStatus(200);
});

router.get('/', (req, res) => {
    try {
        return res.json({ data: { plans: getPublicPlans() } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching plans.' });
    }
});

/**
 * POST /api/billing/paystack-initialize
 * Initialize a Paystack transaction for an invoice
 * Body: { invoice_id, amount, email, callback_url }
 * Returns: { authorization_url, reference, invoice_id }
 */
router.post('/paystack-initialize', protect, async (req, res) => {
    try {
        const { invoice_id, amount, email, callback_url } = req.body;
        if (!invoice_id || !amount || !email) {
            return res.status(400).json({ error: 'invoice_id, amount, and email are required.' });
        }

        // Verify invoice exists and belongs to this user's school
        const { data: invoice, error: invErr } = await supabase
            .from('invoices')
            .select('id, school_id, student_id, total_amount, paid_amount, status, invoice_number, student:students(name)')
            .eq('id', invoice_id)
            .single();

        if (invErr || !invoice) {
            return res.status(404).json({ error: 'Invoice not found.' });
        }

        if (invoice.status === 'paid') {
            return res.status(400).json({ error: 'Invoice is already paid.' });
        }

        // Verify user has access to this invoice
        const userId = req.user.userId || req.user.id;
        const userRole = req.user.role;

        let authorized = false;
        if (['superadmin', 'school_admin', 'headmaster', 'teacher'].includes(userRole)) {
            authorized = true;
        } else if (userRole === 'student' && userId === invoice.student_id) {
            authorized = true;
        } else if (userRole === 'parent') {
            const { data: parentLink } = await supabase
                .from('parents')
                .select('id')
                .eq('user_id', userId)
                .eq('student_id', invoice.student_id)
                .single();
            if (parentLink) authorized = true;
        }

        if (!authorized) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        // Build metadata for Paystack webhook reconciliation
        const metadata = {
            tenant_id: invoice.school_id,
            invoice_id: invoice.id,
            student_id: invoice.student_id,
            custom_fields: [
                {
                    display_name: 'Invoice Number',
                    variable_name: 'invoice_number',
                    value: invoice.invoice_number,
                },
                {
                    display_name: 'Student Name',
                    variable_name: 'student_name',
                    value: invoice.student?.name || '',
                },
            ],
        };

        // Call Paystack to initialize transaction with metadata
        const paystackResponse = await initializePayment(email, amount, metadata);
        const reference = paystackResponse?.data?.reference;

        if (!reference) {
            return res.status(502).json({ error: 'Failed to initialize payment with Paystack.' });
        }

        // Create a pending payment record
        const { error: payErr } = await supabase.from('payments').insert({
            id: crypto.randomUUID(),
            school_id: invoice.school_id,
            invoice_id: invoice.id,
            student_id: invoice.student_id,
            amount: Number(amount),
            payment_method: 'card',
            reference,
            status: 'pending',
            notes: `Paystack transaction: ${reference}`,
        });

        if (payErr) {
            console.error('Failed to record pending payment:', payErr);
        }

        res.json({
            success: true,
            data: {
                authorization_url: paystackResponse?.data?.authorization_url,
                reference,
                invoice_id: invoice.id,
                invoice_number: invoice.invoice_number,
            }
        });
    } catch (error) {
        console.error('Paystack initialization error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message || 'Failed to initialize payment.' });
    }
});

/**
 * GET /api/billing/verify-payment
 * Verify Paystack payment and update invoice
 * Query: reference, invoice_id
 */
router.get('/verify-payment', async (req, res) => {
    try {
        const { reference, invoice_id } = req.query;
        if (!reference) {
            return res.status(400).json({ error: 'reference is required.' });
        }

        // Verify with Paystack
        const verifyResponse = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const paystackData = verifyResponse.data;
        const isSuccess = paystackData?.data?.status === 'success';

        if (!isSuccess) {
            return res.json({
                success: false,
                data: {
                    status: 'failed',
                    message: paystackData?.data?.gateway_response || 'Payment was not successful.',
                }
            });
        }

        // Find the pending payment by reference
        const { data: payment, error: payFindErr } = await supabase
            .from('payments')
            .select('id, invoice_id, student_id, school_id, amount, status')
            .eq('reference', reference)
            .single();

        if (payFindErr || !payment) {
            return res.status(404).json({ error: 'Payment record not found.' });
        }

        if (payment.status === 'completed') {
            return res.json({
                success: true,
                data: { status: 'already_completed', message: 'Payment was already completed.' }
            });
        }

        // Update payment to completed
        const { error: payUpdErr } = await supabase
            .from('payments')
            .update({
                status: 'completed',
                transaction_id: paystackData?.data?.id?.toString() || reference,
                payment_method: paystackData?.data?.channel === 'ussd' ? 'mobile_money' : 'card',
            })
            .eq('id', payment.id);

        if (payUpdErr) throw payUpdErr;

        // Update invoice paid_amount and status using schoolService
        const invoiceId = invoice_id || payment.invoice_id;
        const { data: invoice } = await supabase
            .from('invoices')
            .select('total_amount, paid_amount')
            .eq('id', invoiceId)
            .single();

        if (invoice) {
            const newPaid = Number(invoice.paid_amount) + Number(payment.amount);
            const newStatus = newPaid >= Number(invoice.total_amount) ? 'paid' : 'issued';

            const { error: invUpdErr } = await supabase
                .from('invoices')
                .update({ paid_amount: newPaid, status: newStatus })
                .eq('id', invoiceId);
            if (invUpdErr) console.error('Invoice update error:', invUpdErr);
        }

        // Notify student of payment
        try {
            await createNotification({
                userId: payment.student_id,
                schoolId: payment.school_id,
                title: 'Payment Received',
                message: `A payment of GH₵${payment.amount.toLocaleString()} has been received and applied to your invoice.`,
                type: 'fee',
                referenceId: invoiceId,
                referenceType: 'invoices',
            });
        } catch (err) {
            console.error('Failed to send payment notification:', err.message);
        }

        res.json({
            success: true,
            data: {
                status: 'completed',
                amount: payment.amount,
                message: 'Payment verified successfully.',
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message || 'Failed to verify payment.' });
    }
});

module.exports = router;
