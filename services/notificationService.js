// services/notificationService.js
// In-app notification creation and management

const supabase = require('../config/db');

/**
 * Create an in-app notification for a user
 * @param {Object} opts
 * @param {string} opts.userId - recipient user ID
 * @param {string} opts.schoolId - school ID (tenant)
 * @param {string} opts.title - notification title
 * @param {string} [opts.message] - notification body
 * @param {string} [opts.type] - type: grade|attendance|fee|report_card|announcement|general
 * @param {string} [opts.referenceId] - ID of related resource
 * @param {string} [opts.referenceType] - table/entity name of related resource
 * @returns {Promise<Object>} created notification
 */
async function createNotification({ userId, schoolId, title, message, type, referenceId, referenceType }) {
    const { data, error } = await supabase.from('notifications').insert({
        user_id: userId,
        school_id: schoolId,
        title,
        message: message || null,
        type: type || 'general',
        reference_id: referenceId || null,
        reference_type: referenceType || null,
        is_read: false,
    }).select().single();

    if (error) {
        console.error('Failed to create notification:', error);
        throw error;
    }
    return data;
}

/**
 * Mark a notification as read
 */
async function markAsRead(notificationId, userId) {
    const { data, error } = await supabase.from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(userId, schoolId) {
    const { error } = await supabase.from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('school_id', schoolId)
        .eq('is_read', false);

    if (error) throw error;
    return true;
}

/**
 * Get unread notification count for a user
 */
async function getUnreadCount(userId, schoolId) {
    const { count, error } = await supabase.from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('school_id', schoolId)
        .eq('is_read', false);

    if (error) throw error;
    return count || 0;
}

/**
 * Get notifications for a user with pagination
 */
async function getUserNotifications(userId, schoolId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
    let query = supabase.from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (unreadOnly) {
        query = query.eq('is_read', false);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { notifications: data || [], total: count || 0 };
}

/**
 * Create notifications for a student and their parents
 */
async function notifyStudentAndParents(studentId, schoolId, { title, message, type, referenceId, referenceType }) {
    // Get student's user_id
    const { data: student, error: sErr } = await supabase
        .from('students')
        .select('id, name')
        .eq('id', studentId)
        .single();

    if (sErr || !student) {
        console.error('Student not found:', studentId);
        return;
    }

    // Notify student (student's user_id matches the student's id in this system)
    const notifications = [];

    try {
        const n = await createNotification({
            userId: student.id,
            schoolId,
            title,
            message,
            type,
            referenceId,
            referenceType,
        });
        notifications.push(n);
    } catch (err) {
        console.error('Failed to notify student:', err.message);
    }

    // Get parent links
    const { data: parentLinks } = await supabase
        .from('parents')
        .select('user_id')
        .eq('student_id', studentId);

    for (const link of parentLinks || []) {
        try {
            const n = await createNotification({
                userId: link.user_id,
                schoolId,
                title: `${title} — ${student.name}`,
                message,
                type,
                referenceId,
                referenceType,
            });
            notifications.push(n);
        } catch (err) {
            console.error('Failed to notify parent:', err.message);
        }
    }

    return notifications;
}

module.exports = {
    createNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getUserNotifications,
    notifyStudentAndParents,
};
