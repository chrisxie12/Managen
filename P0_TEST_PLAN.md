# P0 CRITICAL FIXES — TEST PLAN
**Verification Procedures for Production Readiness**

## 🎯 Test Objectives

Verify that all P0 critical fixes:
1. Work correctly in isolation
2. Integrate properly with existing code
3. Don't introduce regressions
4. Meet production readiness criteria
5. Are properly monitored and alerted

---

## ✅ TEST 1: PUBLIC HEALTH ENDPOINT

### Objective
Verify uptime monitoring endpoints work correctly for UptimeRobot integration

### Test Cases

**1a. Health Status Endpoint**
```bash
# Test endpoint
curl -v http://localhost:3000/status/status

# Expected:
# - Status Code: 200 (when DB is up)
# - Body: {"status":"ok"}
# - Headers: Content-Type: application/json
```

**1b. Health Status When Database Down**
```bash
# Stop PostgreSQL/Supabase
# (simulate with env var: DB_DISABLED=true)

curl -v http://localhost:3000/status/status

# Expected:
# - Status Code: 503 (Service Unavailable)
# - Body: {"status":"database_error", "message":"Database connection failed"}
```

**1c. Kubernetes Liveness Probe**
```bash
curl -v http://localhost:3000/health/live

# Expected:
# - Always 200 (indicates app is running)
# - Body: {"status":"alive"}
```

**1d. Kubernetes Readiness Probe**
```bash
# With database up
curl -v http://localhost:3000/health/ready
# Expected: 200

# With database down
curl -v http://localhost:3000/health/ready
# Expected: 503
```

**1e. Detailed Health Check**
```bash
curl -s http://localhost:3000/health/detailed | jq .

# Expected output:
{
  "status": "ok",
  "data": {
    "db": {
      "connected": true,
      "latency_ms": 5
    },
    "redis": {
      "connected": true,
      "latency_ms": 2
    },
    "memory": {
      "used_percent": 45.2,
      "total_mb": 512
    },
    "uptime_seconds": 3600,
    "timestamp": "2026-05-20T10:30:00Z"
  }
}
```

### Success Criteria
- [ ] /status/status returns 200 when healthy
- [ ] /status/status returns 503 when database down
- [ ] /health/live always returns 200
- [ ] /health/ready returns 200 when healthy, 503 when down
- [ ] /health/detailed returns full diagnostics
- [ ] No authentication required (public endpoint)
- [ ] Response time < 100ms

### Production Verification
- [ ] Configure UptimeRobot to monitor /status/status
- [ ] Set alert threshold to 5+ minutes downtime
- [ ] Verify alert emails received
- [ ] Test failover: restart app, verify endpoint recovers

---

## ✅ TEST 2: PAYMENT RECONCILIATION SERVICE

### Objective
Verify payment reconciliation detects all mismatches and alerts correctly

### Prerequisites
- Have at least 3 test schools
- Have test data with various payment scenarios

### Test Cases

**2a. Orphan Payment Detection**
```bash
# Setup: Create a fee_payment record without corresponding Paystack transaction
# 1. Manually insert into fee_payments table:
INSERT INTO fee_payments (school_id, student_id, invoice_id, amount, status)
VALUES ('school1', 'student1', 'invoice1', 500, 'completed');

# 2. Run reconciliation
curl -X POST http://localhost:3000/api/cron/payments/reconcile \
  -H "x-cron-secret: YOUR_SECRET"

# Expected response:
{
  "status": "completed",
  "data": {
    "schools_reconciled": 3,
    "issues_found": 1,
    "results": [
      {
        "school_id": "school1",
        "orphan_payments": 1,
        "mismatches": [
          {
            "type": "ORPHAN_PAYMENT",
            "fee_payment_id": "...",
            "amount": 500,
            "severity": "HIGH"
          }
        ]
      }
    ]
  }
}
```

**2b. Orphan Transaction Detection**
```bash
# Setup: Paystack payment succeeds but fee_payments record not created
# (Simulate network failure after Paystack response)

# Run reconciliation
curl -X POST http://localhost:3000/api/cron/payments/reconcile \
  -H "x-cron-secret: YOUR_SECRET"

# Expected: ORPHAN_TRANSACTION detected and logged
```

**2c. Amount Mismatch Detection**
```bash
# Setup: fee_payment shows 500 GHS, but Paystack transaction is 600 GHS

# Run reconciliation
curl -X POST http://localhost:3000/api/cron/payments/reconcile \
  -H "x-cron-secret: YOUR_SECRET"

# Expected:
{
  "type": "AMOUNT_MISMATCH",
  "severity": "CRITICAL",
  "fee_amount": 500,
  "transaction_amount": 600,
  "difference": 100
}
```

