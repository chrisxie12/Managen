CREATE TABLE IF NOT EXISTS demo_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    school_name TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Ghana',
    message TEXT,
    source TEXT,
    variant TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demo_leads_created_at
    ON demo_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_demo_leads_email
    ON demo_leads (lower(email));
