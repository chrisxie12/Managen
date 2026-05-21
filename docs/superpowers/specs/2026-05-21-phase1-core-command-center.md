# Phase 1 — Core African Command Center

**Date:** 2026-05-21
**Project:** Managen (f.k.a. SchoolOS)
**Phase:** 1 of 4 (Weeks 1-3 scope compressed to Week 1 delivery)
**Owner:** Frontend lead

---

## 1. Goals

Transform the three most-used school admin pages — Dashboard, Students, and Fees — to match the African Command Center design. Deliver MoMo-first payment flows, WhatsApp-first communication receipts, and CSV import for students.

---

## 2. Architecture

### 2.1 Strategy: Component-Driven

Extract standalone widgets from dashboard, then compose. Each widget:
- Has a single responsibility
- Renders skeleton loaders when loading
- Gets data from a dedicated API call
- Can be reused across roles (Super Admin, Headmaster, Bursar, Teacher)

New shared components directory: `src/app/components/widgets/`

### 2.2 File Map

```
src/app/pages/
  HeadmasterDashboardV2.tsx    → Rewrite: compose widgets, add Command Center features
  StudentsEnhanced.tsx          → Keep, add: ImportModal, bulk actions, Fees Due column
  FeePayment.tsx                → Keep as-is for parent route only
  CollectFees.tsx               → NEW: staff-facing fee collection page

src/app/components/
  widgets/
    FeePulse.tsx                → NEW: collected/target progress bar with MoMo breakdown
    BECECountdown.tsx           → NEW: live countdown to BECE with CTA
    AttendancePulse.tsx         → NEW: today's % + weekly trend bars
    QuickActions.tsx            → NEW: configurable action cards
  ImportModal.tsx               → NEW: CSV upload, preview, validate, import
  MoMoPrompt.tsx               → NEW: MoMo payment trigger card
  ReceiptActions.tsx           → NEW: WhatsApp/SMS/Print receipt toggles
  PaymentMethodSelector.tsx    → NEW: MoMo/Cash/Bank selector

src/app/pages/student/
  StudentImport.tsx             → may become standalone page if ImportModal grows
```

### 2.3 API Dependencies

| Endpoint | Used By | Current Status |
|---|---|---|
| `GET /api/school/dashboard` | FeePulse, AttendancePulse | Exists (partial) |
| `GET /api/school/dashboard/bece-countdown` | BECECountdown | NEW |
| `GET /api/school/dashboard/quick-actions` | QuickActions | NEW (config per role) |
| `GET /api/school/students` | StudentsEnhanced | Exists |
| `POST /api/school/students/import` | ImportModal | NEW |
| `GET /api/school/students/{id}/fees` | CollectFees | Exists (partial) |
| `POST /api/school/fees/collect` | CollectFees | NEW |
| `POST /api/school/fees/momo-prompt` | MoMoPrompt | NEW (MTN MoMo API) |

### 2.4 Error & Loading States

All widgets follow a consistent pattern:
- **Loading:** Skeleton shimmer (gray bars matching widget shape)
- **Empty:** Culturally relevant illustration + CTA button
- **Error:** Amber alert banner with retry button
- **Offline:** Degraded notice with cached data display if available

---

## 3. Dashboard Rewrite (`HeadmasterDashboardV2.tsx`)

### 3.1 Layout

```
┌─────────────────────────────────────────────────┐
│ Dashboard                                       │
│ Welcome back, [Name]. Here's your Command Center.│
├──────────────────────┬─────────────────────────┤
│ FeePulse             │ BECECountdown            │
├──────────────────────┼─────────────────────────┤
│ QuickActions         │ AttendancePulse          │
├──────────────────────┴─────────────────────────┤
│ Recent Payments (existing) | Weekly Attendance  │
│ (existing)                                      │
└─────────────────────────────────────────────────┘
```

### 3.2 FeePulse Widget

Props: `collected: number, target: number, momoPercentage: number, cashPercentage: number`

- Amber progress bar (collected/target)
- "GHS 24,800 / GHS 31,500" text
- Smaller breakdown: "MoMo 65% | Cash 25% | Bank 10%"
- Empty: "No fees recorded this term. Collect your first fee."
- Click navigates to `/dashboard/fees`

### 3.3 BECECountdown Widget

Props: `examDate: string (ISO), examName: string`

- Navy card with amber accent
- Large countdown number (e.g., "47 days")
- "BECE 2026" subtitle
- "Prepare with Past Questions" CTA button (navigates to academics page)
- Empty/hidden if school level doesn't include JHS

### 3.4 AttendancePulse Widget

Props: `todayPercent: number, weeklyData: { day: string; percent: number }[]`

- Today's % with green (≥90%) / amber (≥75%) / red color
- Weekly bar chart (Mon-Fri)
- Click navigates to `/dashboard/attendance`

### 3.5 QuickActions Widget

Props: `actions: { label: string; icon: any; path: string; color: string }[]`

