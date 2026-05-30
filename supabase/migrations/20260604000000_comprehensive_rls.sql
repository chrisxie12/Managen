-- 20260604000000_comprehensive_rls.sql
-- Comprehensive Row-Level Security for all school-scoped tables
-- Strategy:
--   • Service role (used by backend) automatically bypasses RLS — no changes needed there
--   • auth_school_id() reads school_id from the Supabase JWT claim
--   • All school-scoped tables: school_id = auth_school_id()
--   • Superadmins (role = 'superadmin' in JWT) bypass school filtering
--   • Notifications remain user_id scoped (already correct)
--   • Global reference tables (roles, permissions) are read-only for all authenticated users

BEGIN;

-- ─── Helper Functions ────────────────────────────────────────────────────────

-- Reads school_id from the JWT. Supports both 'school_id' and 'tenantId' claims
-- for backwards compatibility with existing tokens.
CREATE OR REPLACE FUNCTION auth_school_id() RETURNS UUID
  LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    NULLIF((auth.jwt() ->> 'school_id'), '')::uuid,
    NULLIF((auth.jwt() ->> 'schoolId'), '')::uuid,
    NULLIF((auth.jwt() ->> 'tenantId'), '')::uuid,
    NULLIF(current_setting('app.current_school_id', true), '')::uuid,
    NULLIF(current_setting('app.current_tenant', true), '')::uuid
  );
$$;

-- Returns true if the current JWT belongs to a superadmin
CREATE OR REPLACE FUNCTION is_superadmin() RETURNS BOOLEAN
  LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role') = 'superadmin',
    false
  );
$$;

-- ─── Macro: school_id policy ─────────────────────────────────────────────────
-- Used in every USING clause: allows superadmins unrestricted access,
-- everyone else is scoped to their school.

-- Policy expression: (is_superadmin() OR school_id = auth_school_id())


-- ════════════════════════════════════════════════════════════════════════════
-- CORE TABLES
-- ════════════════════════════════════════════════════════════════════════════

-- ── schools ──────────────────────────────────────────────────────────────────
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS schools_select ON schools;
DROP POLICY IF EXISTS schools_modify ON schools;

-- Any authenticated user can read their own school; superadmins see all
CREATE POLICY schools_select ON schools FOR SELECT
  USING (is_superadmin() OR id = auth_school_id());

-- Only superadmins can create/update/delete schools
CREATE POLICY schools_modify ON schools FOR ALL
  USING (is_superadmin());

-- ── users ─────────────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_modify ON users;

CREATE POLICY users_select ON users FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY users_modify ON users FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── students ──────────────────────────────────────────────────────────────────
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS students_select ON students;
DROP POLICY IF EXISTS students_modify ON students;

CREATE POLICY students_select ON students FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY students_modify ON students FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── classes ───────────────────────────────────────────────────────────────────
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS classes_select ON classes;
DROP POLICY IF EXISTS classes_modify ON classes;

CREATE POLICY classes_select ON classes FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY classes_modify ON classes FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── subjects ──────────────────────────────────────────────────────────────────
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subjects_select ON subjects;
DROP POLICY IF EXISTS subjects_modify ON subjects;

CREATE POLICY subjects_select ON subjects FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY subjects_modify ON subjects FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── streams ───────────────────────────────────────────────────────────────────
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS streams_select ON streams;
DROP POLICY IF EXISTS streams_modify ON streams;

CREATE POLICY streams_select ON streams FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY streams_modify ON streams FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── rooms ─────────────────────────────────────────────────────────────────────
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rooms_select ON rooms;
DROP POLICY IF EXISTS rooms_modify ON rooms;

CREATE POLICY rooms_select ON rooms FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY rooms_modify ON rooms FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());


-- ════════════════════════════════════════════════════════════════════════════
-- JUNCTION / MAPPING TABLES (no direct school_id — inherit via parent)
-- ════════════════════════════════════════════════════════════════════════════

-- ── class_subjects ────────────────────────────────────────────────────────────
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS class_subjects_select ON class_subjects;
DROP POLICY IF EXISTS class_subjects_modify ON class_subjects;

CREATE POLICY class_subjects_select ON class_subjects FOR SELECT
  USING (is_superadmin() OR class_id IN (SELECT id FROM classes WHERE school_id = auth_school_id()));

