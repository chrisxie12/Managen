-- =============================================
-- Migration: WhatsApp AI + Parent Features
-- Date: 2026-05-29
-- =============================================

-- 1. WhatsApp conversations table
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  parent_phone TEXT NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image')),
  audio_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_school ON whatsapp_conversations(school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_phone ON whatsapp_conversations(parent_phone, created_at DESC);

-- 2. Daily rate limiting
CREATE TABLE IF NOT EXISTS whatsapp_rate_limits (
  parent_phone TEXT NOT NULL,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  PRIMARY KEY (parent_phone, school_id, date)
);

-- 3. Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, school_id)
);

CREATE INDEX IF NOT EXISTS idx_push_sub_user ON push_subscriptions(user_id);

-- 4. Report card comments storage
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS comment_approved TEXT;

-- 5. Enable Realtime for whatsapp_conversations (for admin viewing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'whatsapp_conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_conversations;
  END IF;
END $$;