- Configurable action cards (3-4 depending on role)
- Headmaster: Mark Attendance, Collect Fee, Send Notice, View Reports
- Rendered as large tappable cards with icon + label

---

## 4. Students Enhancements (`StudentsEnhanced.tsx`)

### 4.1 What Stays

- DataTable with sort, search, pagination, filters, export
- Row click → student detail page
- Bulk delete action

### 4.2 What Changes

**Import CSV button** — new button next to "Add Student":
```
[+ Add Student] [↓ Download Template] [↑ Import CSV]
```

**ImportModal flow:**
1. Step 1: Download Template button (CSV with headers: `name, admission_no, class, gender, parent_name, parent_phone`)
2. Step 2: Upload CSV file picker (accepts `.csv, .xlsx`)
3. Step 3: Validate — show preview table (first 5 rows) + error count
   - Errors shown per row: "Row 3: Missing parent name", "Row 7: Invalid class name"
   - User can fix CSV and re-upload
4. Step 4: Confirm → `POST /api/school/students/import`
5. Result: toast "150 imported, 3 skipped"
6. Errors downloadable as error report CSV

**New bulk actions:**
- Promote to Class: opens a class picker, moves selected students
- Send WhatsApp: opens WhatsApp template preview, sends batch
- Export Selected: same as existing export but scoped to selection

**New "Fees Due" column** in DataTable:
- Shows outstanding balance with amber badge
- If clear, shows green "✓ Paid" or "GHS 0"
- Sorted by highest due first when clicked

---

## 5. Collect Fees Page (`CollectFees.tsx`) — NEW

### 5.1 Route

`/dashboard/fees` — replaces the current parent-only FeePayment for staff roles.
`FeePayment.tsx` stays available at `/parent/fees` for parents.

### 5.2 Layout

```
┌─ Search Student ───────────────────────────────────┐
│ [ 🔍 Name or Admission No...             ]          │
│ Results dropdown: avatar + name + class + balance   │
└─────────────────────────────────────────────────────┘
┌─ Fee Summary ─────────────────────────────────────┐
│ Name: Kofi Mensah  |  JHS 1A  |  Roll: 001         │
│ Parent: John Mensah  |  024 123 4567 (MoMo-ready)  │
│ ───────────────────────────────────────────────     │
│ Total Due: GHS 1,200   Paid: GHS 700               │
│ Outstanding: GHS 500  [amber badge]                 │
│                                                     │
│ Payment History:                                    │
│ 12 May 2026 ─ GHS 200 ─ MoMo ─ ✓ Delivered         │
│ 05 Apr 2026 ─ GHS 500 ─ Cash ─ Receipt #0012       │
└─────────────────────────────────────────────────────┘
┌─ Collect Payment ──────────────────────────────────┐
│ Amount: [GHS ________]                              │
│                                                     │
│ Payment Method:                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ [MoMo]  │ │ [Cash]   │ │ [Bank]   │            │
│ │ Default  │ │          │ │ Deposit  │            │
│ └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│ Auto-Receipt: [✓ WhatsApp] [✗ SMS] [✗ Print]      │
│                                                     │
│ ┌──────────────────────────────────────────┐       │
│ │        [Trigger MoMo Prompt] or          │       │
│ │        [Mark as Paid (Cash/Bank)]        │       │
│ └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

### 5.3 Behavior Per Payment Method

**MoMo (default, most prominent):**
1. User enters amount
2. System looks up parent's phone from student record
3. Shows "Trigger MoMo Prompt" button (amber, large)
4. Click → POST `/api/school/fees/momo-prompt` → MTN MoMo API sends USSD push to parent's phone
5. Poll for status or wait for webhook callback
6. On success: auto-generate receipt PDF → send via WhatsApp → update balance
7. Show success animation + receipt preview

**Cash:**
1. User enters amount
2. Shows "Mark as Paid" button
3. Click → confirms cash received → records payment
4. Auto-generate receipt → ask: "Send receipt via WhatsApp?"
5. Yes → send via WhatsApp API
6. No → mark as paid (receipt available for print later)

**Bank Deposit:**
1. Same flow as Cash
2. Optional field: "Bank Name" + "Reference Number"
3. Mark as paid with reference

### 5.4 Empty States

- **No student selected:** "Search for a student to collect fees. Enter a name or admission number above."
- **Student has no balance:** "All fees cleared! No outstanding balance."
- **No payments yet:** "No payment history. Collect the first fee."

### 5.5 Error States

- **MoMo API down:** Amber warning "MoMo service unavailable. Use Cash or Bank instead." → hide MoMo option, show retry
- **Phone not found:** "No phone number on file for [student name]. Update parent contact in Students page."
- **Payment failed:** Red error with specific reason + retry button

---

## 6. Routing

The parent `FeePayment` stays accessible but moves to be purely parent/student role-gated:

```
/dashboard/fees  → CollectFees.tsx (staff: headmaster, bursar, admin)
/parent/fees     → FeePayment.tsx (parents)
```
