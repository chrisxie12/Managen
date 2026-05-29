# Important (Fix Before Nigeria Expansion)

## Executive Summary

Your system has **major structural gaps** that will block Nigeria expansion. These items require significant refactoring before launch in Nigeria:

| Item | Status | Effort | Risk | Blocker? |
|------|--------|--------|------|----------|
| Multi-currency engine | ❌ Hardcoded to GHS | 40 hours | HIGH | **YES** |
| Curriculum plugin architecture | ❌ NaCCA baked into core | 60 hours | HIGH | **YES** |
| Offline mode | 🟡 Partial (PWA only) | 8 hours | MEDIUM | No |
| Load testing | ❌ Zero infrastructure | 32 hours | MEDIUM | **YES** |
| Role-based access control | 🟡 Dead code / broken | 24 hours | HIGH | **YES** |

---

## 1. Multi-Currency Engine

### Current State
**GHS is hardcoded in 50+ places:**

- `billingService.js`: `currency: 'GHS'` hardcoded in Paystack initialization
- `BillingTab.tsx`: Display shows "GHS" in plans and billing history
- `Finance.tsx`: Fee structures UI shows "Amount (GHS)"
- `ParentFees.tsx`: Payment displays "GH₵"
- `SmartFeeReminders.tsx`: `formatGhs()` function hardcodes GHS
- SMS/Email templates: "GHS ${amount}" hardcoded in all payment receipts
- SuperAdminBilling.tsx: Revenue charts show "GHS"
- Landing page pricing: All plans shown in GHS

### Impact for Nigeria
**❌ BLOCKER**: Nigeria operates in NGN (Nigerian Naira), not GHS. Cannot launch without this.

### Required Changes

1. **Database Schema** (Low Risk)
   - Add `currency` column to `schools` table → default to region (GHS for Ghana, NGN for Nigeria)
   - Add `currency_symbol` and `exchange_rate` metadata

2. **Billing Service** (High Risk)
   - Make currency dynamic based on school region
   - Paystack supports multi-currency; use correct currency per school
   - Handle exchange rates for multi-region payments

3. **Frontend Display** (Medium Risk)
   - Replace all hardcoded "GHS" with dynamic currency getter
   - Update all `formatCedi()` → `formatCurrency(amount, currencyCode)`
   - Update SMS/Email templates to use school's currency

4. **Payment Processing** (High Risk)
   - Verify Paystack handles NGN correctly
   - Test payment webhooks with NGN
   - Add currency validation on payment endpoints

### Recommended Approach
```javascript
// Create currency config service
const currencyMap = {
  'GH': { code: 'GHS', symbol: 'GH₵', decimals: 2 },
  'NG': { code: 'NGN', symbol: '₦', decimals: 2 },
};

// In school settings, store: region = 'NG' 
// Then: const currency = currencyMap[school.region]
```

**Effort**: 40 hours | **Risk**: HIGH (payment system changes)

---

## 2. Curriculum Plugin Architecture

### Current State
**NaCCA logic is hardcoded into core schema:**

```sql
-- supabase/migrations/20260519110000_nacca_gradebook.sql
-- These are CORE tables, not optional:
- assessment_items (SBA vs EXAM split)
- student_grades 
- v_nacca_terminal_summary (30/70 weighted formula hardcoded)
```

**The 30/70 formula is LOCKED in database:**
```sql
ROUND(
  CASE WHEN sba > 0 THEN (sba / max_sba) * 30 ELSE 0 END +
  CASE WHEN exam > 0 THEN (exam / max_exam) * 70 ELSE 0 END, 2)
```

### Impact for Nigeria
**❌ BLOCKER**: Nigeria uses **different curriculum** (WAEC/NECO), not NaCCA. Your grading system won't work.

**NaCCA (Ghana):**
- 30% continuous assessment (SBA)
- 70% terminal exam
- 5-point scale: EE, ME, BE, AE, B

**WAEC/NECO (Nigeria):**
- Varies by subject
- Different grading scale
- Different assessment structure

### Required Changes

