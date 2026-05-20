# P0 CRITICAL FIXES — IMPLEMENTATION CHECKLIST
**Week of May 20, 2026**

## 📋 Summary
This document tracks completion of 13 P0 critical fixes required before production launch and Nigeria expansion. All fixes must be completed by end of week.

---

## ✅ COMPLETED (4/13)

### 1. ✅ Public Health Endpoint
**Status**: DONE  
**Files**: `routes/publicHealth.js`, `server.js`  
**Endpoints**:
- `GET /status/status` → 200 (OK) / 503 (Down)
- `GET /health/live` → Always 200 (K8s liveness)
- `GET /health/ready` → 200/503 (K8s readiness)
- `GET /health/detailed` → Full diagnostics

**Integration**: Added to server.js line 245-247
```javascript
const publicHealthRoutes = require('./routes/publicHealth');
app.use('/status', publicHealthRoutes);
app.use('/health', publicHealthRoutes);
```

**Testing**:
```bash
curl http://localhost:3000/status/status
curl http://localhost:3000/health/detailed
```

**UptimeRobot Configuration**:
- URL: `https://getschoolos.me/status/status`
- Method: GET
- Expected: 200
- Alert if 503 for >5 minutes

---

### 2. ✅ Payment Reconciliation Service
**Status**: DONE  
**Files**: `services/paymentReconciliationService.js`  
**Features**:
- Detects orphan payments (recorded but no transaction)
- Detects orphan transactions (completed but not recorded)
- Detects amount/status mismatches
- Email alerts to school admin
- Stores reconciliation logs in DB

**Cron Integration**: Added to `routes/cron.js` lines 99-149
```bash
POST /api/cron/payments/reconcile (nightly)
POST /api/cron/payments/reconcile/:schoolId (manual)
```

**Triggered By**:
```bash
curl -X POST http://localhost:3000/api/cron/payments/reconcile \
  -H "x-cron-secret: YOUR_SECRET" \
  -H "Content-Type: application/json"
```

---

### 3. ✅ Rate Limiting Middleware
**Status**: DONE  
**Files**: `middleware/rateLimiting.js`  
**Limiters**:
- Auth: 5 attempts/min
- API: 100 requests/min
- Payment: 20 requests/min
- Notification: 10 requests/min
- Report: 5 per min per school
- Upload: 3 per min per IP
- Search: 50 per min per school
- Email/SMS: 5 per hour per recipient

**Import**: Add to routes that need protection
```javascript
const { paymentLimiter, notificationLimiter } = require('../middleware/rateLimiting');
app.post('/api/communication/whatsapp/send', notificationLimiter, handler);
```

---

### 4. ✅ Receipt Generation Service
**Status**: DONE  
**Files**: `services/receiptGenerationService.js`  
**Features**:
- Auto-generate PDF receipts
- Unique receipt IDs
- QR code for verification
- Email receipt to parents
- Store metadata in DB

**Integration in paymentWebhookService.js**:
```javascript
const receiptService = require('./receiptGenerationService');
await receiptService.generateReceipt({
  schoolId, studentId, amount, 
  invoiceId, paymentMethod, reference
});
```

---

## 🔄 IN PROGRESS (3/13)

### 5. 🔄 Database Migrations - Reconciliation Logs
**Status**: PENDING  
**Required**: `supabase/migrations/20260520000001_reconciliation_logs.sql`

**Schema**:
```sql
CREATE TABLE reconciliation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  reconciliation_date TIMESTAMP NOT NULL DEFAULT NOW(),
  orphan_payments INT,
  orphan_transactions INT,
  amount_mismatches INT,
  status_mismatches INT,
  results JSONB,
  status TEXT CHECK (status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(school_id, reconciliation_date)
);

ALTER TABLE reconciliation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schools view own reconciliation logs"
  ON reconciliation_logs FOR SELECT
  USING (school_id = current_user_id());  -- Adjust to your tenant setup
```

**Action**: Run migration immediately after code review

