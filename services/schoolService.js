const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const supabase = require('../config/db');

const USER_PUBLIC_COLUMNS = 'id, tenant_id, name, email, phone, role, is_active, created_at';
const TEACHER_WRITE_FIELDS = ['name', 'email', 'phone', 'is_active'];

const pickFields = (payload = {}, fields = []) => fields.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
        acc[field] = payload[field];
    }
    return acc;
}, {});

const buildTeacherPayload = async (payload = {}) => {
    const cleanPayload = pickFields(payload, TEACHER_WRITE_FIELDS);

    if (payload.password) {
        cleanPayload.password = await bcrypt.hash(String(payload.password), 12);
    }

    return cleanPayload;
};

class SchoolService {
    async getStudents(tenantId, page, limit, className) {
        let query = supabase.from('students').select('*', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .range((page - 1) * limit, page * limit - 1);
            
        if (className) query = query.eq('class_name', className);
        
        const { data, count, error } = await query;
        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return { students: data, count: count || 0 };
    }

    async getStudentCount(tenantId) {
        const { count, error } = await supabase.from('students').select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('is_active', true);
            
        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return count || 0;
    }

    async createStudent(tenantId, studentPayload) {
        const { data, error } = await supabase.from('students')
            .insert({ 
                id: crypto.randomUUID(),
                ...studentPayload, 
                tenant_id: tenantId 
            })
            .select()
            .single();
            
        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return data;
    }

    async getAttendance(tenantId, date, className) {
        let query = supabase.from('attendance').select('*').eq('tenant_id', tenantId).limit(100);
        if (date) query = query.eq('date', date);
        if (className) query = query.eq('class_name', className);
        
        const { data, error } = await query;
        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return data || [];
    }

    async getFees(tenantId, status) {
        let query = supabase.from('fees').select('*').eq('tenant_id', tenantId).limit(100);
        if (status) query = query.eq('status', status);
        
        const { data, error } = await query;
        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return data || [];
    }

    async getDashboardStats(tenantId) {
        // Run queries in parallel for performance
        const [studentsRes, teachersRes, attendanceRes, activityRes] = await Promise.all([
            supabase.from('students').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('role', 'teacher'),
            supabase.from('attendance').select('status').eq('tenant_id', tenantId).eq('date', new Date().toISOString().split('T')[0]),
            supabase.from('students').select('name, class_name, created_at').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(5)
        ]);

        const attendance = attendanceRes.data || [];
        const presentCount = attendance.filter(a => a.status === 'Present').length;
        const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

        return {
            totalStudents: studentsRes.count || 0,
            totalTeachers: teachersRes.count || 0,
            attendanceRate: attendanceRate.toFixed(1),
            recentActivity: activityRes.data || []
        };
    }

    // ─── Teachers ────────────────────────────────────────────────
    async getTeachers(tenantId) {
        const { data, error } = await supabase.from('users')
            .select(USER_PUBLIC_COLUMNS)
            .eq('tenant_id', tenantId)
            .eq('role', 'teacher');
        if (error) throw error;
        return data || [];
    }

    async createTeacher(tenantId, payload) {
        const teacherPayload = await buildTeacherPayload(payload);
        const { data, error } = await supabase.from('users')
            .insert({ 
                id: crypto.randomUUID(),
                ...teacherPayload,
                role: 'teacher',
                tenant_id: tenantId 
            })
            .select(USER_PUBLIC_COLUMNS)
            .single();
        if (error) throw error;
        return data;
    }

    async updateTeacher(tenantId, id, payload) {
        const teacherPayload = await buildTeacherPayload(payload);
        const { data, error } = await supabase.from('users')
            .update(teacherPayload)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .eq('role', 'teacher')
            .select(USER_PUBLIC_COLUMNS)
            .single();
        if (error) throw error;
        return data;
    }

    async deleteTeacher(tenantId, id) {
        const { error } = await supabase.from('users')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);
        if (error) throw error;
        return true;
    }

    // ─── Classes ─────────────────────────────────────────────────
    async getClasses(tenantId) {
        const { data, error } = await supabase.from('classes')
            .select('*')
            .eq('tenant_id', tenantId);
        if (error) throw error;
        return data || [];
    }

