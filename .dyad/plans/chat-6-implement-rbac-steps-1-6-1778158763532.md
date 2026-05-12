---
title: "Implement RBAC Steps 1-6"
summary: "Create roles seed migration, extend RBAC middleware, add event service functions, RoleGuard component, and skeleton dashboards."
chatId: "6"
createdAt: "2026-05-07T12:59:23.532Z"
updatedAt: "2026-05-07T12:59:23.532Z"
---

## Overview
Add missing RBAC pieces: seed roles, headmaster permission set, event service functions, role‑guard component, and parent/student dashboard pages.

## Implementation Steps
1. **supabase/migrations/20260508000000_roles_seed.sql** – upsert the 7 required roles and delete any others.
2. **middleware/rbac.js** – add `requireHeadmaster` middleware with academics‑only permissions; keep existing `requirePermission` for full admin.
3. **services/eventService.js** – implement four async functions that emit realtime events via Supabase client, ensuring `school_id` is included.
4. **src/app/components/RoleGuard.tsx** – component that reads the current user role from `useAuth()`, checks `allowedRoles`, and redirects to `/auth` with a toast if unauthorized.
5. **src/app/pages/ParentDashboard.jsx** – skeleton page using existing shadcn/ui components (Card, Table) to display attendance, fees, and results.
6. **src/app/pages/StudentDashboard.jsx** – skeleton page showing timetable, results, and assignments.

After each file creation, run `npm run type-check` to ensure no TypeScript errors.

## Testing Strategy
- Verify migration runs and leaves exactly 7 rows in `roles`.
- Unit‑test `requireHeadmaster` and `RoleGuard`.
- Manual UI check for new dashboards.