CREATE POLICY class_subjects_modify ON class_subjects FOR ALL
  USING (is_superadmin() OR class_id IN (SELECT id FROM classes WHERE school_id = auth_school_id()));

-- ── class_teachers ────────────────────────────────────────────────────────────
ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS class_teachers_select ON class_teachers;
DROP POLICY IF EXISTS class_teachers_modify ON class_teachers;

CREATE POLICY class_teachers_select ON class_teachers FOR SELECT
  USING (is_superadmin() OR class_id IN (SELECT id FROM classes WHERE school_id = auth_school_id()));

CREATE POLICY class_teachers_modify ON class_teachers FOR ALL
  USING (is_superadmin() OR class_id IN (SELECT id FROM classes WHERE school_id = auth_school_id()));

-- ── subject_teachers ──────────────────────────────────────────────────────────
ALTER TABLE subject_teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subject_teachers_select ON subject_teachers;
DROP POLICY IF EXISTS subject_teachers_modify ON subject_teachers;

CREATE POLICY subject_teachers_select ON subject_teachers FOR SELECT
  USING (is_superadmin() OR subject_id IN (SELECT id FROM subjects WHERE school_id = auth_school_id()));

CREATE POLICY subject_teachers_modify ON subject_teachers FOR ALL
  USING (is_superadmin() OR subject_id IN (SELECT id FROM subjects WHERE school_id = auth_school_id()));


-- ════════════════════════════════════════════════════════════════════════════
-- ACADEMIC STRUCTURE
-- ════════════════════════════════════════════════════════════════════════════

-- ── academic_sessions ────────────────────────────────────────────────────────
ALTER TABLE academic_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academic_sessions_select ON academic_sessions;
DROP POLICY IF EXISTS academic_sessions_modify ON academic_sessions;

CREATE POLICY academic_sessions_select ON academic_sessions FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY academic_sessions_modify ON academic_sessions FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── academic_terms ────────────────────────────────────────────────────────────
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academic_terms_select ON academic_terms;
DROP POLICY IF EXISTS academic_terms_modify ON academic_terms;

CREATE POLICY academic_terms_select ON academic_terms FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY academic_terms_modify ON academic_terms FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── grade_rules ───────────────────────────────────────────────────────────────
ALTER TABLE grade_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grade_rules_select ON grade_rules;
DROP POLICY IF EXISTS grade_rules_modify ON grade_rules;

CREATE POLICY grade_rules_select ON grade_rules FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY grade_rules_modify ON grade_rules FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── grading_scales ────────────────────────────────────────────────────────────
ALTER TABLE grading_scales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grading_scales_select ON grading_scales;
DROP POLICY IF EXISTS grading_scales_modify ON grading_scales;

CREATE POLICY grading_scales_select ON grading_scales FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY grading_scales_modify ON grading_scales FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── interventions ─────────────────────────────────────────────────────────────
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS interventions_select ON interventions;
DROP POLICY IF EXISTS interventions_modify ON interventions;

CREATE POLICY interventions_select ON interventions FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY interventions_modify ON interventions FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());


-- ════════════════════════════════════════════════════════════════════════════
-- ASSESSMENTS & GRADING
-- ════════════════════════════════════════════════════════════════════════════

-- ── assessment_types ──────────────────────────────────────────────────────────
ALTER TABLE assessment_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assessment_types_select ON assessment_types;
DROP POLICY IF EXISTS assessment_types_modify ON assessment_types;

CREATE POLICY assessment_types_select ON assessment_types FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY assessment_types_modify ON assessment_types FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── assessments ───────────────────────────────────────────────────────────────
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assessments_select ON assessments;
DROP POLICY IF EXISTS assessments_modify ON assessments;

CREATE POLICY assessments_select ON assessments FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY assessments_modify ON assessments FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── assessment_items ──────────────────────────────────────────────────────────
ALTER TABLE assessment_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assessment_items_select ON assessment_items;
DROP POLICY IF EXISTS assessment_items_modify ON assessment_items;

CREATE POLICY assessment_items_select ON assessment_items FOR SELECT
  USING (is_superadmin() OR assessment_id IN (SELECT id FROM assessments WHERE school_id = auth_school_id()));

