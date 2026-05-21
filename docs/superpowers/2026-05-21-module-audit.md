# Complete Module Audit: Managen vs ProjectWorlds Multi School ERP V2.0

**Date:** 2026-05-21
**Platform:** Managen (formerly SchoolOS) — pan-African multi-tenant school management SaaS
**Stack:** React + Node.js/Express + Supabase (PostgreSQL)
**Competitor Reference:** ProjectWorlds Multi School ERP V2.0 (205 modules)

---

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Built | Fully functional in production, confirmed frontend + backend |
| 🔶 Partial | Partially implemented, incomplete, or basic CRUD only |
| ❌ Not Built | Does not exist in codebase |

## Priority Legend

| Priority | Meaning |
|----------|---------|
| 🔴 Critical | Core functionality needed immediately for MVP competitiveness |
| 🟡 Important | Needed within 3 months for market parity |
| 🟢 Nice to have | Can wait 6+ months or post-launch |

---

## 205-Module Audit Table

### 1. Core Management (Modules 1–18)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 1 | Dashboard | ✅ Built | Role-specific dashboards: `HeadmasterDashboardV2.tsx`, `AccountantDashboardV2.tsx`, `TeacherDashboardV2.tsx`, `ParentDashboard.tsx`, `SuperAdminDashboard.tsx`. Backend: `GET /api/school/dashboard`. | — | — |
| 2 | Student Management | ✅ Built | Full CRUD in `StudentsEnhanced.tsx`, bulk delete, search, filter by class, CSV export. Backend: `GET/POST /api/school/students`. | — | — |
| 3 | Parent Management | ✅ Built | `ParentHome.tsx`, `ParentChild.tsx`, `ParentFees.tsx`, `ParentReports.tsx`, `ParentProfile.tsx`. Backend: `GET /api/school/parent/children`. | — | — |
| 4 | Teacher Management | ✅ Built | `StaffDirectory.tsx`, teacher CRUD routes. Backend: `GET/POST /api/school/teachers`. | — | — |
| 5 | Staff Management | ✅ Built | Non-teaching staff list, staff attendance. Backend: `GET /api/school/non-teaching-staff`. | — | — |
| 6 | Class Management | ✅ Built | `Academics.tsx` (classes, streams, sessions, terms). Backend: `GET/POST /api/school/classes`. | — | — |
| 7 | Section Management | ✅ Built | Streams management within `Academics.tsx`. Backend: class with stream/section support. | — | — |
| 8 | Subject Management | ✅ Built | Subject CRUD with class assignment. Backend: `GET/POST /api/school/subjects`, `class-subjects`. | — | — |
| 9 | Teacher-Subject Assignment | ✅ Built | `subject_teachers` table + teacher workload in Academics. Backend: PUT/GET teacher availability. | — | — |
| 10 | Student Promotion | ❌ Not Built | — | No promotion/gradation workflow. Students stay in same class until manually reassigned. | 🟡 |
| 11 | Bulk Student Import CSV/Excel | ✅ Built | `csvImportService.js` with validation, normalization, duplicate detection. XLSX support in `featureService.js`. Frontend: `BulkImport.tsx` with preview. | — | — |
| 12 | Student ID Card Generator | ❌ Not Built | — | No student ID card generation with photo, barcode, or school branding. | 🟡 |
| 13 | Admit Card Generator | ❌ Not Built | — | No exam admit card generation. | 🟢 |
| 14 | Transfer Certificate Generator | ❌ Not Built | — | No TC/leaving certificate generation. | 🟢 |
| 15 | Student Behavior Records | 🔶 Partial | `interventions` table with `type IN ('attendance', 'performance', 'behavior')`, severity, status. `InterventionNotes.tsx` UI component. | No dedicated discipline module with detentions, suspensions, conduct grading. | 🟡 |
| 16 | Co-curricular Activities & Grading | ❌ Not Built | Activity feed in `DashboardHome.tsx` and `Reports.tsx` — but this is user audit, not co-curricular. | No clubs, sports teams, extracurricular grading, or activity management. | 🟢 |
| 17 | Student Health Profiles | ❌ Not Built | — | No medical conditions, allergies, blood type, emergency contacts stored per student. | 🟡 |
| 18 | Alumni Tracking | ❌ Not Built | Alumni roles excluded from user counts in `schoolService.js`. | No alumni directory, no alumni portal, no communication with graduates. | 🟢 |

