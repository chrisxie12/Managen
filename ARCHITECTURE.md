# Architecture Overview

This document serves as a critical, living template designed to equip agents with a rapid and comprehensive understanding of the codebase's architecture, enabling efficient navigation and effective contribution from day one. Update this document as the codebase evolves.

## 1. Project Structure

This section provides a high-level overview of the project's directory and file structure, categorised by architectural layer or major functional area. It is essential for quickly navigating the codebase, locating relevant files, and understanding the overall organization and separation of concerns.

> **Note:** The current codebase does not yet follow the target structure below. The backend lives at the repository root (not in a `backend/` folder), there is no `common/` directory, and the frontend is in `schoolos-frontend/`. The structure below represents the **target architecture** after cleanup. See Section 9 for the migration plan.

### Target Structure

```
schoolos/                         # Monorepo root
├── backend/                      # All server-side code
│   ├── server.js                 # Express entry point
│   ├── config/
│   │   ├── db.js                 # Supabase client singleton
│   │   └── redis.js              # Redis connection (currently broken — see D.6)
│   ├── middleware/
│   │   ├── tenant.js             # Tenant resolution by subdomain
│   │   ├── validate.js           # Zod schema validation middleware
│   │   ├── authCookies.js        # Shared cookie helpers (target)
│   │   ├── audit.js              # DEAD — never imported (should be deleted)
│   │   └── rbac.js               # DEAD — never imported (should be deleted)
│   ├── routes/
│   │   ├── auth.js               # School user login/logout/me
│   │   ├── superAdmin.js         # Super admin auth + dashboard + school management
│   │   ├── onboard.js            # Signup, subdomain check, demo requests
│   │   ├── school.js             # School-scoped CRUD (students, teachers, classes, etc.)
│   │   └── billing.js            # DEAD — has duplicate /plans route; remove
│   ├── services/
│   │   ├── index.js              # Barrel export (missing examService, feeReminderService)
│   │   ├── authService.js        # Auth DB queries
│   │   ├── provisionService.js   # School provisioning + plan catalog
│   │   ├── schoolService.js      # School-scoped CRUD (~15 repetitive methods)
│   │   ├── billingService.js     # Paystack + Stripe webhook handlers
│   │   ├── examService.js        # Exam/result CRUD
│   │   ├── feeReminderService.js # Fee reminder scheduling + dispatch
│   │   ├── emailService.js       # Mailgun email transport
│   │   ├── smsService.js         # Arkesel SMS transport
│   │   ├── whatsappService.js    # Twilio WhatsApp transport
│   │   └── notificationUtils.js  # Exponential backoff + retry helper
│   ├── jobs/
│   │   └── trialQueue.js         # Trial expiry BullMQ queue
│   ├── models/
│   │   └── masterDB.js           # Master database connection helper
│   ├── scripts/
│   │   ├── api-tests.js          # API integration tests (node:test)
│   │   ├── smoke-test.js
│   │   ├── test-fee-reminders.js
│   │   └── test-superadmin-load.js
│   └── supabase/
│       ├── migrations/           # SQL migrations
│       └── functions/            # Edge functions
│
├── frontend/                     # schoolos-frontend/
│   ├── index.html                # Vite entry
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vercel.json
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── robots.txt
│   ├── server/
│   │   └── paystack-api.mjs      # Paystack verification proxy
│   └── src/
│       ├── main.tsx
│       ├── vite-env.d.ts
│       ├── styles/
│       │   ├── index.css          # Imports fonts, tailwind, theme
│       │   ├── fonts.css
│       │   ├── tailwind.css
│       │   └── theme.css          # CSS custom properties (currently ignored by pages)
│       ├── app/
│       │   ├── App.tsx            # RouterProvider wrapper
│       │   ├── routes.tsx         # React Router v7 routes
│       │   ├── components/
│       │   │   ├── ui/            # 48 shadcn/ui components (Radix + Tailwind)
│       │   │   ├── SchoolOSFlow.tsx  # Architecture flow diagram page
│       │   │   └── figma/         # DEAD — contains unused ImageWithFallback.tsx
│       │   ├── pages/
│       │   │   ├── LandingPage.tsx
│       │   │   ├── AuthPage.tsx
│       │   │   ├── DashboardLayout.tsx
│       │   │   ├── DashboardHome.tsx
│       │   │   ├── Students.tsx
│       │   │   ├── Academics.tsx
│       │   │   ├── Finance.tsx
│       │   │   ├── SmartFeeReminders.tsx
│       │   │   └── Communication.tsx
│       │   └── services/
│       │       └── api.ts         # Centralized fetch wrapper
│       └── assets/                # Images and SVGs
│
├── common/                       # DOES NOT EXIST YET — target for shared code
│   ├── types/
│   └── utils/
│
├── scripts/                      # Root-level automation scripts
├── docs/
├── .github/
├── ARCHITECTURE.md               # This file
└── README.md
```

