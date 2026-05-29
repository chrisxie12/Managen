# SchoolOS v2.0 — African School Command Center
## Reimagining ProjectWorlds' Structure for Ghana & West Africa

---

## 1. Philosophy: "Their Skeleton, Our Blood"

ProjectWorlds has **excellent organizational taxonomy.** Their category groupings (Front Office → Students → Academics → Finance → Communication → Operations → Settings) are actually how schools think. We steal that structure. We replace the organs.

**Rule:** Keep their headers. Replace their contents with Africa-native features.

---

## 2. The African School Context

Before designing tabs, understand how African schools actually work:

| Reality | Design Implication |
|---------|-------------------|
| **Internet is unreliable** | Every feature must work offline or degrade gracefully |
| **Smartphones > laptops** | Teachers use phones. Design for thumb-first, not mouse-first |
| **WhatsApp = email + SMS + portal** | Parent communication happens exclusively on WhatsApp |
| **MoMo > bank cards** | 80% of parents have no debit card. MoMo is the only payment rail |
| **NaCCA/GES rules everything** | Report cards must match government format or school loses accreditation |
| **BECE/WASSCE is life-or-death** | Exam prep features are not "nice to have" — they are core product |
| **One bursar runs the office** | No IT department. Software must be simpler than Excel |
| **Parents are not tech-savvy** | Parent portal must work on a 200 Cedi feature phone browser |
| **School groups are growing** | Multi-campus is not enterprise-only — it's the mid-market |
| **Twi, Ga, Ewe are spoken at home** | English-only excludes non-literate parents |

---

## 3. Super Admin Dashboard (SaaS Operator)

*For SchoolOS team managing the platform*