### 2. Attendance (Modules 19–27)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 19 | Student Daily Attendance | ✅ Built | `Attendance.tsx` with 4 tabs: overview, mark attendance, staff attendance, history. Backend: `POST /api/school/attendance` bulk mark. | — | — |
| 20 | Period-by-Period Attendance | 🔶 Partial | Daily attendance with per-student status (present/late/absent). | No period-wise attendance tracking with teacher login per period. | 🟡 |
| 21 | Biometric Attendance (ZKTeco) | ❌ Not Built | `useBiometricAuth.ts` is for app login only. | No ZKTeco hardware integration, no fingerprint attendance marking. | 🟢 |
| 22 | QR Code Attendance | ✅ Built | `AttendanceLinks.tsx` with geofenced QR links. Backend: `POST /api/school/attendance-link/generate`, `POST /verify`. | — | — |
| 23 | Late Arrival Tracking | 🔶 Partial | Attendance status options include "late" in the bulk mark UI. | No late arrival reports, no lateness statistics, no late arrival alerting. | 🟡 |
| 24 | Staff Attendance | ✅ Built | `DailySignIn.tsx` with QR sign-in/sign-out, geofence. Backend: staff attendance routes. | — | — |
| 25 | Attendance Reports | ✅ Built | `Reports.tsx` tab with attendance trends, charts. Backend: `GET /api/school/reports/attendance`. | — | — |
| 26 | Parent SMS/WhatsApp Alert on Absence | 🔶 Partial | Multi-channel notification system exists (SMS/WhatsApp/Email/Push). Backend: `notificationService.js`, `whatsappService.js`. | No automated absence-triggered alerts. Alerts are manual broadcasts, not event-driven. | 🟡 |
| 27 | Monthly Attendance Summary | ✅ Built | `GET /api/school/attendance/stats/range` with date range filtering. Charts in `Attendance.tsx`. | — | — |

### 3. Academics & Timetable (Modules 28–33)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 28 | Timetable Builder (Visual) | ✅ Built | `TimetableScheduler.tsx` with visual grid, drag periods. Backend: CSP auto-scheduler in `timetableScheduler.js`. | — | — |
| 29 | Syllabus Management | ❌ Not Built | — | No syllabus creation, syllabus progress tracking, or syllabus sharing. | 🟡 |
| 30 | Study Material Uploads | ❌ Not Built | File upload exists (`POST /api/school/upload`) but no study material organization. | No subject-wise study materials, no student access portal. | 🟡 |
| 31 | Homework Creation & Submission Tracking | ❌ Not Built | Assessments include assignments as a type but no dedicated homework module. | No homework creation, submission portal, deadline tracking, or grading. | 🟡 |
| 32 | Lesson Plan Management | ❌ Not Built | — | No lesson plan creation, sharing, or approval workflow. | 🟡 |
| 33 | Substitute Teacher Assignment | ❌ Not Built | — | No substitute teacher matching, availability tracking, or notification system. | 🟢 |

### 4. Exams & Grading (Modules 34–48)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 34 | Exam Session Management | ✅ Built | `Assessments.tsx` with CRUD, grading scales, score entry. Backend: `GET/POST /api/school/assessments`. | — | — |
| 35 | Mark Entry | ✅ Built | Inline score entry in `GradebookGrid.tsx`, bulk score submission. Backend: `POST /api/school/assessment-scores/bulk`. | — | — |
| 36 | Weighted Scoring (CA + Exams) | ✅ Built | Assessment types with weights, SBA (Standards-Based Assessment). `Assessment.tsx` type/weight config. | — | — |
| 37 | Grade Boundaries Configuration | ✅ Built | Grading scales + grade rules CRUD in `Assessments.tsx`. Backend: `grading_scales` and `grade_rules` tables. | — | — |
| 38 | Position Calculation (Class & Subject) | ✅ Built | `GET /api/school/analytics/top-bottom` returns top/bottom performers. Analytics dashboard shows rankings. | — | — |
| 39 | Report Card Generator | ✅ Built | `ReportCards.tsx` with Word template → PDF generation (mammoth + html-pdf). Backend: `POST /api/school/report-cards/generate`. | — | — |
| 40 | Bulk Report Card Printing | ✅ Built | BullMQ queue-based batch generation, ZIP download. Backend: `POST /api/school/report-cards/generate/:classId/:termId`. | — | — |
| 41 | Online CBT Exams | ❌ Not Built | — | No computer-based test platform, no timed exams, no auto-grading. | 🟢 |
| 42 | Question Bank Management | ❌ Not Built | — | No question repository with categories, difficulty levels, or tagging. | 🟢 |
| 43 | Auto-Grading | ❌ Not Built | — | No automatic scoring for objective questions. | 🟢 |
| 44 | Past Question Paper Library | ❌ Not Built | — | No archive of previous exam papers. | 🟢 |
| 45 | Question Paper Generator | ❌ Not Built | — | No auto-generator from question bank with template/format selection. | 🟢 |
| 46 | Continuous Assessment Management | ✅ Built | Assessment types with configurable weights (SBA/EXAM), term averages. `v_nacca_terminal_summary` view. — | — |
| 47 | Marksheet Generator | ✅ Built | Report card PDF with marks, AI-generated comments (Gemini). Parent download in `ParentReports.tsx`. | — | — |
| 48 | Multiple Report Card Templates | ✅ Built | Per-school .docx template upload. Backend: `POST /api/school/report-card/upload-template`. | — | — |

