# P0 INTEGRATION GUIDE
**Complete Implementation Reference**

## 📌 What's Been Created vs. What Needs Integration

### ✅ CREATED - Ready to Use
These files have been created and are ready for integration:

1. **routes/publicHealth.js** — Public health check endpoints
2. **services/paymentReconciliationService.js** — Daily payment reconciliation
3. **services/receiptGenerationService.js** — Auto-generate PDF receipts
4. **services/paymentHandlingService.js** — Handle partial/overpayments
5. **middleware/rateLimiting.js** — Rate limiting for all endpoints
6. **scripts/audit-rls-policies.js** — RLS policy audit script

### 🔄 PARTIALLY DONE - Needs Completion
1. **server.js** — ✅ Added publicHealth routes (lines 245-247)
2. **routes/cron.js** — ✅ Added reconciliation endpoints (lines 99-149)
3. **routes/communication.js** — ❌ Needs rateLimiting added
4. **routes/billing.js** — ❌ Needs paymentHandlingService integrated
5. **services/paymentWebhookService.js** — ❌ Needs receipt generation integrated

### ❌ NOT STARTED - Must Create
1. Supabase database migrations (3 files)
2. Sentry configuration
3. Admin impersonation blocking
4. Audit log export feature

---

## 🔗 Integration Steps (Priority Order)

### STEP 1: Integrate Communication Routes (5 minutes)
Add rate limiting to WhatsApp, SMS, and email endpoints

**File**: `routes/communication.js`

```javascript
// At the top
const { notificationLimiter, emailSmsLimiter } = require('../middleware/rateLimiting');

// Update existing endpoints
router.post('/whatsapp/send', 
  tenantMiddleware, 
  notificationLimiter,  // ← ADD THIS LINE
  async (req, res) => {
    // existing code
  }
);

router.post('/sms/send', 
  tenantMiddleware,
  notificationLimiter,  // ← ADD THIS LINE
  async (req, res) => {
    // existing code
  }
);

router.post('/email/send',
  tenantMiddleware,
  emailSmsLimiter,  // ← ADD THIS LINE
  async (req, res) => {
    // existing code
  }
);
```

---

### STEP 2: Integrate Billing Routes (5 minutes)
Add rate limiting to payment endpoints

**File**: `routes/billing.js`

```javascript
// At the top
const { paymentLimiter } = require('../middleware/rateLimiting');

// Update existing endpoints
router.post('/initialize',
  tenantMiddleware,
  paymentLimiter,  // ← ADD THIS LINE
  async (req, res) => {
    // existing code
  }
);

router.get('/transactions',
  tenantMiddleware,
  paymentLimiter,  // ← ADD THIS LINE
  async (req, res) => {
    // existing code
  }
);
```

---

### STEP 3: Integrate Receipt Generation in Webhook (10 minutes)
When payment succeeds, auto-generate receipt

**File**: `services/paymentWebhookService.js`

Current code (lines 45-80):
```javascript
async handleChargeSuccess(event) {
  const { data } = event;
  const { reference, customer, amount } = data;

  // Log payment
  const { data: payment, error } = await supabase
    .from('fee_payments')
    .insert({
      // ... existing fields
    });

  // Send SMS receipt
  await this.sendSMSReceipt(...);
}
```

Update to:
```javascript
async handleChargeSuccess(event) {
  const { data } = event;
  const { reference, customer, amount } = data;

  // Get fee payment details
  const { data: feePayment, error } = await supabase
    .from('fee_payments')
    .select('*, students!inner(name), invoices!inner(school_id)')
    .eq('payment_reference', reference)
    .single();

  // ← ADD: Generate receipt
  const receiptService = require('./receiptGenerationService');
  const receipt = await receiptService.generateReceipt({
    schoolId: feePayment.invoices.school_id,
    studentId: feePayment.student_id,
    studentName: feePayment.students.name,
    invoiceId: feePayment.invoice_id,
    amount: feePayment.amount,
    paymentMethod: 'paystack',
    reference: reference,
    // Add school details from DB
  });

  // Send SMS receipt with link
  await this.sendSMSReceipt({
    ...existingData,
    receiptUrl: receipt.receiptUrl,  // ← Include receipt URL
  });

  // Email receipt
  await receiptService.emailReceipt(
    receipt.receiptId,
    customer.email,
    feePayment.students.name
  );
}
```

