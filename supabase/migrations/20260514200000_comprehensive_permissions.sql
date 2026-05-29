-- 20260514200000_comprehensive_permissions.sql
-- CRUD-based permissions (module.create, module.view, module.edit, module.delete)
BEGIN;

-- ─── 0. ADD COLUMNS ─────────────────────────────────────────
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS action VARCHAR(50);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS description TEXT;

-- ─── 1. DELETE OLD :read/:manage DUPLICATES (if any) ──────
-- This removes the old colon-style permissions so only CRUD remains
DELETE FROM permissions WHERE name LIKE '%:read' OR name LIKE '%:manage'
   OR name LIKE '%:approve' OR name LIKE '%:waive' OR name LIKE '%:export';
DELETE FROM role_permissions WHERE permission_id NOT IN (SELECT id FROM permissions);

-- ─── 2. SEED CRUD PERMISSIONS ──────────────────────────────
INSERT INTO permissions (name, module, action, description) VALUES
  -- Dashboard
  ('dashboard.view', 'dashboard', 'view', 'View dashboard'),
  -- Students
  ('students.create', 'students', 'create', 'Create students'),
  ('students.view', 'students', 'view', 'View students'),
  ('students.edit', 'students', 'edit', 'Edit students'),
  ('students.delete', 'students', 'delete', 'Delete students'),
  -- Teachers
  ('teachers.create', 'teachers', 'create', 'Create teachers'),
  ('teachers.view', 'teachers', 'view', 'View teachers'),
  ('teachers.edit', 'teachers', 'edit', 'Edit teachers'),
  ('teachers.delete', 'teachers', 'delete', 'Delete teachers'),
  -- Classes
  ('classes.create', 'classes', 'create', 'Create classes'),
  ('classes.view', 'classes', 'view', 'View classes'),
  ('classes.edit', 'classes', 'edit', 'Edit classes'),
  ('classes.delete', 'classes', 'delete', 'Delete classes'),
  -- Subjects
  ('subjects.create', 'subjects', 'create', 'Create subjects'),
  ('subjects.view', 'subjects', 'view', 'View subjects'),
  ('subjects.edit', 'subjects', 'edit', 'Edit subjects'),
  ('subjects.delete', 'subjects', 'delete', 'Delete subjects'),
  -- Timetable
  ('timetable.create', 'timetable', 'create', 'Create timetable entries'),
  ('timetable.view', 'timetable', 'view', 'View timetable'),
  ('timetable.edit', 'timetable', 'edit', 'Edit timetable entries'),
  ('timetable.delete', 'timetable', 'delete', 'Delete timetable entries'),
  -- Attendance
  ('attendance.create', 'attendance', 'create', 'Record attendance'),
  ('attendance.view', 'attendance', 'view', 'View attendance'),
  ('attendance.edit', 'attendance', 'edit', 'Edit attendance records'),
  ('attendance.delete', 'attendance', 'delete', 'Delete attendance records'),
  -- Grades
  ('grades.create', 'grades', 'create', 'Create grades/enter results'),
  ('grades.view', 'grades', 'view', 'View grades'),
  ('grades.edit', 'grades', 'edit', 'Edit grades'),
  ('grades.delete', 'grades', 'delete', 'Delete grades'),
  -- Fees
  ('fees.create', 'fees', 'create', 'Create fee structures'),
  ('fees.view', 'fees', 'view', 'View fees'),
  ('fees.edit', 'fees', 'edit', 'Edit fees'),
  ('fees.delete', 'fees', 'delete', 'Delete fees'),
  -- Payments
  ('payments.create', 'payments', 'create', 'Record payments'),
  ('payments.view', 'payments', 'view', 'View payments'),
  ('payments.edit', 'payments', 'edit', 'Edit payments'),
  ('payments.delete', 'payments', 'delete', 'Delete payments'),
  -- Invoices
  ('invoices.create', 'invoices', 'create', 'Create invoices'),
  ('invoices.view', 'invoices', 'view', 'View invoices'),
  ('invoices.edit', 'invoices', 'edit', 'Edit invoices'),
  ('invoices.delete', 'invoices', 'delete', 'Delete invoices'),
  -- Messages
  ('messages.create', 'messages', 'create', 'Send messages'),
  ('messages.view', 'messages', 'view', 'View messages'),
  ('messages.edit', 'messages', 'edit', 'Edit messages'),
  ('messages.delete', 'messages', 'delete', 'Delete messages'),
  -- Announcements
  ('announcements.create', 'announcements', 'create', 'Create announcements'),
  ('announcements.view', 'announcements', 'view', 'View announcements'),
  ('announcements.edit', 'announcements', 'edit', 'Edit announcements'),
  ('announcements.delete', 'announcements', 'delete', 'Delete announcements'),
  -- Notifications
  ('notifications.create', 'notifications', 'create', 'Send notifications'),
  ('notifications.view', 'notifications', 'view', 'View notifications'),
  ('notifications.edit', 'notifications', 'edit', 'Edit notifications'),
  ('notifications.delete', 'notifications', 'delete', 'Delete notifications'),
  -- Reports
  ('reports.create', 'reports', 'create', 'Generate reports'),
  ('reports.view', 'reports', 'view', 'View reports'),
  ('reports.edit', 'reports', 'edit', 'Edit reports'),
  ('reports.delete', 'reports', 'delete', 'Delete reports'),
  -- Users
  ('users.create', 'users', 'create', 'Create users'),
  ('users.view', 'users', 'view', 'View users'),
  ('users.edit', 'users', 'edit', 'Edit users'),
  ('users.delete', 'users', 'delete', 'Delete users'),
  -- Roles & Permissions
  ('roles.create', 'roles', 'create', 'Create roles'),
  ('roles.view', 'roles', 'view', 'View roles'),
  ('roles.edit', 'roles', 'edit', 'Edit roles'),
  ('roles.delete', 'roles', 'delete', 'Delete roles'),
  ('permissions.create', 'permissions', 'create', 'Create permissions'),
  ('permissions.view', 'permissions', 'view', 'View permissions'),
  ('permissions.edit', 'permissions', 'edit', 'Edit permissions'),
  ('permissions.delete', 'permissions', 'delete', 'Delete permissions'),
  -- Schools (platform)
  ('schools.create', 'schools', 'create', 'Create schools'),
  ('schools.view', 'schools', 'view', 'View schools'),
  ('schools.edit', 'schools', 'edit', 'Edit schools'),
  ('schools.delete', 'schools', 'delete', 'Delete schools'),
  -- Audit Logs (platform)
  ('audit_logs.view', 'audit_logs', 'view', 'View audit logs'),
  -- Settings
  ('settings.view', 'settings', 'view', 'View settings'),
  ('settings.edit', 'settings', 'edit', 'Edit settings'),
  -- Webhooks (platform)
  ('webhooks.create', 'webhooks', 'create', 'Create webhooks'),
  ('webhooks.view', 'webhooks', 'view', 'View webhooks'),
  ('webhooks.edit', 'webhooks', 'edit', 'Edit webhooks'),
  ('webhooks.delete', 'webhooks', 'delete', 'Delete webhooks'),
  -- Badges (gamification)
  ('badges.create', 'badges', 'create', 'Create badges'),
  ('badges.view', 'badges', 'view', 'View badges'),
  ('badges.edit', 'badges', 'edit', 'Edit badges'),
  ('badges.delete', 'badges', 'delete', 'Delete badges'),
  -- Plans (platform)
  ('plans.view', 'plans', 'view', 'View plans'),
  ('plans.edit', 'plans', 'edit', 'Edit plans')