### 5. Fees & Finance (Modules 49–71)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 49 | Fee Group Management | ✅ Built | Fee structures with categories, class/term assignment. Backend: `fee_structures` table. | — | — |
| 50 | Fee Type Management | ✅ Built | Fee types within structures (tuition, boarding, transport as categories). | — | — |
| 51 | Installment Plans | ❌ Not Built | Partial payments and credit balance exists. | No formal installment plans with schedule, due dates, or automated tracking. | 🟡 |
| 52 | Discount Rules | ✅ Built | Full discount CRUD in `Finance.tsx` (lines 1032–1188). Backend: `discounts` table with type (percent/fixed) + value. | — | — |
| 53 | Fine/Late Payment Rules | ❌ Not Built | — | No late fee calculation, no fine rules by overdue duration. | 🟡 |
| 54 | Fee Carry-Forward | ❌ Not Built | Credit balance exists for overpayments. | No carry-forward of unpaid balances to next term/session. | 🟡 |
| 55 | Transport Fee Profiles | ❌ Not Built | "Transport" exists as a fee category only. | No transport fee profiles linked to routes or stops. | 🟢 |
| 56 | Cash Fee Collection | ✅ Built | Manual payment recording in `Finance.tsx`. Backend: `POST /api/school/payments`. | — | — |
| 57 | Card Payment (Stripe/Razorpay/PayPal/Flutterwave) | 🔶 Partial | Paystack fully integrated (initialize, webhook, reconciliation). Flutterwave config UI exists in FeeSettingsTab. | No Stripe, no Razorpay, no PayPal. Ghana-focused. | 🟡 |
| 58 | UPI QR Code Payment | ❌ Not Built | — | India-specific, not relevant for African market. | 🟢 |
| 59 | Fee Receipt Generator | ✅ Built | PDF receipt with QR code via `receiptGenerationService.js`. | — | — |
| 60 | Bulk Fee Import | ❌ Not Built | CSV import exists for students only. | No bulk fee structure assignment or invoice generation from CSV. | 🟡 |
| 61 | Defaulter Tracking & List | ✅ Built | `GET /api/school/finance/defaulters`, overdue alerts, outstanding balances. Finance dashboard shows defaulters. | — | — |
| 62 | Automated Fee Reminders (SMS/WhatsApp) | ✅ Built | `SmartFeeReminders.tsx` with multi-channel dispatch, scheduling. Backend: `POST /api/cron/fees/reminders/send`. | — | — |
| 63 | Fee Collection Reports | ✅ Built | Revenue analytics, monthly MRR, payment status breakdown. Backend: `GET /api/school/finance/*`. | — | — |
| 64 | Income Ledger | ❌ Not Built | ~ | No income categorization or ledger view. Fees are tracked per-invoice. | 🟡 |
| 65 | Expense Ledger | ❌ Not Built | — | No expense tracking, no expense categories, no receipts for expenses. | 🟡 |
| 66 | Bank Account Management | ❌ Not Built | — | No bank account registration, no multi-account reconciliation. | 🟢 |
| 67 | Petty Cash Tracking | ❌ Not Built | — | No petty cash fund, no reimbursement workflow. | 🟢 |
| 68 | Budget vs Actual Reports | ❌ Not Built | — | No budget creation or variance analysis. | 🟢 |
| 69 | Trial Balance | ❌ Not Built | — | No accounting trial balance. | 🟢 |
| 70 | Profit and Loss Statement | ❌ Not Built | — | No P&L statement generation. | 🟢 |
| 71 | Audit Trail on Transactions | ✅ Built | Full audit log with severity, filtering, CSV export. Backend: `audit_logs` table. | — | — |

### 6. HR & Payroll (Modules 72–85)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 72 | Staff Profiles & Documents | 🔶 Partial | `StaffDirectory.tsx` with basic profiles. Avatar upload. | No document storage (contracts, certificates, ID copies). No full profile. | 🟡 |
| 73 | Department Management | ❌ Not Built | — | No departments, no head-of-department assignment. | 🟡 |
| 74 | Staff ID Generation | ❌ Not Built | — | No staff ID card generation. | 🟢 |
| 75 | Contract Management | ❌ Not Built | — | No contract types, no start/end date tracking, no renewal reminders. | 🟡 |
| 76 | Leave Types Configuration | ❌ Not Built | — | No leave categories (annual, sick, maternity, etc.). | 🟡 |
| 77 | Leave Application & Approval Workflow | ❌ Not Built | Approval system exists (`approvals` table + UI) for fees/report cards, not for leave. | No leave request, approval chain, or calendar integration. | 🟡 |
| 78 | Leave Balance Tracking | ❌ Not Built | — | No accrual, no balance per leave type. | 🟡 |
| 79 | Salary Structure Configuration | ❌ Not Built | Basic `payroll` table with amount/month/year. | No salary templates, no grade levels, no allowance/deduction configuration. | 🟡 |
| 80 | Payroll Processing | 🔶 Partial | `POST /api/school/payroll/run` exists. | No multi-step pay run (draft → review → approve → disburse). No calculation engine. | 🟡 |
| 81 | Payslip Generation | ❌ Not Built | — | No payslip PDF with earnings, deductions, and net pay breakdown. | 🟡 |
| 82 | Bank Transfer List Export | ❌ Not Built | — | No CSV/MT940 export for bank bulk transfers. | 🟢 |
| 83 | Payroll History | 🔶 Partial | Basic select from `payroll` table. | No historical view with filters, no YTD reports. | 🟡 |
| 84 | Overtime Calculation | ❌ Not Built | Staff attendance has sign-in/sign-out times. | No overtime rule configuration, no automatic overtime calculation. | 🟢 |
| 85 | Tax & Pension Deduction (Country-specific) | ❌ Not Built | — | No Ghana SSNIT/SIT (Pay As You Earn) calculation. No NHIS deduction. | 🟡 |

