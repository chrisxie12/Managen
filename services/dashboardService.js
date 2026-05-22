const supabase = require('../config/db');

const { subDays, format } = require('date-fns');

// Helpers
const now = () => new Date();
const todayStr = () => format(now(), 'yyyy-MM-dd');

async function safeQuery(fn) {
  try {
    return await fn();
  } catch {
    return null;
  }
}

async function getStats(schoolId) {
  if (!schoolId) throw new Error('school_id is required');

  // Students
  const studentsData = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('students')
      .select('id, status', { count: 'exact' })
      .eq('school_id', schoolId)
      .eq('status', 'active');
    if (error) throw error;
    return data;
  });
  const totalStudents = studentsData?.length || 0;

  // New this term: fetch current term start from school settings
  const schoolSettings = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('current_term, term_start_date, max_students')
      .eq('id', schoolId)
      .single();
    if (error) throw error;
    return data;
  });

  const termStart = schoolSettings?.term_start_date;
  const newThisTerm = 0;
  const boardingCount = 0;
  const dayCount = 0;

  // Staff
  const staffData = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('id, status')
      .eq('school_id', schoolId);
    if (error) throw error;
    return data;
  });
  const totalStaff = staffData?.length || 0;
  const activeStaff = (staffData || []).filter(s => s.status === 'active').length;
  const onLeaveStaff = 0;

  // Attendance for today
  const today = todayStr();
  const attData = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('school_id', schoolId)
      .eq('date', today);
    if (error) throw error;
    return data;
  });
  const present = (attData || []).filter(a => a.status === 'present').length;
  const absent = (attData || []).filter(a => a.status === 'absent').length;
  const late = (attData || []).filter(a => a.status === 'late').length;
  const totalAtt = present + absent + late;
  const attendanceRate = totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0;

  // Fees collected this month
  const startOfMonth = `${format(now(), 'yyyy-MM')}-01`;
  const paymentsData = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('school_id', schoolId)
      .gte('created_at', startOfMonth);
    if (error) throw error;
    return data;
  });
  const collectedThisMonth = (paymentsData || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Total outstanding from invoices
  const outstandingData = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('balance, status')
      .eq('school_id', schoolId)
      .gt('balance', 0);
    if (error) throw error;
    return data;
  });
  const totalOutstanding = (outstandingData || []).reduce((sum, i) => sum + (Number(i.balance) || 0), 0);
  const defaulters = (outstandingData || []).filter(i => i.status === 'overdue' || i.status === 'partial').length;

  // Income this month
  const incomeData = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('income')
      .select('amount')
      .eq('school_id', schoolId)
      .gte('date', startOfMonth);
    if (error) throw error;
    return data;
  });
  const thisMonthIncome = (incomeData || []).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  // Leaves
  const leavesData = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('id, status, start_date')
      .eq('school_id', schoolId)
      .eq('status', 'pending');
    if (error) throw error;
    return data;
  });
  const pendingApprovals = leavesData?.length || 0;
  const pendingToday = (leavesData || []).filter(l => l.start_date === today).length;

  // Capacity
  const maxCapacity = schoolSettings?.max_students || schoolSettings?.max_students_capacity || 500;
  const capacityPercent = maxCapacity > 0 ? Math.round((totalStudents / maxCapacity) * 100) : 0;

  // Fees collected this term
  const termPayments = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('school_id', schoolId)
      .gte('created_at', termStart || '2000-01-01');
    if (error) throw error;
    return data;
  });
  const collectedThisTerm = (termPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Term target
  const feeStructures = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('fee_structures')
      .select('amount')
      .eq('school_id', schoolId)
      .eq('status', 'active');
    if (error) throw error;
    return data;
  });
  const termTarget = (feeStructures || []).reduce((sum, f) => sum + (Number(f.amount) || 0), 0) * totalStudents;

  return {
    students: { total: totalStudents, newThisTerm, boarding: boardingCount, day: dayCount },
    staff: { total: totalStaff, active: activeStaff, onLeave: onLeaveStaff },
    attendance: { rate: attendanceRate, present, absent, late },
    fees: {
      collectedThisMonth,
      totalOutstanding,
      defaulters,
      collectedThisTerm,
      termTarget,
    },
    income: { thisMonth: thisMonthIncome },
    leaves: { pendingToday, pendingApprovals },
    capacity: { enrolled: totalStudents, total: maxCapacity, percent: capacityPercent },
  };
}

async function getFinancialPerformance(schoolId, days = 25) {
  if (!schoolId) throw new Error('school_id is required');
  const since = format(subDays(now(), days), 'yyyy-MM-dd');

  const data = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, created_at')
      .eq('school_id', schoolId)
      .gte('created_at', since)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  });

  const map = new Map();
  for (let i = 0; i <= days; i++) {
    const d = format(subDays(now(), days - i), 'yyyy-MM-dd');
    map.set(d, 0);
  }
  (data || []).forEach(p => {
    const dateKey = p.created_at ? p.created_at.split('T')[0] : null;
    if (dateKey && map.has(dateKey)) {
      map.set(dateKey, map.get(dateKey) + (Number(p.amount) || 0));
    } else if (dateKey && !map.has(dateKey)) {
      map.set(dateKey, Number(p.amount) || 0);
    }
  });

  return Array.from(map.entries()).map(([date, collected]) => ({ date, collected })).sort((a, b) => a.date.localeCompare(b.date));
}