ON CONFLICT (name) DO NOTHING;

-- ─── 3. SEED ROLES ──────────────────────────────────────────
INSERT INTO roles (name, label, description) VALUES
  ('superadmin', 'Superadmin', 'Platform owner and global administrator'),
  ('school_admin', 'School Admin', 'Manages a single school'),
  ('headmaster', 'Headmaster', 'Academic oversight'),
  ('accountant', 'Accountant', 'Finance and billing'),
  ('teacher', 'Teacher', 'Teaching and class management'),
  ('student', 'Student', 'Student portal access'),
  ('parent', 'Parent', 'Parent portal access')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- ─── 4. MAP PERMISSIONS TO ROLES ────────────────────────────

-- Superadmin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON true
WHERE r.name = 'superadmin'
ON CONFLICT DO NOTHING;

-- School Admin: full CRUD on school modules
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.name IN (
    'dashboard.view',
    'students.create', 'students.view', 'students.edit', 'students.delete',
    'teachers.create', 'teachers.view', 'teachers.edit', 'teachers.delete',
    'classes.create', 'classes.view', 'classes.edit', 'classes.delete',
    'subjects.create', 'subjects.view', 'subjects.edit', 'subjects.delete',
    'timetable.create', 'timetable.view', 'timetable.edit', 'timetable.delete',
    'attendance.create', 'attendance.view', 'attendance.edit', 'attendance.delete',
    'grades.create', 'grades.view', 'grades.edit', 'grades.delete',
    'fees.create', 'fees.view', 'fees.edit', 'fees.delete',
    'payments.create', 'payments.view', 'payments.edit', 'payments.delete',
    'invoices.create', 'invoices.view', 'invoices.edit', 'invoices.delete',
    'messages.create', 'messages.view', 'messages.edit', 'messages.delete',
    'announcements.create', 'announcements.view', 'announcements.edit', 'announcements.delete',
    'notifications.create', 'notifications.view', 'notifications.edit', 'notifications.delete',
    'reports.create', 'reports.view', 'reports.edit', 'reports.delete',
    'users.create', 'users.view', 'users.edit', 'users.delete',
    'settings.view', 'settings.edit',
    'roles.view',
    'permissions.view',
    'badges.create', 'badges.view', 'badges.edit', 'badges.delete'
  )