### Current (Actual) Structure vs Target

| Aspect | Current State | Target |
|--------|--------------|--------|
| Backend location | Root (`server.js`, `routes/`, etc.) | `backend/` folder |
| Frontend location | `schoolos-frontend/` | `frontend/` |
| Shared code | None | `common/` with types + utils |
| Third-party tool | `antigravity-claude-proxy/` bundled | Separate repo |
| Barrel exports | Missing `examService`, `feeReminderService` | Complete |
| Dead files | `audit.js`, `rbac.js`, `ImageWithFallback.tsx` | Deleted |
| Empty dirs | `schoolos-frontend/src/config/` | Deleted |

---

## 2. High-Level System Diagram

```
                          ┌─────────────────────────────┐
                          │       Browser (User)         │
                          │  React 18 + Vite 6 + MUI    │
                          │  React Router v7 + shadcn/ui │
                          └──────────┬──────────────────┘
                                     │ HTTPS / JSON
                                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                     Backend (Node.js / Express 5)                   │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Auth     │  │  School  │  │  Super   │  │  Onboard          │  │
│  │  Routes   │  │  Routes  │  │  Admin   │  │  Routes           │  │
│  │  /api/auth│  │ /api/sch │  │  Routes  │  │  /api/onboard     │  │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────────┬─────────┘  │
│        │             │             │                  │            │
│        ▼             ▼             ▼                  ▼            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Services Layer                             │   │
│  │  authService | schoolService | provisionService               │   │
│  │  billingService | examService | feeReminderService           │   │
│  │  emailService | smsService | whatsappService                  │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                      │
│        ┌────────────────────┼────────────────────┐                 │
│        ▼                    ▼                    ▼                 │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────┐        │
│  │ Supabase  │      │    Redis     │      │  External    │        │
│  │ (Postgres)│      │  (BullMQ +   │      │  APIs        │        │
│  │           │      │   Cache)     │      │  Paystack    │        │
│  │ schools   │      │              │      │  Stripe      │        │
│  │ users     │      │  ⚠️ Broken — │      │  Mailgun     │        │
│  │ students  │      │  never       │      │  Twilio      │        │
│  │ fees      │      │  connects    │      │  Arkesel     │        │
│  │ ...       │      │              │      │              │        │
│  └──────────┘      └──────────────┘      └──────────────┘        │
└────────────────────────────────────────────────────────────────────┘
```

**Critical architecture notes:**

1. **Tenant middleware** (`middleware/tenant.js`) runs before school and auth routes. It resolves the current school from the request's subdomain and sets `req.tenant`. However, auth.js checks `req.school` instead (see D.3 in the analysis).
2. **Auth routes bypass tenant middleware caching** — auth.js reads `req.school` (always undefined) and performs redundant DB lookups.
3. **Two table names for the same entity**: `schools` and `tenants` are both used across the codebase. The provisioning service writes to `schools`, but the tenant middleware and super admin dashboard read from `tenants`. This must be consolidated.
4. **Cookie names are inconsistent**: `schoolos_token` is set on login, but `school.js` reads `schoolos_tenant_token`. After login, all school API routes return 401.
5. **Redis never connects**: `lazyConnect: true` + `retryStrategy: () => null` with no `redis.connect()` call. All Redis features silently fall back to in-memory.

