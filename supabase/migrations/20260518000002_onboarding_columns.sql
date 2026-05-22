-- 20260518000000_onboarding_columns.sql
BEGIN;

-- Add new onboarding columns
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS year_established integer,
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS grading_system text DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS academic_year text,
ADD COLUMN IF NOT EXISTS current_term text,
ADD COLUMN IF NOT EXISTS term_start_date date,
ADD COLUMN IF NOT EXISTS term_end_date date,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Backfill: existing schools are past onboarding
UPDATE schools SET onboarding_completed = true WHERE onboarding_completed IS NULL;
UPDATE schools SET metadata = '{}'::jsonb WHERE metadata IS NULL;

-- Drop old columns (replaced by onboarding_completed)
ALTER TABLE schools DROP COLUMN IF EXISTS setup_completed;
ALTER TABLE schools DROP COLUMN IF EXISTS setup_step;

COMMIT;