async function getActivity(schoolId, limit = 20) {
  if (!schoolId) throw new Error('school_id is required');

  const data = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, action, entity_type, details, created_at, actor_name')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  });

  const colorMap = {
    attendance: '#22c55e',
    fee: '#3b82f6',
    admission: '#8b5cf6',
    marks: '#f59e0b',
    notice: '#06b6d4',
    leave: '#ec4899',
    system: '#6b7280',
  };

  return (data || []).map(item => {
    const type = String(item.entity_type || item.action || 'system').toLowerCase();
    const mappedType = (['attendance', 'fee', 'admission', 'marks', 'notice', 'leave', 'system'].find(t => type.includes(t))) || 'system';
    const time = item.created_at ? item.created_at.split('T')[1]?.slice(0, 8) || '' : '';
    let text = item.details?.message || `${item.action} on ${item.entity_type}`;
    if (mappedType === 'attendance') text = item.details?.message || `Attendance Marked: ${item.actor_name || 'Staff'} recorded attendance`;
    if (mappedType === 'fee') text = item.details?.message || `Fee Collected: ${item.details?.student_name || 'Student'} - GHS${item.details?.amount || 0}`;
    if (mappedType === 'admission') text = item.details?.message || `Student Admitted: ${item.details?.student_name || 'New student'}`;
    if (mappedType === 'marks') text = item.details?.message || `Marks Entered: ${item.details?.subject || 'Subject'} by ${item.actor_name || 'Teacher'}`;

    return {
      id: item.id,
      type: mappedType,
      text,
      timestamp: time,
      createdAt: item.created_at,
      color: colorMap[mappedType] || colorMap.system,
    };
  });
}

async function getBirthdays(schoolId, days = 7) {
  if (!schoolId) throw new Error('school_id is required');

  const data = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('students')
      .select('id, class_name, admission_no')
      .eq('school_id', schoolId)
      .limit(50);
    if (error) throw error;
    return data;
  });

  return [];
}

async function getAlerts(schoolId) {
  if (!schoolId) throw new Error('school_id is required');
  const alerts = [];

  // Fees defaulters alert
  const outstanding = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('balance, status')
      .eq('school_id', schoolId)
      .gt('balance', 0);
    if (error) throw error;
    return data;
  });
  const defaulters = (outstanding || []).filter(i => i.status === 'overdue').length;
  if (defaulters > 0) {
    alerts.push({
      type: defaulters > 20 ? 'critical' : 'warning',
      message: `${defaulters} student${defaulters > 1 ? 's' : ''} have overdue fees.`,
      cta: 'Review',
      ctaLink: '/dashboard/fees',
    });
  }

  // Attendance alert
  const today = todayStr();
  const attToday = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('school_id', schoolId)
      .eq('date', today);
    if (error) throw error;
    return data;
  });
  const totalAtt = attToday?.length || 0;
  const presentAtt = (attToday || []).filter(a => a.status === 'present').length;
  const rate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;
  if (rate < 75) {
    alerts.push({
      type: 'warning',
      message: `Today's attendance rate is ${rate}%, below the recommended 75%.`,
      cta: 'View',
      ctaLink: '/dashboard/attendance',
    });
  }

  // Upcoming exams from assessments
  const upcomingExams = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('assessments')
      .select('id')
      .eq('school_id', schoolId)
      .gte('date', today)
      .lte('date', format(subDays(now(), -7), 'yyyy-MM-dd'));
    if (error) throw error;
    return data;
  });
  if (upcomingExams && upcomingExams.length > 0) {
    alerts.push({
      type: 'info',
      message: `${upcomingExams.length} upcoming exam${upcomingExams.length > 1 ? 's' : ''} scheduled this week.`,
      cta: 'View',
      ctaLink: '/dashboard/assessments',
    });
  }

  return alerts;
}

async function getStaffToday(schoolId) {
  if (!schoolId) throw new Error('school_id is required');
  const today = todayStr();

  const data = await safeQuery(async () => {
    const { data, error } = await supabase
      .from('staff_attendance')
      .select('status')
      .eq('school_id', schoolId)
      .eq('date', today);
    if (error) throw error;
    return data;
  });

  const present = (data || []).filter(d => d.status === 'present').length;
  const absent = (data || []).filter(d => d.status === 'absent').length;
  const late = (data || []).filter(d => d.status === 'late').length;
  const onLeave = (data || []).filter(d => d.status === 'on_leave').length;

  const absentList = [];

  return { present, absent, onLeave, late, absentList };
}

module.exports = {
  getStats,
  getFinancialPerformance,
  getActivity,
  getBirthdays,
  getAlerts,
  getStaffToday,
};
