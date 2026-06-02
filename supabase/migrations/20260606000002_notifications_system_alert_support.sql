-- System-generated alerts (receipt failures, payment failures) don't have a
-- specific target user — make user_id nullable so those inserts don't fail.
-- Also add school_id index for fetching all unread alerts for a school.
BEGIN;

ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_school_unread
  ON notifications(school_id, is_read) WHERE user_id IS NULL;

COMMIT;