### 7. Library Management (Modules 86–93)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 86 | Book Catalog (ISBN/Barcode) | 🔶 Partial | Basic book CRUD with title, author, ISBN fields. | No barcode generation, no cover image, no catalog search. Basic fields only. | 🟢 |
| 87 | Book Issue & Return | ✅ Built | `POST /api/school/library/issue`, `PUT /api/school/library/return/:id`. | — | — |
| 88 | Overdue Tracking & Fines | 🔶 Partial | Overdue detection exists in library service. | No fine calculation, no overdue notice automation. | 🟢 |
| 89 | Book Reservation | ❌ Not Built | — | No hold/reservation system for checked-out books. | 🟢 |
| 90 | Member Registration | ❌ Not Built | Uses existing student/teacher users. | No separate library membership with barcode card. | 🟢 |
| 91 | E-book / Digital Resource Linking | ❌ Not Built | — | No digital resource URLs attached to catalog entries. | 🟢 |
| 92 | Damaged/Lost Book Recording | ❌ Not Built | — | No damage assessment or lost book replacement cost. | 🟢 |
| 93 | Library Reports | ❌ Not Built | — | No circulation reports, popular books, or usage statistics. | 🟢 |

### 8. Hostel Management (Modules 94–103)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 94 | Hostel Building & Room Configuration | ❌ Not Built | — | No building/room setup, no floor plans. | 🟡 |
| 95 | Room Type Management | ❌ Not Built | — | No room types (dorm, shared, single, VIP). | 🟡 |
| 96 | Bed Allocation | ❌ Not Built | — | No bed assignment per student, no occupancy tracking. | 🟡 |
| 97 | Hostel Fee Integration | ❌ Not Built | Boarding exists as a fee category. | No hostel fees linked to room type. | 🟡 |
| 98 | Boarding vs Day Student Distinction | 🔶 Partial | `boarding_status` field in CSV import ('Day' | 'Boarding'). | No boarding-specific management UI. | 🟡 |
| 99 | Hostel Attendance (Roll Call) | ❌ Not Built | — | No nightly roll call, no check-in/check-out. | 🟢 |
| 100 | Hostel Discipline Log | ❌ Not Built | — | No hostel-specific behavior tracking. | 🟢 |
| 101 | Meal/Feeding Plan Management | ❌ Not Built | — | No meal plan, no dietary preference tracking. | 🟢 |
| 102 | Matron/Warden Management | ❌ Not Built | — | No hostel staff assignment. | 🟢 |
| 103 | Hostel Notices | ❌ Not Built | General notice system exists. | No hostel-specific notice board. | 🟢 |

### 9. Transport Management (Modules 104–113)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 104 | Route Management | ❌ Not Built | — | No route creation, no stops, no schedule. | 🟡 |
| 105 | Stop Management with GPS | ❌ Not Built | Geofencing exists for attendance. | No bus stop GPS coordinates, no stop-to-route mapping. | 🟡 |
| 106 | Vehicle Fleet Management | ❌ Not Built | — | No vehicle registration, no inspection tracking. | 🟢 |
| 107 | Student-to-Route-to-Stop Assignment | ❌ Not Built | — | No assignment of students to routes and stops. | 🟡 |
| 108 | Real-time GPS Tracking (Driver App) | ❌ Not Built | — | No driver mobile app, no live GPS feed. Documented as future scope. | 🟢 |
| 109 | Parent Proximity Alert | ❌ Not Built | — | No "bus is near" push notification. | 🟢 |
| 110 | Driver Management | ❌ Not Built | Staff management exists. | No driver-specific profile, no license/route assignment. | 🟢 |
| 111 | Trip Logs | ❌ Not Built | — | No trip start/end recording. | 🟢 |
| 112 | Vehicle Maintenance Log | ❌ Not Built | — | No maintenance scheduling, no service history. | 🟢 |
| 113 | Fuel Consumption Tracking | ❌ Not Built | — | No fuel logs, no mileage tracking. | 🟢 |

### 10. Health Management (Modules 114–119)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 114 | Student Medical Conditions & Allergies | ❌ Not Built | — | No medical conditions, allergy alerts, or emergency contacts stored per student. | 🟡 |
| 115 | Vaccination Records | ❌ Not Built | — | No immunization tracking. | 🟢 |
| 116 | Clinic Visit Log | ❌ Not Built | — | No school nurse visit recording. | 🟢 |
| 117 | Referral to Hospital Tracking | ❌ Not Built | — | No referral workflow. | 🟢 |
| 118 | Medication Stock Management | ❌ Not Built | — | No school clinic inventory. | 🟢 |
| 119 | Health Reports | ❌ Not Built | — | No medical reports or health summary. | 🟢 |

