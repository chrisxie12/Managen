-- 20260517200000_staff_attendance.sql
-- Staff attendance, repeated absence detection, attendance trends
BEGIN;

CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused', 'Half-day')),
  check_in TIME,
  check_out TIME,
  notes TEXT,
  marked_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_school_date ON staff_attendance(school_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_user ON staff_attendance(user_id);

-- Add attendance trend tracking
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS marked_by UUID REFERENCES users(id);

COMMIT;