---

### STEP 4: Integrate Payment Handling Service (10 minutes)
Replace simple payment recording with comprehensive handling

**File**: `services/paymentWebhookService.js`

Replace the simple `fee_payments.insert()` with:
```javascript
const paymentHandlingService = require('./paymentHandlingService');

// Get invoice details
const { data: invoice } = await supabase
  .from('invoices')
  .select('amount_due, amount_paid')
  .eq('id', invoiceId)
  .single();

// Use payment handler
const result = await paymentHandlingService.processPayment({
  schoolId,
  studentId,
  invoiceId,
  amount,
  paymentMethod: 'paystack',
  reference,
});

// Log result
console.log(`Payment result: ${result.status}`, {
  amount: result.paymentAmount,
  remaining: result.remaining || 0,
  creditBalance: result.creditBalance || 0,
});
```

---

### STEP 5: Create Supabase Migrations (15 minutes)
Create the 3 required database tables

**File 1**: `supabase/migrations/20260520000001_reconciliation_logs.sql`
```sql
CREATE TABLE reconciliation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  reconciliation_date TIMESTAMP NOT NULL DEFAULT NOW(),
  orphan_payments INT DEFAULT 0,
  orphan_transactions INT DEFAULT 0,
  amount_mismatches INT DEFAULT 0,
  status_mismatches INT DEFAULT 0,
  results JSONB,
  status TEXT CHECK (status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(school_id, date(reconciliation_date))
);

ALTER TABLE reconciliation_logs ENABLE ROW LEVEL SECURITY;

-- School admins can view their own reconciliation logs
CREATE POLICY "School admins view own reconciliation logs"
  ON reconciliation_logs FOR SELECT
  USING (school_id = (SELECT school_id FROM auth.users WHERE id = auth.uid()));
```

**File 2**: `supabase/migrations/20260520000002_receipts.sql`
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id VARCHAR(50) UNIQUE NOT NULL,
  school_id UUID NOT NULL REFERENCES schools(id),
  student_id UUID NOT NULL REFERENCES students(id),
  invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GHS',
  file_path TEXT,
  receipt_url TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  emailed_to TEXT,
  emailed_at TIMESTAMP,
  verified_at TIMESTAMP
);

CREATE INDEX idx_receipts_school ON receipts(school_id);
CREATE INDEX idx_receipts_student ON receipts(student_id);
CREATE INDEX idx_receipts_receipt_id ON receipts(receipt_id);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Parents can see receipts for their own children
CREATE POLICY "Parents view own receipts"
  ON receipts FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM parent_students
      WHERE parent_id = auth.uid()
    )
  );

-- School admins can see all receipts for their school
CREATE POLICY "School admins view own school receipts"
  ON receipts FOR SELECT
  USING (school_id = (SELECT school_id FROM auth.users WHERE id = auth.uid()));
```

**File 3**: `supabase/migrations/20260520000003_credit_balances.sql`
```sql
CREATE TABLE credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  student_id UUID NOT NULL REFERENCES students(id),
  balance DECIMAL(10,2) NOT NULL,
  source TEXT,
  source_payment_method VARCHAR(50),
  source_reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 year'),
  notes TEXT
);

CREATE INDEX idx_credit_student ON credit_balances(school_id, student_id);
CREATE INDEX idx_credit_expires ON credit_balances(expires_at);

ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;

-- School admins view credit balances
CREATE POLICY "School admins view credit balances"
  ON credit_balances FOR SELECT
  USING (school_id = (SELECT school_id FROM auth.users WHERE id = auth.uid()));
```

Run migrations:
```bash
supabase db push
```

---

### STEP 6: Setup Sentry Error Tracking (20 minutes)

**File**: Update top of `server.js`

```javascript
// NEW: Before other imports
if (process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  const Sentry = require('@sentry/tracing');

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'production',
    ignoreErrors: [
      // Ignore known non-actionable errors
      'ResizeObserver loop limit exceeded',
      'NetworkError',
      'TimeoutError',
    ],
  });
}