---

## 3. Core Components

### 3.1. Frontend

**Name:** SchoolOS Web App

**Description:** React single-page application for school management. Provides dashboards for super admin, school admin, headmaster, teacher, accountant, parent, and student roles. Currently implements:
- Landing page with demo request
- Authentication (login)
- Dashboard layout with sidebar navigation
- Students management
- Academics / exams / results
- Finance (fees, payroll, analytics)
- Smart fee reminders with Paystack integration
- Communication (inbox, broadcast)

**NOTE:** The frontend currently only has the dashboard layout and page shells. Role-specific views (parent, student, teacher dashboards) are not yet implemented. The `allowRoles` middleware and RBAC system exist on the backend but the frontend routes do not gate by role.

**Technologies:** React 18, Vite 6, TypeScript, Tailwind CSS v4, shadcn/ui (Radix primitives), React Router v7, Recharts, date-fns, react-hook-form, Lucide icons

**Deployment:** Vercel (configured in `vercel.json` with SPA rewrites)

### 3.2. Backend Services

#### 3.2.1. Auth Service

**Name:** SchoolOS Auth (`routes/auth.js` + `services/authService.js`)

**Description:** Handles school user authentication via email/password + subdomain. Issues JWTs stored in httpOnly cookies. Provides `/login`, `/logout`, and `/me` endpoints. Uses Zod for input validation.

**Technologies:** Express 5, jsonwebtoken, bcryptjs, Zod

**Known issues:**
- No rate limiting (superAdmin has Redis-backed rate limiting)
- No MFA (superAdmin has TOTP)
- `ensureMatchingTenant` is a no-op — JWT stores `schoolId` but the check reads `decoded.tenantId`

#### 3.2.2. Super Admin Service

**Name:** SchoolOS Super Admin (`routes/superAdmin.js`)

**Description:** Platform-level administration. Manages all schools (suspend/reactivate), views platform-wide metrics, and has its own auth system with MFA (TOTP) and Redis-backed rate limiting.

**Technologies:** Express 5, jsonwebtoken, speakeasy (TOTP), qrcode, bcryptjs

**Known issues:**
- Reads school data from `tenants` table while provisioning writes to `schools`
- JWT expiry hardcoded to `'1d'` (school auth is env-configurable)

#### 3.2.3. School CRUD Service

**Name:** SchoolOS School Routes (`routes/school.js` + `services/schoolService.js`)

**Description:** Handles all tenant-scoped CRUD operations: students, teachers, classes, attendance, fees, books, library, timetable, payroll, notifications. Every route is protected by the `protect` middleware (JWT verification) and scoped to `req.tenant.id`.

**Technologies:** Express 5, Supabase, Zod

**Known issues:**
- `protect` middleware reads `schoolos_tenant_token` but auth sets `schoolos_token` — all routes return 401
- ~15 service methods follow an identical pattern (should use a CRUD factory)
- ~20 route handlers follow an identical pattern (should use a route factory)

#### 3.2.4. Onboarding Service

**Name:** SchoolOS Onboard (`routes/onboard.js`)

**Description:** Public-facing signup flow. Provisions new schools via `provisionService.js`, checks subdomain availability, handles demo requests, serves plan catalog.

**Technologies:** Express 5, Supabase

**Known issues:**
- `generateSubdomain` declared twice in `provisionService.js` — SyntaxError, file won't load
- Subdomain check queries `tenants` table, but provisioning writes to `schools` table

#### 3.2.5. Notification Services (3 parallel implementations)

**Name:** Email Service, SMS Service, WhatsApp Service

**Description:** Three independent services, each with the same 5 export signatures: `sendWelcome`, `sendTrialReminder`, `sendPaymentReceipt`, `sendPaymentFailed`, `sendFeeReminder`. Each wraps its provider (Mailgun, Arkesel, Twilio) with exponential backoff via `notificationUtils.js`.

**Technologies:** axios, notificationUtils.js

