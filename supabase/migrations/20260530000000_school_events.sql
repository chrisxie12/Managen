-- 20260530000000_school_events.sql
-- School events and calendar management
BEGIN;

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  event_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (event_type IN ('general', 'holiday', 'exam', 'sports', 'meeting', 'deadline', 'custom')),
  status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled')),
  location VARCHAR(255),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_school ON events(school_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

COMMIT;
