-- Migration: WhatsApp Fallback Queue Architecture

CREATE TYPE delivery_channel AS ENUM ('whatsapp', 'sms');
CREATE TYPE queue_status AS ENUM ('pending', 'processing', 'sent', 'failed');

CREATE TABLE IF NOT EXISTS receipt_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    parent_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    channel delivery_channel NOT NULL DEFAULT 'whatsapp',
    status queue_status NOT NULL DEFAULT 'pending',
    retries INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Index for fast queue polling
CREATE INDEX IF NOT EXISTS idx_receipt_queue_status_created ON receipt_queue(status, created_at);

CREATE TABLE IF NOT EXISTS pending_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    parent_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RPC for pulling jobs atomically to prevent race conditions across workers
CREATE OR REPLACE FUNCTION pop_receipt_jobs(batch_size INT)
RETURNS SETOF receipt_queue
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE receipt_queue
    SET status = 'processing', processed_at = NOW()
    WHERE id IN (
        SELECT id
        FROM receipt_queue
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT batch_size
        FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
END;
$$;
