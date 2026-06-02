-- 20260520000000_communication_center.sql
-- Communication Center: messages, templates, announcements, recipient tracking
BEGIN;

-- Message templates (must be created before outbound_messages)
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  body TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL DEFAULT 'any' CHECK (channel IN ('email', 'sms', 'whatsapp', 'in_app', 'any')),
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_msg_templates_school ON message_templates(school_id);
CREATE INDEX IF NOT EXISTS idx_msg_templates_category ON message_templates(category);

-- Outbound messages (sent, scheduled, draft) - renamed to avoid collision with chat messages table
CREATE TABLE IF NOT EXISTS outbound_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'in_app')),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'partial', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_outbound_messages_school ON outbound_messages(school_id);
CREATE INDEX IF NOT EXISTS idx_outbound_messages_status ON outbound_messages(status);
CREATE INDEX IF NOT EXISTS idx_outbound_messages_scheduled ON outbound_messages(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Message recipients (individual delivery tracking)
CREATE TABLE IF NOT EXISTS message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES outbound_messages(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('student', 'parent', 'staff', 'custom')),
  recipient_id UUID,
  recipient_name VARCHAR(255),
  recipient_contact VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  channel VARCHAR(20) NOT NULL,
  sent_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_msg_recipients_message ON message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_msg_recipients_status ON message_recipients(status);

-- Announcements (broadcast messages) - add communication-specific columns to existing table
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS channel VARCHAR(20) CHECK (channel IN ('email', 'sms', 'whatsapp', 'in_app'));
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published'));
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_announcements_school ON announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status) WHERE status IS NOT NULL;

COMMIT;
