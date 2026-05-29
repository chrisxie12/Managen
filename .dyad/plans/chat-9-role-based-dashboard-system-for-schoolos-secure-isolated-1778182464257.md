---
title: "Role-Based Dashboard System for SchoolOS (Secure & Isolated)"
summary: "Build a complete 7-role dashboard system with strict data isolation (RLS), dual frontend/backend role checks, persistent Zustand auth, unique widgets per role, and fully protected routes."
chatId: "9"
createdAt: "2026-05-07T19:34:24.257Z"
updatedAt: "2026-05-07T19:34:24.257Z"
---

## Overview
Create a full role‑based dashboard where each of the 7 roles (Super Admin, School Admin, Headmaster, Accountant, Teacher, Parent, Student) has:
- **Completely isolated data** enforced by Supabase Row Level Security (RLS) policies
- **Unique dashboard widgets** — no copy‑pasted layouts
- **Dual role checks** — frontend `RoleGuard` + backend RLS policies
- **Persistent auth state** — Zustand store survives page refresh
- **Fully protected routes** — no role can access another's routes, even by direct URL

---

## UI/UX Design
- **Layout** – Sidebar + header + main content (reuse existing `DashboardLayout` structure)
- **Theme** – Dark mode with purple accent `#7c3aed` (Tailwind `dark` class strategy)
- **Responsive** – Mobile sidebar overlay (already implemented), ensure role‑specific sidebars collapse correctly
- **Modals/Drawers** – shadcn/ui `Dialog` and `Drawer` for forms, with role‑based access
- **Unique Widgets Per Role**:
  - **Super Admin** – Global analytics, school count, user stats, system health
  - **School Admin** – School overview, student/teacher counts, fee collection summary
  - **Headmaster** – Academic performance, attendance trends, staff overview
  - **Accountant** – Revenue charts, outstanding fees, payment history
  - **Teacher** – Class schedule, student grades (only their classes), lesson plans
  - **Parent** – Children's grades, attendance, fee status, announcements
  - **Student** – Own grades, timetable, assignments, announcements

---

## Considerations
- **Data Isolation (CRITICAL)**:
  - Teachers can **NEVER** see another Teacher's data
  - Parents only see **their own children's** data
  - Each role's data access is enforced at the **database level** via RLS policies
  - Frontend `RoleGuard` is a convenience layer only — **never trust frontend alone**
  
- **Role Storage** – Roles are in a custom Supabase `roles` table, linked via `users.role_id`

- **Permission Granularity** – Beyond role‑level, some roles need view‑vs‑edit distinctions (e.g., Teacher can edit only their own classes). Permissions are checked via `role_permissions` table + RLS.

- **Zustand Persistence** – Use `persist` middleware to store `user`, `role`, and `permissions` in `localStorage`. Rehydrate on page load.

- **Route Protection** – Every route under `/dashboard/*` must be wrapped with `RoleGuard`. Direct URL access by wrong role → redirect to `/not-authorized`.

- **Step‑by‑Step Build** – Complete each of the 19 steps fully before moving to the next. No skipping ahead.

---

## Technical Approach

### 1. State Management
- **Zustand** with `persist` middleware:
  ```ts
  // src/store/authStore.ts
  interface AuthState {
    user: User | null;
    role: Role | null;
    isAuthenticated: boolean;
    setUser: (user: User, role: Role) => void;
    clearAuth: () => void;
  }
  ```
- **Zustand** permission store:
  ```ts
  // src/store/permissionStore.ts
  interface PermissionState {
    permissions: string[];
    setPermissions: (perms: string[]) => void;
    hasPermission: (perm: string) => boolean;
  }
  ```

### 2. Data Fetching
- **TanStack Query** hooks for server state
- **Supabase JS client** for auth + database queries (RLS automatically filters based on JWT)

