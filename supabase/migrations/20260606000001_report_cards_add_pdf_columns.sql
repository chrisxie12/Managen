-- 20260518200000 created report_cards first (IF NOT EXISTS), so the schema in
-- 20260603000001 was a no-op. Add the missing PDF/QR columns explicitly.
BEGIN;

ALTER TABLE report_cards
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_token TEXT,
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS generated_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS reprint_count INTEGER DEFAULT 0;

-- Partial unique index on qr_token (only non-null values need to be unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_report_cards_qr_token
  ON report_cards(qr_token) WHERE qr_token IS NOT NULL;

COMMIT;
