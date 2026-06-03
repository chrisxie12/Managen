const supabase = require('../config/db');
const chatbotService = require('./ai/chatbotService');

const RATE_LIMIT_MAX = 20;

async function checkRateLimit(parentPhone, schoolId) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('whatsapp_rate_limits')
    .select('count')
    .eq('parent_phone', parentPhone)
    .eq('school_id', schoolId)
    .eq('date', today)
    .maybeSingle();

  const count = data?.count ?? 0;
  if (count >= RATE_LIMIT_MAX) return false;

  if (data) {
    await supabase.from('whatsapp_rate_limits').update({ count: count + 1 }).eq('parent_phone', parentPhone).eq('school_id', schoolId).eq('date', today);
  } else {
    await supabase.from('whatsapp_rate_limits').insert({ parent_phone: parentPhone, school_id: schoolId, date: today, count: 1 });
  }
  return true;
}

async function storeMessage(schoolId, parentPhone, studentId, message, direction, messageType = 'text', audioUrl = null) {
  const { error } = await supabase.from('whatsapp_conversations').insert({
    school_id: schoolId,
    parent_phone: parentPhone,
    student_id: studentId,
    message,
    direction,
    message_type: messageType,
    audio_url: audioUrl,
  });
  if (error) console.error('Failed to store WhatsApp message:', error.message);
}

async function findStudent(schoolId, parentPhone) {
  const { data } = await supabase
    .from('students')
    .select('id, first_name, last_name, class_id, class:classes(name)')
    .eq('school_id', schoolId)
    .or(`parent_phone.eq.${parentPhone},parent_phone2.eq.${parentPhone}`)
    .limit(1)
    .maybeSingle();
  return data;
}

async function getStudentContext(schoolId, studentId, student) {
  const context = { studentName: `${student.first_name} ${student.last_name}` };

  const { data: invoices } = await supabase
    .from('invoices')
    .select('total_amount, paid_amount')
    .eq('student_id', studentId)
    .in('status', ['pending', 'overdue']);

  const total = (invoices || []).reduce((s, i) => s + Number(i.total_amount), 0);
  const paid = (invoices || []).reduce((s, i) => s + Number(i.paid_amount), 0);
  context.balance = total - paid;

  const { data: attendance } = await supabase
    .from('attendance')
    .select('status')
    .eq('student_id', studentId);

  const present = (attendance || []).filter(a => a.status === 'present').length;
  const totalDays = (attendance || []).length;
  context.attendance = totalDays > 0 ? Math.round((present / totalDays) * 100) + '%' : 'N/A';

  const { data: term } = await supabase
    .from('academic_terms')
    .select('name, end_date')
    .eq('school_id', schoolId)
    .eq('is_current', true)
    .single()
    .catch(() => ({ data: null }));

  if (term?.end_date) {
    context.deadline = `${term.name} ends ${new Date(term.end_date).toLocaleDateString()}`;
  }

  return context;
}

async function processIncomingMessage(schoolId, parentPhone, messageText, studentId = null, audioUrl = null) {
  const allowed = await checkRateLimit(parentPhone, schoolId);
  if (!allowed) return 'You have reached the daily message limit (20). Please try again tomorrow.';

  let text = messageText;
  const messageType = audioUrl ? 'voice' : 'text';

  if (audioUrl) {
    text = '[Voice message received - transcription unavailable]';
    await storeMessage(schoolId, parentPhone, studentId, text, 'in', 'voice', audioUrl);
  } else {
    await storeMessage(schoolId, parentPhone, studentId, text, 'in', 'text');
  }

  try {
    const student = await findStudent(schoolId, parentPhone);
    let context = {};

    if (student) {
      context = await getStudentContext(schoolId, student.id, student);
    }

    const { reply } = chatbotService.handleParentQuery(parentPhone, text, context);

    await storeMessage(schoolId, parentPhone, student?.id || studentId, reply, 'out', 'text');
    return reply;
  } catch (err) {
    console.error('Chatbot processing failed:', err.message);
    const fallback = 'Sorry, I am experiencing a technical issue. Please try again later.';
    await storeMessage(schoolId, parentPhone, studentId, fallback, 'out', 'text');
    return fallback;
  }
}

module.exports = { processIncomingMessage, storeMessage, checkRateLimit };
