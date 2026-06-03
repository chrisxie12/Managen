-- Junction table referenced in bulk_import_students() RPC.
-- parent_id stores a UUID reference to the parents table, but that table is
-- created in a later migration (20260607000000). The FK is added there via
-- ALTER TABLE to avoid a forward-reference failure.
CREATE TABLE IF NOT EXISTS student_parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, parent_id)
);

CREATE INDEX IF NOT EXISTS idx_student_parents_student ON student_parents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_parent ON student_parents(parent_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_tenant ON student_parents(tenant_id);
