# Paystack Webhook Reconciliation Layer

## Goal
Build an automated transaction reconciliation layer for SchoolOS by implementing a Paystack webhook listener that processes `charge.success` events atomically and triggers parent SMS notifications.

## Design

### 1. Database RPC — `process_paystack_payment`

A PostgreSQL function in a new migration `20260519100000_paystack_webhook_rpc.sql`.

```sql
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
    'success', true, 'payment_id', v_payment_id,
    'paid_amount', v_new_paid_amount, 'total_amount', v_invoice.total_amount, 'status', v_new_status
  );
END;
$$;
```

### 2. New Service — `services/paymentWebhookService.js`

**Exports:**

| Function | Purpose |
|----------|---------|
| `verifySignature(rawBody, signature)` | HMAC-SHA512 of raw body vs `x-paystack-signature` using `crypto.timingSafeEqual` |
| `resolvePaymentChannel(paystackData)` | Maps Paystack `channel` + `authorization.bank` to `{ payment_method, provider }` |
| `handleChargeSuccess(event)` | Orchestrates the webhook processing |

**Provider mapping (case-insensitive):**
- `authorization.bank` lowercase: `'vodafone'` or `'telecel'` → `'telecel'`
- `authorization.bank` lowercase: `'airteltigo'` → `'at'`
- `authorization.bank` lowercase: `'mtn'` → `'mtn'`
- `authorization.brand` for card: `'visa'`, `'mastercard'`, etc.

**`handleChargeSuccess` flow:**
1. Extract `data.reference`, `data.metadata.{tenant_id, invoice_id, student_id}`, `data.amount / 100`, `data.channel`, `data.authorization`
2. Validate presence of reference, tenant_id, invoice_id, student_id
3. Call `supabase.rpc('process_paystack_payment', {...})` — **awaited** before HTTP 200
4. If RPC succeeds, look up parent phone from `parents` + `users` tables (fallback to `students.phone`)
5. Fire `smsService.sendPaymentReceipt()` — **after** 200 response, fire-and-forget

### 3. Route — `POST /api/billing/webhook`

In `routes/billing.js`:

```js
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['x-paystack-signature'];
  if (!paymentWebhookService.verifySignature(req.body, sig)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  const event = JSON.parse(req.body.toString('utf8'));
  if (event.event === 'charge.success') {
    await paymentWebhookService.handleChargeSuccess(event);
  }
  res.sendStatus(200);
});
```

The `express.raw()` middleware on this specific route provides the raw `Buffer` needed for HMAC. The global `express.json()` in `server.js` will not interfere because route-level middleware runs before the next handler.

### 4. Initialize Payment Metadata

Add metadata to `POST /paystack-initialize`:
```js
metadata: { tenant_id, invoice_id, student_id }
```
Passed through `initializePayment()` to the Paystack API call. This ensures the webhook receives structured metadata for idempotent processing.

### 5. Error Handling & Idempotency

- **RPC idempotency:** The `FOR UPDATE` lock + `status = 'paid'` guard prevents double-spends. A second webhook for the same invoice sees `paid` and returns `{ success: false, error: 'Invoice already paid' }` — logged, no crash.
- **Return 200 always:** If processing fails (bad metadata, missing invoice), log the error but still return 200. Paystack will retry on non-200; we don't want retries for unrecoverable errors.
- **SMS failures:** Logged and swallowed. The payment state is already committed; SMS is a soft notification.

### 6. Files Changed/Created

| File | Action |
|------|--------|
| `supabase/migrations/20260519100000_paystack_webhook_rpc.sql` | **Create** — RPC function |
| `services/paymentWebhookService.js` | **Create** — webhook logic |
| `services/billingService.js` | **Edit** — remove `handlePaystackWebhook` + `verifyPaystackSignature` (moved to new service), export `initializePayment` with metadata support |
| `routes/billing.js` | **Edit** — add `POST /webhook` route, update `POST /paystack-initialize` to pass metadata |

### 7. Security Considerations

- Signature verification before any processing prevents spoofed requests
- `crypto.timingSafeEqual` prevents timing attacks
- RPC uses `SECURITY DEFINER` to run with elevated privileges but only performs specific INSERT/UPDATE
- No credential exposure in error responses
- Invoice `FOR UPDATE` lock prevents race conditions from concurrent webhook deliveries