### 11. Communication & Notifications (Modules 120–128)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 120 | WhatsApp API Integration | ✅ Built | Twilio WhatsApp + Meta WhatsApp Business API. AI chatbot replies. Backend: `whatsappService.js`. | — | — |
| 121 | SMS Integration (Twilio) | ✅ Built | Arkesel (primary) + Twilio SMS. Rate-limited. Backend: `smsService.js`. | — | — |
| 122 | Push Notifications (Firebase FCM) | ✅ Built | Capacitor FCM plugin + Web Push (VAPID). Frontend: `useFcmPush.ts`, existing web push. | — | — |
| 123 | Email Broadcasting (per-school SMTP) | ✅ Built | Mailgun integration. Backend: `emailService.js`. Per-school SMTP config. | — | — |
| 124 | Telegram Bot Notifications | ❌ Not Built | — | No Telegram integration. | 🟢 |
| 125 | In-app Messaging | ✅ Built | `Inbox.tsx`, notification system. Backend: messages, announcements routes. | — | — |
| 126 | Notice Board (Public & Private) | ✅ Built | Announcements CRUD with publish workflow, event creation. | — | — |
| 127 | Event Calendar | ✅ Built | Events CRUD, parent Home page shows events. Backend: `events` table. | No full monthly/weekly calendar UI. Event list view only. | 🟡 |
| 128 | Emergency Broadcast | ❌ Not Built | Broadcast system exists. | No emergency-specific channel with priority override. | 🟢 |

### 12. AI & Intelligent Features (Modules 129–133)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 129 | Grounded AI Assistant (Gemini/OpenAI) | ✅ Built | Gemini 1.5 Flash integration. `geminiClient.js`, `chatbotService.js`, `reportCommentsService.js`. | — | — |
| 130 | Intent Detection Engine | ✅ Built | Keyword-based intent classifier in `chatbotService.js` (balance, attendance, results, deadlines). | Rule-based, not ML/NLP based. Limited to 4 intents. | 🟢 |
| 131 | Role-Based AI Privacy | ✅ Built | Per-school rate limiting (20 req/min), school-scoped data access. | — | — |
| 132 | Natural Language Data Queries | ❌ Not Built | Intent chatbot answers structured queries. | No free-form NL query to database. | 🟢 |
| 133 | AI Available in Web & Mobile | ✅ Built | WhatsApp chatbot for parents, AI report comments for staff. | No web-based chatbot UI. | 🟡 |

### 13. Branding & Customization (Modules 134–143)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 134 | Custom Domain Mapping per School | ❌ Not Built | Subdomain-based (`schoolslug.yourapp.com`). | No custom domain (CNAME) mapping. | 🟡 |
| 135 | Custom Logo & Brand Colors | ✅ Built | Logo upload, favicon settings, branding settings tab. | — | — |
| 136 | Auto-Styling Engine (colors from logo) | ❌ Not Built | — | No color extraction from uploaded logo. | 🟢 |
| 137 | Six+ Dashboard Themes | 🔶 Partial | Theme colors configurable via settings. | No pre-built themes, no theme switching. | 🟢 |
| 138 | Custom Login Page per School | ❌ Not Built | Shared auth page. | No per-school login page with school branding. | 🟢 |
| 139 | Custom Menu Manager | ❌ Not Built | Sidebar is fixed. | No drag-and-drop menu customization for school admins. | 🟢 |
| 140 | Custom Email/SMS Templates | ✅ Built | Message templates CRUD, multi-channel. Backend: `message_templates` table. | — | — |
| 141 | School Landing Page Builder | ❌ Not Built | Fixed global landing page. | No per-school microsite builder. | 🟢 |
| 142 | Certificate Template Builder | ❌ Not Built | Report card template upload exists. | No interactive template builder UI. Upload .docx only. | 🟢 |
| 143 | Report Card Template Builder | ❌ Not Built | Same as above — .docx upload only. | No visual template editor with drag-and-drop fields. | 🟢 |

### 14. Operations & Admin (Modules 144–152)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 144 | Visitor Log | ❌ Not Built | — | No visitor check-in/check-out tracking. | 🟢 |
| 145 | Postal & Dispatch Log | ❌ Not Built | — | No incoming/outgoing mail tracking. | 🟢 |
| 146 | Complaint Management | ❌ Not Built | — | No complaint submission, tracking, or resolution workflow. | 🟢 |
| 147 | Admission Enquiry CRM | ❌ Not Built | Admission reports exist. Demo request form on landing page. | No enquiry management, no follow-up tracking, no conversion funnel. | 🟡 |
| 148 | Lost & Found Log | ❌ Not Built | — | No lost item reporting system. | 🟢 |
| 149 | Inventory Asset Management | ❌ Not Built | — | No asset register, no assignment to staff/classrooms. | 🟢 |
| 150 | Stock Management & Low-Stock Alerts | ❌ Not Built | — | No inventory of consumables (stationery, cleaning, etc.). | 🟢 |
| 151 | Procurement Log | ❌ Not Built | — | No purchase order system, no vendor tracking. | 🟢 |
| 152 | Maintenance Request Log | ❌ Not Built | — | No facility repair request workflow. | 🟢 |

### 15. Biometric Hardware & Desktop (Modules 153–157)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 153 | ZKTeco Device Support (ADMS Push) | ❌ Not Built | — | No hardware biometric device driver support. | 🟢 |
| 154 | Windows Desktop Sync Agent | ❌ Not Built | — | No Windows EXE for offline sync. | 🟢 |
| 155 | Fingerprint Template Cloud Backup | ❌ Not Built | — | No biometric template storage in cloud. | 🟢 |
| 156 | Real-time Attendance Sync | ❌ Not Built | — | No real-time sync from hardware to cloud. | 🟢 |
| 157 | Multi-device Biometric Support | ❌ Not Built | — | No support for multiple biometric devices per school. | 🟢 |

