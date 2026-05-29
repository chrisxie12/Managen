# Settings Page Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans to implement this plan task-by-task.

**Goal:** Build complete 8-tab Settings page replacing the old inline `SchoolSettings` component.

**Architecture:** Monolithic backend routes in `routes/school.js` with `PUT` endpoints, 9 new frontend files under `settings/`, DB migration for new columns. Each tab is an independent component with its own save handler.

**Tech Stack:** Express, Supabase, React, shadcn/ui, lucide-react, Tailwind

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260518000001_settings_columns.sql`

- [ ] **Write migration SQL**

```sql
-- 20260518000001_settings_columns.sql
BEGIN;

ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS registration_number text,
ADD COLUMN IF NOT EXISTS payment_methods jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS fee_categories jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS late_fee_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS receipt_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attendance_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS class_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS security_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS billing_plan text DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS billing_status text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS billing_renewal_date date;

-- Users table additions for invite tracking
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS invited_at timestamptz,
ADD COLUMN IF NOT EXISTS invitation_token text,
ADD COLUMN IF NOT EXISTS invitation_expires_at timestamptz;

-- Billing/plan tracking table (if not exists)
CREATE TABLE IF NOT EXISTS public.billing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'paid',
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

-- Session tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  device text,
  browser text,
  ip_address text,
  location text,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Login history
CREATE TABLE IF NOT EXISTS public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  ip_address text,
  device text,
  status text NOT NULL DEFAULT 'success',
  created_at timestamptz DEFAULT now()
);

