-- Migration: Feature Extensions for Attendance Links, Report Cards, Bulk Import, Daily Sign-in/Sign-out

-- 1. Add geofencing columns to schools
ALTER TABLE schools ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS geofence_radius INTEGER DEFAULT 100;

-- 2. Add non-teaching staff columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_title VARCHAR(200);

-- 3. Attendance Links (Geofenced - Feature 1)
CREATE TABLE IF NOT EXISTS attendance_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_group VARCHAR(50) DEFAULT 'all', -- 'all', 'teachers', 'non_teaching_staff'
    expires_at TIMESTAMPTZ NOT NULL,
    is_one_time BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    link_code VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_links_school ON attendance_links(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_links_code ON attendance_links(link_code);

-- 4. Geofenced Attendance Records (Feature 1)
CREATE TABLE IF NOT EXISTS geofence_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    link_id UUID NOT NULL REFERENCES attendance_links(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'present', -- 'present', 'rejected'
    UNIQUE(link_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_geofence_attendance_school ON geofence_attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_geofence_attendance_user ON geofence_attendance(user_id);

-- 5. Report Card Templates (Feature 2)
CREATE TABLE IF NOT EXISTS report_card_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_templates_school ON report_card_templates(school_id);

-- 6. Generated Student Report Cards (Feature 2)
CREATE TABLE IF NOT EXISTS student_report_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES report_card_templates(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    term_id UUID REFERENCES academic_terms(id) ON DELETE SET NULL,
    session_id UUID REFERENCES academic_sessions(id) ON DELETE SET NULL,
    pdf_path TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'generated', 'published'
    generated_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ,
    UNIQUE(student_id, term_id, session_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_student_report_cards_school ON student_report_cards(school_id);
CREATE INDEX IF NOT EXISTS idx_student_report_cards_student ON student_report_cards(student_id);

-- 7. Daily Attendance Links for Sign-in/Sign-out (Feature 5)
CREATE TABLE IF NOT EXISTS daily_attendance_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    link_type VARCHAR(10) NOT NULL CHECK (link_type IN ('signin', 'signout')),
    link_code VARCHAR(64) UNIQUE NOT NULL,
    date DATE NOT NULL,
    active_from TIME NOT NULL,
    active_until TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(school_id, date, link_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_links_school_date ON daily_attendance_links(school_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_links_code ON daily_attendance_links(link_code);

-- 8. Daily Staff Attendance Records (Feature 5)
CREATE TABLE IF NOT EXISTS daily_staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sign_in_time TIMESTAMPTZ,
    sign_out_time TIMESTAMPTZ,
    sign_in_link_id UUID REFERENCES daily_attendance_links(id) ON DELETE SET NULL,
    sign_out_link_id UUID REFERENCES daily_attendance_links(id) ON DELETE SET NULL,
    sign_in_status VARCHAR(20) DEFAULT 'none', -- 'none', 'on_time', 'late', 'manual'
    sign_out_status VARCHAR(20) DEFAULT 'none', -- 'none', 'on_time', 'early', 'manual'
    override_by UUID REFERENCES users(id) ON DELETE SET NULL,
    override_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(school_id, user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_staff_attendance_school ON daily_staff_attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_daily_staff_attendance_user ON daily_staff_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_staff_attendance_date ON daily_staff_attendance(date);

-- 9. School attendance link settings (Feature 5)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sign_in_start TIME DEFAULT '06:00:00';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sign_in_end TIME DEFAULT '14:00:00';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sign_out_start TIME DEFAULT '14:30:00';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sign_out_end TIME DEFAULT '15:30:00';