```
┌─────────────────────────────────────────────┐
│  SchoolOS Africa                            │
│  Built for Ghana. Built to Expand.          │
├─────────────────────────────────────────────┤
│                                             │
│  AFRICA PULSE                               │
│  ├── Dashboard                              │
│  │   ├── Active Schools by Region            │
│  │   ├── MRR / ARR (GHS + NGN + KES)         │
│  │   ├── Churn Risk Alerts                   │
│  │   └── MoMo Transaction Volume             │
│  ├── Revenue Analytics                      │
│  │   ├── Collections by Currency             │
│  │   ├── Plan Distribution (Free to Enterprise)│
│  │   └── School Group Contracts              │
│  ├── Growth Funnel                          │
│  │   ├── Trial to Active to Paid               │
│  │   ├── Regional Heatmap (Ghana districts)  │
│  │   └── Referral Tracking                   │
│  └── System Health                          │
│      ├── Uptime / API Status                │
│      ├── WhatsApp Delivery Rate             │
│      ├── MoMo API Latency                   │
│      └── Error Logs (Sentry)                │
│                                             │
│  SCHOOLS                                    │
│  ├── All Schools                            │
│  │   ├── Filter: Region / Plan / Status      │
│  │   ├── Search by Name / Proprietor         │
│  │   └── Bulk Actions (Export / Message)     │
│  ├── Onboarding Pipeline                    │
│  │   ├── Trial Schools (7-day countdown)     │
│  │   ├── Stalled Onboarding (no students)    │
│  │   └── Demo Requests                      │
│  ├── School Groups                          │
│  │   ├── Sapphire Education Group            │
│  │   ├── Adeyemi Group                       │
│  │   └── [Multi-campus management]           │
│  └── Suspended / Churned                    │
│      ├── Churn Reasons (survey)             │
│      └── Win-back Campaigns                 │
│                                             │
│  AFRICAN FINANCE                            │
│  ├── MoMo Settlement                        │
│  │   ├── Daily Collections                   │
│  │   ├── Settlement Reconciliation           │
│  │   └── Failed Transaction Recovery         │
│  ├── Paystack / Flutterwave (Nigeria prep)    │
│  ├── M-Pesa (Kenya prep)                    │
│  └── Currency Exchange Rates                │
│      ├── GHS to NGN to KES to USD              │
│      └── Auto-update (daily)                │
│                                             │
│  AFRICAN INTEGRATIONS                       │
│  ├── WhatsApp Business API                  │
│  │   ├── Template Approval Status           │
│  │   ├── Delivery Reports                   │
│  │   └── Rate Limit Monitoring               │
│  ├── Arkesel SMS (Ghana)                    │
│  ├── Termii SMS (Nigeria)                   │
│  ├── Africa's Talking (Kenya)               │
│  └── MoMo API (MTN)                         │
│                                             │
│  PLATFORM                                   │
│  ├── Plans & Pricing                        │
│  │   ├── Free (50 students)                │
│  │   ├── Growth (300 students)              │
│  │   ├── Pro (800 students)                 │
│  │   └── Enterprise (Unlimited)            │
│  ├── Feature Flags                          │
│  ├── System Themes                          │
│  └── Email Templates                        │
│                                             │
│  ACCOUNT                                    │
│  ├── Profile                                │
│  └── Logout                                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4. School Admin Dashboard (Headmaster / Proprietor)

The **command center** for running a Ghanaian school.

```
┌─────────────────────────────────────────────┐
│  [School Logo]                              │
│  Sunshine Primary School                    │
│  Accra, Ghana - GES-Registered              │
├─────────────────────────────────────────────┤
│                                             │
│  COMMAND CENTER             ▼                │
│  ├── Dashboard              ★               │
│  │   ├── Fee Pulse: GHS 24,800 / GHS 31,500 │
│  │   ├── Attendance: 94% (456 present)       │
│  │   ├── BECE Countdown: 47 days             │
│  │   └── Quick Actions: [Mark Attendance]    │
│  │                      [Collect Fee]        │
│  │                      [Send Notice]        │
│  └── Analytics                              │
│      ├── Term Performance                   │
│      ├── Fee Recovery Trend                 │
│      └── Parent Engagement Score            │
│                                             │
│  FRONT OFFICE               ▶               │
│  ├── Admission Enquiry                      │
│  │   ├── Pipeline: Inquiry to Visit to Enroll│
│  │   └── Follow-up Reminders               │
│  ├── Student ID Cards                       │
│  │   ├── Generate with Photo + QR            │
│  │   └── Print Batch (PDF)                 │
│  └── Certificates                           │
│      ├── Character Certificate              │
│      ├── Leaving Certificate                │
│      └── Bulk Generate                      │
│                                             │
│  STUDENTS                   ▼                │
│  ├── All Students           ★               │
│  │   ├── Table: ID | Name | Class | Fees    │
│  │   ├── Filters: Class / Gender / Fees Due  │
│  │   └── Bulk: Promote / Message / Export    │
│  ├── Add Student                            │
│  └── Import Students        ★               │
│      ├── Download NaCCA Template            │
│      ├── Upload CSV / Excel                 │
│      ├── Validate & Preview                 │
│      └── Import with Error Report           │
│                                             │
│  ACADEMICS                  ▼                │
│  ├── Classes & Subjects                     │
│  │   ├── KG to Primary 6 to JHS to SHS        │
│  │   ├── NaCCA Subject List (Auto-loaded)    │
│  │   └── Teacher Assignment                  │
│  ├── Timetable                              │
│  │   ├── Visual Drag-Drop Builder            │
│  │   ├── Teacher Conflict Detection          │
│  │   └── Publish to Staff App                │
│  ├── Attendance             ★               │
│  │   ├── Mark Daily (One-tap)              │
│  │   ├── Bulk Class Attendance               │
│  │   ├── Absence Alerts (Auto-WhatsApp)      │
│  │   └── Monthly Summary                     │
│  ├── Continuous Assessment  ★               │
│  │   ├── NaCCA Grid: Quiz | Project | Exam   │
│  │   ├── Auto-Grade Computation              │
│  │   ├── Competency Bands (EE/ME/AE/BE)      │
│  │   └── Class Ranking (Internal only)       │
│  ├── Exam Scheduling                        │
│  │   ├── Internal Exams (Mid-Term, End-Term) │
│  │   ├── Mock BECE / WASSCE                  │
│  │   └── Exam Timetable (PDF)                │
│  ├── Report Cards           ★               │
│  │   ├── NaCCA Terminal Report              │
│  │   ├── School-Branded PDF                 │
│  │   ├── QR Verification                     │
│  │   └── Distribute: WhatsApp / Print / PDF    │
│  └── BECE / WASSCE Prep     ★               │
│      ├── Syllabus Tracker (WAEC-aligned)      │
│      ├── Past Question Bank                   │
│      ├── Student Readiness Score              │
│      └── Class vs. National Benchmark         │
│                                             │
│  FEES & FINANCE             ▼                │
│  ├── Collect Fees           ★               │
│  │   ├── Search Student                      │
│  │   ├── Enter Amount                        │
│  │   ├── Select: MoMo / Cash / Bank          │
│  │   ├── Trigger MoMo Prompt (QR / USSD)     │
│  │   └── Auto-Receipt (PDF + WhatsApp)       │
│  ├── Fee Structure                          │
│  │   ├── Per-Class Fees                      │
│  │   ├── Additional Charges (PTA, Uniform)   │
│  │   └── Installment Plans                    │
│  ├── Fee Reports            ★               │
│  │   ├── Collection by Class / Term           │
│  │   ├── Outstanding Balances                │
│  │   ├── Payment Method Breakdown            │
│  │   └── Fee Recovery Rate                   │
│  ├── Expenses                               │
│  │   ├── Categories (Utilities, Supplies)     │
│  │   └── Monthly P&L                         │
│  └── Payroll                                │
│      ├── GES Salary Scale (Pre-configured)   │
│      ├── SSNIT Deductions                     │
│      ├── Payslip Generation                   │
│      └── Staff Payment (MoMo / Bank)          │
│                                             │
│  OPERATIONS                 ▶               │
│  ├── Library                                │
│  │   ├── Catalog (ISBN Scan via Camera)      │
│  │   ├── Issue / Return                      │
│  │   ├── Overdue Auto-Alert                  │
│  │   └── Lost Book Fee Auto-Add              │
│  ├── Hostel (Boarding Schools)              │
│  │   ├── Room / Bed Allocation               │
│  │   ├── Roll Call (Linked to Attendance)    │
│  │   └── Disciplinary Log                    │
│  ├── Transport                              │
│  │   ├── Route Planning                      │
│  │   ├── Student Assignment                  │
│  │   ├── Driver WhatsApp Check-in            │
│  │   └── Parent ETA Alert (10 min before)    │
│  └── Inventory                              │
│      ├── Asset Register                     │
│      ├── QR Check-in/Out                    │
│      └── Depreciation Alerts                │
│                                             │
│  AFRICAN COMMUNICATION      ▼                │
│  ├── WhatsApp Reports       ★               │
│  │   ├── Templates:                         │
│  │   │   ├── Fee Reminder (English/Twi/Ga)   │
│  │   │   ├── Attendance Alert                │
│  │   │   ├── Report Card Ready               │
│  │   │   ├── General Notice                  │
│  │   │   └── Emergency Alert                 │
│  │   ├── Bulk Send (Class / School)          │
│  │   ├── Scheduled Messages                  │
│  │   └── Delivery Report (Sent/Delivered/Read)│
│  ├── SMS Fallback (Arkesel)                 │
│  │   ├── Auto-fallback if WhatsApp fails      │
│  │   └── Emergency Broadcast                  │
│  ├── Notice Board                           │
│  │   ├── Digital Board (Visible to Parents)   │
│  │   └── Pin Important                       │
│  └── Voice Notes (Future)                   │
│      └── Send voice message to parents       │
│                                             │
│  SCHOOL SETUP               ▶               │
│  ├── School Profile                         │
│  │   ├── Name, Address, GES Reg. Number      │
│  │   ├── Contact: Phone, WhatsApp, Email     │
│  │   └── Academic Calendar (Term Dates)      │
│  ├── Classes & Staff                        │
│  │   ├── Add / Edit Classes                  │
│  │   ├── Assign Teachers                     │
│  │   └── Staff Roles & Permissions           │
│  ├── Theme & Branding                       │
│  │   ├── Primary Color                       │
│  │   ├── Logo Upload (Light + Dark)           │
│  │   ├── Font Family                         │
│  │   └── Custom Domain (Enterprise)           │
│  ├── NaCCA Settings                         │
│  │   ├── Grading Scale (Customizable)         │
│  │   ├── Assessment Weights                  │
│  │   └── Competency Band Thresholds          │
│  ├── Integrations                           │
│  │   ├── MoMo API Status                     │
│  │   ├── WhatsApp API Status                 │
│  │   └── Arkesel SMS Status                  │
│  └── Data Management                        │
│      ├── Export All (CSV / Excel)            │
│      ├── Import (Students, Staff, Fees)      │
│      └── Backup / Restore                   │
│                                             │
│  [Headmaster Name]                          │
│  ├── Profile                                │
│  ├── Theme: Dark / Light                    │
│  ├── Language: English / Twi (UI)           │
│  └── Logout                                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 5. Teacher Dashboard

