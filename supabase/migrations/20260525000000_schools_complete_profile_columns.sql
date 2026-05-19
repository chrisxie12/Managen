-- =====================================================
-- Complete Schools Table Migration
-- Adds all missing columns for school profile & settings
-- =====================================================

-- SCHOOL IDENTITY
ALTER TABLE schools 
  ADD COLUMN IF NOT EXISTS registration_number TEXT,
  ADD COLUMN IF NOT EXISTS motto TEXT,
  ADD COLUMN IF NOT EXISTS year_established INTEGER,
  ADD COLUMN IF NOT EXISTS school_type TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#6366f1',
  ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#10b981';

-- CONTACT INFORMATION
ALTER TABLE schools 
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Ghana',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Accra',
  ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- ACADEMIC DEFAULTS
ALTER TABLE schools 
  ADD COLUMN IF NOT EXISTS current_term_id UUID,
  ADD COLUMN IF NOT EXISTS current_session_id UUID,
  ADD COLUMN IF NOT EXISTS academic_year_start DATE,
  ADD COLUMN IF NOT EXISTS academic_year_end DATE,
  ADD COLUMN IF NOT EXISTS week_start_day TEXT DEFAULT 'Monday';

-- FEATURE FLAGS & SETTINGS
ALTER TABLE schools 
  ADD COLUMN IF NOT EXISTS auto_generate_report_cards BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS enable_parent_notifications BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_staff_attendance_geofence BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS enable_online_payments BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_sms_notifications BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS enable_email_notifications BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS low_attendance_threshold INTEGER DEFAULT 75;

-- SYSTEM & AUDIT
ALTER TABLE schools 
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS max_students INTEGER,
  ADD COLUMN IF NOT EXISTS max_teachers INTEGER,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- Backfill Defaults for Existing Schools
-- =====================================================

UPDATE schools 
SET 
  country = COALESCE(country, 'Ghana'),
  primary_color = COALESCE(primary_color, '#6366f1'),
  timezone = COALESCE(timezone, 'Africa/Accra'),
  week_start_day = COALESCE(week_start_day, 'Monday'),
  enable_parent_notifications = COALESCE(enable_parent_notifications, TRUE),
  enable_online_payments = COALESCE(enable_online_payments, TRUE),
  enable_email_notifications = COALESCE(enable_email_notifications, TRUE),
  is_active = COALESCE(is_active, TRUE),
  subscription_plan = COALESCE(subscription_plan, 'free');

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_schools_is_active ON schools(is_active);
CREATE INDEX IF NOT EXISTS idx_schools_subscription_plan ON schools(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_schools_current_term ON schools(current_term_id);
CREATE INDEX IF NOT EXISTS idx_schools_timezone ON schools(timezone);

-- =====================================================
-- Update updated_at trigger if not exists
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
