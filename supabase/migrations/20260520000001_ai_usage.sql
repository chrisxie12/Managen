-- =============================================
-- Migration: AI Usage Tracking + Report Card AI Columns
-- Date: 2026-05-20
-- Tracks Gemini API usage per school.
-- Adds ai_comment columns to report_cards.
-- =============================================

CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES school_users(id) ON DELETE SET NULL,
  endpoint VARCHAR(50) NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model VARCHAR(30) DEFAULT 'gemini-1.5-flash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE report_cards
  ADD COLUMN IF NOT EXISTS ai_comment TEXT,
  ADD COLUMN IF NOT EXISTS ai_comment_status VARCHAR(20) DEFAULT 'draft';

CREATE INDEX IF NOT EXISTS idx_ai_usage_school_created
  ON ai_usage(school_id, created_at);
