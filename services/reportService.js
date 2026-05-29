const crypto = require('crypto');
const supabase = require('../config/db');

class ReportService {
    // ─── 1. Student Attendance Report ────────────────────────────
    async getAttendanceReport(schoolId, filters = {}) {
        let query = supabase.from('attendance')
            .select('*, student:students(name, admission_no, class_name)', { count: 'exact' })
            .eq('school_id', schoolId);

        if (filters.date_from) query = query.gte('date', filters.date_from);
        if (filters.date_to) query = query.lte('date', filters.date_to);
        if (filters.class_name) query = query.eq('class_name', filters.class_name);
        if (filters.status) query = query.eq('status', filters.status);

        const page = Math.max(1, Number.parseInt(filters.page) || 1);
        const limit = Math.min(500, Math.max(1, Number.parseInt(filters.limit) || 50));
        query = query.order('date', { ascending: false }).range((page - 1) * limit, page * limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        const records = data || [];

        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const excused = records.filter(r => r.status === 'Excused' || r.status === 'Half-day').length;
        const total = records.length;

        return {
            summary: { total, present, absent, late, excused, presentRate: total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0 },
            records,
            totalRecords: count || 0,
            page,
            limit,
        };
    }

    // ─── 2. Staff Attendance Report ──────────────────────────────
    async getStaffAttendanceReport(schoolId, filters = {}) {
        let query = supabase.from('staff_attendance')
            .select('*, user:users(name, email, role)', { count: 'exact' })
            .eq('school_id', schoolId);

        if (filters.date_from) query = query.gte('date', filters.date_from);
        if (filters.date_to) query = query.lte('date', filters.date_to);
        if (filters.user_id) query = query.eq('user_id', filters.user_id);
        if (filters.status) query = query.eq('status', filters.status);

        const page = Math.max(1, Number.parseInt(filters.page) || 1);
        const limit = Math.min(500, Math.max(1, Number.parseInt(filters.limit) || 50));
        query = query.order('date', { ascending: false }).range((page - 1) * limit, page * limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        const records = data || [];

        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const total = records.length;

        const uniqueStaff = new Set(records.map(r => r.user_id)).size;

        return {
            summary: { total, present, absent, late, presentRate: total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0, uniqueStaff },
            records,
            totalRecords: count || 0,
            page,
            limit,
        };
    }

    // ─── 3. Academic Performance Report ──────────────────────────
    async getAcademicPerformanceReport(schoolId, filters = {}) {
        let query = supabase.from('assessments')
            .select('id, name, date, max_score, class_id, subject_id, assessment_type_id, status, subject:subjects(name), class:classes(name), type:assessment_types(name)')
            .eq('school_id', schoolId);

        if (filters.term_id) query = query.eq('term_id', filters.term_id);
        if (filters.class_id) query = query.eq('class_id', filters.class_id);
        if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);
        if (filters.date_from) query = query.gte('date', filters.date_from);
        if (filters.date_to) query = query.lte('date', filters.date_to);

        const { data: assessments, error: aErr } = await query;
        if (aErr) throw aErr;
        if (!assessments || assessments.length === 0) {
            return { summary: { totalAssessments: 0, avgScore: 0, totalStudents: 0, passRate: 0 }, subjectBreakdown: [], records: [] };
        }

        const ids = assessments.map(a => a.id);
        const { data: scores, error: sErr } = await supabase.from('assessment_scores')
            .select('assessment_id, student_id, score')
            .in('assessment_id', ids)
            .eq('school_id', schoolId);
        if (sErr) throw sErr;

        const scoreMap = {};
        (scores || []).forEach(s => {
            if (!scoreMap[s.assessment_id]) scoreMap[s.assessment_id] = [];
            scoreMap[s.assessment_id].push(Number(s.score));
        });

        const studentSet = new Set((scores || []).map(s => s.student_id));
        let totalPct = 0;
        let subjectAgg = {};
        let passCount = 0;
        let totalScored = 0;

        const records = assessments.map(a => {
            const s = scoreMap[a.id] || [];
            const avg = s.length > 0 ? s.reduce((sum, v) => sum + v, 0) / s.length : 0;
            const pct = a.max_score > 0 ? (avg / Number(a.max_score)) * 100 : 0;
            totalPct += pct;
            totalScored += 1;
            if (pct >= 50) passCount += 1;

            const subjId = a.subject_id;
            if (!subjectAgg[subjId]) subjectAgg[subjId] = { subject_id: subjId, subject_name: a.subject?.name || 'Unknown', totalPct: 0, count: 0, totalStudents: 0 };
            subjectAgg[subjId].totalPct += pct;
            subjectAgg[subjId].count += 1;
            subjectAgg[subjId].totalStudents += s.length;

            return {
                assessment_id: a.id,
                name: a.name,
                date: a.date,
                class: a.class?.name,
                subject: a.subject?.name,
                type: a.type?.name,
                max_score: a.max_score,
                average: Number(avg.toFixed(1)),
                studentCount: s.length,
                rate: Number(pct.toFixed(1)),
                status: a.status,
            };
        });

        return {
            summary: {
                totalAssessments: assessments.length,
                avgScore: totalScored > 0 ? Number((totalPct / totalScored).toFixed(1)) : 0,
                totalStudents: studentSet.size,
                passRate: totalScored > 0 ? Number(((passCount / totalScored) * 100).toFixed(1)) : 0,
            },
            subjectBreakdown: Object.values(subjectAgg).map(s => ({
                ...s,
                avgRate: s.count > 0 ? Number((s.totalPct / s.count).toFixed(1)) : 0,
            })).sort((a, b) => b.avgRate - a.avgRate),
            records: records.sort((a, b) => a.date.localeCompare(b.date)),
        };
    }

    // ─── 4. Class Comparison Report ──────────────────────────────
    async getClassComparisonReport(schoolId, filters = {}) {
        const { term_id } = filters;
        if (!term_id) throw Object.assign(new Error('term_id is required'), { statusCode: 400 });

        const { data: assessments, error: aErr } = await supabase.from('assessments')
            .select('id, class_id, max_score')
            .eq('school_id', schoolId)
            .eq('term_id', term_id);
        if (aErr) throw aErr;
        if (!assessments || assessments.length === 0) return { summary: [], records: [] };

        const ids = assessments.map(a => a.id);
        const { data: scores, error: sErr } = await supabase.from('assessment_scores')
            .select('assessment_id, student_id, score')
            .in('assessment_id', ids)
            .eq('school_id', schoolId);
        if (sErr) throw sErr;

        const classIds = [...new Set(assessments.map(a => a.class_id))];
        const { data: classes } = await supabase.from('classes').select('id, name').in('id', classIds);
        const classMap = (classes || []).reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});