### 3. Security Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Frontend       │     │  Supabase Auth   │     │  Database       │
│  RoleGuard      │────▶│  (JWT contains   │────▶│  RLS Policies   │
│  (convenience)  │     │   role_id)       │     │  (ENFORCE)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### 4. Folder Structure
```
src/
  pages/
    SuperAdmin/
      Dashboard.tsx        # Unique widgets for Super Admin
      Users.tsx
      Schools.tsx
      Settings.tsx
    SchoolAdmin/
      Dashboard.tsx        # Unique widgets for School Admin
      Students.tsx
      Teachers.tsx
      Finance.tsx
      ...
    Headmaster/
      Dashboard.tsx        # Unique widgets for Headmaster
      Academics.tsx
      ...
    Accountant/
      Dashboard.tsx        # Unique widgets for Accountant
      Finance.tsx
      Reports.tsx
      ...
    Teacher/
      Dashboard.tsx        # Unique widgets for Teacher (own classes only)
      Classes.tsx
      Grades.tsx
      ...
    Parent/
      Dashboard.tsx        # Unique widgets for Parent (own children only)
      Children.tsx
      ...
    Student/
      Dashboard.tsx        # Unique widgets for Student (own data only)
      Courses.tsx
      Grades.tsx
      ...
    NotAuthorized.tsx      # 403 page for unauthorized access
  components/
    ui/                    # shadcn/ui primitives (already exists)
    role/
      RoleGuard.tsx        # Protects routes based on role + permission
      RoleSidebar.tsx      # Dynamic sidebar based on role
      DashboardWidget.tsx  # Reusable widget card component
  store/
    authStore.ts           # Zustand auth + role + persistence
    permissionStore.ts     # Zustand permissions
  lib/
    auth.ts                # Supabase auth helpers, session listener
    permissions.ts         # Permission check utilities
    supabase.ts            # Supabase client config
  roleConfig.ts            # Navigation, widgets, permissions per role
```

### 5. RLS Policy Strategy (Backend Enforcement)
Each table needs RLS policies like:
```sql
-- Example: Teachers can only see their own classes
CREATE POLICY "Teachers see own classes" ON classes
  FOR SELECT USING (
    teacher_id = (SELECT id FROM users WHERE auth.uid() = users.id)
    AND EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'teacher'
    )
  );

-- Example: Parents only see their own children
CREATE POLICY "Parents see own children" ON students
  FOR SELECT USING (
    id IN (SELECT student_id FROM parent_student_link WHERE parent_id = auth.uid())
  );
```

---

## Implementation Steps (Complete Each Fully Before Moving On)

### Step 1: Tailwind Dark Mode Config & Purple Accent
- Enable `darkMode: 'class'` in `tailwind.config.js`
- Add custom purple color `#7c3aed` to the theme
- Ensure existing components can adapt to dark mode

### Step 2: Install & Configure Zustand + TanStack Query
- Verify Zustand and `@tanstack/react-query` are in `package.json` (they appear to be missing — need to add)
- Set up `QueryClientProvider` in `src/main.tsx`
- Configure Zustand persist middleware

### Step 3: Create Supabase Client & Auth Helpers
- `src/lib/supabase.ts` — initialize Supabase client with anon key
- `src/lib/auth.ts` — session listener, fetch user + role + school from DB

### Step 4: Build Zustand Auth Store with Persistence
- `src/store/authStore.ts` — user, role, isAuthenticated, persist to localStorage
- Handle rehydration on page load

### Step 5: Build Zustand Permission Store
- `src/store/permissionStore.ts` — permissions array, hasPermission helper
- Persist permissions (they rarely change)

### Step 6: Create Permission Utilities
- `src/lib/permissions.ts` — API call to fetch permissions, client-side helpers

### Step 7: Build RoleGuard Component
- `src/components/role/RoleGuard.tsx`
- Reads required role + permission from route meta or props
- Checks against Zustand stores
- Redirects to `/auth` if unauthenticated, `/not-authorized` if wrong role

### Step 8: Create roleConfig.ts
- Defines navigation items, dashboard widgets, and required permissions for each role
- Used by both sidebar and RoleGuard

### Step 9: Build RoleSidebar Component
- `src/components/role/RoleSidebar.tsx`
- Reads `roleConfig` to render navigation items per role
- Highlights active route

### Step 10: Update DashboardLayout
- Import and use `RoleSidebar` instead of hardcoded nav
- Use role data from Zustand to display user info
- Apply dark theme classes

### Step 11: Refactor Routes with Role Protection
- `src/app/routes.tsx` — add route meta (role, permission)
- Wrap dashboard children with `RoleGuard`
- Add nested routes for each role: `/dashboard/superadmin/*`, etc.

### Step 12: Create NotAuthorized Page
- `src/pages/NotAuthorized.tsx` — simple 403 page with link to home

### Step 13: Scaffold All 7 Role Page Folders
- Create folder structure for each role
- Add placeholder `Dashboard.tsx` with unique widget layout (different for each role)

### Step 14: Build Unique Dashboard Widgets Per Role
- **Super Admin**: GlobalStatsWidget, SchoolListWidget, SystemHealthWidget
- **School Admin**: SchoolOverviewWidget, StudentCountWidget, FeeSummaryWidget
- **Headmaster**: AcademicPerformanceWidget, AttendanceTrendWidget, StaffOverviewWidget
- **Accountant**: RevenueChartWidget, OutstandingFeesWidget, PaymentHistoryWidget
- **Teacher**: ClassScheduleWidget, MyStudentsWidget, LessonPlanWidget
- **Parent**: ChildrenGradesWidget, AttendanceWidget, FeeStatusWidget
- **Student**: MyGradesWidget, TimetableWidget, AssignmentsWidget

