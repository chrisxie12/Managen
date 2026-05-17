-- 20260517000000_school_roles_and_users.sql
-- Add school-level role support and user management enhancements
BEGIN;

-- School-scoped roles (null = system role, non-null = custom role for that school)
ALTER TABLE roles ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_roles_school_id ON roles(school_id);

-- School-scoped role_permissions (null = system mapping, non-null = custom mapping)
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_role_permissions_school_id ON role_permissions(school_id);

-- Mark seeded roles as system roles
UPDATE roles SET is_system = true WHERE school_id IS NULL;

-- Add is_active, suspended_at, last_active to users if not exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id);

COMMIT;
