-- 20260514200000_comprehensive_permissions.sql
-- Full RBAC permissions matrix and approval system
BEGIN;

-- ─── 1. SEED ALL PERMISSIONS ────────────────────────────────
INSERT INTO permissions (name, module) VALUES
  -- Identity
  ('dashboard:read', 'dashboard'),
  ('users:manage', 'users'), ('users:read', 'users'),
  ('roles:manage', 'roles'), ('permissions:manage', 'roles'),
  ('settings:manage', 'settings'),
  -- Academic
  ('students:manage', 'students'), ('students:read', 'students'),
  ('teachers:manage', 'teachers'), ('teachers:read', 'teachers'),
  ('classes:manage', 'classes'), ('classes:read', 'classes'),
  ('subjects:manage', 'subjects'), ('subjects:read', 'subjects'),
  ('timetable:manage', 'timetable'), ('timetable:read', 'timetable'),
  ('attendance:manage', 'attendance'), ('attendance:read', 'attendance'),
  ('grades:manage', 'grades'), ('grades:read', 'grades'),
  ('grades:approve', 'grades'),
  -- Finance
  ('fees:manage', 'fees'), ('fees:read', 'fees'),
  ('fees:waive', 'fees'),
  ('payments:manage', 'payments'), ('payments:read', 'payments'),
  ('invoices:manage', 'invoices'), ('invoices:read', 'invoices'),
  -- Communication
  ('messages:manage', 'messages'), ('messages:read', 'messages'),
  ('announcements:manage', 'announcements'), ('announcements:read', 'announcements'),
  -- Reporting
  ('reports:read', 'reports'), ('reports:export', 'reports'),
  ('audit_logs:read', 'audit_logs'),
  -- Platform (superadmin only)
  ('schools:manage', 'schools'), ('plans:manage', 'plans'),
  ('system:settings', 'system')
ON CONFLICT (name) DO NOTHING;

-- ─── 2. MAP PERMISSIONS TO ROLES ────────────────────────────

-- Superadmin: everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'superadmin'
ON CONFLICT DO NOTHING;

-- School Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'school_admin' AND p.name IN (
  'dashboard:read',
  'users:manage', 'settings:manage',
  'students:manage', 'teachers:manage', 'classes:manage',
  'subjects:manage', 'timetable:manage', 'attendance:manage', 'grades:manage',
  'announcements:manage', 'messages:manage',
  'fees:manage', 'payments:manage', 'invoices:manage',
  'reports:read', 'reports:export'
)
ON CONFLICT DO NOTHING;

-- Headmaster
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'headmaster' AND p.name IN (
  'dashboard:read',
  'students:read', 'teachers:read', 'classes:read',
  'subjects:read', 'timetable:read', 'attendance:read', 'grades:read',
  'grades:approve',
  'announcements:read', 'messages:read',
  'fees:read', 'payments:read',
  'reports:read'
)
ON CONFLICT DO NOTHING;

-- Accountant
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'accountant' AND p.name IN (
  'dashboard:read',
  'students:read',
  'fees:manage', 'payments:manage', 'invoices:manage',
  'reports:read', 'reports:export'
)
ON CONFLICT DO NOTHING;

-- Teacher
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'teacher' AND p.name IN (
  'dashboard:read',
  'classes:read', 'students:read', 'subjects:read', 'timetable:read',
  'attendance:manage', 'grades:manage',
  'announcements:read', 'messages:read'
)
ON CONFLICT DO NOTHING;

-- Student
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'student' AND p.name IN (
  'dashboard:read',
  'timetable:read', 'attendance:read', 'grades:read',
  'announcements:read', 'messages:read'
)
ON CONFLICT DO NOTHING;

-- Parent
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'parent' AND p.name IN (
  'dashboard:read',
  'students:read', 'attendance:read', 'grades:read',
  'fees:read', 'invoices:read',
  'announcements:read', 'messages:read'
)
ON CONFLICT DO NOTHING;

-- ─── 3. APPROVALS TABLE ─────────────────────────────────────
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