### 16. Mobile Apps (Modules 158–163)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 158 | Student & Parent Mobile App | 🔶 Partial | Parent web portal built (PWA). Capacitor wrapper in progress (hooks done, native shell configured). | No student mobile app. Parent app not yet published. | 🔴 |
| 159 | Staff & Admin Mobile App | ❌ Not Built | — | No staff/admin mobile app. | 🟡 |
| 160 | Driver GPS Mobile App | ❌ Not Built | — | Documented as future scope. | 🟢 |
| 161 | Biometric PIN Lock Login on Mobile | ✅ Built | `useBiometricAuth.ts` with FaceID/TouchID. Capacitor plugin configured. | — | — |
| 162 | Firebase Push Notifications on All Apps | ✅ Built | FCM via Capacitor (in progress) + Web Push (existing). | — | — |
| 163 | Works on Low-end Android | ✅ Built | React PWA is lightweight. Capacitor app uses same codebase. | — | — |

### 17. Reports & Analytics (Modules 164–175)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 164 | Daily Attendance Summary Report | ✅ Built | Attendance reports with trends, charts. `GET /api/school/reports/attendance`. | — | — |
| 165 | Fee Collection Reports | ✅ Built | Revenue analytics, collection reports. `GET /api/school/finance/*`. | — | — |
| 166 | Exam Performance Reports | ✅ Built | Academic performance reports, class/subject comparison. `GET /api/school/reports/academic-performance`. | — | — |
| 167 | Staff Attendance Reports | ✅ Built | `GET /api/school/reports/staff-attendance`. | — | — |
| 168 | Library Utilization Reports | ❌ Not Built | — | No circulation stats, no popular titles, no overdue stats. | 🟢 |
| 169 | Transport Reports | ❌ Not Built | — | No transport-related reporting (transport not built). | 🟢 |
| 170 | Hostel Occupancy Reports | ❌ Not Built | — | No hostel occupancy statistics (hostel not built). | 🟢 |
| 171 | Headmaster KPI Dashboard | ✅ Built | `HeadmasterDashboardV2.tsx` with stats, charts, recent activity. | — | — |
| 172 | SaaS Revenue Analytics (Superadmin) | ✅ Built | MRR, plan breakdown, billing history in `SuperAdminDashboard.tsx`. | — | — |
| 173 | School Health Score | ❌ Not Built | System health (`SystemHealth.tsx`) checks DB/Redis/SMTP. | No composite health score per school. | 🟢 |
| 174 | Feature Usage Heatmap | ❌ Not Built | Basic audit logging exists. | No feature adoption analytics or usage frequency tracking. | 🟢 |
| 175 | Export to PDF/Excel/CSV | ✅ Built | CSV export on multiple pages, PDF generation (receipts, report cards). | — | — |

### 18. Subscription & Billing (Modules 176–182)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 176 | Subscription Plan Management | ✅ Built | 4-tier plan management (Free Trial/Growth/Pro/Enterprise). Backend: `provisionService.js`. | — | — |
| 177 | Automated Billing (Stripe/Razorpay/PayPal) | ❌ Not Built | Paystack fully integrated. | No Stripe (configured as stub), no Razorpay, no PayPal for international payments. | 🟡 |
| 178 | Invoice Generation | ✅ Built | Invoice CRUD, PDF receipts, Paystack payment. | — | — |
| 179 | Auto-disable on Non-payment | ✅ Built | Trial expiration queue in BullMQ. School suspension on trial end. | — | — |
| 180 | Free Trial Management | ✅ Built | 14-day free trial with reminders at 3/1/0 days. Queue-based check. | — | — |
| 181 | Annual Plan with Discount | ❌ Not Built | ~ | No annual pricing tier. Monthly only. | 🟡 |
| 182 | Promo Code System | ❌ Not Built | — | No discount codes or promotional pricing. | 🟢 |

### 19. Superadmin & Platform (Modules 183–193)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 183 | All Schools Overview (Superadmin) | ✅ Built | `SuperAdminDashboard.tsx`, schools list, stats. | — | — |
| 184 | School Detail Drilldown | ✅ Built | `GET /api/superadmin/schools/:id` with details, credentials. | — | — |
| 185 | Impersonate School Admin | ✅ Built | `GET /api/superadmin/schools/:id/credentials` generates temp password. | — | — |
| 186 | Activate/Suspend/Delete Schools | ✅ Built | Suspend/reactivate/delete endpoints. Full cascading deletion. | — | — |
| 187 | Broadcast to All Schools | ✅ Built | Superadmin broadcast system. | — | — |
| 188 | System Health Monitoring | ✅ Built | Datadog APM, Sentry, health endpoints (`/health`, `SystemHealth.tsx`). | — | — |
| 189 | Superadmin Audit Log | ✅ Built | Cross-school audit log with filtering and CSV export. | — | — |
| 190 | Revenue Analytics | ✅ Built | MRR, plan distribution, billing history. `SuperAdminDashboard.tsx`. | — | — |
| 191 | Failed Payment Management | 🔶 Partial | Failed payments endpoint exists (`GET /api/school/finance/failed-payments`). | No retry workflow, no automatic dunning emails. | 🟡 |
| 192 | Feature Flag Management | ✅ Built | Per-plan module gating with `requireModule()` middleware. | — | — |
| 193 | Addon Management | ❌ Not Built | ~ | No per-school addon purchase or activation. | 🟢 |