*Teachers use phones. Design for speed, not power.*

```
┌─────────────────────────────────────────────┐
│  Sunshine Primary                           │
├─────────────────────────────────────────────┤
│                                             │
│  MY DAY                     ▼               │
│  ├── Dashboard              ★               │
│  │   ├── Today's Classes (3 periods)         │
│  │   ├── Attendance Pending: JHS 2A        │
│  │   └── Grades Due: Mathematics           │
│  ├── My Timetable           ★               │
│  │   ├── Visual Period Grid                │
│  │   └── Substitute Alerts                 │
│  ├── Mark Attendance        ★               │
│  │   ├── One-tap: Present / Absent / Late   │
│  │   ├── Bulk Class Marking                  │
│  │   └── Submit (Auto-sync when online)      │
│  └── Enter Grades           ★               │
│      ├── Select Class to Subject             │
│      ├── NaCCA Grid (Excel-like)            │
│      ├── Auto-save per cell                 │
│      └── Submit for Approval                │
│                                             │
│  MY STUDENTS                ▶               │
│  ├── Class List                             │
│  │   ├── Filter: Attendance / Fees / Grades │
│  │   └── Quick Actions per student          │
│  ├── Student Profiles                       │
│  │   ├── Photo, Contact, Parent Info        │
│  │   └── Academic History                   │
│  └── Homework & Assignments               │
│      ├── Create Assignment                  │
│      ├── Attach File / Link                 │
│      └── Due Date + Reminder                │
│                                             │
│  COMMUNICATION              ▶               │
│  ├── Send Class Notice                      │
│  │   ├── WhatsApp to all parents in class   │
│  │   └── Schedule for later                 │
│  └── Parent Messages                        │
│      ├── View Replies                       │
│      └── Reply (via WhatsApp)               │
│                                             │
│  [Ms. Serwaa]                               │
│  ├── Profile                                │
│  ├── Theme: Dark                            │
│  ├── Language: English / Twi                │
│  └── Logout                                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 6. Bursar / Accountant Dashboard

*The money person. Everything is about cash flow.*

```
┌─────────────────────────────────────────────┐
│  Sunshine Primary                           │
├─────────────────────────────────────────────┤
│                                             │
│  DAILY CASH                 ▼               │
│  ├── Collect Fees           ★               │
│  │   ├── Search: Name / ID / Class         │
│  │   ├── Fee Card: Total | Paid | Balance   │
│  │   ├── Enter Amount                        │
│  │   ├── Method: MoMo / Cash / Bank         │
│  │   ├── [TRIGGER MTN MoMo]                 │
│  │   └── Auto-Receipt (PDF + WhatsApp)      │
│  ├── Today's Collections    ★               │
│  │   ├── Real-time MoMo Feed                │
│  │   ├── Cash Register                      │
│  │   └── Bank Transfers                     │
│  ├── Outstanding Fees       ★               │
│  │   ├── By Class / By Student              │
│  │   ├── Days Overdue                       │
│  │   └── [Send WhatsApp Reminder]            │
│  └── Fee Reports            ★               │
│      ├── Collection by Day / Week / Term     │
│      ├── Outstanding Report (PDF)            │
│      ├── Payment Method Breakdown            │
│      └── MoMo Reconciliation Status          │
│                                             │
│  FINANCE                    ▶               │
│  ├── Revenue Analytics                      │
│  │   ├── Term vs. Term Comparison            │
│  │   ├── Class-wise Revenue                 │
│  │   └── Projections                        │
│  ├── Expenses                               │
│  │   ├── Categories: Utilities, Supplies    │
│  │   ├── Vendor Payments                     │
│  │   └── Monthly P&L                        │
│  ├── Payroll                                │
│  │   ├── Staff List + Salary Scale           │
│  │   ├── SSNIT + Tax Deductions              │
│  │   ├── Payslip Generation                  │
│  │   └── Payment (MoMo / Bank)              │
│  └── Reconciliation                         │
│      ├── MoMo Settlement Report             │
│      ├── Failed Transactions                │
│      └── Daily Reconciliation Job           │
│                                             │
│  [Bursar Darkwa]                            │
│  ├── Profile                                │
│  ├── Theme: Light (office work)              │
│  └── Logout                                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 7. Parent Portal (No Sidebar — Single Page)

