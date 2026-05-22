BEGIN;

-- Drop the absolute UNIQUE constraint on student_id, term_id
-- We drop it so we can allow multiple versions if one is archived.
ALTER TABLE report_cards DROP CONSTRAINT IF EXISTS report_cards_student_id_term_id_key;

-- Create a unique index that only applies to non-archived reports.
-- This ensures a student only has one active (draft/published) report per term,
-- but can have multiple archived reports.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_report_card 
ON report_cards(student_id, term_id) 
WHERE status != 'archived';

-- Add new columns
ALTER TABLE report_cards 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES report_cards(id),
ADD COLUMN IF NOT EXISTS scores_hash TEXT;

-- Update report_job_queue to accept generated_by
ALTER TABLE report_job_queue 
ADD COLUMN IF NOT EXISTS generated_by UUID REFERENCES users(id);

COMMIT;
