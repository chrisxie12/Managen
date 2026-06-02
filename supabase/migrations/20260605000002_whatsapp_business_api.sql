-- =============================================
-- Migration: WhatsApp Business API columns
-- Date: 2026-06-05
-- =============================================

-- Per-school WhatsApp Business API credentials
ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS whatsapp_phone_id TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_business_account_id TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_verify_token TEXT;

-- Message delivery tracking on whatsapp_conversations
ALTER TABLE whatsapp_conversations
  ADD COLUMN IF NOT EXISTS wa_message_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_wa_id ON whatsapp_conversations(wa_message_id) WHERE wa_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_status ON whatsapp_conversations(school_id, status);
