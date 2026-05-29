# Settings Page — School Admin Dashboard

## Overview

Replace the existing inline-tabbed `SchoolSettings` page with a dedicated 8-tab Settings page. Each tab is a separate component, with a left sidebar for tab navigation and a right content area. The existing `Settings.tsx` is replaced by a new `settings/SettingsPage.tsx` that imports tab components from `settings/tabs/`.

## Tabs

1. **School Profile** — identity, contact, branding (logo + color), live preview card
2. **Academic Settings** — current term, grading system, class structure, attendance
3. **Fee Settings** — payment methods, Paystack/Flutterwave config, fee categories, late payment, receipts
4. **Notification Settings** — channel toggles, event×channel trigger matrix, reminder schedule, test
5. **User Management** — invite, active users table with role/status, bulk actions
6. **Security** — change password, 2FA, active sessions, login history, alerts
7. **Billing** — plan card, feature comparison, payment history, contact to upgrade
8. **Danger Zone** — export, reset term, archive year, delete data, delete account

## Access Control

| Tab | Admin | Headmaster | Others |
|-----|-------|------------|--------|
| All tabs | view + edit | — | — |
| School Profile, Academic Settings | — | view + edit | — |
| School Profile only | — | — | read-only |

## Layout

- Left sidebar: 280px, tab names with icons, active state highlighted
- Right content: fills remaining width
- Mobile: tabs collapse to dropdown `<select>`
- Each tab has its own Save button
- "Unsaved changes" warning on navigation away

## Backend Endpoints

All added to `routes/school.js` with `protect` middleware:
- `PUT /api/school/settings/profile`
- `PUT /api/school/settings/academic`
- `PUT /api/school/settings/fee`
- `PUT /api/school/settings/notifications`
- `POST /api/school/settings/invite`
- `GET /api/school/settings/users`
- `PUT /api/school/settings/users/:id`
- `DELETE /api/school/settings/users/:id`
- `POST /api/school/auth/change-password`
- `GET /api/school/settings/billing`
- `POST /api/school/settings/export`
- `POST /api/school/settings/reset-term`
- `DELETE /api/school/settings/account`

## Database Additions

New columns on `schools` table:
- `registration_number text`
- `website text`
- `payment_methods jsonb DEFAULT '[]'`
- `fee_categories jsonb DEFAULT '[]'`
- `late_fee_settings jsonb DEFAULT '{}'`
- `receipt_settings jsonb DEFAULT '{}'`
- `notification_settings jsonb DEFAULT '{}'`
- `attendance_settings jsonb DEFAULT '{}'`
- `class_settings jsonb DEFAULT '{}'`
- `security_settings jsonb DEFAULT '{}'`
- `billing_plan text DEFAULT 'starter'`
- `billing_status text DEFAULT 'trial'`
- `billing_renewal_date date`

Also: `users` settings columns for invited users tracking, active sessions, login history.

## Frontend Files

```
schoolos-frontend/src/app/pages/settings/
  SettingsPage.tsx          — Main page with tab sidebar + content
  tabs/
    SchoolProfileTab.tsx    — Tab 1
    AcademicSettingsTab.tsx — Tab 2
    FeeSettingsTab.tsx      — Tab 3
    NotificationSettingsTab.tsx — Tab 4
    UserManagementTab.tsx   — Tab 5
    SecurityTab.tsx         — Tab 6
    BillingTab.tsx          — Tab 7
    DangerZoneTab.tsx       — Tab 8
```

## Route Changes

- `routes.tsx` line 122: `Component: SchoolSettings` → `Component: SettingsPage`
- `routes.tsx` add import: `SettingsPage` from `./pages/settings/SettingsPage`

## Dashboard Sidebar

Already has a `Settings` link in the Support section at `/dashboard/settings` (currently points to old page).

## Styling

Matches dashboard design system:
- Colors: PLUM `#381932`, PLUM_LIGHT `#512b4a`, MILK `#FFF3E6`, MUTED `#7D6077`
- Components from: `shadcn/ui` (button, input, textarea, select, table, badge, dialog, tabs)
- Icons from `lucide-react`
- API calls via `api` from `../../services/api`
