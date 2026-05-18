export type TeacherClass = {
  id: string;
  name: string;
  student_count: number;
  role: string;
  subjects: { name: string; code?: string }[];
};

export type ClassStudent = {
  id: string;
  name: string;
  admission_no?: string;
  class_name: string;
};

export type TimetableEntry = {
  id: string;
  day: string;
  period: number;
  subject: string;
  class_name: string;
  room?: string;
  teacher?: string;
};

export type Assessment = {
  id: string;
  name: string;
  date: string;
  max_score: number;
  status: string;
  class?: { name: string };
  subject?: { name: string; code?: string };
  type?: { name: string; weight: number };
  term?: { name: string };
  session?: { name: string };
};

export type Score = {
  id?: string;
  assessment_id: string;
  student_id: string;
  score: number;
};

export type Performer = {
  id: string;
  student_id: string;
  total_score: number;
  average: number;
  grade: string;
  rank: number;
  student?: { name: string; admission_no?: string };
};

export type GradeRule = {
  id: string;
  grade: string;
  min_percent: number;
  max_percent: number;
  points: number;
  remark?: string;
};