### Step 15: Create Reusable DashboardWidget Component
- `src/components/role/DashboardWidget.tsx` — shadcn/ui Card wrapper with consistent styling

### Step 16: Implement TanStack Query Hooks for Role-Specific Data
- `src/hooks/useUsers.ts`, `useStudents.ts`, `useFinances.ts`, etc.
- These hooks will automatically respect RLS policies

### Step 17: Add Supabase RLS Policies (Migration)
- Create new migration: `supabase/migrations/YYYYMMDDHHMMSS_rls_policies.sql`
- Add RLS policies for ALL tables (students, teachers, classes, fees, grades, etc.)
- Ensure each role can only access their allowed data

### Step 18: Test All Roles End-to-End
- Log in as each role
- Verify correct sidebar items appear
- Verify cannot access other roles' routes
- Verify data isolation (Teacher A cannot see Teacher B's classes)
- Test page refresh maintains auth state
- Test dark theme

### Step 19: Final Polish & Documentation
- Add loading states and error boundaries
- Ensure all forms use Dialog/Drawer appropriately
- Update README with role-based dashboard documentation
- Add unit tests for `RoleGuard` and `hasPermission`

---

## Code Changes (Detailed)

### Step 1: Tailwind Dark Mode Config
**File: `schoolos-frontend/tailwind.config.js`**
```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#5b21b6',
        },
        plum: {
          DEFAULT: '#381932',
          light: '#512b4a',
        },
        milk: '#FFF3E6',
      },
    },
  },
  plugins: [],
}
```

### Step 2: Main.tsx Updates
**File: `schoolos-frontend/src/main.tsx`**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './app/App'
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
```

### Step 3: Supabase Client
**File: `schoolos-frontend/src/lib/supabase.ts`** (new)
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 4: Zustand Auth Store
**File: `schoolos-frontend/src/store/authStore.ts`** (new)
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role_id: string
  school_id?: string
}

export interface Role {
  id: string
  name: string
  label: string
}

interface AuthState {
  user: User | null
  role: Role | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User, role: Role) => void
  clearAuth: () => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user, role) => set({ user, role, isAuthenticated: true, isLoading: false }),
      clearAuth: () => set({ user: null, role: null, isAuthenticated: false, isLoading: false }),
      initializeAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            set({ isLoading: false })
            return
          }
          // Fetch user profile + role from DB
          const { data: userData, error } = await supabase
            .from('users')
            .select(`
              id, email, full_name, avatar_url, school_id, role_id,
              roles:role_id (id, name, label)
            `)
            .eq('id', session.user.id)
            .single()
          
          if (error || !userData) {
            set({ isLoading: false })
            return
          }
          
          set({
            user: {
              id: userData.id,
              email: userData.email,
              full_name: userData.full_name,
              avatar_url: userData.avatar_url,
              role_id: userData.role_id,
              school_id: userData.school_id,
            },
            role: userData.roles,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'schoolos-auth',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

### Step 5: RoleGuard Component
**File: `schoolos-frontend/src/components/role/RoleGuard.tsx`** (new)
```tsx
import { Navigate, useLocation } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import { Role } from '../../store/authStore'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[] // role names like 'superadmin', 'teacher'
  requiredPermission?: string
}

export function RoleGuard({ children, allowedRoles, requiredPermission }: RoleGuardProps) {
  const { user, role, isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return <div>Loading...</div> // Replace with proper spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (!role || !allowedRoles.includes(role.name)) {
    return <Navigate to="/not-authorized" replace />
  }

  // Additional permission check if required
  if (requiredPermission) {
    // TODO: Check permission from permissionStore
    // For now, just check role-based access
  }

  return <>{children}</>
}
```

---

## Testing Strategy

### 1. Security Tests (CRITICAL)
- **RLS Policies**: Verify with Supabase SQL editor that:
  - Teacher A cannot SELECT Teacher B's classes
  - Parent can only SELECT their own children
  - Student can only see their own grades
- **Frontend Guards**: Attempt to navigate to `/dashboard/superadmin` as a Student → should redirect

### 2. Unit Tests
- `useAuthStore` — persistence works, rehydration on page load
- `RoleGuard` — redirects correctly for wrong roles
- `hasPermission` — returns correct boolean

### 3. Integration Tests
- Login as each role → verify correct dashboard renders
- Page refresh → auth state persists
- Direct URL access → wrong role redirected

### 4. Manual QA
- Test all 7 roles on desktop and mobile
- Verify dark theme with purple accent
- Check that each dashboard has unique widgets
- Verify modals/drawers work per role permissions

---

**Ready to start Step 1: Tailwind dark mode config and purple accent.**