**Known issues:**
- Duplicated function signatures and near-identical message templates across all three
- Should be consolidated with a notification dispatcher

---

## 4. Data Stores

### 4.1. Primary Database

**Name:** SchoolOS Supabase (PostgreSQL)

**Type:** PostgreSQL 15 (via Supabase)

**Purpose:** Stores all application data: schools, users, students, fees, exams, attendance, etc.

**Key Tables:**
| Table | Purpose | Notes |
|-------|---------|-------|
| `schools` | Tenant/school records | Used by provisioning + auth service |
| `tenants` | Tenant/school records | Used by tenant middleware + super admin — **may be same as `schools` or duplicate** |
| `users` | All user accounts (admins, teachers, etc.) | Has `school_id` FK |
| `students` | Student records | Scoped by `tenant_id` |
| `fees` | Fee configurations + payments | Scoped by `tenant_id` |
| `attendance` | Daily attendance records | |
| `classes` | Class/section definitions | |
| `teachers` | Teacher profiles | |
| `exams` | Exam definitions | |
| `results` | Exam results | |
| `books` | Library catalog | |
| `library_issues` | Book checkout records | |
| `timetable` | Class schedule | |
| `payroll` | Salary/payment records | |
| `notifications` | Sent notification log | |
| `demo_leads` | Landing page demo requests | |
| `roles` | Role definitions | Used by RBAC |
| `role_permissions` | Role-permission mappings | |
| `permissions` | Permission definitions | |

**Critical issue:** `schools` and `tenants` tables appear to hold the same entity type (a school = a tenant). The codebase is split — some parts read/write `schools`, others read/write `tenants`. This must be consolidated before the system can function correctly.

### 4.2. Cache / Queue

**Name:** Redis

**Type:** Redis (via ioredis)

**Purpose:**
- BullMQ job queue (trial expiry reminders)
- Tenant cache (subdomain → tenant data)
- Super admin rate limiting (login attempts)
- Super admin MFA session storage

**Current status: ⚠️ BROKEN — never connects**

`config/redis.js` has `lazyConnect: true` and `retryStrategy: () => null`, with no `redis.connect()` call anywhere. All Redis features silently fall back to in-memory maps (`MEMORY_CACHE` in superAdmin.js), which are lost on server restart.

---

## 5. External Integrations / APIs

| Service | Purpose | Integration Method | Configured Via |
|---------|---------|-------------------|----------------|
| **Supabase** | Database + Auth admin API | `@supabase/supabase-js` SDK | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` |
| **Paystack** | Payment processing (fee collection) | REST API + inline.js checkout | `PAYSTACK_SECRET_KEY` |
| **Stripe** | Payment processing (billing) | Raw webhooks | `STRIPE_SECRET_KEY` |
| **Mailgun** | Email delivery | REST API via axios | `MAILGUN_API_KEY`, `MAILGUN_DOMAIN` |
| **Twilio** | WhatsApp messaging | REST API via axios | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` |
| **Arkesel** | SMS delivery | REST API via axios | `ARKESEL_API_KEY` |

**Note:** The frontend also uses Paystack's inline.js checkout for fee payment (in `SmartFeeReminders.tsx`). Verification is done via the frontend's `server/paystack-api.mjs` proxy, bypassing the central `api.ts` service layer.

---

## 6. Deployment & Infrastructure

### Current Setup

| Component | Platform | Config |
|-----------|----------|--------|
| **Backend API** | Railway | `railway.toml` — Nixpacks builder, start command `node server.js`, health check at `/health` |
| **Frontend** | Vercel | `vercel.json` — SPA rewrites (all routes → `/`) |

