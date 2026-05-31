-- Add form level and class_teacher columns to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS form TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS class_teacher TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create expenses table (missing from initial schema)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT DEFAULT 'Other',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    payment_method TEXT DEFAULT 'Cash',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_school ON expenses(school_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
