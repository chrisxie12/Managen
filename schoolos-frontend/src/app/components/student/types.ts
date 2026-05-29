export type StudentProfile = {
  id: string;
  name: string;
  class_name: string;
  admission_no?: string;
  gender?: string;
  dob?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  address?: string;
  avatar_url?: string;
};

export type AttendanceRecord = {
  id: string;
  date: string;
  status: string;
  notes?: string;
};

export type Invoice = {
  id: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  due_date?: string;
  term?: { name: string };
};

export type Intervention = {
  id: string;
  type: string;
  severity: string;
  notes?: string;
  status: string;
  created_at: string;
  assigned?: { full_name: string };
};

export type ReportCard = {
  id: string;
  total_score: number;
  average: number;
  grade: string;
  rank: number;
  status: string;
  term?: { name: string };
  session?: { name: string };
};

export type TimetableEntry = {
  id: string;
  day: string;
  period: number;
  subject: string;
  room?: string;
  teacher?: string;
};
