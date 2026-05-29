-- 20260507111200_rbac_system.sql
-- RBAC Implementation & Schema Consolidation

BEGIN;

-- 1. RENAME CORE TABLES & COLUMNS
-- Rename 'tenants' to 'schools' if it exists (using a block to handle existence safely)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenants') THEN
        ALTER TABLE tenants RENAME TO schools;
    END IF;
END $$;

-- Standardize columns in 'schools'
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'school_name') THEN
        ALTER TABLE schools RENAME COLUMN school_name TO name;
    END IF;
END $$;

-- Update schools table structure to match spec if needed
ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'trial';

-- Move 'plan' to 'subscription_plan' if 'plan' exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'plan') THEN
        UPDATE schools SET subscription_plan = plan;
    END IF;
END $$;

-- 2. RENAME TENANT_ID IN ALL TABLES
DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.columns WHERE column_name = 'tenant_id') LOOP
        EXECUTE format('ALTER TABLE %I RENAME COLUMN tenant_id TO school_id', t.table_name);
    END LOOP;
END $$;

-- 3. CREATE RBAC TABLES
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL, -- 'superadmin', 'school_admin', etc.
  label VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'students:read', 'fees:write'
  description TEXT,
  module VARCHAR(50), -- 'students', 'fees', 'reports', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 4. UPDATE USERS TABLE
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Migrate 'name' to 'full_name' if 'name' exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
        UPDATE users SET full_name = name;
    END IF;
END $$;

-- 5. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  school_id UUID REFERENCES schools(id),
  action VARCHAR(100), -- 'created', 'updated', 'deleted', 'viewed'
  resource VARCHAR(100), -- 'student', 'fee', 'report'
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. SEED DATA - ROLES
INSERT INTO roles (name, label) VALUES
  ('superadmin', 'Super Admin'),
  ('school_admin', 'School Admin'),
  ('headmaster', 'Headmaster'),
  ('accountant', 'Accountant'),
  ('teacher', 'Teacher'),
  ('parent', 'Parent'),
  ('student', 'Student')
ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label;

-- 7. SEED DATA - PERMISSIONS (Partial list for demonstration, based on spec)
-- Super Admin Permissions
INSERT INTO permissions (name, module) VALUES
  ('schools:read', 'schools'), ('schools:write', 'schools'), ('schools:delete', 'schools'),
  ('users:read', 'users'), ('users:write', 'users'), ('users:delete', 'users'),
  ('billing:read', 'billing'), ('billing:write', 'billing'),
  ('analytics:global', 'analytics'),
  ('impersonate:any_role', 'system'),
  ('system:settings', 'system')
ON CONFLICT (name) DO NOTHING;

-- School Admin Permissions
INSERT INTO permissions (name, module) VALUES
  ('students:read', 'students'), ('students:write', 'students'), ('students:delete', 'students'),
  ('teachers:read', 'teachers'), ('teachers:write', 'teachers'), ('teachers:delete', 'teachers'),
  ('parents:read', 'parents'), ('parents:write', 'parents'),
  ('classes:read', 'classes'), ('classes:write', 'classes'),
  ('subjects:read', 'subjects'), ('subjects:write', 'subjects'),
  ('timetable:read', 'timetable'), ('timetable:write', 'timetable'),
  ('fees:read', 'fees'), ('fees:write', 'fees'),
  ('reports:read', 'reports'),
  ('announcements:write', 'announcements'),
  ('settings:school', 'settings')
ON CONFLICT (name) DO NOTHING;

-- 8. LINK PERMISSIONS TO ROLES
-- Mapping Super Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'superadmin' AND p.module IN ('schools', 'users', 'billing', 'analytics', 'system')
ON CONFLICT DO NOTHING;

-- Mapping School Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'school_admin' AND p.name IN (
    'students:read', 'students:write', 'students:delete',
    'teachers:read', 'teachers:write', 'teachers:delete',
    'parents:read', 'parents:write',
    'classes:read', 'classes:write',
    'subjects:read', 'subjects:write',
    'timetable:read', 'timetable:write',
    'fees:read', 'fees:write',
    'reports:read',
    'announcements:write',
    'settings:school'
)
ON CONFLICT DO NOTHING;

-- 9. MIGRATE EXISTING USERS TO ROLES
-- Set existing 'admin' role to 'school_admin' role_id
UPDATE users u
SET role_id = r.id
FROM roles r
WHERE (u.role = 'admin' OR u.role = 'school_admin') AND r.name = 'school_admin';

-- Set superadmin (based on email)
UPDATE users u
SET role_id = r.id
FROM roles r
WHERE u.email = (SELECT value FROM (SELECT current_setting('app.super_admin_email', true) as value) s) AND r.name = 'superadmin';

COMMIT;