COMMIT;
```

- [ ] **Commit migration**

```bash
git add supabase/migrations/20260518000001_settings_columns.sql
git commit -m "feat: add settings columns and tracking tables"
```

---

### Task 2: Backend Endpoints

**Files:**
- Modify: `routes/school.js` (append new endpoints before module.exports)

Each endpoint follows existing pattern:
- School isolation: `const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;`
- Response: `res.json({ data: result })` / `res.status(400).json({ error: message })`
- Permission: `protect` middleware, `requirePermission` where applicable

Save handler:
```js
const handleSave = async (req, res, table, fields) => {
  const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
  const updateData = {};
  for (const key of fields) {
    if (req.body[key] !== undefined) updateData[key] = req.body[key];
  }
  const { error } = await supabase.from('schools').update(updateData).eq('id', schoolId);
  if (error) return res.status(500).json({ error: error.message });
  const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
  return res.json({ data: school });
};
```

Endpoints:
- `PUT /api/school/settings/profile` — fields: name, motto, email, phone, address, website, city, region, country, registration_number, year_established, logo_url, primary_color
- `PUT /api/school/settings/academic` — fields: grading_system, academic_year, current_term, term_start_date, term_end_date, pass_mark, attendance_settings, class_settings
- `PUT /api/school/settings/fee` — fields: payment_methods, fee_categories, late_fee_settings, receipt_settings
- `PUT /api/school/settings/notifications` — fields: notification_settings
- `POST /api/school/settings/invite` — create user with invited_by, invited_at, invitation_token
- `GET /api/school/settings/users` — list users for school with pagination
- `PUT /api/school/settings/users/:id` — update user role/status
- `DELETE /api/school/settings/users/:id` — soft-delete user
- `POST /api/school/settings/change-password` — verify + update password
- `GET /api/school/settings/billing` — return school billing info + history
- `POST /api/school/settings/export` — queue async export job
- `POST /api/school/settings/reset-term` — clear term data (attendance, grades)
- `DELETE /api/school/settings/account` — mark school for deletion

- [ ] **Implement all endpoints**

- [ ] **Commit**

```bash
git add routes/school.js
git commit -m "feat: add settings API endpoints"
```

---

### Task 3: SettingsPage Shell

**Files:**
- Create: `schoolos-frontend/src/app/pages/settings/SettingsPage.tsx`
- Create: `schoolos-frontend/src/app/pages/settings/tabs/` directory (via .gitkeep)

The shell provides:
- Left sidebar (280px) with tab list and icons
- Right content panel
- Mobile: dropdown select instead of sidebar
- Unsaved changes warning via `beforeunload` + `useBlocker` (react-router)
- Fetches school profile once, passes data down
- Role-based access control (school_admin sees all, headmaster sees subset, others read-only)

```tsx
import { useState, useEffect, useCallback } from "react";
import { useBlocker } from "react-router";
import {
  Building2, BookOpen, Wallet, Bell, Users, Shield,
  CreditCard, AlertTriangle, Settings as SettingsIcon,
  ChevronDown,
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { SchoolProfileTab } from "./tabs/SchoolProfileTab";
import { AcademicSettingsTab } from "./tabs/AcademicSettingsTab";
import { FeeSettingsTab } from "./tabs/FeeSettingsTab";
import { NotificationSettingsTab } from "./tabs/NotificationSettingsTab";
import { UserManagementTab } from "./tabs/UserManagementTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { BillingTab } from "./tabs/BillingTab";
import { DangerZoneTab } from "./tabs/DangerZoneTab";
```

Tab definitions array with icon, key, label, roles, component.

- [ ] **Write SettingsPage.tsx**
- [ ] **Create tabs directory**

- [ ] **Commit**

```bash
git add schoolos-frontend/src/app/pages/settings/
git commit -m "feat: add SettingsPage shell with tab navigation"
```

---

### Task 4: SchoolProfileTab

**Files:**
- Create: `schoolos-frontend/src/app/pages/settings/tabs/SchoolProfileTab.tsx`

Sections: School Identity, Contact Information, School Branding (logo upload + color picker), Live Preview Card.

Uses `SectionCard` and `FormField` helper components defined inline.

Logo upload: file input → FileReader → base64 → preview.

Color picker: 8 swatch presets + custom `<input type="color">`.

- [ ] **Write SchoolProfileTab.tsx**
- [ ] **Commit**

---

### Task 5: AcademicSettingsTab

**Files:**
- Create: `schoolos-frontend/src/app/pages/settings/tabs/AcademicSettingsTab.tsx`

Sections: Current Term, Grading System (type, pass mark, grade boundaries table), Class Structure, Attendance Settings.

Grade boundaries: editable table with min/max per grade letter.

- [ ] **Write AcademicSettingsTab.tsx**
- [ ] **Commit**

---

### Task 6: FeeSettingsTab

**Files:**
- Create: `schoolos-frontend/src/app/pages/settings/tabs/FeeSettingsTab.tsx`

Sections: Payment Methods (toggles with conditional Paystack/Flutterwave config), Default Fee Categories (editable list), Late Payment Settings, Receipt Settings.

- [ ] **Write FeeSettingsTab.tsx**
- [ ] **Commit**

---

### Task 7: NotificationSettingsTab

**Files:**
- Create: `schoolos-frontend/src/app/pages/settings/tabs/NotificationSettingsTab.tsx`

Sections: Channels (master toggles per channel), Notification Triggers (event×channel table), Reminder Schedule, Test Notification button.

- [ ] **Write NotificationSettingsTab.tsx**
- [ ] **Commit**

---

### Task 8: UserManagementTab

**Files:**
- Create: `schoolos-frontend/src/app/pages/settings/tabs/UserManagementTab.tsx`

Sections: Invite Users (email + role + send), Pending Invitations list, Active Users table (search, filter, pagination, actions), Bulk Actions.

- [ ] **Write UserManagementTab.tsx**
- [ ] **Commit**

---

### Task 9: SecurityTab

**Files:**
- Create: `schoolos-frontend/src/app/pages/settings/tabs/SecurityTab.tsx`

Sections: Change Password (current + new + confirm with strength indicator), Two-Factor Authentication (QR, backup codes), Active Sessions (table with revoke), Login History, Security Alerts toggles.

- [ ] **Write SecurityTab.tsx**
- [ ] **Commit**

---

### Task 10: BillingTab

**Files:**
- Create: `schoolos-frontend/src/app/pages/settings/tabs/BillingTab.tsx`

Sections: Current Plan card, Plan Features comparison table, Payment History, Payment Method on file. Note: "Contact support to upgrade" with mailto.

- [ ] **Write BillingTab.tsx**
- [ ] **Commit**

---

### Task 11: DangerZoneTab

**Files:**
- Create: `schoolos-frontend/src/app/pages/settings/tabs/DangerZoneTab.tsx`

Actions: Export All Data, Reset Current Term Data (type "RESET TERM"), Archive School Year, Delete All Student Data (type "DELETE STUDENTS"), Delete School Account (type school name). Each requires typed confirmation.

- [ ] **Write DangerZoneTab.tsx**
- [ ] **Commit**

---

### Task 12: Update Routes

**Files:**
- Modify: `schoolos-frontend/src/app/routes.tsx`

```tsx
import { SettingsPage } from "./pages/settings/SettingsPage";
// ...
{ path: "settings", Component: SettingsPage },
```

- [ ] **Update routes.tsx import and route**
- [ ] **Commit**

---

### Task 13: TypeScript Check & Build

- [ ] **Run tsc**

```bash
cd schoolos-frontend && npx tsc --noEmit
```

- [ ] **Fix any errors**

- [ ] **Run build**

```bash
cd schoolos-frontend && npx vite build --logLevel error
```

- [ ] **Commit fixes**

```bash
git add -A && git commit -m "fix: TypeScript errors and build"
```

---

### Task 14: Push

- [ ] **Push to origin**

```bash
git push origin main
```