CREATE POLICY assessment_items_modify ON assessment_items FOR ALL
  USING (is_superadmin() OR assessment_id IN (SELECT id FROM assessments WHERE school_id = auth_school_id()));

-- ── assessment_scores ─────────────────────────────────────────────────────────
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assessment_scores_select ON assessment_scores;
DROP POLICY IF EXISTS assessment_scores_modify ON assessment_scores;

CREATE POLICY assessment_scores_select ON assessment_scores FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY assessment_scores_modify ON assessment_scores FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── assessment_scores_audit ───────────────────────────────────────────────────
ALTER TABLE assessment_scores_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assessment_scores_audit_select ON assessment_scores_audit;

CREATE POLICY assessment_scores_audit_select ON assessment_scores_audit FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

-- Audit records are insert-only; no updates/deletes allowed for anyone
CREATE POLICY assessment_scores_audit_insert ON assessment_scores_audit FOR INSERT
  WITH CHECK (is_superadmin() OR school_id = auth_school_id());

-- ── student_grades ────────────────────────────────────────────────────────────
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS student_grades_select ON student_grades;
DROP POLICY IF EXISTS student_grades_modify ON student_grades;

CREATE POLICY student_grades_select ON student_grades FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY student_grades_modify ON student_grades FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── exams (legacy tenant_id column) ───────────────────────────────────────────
DROP POLICY IF EXISTS "Users can access exams of their school" ON exams;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS exams_select ON exams;
DROP POLICY IF EXISTS exams_modify ON exams;

CREATE POLICY exams_select ON exams FOR SELECT
  USING (is_superadmin() OR tenant_id = auth_school_id());

CREATE POLICY exams_modify ON exams FOR ALL
  USING (is_superadmin() OR tenant_id = auth_school_id());

-- ── results (legacy tenant_id column) ────────────────────────────────────────
DROP POLICY IF EXISTS "Users can access results of their school" ON results;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS results_select ON results;
DROP POLICY IF EXISTS results_modify ON results;

CREATE POLICY results_select ON results FOR SELECT
  USING (is_superadmin() OR tenant_id = auth_school_id());

CREATE POLICY results_modify ON results FOR ALL
  USING (is_superadmin() OR tenant_id = auth_school_id());

-- ── report_cards ──────────────────────────────────────────────────────────────
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS report_cards_select ON report_cards;
DROP POLICY IF EXISTS report_cards_modify ON report_cards;

CREATE POLICY report_cards_select ON report_cards FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY report_cards_modify ON report_cards FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── student_report_cards ──────────────────────────────────────────────────────
ALTER TABLE student_report_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS student_report_cards_select ON student_report_cards;
DROP POLICY IF EXISTS student_report_cards_modify ON student_report_cards;

CREATE POLICY student_report_cards_select ON student_report_cards FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY student_report_cards_modify ON student_report_cards FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── report_card_templates ─────────────────────────────────────────────────────
ALTER TABLE report_card_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS report_card_templates_select ON report_card_templates;
DROP POLICY IF EXISTS report_card_templates_modify ON report_card_templates;

CREATE POLICY report_card_templates_select ON report_card_templates FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY report_card_templates_modify ON report_card_templates FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── report_card_verifications ─────────────────────────────────────────────────
ALTER TABLE report_card_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS report_card_verifications_select ON report_card_verifications;
DROP POLICY IF EXISTS report_card_verifications_modify ON report_card_verifications;

CREATE POLICY report_card_verifications_select ON report_card_verifications FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY report_card_verifications_modify ON report_card_verifications FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── report_job_queue ──────────────────────────────────────────────────────────
ALTER TABLE report_job_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS report_job_queue_select ON report_job_queue;
DROP POLICY IF EXISTS report_job_queue_modify ON report_job_queue;

CREATE POLICY report_job_queue_select ON report_job_queue FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY report_job_queue_modify ON report_job_queue FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());


-- ════════════════════════════════════════════════════════════════════════════
-- ATTENDANCE
-- ════════════════════════════════════════════════════════════════════════════

-- ── attendance_links ──────────────────────────────────────────────────────────
ALTER TABLE attendance_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS attendance_links_select ON attendance_links;
DROP POLICY IF EXISTS attendance_links_modify ON attendance_links;

