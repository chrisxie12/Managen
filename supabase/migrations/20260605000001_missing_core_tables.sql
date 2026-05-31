-- Missing core tables referenced in code but absent from migrations.
-- All use CREATE TABLE IF NOT EXISTS so they are safe to run on existing DBs.
--
-- Column naming follows the actual live schema:
--   tenant_id  → original base tables (students, attendance, fees, users, timetable uses school_id)
--   school_id  → tables created via migration files (classes, timetable, gradebook_entries, etc.)

-- ── attendance ─────────────────────────────────────────────────────────────
-- Base table (pre-migration). Uses tenant_id to match students/users schema.
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_name TEXT,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
    notes TEXT,
    marked_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date ON attendance(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance(tenant_id, class_name);

-- ── timetable ──────────────────────────────────────────────────────────────
-- Uses school_id (confirmed by normalize_timetable migration referencing t.school_id).
CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_name TEXT,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    subject TEXT,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    teacher TEXT,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    day TEXT NOT NULL,
    period INTEGER NOT NULL,
    start_time TEXT,
    end_time TEXT,
    room TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_timetable_school ON timetable(school_id);
CREATE INDEX IF NOT EXISTS idx_timetable_class ON timetable(school_id, class_name);

-- ── fees ───────────────────────────────────────────────────────────────────
-- Base table (pre-migration). Uses tenant_id.
CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'waived')),
    due_date DATE,
    term TEXT,
    academic_year TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fees_tenant ON fees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(tenant_id, status);

-- ── gradebook_entries ──────────────────────────────────────────────────────
-- Uses school_id (matches service code at school.js:2696).
CREATE TABLE IF NOT EXISTS gradebook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    score NUMERIC(8, 2),
    max_score NUMERIC(8, 2),
    grade TEXT,
    term_id UUID REFERENCES academic_terms(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gradebook_school ON gradebook_entries(school_id);
CREATE INDEX IF NOT EXISTS idx_gradebook_student ON gradebook_entries(student_id);

-- ── exam_results ───────────────────────────────────────────────────────────
-- Base table (pre-migration). Uses tenant_id.
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    subject TEXT,
    score NUMERIC(8, 2),
    max_score NUMERIC(8, 2),
    grade TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(exam_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_exam_results_tenant ON exam_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);

-- ── library_books ──────────────────────────────────────────────────────────
-- New table. Uses tenant_id to match service code (schoolService.js addBook).
CREATE TABLE IF NOT EXISTS library_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    category TEXT,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    location TEXT,
    cover_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_library_books_tenant ON library_books(tenant_id);

-- ── library_issues ─────────────────────────────────────────────────────────
-- New table. Uses tenant_id to match service code (schoolService.js issueBook).
CREATE TABLE IF NOT EXISTS library_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    returned_at TIMESTAMPTZ,
    status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue', 'lost')),
    fine NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_library_issues_tenant ON library_issues(tenant_id);
CREATE INDEX IF NOT EXISTS idx_library_issues_book ON library_issues(book_id);
CREATE INDEX IF NOT EXISTS idx_library_issues_student ON library_issues(student_id);

-- ── payroll ────────────────────────────────────────────────────────────────
-- New table. Uses tenant_id to match service code (schoolService.js getPayroll).
CREATE TABLE IF NOT EXISTS payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    staff_name TEXT,
    month TEXT NOT NULL,
    year INTEGER,
    basic_salary NUMERIC(12, 2),
    allowances NUMERIC(12, 2) DEFAULT 0,
    deductions NUMERIC(12, 2) DEFAULT 0,
    net_salary NUMERIC(12, 2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'cancelled')),
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payroll_tenant ON payroll(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month ON payroll(tenant_id, month, year);

-- ── notification_logs ──────────────────────────────────────────────────────
-- New table. Uses tenant_id to match service code (schoolService.js getNotificationLogs).
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    type TEXT,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_phone TEXT,
    recipient_email TEXT,
    subject TEXT,
    message TEXT,
    channel TEXT DEFAULT 'in_app' CHECK (channel IN ('in_app', 'sms', 'email', 'whatsapp', 'push')),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'pending')),
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notification_logs_tenant ON notification_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient ON notification_logs(recipient_id);
