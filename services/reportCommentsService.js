const supabase = require('../config/db');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const COMMENT_PROMPT = (studentName, grades, attendance, incidents) =>
  `Write a 2-sentence teacher comment for ${studentName}. Grades: ${grades}. Attendance: ${attendance}%. Behavior incidents: ${incidents}. Tone: professional, encouraging, specific. Return 3 distinct variants separated by "---".`;

async function fetchStudentData(studentId, termId, schoolId) {
  const [studentRes, gradesRes, attendanceRes, incidentsRes] = await Promise.all([
    supabase.from('students').select('id, first_name, last_name').eq('id', studentId).eq('school_id', schoolId).single(),
    supabase.from('assessment_grades').select(`
      score, max_score,
      subject:subjects(name),
      grade_band
    `).eq('student_id', studentId).eq('term_id', termId),
    supabase.from('attendance_records').select('status').eq('student_id', studentId),
    supabase.from('interventions').select('severity, status').eq('student_id', studentId),
  ]);

  if (studentRes.error) throw new Error('Student not found');

  const grades = (gradesRes.data || []).map(g =>
    `${g.subject?.name || 'Subject'}: ${g.score}/${g.max_score} (${g.grade_band || 'N/A'})`
  ).join(', ') || 'No grades recorded';

  const total = attendanceRes.data?.length || 0;
  const present = (attendanceRes.data || []).filter(a => a.status === 'present').length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 100;

  const critical = (incidentsRes.data || []).filter(i => i.severity === 'high' && i.status === 'open').length;
  const moderate = (incidentsRes.data || []).filter(i => i.severity === 'medium' && i.status === 'open').length;
  const incidents = `${critical} critical, ${moderate} moderate open incidents`;

  return {
    studentName: `${studentRes.data.first_name} ${studentRes.data.last_name}`,
    grades,
    attendance: rate,
    incidents,
  };
}

async function generateComments(studentId, termId, schoolId) {
  // Check cache: return if teacher already approved a comment
  const { data: existing } = await supabase.from('report_cards')
    .select('comment_approved, comments')
    .eq('student_id', studentId)
    .eq('term_id', termId)
    .maybeSingle();

  if (existing?.comment_approved) {
    return { cached: true, variants: existing.comments, approved: existing.comment_approved };
  }

  const data = await fetchStudentData(studentId, termId, schoolId);
  const prompt = COMMENT_PROMPT(data.studentName, data.grades, data.attendance, data.incidents);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content || '';
  const variants = text.split('---').map(v => v.trim()).filter(Boolean).slice(0, 3);

  // Cache in report_cards.comments
  await supabase.from('report_cards').upsert({
    student_id: studentId,
    term_id: termId,
    school_id: schoolId,
    comments: variants,
  }, { onConflict: 'student_id,term_id,school_id' });

  return { cached: false, variants };
}

async function approveComment(studentId, termId, schoolId, comment) {
  const { error } = await supabase.from('report_cards')
    .update({ comment_approved: comment })
    .eq('student_id', studentId)
    .eq('term_id', termId)
    .eq('school_id', schoolId);
  if (error) throw new Error(error.message);
}

async function bulkGenerateComments(classId, termId, schoolId) {
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .eq('is_active', true);

  return (students || []).map(s => ({
    studentId: s.id,
    termId,
    schoolId,
  }));
}

module.exports = { generateComments, approveComment, bulkGenerateComments, fetchStudentData };