CREATE POLICY attendance_links_select ON attendance_links FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY attendance_links_modify ON attendance_links FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── daily_attendance_links ────────────────────────────────────────────────────
ALTER TABLE daily_attendance_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_attendance_links_select ON daily_attendance_links;
DROP POLICY IF EXISTS daily_attendance_links_modify ON daily_attendance_links;

CREATE POLICY daily_attendance_links_select ON daily_attendance_links FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY daily_attendance_links_modify ON daily_attendance_links FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── geofence_attendance ───────────────────────────────────────────────────────
ALTER TABLE geofence_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS geofence_attendance_select ON geofence_attendance;
DROP POLICY IF EXISTS geofence_attendance_modify ON geofence_attendance;

CREATE POLICY geofence_attendance_select ON geofence_attendance FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY geofence_attendance_modify ON geofence_attendance FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── staff_attendance ──────────────────────────────────────────────────────────
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_attendance_select ON staff_attendance;
DROP POLICY IF EXISTS staff_attendance_modify ON staff_attendance;

CREATE POLICY staff_attendance_select ON staff_attendance FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY staff_attendance_modify ON staff_attendance FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── daily_staff_attendance ────────────────────────────────────────────────────
ALTER TABLE daily_staff_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_staff_attendance_select ON daily_staff_attendance;
DROP POLICY IF EXISTS daily_staff_attendance_modify ON daily_staff_attendance;

CREATE POLICY daily_staff_attendance_select ON daily_staff_attendance FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY daily_staff_attendance_modify ON daily_staff_attendance FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());


-- ════════════════════════════════════════════════════════════════════════════
-- FINANCE & PAYMENTS
-- ════════════════════════════════════════════════════════════════════════════

-- ── fee_structures ────────────────────────────────────────────────────────────
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fee_structures_select ON fee_structures;
DROP POLICY IF EXISTS fee_structures_modify ON fee_structures;

CREATE POLICY fee_structures_select ON fee_structures FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY fee_structures_modify ON fee_structures FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── invoices ──────────────────────────────────────────────────────────────────
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoices_select ON invoices;
DROP POLICY IF EXISTS invoices_modify ON invoices;

CREATE POLICY invoices_select ON invoices FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY invoices_modify ON invoices FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── invoice_items (no direct school_id — scoped via invoice) ─────────────────
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoice_items_select ON invoice_items;
DROP POLICY IF EXISTS invoice_items_modify ON invoice_items;

CREATE POLICY invoice_items_select ON invoice_items FOR SELECT
  USING (is_superadmin() OR invoice_id IN (
    SELECT id FROM invoices WHERE school_id = auth_school_id()
  ));

CREATE POLICY invoice_items_modify ON invoice_items FOR ALL
  USING (is_superadmin() OR invoice_id IN (
    SELECT id FROM invoices WHERE school_id = auth_school_id()
  ));

-- ── payments ──────────────────────────────────────────────────────────────────
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payments_select ON payments;
DROP POLICY IF EXISTS payments_modify ON payments;

CREATE POLICY payments_select ON payments FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY payments_modify ON payments FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── waivers ───────────────────────────────────────────────────────────────────
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS waivers_select ON waivers;
DROP POLICY IF EXISTS waivers_modify ON waivers;

CREATE POLICY waivers_select ON waivers FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY waivers_modify ON waivers FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── discounts ─────────────────────────────────────────────────────────────────
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS discounts_select ON discounts;
DROP POLICY IF EXISTS discounts_modify ON discounts;

CREATE POLICY discounts_select ON discounts FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY discounts_modify ON discounts FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── pending_receipts ──────────────────────────────────────────────────────────
ALTER TABLE pending_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pending_receipts_select ON pending_receipts;
DROP POLICY IF EXISTS pending_receipts_modify ON pending_receipts;

CREATE POLICY pending_receipts_select ON pending_receipts FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY pending_receipts_modify ON pending_receipts FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── receipt_queue ─────────────────────────────────────────────────────────────
ALTER TABLE receipt_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS receipt_queue_select ON receipt_queue;
DROP POLICY IF EXISTS receipt_queue_modify ON receipt_queue;

CREATE POLICY receipt_queue_select ON receipt_queue FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY receipt_queue_modify ON receipt_queue FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── momo_callbacks ────────────────────────────────────────────────────────────
ALTER TABLE momo_callbacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS momo_callbacks_select ON momo_callbacks;
DROP POLICY IF EXISTS momo_callbacks_modify ON momo_callbacks;

