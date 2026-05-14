-- 20260514200000_comprehensive_permissions.sql
-- Full RBAC permissions matrix with action/description columns and approval system
BEGIN;

-- ─── 0. ADD COLUMNS (safe to re-run) ─────────────────────────
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS action VARCHAR(50);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS description TEXT;

-- ─── 1. SEED ALL PERMISSIONS ────────────────────────────────
INSERT INTO permissions (name, module, action, description) VALUES
  -- Dashboard
  ('dashboard:read', 'dashboard', 'read', 'Read dashboard overview'),
  -- Platform (superadmin only)
  ('schools:manage', 'schools', 'manage', 'Manage schools'),
  ('users:manage', 'users', 'manage', 'Manage users'),
  ('roles:manage', 'roles', 'manage', 'Manage roles'),
  ('permissions:manage', 'permissions', 'manage', 'Manage permissions'),
  ('plans:manage', 'plans', 'manage', 'Manage plans'),
  ('settings:manage', 'settings', 'manage', 'Manage settings'),
  ('audit_logs:read', 'audit_logs', 'read', 'Read audit logs'),
  -- Academic
  ('students:read', 'students', 'read', 'Read students'),
  ('students:manage', 'students', 'manage', 'Manage students'),
  ('teachers:read', 'teachers', 'read', 'Read teachers'),
  ('teachers:manage', 'teachers', 'manage', 'Manage teachers'),
  ('classes:read', 'classes', 'read', 'Read classes'),
  ('classes:manage', 'classes', 'manage', 'Manage classes'),
  ('subjects:read', 'subjects', 'read', 'Read subjects'),
  ('subjects:manage', 'subjects', 'manage', 'Manage subjects'),
  ('timetable:read', 'timetable', 'read', 'Read timetable'),
  ('timetable:manage', 'timetable', 'manage', 'Manage timetable'),
  ('attendance:read', 'attendance', 'read', 'Read attendance'),
  ('attendance:manage', 'attendance', 'manage', 'Manage attendance'),
  ('grades:read', 'grades', 'read', 'Read grades'),
  ('grades:manage', 'grades', 'manage', 'Manage grades'),
  ('grades:approve', 'grades', 'approve', 'Approve grades'),
  -- Finance
  ('fees:read', 'fees', 'read', 'Read fees'),
  ('fees:manage', 'fees', 'manage', 'Manage fees'),
  ('fees:waive', 'fees', 'approve', 'Waive fees'),
  ('payments:read', 'payments', 'read', 'Read payments'),
  ('payments:manage', 'payments', 'manage', 'Manage payments'),
  ('invoices:read', 'invoices', 'read', 'Read invoices'),
  ('invoices:manage', 'invoices', 'manage', 'Manage invoices'),
  -- Communication
  ('messages:read', 'messages', 'read', 'Read messages'),
  ('messages:manage', 'messages', 'manage', 'Manage messages'),
  ('announcements:read', 'announcements', 'read', 'Read announcements'),
  ('announcements:manage', 'announcements', 'manage', 'Manage announcements'),
  -- Reporting
  ('reports:read', 'reports', 'read', 'Read reports'),
  ('reports:export', 'reports', 'export', 'Export reports')
ON CONFLICT (name) DO NOTHING;

-- ─── 2. SEED ROLES ──────────────────────────────────────────
INSERT INTO roles (name, label, description) VALUES
  ('superadmin', 'Superadmin', 'Platform owner and global administrator'),
  ('school_admin', 'School Admin', 'Manages a single school'),
  ('headmaster', 'Headmaster', 'Academic oversight'),
  ('accountant', 'Accountant', 'Finance and billing'),
  ('teacher', 'Teacher', 'Teaching and class management'),
  ('student', 'Student', 'Student portal access'),
  ('parent', 'Parent', 'Parent portal access')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- ─── 3. MAP PERMISSIONS TO ROLES ────────────────────────────

-- Superadmin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON true
WHERE r.name = 'superadmin'
ON CONFLICT DO NOTHING;

-- School Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'dashboard:read',
  'users:manage', 'settings:manage',
  'students:read', 'students:manage',
  'teachers:read', 'teachers:manage',
  'classes:read', 'classes:manage',
  'subjects:read', 'subjects:manage',
  'timetable:read', 'timetable:manage',
  'attendance:read', 'attendance:manage',
  'grades:read', 'grades:manage', 'grades:approve',
  'fees:read', 'fees:manage', 'fees:waive',
  'payments:read', 'payments:manage',
  'invoices:read', 'invoices:manage',
  'announcements:read', 'announcements:manage',
  'messages:read', 'messages:manage',
  'reports:read', 'reports:export'
)
WHERE r.name = 'school_admin'
ON CONFLICT DO NOTHING;

-- Headmaster
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'dashboard:read',
  'students:read', 'teachers:read', 'classes:read',
  'subjects:read', 'timetable:read', 'attendance:read',
  'grades:read', 'grades:approve',
  'fees:read', 'payments:read',
  'announcements:read', 'messages:read',
  'reports:read'
)
WHERE r.name = 'headmaster'
ON CONFLICT DO NOTHING;

-- Accountant
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'dashboard:read',
  'students:read',
  'fees:read', 'fees:manage',
  'payments:read', 'payments:manage',
  'invoices:read', 'invoices:manage',
  'reports:read', 'reports:export'
)
WHERE r.name = 'accountant'
ON CONFLICT DO NOTHING;

-- Teacher
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'dashboard:read',
  'classes:read', 'students:read', 'subjects:read', 'timetable:read',
  'attendance:read', 'attendance:manage',
  'grades:read', 'grades:manage',
  'announcements:read', 'messages:read'
)
WHERE r.name = 'teacher'
ON CONFLICT DO NOTHING;

-- Student
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'dashboard:read',
  'timetable:read', 'attendance:read', 'grades:read',
  'announcements:read', 'messages:read'
)
WHERE r.name = 'student'
ON CONFLICT DO NOTHING;

-- Parent
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN (
  'dashboard:read',
  'students:read', 'attendance:read', 'grades:read',
  'fees:read', 'invoices:read',
  'announcements:read', 'messages:read'
)
WHERE r.name = 'parent'
ON CONFLICT DO NOTHING;

-- ─── 4. APPROVALS TABLE ─────────────────────────────────────
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