### 20. Website & Content (Modules 194–197)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 194 | Blog CMS Engine | ❌ Not Built | — | No blog creation, categories, or publishing workflow. | 🟢 |
| 195 | Landing Page Builder | ❌ Not Built | Fixed landing page. | No per-school microsite builder with drag-and-drop. | 🟢 |
| 196 | SEO Sitemap Generator | ❌ Not Built | HTML meta tags in `index.html`. | No dynamic sitemap.xml generation for school pages. | 🟢 |
| 197 | Multi-language Management | ❌ Not Built | English only. | No i18n framework, no translation files, no RTL support. | 🟡 |

### 21. Advanced Features (Modules 198–205)

| # | Module | Status | What Exists | What's Missing | Priority |
|---|--------|--------|-------------|----------------|----------|
| 198 | Financial Analytics Dashboard Apps Center | ❌ Not Built | Finance dashboards exist. | No apps center or marketplace concept. | 🟢 |
| 199 | Interactive Whiteboard Apps Center | ❌ Not Built | Decorative canvas on landing page only. | No collaborative whiteboard. | 🟢 |
| 200 | Question Paper Generator Apps Center | ❌ Not Built | — | No question paper generator. | 🟢 |
| 201 | Smart Certificate Engine | ❌ Not Built | Report card templates exist. | No certificate builder for awards, achievements, participation. | 🟢 |
| 202 | CBC Competency-Based Grading (Kenya/Africa) | 🔶 Partial | NaCCA (Ghana) competency-based gradebook exists with `v_nacca_terminal_summary` view. Future Nigeria expansion planned. | No CBC/Kenyan curriculum. NaCCA only covers Ghana + Nigeria expansion planned. | 🟡 |
| 203 | Image Gallery with Albums | ❌ Not Built | Logo/avatar upload only. | No photo gallery, no album management, no sharing. | 🟢 |
| 204 | Visitor & Postal Logs Extended | ❌ Not Built | — | Same as modules 144–145, not built. | 🟢 |
| 205 | School Event Management | ✅ Built | Events CRUD, parent events list, event cancellation. | — | — |

---

## Summary Statistics

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Built | **72** | 35.1% |
| 🔶 Partial | **21** | 10.2% |
| ❌ Not Built | **112** | 54.6% |
| **Total** | **205** | **100%** |

### By Priority

| Priority | Built | Partial | Not Built | Total |
|----------|-------|---------|-----------|-------|
| 🔴 Critical | 3 | 1 | 0 | 4 |
| 🟡 Important | 27 | 11 | 35 | 73 |
| 🟢 Nice to have | 42 | 9 | 77 | 128 |

---

## Top 20 Most Critical Missing Modules to Build First

These are the largest gaps that would most impact Managen's competitiveness in the African market:

| Rank | Module | Priority | Why Critical |
|------|--------|----------|-------------|
| 1 | **Student & Parent Mobile App** (158) | 🔴 | Already in progress (Capacitor). Chief marketing asset. Must ship. |
| 2 | **Admission Enquiry CRM** (147) | 🟡 | No lead tracking means lost enrollment opportunities. Schools need this. |
| 3 | **Homework Creation & Submission** (31) | 🟡 | Parents expect homework tracking. Top request from schools. |
| 4 | **Lesson Plan Management** (32) | 🟡 | Required by Ghana Education Service inspectors. |
| 5 | **Student Medical Conditions & Allergies** (114) | 🟡 | Daily safety concern. Emergency contact + allergy data is table stakes. |
| 6 | **Syllabus Management** (29) | 🟡 | NaCCA requires syllabus coverage tracking for accreditation. |
| 7 | **Student Promotion** (10) | 🟡 | Annual promotion is an operational necessity. Manual workaround exists. |
| 8 | **Study Material Uploads** (30) | 🟡 | Digital content delivery is expected in modern school platforms. |
| 9 | **Salary Structure Configuration** (79) | 🟡 | Payroll is a top-3 reason schools buy management software. |
| 10 | **Payroll Processing + Payslips** (80–81) | 🟡 | Currently just a basic CRUD. No calculation, no payslip PDF. |
| 11 | **Leave Management** (76–78) | 🟡 | Staff leave is a day-to-day HR operational need. |
| 12 | **Tax & Pension Deduction** (85) | 🟡 | Ghana SSNIT/SIT compliance is mandatory for schools. |
| 13 | **Installment Plans** (51) | 🟡 | Fee flexibility is critical for Ghanaian parents. Pay-as-you-go. |
| 14 | **Fine/Late Payment Rules** (53) | 🟡 | Automated late fee calculation improves fee collection rates. |
| 15 | **Fee Carry-Forward** (54) | 🟡 | Balances must roll over between terms. Currently manual. |
| 16 | **Income & Expense Ledger** (64–65) | 🟡 | Basic bookkeeping is expected. No expense tracking = blind spot. |
| 17 | **Contract Management** (75) | 🟡 | Staff contracts with end-date alerts reduce HR risk. |
| 18 | **Custom Domain Mapping** (134) | 🟡 | Schools want `schoolname.managen.com` or their own domain. |
| 19 | **Annual Plan with Discount** (181) | 🟡 | Annual commit improves cash flow and reduces churn. |
| 20 | **Multi-language Management** (197) | 🟡 | French-speaking African markets (Ivory Coast, Senegal, etc.) are underserved. |

