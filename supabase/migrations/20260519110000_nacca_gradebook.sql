-- 20260519110000_nacca_gradebook.sql
-- NaCCA Standards-Based Gradebook: assessment items, student grades, terminal summary view
-- Follows Ghana NaCCA guidelines: SBA = 30% continuous, Exam = 70% terminal
BEGIN;

-- Assessment items define columns in the gradebook grid
CREATE TABLE IF NOT EXISTS assessment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  assessment_type VARCHAR(10) NOT NULL CHECK (assessment_type IN ('SBA', 'EXAM')),
  name VARCHAR(255) NOT NULL,
  max_points DECIMAL(7,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, class_id, subject_id, term_id, name)
);

CREATE INDEX IF NOT EXISTS idx_assessment_items_lookup
  ON assessment_items(school_id, class_id, subject_id, term_id);

-- Student grades per assessment item
CREATE TABLE IF NOT EXISTS student_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assessment_item_id UUID NOT NULL REFERENCES assessment_items(id) ON DELETE CASCADE,
  score_achieved DECIMAL(7,2) NOT NULL CHECK (score_achieved >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, assessment_item_id)
);

CREATE INDEX IF NOT EXISTS idx_student_grades_lookup
  ON student_grades(school_id, assessment_item_id);

-- Terminal summary view with NaCCA 30/70 weighted formula
-- Final = (SBA_sum / SBA_max * 30) + (Exam_sum / Exam_max * 70)
CREATE OR REPLACE VIEW v_nacca_terminal_summary AS
WITH sba AS (
  SELECT
    sg.student_id,
    ai.class_id,
    ai.subject_id,
    ai.term_id,
    ROUND(SUM(sg.score_achieved)::numeric, 2) AS total_sba_score,
    ROUND(SUM(ai.max_points)::numeric, 2) AS total_sba_max
  FROM student_grades sg
  JOIN assessment_items ai ON sg.assessment_item_id = ai.id
  WHERE ai.assessment_type = 'SBA'
  GROUP BY sg.student_id, ai.class_id, ai.subject_id, ai.term_id
),
exam AS (
  SELECT
    sg.student_id,
    ai.class_id,
    ai.subject_id,
    ai.term_id,
    ROUND(SUM(sg.score_achieved)::numeric, 2) AS total_exam_score,
    ROUND(SUM(ai.max_points)::numeric, 2) AS total_exam_max
  FROM student_grades sg
  JOIN assessment_items ai ON sg.assessment_item_id = ai.id
  WHERE ai.assessment_type = 'EXAM'
  GROUP BY sg.student_id, ai.class_id, ai.subject_id, ai.term_id
)
SELECT
  gen_random_uuid() AS id,
  COALESCE(sba.student_id, exam.student_id) AS student_id,
  COALESCE(sba.class_id, exam.class_id) AS class_id,
  COALESCE(sba.subject_id, exam.subject_id) AS subject_id,
  COALESCE(sba.term_id, exam.term_id) AS term_id,
  COALESCE(sba.total_sba_score, 0) AS total_sba_score,
  COALESCE(sba.total_sba_max, 0) AS total_sba_max,
  COALESCE(exam.total_exam_score, 0) AS total_exam_score,
  COALESCE(exam.total_exam_max, 0) AS total_exam_max,
  ROUND(
    CASE WHEN COALESCE(sba.total_sba_max, 0) > 0
      THEN (COALESCE(sba.total_sba_score, 0) / NULLIF(sba.total_sba_max, 0)) * 30
      ELSE 0
    END +
    CASE WHEN COALESCE(exam.total_exam_max, 0) > 0
      THEN (COALESCE(exam.total_exam_score, 0) / NULLIF(exam.total_exam_max, 0)) * 70
      ELSE 0
    END, 2
  ) AS final_percentage,
  CASE
    WHEN ROUND(
      CASE WHEN COALESCE(sba.total_sba_max, 0) > 0
        THEN (COALESCE(sba.total_sba_score, 0) / NULLIF(sba.total_sba_max, 0)) * 30
        ELSE 0
      END +
      CASE WHEN COALESCE(exam.total_exam_max, 0) > 0
        THEN (COALESCE(exam.total_exam_score, 0) / NULLIF(exam.total_exam_max, 0)) * 70
        ELSE 0
      END, 2) >= 80 THEN 'EE'
    WHEN ROUND(
      CASE WHEN COALESCE(sba.total_sba_max, 0) > 0
        THEN (COALESCE(sba.total_sba_score, 0) / NULLIF(sba.total_sba_max, 0)) * 30
        ELSE 0
      END +
      CASE WHEN COALESCE(exam.total_exam_max, 0) > 0
        THEN (COALESCE(exam.total_exam_score, 0) / NULLIF(exam.total_exam_max, 0)) * 70
        ELSE 0
      END, 2) >= 65 THEN 'ME'
    WHEN ROUND(
      CASE WHEN COALESCE(sba.total_sba_max, 0) > 0
        THEN (COALESCE(sba.total_sba_score, 0) / NULLIF(sba.total_sba_max, 0)) * 30
        ELSE 0
      END +
      CASE WHEN COALESCE(exam.total_exam_max, 0) > 0
        THEN (COALESCE(exam.total_exam_score, 0) / NULLIF(exam.total_exam_max, 0)) * 70
        ELSE 0
      END, 2) >= 50 THEN 'AE'
    ELSE 'B'
  END AS grade_band,
  now() AS computed_at
FROM sba
FULL OUTER JOIN exam
  ON sba.student_id = exam.student_id
  AND sba.class_id = exam.class_id
  AND sba.subject_id = exam.subject_id
  AND sba.term_id = exam.term_id;

COMMIT;