WHERE r.name = 'school_admin'
ON CONFLICT DO NOTHING;

-- Headmaster: read-only + approve on academics
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.name IN (
    'dashboard.view',
    'students.view',
    'teachers.view',
    'classes.view',
    'subjects.view',
    'timetable.view',
    'attendance.view',
    'grades.view',
    'fees.view',
    'payments.view',
    'messages.view',
    'announcements.view',
    'notifications.view',
    'reports.view'
  )
WHERE r.name = 'headmaster'
ON CONFLICT DO NOTHING;

-- Accountant: finance CRUD + read students/reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.name IN (
    'dashboard.view',
    'students.view',
    'fees.create', 'fees.view', 'fees.edit', 'fees.delete',
    'payments.create', 'payments.view', 'payments.edit', 'payments.delete',
    'invoices.create', 'invoices.view', 'invoices.edit', 'invoices.delete',
    'reports.create', 'reports.view'
  )
WHERE r.name = 'accountant'
ON CONFLICT DO NOTHING;

-- Teacher: manage attendance/grades, read everything else academic
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.name IN (
    'dashboard.view',
    'students.view',
    'classes.view',
    'subjects.view',
    'timetable.view',
    'attendance.create', 'attendance.view', 'attendance.edit',
    'grades.create', 'grades.view', 'grades.edit',
    'messages.view', 'messages.create',
    'announcements.view',
    'notifications.view'
  )
WHERE r.name = 'teacher'
ON CONFLICT DO NOTHING;

-- Student: read-only personal data
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.name IN (
    'dashboard.view',
    'timetable.view',
    'attendance.view',
    'grades.view',
    'announcements.view',
    'messages.view'
  )
WHERE r.name = 'student'
ON CONFLICT DO NOTHING;

-- Parent: read-only child-linked data
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.name IN (
    'dashboard.view',
    'students.view',
    'attendance.view',
    'grades.view',
    'fees.view',
    'invoices.view',
    'announcements.view',
    'messages.view'
  )
WHERE r.name = 'parent'
ON CONFLICT DO NOTHING;

-- ─── 5. APPROVALS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  resource VARCHAR(100) NOT NULL,
  resource_id UUID,
  action VARCHAR(100) NOT NULL,
  payload JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approvals_school_status ON approvals(school_id, status);
CREATE INDEX IF NOT EXISTS idx_approvals_requested_by ON approvals(requested_by);

COMMIT;