        const classData = {};
        assessments.forEach(a => {
            if (!classData[a.class_id]) classData[a.class_id] = { class_id: a.class_id, class_name: classMap[a.class_id] || 'Unknown', totalPct: 0, count: 0, studentSet: new Set(), totalMax: 0 };
            classData[a.class_id].totalMax += Number(a.max_score);
        });

        (scores || []).forEach(s => {
            const a = assessments.find(ass => ass.id === s.assessment_id);
            if (a && classData[a.class_id]) {
                classData[a.class_id].studentSet.add(s.student_id);
            }
        });

        const records = await Promise.all(Object.entries(classData).map(async ([classId, cd]) => {
            const classScores = (scores || []).filter(s => {
                const a = assessments.find(ass => ass.id === s.assessment_id && ass.class_id === classId);
                return !!a;
            });
            const avgPct = classScores.length > 0 && cd.totalMax > 0
                ? Number((classScores.reduce((s, sc) => s + (Number(sc.score) / (assessments.find(a => a.id === sc.assessment_id)?.max_score || 1)) * 100, 0) / classScores.length).toFixed(1))
                : 0;

            return {
                class_id: classId,
                class_name: cd.class_name,
                totalAssessments: assessments.filter(a => a.class_id === classId).length,
                studentCount: cd.studentSet.size,
                avgRate: avgPct,
            };
        }));

