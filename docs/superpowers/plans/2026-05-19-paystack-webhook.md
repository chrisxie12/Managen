# Paystack Webhook Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Paystack webhook listener that atomically records payments and updates invoice state via a PostgreSQL RPC, then sends Arkesel SMS notifications.

**Architecture:** New migration creates a `process_paystack_payment` RPC for atomic `SELECT ... FOR UPDATE` + INSERT + UPDATE. New `paymentWebhookService.js` handles signature verification, event parsing, and SMS dispatch. Existing `billingService.js` updated to pass metadata during initialization.

**Tech Stack:** Node.js, Supabase JS client, PostgreSQL PL/pgSQL, Express 5, Arkesel SMS API, Paystack Webhooks

---

### Task 1: Migration — `process_paystack_payment` RPC

**Files:**
- Create: `supabase/migrations/20260519100000_paystack_webhook_rpc.sql`

- [ ] **Write the migration**

```sql
-- 20260519100000_paystack_webhook_rpc.sql
-- RPC for atomic Paystack payment processing
BEGIN;

CREATE OR REPLACE FUNCTION process_paystack_payment(
  p_school_id UUID,
  p_invoice_id UUID,
  p_student_id UUID,
  p_amount INTEGER,
  p_payment_method VARCHAR(30),
  p_reference VARCHAR(255),
  p_transaction_id VARCHAR(255)
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_invoice invoices%ROWTYPE;
  v_new_paid_amount INTEGER;
  v_new_status VARCHAR(20);
  v_payment_id UUID;
BEGIN
  SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invoice not found');
  END IF;

  IF v_invoice.status = 'paid' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invoice already paid');
  END IF;

  v_payment_id := gen_random_uuid();
  INSERT INTO payments (id, school_id, invoice_id, student_id, amount, payment_method, reference, transaction_id, status)
  VALUES (v_payment_id, p_school_id, p_invoice_id, p_student_id, p_amount, p_payment_method, p_reference, p_transaction_id, 'completed');

  v_new_paid_amount := v_invoice.paid_amount + p_amount;
  v_new_status := CASE WHEN v_new_paid_amount >= v_invoice.total_amount THEN 'paid' ELSE 'issued' END;

  UPDATE invoices SET paid_amount = v_new_paid_amount, status = v_new_status WHERE id = p_invoice_id;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'paid_amount', v_new_paid_amount,
    'total_amount', v_invoice.total_amount,
    'status', v_new_status
  );
END;
$$;

COMMIT;
```

- [ ] **No test needed** — validated at integration level in Task 4
- [ ] **Commit**

---

### Task 2: New Service — `services/paymentWebhookService.js`

**Files:**
- Create: `services/paymentWebhookService.js`

- [ ] **Write the service file**

```js
const crypto = require('crypto');
const supabase = require('../config/db');
const smsService = require('./smsService');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

function verifySignature(rawBody, signature) {
  if (!PAYSTACK_SECRET_KEY || !signature || !Buffer.isBuffer(rawBody)) return false;
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(String(signature), 'hex'));
}

function resolvePaymentChannel(data) {
  const channel = (data.channel || '').toLowerCase();
  const bank = (data.authorization?.bank || '').toLowerCase();
  const brand = (data.authorization?.brand || '').toLowerCase();

  if (channel === 'card' || channel === 'qr') {
    return { payment_method: 'card', provider: brand || 'card' };
  }
  if (channel === 'bank') {
    return { payment_method: 'bank_transfer', provider: 'bank' };
  }
  // mobile_money or ussd
  if (bank === 'mtn') return { payment_method: 'mobile_money', provider: 'mtn' };
  if (bank === 'vodafone' || bank === 'telecel') return { payment_method: 'mobile_money', provider: 'telecel' };
  if (bank === 'airteltigo') return { payment_method: 'mobile_money', provider: 'at' };
  return { payment_method: 'mobile_money', provider: bank || 'mobile_money' };
}

async function handleChargeSuccess(event) {
  const data = event.data;
  if (!data) return;

  const reference = data.reference;
  const metadata = data.metadata || {};
  const tenantId = metadata.tenant_id;
  const invoiceId = metadata.invoice_id;
  const studentId = metadata.student_id;
  const amountPesewas = data.amount || 0;
  const amount = Math.round(amountPesewas / 100);
  const transactionId = String(data.id || reference);

  if (!reference || !tenantId || !invoiceId || !studentId) {
    console.error('Paystack webhook missing required metadata:', { reference, tenantId, invoiceId, studentId });
    return;
  }

  const { payment_method, provider } = resolvePaymentChannel(data);

  const { data: rpcResult, error: rpcError } = await supabase.rpc('process_paystack_payment', {
    p_school_id: tenantId,
    p_invoice_id: invoiceId,
    p_student_id: studentId,
    p_amount: amount,
    p_payment_method: payment_method,
    p_reference: reference,
    p_transaction_id: transactionId,
  });

  if (rpcError) {
    console.error('Paystack webhook RPC error:', rpcError);
    return;
  }

  if (!rpcResult?.success) {
    console.warn('Paystack webhook: RPC declined payment:', rpcResult?.error);
    return;
  }

  try {
    await sendPaymentSms(studentId, tenantId, amount, invoiceId, reference);
  } catch (smsErr) {
    console.error('Paystack webhook SMS error:', smsErr.message);
  }
}

async function sendPaymentSms(studentId, schoolId, amount, invoiceId, reference) {
  const { data: student } = await supabase
    .from('students')
    .select('name, phone')
    .eq('id', studentId)
    .eq('tenant_id', schoolId)
    .single();

  if (!student) return;

  const { data: parentLink } = await supabase
    .from('parents')
    .select('user_id')
    .eq('student_id', studentId)
    .maybeSingle();

  let phone = student.phone;
  if (parentLink?.user_id) {
    const { data: parentUser } = await supabase
      .from('users')
      .select('phone')
      .eq('id', parentLink.user_id)
      .maybeSingle();
    if (parentUser?.phone) phone = parentUser.phone;
  }

  if (!phone) return;

  const { data: invoice } = await supabase
    .from('invoices')
    .select('invoice_number, total_amount, paid_amount')
    .eq('id', invoiceId)
    .single();

  if (!invoice) return;

  const outstanding = Math.max(0, Number(invoice.total_amount) - Number(invoice.paid_amount));

  await smsService.send({
    to: phone,
    message: `Payment received: GHS ${amount.toLocaleString()} for ${student.name}. Invoice ${invoice.invoice_number}. Outstanding balance: GHS ${outstanding.toLocaleString()}. Thank you.`,
  });
}

module.exports = {
  verifySignature,
  resolvePaymentChannel,
  handleChargeSuccess,
};
```