---

### 6. 🔄 Database Migrations - Receipts Table
**Status**: PENDING  
**Required**: `supabase/migrations/20260520000002_receipts.sql`

**Schema**:
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
```

---

### 7. 🔄 Database Migrations - Credit Balances
**Status**: PENDING  
**Required**: `supabase/migrations/20260520000003_credit_balances.sql`

**Schema**:
```sql
CREATE TABLE credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  student_id UUID NOT NULL REFERENCES students(id),
  balance DECIMAL(10,2) NOT NULL,
  source TEXT, -- e.g., "Overpayment on invoice XYZ"
  source_payment_method VARCHAR(50),
  source_reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  notes TEXT
);

CREATE INDEX idx_credit_student ON credit_balances(school_id, student_id);
```

---

## ❌ NOT STARTED (6/13)

### 8. ❌ Supabase Backup Verification
**Status**: TODO  
**Estimated Time**: 30 minutes  
**Steps**:
1. Access Supabase dashboard → Project settings
2. Navigate to Backups tab
3. Enable daily automated backups
4. Set retention: 30 days
5. Test restore on staging database
6. Document restore procedure in RUNBOOK.md

**Checklist**:
- [ ] Daily backups enabled
- [ ] Retention set to 30 days
- [ ] Restore tested on staging
- [ ] Restore documented
- [ ] Backup notification alerts set up

---

### 9. ❌ Sentry Error Tracking Setup
**Status**: TODO  
**Estimated Time**: 45 minutes  

**Steps**:
1. Create Sentry project at https://sentry.io
2. Get DSN: `https://key@sentry.io/project-id`
3. Install SDK: `npm install @sentry/node @sentry/tracing`
4. Add to server.js (before routes):
```javascript
const Sentry = require('@sentry/node');
const Sentry = require('@sentry/tracing');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
// ... routes ...
app.use(Sentry.Handlers.errorHandler());
```

5. Test: `curl -X GET http://localhost:3000/api/nonexistent`
6. Verify error appears in Sentry dashboard

**Configuration**:
```bash
SENTRY_DSN=https://key@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

---

### 10. ❌ RLS Policy Audit
**Status**: TODO  
**Estimated Time**: 2 hours  

**Script**: `scripts/audit-rls-policies.js`
```bash
node scripts/audit-rls-policies.js
```

**Tables to verify**:
- [ ] schools: Only admins can view
- [ ] students: Only teachers/admins of same school
- [ ] parents: Visible through parent_students join
- [ ] grades: Only teachers/admins of same school
- [ ] fee_payments: Only school admins
- [ ] attendance: Only teachers/admins of same school
- [ ] audit_logs: Only school admins
- [ ] invoices: Only school admins + parents (own children)

**For each table**, ensure:
- RLS is enabled
- SELECT policies exist
- UPDATE policies exist (prevent unauthorized changes)
- DELETE policies exist (prevent unauthorized deletion)

---

### 11. ❌ Admin Impersonation Blocking
**Status**: TODO  
**Estimated Time**: 90 minutes  

**Current Problem**: No audit trail when admin impersonates user

**Implementation**:
1. Create audit log entry with flag `is_impersonation: true`
2. Email user: "Your account was accessed by admin [NAME]"
3. Add `admin_impersonation_logs` table
4. Block multiple rapid impersonations (DoS protection)

**Code in `/api/superadmin/impersonate`**:
```javascript
await auditService.logAction({
  userId: targetUserId,
  action: 'ACCOUNT_IMPERSONATED',
  resource: 'user',
  resourceId: targetUserId,
  severity: 'HIGH',
  metadata: {
    impersonatedBy: req.user.id,
    impersonatedByEmail: req.user.email,
    timestamp: new Date().toISOString(),
  },
});