CREATE POLICY momo_callbacks_select ON momo_callbacks FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY momo_callbacks_modify ON momo_callbacks FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── billing_history ───────────────────────────────────────────────────────────
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS billing_history_select ON billing_history;
DROP POLICY IF EXISTS billing_history_modify ON billing_history;

CREATE POLICY billing_history_select ON billing_history FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY billing_history_modify ON billing_history FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());


-- ════════════════════════════════════════════════════════════════════════════
-- COMMUNICATION & MESSAGING
-- ════════════════════════════════════════════════════════════════════════════

-- ── notifications (user-scoped, already had policies) ────────────────────────
DROP POLICY IF EXISTS notifications_select_policy ON notifications;
DROP POLICY IF EXISTS notifications_update_policy ON notifications;
DROP POLICY IF EXISTS notifications_select ON notifications;
DROP POLICY IF EXISTS notifications_modify ON notifications;

-- Users can only see their own notifications, and only within their school
CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (
    user_id = auth.uid()
    AND (is_superadmin() OR school_id = auth_school_id())
  );

CREATE POLICY notifications_update ON notifications FOR UPDATE
  USING (
    user_id = auth.uid()
    AND (is_superadmin() OR school_id = auth_school_id())
  );

-- ── message_templates ────────────────────────────────────────────────────────
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS message_templates_select ON message_templates;
DROP POLICY IF EXISTS message_templates_modify ON message_templates;

CREATE POLICY message_templates_select ON message_templates FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY message_templates_modify ON message_templates FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── outbound_messages ────────────────────────────────────────────────────────
ALTER TABLE outbound_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS outbound_messages_select ON outbound_messages;
DROP POLICY IF EXISTS outbound_messages_modify ON outbound_messages;

CREATE POLICY outbound_messages_select ON outbound_messages FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY outbound_messages_modify ON outbound_messages FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── message_recipients (scoped via outbound_message) ─────────────────────────
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS message_recipients_select ON message_recipients;
DROP POLICY IF EXISTS message_recipients_modify ON message_recipients;

CREATE POLICY message_recipients_select ON message_recipients FOR SELECT
  USING (is_superadmin() OR message_id IN (
    SELECT id FROM outbound_messages WHERE school_id = auth_school_id()
  ));

CREATE POLICY message_recipients_modify ON message_recipients FOR ALL
  USING (is_superadmin() OR message_id IN (
    SELECT id FROM outbound_messages WHERE school_id = auth_school_id()
  ));

-- ── whatsapp_conversations ────────────────────────────────────────────────────
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS whatsapp_conversations_select ON whatsapp_conversations;
DROP POLICY IF EXISTS whatsapp_conversations_modify ON whatsapp_conversations;

CREATE POLICY whatsapp_conversations_select ON whatsapp_conversations FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY whatsapp_conversations_modify ON whatsapp_conversations FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── whatsapp_rate_limits ──────────────────────────────────────────────────────
ALTER TABLE whatsapp_rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS whatsapp_rate_limits_select ON whatsapp_rate_limits;
DROP POLICY IF EXISTS whatsapp_rate_limits_modify ON whatsapp_rate_limits;

CREATE POLICY whatsapp_rate_limits_select ON whatsapp_rate_limits FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY whatsapp_rate_limits_modify ON whatsapp_rate_limits FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── push_subscriptions ────────────────────────────────────────────────────────
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS push_subscriptions_select ON push_subscriptions;
DROP POLICY IF EXISTS push_subscriptions_modify ON push_subscriptions;

CREATE POLICY push_subscriptions_select ON push_subscriptions FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY push_subscriptions_modify ON push_subscriptions FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());


-- ════════════════════════════════════════════════════════════════════════════
-- SETTINGS & CONFIGURATION
-- ════════════════════════════════════════════════════════════════════════════

-- ── school_settings ───────────────────────────────────────────────────────────
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS school_settings_select ON school_settings;
DROP POLICY IF EXISTS school_settings_modify ON school_settings;

CREATE POLICY school_settings_select ON school_settings FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY school_settings_modify ON school_settings FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── school_scheduling_settings ────────────────────────────────────────────────
ALTER TABLE school_scheduling_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS school_scheduling_settings_select ON school_scheduling_settings;
DROP POLICY IF EXISTS school_scheduling_settings_modify ON school_scheduling_settings;