1. **Create Curriculum Abstraction Layer** (Highest Priority)
   ```typescript
   interface CurriculumAdapter {
     getAssessmentStructure(): { sbaWeight, examWeight, maxMarks }
     calculateGrade(sbaScore, examScore): { grade, band, description }
     getGradingScale(): { grades: string[], boundaries: number[] }
   }
   
   // NaCCAAdapter.ts
   export class NaCCAAdapter implements CurriculumAdapter { ... }
   
   // WAECAdapter.ts  
   export class WAECAdapter implements CurriculumAdapter { ... }
   ```

2. **Make Curriculum Swappable**
   - Add `curriculum_type` to schools table: 'nacca' | 'waec' | 'neco'
   - Store grading formulas in a configurable table, not hardcoded SQL
   - Load correct adapter based on school's curriculum setting

3. **Refactor Database Schema**
   - Create `curriculum_templates` table (instead of hardcoded migrations)
   - Store assessment weights, grade boundaries per curriculum
   - Remove hardcoded NaCCA logic from v_nacca_terminal_summary

4. **Update Backend**
   - `examService.js` → use adapter to calculate grades
   - API endpoints return curriculum-aware grading

5. **Update Frontend**
   - `GradebookPage` → display correct grade labels for school's curriculum
   - `ReportCardGenerator` → format based on curriculum

### Recommended Approach
```javascript
// services/curriculumService.js
class CurriculumService {
  async getCurriculumAdapter(schoolId) {
    const { data: school } = await supabase.from('schools')
      .select('curriculum_type').eq('id', schoolId).single();
    
    if (school.curriculum_type === 'nacca') return new NaCCAAdapter();
    if (school.curriculum_type === 'waec') return new WAECAdapter();
    throw new Error('Unknown curriculum');
  }
  
  async calculateTerminalGrades(classId, termId) {
    const adapter = await this.getCurriculumAdapter(classId.school_id);
    return adapter.computeTerminalGrades(classId, termId);
  }
}
```

**Effort**: 60 hours | **Risk**: HIGH (affects grading logic)

---

## 3. Offline Mode

### Current State
**Partially implemented:**

✅ Frontend has IndexedDB sync queue (`offlineSync.ts`)
✅ PWA infrastructure (Workbox, install prompts)
✅ Attendance & fee payments queue for sync
❌ No testing of 30-day sync scenarios
❌ No conflict resolution logic
❌ No backend compression for large syncs

### Impact for Nigeria
**🟡 IMPORTANT**: Rural Nigeria has worse connectivity than Ghana. Teachers need reliable offline marking.

### Gaps

1. **No conflict resolution**
   - If teacher marks attendance offline, then headmaster updates same record online, what happens on sync?
   - Current code just overwrites (data loss risk)

2. **No batch upload compression**
   - Syncing 500 attendance records over slow connection = huge payload
   - Need chunking + gzip

3. **No error handling for long offline periods**
   - What if teacher is offline for 7 days? IndexedDB quota exceeded?

### Recommended Fixes

1. **Add conflict resolution**
   ```typescript
   interface SyncItem {
     id: string;
     type: 'attendance' | 'fee-payment';
     payload: unknown;
     status: 'pending' | 'syncing' | 'failed' | 'conflicted';
     createdAt: string;
     serverVersion?: number;  // Add for conflict detection
     clientVersion?: number;
   }
   ```

2. **Add batch compression**
   ```typescript
   await api.post('/api/school/attendance/batch', {
     data: compressedRecords,
     encoding: 'gzip',
     timestamp: Date.now()
   });
   ```

3. **Test offline scenarios**
   - 7-day offline period
   - 500+ records sync
   - Network dropout mid-sync

**Effort**: 8 hours | **Risk**: MEDIUM

---

## 4. Load Testing

### Current State
**❌ Zero infrastructure:**

- No load testing scripts
- No performance baselines
- No stress test for term-end report card generation
- File `test-superadmin-load.js` exists but is minimal

### Impact for Nigeria
**⚠️ BLOCKER**: You plan to scale to 500 schools. Term-end happens simultaneously — **everyone generates report cards at once**.

**Scenario**: 500 schools × 30 teachers × 40 students = **600,000 report cards generated in 1 hour**

