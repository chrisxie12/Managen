const supabase = require('../../config/db');
const { getModel } = require('./geminiClient');

const SYSTEM_PROMPT = `You are a professional Ghanaian school teacher writing terminal report card comments for the NaCCA/WAEC curriculum. Write exactly 2 sentences. Tone: encouraging, specific, professional.`;

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

async function generateComment(studentData) {
  const model = getModel();
  if (!model) throw new Error('GOOGLE_API_KEY not configured');

  const gradeSummary = Object.entries(studentData.grades)
    .map(([subject, score]) => `${subject} ${score}%`)
    .join(', ');

  const prompt = `Student: ${studentData.name}. Grades: ${gradeSummary}. Attendance: ${studentData.attendanceRate}%. Write the comment:`;

  const result = await model.generateContent([
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'user', parts: [{ text: prompt }] },
  ]);

  const text = result.response.text().trim();
  return { comment: text };
}

async function generateComments(studentId, termId, schoolId) {
  const { data: existing } = await supabase.from('report_cards')
    .select('ai_comment_status, ai_comment')
    .eq('student_id', studentId)
    .eq('term_id', termId)
    .maybeSingle();

  if (existing?.ai_comment_status === 'approved' && existing?.ai_comment) {
    return { cached: true, comment: existing.ai_comment, status: existing.ai_comment_status };
  }

  const data = await fetchStudentData(studentId, termId, schoolId);
  const studentData = {
    name: data.studentName,
    grades: { grades: data.grades },
    attendanceRate: data.attendance,
  };

  const { comment } = await generateComment(studentData);

  await supabase.from('report_cards').upsert({
    student_id: studentId,
    term_id: termId,
    school_id: schoolId,
    ai_comment: comment,
    ai_comment_status: 'draft',
  }, { onConflict: 'student_id,term_id,school_id' });

  return { cached: false, comment, status: 'draft' };
}

async function approveComment(studentId, termId, schoolId, comment) {
  const { error } = await supabase.from('report_cards')
    .update({ ai_comment: comment, ai_comment_status: 'approved' })
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

module.exports = { generateComments, approveComment, bulkGenerateComments, generateComment, fetchStudentData };