---

## Unique Advantages (Not in Competitor List)

These are modules in Managen's codebase that the competitor's 205-module list does **not** cover. These are Managen's differentiators:

| # | Feature | Where | Why It Matters |
|---|---------|-------|----------------|
| 1 | **AI-Powered WhatsApp Chatbot** | `whatsappAIService.js`, `chatbotService.js`, `ai.js` | Parents check balances, attendance, exams via WhatsApp — no app needed. Huge for feature phone users. |
| 2 | **AI-Generated Report Card Comments** | `reportCommentsService.js` | Teachers save hours. Gemini generates personalized comments from performance data. |
| 3 | **Geofenced QR Code Attendance** | `AttendanceLinks.tsx`, geofence records | Teachers scan QR + location verification = no fake attendance marking. |
| 4 | **NaCCA-Compliant Gradebook** | `v_nacca_terminal_summary`, `20260519110000_nacca_gradebook.sql` | First-mover advantage in Ghana. Built for NaCCA inspector requirements. |
| 5 | **Smart Payment Handling** | `paymentHandlingService.js` | Partial payments, overpayments, credit balance, automatic reconciliation. |
| 6 | **Offline-First PWA with Sync Queue** | `offlineSync.ts`, IndexedDB | Works on flaky networks. Syncs attendance + fee payments when online. |
| 7 | **Multi-Role Dashboard System** | 6 role types + `RoleRouter.tsx` | One platform for headmasters, accountants, teachers, students, parents, superadmins. |
| 8 | **Command Palette + Global Search** | `CommandPalette.tsx`, `GlobalSearch.tsx` | Keyboard-driven navigation. Power user feature not found in competitors. |
| 9 | **Intervention/Behavior Tracking** | `interventions` table, `InterventionNotes.tsx` | Early warning system for at-risk students. |
| 10 | **Supabase Realtime Subscriptions** | `useRealtime.ts`, `useRealtimeNotifications.ts` | Live updates on payments, attendance, notifications. No polling needed. |
| 11 | **Trial Management with Queue** | Trial expiration BullMQ queue | Automated trial → conversion → suspension pipeline. |
| 12 | **Site Health Dashboard** | `SystemHealth.tsx`, health endpoints | DB/Redis/SMTP/Paystack/Twilio status per school. Proactive support. |
| 13 | **Ghana-Specific Payment Integration** | Paystack (GHS), Flutterwave config | Built for Ghana Mobile Money (MoMo) ecosystem. |
| 14 | **Fee Reminder Automation (3 channels)** | `SmartFeeReminders.tsx`, cron reminders | SMS + WhatsApp + Email fee reminders with configurable schedules. |

---

## Recommended Build Order — Next 90 Days

### Month 1 (Days 1–30): Ship Parent App + Core Finance

| Week | Focus | Modules |
|------|-------|---------|
| Week 1 | **Ship Parent Mobile App** | Complete Capacitor build, FCM, biometric. Publish to App Store/Play Store (App #158). |
| Week 2 | **Homework Module** | Build homework creation, submission, and grading (Module #31). |
| Week 3 | **Syllabus + Study Materials** | Syllabus CRUD with NaCCA alignment + file uploads (Modules #29, #30). |
| Week 4 | **Lesson Plans** | Lesson plan creation + sharing + approval workflow (Module #32). |

### Month 2 (Days 31–60): HR & Payroll

| Week | Focus | Modules |
|------|-------|---------|
| Week 5 | **Staff Profiles + Departments** | Enhanced staff profiles with document storage. Department management (Modules #72, #73). |
| Week 6 | **Salary Structures + Payroll Engine** | Salary templates, grade levels, allowance config. Multi-step pay run (Modules #79, #80). |
| Week 7 | **Payslips + Tax** | PDF payslip generation. SSNIT/SIT/P.A.Y.E calculation for Ghana (Modules #81, #85). |
| Week 8 | **Leave Management** | Leave types, application workflow, balance tracking (Modules #76, #77, #78). |

### Month 3 (Days 61–90): Finance & Admissions

| Week | Focus | Modules |
|------|-------|---------|
| Week 9 | **Contract Management + Student Promotions** | Contract tracking with end-date alerts. Promotion workflow (Modules #10, #75). |
| Week 10 | **Installments + Late Fees + Carry-Forward** | Fee installment plans, late fine rules, balance carry-forward (Modules #51, #53, #54). |
| Week 11 | **Income/Expense Ledger** | Basic double-entry bookkeeping. Income + expense tracking (Modules #64, #65). |
| Week 12 | **Admission Enquiry CRM** | Enquiry capture, follow-up tracking, conversion dashboard (Module #147). |

### Parallel (Ongoing)
- **Multi-language** — Start with i18n framework and French translation (Module #197)
- **Custom Domain Mapping** — Add CNAME-based custom domain per school (Module #134)
- **Annual Plan** — Add annual pricing with 2-months-free discount (Module #181)

---

*Audit generated from codebase analysis on 2026-05-21. Backend routes scanned from `routes/`, frontend pages from `schoolos-frontend/src/app/pages/`, database schema from `supabase/migrations/`.*