**2d. Status Mismatch Detection**
```bash
# Setup: fee_payment status is 'pending', but Paystack shows 'success'

# Run reconciliation
# Expected: STATUS_MISMATCH logged with severity HIGH
```

**2e. Manual School Reconciliation**
```bash
# Test manual reconciliation endpoint
curl -X POST http://localhost:3000/api/cron/payments/reconcile/school123 \
  -H "x-cron-secret: YOUR_SECRET"

# Expected:
# - Returns reconciliation result for single school
# - Response < 2 seconds
```

**2f. Email Alert to School Admin**
```bash
# After running reconciliation with mismatches
# Check email inbox of school admin

# Expected email:
# Subject: ⚠️ Payment Reconciliation Alert - School Name
# Body:
# - Number of mismatches found
# - List of issues (orphan payments, amount mismatches, etc.)
# - Link to admin dashboard
# - Recommended action
```

### Success Criteria
- [ ] All 4 mismatch types detected correctly
- [ ] Severity levels assigned appropriately
- [ ] Email alerts sent to school admins
- [ ] Reconciliation results stored in DB
- [ ] Handles 500+ payments per school in < 10 seconds
- [ ] Cron endpoint returns proper authorization check
- [ ] Manual endpoint works for single school

### Production Verification
- [ ] Run on staging database with 50 schools
- [ ] Verify all schools reconcile in < 1 hour
- [ ] Check reconciliation_logs table for results
- [ ] Verify no orphan payments exist

---

## ✅ TEST 3: RATE LIMITING

### Objective
Verify rate limiting protects endpoints from abuse

### Test Cases

**3a. Auth Rate Limiting (5 attempts/minute)**
```bash
# Test: Make 6 login attempts in quick succession
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "Attempt $i"
done

# Expected:
# - Attempts 1-5: 401 Unauthorized
# - Attempt 6: 429 Too Many Requests
# - Response header: Retry-After: 60
```

**3b. Notification Rate Limiting (10 requests/minute)**
```bash
# Test: Send 11 notifications in quick succession
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/school/communications/whatsapp/send \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"to":"234XXXXXXXXXX","message":"Test"}' 
done

# Expected:
# - Requests 1-10: 200 OK
# - Request 11: 429 Too Many Requests
```

**3c. Payment Rate Limiting (20 requests/minute)**
```bash
# Test: Make 21 payment requests rapidly
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/billing/initialize \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"amount":500,"reference":"test-'$i'"}' &
done
wait

# Expected:
# - Requests 1-20: Process normally
# - Request 21: 429 Too Many Requests
```

**3d. Email/SMS Limiter (5 per hour per recipient)**
```bash
# Test: Send 6 emails to same recipient
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/school/communications/email/send \
    -H "Authorization: Bearer TOKEN" \
    -d '{"to":"parent@example.com","subject":"Payment reminder"}' 
done

# Expected:
# - Emails 1-5: 200 OK
# - Email 6: 429 Too Many Requests
```

**3e. Rate Limit Reset**
```bash
# After hitting rate limit, wait for window to pass
sleep 61

# Make request again
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Expected: 200 or 401 (not 429)
```

### Success Criteria
- [ ] Auth limiter blocks after 5 attempts/minute
- [ ] Notification limiter blocks after 10 requests/minute
- [ ] Payment limiter blocks after 20 requests/minute
- [ ] Email/SMS limiter blocks after 5/hour per recipient
- [ ] All 429 responses include Retry-After header
- [ ] Limits reset after window expires
- [ ] Redis-backed (distributed across instances)

### Production Verification
- [ ] Load test with 100 concurrent connections
- [ ] Verify CPU/memory under normal conditions
- [ ] Monitor rate limit hit rate (should be <1% for legitimate traffic)

---

## ✅ TEST 4: RECEIPT GENERATION

### Objective
Verify receipts generate correctly and are delivered to recipients

### Test Cases

**4a. Receipt PDF Generation**
```bash
# Trigger a payment that generates receipt
# (Setup in paymentWebhookService.js integration)

# After payment:
ls -la receipts/
# Expected: REC-*.pdf file exists

# Verify PDF is valid
file receipts/REC-*.pdf
# Expected: PDF document

# Verify PDF contains data
pdftotext receipts/REC-*.pdf - | head -10
# Expected: School name, receipt ID, amount, etc.
```

**4b. Receipt Metadata Storage**
```bash
# Check receipts table
curl -X GET "http://localhost:3000/api/school/receipts?limit=1" \
  -H "Authorization: Bearer TOKEN" | jq .

# Expected:
{
  "data": {
    "receipt_id": "REC-1234567890-abcd1234",
    "student_id": "student-uuid",
    "invoice_id": "invoice-uuid",
    "amount": 500.00,
    "currency": "GHS",
    "generated_at": "2026-05-20T10:30:00Z",
    "receipt_url": "/receipts/REC-1234567890-abcd1234.pdf"
  }
}
```