CREATE POLICY school_scheduling_settings_select ON school_scheduling_settings FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY school_scheduling_settings_modify ON school_scheduling_settings FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── integrations ──────────────────────────────────────────────────────────────
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS integrations_select ON integrations;
DROP POLICY IF EXISTS integrations_modify ON integrations;

CREATE POLICY integrations_select ON integrations FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY integrations_modify ON integrations FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── approvals ─────────────────────────────────────────────────────────────────
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS approvals_select ON approvals;
DROP POLICY IF EXISTS approvals_modify ON approvals;

CREATE POLICY approvals_select ON approvals FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY approvals_modify ON approvals FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── events ────────────────────────────────────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS events_select ON events;
DROP POLICY IF EXISTS events_modify ON events;

CREATE POLICY events_select ON events FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY events_modify ON events FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());


-- ════════════════════════════════════════════════════════════════════════════
-- AI & ANALYTICS
-- ════════════════════════════════════════════════════════════════════════════

-- ── ai_usage ──────────────────────────────────────────────────────────────────
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_usage_select ON ai_usage;
DROP POLICY IF EXISTS ai_usage_modify ON ai_usage;

CREATE POLICY ai_usage_select ON ai_usage FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY ai_usage_modify ON ai_usage FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());


-- ════════════════════════════════════════════════════════════════════════════
-- AUDIT & SESSION TRACKING
-- ════════════════════════════════════════════════════════════════════════════

-- ── audit_logs ────────────────────────────────────────────────────────────────
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_select ON audit_logs;

-- Audit logs are read-only; inserts done only by service role (backend)
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── login_history ─────────────────────────────────────────────────────────────
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS login_history_select ON login_history;

CREATE POLICY login_history_select ON login_history FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

-- ── user_sessions ─────────────────────────────────────────────────────────────
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_sessions_select ON user_sessions;
DROP POLICY IF EXISTS user_sessions_modify ON user_sessions;

CREATE POLICY user_sessions_select ON user_sessions FOR SELECT
  USING (is_superadmin() OR school_id = auth_school_id());

CREATE POLICY user_sessions_modify ON user_sessions FOR ALL
  USING (is_superadmin() OR school_id = auth_school_id());


-- ════════════════════════════════════════════════════════════════════════════
-- GLOBAL / REFERENCE TABLES (no school_id — read-only for all authenticated)
-- ════════════════════════════════════════════════════════════════════════════

-- ── roles ─────────────────────────────────────────────────────────────────────
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS roles_read ON roles;

CREATE POLICY roles_read ON roles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── permissions ───────────────────────────────────────────────────────────────
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissions_read ON permissions;

CREATE POLICY permissions_read ON permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── role_permissions ──────────────────────────────────────────────────────────
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS role_permissions_read ON role_permissions;

CREATE POLICY role_permissions_read ON role_permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── demo_leads (superadmin only) ──────────────────────────────────────────────
ALTER TABLE demo_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS demo_leads_select ON demo_leads;
DROP POLICY IF EXISTS demo_leads_insert ON demo_leads;

-- Anyone can submit a demo lead (public form)
CREATE POLICY demo_leads_insert ON demo_leads FOR INSERT
  WITH CHECK (true);

-- Only superadmins can read leads
CREATE POLICY demo_leads_select ON demo_leads FOR SELECT
  USING (is_superadmin());


-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES: ensure RLS filter columns are indexed for performance
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_sessions_school ON academic_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_terms_school ON academic_terms(school_id);
CREATE INDEX IF NOT EXISTS idx_assessments_school ON assessments(school_id);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_school ON assessment_scores(school_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_school ON student_grades(school_id);
CREATE INDEX IF NOT EXISTS idx_report_cards_school ON report_cards(school_id);
CREATE INDEX IF NOT EXISTS idx_student_report_cards_school ON student_report_cards(school_id);
CREATE INDEX IF NOT EXISTS idx_events_school ON events(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_school ON ai_usage(school_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_school ON whatsapp_conversations(school_id);
CREATE INDEX IF NOT EXISTS idx_outbound_messages_school ON outbound_messages(school_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_school ON push_subscriptions(school_id);

COMMIT;
