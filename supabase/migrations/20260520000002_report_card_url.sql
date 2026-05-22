-- =============================================
-- Migration: Add report_card_url to report_cards
-- Date: 2026-05-20
-- Needed for storing DO Spaces keys for PDF report cards.
-- =============================================

ALTER TABLE report_cards
  ADD COLUMN IF NOT EXISTS report_card_url TEXT;

CREATE INDEX IF NOT EXISTS idx_report_cards_report_card_url
  ON report_cards(report_card_url) WHERE report_card_url IS NOT NULL;