**4c. Receipt Email Delivery**
```bash
# After payment, check email inbox
# Expected email:
# - Subject: Payment Receipt - [School Name]
# - Body: Payment details, amount, reference
# - Attachment: PDF receipt

# Verify email received within 30 seconds
```

**4d. QR Code Verification**
```bash
# Extract QR code from PDF
# Scan with phone or QR code reader

# Expected: Links to receipt verification page
# URL format: https://getschoolos.me/verify-receipt/REC-1234567890-abcd1234

# Verify page displays:
# - Receipt details
# - QR code
# - Download link
```

**4e. Receipt Retrieval by ID**
```bash
curl http://localhost:3000/api/school/receipts/REC-1234567890-abcd1234 \
  -H "Authorization: Bearer TOKEN"

# Expected: Receipt metadata + download link
```

### Success Criteria
- [ ] PDF generates within 5 seconds of payment
- [ ] All receipts stored in DB
- [ ] Email sent within 30 seconds
- [ ] QR code scans and links to verification page
- [ ] Receipt file path is correct
- [ ] Parent can access own receipts only (RLS working)

### Production Verification
- [ ] Generate 100 receipts in rapid succession
- [ ] Verify disk space not exhausted (receipts/ folder size)
- [ ] Test receipt download speed (< 1 second)

---

## ✅ TEST 5: PARTIAL & OVERPAYMENT HANDLING

### Objective
Verify complex payment scenarios are handled correctly

### Test Cases

**5a. Partial Payment Processing**
```bash
# Invoice amount: 1000 GHS
# Parent pays: 600 GHS

# Run payment through paymentHandlingService
curl -X POST http://localhost:3000/api/cron/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "inv-123",
    "amount": 600,
    "paymentMethod": "paystack"
  }'

# Expected response:
{
  "status": "partial_payment",
  "invoiceId": "inv-123",
  "paymentAmount": 600,
  "remaining": 400
}

# Verify in DB:
SELECT * FROM invoices WHERE id = 'inv-123';
-- Expected: status = 'partially_paid', amount_paid = 600
```

**5b. Full Payment Processing**
```bash
# Invoice amount: 1000 GHS
# Parent pays: 1000 GHS

curl -X POST http://localhost:3000/api/cron/payments/process \
  -d '{
    "invoiceId": "inv-124",
    "amount": 1000,
    "paymentMethod": "paystack"
  }'

# Expected response:
{
  "status": "full_payment",
  "invoiceId": "inv-124",
  "remaining": 0
}

# Verify in DB:
-- Expected: status = 'paid', amount_paid = 1000
```

**5c. Overpayment Processing**
```bash
# Invoice amount: 1000 GHS
# Parent pays: 1200 GHS

curl -X POST http://localhost:3000/api/cron/payments/process \
  -d '{
    "invoiceId": "inv-125",
    "amount": 1200,
    "paymentMethod": "paystack"
  }'

# Expected response:
{
  "status": "overpayment",
  "invoiceId": "inv-125",
  "creditApplied": 1000,
  "creditBalance": 200
}

# Verify credit balance created:
SELECT * FROM credit_balances WHERE student_id = 'student-123';
-- Expected: balance = 200, expires_at = (1 year from now)
```

**5d. Credit Balance Auto-Apply**
```bash
# Student has 200 GHS credit balance
# New invoice: 500 GHS

# System automatically applies credit:
curl -X POST http://localhost:3000/api/cron/payments/apply-credit \
  -d '{"studentId": "student-123", "invoiceId": "inv-126"}'

# Expected response:
{
  "creditApplied": 200,
  "invoiceRemaining": 300,
  "creditRemaining": 0
}

# Verify in DB:
-- fee_payments shows 200 GHS as 'credit_balance' type
-- credit_balances shows balance = 0
-- invoices shows amount_paid = 200
```

**5e. Payment Summary**
```bash
curl http://localhost:3000/api/school/payments/summary/student-123 \
  -H "Authorization: Bearer TOKEN"

# Expected:
{
  "totalDue": 5000,
  "totalPaid": 3800,
  "totalOwing": 1200,
  "creditBalance": 150,
  "invoices": [
    {"id": "inv-1", "status": "paid", "amount_due": 500, "amount_paid": 500},
    {"id": "inv-2", "status": "partially_paid", "amount_due": 1000, "amount_paid": 600},
    {"id": "inv-3", "status": "unpaid", "amount_due": 3500, "amount_paid": 0}
  ],
  "summary": {
    "paidInFull": 3,
    "partiallyPaid": 2,
    "unpaid": 5
  }
}
```

### Success Criteria
- [ ] Partial payments recorded with correct status
- [ ] Full payments mark invoice as paid
- [ ] Overpayments create credit balance
- [ ] Credit balance expires after 1 year
- [ ] Auto-apply works correctly
- [ ] Parent sees correct payment summary
- [ ] No double-counting of payments