    async createClass(tenantId, payload) {
        const { data, error } = await supabase.from('classes')
            .insert({ 
                id: crypto.randomUUID(),
                ...payload, 
                tenant_id: tenantId 
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Attendance ──────────────────────────────────────────────
    async submitAttendance(tenantId, records) {
        // records is an array of { student_id, date, status, class_name }
        const payload = records.map(r => ({
            id: crypto.randomUUID(),
            ...r,
            tenant_id: tenantId
        }));
        const { data, error } = await supabase.from('attendance')
            .insert(payload)
            .select();
        if (error) throw error;
        return data;
    }

    // ─── Library ─────────────────────────────────────────────────
    async getBooks(tenantId) {
        const { data, error } = await supabase.from('library_books')
            .select('*')
            .eq('tenant_id', tenantId);
        if (error) throw error;
        return data || [];
    }

    async addBook(tenantId, payload) {
        const { data, error } = await supabase.from('library_books')
            .insert({ id: crypto.randomUUID(), ...payload, tenant_id: tenantId })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async issueBook(tenantId, payload) {
        const { data, error } = await supabase.from('library_issues')
            .insert({ id: crypto.randomUUID(), ...payload, tenant_id: tenantId, status: 'issued' })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async returnBook(tenantId, issueId) {
        const { data, error } = await supabase.from('library_issues')
            .update({ status: 'returned', returned_at: new Date().toISOString() })
            .eq('id', issueId)
            .eq('tenant_id', tenantId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Timetable ───────────────────────────────────────────────
    async getTimetable(tenantId) {
        const { data, error } = await supabase.from('timetable')
            .select('*')
            .eq('tenant_id', tenantId);
        if (error) throw error;
        return data || [];
    }

    async assignPeriod(tenantId, payload) {
        const { data, error } = await supabase.from('timetable')
            .insert({ id: crypto.randomUUID(), ...payload, tenant_id: tenantId })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Payroll ─────────────────────────────────────────────────
    async getPayroll(tenantId) {
        const { data, error } = await supabase.from('payroll')
            .select('*')
            .eq('tenant_id', tenantId);
        if (error) throw error;
        return data || [];
    }

    async runPayroll(tenantId, payload) {
        const { data, error } = await supabase.from('payroll')
            .insert({ id: crypto.randomUUID(), ...payload, tenant_id: tenantId, status: 'processed' })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Notifications ───────────────────────────────────────────
    async getNotificationLogs(tenantId) {
        const { data, error } = await supabase.from('notification_logs')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async broadcastNotification(tenantId, payload) {
        const { data, error } = await supabase.from('notification_logs')
            .insert({ id: crypto.randomUUID(), ...payload, tenant_id: tenantId })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Subjects ──────────────────────────────────────────────────
    async getSubjects(schoolId) {
        const { data, error } = await supabase.from('subjects')
            .select('*')
            .eq('school_id', schoolId)
            .order('name');
        if (error) throw error;
        return data || [];
    }

    async createSubject(schoolId, payload) {
        const { data, error } = await supabase.from('subjects')
            .insert({ id: crypto.randomUUID(), ...payload, school_id: schoolId })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateSubject(schoolId, id, payload) {
        const { data, error } = await supabase.from('subjects')
            .update(payload)
            .eq('id', id)
            .eq('school_id', schoolId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteSubject(schoolId, id) {
        const { error } = await supabase.from('subjects')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);
        if (error) throw error;
        return true;
    }

    // ─── Terms ─────────────────────────────────────────────────
    async getTerms(schoolId) {
        const { data, error } = await supabase.from('academic_terms')
            .select('*')
            .eq('school_id', schoolId)
            .order('start_date', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async createTerm(schoolId, payload) {
        const { data, error } = await supabase.from('academic_terms')
            .insert({ id: crypto.randomUUID(), ...payload, school_id: schoolId })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateTerm(schoolId, id, payload) {
        const { data, error } = await supabase.from('academic_terms')
            .update(payload)
            .eq('id', id)
            .eq('school_id', schoolId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteTerm(schoolId, id) {
        const { error } = await supabase.from('academic_terms')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);
        if (error) throw error;
        return true;
    }

    // ─── Interventions ─────────────────────────────────────────────
    async getInterventions(schoolId, studentId) {
        let query = supabase.from('interventions')
            .select('*, student:students(name, class_name), assigned:users!assigned_to(full_name), creator:users!created_by(full_name)')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false });
        if (studentId) query = query.eq('student_id', studentId);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async createIntervention(schoolId, payload) {
        const { data, error } = await supabase.from('interventions')
            .insert({ id: crypto.randomUUID(), ...payload, school_id: schoolId })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateIntervention(schoolId, id, payload) {
        const { data, error } = await supabase.from('interventions')
            .update(payload)
            .eq('id', id)
            .eq('school_id', schoolId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Attendance Extended ───────────────────────────────────────
    async getAttendanceRecords(schoolId, filters = {}) {
        let query = supabase.from('attendance')
            .select('*, student:students(name, class_name)', { count: 'exact' })
            .eq('tenant_id', schoolId)
            .order('date', { ascending: false });

        if (filters.date) query = query.eq('date', filters.date);
        if (filters.class_name) query = query.eq('class_name', filters.class_name);
        if (filters.student_id) query = query.eq('student_id', filters.student_id);
        if (filters.status) query = query.eq('status', filters.status);

        const page = Math.max(1, Number.parseInt(filters.page) || 1);
        const limit = Math.min(200, Math.max(1, Number.parseInt(filters.limit) || 50));
        query = query.range((page - 1) * limit, page * limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { records: data || [], total: count || 0, page, limit };
    }

    async getAttendanceStats(schoolId, startDate, endDate) {
        const { data, error } = await supabase.from('attendance')
            .select('date, status')
            .eq('tenant_id', schoolId)
            .gte('date', startDate)
            .lte('date', endDate);
        if (error) throw error;
        return data || [];
    }

    async getAttendanceTrends(schoolId, startDate, endDate) {
        const { data, error } = await supabase.from('attendance')
            .select('date, status')
            .eq('tenant_id', schoolId)
            .gte('date', startDate)
            .lte('date', endDate);
        if (error) throw error;
        const daily = {};
        (data || []).forEach(r => {
            if (!daily[r.date]) daily[r.date] = { date: r.date, Present: 0, Absent: 0, Late: 0, Excused: 0, 'Half-day': 0, total: 0 };
            daily[r.date][r.status] = (daily[r.date][r.status] || 0) + 1;
            daily[r.date].total += 1;
        });
        return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));
    }

    async getRepeatedAbsences(schoolId, minConsecutive = 3) {
        const { data, error } = await supabase.from('attendance')
            .select('student_id, date, status, class_name, student:students(name, class_name, admission_no)')
            .eq('tenant_id', schoolId)
            .eq('status', 'Absent')
            .order('student_id', { ascending: true })
            .order('date', { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) return [];

        const grouped = {};
        (data || []).forEach(r => {
            if (!grouped[r.student_id]) grouped[r.student_id] = { student: r.student, records: [] };
            grouped[r.student_id].records.push(r);
        });

        const results = [];
        for (const [studentId, info] of Object.entries(grouped)) {
            let streak = 1;
            let streakStart = info.records[0].date;
            for (let i = 1; i < info.records.length; i++) {
                const prev = new Date(info.records[i - 1].date);
                const curr = new Date(info.records[i].date);
                const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
                if (diffDays === 1) {
                    streak++;
                } else {
                    if (streak >= minConsecutive) {
                        results.push({
                            student_id: studentId,
                            student: info.student,
                            streak,
                            start_date: streakStart,
                            end_date: info.records[i - 1].date,
                            records: info.records.slice(i - streak, i),
                        });
                    }
                    streak = 1;
                    streakStart = info.records[i].date;
                }
            }
            if (streak >= minConsecutive) {
                results.push({
                    student_id: studentId,
                    student: info.student,
                    streak,
                    start_date: streakStart,
                    end_date: info.records[info.records.length - 1].date,
                    records: info.records.slice(info.records.length - streak),
                });
            }
        }
        return results.sort((a, b) => b.streak - a.streak);
    }

    // ─── Staff Attendance ─────────────────────────────────────────
    async submitStaffAttendance(tenantId, records, markedBy) {
        const payload = records.map(r => ({
            id: crypto.randomUUID(),
            school_id: tenantId,
            user_id: r.user_id,
            date: r.date,
            status: r.status,
            check_in: r.check_in || null,
            check_out: r.check_out || null,
            notes: r.notes || null,
            marked_by: markedBy || null,
        }));
        const { data, error } = await supabase.from('staff_attendance')
            .insert(payload)
            .select('*, user:users(name, email)');
        if (error) throw error;
        return data || [];
    }

    async getStaffAttendanceRecords(tenantId, filters = {}) {
        let query = supabase.from('staff_attendance')
            .select('*, user:users(name, email)', { count: 'exact' })
            .eq('school_id', tenantId)
            .order('date', { ascending: false });

        if (filters.date) query = query.eq('date', filters.date);
        if (filters.user_id) query = query.eq('user_id', filters.user_id);
        if (filters.status) query = query.eq('status', filters.status);

        const page = Math.max(1, Number.parseInt(filters.page) || 1);
        const limit = Math.min(200, Math.max(1, Number.parseInt(filters.limit) || 50));
        query = query.range((page - 1) * limit, page * limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { records: data || [], total: count || 0, page, limit };
    }

    async updateClass(tenantId, id, payload) {
        const { data, error } = await supabase.from('classes')
            .update(payload)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteClass(tenantId, id) {
        const { error } = await supabase.from('classes')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);
        if (error) throw error;
        return true;
    }

    async updateTimetableEntry(tenantId, id, payload) {
        const { data, error } = await supabase.from('timetable')
            .update(payload)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteTimetableEntry(tenantId, id) {
        const { error } = await supabase.from('timetable')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);
        if (error) throw error;
        return true;
    }

    async getStudent(tenantId, id) {
        const { data, error } = await supabase.from('students')
            .select('*')
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Streams ─────────────────────────────────────────────────
    async getStreams(schoolId) {
        const { data, error } = await supabase.from('streams')
            .select('*, class:classes(name)')
            .eq('school_id', schoolId)
            .order('name');
        if (error) throw error;
        return data || [];
    }

    async createStream(schoolId, payload) {
        const { data, error } = await supabase.from('streams')
            .insert({ id: crypto.randomUUID(), school_id: schoolId, ...payload })
            .select('*, class:classes(name)')
            .single();
        if (error) throw error;
        return data;
    }

    async updateStream(schoolId, id, payload) {
        const { data, error } = await supabase.from('streams')
            .update(payload)
            .eq('id', id)
            .eq('school_id', schoolId)
            .select('*, class:classes(name)')
            .single();
        if (error) throw error;
        return data;
    }

    async deleteStream(schoolId, id) {
        const { error } = await supabase.from('streams')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);
        if (error) throw error;
        return true;
    }

    // ─── Academic Sessions ──────────────────────────────────────
    async getSessions(schoolId) {
        const { data, error } = await supabase.from('academic_sessions')
            .select('*')
            .eq('school_id', schoolId)
            .order('start_date', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async createSession(schoolId, payload) {
        const { data, error } = await supabase.from('academic_sessions')
            .insert({ id: crypto.randomUUID(), school_id: schoolId, ...payload })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateSession(schoolId, id, payload) {
        const { data, error } = await supabase.from('academic_sessions')
            .update(payload)
            .eq('id', id)
            .eq('school_id', schoolId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteSession(schoolId, id) {
        const { error } = await supabase.from('academic_sessions')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);
        if (error) throw error;
        return true;
    }

    // ─── Class-Subject Association ───────────────────────────────
    async getClassSubjects(schoolId) {
        const { data, error } = await supabase.from('class_subjects')
            .select('*, class:classes(name), subject:subjects(name, code)')
            .eq('school_id', schoolId)
            .order('created_at');
        if (error) throw error;
        return data || [];
    }

    async addClassSubject(schoolId, payload) {
        const { data, error } = await supabase.from('class_subjects')
            .insert({ id: crypto.randomUUID(), school_id: schoolId, ...payload })
            .select('*, class:classes(name), subject:subjects(name, code)')
            .single();
        if (error) throw error;
        return data;
    }

    async removeClassSubject(schoolId, id) {
        const { error } = await supabase.from('class_subjects')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);
        if (error) throw error;
        return true;
    }

    // ─── Subject-Teacher Assignment ──────────────────────────────
    async getSubjectTeachers(schoolId) {
        const { data, error } = await supabase.from('subject_teachers')
            .select('*, subject:subjects(name, code), teacher:users(name, email), class:classes(name)')
            .eq('school_id', schoolId)
            .order('created_at');
        if (error) throw error;
        return data || [];
    }

    async assignSubjectTeacher(schoolId, payload) {
        const { data, error } = await supabase.from('subject_teachers')
            .insert({ id: crypto.randomUUID(), school_id: schoolId, ...payload })
            .select('*, subject:subjects(name, code), teacher:users(name, email), class:classes(name)')
            .single();
        if (error) throw error;
        return data;
    }

    async removeSubjectTeacher(schoolId, id) {
        const { error } = await supabase.from('subject_teachers')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);
        if (error) throw error;
        return true;
    }

    // ─── Class-Teacher Assignment ────────────────────────────────
    async getClassTeachers(schoolId) {
        const { data, error } = await supabase.from('class_teachers')
            .select('*, class:classes(name), teacher:users(name, email)')
            .eq('school_id', schoolId)
            .order('created_at');
        if (error) throw error;
        return data || [];
    }

    async assignClassTeacher(schoolId, payload) {
        const { data, error } = await supabase.from('class_teachers')
            .insert({ id: crypto.randomUUID(), school_id: schoolId, ...payload })
            .select('*, class:classes(name), teacher:users(name, email)')
            .single();
        if (error) throw error;
        return data;
    }

    async removeClassTeacher(schoolId, id) {
        const { error } = await supabase.from('class_teachers')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);
        if (error) throw error;
        return true;
    }

    // ─── Timetable Conflict Detection ────────────────────────────
    async checkTimetableConflicts(schoolId, entry) {
        let query = supabase.from('timetable')
            .select('id, day, period, subject, teacher, class_name, room')
            .eq('tenant_id', schoolId)
            .eq('day', entry.day)
            .eq('period', entry.period);

        const { data, error } = await query;
        if (error) throw error;
        const conflicts = (data || []).filter(t => {
            if (entry.id && t.id === entry.id) return false;
            const sameTeacher = t.teacher && entry.teacher && t.teacher.toLowerCase() === entry.teacher.toLowerCase();
            const sameClass = t.class_name && entry.class_name && t.class_name.toLowerCase() === entry.class_name.toLowerCase();
            const sameRoom = t.room && entry.room && t.room.toLowerCase() === entry.room.toLowerCase();
            return sameTeacher || sameClass || sameRoom;
        });
        return conflicts;
    }

    // ─── Teacher Workload Summary ────────────────────────────────
    async getTeacherWorkload(schoolId) {
        const [teachers, subjectTeachers, timetableEntries] = await Promise.all([
            supabase.from('users').select('id, name, email').eq('tenant_id', schoolId).eq('role', 'teacher'),
            supabase.from('subject_teachers').select('*, subject:subjects(name), class:classes(name)').eq('school_id', schoolId),
            supabase.from('timetable').select('teacher, day, period, class_name, subject').eq('tenant_id', schoolId),
        ]);

        const workload = {};
        const tData = teachers.data || [];
        const stData = subjectTeachers.data || [];
        const ttData = timetableEntries.data || [];

        tData.forEach(t => {
            const assignments = stData.filter(st => st.teacher_id === t.id);
            const classes = new Set(assignments.map(a => a.class?.name).filter(Boolean));
            const subjects = new Set(assignments.map(a => a.subject?.name).filter(Boolean));
            const ttCount = ttData.filter(tt => tt.teacher && tt.teacher.toLowerCase() === t.name.toLowerCase()).length;

            workload[t.id] = {
                teacher: { id: t.id, name: t.name, email: t.email },
                subjectCount: subjects.size,
                classCount: classes.size,
                subjects: Array.from(subjects),
                classes: Array.from(classes),
                timetableEntries: ttCount,
                totalAssignments: assignments.length,
            };
        });

        return Object.values(workload).sort((a, b) => b.totalAssignments - a.totalAssignments);
    }

    // ─── Analytics ────────────────────────────────────────────────

    async getAttendanceTrend(schoolId, days = 30) {
        const start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
        const { data, error } = await supabase.from('attendance')
            .select('date, status')
            .eq('tenant_id', schoolId)
            .gte('date', start);
        if (error) throw error;
        const daily = {};
        (data || []).forEach(r => {
            if (!daily[r.date]) daily[r.date] = { date: r.date, present: 0, total: 0 };
            daily[r.date].total += 1;
            if (r.status === 'Present') daily[r.date].present += 1;
        });
        return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
            ...d,
            rate: d.total > 0 ? Number(((d.present / d.total) * 100).toFixed(1)) : 0,
        }));
    }

    async getPerformanceTrend(schoolId, termId) {
        const { data: assessments, error: aErr } = await supabase.from('assessments')
            .select('id, name, date, max_score')
            .eq('school_id', schoolId)
            .eq('term_id', termId);
        if (aErr) throw aErr;
        if (!assessments || assessments.length === 0) return [];

        const ids = assessments.map(a => a.id);
        const { data: scores, error: sErr } = await supabase.from('assessment_scores')
            .select('assessment_id, score')
            .in('assessment_id', ids)
            .eq('school_id', schoolId);
        if (sErr) throw sErr;

        const scoreMap = {};
        (scores || []).forEach(s => {
            if (!scoreMap[s.assessment_id]) scoreMap[s.assessment_id] = [];
            scoreMap[s.assessment_id].push(Number(s.score));
        });

        return assessments.map(a => {
            const s = scoreMap[a.id] || [];
            const avg = s.length > 0 ? s.reduce((sum, v) => sum + v, 0) / s.length : 0;
            return {
                assessment_id: a.id,
                name: a.name,
                date: a.date,
                max_score: a.max_score,
                average: Number(avg.toFixed(1)),
                studentCount: s.length,
                rate: a.max_score > 0 ? Number(((avg / a.max_score) * 100).toFixed(1)) : 0,
            };
        }).sort((a, b) => a.date.localeCompare(b.date));
    }

    async getSubjectComparison(schoolId, termId) {
        const { data: assessments, error: aErr } = await supabase.from('assessments')
            .select('id, subject_id, max_score, subject:subjects(name)')
            .eq('school_id', schoolId)
            .eq('term_id', termId);
        if (aErr) throw aErr;
        if (!assessments || assessments.length === 0) return [];

        const ids = assessments.map(a => a.id);
        const { data: scores, error: sErr } = await supabase.from('assessment_scores')
            .select('assessment_id, score')
            .in('assessment_id', ids)
            .eq('school_id', schoolId);
        if (sErr) throw sErr;

        const scoreMap = {};
        (scores || []).forEach(s => {
            if (!scoreMap[s.assessment_id]) scoreMap[s.assessment_id] = [];
            scoreMap[s.assessment_id].push(Number(s.score));
        });

        const subjectAgg = {};
        assessments.forEach(a => {
            const subjId = a.subject_id;
            if (!subjectAgg[subjId]) subjectAgg[subjId] = { subject_id: subjId, subject_name: a.subject?.name || 'Unknown', totalScore: 0, totalMax: 0, count: 0 };
            const s = scoreMap[a.id] || [];
            if (s.length > 0) {
                const avg = s.reduce((sum, v) => sum + v, 0) / s.length;
                subjectAgg[subjId].totalScore += avg;
                subjectAgg[subjId].totalMax += a.max_score;
                subjectAgg[subjId].count += 1;
            }
        });

        return Object.values(subjectAgg).map(s => ({
            ...s,
            average: s.count > 0 ? Number((s.totalScore / s.count).toFixed(1)) : 0,
            rate: s.totalMax > 0 ? Number(((s.totalScore / s.totalMax) * 100).toFixed(1)) : 0,
        })).sort((a, b) => b.rate - a.rate);
    }

    async getClassComparison(schoolId, termId) {
        const { data: assessments, error: aErr } = await supabase.from('assessments')
            .select('id, class_id, max_score')
            .eq('school_id', schoolId)
            .eq('term_id', termId);
        if (aErr) throw aErr;
        if (!assessments || assessments.length === 0) return [];

        const ids = assessments.map(a => a.id);
        const { data: scores, error: sErr } = await supabase.from('assessment_scores')
            .select('assessment_id, student_id, score')
            .in('assessment_id', ids)
            .eq('school_id', schoolId);
        if (sErr) throw sErr;

        const classIds = [...new Set(assessments.map(a => a.class_id))];
        const { data: classes } = await supabase.from('classes').select('id, name').in('id', classIds);
        const classMap = (classes || []).reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});

        const assMap = {};
        assessments.forEach(a => {
            if (!assMap[a.class_id]) assMap[a.class_id] = { totalScore: 0, totalMax: 0, studentSet: new Set() };
            assMap[a.class_id].totalMax += a.max_score;
        });
        (scores || []).forEach(s => {
            const a = assessments.find(ass => ass.id === s.assessment_id);
            if (a && assMap[a.class_id]) {
                assMap[a.class_id].totalScore += Number(s.score);
                assMap[a.class_id].studentSet.add(s.student_id);
            }
        });

        return Object.entries(assMap).map(([classId, d]) => ({
            class_id: classId,
            class_name: classMap[classId] || 'Unknown',
            average: d.studentSet.size > 0 ? Number((d.totalScore / (d.studentSet.size * Object.keys(assMap[classId]).length || 1)).toFixed(1)) : 0,
            rate: d.totalMax > 0 ? Number(((d.totalScore / (d.studentSet.size * d.totalMax || 1)) * 100).toFixed(1)) : 0,
            studentCount: d.studentSet.size,
        })).sort((a, b) => b.rate - a.rate);
    }

    async getRiskAlerts(schoolId) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

        const [attData, assData, intData] = await Promise.all([
            supabase.from('attendance')
                .select('student_id, status, student:students(name, class_name, admission_no)')
                .eq('tenant_id', schoolId)
                .gte('date', thirtyDaysAgo),
            supabase.from('assessment_scores')
                .select('student_id, score, assessment:assessments(max_score, class_id)', { count: 'exact' })
                .eq('school_id', schoolId),
            supabase.from('interventions')
                .select('*, student:students(name, class_name), assigned:users!assigned_to(full_name)')
                .eq('school_id', schoolId)
                .neq('status', 'resolved')
                .order('created_at', { ascending: false }),
        ]);

        const alerts = [];

        // Attendance risk: students with <80% attendance
        const attMap = {};
        (attData.data || []).forEach(r => {
            if (!attMap[r.student_id]) attMap[r.student_id] = { student: r.student, total: 0, present: 0 };
            attMap[r.student_id].total += 1;
            if (r.status === 'Present') attMap[r.student_id].present += 1;
        });
        Object.entries(attMap).forEach(([sid, d]) => {
            const rate = d.total > 0 ? (d.present / d.total) * 100 : 0;
            if (rate < 80) {
                alerts.push({
                    type: 'attendance',
                    severity: rate < 60 ? 'high' : 'medium',
                    student_id: sid,
                    student: d.student,
                    metric: Number(rate.toFixed(1)),
                    message: `${rate.toFixed(1)}% attendance rate (${d.present}/${d.total} days)`,
                });
            }
        });

        // Performance risk: students with low average scores
        const perfMap = {};
        (assData.data || []).forEach(r => {
            const maxScore = r.assessment?.max_score || 1;
            if (!perfMap[r.student_id]) perfMap[r.student_id] = { totalPct: 0, count: 0 };
            perfMap[r.student_id].totalPct += (Number(r.score) / maxScore) * 100;
            perfMap[r.student_id].count += 1;
        });
        Object.entries(perfMap).forEach(([sid, d]) => {
            const avg = d.count > 0 ? d.totalPct / d.count : 0;
            if (avg < 50) {
                const existing = alerts.find(a => a.student_id === sid);
                alerts.push({
                    type: 'performance',
                    severity: avg < 30 ? 'high' : 'medium',
                    student_id: sid,
                    student: existing?.student || null,
                    metric: Number(avg.toFixed(1)),
                    message: `Average score ${avg.toFixed(1)}% across ${d.count} assessment(s)`,
                });
            }
        });

        return {
            alerts,
            openInterventions: (intData.data || []).map(i => ({
                id: i.id,
                type: i.type,
                severity: i.severity,
                status: i.status,
                notes: i.notes,
                student: i.student,
                assigned: i.assigned,
                created_at: i.created_at,
            })),
        };
    }

    async getTopBottomPerformers(schoolId, termId, classId, limit = 5) {
        let query = supabase.from('report_cards')
            .select('*, student:students(name, admission_no), class:classes(name)')
            .eq('school_id', schoolId)
            .eq('term_id', termId)
            .not('status', 'eq', 'draft');
        if (classId) query = query.eq('class_id', classId);
        query = query.order('average', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        const list = data || [];
        return {
            top: list.slice(0, limit),
            bottom: list.slice(-limit).reverse(),
        };
    }
}

module.exports = new SchoolService();
