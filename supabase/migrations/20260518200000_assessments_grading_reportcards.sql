-- 20260518200000_assessments_grading_reportcards.sql
-- Assessment types, assessments, scores, grading scales, report cards
BEGIN;

-- Assessment types (Quiz, Assignment, Test, Exam, Continuous Assessment)
CREATE TABLE IF NOT EXISTS assessment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  weight DECIMAL(5,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, name)
);

-- Grading scales (e.g., "Default A-F", "WAEC", "BECE")
CREATE TABLE IF NOT EXISTS grading_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Grade boundary rules within a scale
CREATE TABLE IF NOT EXISTS grade_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grading_scale_id UUID NOT NULL REFERENCES grading_scales(id) ON DELETE CASCADE,
  grade VARCHAR(5) NOT NULL,
  min_percent DECIMAL(5,2) NOT NULL,
  max_percent DECIMAL(5,2) NOT NULL,
  points DECIMAL(3,1) DEFAULT 0,
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (min_percent <= max_percent)
);

-- Assessments (standalone, per class/subject/term/session)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  term_id UUID REFERENCES academic_terms(id),
  session_id UUID REFERENCES academic_sessions(id),
  assessment_type_id UUID NOT NULL REFERENCES assessment_types(id),
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  max_score DECIMAL(7,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessments_school_term ON assessments(school_id, term_id);
CREATE INDEX IF NOT EXISTS idx_assessments_class_subject ON assessments(class_id, subject_id);

-- Assessment scores per student
CREATE TABLE IF NOT EXISTS assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score DECIMAL(7,2) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assessment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_scores_assessment ON assessment_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_student ON assessment_scores(student_id);

-- Report cards (one per student per term per session)
CREATE TABLE IF NOT EXISTS report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES academic_terms(id),
  session_id UUID REFERENCES academic_sessions(id),
  total_score DECIMAL(10,2) DEFAULT 0,
  total_max_score DECIMAL(10,2) DEFAULT 0,
  average DECIMAL(5,2) DEFAULT 0,
  grade VARCHAR(5),
  rank INTEGER,
  subject_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'approved')),
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, term_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_report_cards_school_term ON report_cards(school_id, term_id);
CREATE INDEX IF NOT EXISTS idx_report_cards_student ON report_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_report_cards_status ON report_cards(status);

COMMIT;
