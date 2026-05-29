-- 20260519120000_timetable_scheduler_enhancements.sql
BEGIN;

ALTER TABLE class_subjects
  ADD COLUMN IF NOT EXISTS allow_consecutive BOOLEAN DEFAULT FALSE;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS max_periods_per_day INT DEFAULT 6;

COMMIT;