### Environment

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (bypasses RLS) |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | School auth token expiry (default `7d`) |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) |
| `TENANT_BASE_URL` | Base URL for tenant subdomains (e.g., `localhost:3000`) |
| `REDIS_URL` | Redis connection string |
| `PAYSTACK_SECRET_KEY` | Paystack API secret |
| `SUPER_ADMIN_EMAIL` | Super admin login email |
| `SUPER_ADMIN_PASSWORD` | Super admin login password |
| `MAILGUN_API_KEY` / `MAILGUN_DOMAIN` | Email delivery |
| `ARKESEL_API_KEY` | SMS delivery |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM` | WhatsApp delivery |
| `FEE_REMINDER_CHANNEL_ORDER` | Default: `whatsapp,sms,email` |

### CI/CD

- **No CI/CD pipeline configured** in the repository. No `.github/workflows/` files exist for the SchoolOS application (the existing `publish.yml` belongs to the bundled `antigravity-claude-proxy` tool).

---

## 7. Security Considerations

### Authentication

- **School users:** Email + password + subdomain. JWT stored in httpOnly cookie (`schoolos_token`). Zod validates input.
- **Super admin:** Email + password + rate limiting + TOTP MFA + backup codes. JWT stored in httpOnly cookie (`schoolos_admin_token`).

### Authorization (RBAC)

- `routes/school.js` has `allowRoles(...roles)` middleware and a `requireModule(mod)` middleware for feature gating
- `middleware/rbac.js` exists but is **never imported** — it exports `requirePermission` but nobody calls it
- The JWT payload includes a `permissions` array, but the frontend does not currently enforce role-based route access

**Known authorization gaps:**

| Gap | Details |
|-----|---------|
| `ensureMatchingTenant` is a no-op | JWT stores `schoolId` but checks read `decoded.tenantId` — always undefined |
| `rbac.js` is dead code | Exported but never imported |
| No frontend route guards | All dashboard routes are accessible after login regardless of role |
| Module gating is incomplete | `requireModule` exists but only applied to some routes |

### Data Protection

- **Passwords:** bcryptjs with 12 rounds
- **In transit:** TLS (assumed via Railway/Vercel)
- **Cookies:** httpOnly + sameSite: lax + secure in production
- **Supabase:** Uses service_role key (bypasses RLS) — all access control is application-level

---

## 8. Development & Testing Environment

### Local Setup

```bash
git clone <repo>
cp .env.example .env          # Fill in Supabase credentials
npm install                   # Install backend dependencies
cd schoolos-frontend && npm install && cd ..
npm start                     # Starts backend on port 5000
```

In a second terminal:
```bash
cd schoolos-frontend
npm run dev                   # Starts Vite dev server on port 5173
```

### Testing

| Test Suite | Command | Framework |
|-----------|---------|-----------|
| Smoke tests | `npm test` (runs smoke-test.js first) | Custom |
| API integration | `npm test` (then api-tests.js) | `node:test` + `node:assert` |
| Super admin load | `npm run test:superadmin` | Custom |
| Fee reminders | `npm run test:fees` | Custom |

### Test Architecture

`scripts/api-tests.js` (525 lines) implements a full in-memory mock database (`db` object with `tenants`, `users`, `students`, `fees`, `attendance`, `demo_leads` arrays) with a fake Supabase client. Tests cover:
- Onboarding (signup, subdomain check, demo request)
- Auth (login, /me, logout)
- School CRUD (students, fees, attendance)
- Super admin (login with MFA, dashboard, school management)

**Known test issues:**
- The in-memory mock has `tenants` array but the real code sometimes queries `schools` — the mock may not match reality
- Tests require `node:test` (Node 18+)
- No frontend tests exist (one file `AuthFlows.test.js` but it's empty/skeleton)

---

## 9. Critical Architecture Issues & Cleanup Roadmap

### P0 — Critical (app won't work without these)

| # | Issue | Files | Fix |
|---|-------|-------|-----|
| 1 | `generateSubdomain` declared twice — SyntaxError | `services/provisionService.js:101-103` | Delete first declaration |
| 2 | Cookie name mismatch: `schoolos_token` vs `schoolos_tenant_token` | `routes/auth.js:73`, `routes/school.js:30` | Align cookie name |
| 3 | `req.school` vs `req.tenant` | `routes/auth.js:42,118`, `middleware/tenant.js:87` | Change `req.school` → `req.tenant` |
| 4 | `ensureMatchingTenant` no-op (checks `tenantId`, JWT has `schoolId`) | `routes/auth.js:12`, `routes/school.js:21`, `routes/auth.js:65` | Add `tenantId` to JWT or fix checks |
| 5 | `schools` vs `tenants` table split | `provisionService.js`, `authService.js`, `tenant.js`, `onboard.js`, `superAdmin.js` | Consolidate to one table |
| 6 | Redis never connects | `config/redis.js` | Fix connection config |

### P1 — High

| # | Issue | Fix |
|---|-------|-----|
| 7 | Duplicate `/plans` route | Delete `routes/billing.js` |
| 8 | Color constants in 8 files | Extract to `frontend/src/styles/colors.ts` |
| 9 | Dead files: `audit.js`, `rbac.js`, `ImageWithFallback.tsx` | Delete |
| 10 | `parseInteger` duplicated | Extract to shared utility |
| 11 | Auth cookie helpers duplicated | Extract to `authCookies.js` |
| 12 | Missing barrel exports | Add `examService`, `feeReminderService` to `services/index.js` |
| 13 | Empty `frontend/src/config/` | Delete |

### P2 — Medium

| # | Issue | Fix |
|---|-------|-----|
| 14 | SchoolService CRUD duplication (~15 methods) | Create `crudFactory()` |
| 15 | School route handler duplication (~20 handlers) | Create `createResourceRoute()` factory |
| 16 | Notification templates duplicated (3 services) | Create `notificationDispatcher.js` |
| 17 | Inline UI patterns (cards, tabs, tables, modals) | Create shared `MetricCard`, `TabBar`, `SearchBar`, `StatusBadge` components |

### P3 — Low

| # | Issue | Fix |
|---|-------|-----|
| 18 | Inline `PLUM`/`MILK` hex values in pages | Migrate to `theme.css` CSS variables |
| 19 | Custom `<table>` HTML in pages | Use `@/components/ui/table.tsx` |
| 20 | SuperAdmin login lacks Zod validation | Add validation middleware |
| 21 | School login lacks rate limiting | Add rate limiting (mirror superAdmin) |
| 22 | SuperAdmin JWT expiry hardcoded | Make env-configurable |
| 23 | `antigravity-claude-proxy/` bundled | Move to own repo |
| 24 | `SmartFeeReminders.tsx` raw `fetch()` bypasses `api.ts` | Route through API service |

---

## 10. Project Identification

**Project Name:** SchoolOS — Multi-Tenant School Management SaaS

**Repository URL:** `https://github.com/<org>/schoolos` (not yet public)

