-- 20260519000000_finance_payment_tracking.sql
-- Finance & Payment Tracking: fee structures, invoices, payments, waivers, discounts
BEGIN;

-- Fee structures (templates/config per school, optionally per class/term)
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'tuition',
  amount INTEGER NOT NULL CHECK (amount >= 0),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  term_id UUID REFERENCES academic_terms(id) ON DELETE SET NULL,
  is_optional BOOLEAN DEFAULT false,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fee_structures_school ON fee_structures(school_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_class ON fee_structures(class_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_term ON fee_structures(term_id);

-- Invoices (generated per student per term/session)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  term_id UUID REFERENCES academic_terms(id) ON DELETE SET NULL,
  session_id UUID REFERENCES academic_sessions(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','issued','paid','overdue','cancelled')),
  total_amount INTEGER NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  paid_amount INTEGER NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, invoice_number)
);
CREATE INDEX IF NOT EXISTS idx_invoices_school ON invoices(school_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
  description VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  waived BOOLEAN DEFAULT false,
  waiver_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(30) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash','mobile_money','bank_transfer','card','cheque')),
  reference VARCHAR(255),
  transaction_id VARCHAR(255),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','failed','pending','refunded')),
  notes TEXT,
  received_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_school ON payments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Fee waivers/concessions
CREATE TABLE IF NOT EXISTS waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_waivers_school ON waivers(school_id);
CREATE INDEX IF NOT EXISTS idx_waivers_student ON waivers(student_id);
CREATE INDEX IF NOT EXISTS idx_waivers_status ON waivers(status);

-- Discount rules
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage','fixed')),
  value DECIMAL(10,2) NOT NULL CHECK (value >= 0),
  applicable_to VARCHAR(30) NOT NULL DEFAULT 'all' CHECK (applicable_to IN ('all','specific_fee','specific_class')),
  applicable_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_discounts_school ON discounts(school_id);

COMMIT;
