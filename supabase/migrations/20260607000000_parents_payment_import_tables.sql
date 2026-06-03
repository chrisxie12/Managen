-- Creates 7 tables referenced in application code but absent from migrations,
-- and wires up the deferred FK from student_parents → parents.
BEGIN;

-- ── parents ────────────────────────────────────────────────────────────────────
-- Stores parent-student links. user_id is NULL for CSV-imported contacts that
-- haven't yet registered as platform users.
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_parents_tenant ON parents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parents_user ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_parents_student ON parents(student_id);
CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(tenant_id, phone);

-- Now that parents exists, add the deferred FK from student_parents.
ALTER TABLE student_parents
    ADD CONSTRAINT fk_student_parents_parent
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE;

-- ── fee_payments ───────────────────────────────────────────────────────────────
-- Each individual payment event against an invoice.
CREATE TABLE IF NOT EXISTS fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_reference TEXT,
    payment_type TEXT NOT NULL DEFAULT 'full',
    status TEXT NOT NULL DEFAULT 'completed',
    paid_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fee_payments_school ON fee_payments(school_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_invoice ON fee_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_reference ON fee_payments(payment_reference);

-- ── credit_balances ────────────────────────────────────────────────────────────
-- Overpayment credits held against a student.
CREATE TABLE IF NOT EXISTS credit_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    source TEXT,
    source_payment_method TEXT,
    source_reference TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_balances_school ON credit_balances(school_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_student ON credit_balances(student_id);

-- ── refunds ────────────────────────────────────────────────────────────────────
-- Admin-approved refunds of credit balances.
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    credit_id UUID REFERENCES credit_balances(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refunds_school ON refunds(school_id);

-- ── payment_transactions ────────────────────────────────────────────────────────
-- Raw gateway records from Paystack / MTN MoMo for reconciliation.
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    reference TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    status TEXT NOT NULL,
    student_id UUID REFERENCES students(id),
    invoice_id UUID REFERENCES invoices(id),
    metadata JSONB,
    provider_response JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_school ON payment_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(reference);

-- ── reconciliation_logs ─────────────────────────────────────────────────────────
-- Audit trail of nightly reconciliation runs.
CREATE TABLE IF NOT EXISTS reconciliation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    provider TEXT,
    transactions_checked INTEGER DEFAULT 0,
    discrepancies_found INTEGER DEFAULT 0,
    resolved INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    summary JSONB,
    error TEXT,
    run_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reconciliation_logs_school ON reconciliation_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_logs_run_at ON reconciliation_logs(run_at);

-- ── import_logs ─────────────────────────────────────────────────────────────────
-- Audit trail for CSV / bulk import operations.
CREATE TABLE IF NOT EXISTS import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    imported_by UUID REFERENCES users(id),
    type TEXT NOT NULL DEFAULT 'student_csv',
    mode TEXT NOT NULL DEFAULT 'import',
    status TEXT NOT NULL DEFAULT 'completed',
    total_rows INTEGER DEFAULT 0,
    valid_rows INTEGER DEFAULT 0,
    invalid_rows INTEGER DEFAULT 0,
    errors JSONB,
    imported_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_import_logs_school ON import_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_type ON import_logs(type, school_id);

COMMIT;
