const stripe   = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../config/db');
const { suspendSchool } = require('./provisionService');
const emailService = require('./emailService');
const smsService = require('./smsService');
const whatsappService = require('./whatsappService');

const findTenantByCustomerId = async (customerId) => {
    if (!customerId) return null;

    const { data: tenant, error } = await supabase
        .from('tenants')
        .select('id, school_name, status, customer_id, subscription_id')
        .eq('customer_id', customerId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return tenant;
};

const paymentExists = async (stripeInvoiceId) => {
    if (!stripeInvoiceId) return false;

    const { data, error } = await supabase
        .from('payments')
        .select('id')
        .eq('stripe_invoice_id', stripeInvoiceId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return Boolean(data);
};

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'invoice.paid': {
                const invoice = event.data.object;
                const tenant = await findTenantByCustomerId(invoice.customer);

                if (tenant && !(await paymentExists(invoice.id))) {
                    const { error: paymentError } = await supabase.from('payments').insert({
                        id: require('crypto').randomUUID(),
                        tenant_id: tenant.id,
                        school_name: tenant.school_name,
                        amount: invoice.amount_paid / 100,
                        status: 'paid',
                        stripe_invoice_id: invoice.id,
                    });

                    if (paymentError) {
                        throw paymentError;
                    }
                }

                if (tenant && tenant.status !== 'active') {
                    const { error: tenantError } = await supabase
                        .from('tenants')
                        .update({ status: 'active' })
                        .eq('id', tenant.id);

                    if (tenantError) {
                        throw tenantError;
                    }
                }
                // Send payment receipt notifications (do not fail webhook on notification errors)
                try {
                    const toEmail = tenant && tenant.email;
                    const toPhone = tenant && tenant.phone;
                    const amount = invoice.amount_paid / 100;
                    const invoiceId = invoice.id;

                    const promises = [];
                    if (toEmail) promises.push(emailService.sendPaymentReceipt({ to: toEmail, amount, invoiceId, name: tenant.admin_name, schoolName: tenant.school_name }));
                    if (toPhone) promises.push(smsService.sendPaymentReceipt({ to: toPhone, amount, invoiceId, name: tenant.admin_name, schoolName: tenant.school_name }));
                    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM && toPhone) {
                        promises.push(whatsappService.sendPaymentReceipt({ to: toPhone, amount, invoiceId, name: tenant.admin_name, schoolName: tenant.school_name }));
                    }
                    await Promise.allSettled(promises);
                } catch (notifyErr) {
                    console.error('Payment receipt notifications failed:', notifyErr);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const tenant = await findTenantByCustomerId(invoice.customer);
                if (tenant) {
                    await suspendSchool(tenant.id);
                    // notify tenant about failed payment
                    try {
                        const toEmail = tenant.email;
                        const toPhone = tenant.phone;
                        const amount = invoice && invoice.amount_due / 100;
                        const invoiceId = invoice && invoice.id;
                        const promises = [];
                        if (toEmail) promises.push(emailService.sendPaymentFailed({ to: toEmail, amount, invoiceId, name: tenant.admin_name, schoolName: tenant.school_name }));
                        if (toPhone) promises.push(smsService.sendPaymentFailed({ to: toPhone, amount, invoiceId, name: tenant.admin_name, schoolName: tenant.school_name }));
                        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM && toPhone) {
                            promises.push(whatsappService.sendPaymentFailed({ to: toPhone, amount, invoiceId, name: tenant.admin_name, schoolName: tenant.school_name }));
                        }
                        await Promise.allSettled(promises);
                    } catch (notifyErr) {
                        console.error('Payment failed notifications failed:', notifyErr);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                const { data: tenant, error } = await supabase
                    .from('tenants')
                    .select('id')
                    .eq('subscription_id', sub.id)
                    .maybeSingle();

                if (error) {
                    throw error;
                }

                if (tenant) await suspendSchool(tenant.id);
                break;
            }

            default:
                break;
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook processing error:', error);
        res.status(500).json({ message: 'Webhook processing failed.' });
    }
};

module.exports = { handleWebhook };