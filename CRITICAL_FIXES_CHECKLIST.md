# Quick Fix Checklist — Critical Issues

Use this checklist to track fixes. Mark ✓ when completed.

---

## 🔴 DO TODAY (blocks everything else)

### Uptime Claim
- [ ] **Remove false 46.8% uptime from landing page**
  - File: [schoolos-frontend/src/app/pages/LandingPage.tsx](schoolos-frontend/src/app/pages/LandingPage.tsx#L369)
  - Replace `{(countUptime / 10).toFixed(1)}%` section with honest messaging
  - Examples: "Enterprise-grade reliability" or "99% uptime SLA (coming soon)"
  - PR: Create and merge immediately

### Database Backups
- [ ] **Enable Supabase automated backups**
  - Navigate to Supabase dashboard → Project Settings → Backups
  - Enable daily backups (minimum)
  - Set retention to 30 days
  - Note backup schedule and first backup time

- [ ] **Test backup restore procedure**
  - Request a restore to staging environment
  - Verify data integrity post-restore
  - Document restore time (should be < 2 hours)
  - Create runbook at `docs/disaster-recovery.md`

- [ ] **Create backup verification script**
  - File: `scripts/verify-backups.js`
  - Check Supabase backup status daily
  - Alert if no backup in 24+ hours
  - Add to cron: `0 6 * * * node scripts/verify-backups.js`

---

## 🟠 DO THIS WEEK (unblocks safety)

### Health Checks
- [ ] **Fix /health endpoint to return 503 on service failures**
  - File: [server.js](server.js#L209)
  - Change: `res.json({ status: 'ok', ... })` → `res.status(503).json({ ... })`
  - When: if any of [db, redis, queue] has status === 'down'
  - Test: `curl http://localhost:5000/health` when Redis is disconnected

- [ ] **Verify Railway health check uses /health**
  - File: [railway.toml](railway.toml)
  - Confirm: `healthcheckPath = "/health"`
  - Test: Deploy and watch health check in Railway dashboard

### Redis Configuration
- [ ] **Choose Redis solution**
  - Option A: Upstash (free tier available)
  - Option B: Local Redis (dev only)
  - Option C: Remove Redis dependency and use simple in-memory queue

- [ ] **Configure Redis in .env**
  - `REDIS_URL=redis://...` or `UPSTASH_REDIS_URL=...`

- [ ] **Test Redis connection**
  - Run: `node -e "const r = require('./config/redis'); console.log(r.status)"`
  - Expected: `'ready'` or `'connected'`

- [ ] **Test trial queue works**
  - Run: `node scripts/test-trial-queue.js`
  - Expected: Queue initializes, job can be added

### Notification Rate Limits
- [ ] **Add Arkesel SMS rate limit middleware**
  - Create: `middleware/notificationRateLimit.js`
  - Add: SMS limit (Arkesel supports ~100 SMS/sec)
  - Add: WhatsApp limit (Twilio ~50 msgs/sec)

- [ ] **Add circuit breaker for Arkesel/Twilio**
  - Install: `npm install opossum`
  - File: `services/notificationUtils.js`
  - If service down for 30+ seconds, queue SMS locally + retry later

- [ ] **Test notification rate limiting**
  - Send 1000 SMS in rapid succession
  - Verify: Rate limiter slows requests, no errors thrown
  - Verify: Circuit breaker opens if service unavailable

---

## 🟡 DO NEXT 2 WEEKS (before scaling to 50 schools)

### Payment Reconciliation UI
- [ ] **Create AccountantReconciliation component**
  - File: `schoolos-frontend/src/app/pages/AccountantReconciliation.tsx`
  - Show: Invoice → Amount Expected → Amount Received
  - Show: Any mismatch with reason (e.g., "Processing fee")
  - Button: "Mark as reconciled" with optional note

- [ ] **Add payment_fee_pesewas column to payments table**
  - Migration: `supabase/migrations/20260520_payment_fees.sql`
  - Track platform fees (Paystack charges ~3.5%)

- [ ] **Add invoice partial payment support**
  - Migration: Add `status = 'partially_paid'` option
  - Update: `process_paystack_payment` RPC to handle partial payments
  - SMS: "Payment received: GHS 200 of GHS 500. Outstanding: GHS 300"

### Data Isolation via RLS
- [ ] **Create RLS migration**
  - File: `supabase/migrations/20260520_rls_policies.sql`
  - Enable RLS on: students, users, fees, attendance, classes, etc.
  - Policy: `tenant_id = auth.jwt() ->> 'school_id'`

- [ ] **Test RLS prevents cross-tenant access**
  - File: `scripts/test-rls-policies.js`
  - Login as School A
  - Try direct query to all students (no tenant filter)
  - Verify: RLS blocks, returns 0 rows or error

- [ ] **Add RLS test to CI/CD**
  - File: `.github/workflows/test.yml` (or equivalent)
  - Run: `npm run test:rls` before deployment
  - Fail deployment if RLS test fails

### Payment Webhook Idempotency
- [ ] **Add idempotency check in payment webhook**
  - File: [services/paymentWebhookService.js](services/paymentWebhookService.js#L30)
  - Before processing: Check if `reference` already exists in payments table
  - If exists: Log and return (don't double-charge)
  - If new: Proceed with normal flow

- [ ] **Test webhook idempotency**
  - Simulate Paystack retrying webhook (send same reference twice)
  - Verify: Payment created once only
  - Verify: SMS sent once only

---

## Testing Checklist

After each fix, verify:

```bash
# Health checks
curl http://localhost:5000/health
# Expected: { status: "ok", checks: {...} } or { status: "service_unavailable", ... }

# Redis
npm run test:redis
# Expected: ✓ Redis connected and ready

# Backups
npm run verify:backups
# Expected: ✓ Latest backup completed within 24 hours

# Rate limits
npm run test:rate-limits
# Expected: ✓ Rate limiter allows N requests, blocks after threshold

# RLS
npm run test:rls
# Expected: ✓ School A cannot access School B's data

# Payments
npm run test:payment-webhook
# Expected: ✓ Webhook processed, invoice updated, SMS sent

# E2E: Full flow
npm run test:e2e:payment
# Expected: Fee created → Payment sent → Invoice updated → SMS received
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm run test`)
- [ ] All fixes merged and reviewed
- [ ] Backups tested on staging
- [ ] Health check returning 503 on failures
- [ ] Rate limits tested under load
- [ ] RLS policies tested
- [ ] Payment webhook tested with real Paystack webhook
- [ ] No console.log statements left in code
- [ ] Sentry DSN configured for error tracking
- [ ] Datadog APM enabled for performance monitoring

---

## Success Metrics

Track these after fixes:

| Metric | Target | How to Measure |
|--------|--------|-----------------|
| Uptime | 99.9% | Check Railway dashboard after 30 days |
| Backup Status | Latest within 24h | Run `verify:backups` daily |
| Health Check Response | < 200ms | Monitor in Datadog/Sentry |
| Payment Processing | 100% match | Accountant reconciliation report |
| Data Isolation | 0 cross-school leaks | RLS test passes in CI/CD |

---

## Emergency Contacts

If issues occur after deployment:

| Issue | Who | Action |
|-------|-----|--------|
| Database down | Supabase Support | Open emergency support ticket |
| Backup restore needed | Supabase + DevOps | Start restore process (2-4 hours) |
| Rate limits hit | Dev team | Increase Arkesel/Twilio quota or reduce sending |
| RLS blocking legitimate access | Backend dev | Check JWT claims in auth token |
| Payment webhook failing | Backend dev | Check Paystack webhook logs + IP whitelist |

