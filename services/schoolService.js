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
            .select('*, student:students(name, class_name)')
            .eq('tenant_id', schoolId)
            .order('date', { ascending: false })
            .limit(200);

        if (filters.date) query = query.eq('date', filters.date);
        if (filters.class_name) query = query.eq('class_name', filters.class_name);
        if (filters.student_id) query = query.eq('student_id', filters.student_id);
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async getAttendanceStats(schoolId, startDate, endDate) {
        const { data, error } = await supabase.from('attendance')
            .select('date, status, count')
            .eq('tenant_id', schoolId)
            .gte('date', startDate)
            .lte('date', endDate);
        if (error) throw error;
        return data || [];
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
}

module.exports = new SchoolService();
