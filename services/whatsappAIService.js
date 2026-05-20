const supabase = require('../config/db');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are SchoolOS AI Assistant, a helpful chatbot for Ghanaian school parents.
You help parents check their children's school information via WhatsApp.
Use the provided functions to fetch real data. Always respond in plain English (no markdown).
Keep responses concise and friendly. If the intent is unclear, ask the user to choose:
"Reply 1 to check fee balance, 2 for attendance summary, 3 for exam results, or 4 for fee deadlines."`;

const RATE_LIMIT_MAX = 20;

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_student_balance',
      description: 'Get a student\'s outstanding fee balance',
      parameters: {
        type: 'object',
        properties: {
          parent_phone: { type: 'string', description: 'Parent phone number' },
          student_name: { type: 'string', description: 'Student full name' },
        },
        required: ['parent_phone', 'student_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_attendance_summary',
      description: 'Get attendance summary for a student',
      parameters: {
        type: 'object',
        properties: {
          student_name: { type: 'string', description: 'Student full name' },
          date_range: { type: 'string', description: 'Date range like "this term" or "last 30 days"' },
        },
        required: ['student_name', 'date_range'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_exam_results',
      description: 'Get exam results for a student',
      parameters: {
        type: 'object',
        properties: {
          student_name: { type: 'string', description: 'Student full name' },
          term: { type: 'string', description: 'Term like "current" or "Term 1"' },
        },
        required: ['student_name', 'term'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_fee_deadlines',
      description: 'Get upcoming fee payment deadlines',
      parameters: {
        type: 'object',
        properties: {
          parent_phone: { type: 'string', description: 'Parent phone number' },
        },
        required: ['parent_phone'],
      },
    },
  },
];

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

async function findStudent(schoolId, parentPhone, studentName) {
  const like = `%${studentName}%`;
  const { data } = await supabase
    .from('students')
    .select('id, first_name, last_name, class_id, class:classes(name)')
    .eq('school_id', schoolId)
    .or(`parent_phone.eq.${parentPhone},parent_phone2.eq.${parentPhone}`)
    .or(`first_name.ilike.${like},last_name.ilike.${like}`)
    .limit(1)
    .maybeSingle();
  return data;
}

async function getStudentBalance(parentPhone, studentName) {
  const student = await findStudent(null, parentPhone, studentName);
  if (!student) return null;
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total_amount, paid_amount, status')
    .eq('student_id', student.id)
    .in('status', ['pending', 'overdue']);

  const total = (invoices || []).reduce((s, i) => s + Number(i.total_amount), 0);
  const paid = (invoices || []).reduce((s, i) => s + Number(i.paid_amount), 0);
  return { student_name: `${student.first_name} ${student.last_name}`, balance: total - paid, total_billed: total, total_paid: paid };
}

async function getAttendanceSummary(studentName, dateRange) {
  const { data: student } = await supabase.from('students').select('id, first_name, last_name').ilike('first_name', `%${studentName.split(' ')[0]}%`).limit(1).maybeSingle();
  if (!student) return null;
  const days = dateRange?.includes('30') ? 30 : 90;
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data: records } = await supabase
    .from('attendance_records')
    .select('status')
    .eq('student_id', student.id)
    .gte('date', since);

  const total = records?.length || 0;
  const present = records?.filter(r => r.status === 'present').length || 0;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  return { student_name: `${student.first_name} ${student.last_name}`, present, total, rate, period: days + ' days' };
}

async function getExamResults(studentName, term) {
  const { data: student } = await supabase.from('students').select('id, first_name, last_name').ilike('first_name', `%${studentName.split(' ')[0]}%`).limit(1).maybeSingle();
  if (!student) return null;
  const { data: reportCards } = await supabase
    .from('report_cards')
    .select('total_score, average, grade, term:terms(name)')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(3);

  return { student_name: `${student.first_name} ${student.last_name}`, results: (reportCards || []).map(r => ({
    term: r.term?.name || 'N/A',
    average: r.average,
    grade: r.grade,
    total_score: r.total_score,
  })) };
}

async function getFeeDeadlines(parentPhone) {
  const { data: students } = await supabase
    .from('students')
    .select('id, first_name, last_name')
    .eq('parent_phone', parentPhone);

  if (!students?.length) return null;
  const studentIds = students.map(s => s.id);
  const { data: invoices } = await supabase
    .from('invoices')
    .select('student_id, total_amount, paid_amount, due_date, status, student:students(first_name, last_name)')
    .in('student_id', studentIds)
    .in('status', ['pending', 'overdue'])
    .order('due_date', { ascending: true });

  return (invoices || []).map(i => ({
    student_name: `${i.student?.first_name || ''} ${i.student?.last_name || ''}`.trim(),
    due_date: i.due_date,
    amount_due: Number(i.total_amount) - Number(i.paid_amount),
    status: i.status,
  }));
}

const functionMap = {
  get_student_balance: async (args) => getStudentBalance(args.parent_phone, args.student_name),
  get_attendance_summary: async (args) => getAttendanceSummary(args.student_name, args.date_range),
  get_exam_results: async (args) => getExamResults(args.student_name, args.term),
  get_fee_deadlines: async (args) => getFeeDeadlines(args.parent_phone),
};

async function transcribeAudio(audioUrl) {
  try {
    const response = await fetch(audioUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const blob = new Blob([buffer], { type: 'audio/ogg' });
    const file = new File([blob], 'voice.ogg', { type: 'audio/ogg' });
    const transcript = await openai.audio.transcriptions.create({ model: 'whisper-1', file });
    return transcript.text;
  } catch (err) {
    console.error('Whisper transcription failed:', err.message);
    return null;
  }
}

async function processIncomingMessage(schoolId, parentPhone, messageText, studentId = null, audioUrl = null) {
  const allowed = await checkRateLimit(parentPhone, schoolId);
  if (!allowed) return 'You have reached the daily message limit (20). Please try again tomorrow.';

  let text = messageText;
  const messageType = audioUrl ? 'voice' : 'text';

  if (audioUrl) {
    const transcribed = await transcribeAudio(audioUrl);
    if (!transcribed) return 'Sorry, I could not understand the voice note. Please try again or type your message.';
    text = transcribed;
    await storeMessage(schoolId, parentPhone, studentId, `[Transcribed] ${transcribed}`, 'in', 'voice', audioUrl);
  } else {
    await storeMessage(schoolId, parentPhone, studentId, text, 'in', 'text');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      tools,
      tool_choice: 'auto',
      max_tokens: 500,
    });

    const choice = response.choices[0];
    const toolCalls = choice.finish_reason === 'tool_calls' ? choice.message.tool_calls : null;

    let replyText;
    if (toolCalls) {
      const results = await Promise.all(
        toolCalls.map(async (tc) => {
          const fn = functionMap[tc.function.name];
          if (!fn) return JSON.stringify({ error: `Unknown function: ${tc.function.name}` });
          try {
            const args = JSON.parse(tc.function.arguments);
            return JSON.stringify(await fn(args));
          } catch (e) {
            return JSON.stringify({ error: e.message });
          }
        }),
      );

      const followUp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
          choice.message,
          { role: 'tool', content: results.join('\n\n'), tool_call_id: toolCalls[0].id },
        ],
        max_tokens: 500,
      });
      replyText = followUp.choices[0].message.content || 'Sorry, I could not process that request.';
    } else {
      replyText = choice.message.content || 'Sorry, I could not process that request.';
    }

    await storeMessage(schoolId, parentPhone, studentId, replyText, 'out', 'text');
    return replyText;
  } catch (err) {
    console.error('AI processing failed:', err.message);
    const fallback = 'Sorry, I am experiencing a technical issue. Please try again later.';
    await storeMessage(schoolId, parentPhone, studentId, fallback, 'out', 'text');
    return fallback;
  }
}

module.exports = { processIncomingMessage, storeMessage, checkRateLimit };
