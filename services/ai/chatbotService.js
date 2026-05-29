const INTENT_PATTERNS = {
  balance: ['balance', 'owe', 'fee', 'pay', 'debt', 'outstanding', 'money', 'cost', 'amount'],
  attendance: ['attendance', 'absent', 'present', 'come to school', 'skipping', 'truant'],
  results: ['result', 'exam', 'grade', 'score', 'mark', 'performance', 'test'],
  deadline: ['when', 'date', 'deadline', 'due', 'expire', 'next payment', 'end of term'],
};

function classifyIntent(message) {
  const lower = message.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_PATTERNS)) {
    if (keywords.some(kw => lower.includes(kw))) return intent;
  }
  return 'general';
}

function handleParentQuery(parentPhone, message, context) {
  const intent = classifyIntent(message);

  if (intent === 'balance') {
    if (context?.balance !== undefined) {
      const name = context.studentName || 'your child';
      return { reply: `The fee balance for ${name} is GHS ${context.balance}.`, intent };
    }
    return { reply: 'Please contact your class teacher for fee balance details.', intent };
  }

  if (intent === 'attendance') {
    if (context?.attendance !== undefined) {
      const name = context.studentName || 'your child';
      return { reply: `${name}'s attendance rate is ${context.attendance}%.`, intent };
    }
    return { reply: 'Please contact your class teacher for attendance details.', intent };
  }

  if (intent === 'results') {
    if (context?.nextExam !== undefined) {
      return { reply: `Upcoming exam: ${context.nextExam}. Please check the school portal for detailed results.`, intent };
    }
    return { reply: 'Please contact your class teacher for exam results.', intent };
  }

  if (intent === 'deadline') {
    if (context?.deadline) {
      return { reply: `Next fee deadline: ${context.deadline}.`, intent };
    }
    return { reply: 'Please contact your class teacher for deadline information.', intent };
  }

  return { reply: 'Reply 1 for fee balance, 2 for attendance, 3 for exam results.', intent };
}

module.exports = { handleParentQuery, classifyIntent };
