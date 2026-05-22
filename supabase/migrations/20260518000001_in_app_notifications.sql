-- 20260518000000_in_app_notifications.sql
-- In-app notifications table with Realtime enabled
BEGIN;

-- Notifications table for in-app real-time notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  school_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'general',
  reference_id UUID,
  reference_type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_school ON notifications(school_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS notifications_select_policy ON notifications;
DROP POLICY IF EXISTS notifications_update_policy ON notifications;

-- RLS: users can only see their own notifications
CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS: users can only update their own notifications (mark as read)
CREATE POLICY notifications_update_policy ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Enable Realtime replication
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Add to publication (safe: only if not already a member)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

COMMIT;
