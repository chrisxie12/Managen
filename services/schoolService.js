const crypto = require('crypto');
const supabase = require('../config/db');

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
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('role', 'teacher');
        if (error) throw error;
        return data || [];
    }

    async createTeacher(tenantId, payload) {
        const { data, error } = await supabase.from('users')
            .insert({ 
                id: crypto.randomUUID(),
                ...payload, 
                role: 'teacher',
                tenant_id: tenantId 
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateTeacher(tenantId, id, payload) {
        const { data, error } = await supabase.from('users')
            .update(payload)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
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
}

module.exports = new SchoolService();