*Parents use basic phones. Zero friction.*

```
┌─────────────────────────────────────────────┐
│  Sunshine Primary School                    │
│  Welcome, Mrs. Asante!                      │
├─────────────────────────────────────────────┤
│                                             │
│  FEES (Tap to expand)                       │
│  ┌─────────────────────────────────────┐    │
│  │  GHS 450.00 Outstanding             │    │
│  │  Term 2, 2026 - Due: 15 June        │    │
│  │                                     │    │
│  │  [PAY WITH MoMo]                    │    │
│  │  [View Payment History]             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  MY CHILDREN                                │
│  ┌─────────────────────────────────────┐    │
│  │  Kofi Mensah - JHS 2                │    │
│  │  Attendance: 94% (Present)          │    │
│  │  Grades: View Report Card           │    │
│  │  Fees: GHS 450 Due                  │    │
│  │  Homework: 2 pending                │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │  Ama Mensah - Primary 4             │    │
│  │  Attendance: 98% (Present)          │    │
│  │  Grades: View Report Card           │    │
│  │  Fees: Paid                         │    │
│  │  Homework: 1 pending                │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  SCHOOL NOTICES                             │
│  ┌─────────────────────────────────────┐    │
│  │  School closed tomorrow             │    │
│  │  due to heavy rain forecast         │    │
│  │  Posted: Today, 8:00 AM             │    │
│  ├─────────────────────────────────────┤    │
│  │  PTA Meeting: Friday, 5 PM          │    │
│  │  Agenda: Fee structure review       │    │
│  │  Posted: Yesterday                  │    │
│  ├─────────────────────────────────────┤    │
│  │  Kofi's Report Card is Ready!       │    │
│  │  [View PDF]                         │    │
│  │  Posted: 2 days ago                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  QUICK CONTACT                              │
│  ├── WhatsApp School                      │
│  ├── Call Office: 0244XXXXXX               │
│  └── Email: info@sunshine.edu.gh          │
│                                             │
│  Profile | Theme | Logout                   │
│  English | Twi | Ga                         │
│                                             │
└─────────────────────────────────────────────┘
```