// Existing imports
const express = require('express');
const cors = require('cors');
// ...

// Add Sentry handlers early in middleware stack
if (process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// ... rest of middleware ...

// Add Sentry error handler at the end
if (process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  app.use(Sentry.Handlers.errorHandler());
}
```

**File**: `.env.production`

```bash
SENTRY_DSN=https://[key]@sentry.io/[project-id]
SENTRY_ENVIRONMENT=production
```

Test:
```bash
# Trigger an error
curl http://localhost:3000/api/nonexistent

# Should appear in Sentry dashboard within 5 seconds
```

---

### STEP 7: Run RLS Audit (5 minutes)

```bash
node scripts/audit-rls-policies.js
```

Output will show:
- ✅ Tables with RLS enabled
- ⚠️  Tables missing specific policies
- 🔴 Tables with NO RLS (critical)

Example output:
```
✅ Passing: 5 | ⚠️  Warnings: 3 | 🔴 Critical: 1

✅ students           PASSING     (3 policies)
✅ fee_payments       PASSING     (2 policies)
⚠️ grades             WARNING     (1 policy) - Missing UPDATE policy
🔴 audit_logs         CRITICAL    (0 policies) - Add RLS immediately!
```

---

### STEP 8: Setup Admin Impersonation Blocking (30 minutes)

**File**: `routes/superAdmin.js` (update impersonate endpoint)

```javascript
router.post('/impersonate/:userId', requirePermission('superadmin'), async (req, res) => {
  const { userId } = req.params;

  // Get target user
  const { data: targetUser } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', userId)
    .single();

  // ← ADD: Log impersonation as HIGH severity
  const auditService = require('../services/auditService');
  await auditService.logAction({
    userId: targetUser.id,  // ← Log on target user's account
    action: 'ACCOUNT_IMPERSONATED',
    resource: 'user_account',
    resourceId: userId,
    severity: 'HIGH',
    metadata: {
      impersonatedBy: req.user.id,
      impersonatedByName: req.user.name,
      impersonatedByEmail: req.user.email,
      reason: req.body?.reason || 'No reason provided',
      ip: req.ip,
    },
  });

  // ← ADD: Email alert to user
  const emailService = require('../services/emailService');
  await emailService.sendAdminImpersonationAlert({
    to: targetUser.email,
    name: targetUser.name,
    adminName: req.user.name,
    adminEmail: req.user.email,
    reason: req.body?.reason,
    timestamp: new Date().toISOString(),
    supportContact: 'support@getschoolos.me',
  });

  // Continue with impersonation...
  return res.json({ success: true, impersonatingUser: userId });
});
```

**Email template to add** in `services/emailService.js`:
```javascript
async sendAdminImpersonationAlert({ to, name, adminName, adminEmail, reason, timestamp }) {
  const html = `
    <div style="font-family: Arial; color: #333; max-width: 600px;">
      <h2 style="color: #e74c3c;">⚠️ Security Alert: Account Access</h2>
      
      <p>Hi ${name},</p>
      
      <p style="background-color: #fee; padding: 15px; border-left: 4px solid #e74c3c;">
        <strong>Your account was accessed by an administrator.</strong>
      </p>
      
      <p><strong>Details:</strong></p>
      <ul>
        <li><strong>Admin:</strong> ${adminName} (${adminEmail})</li>
        <li><strong>Reason:</strong> ${reason || 'Not specified'}</li>
        <li><strong>Time:</strong> ${timestamp}</li>
      </ul>
      
      <p>If this was not authorized, please contact support immediately at support@getschoolos.me</p>
      
      <p>— SchoolOS Security Team</p>
    </div>
  `;
  
  return this.sendEmail({
    to,
    subject: '⚠️ Security Alert: Your Account Was Accessed',
    html,
  });
}
```

---

### STEP 9: Create Audit Log Export (45 minutes)

**File**: Update `routes/audit.js`

```javascript
const router = express.Router();
const { Parser } = require('json2csv');

// New endpoint
router.get('/export', tenantMiddleware, async (req, res) => {
  try {
    const { format = 'csv', dateFrom, dateTo } = req.query;
    const schoolId = req.tenant.id;

    // Validate date range (max 90 days)
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);

    if (daysDiff > 90) {
      return res.status(400).json({ 
        error: 'Date range cannot exceed 90 days for performance reasons' 
      });
    }

    // Get audit logs
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('school_id', schoolId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (format === 'csv') {
      // Convert to CSV
      const fields = [
        'timestamp',
        'user_email',
        'action',
        'resource',
        'resource_id',
        'severity',
        'details',
      ];

      const csvData = logs.map(log => ({
        timestamp: log.created_at,
        user_email: log.user_email,
        action: log.action,
        resource: log.resource,
        resource_id: log.resource_id,
        severity: log.severity,
        details: JSON.stringify(log.metadata),
      }));

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(csvData);

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="audit-logs-${dateFrom}-to-${dateTo}.csv"`
      );
      res.type('text/csv').send(csv);
    } else if (format === 'json') {
      res.json({
        export: {
          schoolId,
          dateRange: { from: dateFrom, to: dateTo },
          recordCount: logs.length,
          data: logs,
        },
      });
    } else {
      res.status(400).json({ error: 'Unsupported format. Use csv or json.' });
    }
  } catch (err) {
    console.error('Export failed:', err);
    res.status(500).json({ error: 'Export failed.' });
  }
});

module.exports = router;
```

Install required package:
```bash
npm install json2csv
```

Usage:
```bash
# Export last 7 days as CSV
curl "http://localhost:3000/api/school/audit-logs/export?format=csv&dateFrom=2026-05-14&dateTo=2026-05-21" \
  -H "Authorization: Bearer TOKEN" \
  > audit-logs.csv

# Export as JSON
curl "http://localhost:3000/api/school/audit-logs/export?format=json&dateFrom=2026-05-14&dateTo=2026-05-21" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🧪 Testing Checklist

After each integration, test:

```bash
# 1. Health check
curl http://localhost:3000/health/status
# Expected: {"status":"ok"} with 200

# 2. Rate limiting
for i in {1..15}; do curl -s http://localhost:3000/api/communication/whatsapp/send; done
# Expected: 429 after 10th request

# 3. Payment reconciliation
curl -X POST http://localhost:3000/api/cron/payments/reconcile \
  -H "x-cron-secret: YOUR_SECRET"
# Expected: 200 with reconciliation results

# 4. Receipt generation
# Check receipts/ directory
ls -la receipts/
# Expected: REC-*.pdf files created

# 5. Sentry
curl http://localhost:3000/api/nonexistent
# Expected: Error logged in Sentry dashboard

# 6. Audit logs
curl "http://localhost:3000/api/school/audit-logs/export?format=csv" \
  -H "Authorization: Bearer TOKEN"
# Expected: CSV file downloaded
```

---

## 📝 Quick Reference

**All New Files Created**:
```
✅ routes/publicHealth.js
✅ services/paymentReconciliationService.js
✅ services/receiptGenerationService.js
✅ services/paymentHandlingService.js
✅ middleware/rateLimiting.js
✅ scripts/audit-rls-policies.js
📝 P0_IMPLEMENTATION_CHECKLIST.md
📝 P0_INTEGRATION_GUIDE.md (this file)
```

**Files Modified**:
```
✅ server.js (added public health routes)
✅ routes/cron.js (added reconciliation endpoints)
🔄 services/paymentWebhookService.js (NEEDS: receipt integration)
🔄 routes/billing.js (NEEDS: rate limiting)
🔄 routes/communication.js (NEEDS: rate limiting)
🔄 routes/audit.js (NEEDS: export endpoint)
🔄 routes/superAdmin.js (NEEDS: impersonation blocking)
```

**Environment Variables to Add**:
```bash
SENTRY_DSN=https://[key]@sentry.io/[project-id]
SENTRY_ENVIRONMENT=production
```

---

**Status**: 🔄 In Progress  
**Last Updated**: 2026-05-20  
**Estimated Completion**: 2026-05-24