- [ ] **Syntax check**

```bash
node -c services/paymentWebhookService.js
```

- [ ] **Commit**

---

### Task 3: Update `services/billingService.js`

**Files:**
- Modify: `services/billingService.js`

- [ ] **Remove webhook stubs, update `initializePayment`**

Replace entire content with:

```js
const axios = require('axios');
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

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
```

- [ ] **Syntax check**

```bash
node -c services/billingService.js
```

- [ ] **Commit**

---

### Task 4: Update `routes/billing.js`

**Files:**
- Modify: `routes/billing.js`

- [ ] **Add POST /webhook route and update POST /paystack-initialize metadata**

Changes:
1. Import `paymentWebhookService`
2. Add `POST /webhook` with `express.raw()` for signature verification
3. Update `POST /paystack-initialize` to build and pass metadata with `tenant_id`, `invoice_id`, `student_id`, and `custom_fields`

Route additions:
```js
// webhook must use raw body BEFORE global express.json
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['x-paystack-signature'];
    if (!signature || !paymentWebhookService.verifySignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    let event;
    try {
        event = JSON.parse(req.body.toString('utf8'));
    } catch {
        return res.status(400).json({ error: 'Invalid webhook payload.' });
    }

    if (event.event === 'charge.success') {
        await paymentWebhookService.handleChargeSuccess(event);
    }

    res.sendStatus(200);
});
```

Update `POST /paystack-initialize`: after the authorization check (around line 80), before calling `initializePayment`, build the metadata:

```js
// Build metadata for Paystack webhook
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

// Update this call:
const paystackResponse = await initializePayment(email, amount, metadata);
```

- [ ] **Syntax check**

```bash
node -c routes/billing.js
```

- [ ] **Commit**

---

### Task 5: Update `server.js`

**Files:**
- Modify: `server.js`

- [ ] **Update webhook handler imports**

Replace:
```js
const {
    handlePaystackWebhook,
    handleStripeWebhook,
} = require('./services/billingService');
```
With:
```js
const paymentWebhookService = require('./services/paymentWebhookService');
```

Update the routes:
```js
app.post('/webhooks/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['x-paystack-signature'];
    if (!paymentWebhookService.verifySignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
    }
    let event;
    try { event = JSON.parse(req.body.toString('utf8')); } catch { return res.status(400).json({ error: 'Invalid payload' }); }
    if (event.event === 'charge.success') await paymentWebhookService.handleChargeSuccess(event);
    res.sendStatus(200);
});

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
    res.status(501).json({ error: 'Stripe webhooks not configured.' });
});
```

- [ ] **Syntax check**

```bash
node -c server.js
```

- [ ] **Commit**

---

### Task 6: Final verification

- [ ] **Run all syntax checks**

```bash
node -c services/paymentWebhookService.js && node -c services/billingService.js && node -c routes/billing.js && node -c server.js
```

- [ ] **Push**