**Parent Portal Rules:**
- No login required if accessed from WhatsApp link (token-based)
- Works on any phone with a browser (even 200 Cedi feature phones)
- All text is large (18px+), buttons are thumb-sized (48px+)
- Images are optional (low data mode)
- Language toggle: English / Twi / Ga / Ewe

---

## 8. Mobile Bottom Navigation (Phone-First Africa)

**Admin on Phone:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Home]  [Students]  [Fees]  [Exams]  [More]│
│   Dash     Stud      Fees    Exams    Menu  │
│                                             │
└─────────────────────────────────────────────┘
```

**Teacher on Phone:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Home]  [Timetable]  [Attendance]  [Grades] [More]│
│   Dash      Time        Attend       Grades  Menu │
│                                             │
└─────────────────────────────────────────────┘
```

**Bursar on Phone:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Home]  [Collect]  [Reports]  [Receipts]  [More]│
│   Dash     Collect    Report     Receipt    Menu │
│                                             │
└─────────────────────────────────────────────┘
```

**"More" Menu expands to:**
- Profile
- Theme (Light / Dark)
- Language (English / Twi / Ga)
- Notifications
- Help
- Logout

---

## 9. The "African Empty States"

Every tab has a culturally relevant empty state:

| Tab | Empty State | CTA |
|-----|-------------|-----|
| **Students** | "No students yet. Add your first pupil or import your existing register." | "Add Student" / "Import CSV" |
| **Fees** | "No fees collected today. Every cedi counts!" | "Collect First Fee" |
| **Attendance** | "Attendance not marked for today. Don't let the GES inspector catch you!" | "Mark Attendance" |
| **Grades** | "No assessments recorded this term. NaCCA requires continuous tracking." | "Enter First Assessment" |
| **WhatsApp** | "No messages sent yet. Parents are waiting on WhatsApp!" | "Send First Message" |
| **Library** | "No books catalogued. Start with the textbooks!" | "Add First Book" |
| **Transport** | "No bus routes set up. Parents need pickup times!" | "Add First Route" |

---

## 10. African-Specific Innovations in Navigation

### A. Offline-First Badges

Tabs show connectivity status:
- Green Online - Real-time sync active
- Yellow Syncing - Changes queued, will sync when online
- Red Offline - Working from local cache

### B. MoMo Status Indicator

Header shows MoMo API health:
- Green MoMo Active
- Yellow MoMo Slow (latency > 3s)
- Red MoMo Down (fallback to cash recording)

### C. WhatsApp Delivery Badge

Header shows today's message stats:
- 247 sent - 231 delivered - 198 read

### D. BECE Countdown Widget

Persistent in header during exam season:
- BECE: 47 days - WASSCE: 62 days

### E. Language Switcher

Always visible in footer or settings:
- English | Twi | Ga | Ewe | Hausa (Nigeria) | Yoruba | Igbo

---

## 11. Comparison: ProjectWorlds vs. SchoolOS Africa

| Dimension | ProjectWorlds (Generic) | SchoolOS Africa |
|-----------|------------------------|-----------------|
| **Total Tabs** | 50+ | 20-25 (role-based) |
| **Navigation Depth** | 3-4 levels | 2 levels max |
| **Payment Tab** | Stripe / Razorpay / PayPal | **MTN MoMo** + Cash + Bank |
| **Communication** | Generic SMS | **WhatsApp Business API** + Arkesel fallback |
| **Report Cards** | Generic template | **NaCCA-compliant** + QR verification |
| **Exams** | Generic quiz | **BECE/WASSCE prep** + WAEC syllabus |
| **Curriculum** | "Any curriculum" | **NaCCA pre-loaded** + competency bands |
| **Parent Portal** | Full app with sidebar | **Single-page, no-login, feature-phone friendly** |
| **Mobile** | Separate Flutter apps | **Responsive web + PWA** (no app store needed) |
| **Offline** | None | **Offline-first attendance** + sync |
| **Language** | UI translation only | **WhatsApp templates in Twi/Ga/Ewe** |
| **Payroll** | Generic | **GES salary scale pre-configured** + SSNIT |
| **Theme** | 6 pre-built | **School branding** + dark mode + user preference |
| **Search** | None | **Global Cmd+K** command palette |
| **Empty States** | Blank tables | **Culturally relevant guidance** + CTA |
| **Data** | None | **50+ schools' live data** to benchmarking |

---

## 12. Implementation Roadmap

### Phase 1: Core African Command Center (Weeks 1-3)

| Week | Tabs | African Twist |
|------|------|---------------|
| 1 | Dashboard, Students, Fees | MoMo integration, WhatsApp receipts, CSV import |
| 2 | Attendance, Continuous Assessment, Report Cards | Offline-first, NaCCA grid, QR verification |
| 3 | WhatsApp Reports, School Setup, Theme | Twi/Ga templates, school branding, NaCCA settings |

### Phase 2: Academic Deep Dive (Weeks 4-6)

| Week | Tabs | African Twist |
|------|------|---------------|
| 4 | Timetable, Exam Scheduling, BECE Prep | WAEC-aligned, mock exam generator |
| 5 | Library, Hostel, Transport | ISBN scan, roll call integration, WhatsApp driver check-in |
| 6 | Payroll, Expenses, Inventory | GES scale, SSNIT, QR asset tracking |

### Phase 3: Scale & Intelligence (Weeks 7-9)

| Week | Tabs | African Twist |
|------|------|---------------|
| 7 | Parent Portal (No-Login), Local Language | Feature-phone friendly, Twi/Ga UI |
| 8 | Fee Recovery Predictor, Churn Alert | ML on African payment patterns |
| 9 | Multi-Campus, School Groups, API | Sapphire Group-style superadmin |

### Phase 4: Nigeria Expansion Ready (Weeks 10-12)

| Week | Tabs | African Twist |
|------|------|---------------|
| 10 | NERDC Curriculum Plugin, NECO Reports | Modular curriculum engine |
| 11 | Paystack/Flutterwave, Termii SMS | Nigeria payment + communication rails |
| 12 | Hausa/Yoruba/Igbo WhatsApp Templates | Northern Nigeria accessibility |

---

**Design Version:** 2.0 - "African Command Center"  
**Target:** 12 weeks to full navigation system  
**Owner:** 1 frontend lead + 1 UX designer + 1 product manager  
**Status:** ✅ Specification Complete
