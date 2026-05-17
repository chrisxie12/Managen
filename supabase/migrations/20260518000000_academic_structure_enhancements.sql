-- 20260518000000_academic_structure_enhancements.sql
-- Streams, academic sessions, class-subjects, subject-teachers, class-teachers
BEGIN;

-- Academic sessions (e.g., "2025-2026 Academic Year")
CREATE TABLE IF NOT EXISTS academic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_academic_sessions_school ON academic_sessions(school_id);

-- Streams (sub-divisions of a class, e.g., "A", "B", "Science", "Arts")
CREATE TABLE IF NOT EXISTS streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, name, class_id)
);

CREATE INDEX IF NOT EXISTS idx_streams_school_class ON streams(school_id, class_id);

-- Class-Subject association (which subjects are taught in which classes)
CREATE TABLE IF NOT EXISTS class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(class_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_class_subjects_school ON class_subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON class_subjects(subject_id);

-- Subject-Teacher assignment (assigns a teacher to teach a subject in a class)
CREATE TABLE IF NOT EXISTS subject_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(subject_id, teacher_id, class_id)
);

CREATE INDEX IF NOT EXISTS idx_subject_teachers_school ON subject_teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_subject_teachers_subject ON subject_teachers(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_teachers_teacher ON subject_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subject_teachers_class ON subject_teachers(class_id);

-- Class-Teacher assignment (form teacher / assistant / head teacher)
CREATE TABLE IF NOT EXISTS class_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'form_teacher' CHECK (role IN ('form_teacher', 'assistant', 'head_teacher')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(class_id, teacher_id)
);

CREATE INDEX IF NOT EXISTS idx_class_teachers_school ON class_teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_class ON class_teachers(class_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_teacher ON class_teachers(teacher_id);

COMMIT;