### Production Verification
- [ ] Test with 50 schools, 500+ students
- [ ] Verify no orphan credit balances
- [ ] Confirm all payment types tracked in fee_payments

---

## ✅ TEST 6: RLS POLICY AUDIT

### Objective
Verify all sensitive tables have Row-Level Security policies

### Test Execution
```bash
# Run audit script
node scripts/audit-rls-policies.js

# Expected output shows status for each table:
# ✅ students - PASSING (3 policies)
# ✅ fee_payments - PASSING (2 policies)
# ⚠️ grades - WARNING (missing UPDATE policy)
# 🔴 audit_logs - CRITICAL (no policies)
```

### Success Criteria
- [ ] All CRITICAL tables have RLS enabled
- [ ] All tables have SELECT policies
- [ ] Sensitive tables have UPDATE policies
- [ ] Payment/audit tables have DELETE restrictions
- [ ] School isolation verified (school_id checks)
- [ ] Parent isolation verified (parent_students join)
- [ ] Audit results stored in security_audits table

### Production Verification
```bash
# Test: Try to read student from different school
# Run as teacher from School A, read student from School B
# Expected: Should fail (0 results) due to RLS
```

---

## 🧪 INTEGRATION TEST SUITE

### Full End-to-End Test
```bash
# 1. Create payment scenario
# 2. Trigger webhook
# 3. Verify receipt generated
# 4. Verify reconciliation detects no issues
# 5. Check audit logs

echo "=== Full P0 Integration Test ==="

# Step 1: Make payment
PAYMENT_REF=$(curl -s -X POST http://localhost:3000/api/billing/initialize \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":500,"invoiceId":"inv-test-1"}' | jq -r '.data.reference')

echo "✓ Payment initialized: $PAYMENT_REF"

# Step 2: Simulate webhook
curl -X POST http://localhost:3000/webhooks/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: VALID_SIGNATURE" \
  -d @- << EOF
{
  "event": "charge.success",
  "data": {
    "reference": "$PAYMENT_REF",
    "amount": 50000,
    "customer": {"email": "parent@example.com"},
    "status": "success"
  }
}
EOF

echo "✓ Webhook processed"

# Step 3: Check receipt
sleep 2
RECEIPT_COUNT=$(ls -1 receipts/ 2>/dev/null | wc -l)
echo "✓ Receipt generated ($RECEIPT_COUNT files)"

# Step 4: Run reconciliation
curl -s -X POST http://localhost:3000/api/cron/payments/reconcile \
  -H "x-cron-secret: YOUR_SECRET" | jq '.data.issues_found'

echo "✓ Reconciliation completed"

# Step 5: Check audit logs
curl -s http://localhost:3000/api/school/audit-logs?limit=1 \
  -H "Authorization: Bearer TOKEN" | jq '.data[0].action'

echo "✓ Audit log created"
echo ""
echo "=== ALL TESTS PASSED ==="
```

---

## 📊 PERFORMANCE BENCHMARKS

Each test must meet these performance targets:

| Test | Target | Measurement |
|------|--------|-------------|
| Health check | < 100ms | End-to-end response time |
| Receipt generation | < 5s | From payment to PDF on disk |
| Reconciliation (50 schools) | < 60s | Full daily run |
| Rate limiting check | < 50ms | Decision made |
| RLS audit | < 5m | Complete table audit |
| Payment processing | < 200ms | Record created in DB |
| Email send | < 5s | From trigger to email queue |

---

## 🚨 FAILURE SCENARIOS

Test that system handles failures gracefully:

**Database Connection Failure**
- Health endpoint returns 503 ✓
- Alerts triggered ✓
- No data corruption ✓

**Webhook Signature Invalid**
- Webhook rejected ✓
- Payment not recorded ✓
- Audit log created ✓

**Rate Limit Exceeded**
- Request rejected with 429 ✓
- Retry-After header set ✓
- User sees friendly message ✓

**Receipt Generation Fails**
- Payment still recorded ✓
- Receipt generation retried ✓
- School notified ✓
- Audit log created ✓

---

## 📋 Sign-Off Checklist

Before deploying to production:

- [ ] All 6 test suites executed successfully
- [ ] Performance benchmarks met
- [ ] Failure scenarios handled correctly
- [ ] No regressions in existing functionality
- [ ] Staging database reconciliation clean
- [ ] Sentry receiving error logs
- [ ] UptimeRobot monitoring active
- [ ] Backup/restore tested
- [ ] Security audit completed
- [ ] Load test with 50 schools passed
- [ ] Admin approval obtained
- [ ] Rollback plan documented

---

**Test Plan Status**: Ready for Execution  
**Last Updated**: 2026-05-20  
**Owner**: QA Team
