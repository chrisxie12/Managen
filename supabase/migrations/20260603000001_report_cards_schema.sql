BEGIN;

-- Report Cards Table
CREATE TABLE IF NOT EXISTS report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  pdf_url TEXT,
  qr_token TEXT UNIQUE NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  reprint_count INTEGER DEFAULT 0,
  UNIQUE(student_id, term_id)
);

CREATE INDEX IF NOT EXISTS idx_report_cards_student_term ON report_cards(student_id, term_id);

-- Report Card Verifications Table
CREATE TABLE IF NOT EXISTS report_card_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_card_id UUID NOT NULL REFERENCES report_cards(id) ON DELETE CASCADE,
  qr_token TEXT UNIQUE NOT NULL,
  verified_at TIMESTAMPTZ,
  verified_by_ip TEXT,
  verification_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_report_verifications_token ON report_card_verifications(qr_token);

-- Report Job Queue (using same pattern as receipt_queue)
CREATE TABLE IF NOT EXISTS report_job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE, -- NULL means entire class
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_report_job_queue_status ON report_job_queue(status, created_at);

-- RPC for pulling jobs
CREATE OR REPLACE FUNCTION pop_report_jobs(p_limit INTEGER)
RETURNS SETOF report_job_queue
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE report_job_queue
    SET status = 'processing',
        processed_at = NOW()
    WHERE id IN (
        SELECT id
        FROM report_job_queue
        WHERE status = 'pending'
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT p_limit
    )
    RETURNING *;
END;
$$;

COMMIT;
