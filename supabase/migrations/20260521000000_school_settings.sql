-- 20260521000000_school_settings.sql
-- School Settings & Integrations: profile, branding, feature toggles, integration configs
BEGIN;

-- Add settings columns to schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'GHS';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(5) DEFAULT '₵';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Africa/Accra';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'en-US';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS week_starts_on VARCHAR(10) DEFAULT 'monday';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20) DEFAULT '#381932';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20) DEFAULT '#512b4a';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS notification_email VARCHAR(255);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS notification_phone VARCHAR(50);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS enable_sms_notifications BOOLEAN DEFAULT true;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS enable_email_notifications BOOLEAN DEFAULT true;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS enable_whatsapp_notifications BOOLEAN DEFAULT true;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS enable_in_app_notifications BOOLEAN DEFAULT true;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS auto_publish_report_cards BOOLEAN DEFAULT false;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS enable_online_payments BOOLEAN DEFAULT false;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS enable_fee_reminders BOOLEAN DEFAULT true;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS enable_attendance_tracking BOOLEAN DEFAULT true;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS enable_parent_portal BOOLEAN DEFAULT true;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS enable_student_portal BOOLEAN DEFAULT true;

-- School settings key-value store (for extensible settings)
CREATE TABLE IF NOT EXISTS school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, key)
);
CREATE INDEX IF NOT EXISTS idx_school_settings_school ON school_settings(school_id);

-- Integration configs (per-school provider settings)
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  tested_at TIMESTAMPTZ,
  last_test_result VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, provider)
);
CREATE INDEX IF NOT EXISTS idx_integrations_school ON integrations(school_id);

COMMIT;
