BEGIN;

CREATE OR REPLACE FUNCTION increment_verification_count(token TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE report_cards
    SET verification_count = COALESCE(verification_count, 0) + 1
    WHERE qr_token = token;
END;
$$;

-- Wait, the schema in report_cards doesn't have verification_count. 
-- It is in report_card_verifications, but maybe we want a fast cache on report_cards too.
-- Let's just alter the table to add it for the RPC to work, or adjust the RPC.

ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS verification_count INTEGER DEFAULT 0;

COMMIT;