### What Will Break
1. **Database**: 600,000 writes in 1 hour = connection pool exhausted
2. **Backend**: No queuing system — requests will timeout
3. **Disk**: PDFs not cleaned up — disk fills up
4. **Memory**: No streaming — entire PDF in RAM

### Required Changes

1. **Add Load Testing**
   ```bash
   npm install --save-dev artillery
   
   # artillery/load-test-report-cards.yml
   config:
     target: 'https://api.schoolos.ng'
     phases:
       - duration: 60, arrivalRate: 10  # 10 schools/sec
   scenarios:
     - name: Generate Report Cards
       flow:
         - post:
             url: '/api/school/reports/generate-bulk'
             json:
               classId: '{{ $randomString(36) }}'
               termId: '{{ $randomString(36) }}'
   ```

2. **Add Report Card Queuing**
   ```javascript
   // services/reportCardQueue.js (already exists but not used everywhere)
   async function generateReportCardsBulk(schoolId, classId, termId) {
     for (let i = 0; i < students.length; i += 50) {
       await reportCardQueue.add({
         studentIds: students.slice(i, i + 50),
         classId, termId, schoolId
       });
     }
     // Returns immediately; cards generate async
   }
   ```

3. **Monitor & Alert**
   - Add Datadog metrics for report card generation time
   - Alert if > 5 minutes for 100 students

**Effort**: 32 hours | **Risk**: MEDIUM

---

## 5. Role-Based Access Control

### Current State
**🟡 BROKEN:**

✅ Database schema is correct (roles, permissions, RLS policies exist)
❌ `middleware/rbac.js` exists but is **never imported** → DEAD CODE
❌ Frontend has **no route guards** — teacher can access `/dashboard/admin` anyway
❌ RLS policies exist but may not cover all data access patterns
❌ Teachers can potentially see other teachers' data

### Impact for Nigeria
**❌ BLOCKER**: WAEC regulations require **strict data isolation**:
- Teacher A cannot see Teacher B's students
- Parent can only see their own children's grades
- Headmaster sees everything but audit logs prove it

### Security Vulnerability Example
```typescript
// Current: Anyone can call this after login
GET /api/school/students?classId=any-id

// Should be rejected because:
// - Teacher is not assigned to 'any-id' class
// - But code doesn't check
```

### Required Changes

1. **Enable RBAC Middleware**
   ```javascript
   // routes/school.js
   router.get('/students', protect, requirePermission('students.view'), async (req, res) => {
     // NOW: Verify user has 'students.view' permission
     // AND: User can only see students from their assigned classes
   });
   ```

2. **Add Frontend Route Guards**
   ```typescript
   // Add to all dashboard routes
   <RoleGuard allowedRoles={['school_admin', 'headmaster']}>
     <AdminDashboard />
   </RoleGuard>
   ```

3. **Fix RLS Policies**
   ```sql
   -- Verify teacher can only see their own classes
   ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
   CREATE POLICY teacher_sees_own_classes ON classes
     FOR SELECT USING (
       auth.uid() = teacher_id OR
       auth.jwt() ->> 'role' = 'school_admin'
     );
   ```

4. **Audit Access**
   - Every data access should be logged
   - Alerts if teacher access > normal patterns

**Effort**: 24 hours | **Risk**: HIGH (security-critical)

---

## Implementation Priority

**Do this BEFORE Nigeria launch:**

```
Week 1: Multi-currency engine (blocks Nigeria billing)
Week 2: Curriculum plugin architecture (blocks grading)
Week 3: Role-based access control (blocks regulatory compliance)
Week 4: Load testing (blocks scale)
Week 5: Offline mode edge cases (improves UX)
```

---

## Success Criteria

- [ ] Multi-currency: Can create NGN school, all amounts display in NGN
- [ ] Curriculum: Can switch school from NaCCA to WAEC, grades calculate correctly
- [ ] Offline: Sync 500 records over 3G, no conflicts, completes in < 2 min
- [ ] Load testing: 100 concurrent report card generations, all complete in < 5 min
- [ ] RBAC: Teacher cannot access another teacher's data (automated security test)