// Email user
await emailService.sendAdminImpersonationAlert({
  email: targetUser.email,
  adminName: req.user.name,
  adminEmail: req.user.email,
  timestamp: new Date().toISOString(),
});
```

---

### 12. ❌ Partial Payment & Overpayment Handling
**Status**: TODO  
**Estimated Time**: 2 hours  

**Files**: `services/paymentHandlingService.js` (CREATED, needs integration)

**Integration in paymentWebhookService.js**:
```javascript
const paymentHandlingService = require('./paymentHandlingService');

const result = await paymentHandlingService.processPayment({
  schoolId, studentId, invoiceId, amount, paymentMethod, reference
});

// Returns:
// { status: 'full_payment', ... }
// { status: 'partial_payment', remaining: 500 }
// { status: 'overpayment', creditBalance: 100 }
```

**Database changes**:
- `fee_payments.payment_type`: ADD COLUMN (full, partial, credit)
- `invoices.status`: UPDATE to support 'partially_paid'
- Create `credit_balances` table

---

### 13. ❌ Audit Log Export Feature
**Status**: TODO  
**Estimated Time**: 90 minutes  

**Endpoint**: `GET /api/school/audit-logs/export`

**Implementation**:
```javascript
router.get('/export', tenantMiddleware, async (req, res) => {
  const { format = 'csv', dateFrom, dateTo } = req.query;
  
  const logs = await auditService.getAuditLogs({
    schoolId: req.tenant.id,
    dateFrom: new Date(dateFrom),
    dateTo: new Date(dateTo),
  });

  if (format === 'csv') {
    const csv = convertToCSV(logs);
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    res.type('text/csv').send(csv);
  } else if (format === 'json') {
    res.json(logs);
  }
});
```

**Features**:
- Stream large exports (don't load entire log into memory)
- Support date range filtering
- Include: timestamp, user, action, resource, details
- Generate file name with date: `audit-logs-2026-05-20.csv`

---

## 📅 Daily Standup (Track Progress)

**Monday 5/20**:
- [ ] Integrated publicHealth routes into server.js
- [ ] Tested health endpoint with UptimeRobot
- [ ] Created payment reconciliation service
- [ ] Added cron jobs for reconciliation

**Tuesday 5/21**:
- [ ] Created all database migrations
- [ ] Ran migrations on staging
- [ ] Enabled Sentry error tracking
- [ ] Verified errors sending to Sentry

**Wednesday 5/22**:
- [ ] Ran RLS audit script
- [ ] Fixed all critical RLS issues
- [ ] Enabled Supabase automated backups
- [ ] Tested restore on staging

**Thursday 5/23**:
- [ ] Implemented admin impersonation blocking
- [ ] Integrated partial payment handling
- [ ] Tested payment scenarios (full, partial, overpayment)
- [ ] Implemented receipt generation

**Friday 5/24**:
- [ ] Created audit log export feature
- [ ] Tested all P0 items on staging
- [ ] Load tested with 50 schools
- [ ] Prepared production deployment

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] All P0 items completed and tested on staging
- [ ] Health check working and monitored by UptimeRobot
- [ ] Payment reconciliation running daily
- [ ] Sentry catching and alerting on errors
- [ ] RLS policies verified on all tables
- [ ] Backups tested and restorable
- [ ] Rate limiting preventing abuse
- [ ] Receipts generating correctly
- [ ] Partial payments being handled properly
- [ ] Audit logs exportable
- [ ] No hardcoded secrets in code
- [ ] HTTPS enforced
- [ ] All environment variables documented

---

## 🔗 Related Documents
- `CRITICAL_ASSESSMENT.md` — 5 production blockers (detailed analysis)
- `PRODUCTION_CODE_SAMPLES.md` — Copy-paste code snippets
- `IMPORTANT_NIGERIA_EXPANSION.md` — Nigeria-specific requirements
- `DELIVERY_SUMMARY.md` — Overall status and gaps
- `RUNBOOK.md` — Operational procedures

---

**Last Updated**: 2026-05-20  
**Owner**: Engineering Team  
**Status**: 🔄 In Progress (4/13 Complete)
