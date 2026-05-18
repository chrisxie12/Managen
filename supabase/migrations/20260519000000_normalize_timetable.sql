-- 20260519000000_normalize_timetable.sql
-- Rooms, scheduling settings, teacher availability, timetable normalization
BEGIN;

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  capacity INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, name)
);

-- Create scheduling settings table
CREATE TABLE IF NOT EXISTS school_scheduling_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  periods_per_day INT DEFAULT 8,
  period_duration_minutes INT DEFAULT 45,
  start_time TIME DEFAULT '08:00',
  break_start TIME DEFAULT '10:00',
  break_duration_minutes INT DEFAULT 15,
  lunch_start TIME DEFAULT '12:00',
  lunch_duration_minutes INT DEFAULT 45,
  days_of_week TEXT[] DEFAULT ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id)
);

-- Add availability column to users (JSON: { "Monday": [1,2,3,4,5,6,7,8], ... })
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability JSONB;

-- Add periods_per_week to class_subjects (how many times this subject meets per week)
ALTER TABLE class_subjects ADD COLUMN IF NOT EXISTS periods_per_week INT DEFAULT 2;

-- Normalize timetable: add period_number and FK reference columns
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS period_number INT;
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES users(id);
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id);
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id);
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id);
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES academic_terms(id);

-- Backfill teacher_id, subject_id, class_id, room_id from existing text names
UPDATE timetable t
SET teacher_id = (
  SELECT u.id FROM users u
  WHERE u.name = t.teacher AND u.tenant_id = t.tenant_id AND u.role = 'teacher'
  LIMIT 1
),
subject_id = (
  SELECT s.id FROM subjects s
  WHERE s.name = t.subject AND s.school_id = t.tenant_id
  LIMIT 1
),
class_id = (
  SELECT c.id FROM classes c
  WHERE c.name = t.class_name AND c.tenant_id = t.tenant_id
  LIMIT 1
),
room_id = (
  SELECT r.id FROM rooms r
  WHERE r.name = t.room AND r.school_id = t.tenant_id
  LIMIT 1
);

-- Compute period_number from period string (e.g., '08:00-08:45')
-- Order by period start time within each (class_id, day) group
WITH numbered AS (
  SELECT
    id, class_id, day, period,
    ROW_NUMBER() OVER (
      PARTITION BY class_id, day
      ORDER BY SPLIT_PART(period, '-', 1)::TIME
    ) AS pn
  FROM timetable
  WHERE class_id IS NOT NULL AND period IS NOT NULL
)
UPDATE timetable SET period_number = numbered.pn
FROM numbered
WHERE timetable.id = numbered.id;

-- For any remaining rows where backfill failed or period_number is null,
-- set a default period_number based on position within the day
UPDATE timetable SET period_number = DEFAULT
WHERE period_number IS NULL;

-- Make columns NOT NULL after backfill
ALTER TABLE timetable ALTER COLUMN period_number SET NOT NULL;
ALTER TABLE timetable ALTER COLUMN teacher_id SET NOT NULL;
ALTER TABLE timetable ALTER COLUMN subject_id SET NOT NULL;
ALTER TABLE timetable ALTER COLUMN class_id SET NOT NULL;
-- room_id can remain nullable

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_timetable_class_period
  ON timetable(class_id, day, period_number);
CREATE INDEX IF NOT EXISTS idx_timetable_teacher_period
  ON timetable(teacher_id, day, period_number);
CREATE INDEX IF NOT EXISTS idx_timetable_room_period
  ON timetable(room_id, day, period_number);
CREATE INDEX IF NOT EXISTS idx_timetable_term
  ON timetable(term_id);

COMMIT;