**Primary Contact/Team:** SchoolOS Development Team

**Date of Last Update:** 2026-05-12

---

## 11. Glossary / Acronyms

| Term | Definition |
|------|-----------|
| **Tenant** | A school organization in the multi-tenant system. Synonymous with "school" in this codebase (though naming is inconsistent). |
| **Tenant middleware** | Express middleware that resolves the current school from the request subdomain and attaches `req.tenant`. |
| **shadcn/ui** | A collection of React components built on Radix UI primitives and styled with Tailwind CSS. Not an npm package — components are copied into the project. |
| **RBAC** | Role-Based Access Control. The backend has `allowRoles()` middleware but the frontend does not enforce roles. |
| **TOTP** | Time-based One-Time Password. Used for super admin MFA via the `speakeasy` library. |
| **BullMQ** | Redis-backed job queue for scheduled tasks (trial expiry reminders). |
| **Subdomain** | Each school gets a unique subdomain (e.g., `myschool.schoolos.io`). Resolved by the tenant middleware. |
| **`protect` middleware** | JWT verification middleware in `routes/school.js`. Currently broken — reads wrong cookie name. |
| **`schoolId` / `tenantId`** | Two names for the same concept (school identifier) used inconsistently across the codebase. JWT uses `schoolId`, middleware checks use `tenantId`. |
| **`schoolos_token` / `schoolos_tenant_token` / `schoolos_admin_token`** | Three cookie names. `schoolos_token` is set by auth, `schoolos_tenant_token` is read by school routes (broken), `schoolos_admin_token` is used by super admin. |