        return {
            summary: { totalClasses: records.length, avgRateAll: records.length > 0 ? Number((records.reduce((s, r) => s + r.avgRate, 0) / records.length).toFixed(1)) : 0 },
            records: records.sort((a, b) => b.avgRate - a.avgRate),
        };
    }

    // ─── 5. Subject Performance Report ───────────────────────────
    async getSubjectPerformanceReport(schoolId, filters = {}) {
        const { term_id } = filters;
        if (!term_id) throw Object.assign(new Error('term_id is required'), { statusCode: 400 });

        const { data: assessments, error: aErr } = await supabase.from('assessments')
            .select('id, subject_id, max_score, subject:subjects(name, code)')
            .eq('school_id', schoolId)
            .eq('term_id', term_id);
        if (aErr) throw aErr;
        if (!assessments || assessments.length === 0) return { summary: [], records: [], assessmentBreakdown: [] };

        const ids = assessments.map(a => a.id);
        const { data: scores, error: sErr } = await supabase.from('assessment_scores')
            .select('assessment_id, student_id, score')
            .in('assessment_id', ids)
            .eq('school_id', schoolId);
        if (sErr) throw sErr;

        const subjData = {};
        const assMap = {};

        assessments.forEach(a => {
            const sid = a.subject_id;
            if (!subjData[sid]) subjData[sid] = { subject_id: sid, subject_name: a.subject?.name || 'Unknown', code: a.subject?.code, totalPct: 0, count: 0, studentSet: new Set(), totalScore: 0, totalMax: 0 };
            subjData[sid].totalMax += Number(a.max_score);
            if (!assMap[a.id]) assMap[a.id] = { ...a, scores: [] };
        });

        (scores || []).forEach(s => {
            subjData[s.assessment_id]?.studentSet.add(s.student_id);
            if (assMap[s.assessment_id]) assMap[s.assessment_id].scores.push(s);
        });

        const records = Object.values(subjData).map(sd => {
            let scoreSum = 0;
            let scoreCount = 0;
            assessments.filter(a => a.subject_id === sd.subject_id).forEach(a => {
                const assScores = assMap[a.id]?.scores || [];
                if (assScores.length > 0) {
                    const avg = assScores.reduce((sum, sc) => sum + Number(sc.score), 0) / assScores.length;
                    scoreSum += (avg / Number(a.max_score)) * 100;
                    scoreCount += 1;
                }
            });
            return {
                ...sd,
                avgRate: scoreCount > 0 ? Number((scoreSum / scoreCount).toFixed(1)) : 0,
                studentCount: sd.studentSet.size,
            };
        }).sort((a, b) => b.avgRate - a.avgRate);

        return {
            summary: { totalSubjects: records.length, avgRateAll: records.length > 0 ? Number((records.reduce((s, r) => s + r.avgRate, 0) / records.length).toFixed(1)) : 0 },
            records,
            assessmentBreakdown: Object.values(assMap).map(a => ({
                assessment_id: a.id,
                name: a.name,
                subject: a.subject?.name,
                max_score: a.max_score,
                studentCount: a.scores.length,
                avgScore: a.scores.length > 0 ? Number((a.scores.reduce((sum, s) => sum + Number(s.score), 0) / a.scores.length).toFixed(1)) : 0,
                rate: a.max_score > 0 && a.scores.length > 0 ? Number(((a.scores.reduce((sum, s) => sum + Number(s.score), 0) / a.scores.length / Number(a.max_score)) * 100).toFixed(1)) : 0,
            })).sort((a, b) => a.rate - b.rate),
        };
    }

    // ─── 6. Fee Collection Report ────────────────────────────────
    async getFeeCollectionReport(schoolId, filters = {}) {
        let payQuery = supabase.from('payments')
            .select('*, student:students(name, admission_no, class_name), invoice:invoices(invoice_number, total_amount)')
            .eq('school_id', schoolId);

        if (filters.date_from) payQuery = payQuery.gte('payment_date', filters.date_from);
        if (filters.date_to) payQuery = payQuery.lte('payment_date', filters.date_to);
        if (filters.status) payQuery = payQuery.eq('status', filters.status);
        if (filters.payment_method) payQuery = payQuery.eq('payment_method', filters.payment_method);

        payQuery = payQuery.order('payment_date', { ascending: false });

        const { data: payments, error: payErr } = await payQuery;
        if (payErr) throw payErr;

        const totalCollected = (payments || []).filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
        const totalFailed = (payments || []).filter(p => p.status === 'failed').reduce((s, p) => s + Number(p.amount), 0);
        const totalPending = (payments || []).filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);

        const monthlyMap = {};
        (payments || []).forEach(p => {
            if (p.status !== 'completed') return;
            const key = p.payment_date.substring(0, 7);
            if (!monthlyMap[key]) monthlyMap[key] = { month: key, amount: 0, count: 0 };
            monthlyMap[key].amount += Number(p.amount);
            monthlyMap[key].count += 1;
        });

        const methodMap = {};
        (payments || []).forEach(p => {
            if (p.status !== 'completed') return;
            const m = p.payment_method || 'other';
            if (!methodMap[m]) methodMap[m] = { method: m, amount: 0, count: 0 };
            methodMap[m].amount += Number(p.amount);
            methodMap[m].count += 1;
        });

        return {
            summary: {
                totalCollected,
                totalFailed,
                totalPending,
                paymentCount: (payments || []).length,
                completedCount: (payments || []).filter(p => p.status === 'completed').length,
                failedCount: (payments || []).filter(p => p.status === 'failed').length,
            },
            monthly: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)),
            byMethod: Object.values(methodMap),
            records: (payments || []).slice(0, 500),
        };
    }

    // ─── 7. Outstanding Balance Report ───────────────────────────
    async getOutstandingBalanceReport(schoolId, filters = {}) {
        let query = supabase.from('invoices')
            .select('*, student:students(name, admission_no, class_name, parent_name, parent_phone), class:classes(name), term:academic_terms(name)')
            .eq('school_id', schoolId)
            .not('status', 'in', '("paid","cancelled")')
            .order('due_date', { ascending: true });

        if (filters.date_from) query = query.gte('due_date', filters.date_from);
        if (filters.date_to) query = query.lte('due_date', filters.date_to);
        if (filters.class_name) {
            const { data: cls } = await supabase.from('classes').select('id').eq('name', filters.class_name).single();
            if (cls) query = query.eq('class_id', cls.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        const now = new Date().toISOString().split('T')[0];
        let totalBalance = 0;
        let overdueCount = 0;
        let overdueAmount = 0;

        const records = (data || []).map(inv => {
            const balance = Number(inv.total_amount) - Number(inv.paid_amount);
            const daysOverdue = inv.due_date < now
                ? Math.floor((new Date(now).getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))
                : 0;
            if (balance > 0) totalBalance += balance;
            if (daysOverdue > 0) { overdueCount += 1; overdueAmount += balance; }
            return { ...inv, balance, daysOverdue };
        }).filter(inv => inv.balance > 0);

        return {
            summary: { totalOutstanding: totalBalance, overdueCount, overdueAmount, invoiceCount: records.length },
            records,
        };
    }

    // ─── 8. Admissions / Enrollment Report ───────────────────────
    async getAdmissionsReport(schoolId, filters = {}) {
        let query = supabase.from('students')
            .select('id, name, admission_no, class_name, gender, created_at, is_active', { count: 'exact' })
            .eq('school_id', schoolId);

        if (filters.date_from) query = query.gte('created_at', filters.date_from);
        if (filters.date_to) query = query.lte('created_at', filters.date_to);
        if (filters.class_name) query = query.eq('class_name', filters.class_name);
        if (filters.gender) query = query.eq('gender', filters.gender);

        const { data: students, count, error } = await query;
        if (error) throw error;

        const totalActive = (students || []).filter(s => s.is_active !== false).length;
        const maleCount = (students || []).filter(s => s.gender === 'Male').length;
        const femaleCount = (students || []).filter(s => s.gender === 'Female').length;

        const monthlyMap = {};
        const classMap = {};

        (students || []).forEach(s => {
            const month = (s.created_at || '').substring(0, 7);
            if (month) {
                if (!monthlyMap[month]) monthlyMap[month] = { month, count: 0 };
                monthlyMap[month].count += 1;
            }
            const cls = s.class_name || 'Unassigned';
            if (!classMap[cls]) classMap[cls] = { class_name: cls, count: 0 };
            classMap[cls].count += 1;
        });

        return {
            summary: {
                totalStudents: count || 0,
                totalActive,
                maleCount,
                femaleCount,
                unassigned: (students || []).filter(s => !s.class_name).length,
            },
            monthly: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)),
            byClass: Object.values(classMap).sort((a, b) => b.count - a.count),
            records: (students || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        };
    }

    // ─── 9. Incidents / Disciplinary Report ──────────────────────
    async getIncidentsReport(schoolId, filters = {}) {
        let query = supabase.from('interventions')
            .select('*, student:students(name, admission_no, class_name), assigned:users!assigned_to(name), creator:users!created_by(name)')
            .eq('school_id', schoolId);

        if (filters.date_from) query = query.gte('created_at', filters.date_from);
        if (filters.date_to) query = query.lte('created_at', filters.date_to);
        if (filters.type) query = query.eq('type', filters.type);
        if (filters.severity) query = query.eq('severity', filters.severity);
        if (filters.status) query = query.eq('status', filters.status);

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        const records = data || [];

        const byType = {};
        const bySeverity = {};
        const byStatus = {};
        let openCount = 0;
        let resolvedCount = 0;

        records.forEach(r => {
            byType[r.type] = (byType[r.type] || 0) + 1;
            bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1;
            byStatus[r.status] = (byStatus[r.status] || 0) + 1;
            if (r.status === 'open' || r.status === 'in_progress') openCount += 1;
            if (r.status === 'resolved') resolvedCount += 1;
        });

        return {
            summary: {
                total: records.length,
                openCount,
                resolvedCount,
                byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
                bySeverity: Object.entries(bySeverity).map(([severity, count]) => ({ severity, count })),
                byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
            },
            records,
        };
    }

    // ─── 10. User Activity Report ────────────────────────────────
    async getActivityReport(schoolId, filters = {}) {
        let query = supabase.from('audit_logs')
            .select('*, user:users(name, email, role)', { count: 'exact' })
            .eq('school_id', schoolId);

        if (filters.date_from) query = query.gte('created_at', filters.date_from);
        if (filters.date_to) query = query.lte('created_at', filters.date_to);
        if (filters.action) query = query.eq('action', filters.action);
        if (filters.resource) query = query.eq('resource', filters.resource);
        if (filters.user_id) query = query.eq('user_id', filters.user_id);

        const page = Math.max(1, Number.parseInt(filters.page) || 1);
        const limit = Math.min(200, Math.max(1, Number.parseInt(filters.limit) || 50));
        query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        const records = data || [];

        const byAction = {};
        const byResource = {};
        const byUser = {};
        records.forEach(r => {
            byAction[r.action] = (byAction[r.action] || 0) + 1;
            byResource[r.resource] = (byResource[r.resource] || 0) + 1;
            const uid = r.user_id || 'system';
            if (!byUser[uid]) byUser[uid] = { user_id: uid, name: r.user?.name || 'System', count: 0 };
            byUser[uid].count += 1;
        });

        return {
            summary: {
                total: count || 0,
                byAction: Object.entries(byAction).map(([action, count]) => ({ action, count })),
                byResource: Object.entries(byResource).map(([resource, count]) => ({ resource, count })),
                byUser: Object.values(byUser).sort((a, b) => b.count - a.count),
            },
            records,
            page,
            limit,
        };
    }

    // ─── CSV Export ──────────────────────────────────────────────
    async exportReportCsv(schoolId, reportType, filters = {}) {
        let rows = [];

        switch (reportType) {
            case 'attendance': {
                const report = await this.getAttendanceReport(schoolId, { ...filters, limit: 10000 });
                rows = report.records.map(r => ({
                    Date: r.date,
                    Student: r.student?.name || '',
                    Class: r.class_name || '',
                    Status: r.status,
                    'Admission No': r.student?.admission_no || '',
                }));
                break;
            }
            case 'staff-attendance': {
                const report = await this.getStaffAttendanceReport(schoolId, { ...filters, limit: 10000 });
                rows = report.records.map(r => ({
                    Date: r.date,
                    Staff: r.user?.name || '',
                    Email: r.user?.email || '',
                    Status: r.status,
                    'Check In': r.check_in || '',
                    'Check Out': r.check_out || '',
                }));
                break;
            }
            case 'fee-collection': {
                const report = await this.getFeeCollectionReport(schoolId, filters);
                rows = report.records.map(p => ({
                    Date: p.payment_date,
                    Student: p.student?.name || '',
                    Invoice: p.invoice?.invoice_number || '',
                    Amount: (p.amount / 100).toFixed(2),
                    Method: p.payment_method,
                    Status: p.status,
                    Reference: p.reference || '',
                }));
                break;
            }
            case 'outstanding': {
                const report = await this.getOutstandingBalanceReport(schoolId, filters);
                rows = report.records.map(inv => ({
                    Student: inv.student?.name || '',
                    Class: inv.class?.name || '',
                    Invoice: inv.invoice_number,
                    'Due Date': inv.due_date,
                    'Total (GHS)': (inv.total_amount / 100).toFixed(2),
                    'Paid (GHS)': (inv.paid_amount / 100).toFixed(2),
                    'Balance (GHS)': (inv.balance / 100).toFixed(2),
                    'Days Overdue': inv.daysOverdue,
                }));
                break;
            }
            case 'admissions': {
                const report = await this.getAdmissionsReport(schoolId, filters);
                rows = report.records.map(s => ({
                    Name: s.name,
                    'Admission No': s.admission_no || '',
                    Class: s.class_name || '',
                    Gender: s.gender || '',
                    'Enrolled At': s.created_at || '',
                    Active: s.is_active !== false ? 'Yes' : 'No',
                }));
                break;
            }
            case 'incidents': {
                const report = await this.getIncidentsReport(schoolId, filters);
                rows = report.records.map(r => ({
                    Date: r.created_at,
                    Student: r.student?.name || '',
                    Type: r.type,
                    Severity: r.severity,
                    Status: r.status,
                    'Assigned To': r.assigned?.name || '',
                    Notes: r.notes || '',
                }));
                break;
            }
            case 'activity': {
                const report = await this.getActivityReport(schoolId, { ...filters, limit: 10000 });
                rows = report.records.map(r => ({
                    'Timestamp': r.created_at,
                    User: r.user?.name || 'System',
                    Action: r.action,
                    Resource: r.resource,
                    'Resource ID': r.resource_id || '',
                    'IP Address': r.ip_address || '',
                }));
                break;
            }
            default:
                throw Object.assign(new Error(`Unknown report type: ${reportType}`), { statusCode: 400 });
        }

        if (rows.length === 0) return [];
        const headers = Object.keys(rows[0]);
        const csvLines = rows.map(row =>
            headers.map(h => {
                const val = String(row[h] ?? '');
                return val.includes(',') || val.includes('"') || val.includes('\n')
                    ? `"${val.replace(/"/g, '""')}"`
                    : val;
            }).join(',')
        );
        return [headers.join(','), ...csvLines].join('\n');
    }
}

module.exports = new ReportService();
