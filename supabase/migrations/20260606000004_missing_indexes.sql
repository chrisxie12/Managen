-- Indexes on school_id columns that are queried in hot paths but have no index.
CREATE INDEX IF NOT EXISTS idx_assessment_types_school ON assessment_types(school_id);
CREATE INDEX IF NOT EXISTS idx_grading_scales_school ON grading_scales(school_id);
CREATE INDEX IF NOT EXISTS idx_grade_rules_scale ON grade_rules(grading_scale_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_school ON billing_history(school_id);
CREATE INDEX IF NOT EXISTS idx_pending_receipts_school ON pending_receipts(school_id);
