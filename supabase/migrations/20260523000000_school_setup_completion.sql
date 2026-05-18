-- 20260523000000_school_setup_completion.sql
-- Add setup onboarding tracking columns to schools table
BEGIN;

ALTER TABLE schools ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS setup_step INT DEFAULT 1;

-- Backfill: mark all existing schools as setup_completed = true
-- (the default for new ALTER TABLE ADD COLUMN is FALSE, but existing
--  schools were created before this feature existed)
UPDATE schools SET setup_completed = TRUE, setup_step = NULL;

COMMIT;
