const requirePermission = (...permissions) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }

    const userPerms = req.user.permissions || [];

    // Fallback: map role names to CRUD permissions when user has no explicit permissions
    if (userPerms.length === 0 && req.user.role) {
        const role = req.user.role;
        const rolePermissionMap = {
            superadmin: true, // superadmin has everything
            admin: [
                'dashboard.view',
                'import.create', 'import.view',
                'attendance_links.create', 'attendance_links.view',
                'students.create', 'students.view', 'students.edit', 'students.delete',
                'teachers.create', 'teachers.view', 'teachers.edit', 'teachers.delete',
                'classes.create', 'classes.view', 'classes.edit', 'classes.delete',
                'subjects.create', 'subjects.view', 'subjects.edit', 'subjects.delete',
                'timetable.create', 'timetable.view', 'timetable.edit', 'timetable.delete',
                'attendance.create', 'attendance.view', 'attendance.edit', 'attendance.delete',
                'grades.create', 'grades.view', 'grades.edit', 'grades.delete',
                'fees.create', 'fees.view', 'fees.edit', 'fees.delete',
                'payments.create', 'payments.view', 'payments.edit', 'payments.delete',
                'invoices.create', 'invoices.view', 'invoices.edit', 'invoices.delete',
                'messages.create', 'messages.view', 'messages.edit', 'messages.delete',
                'announcements.create', 'announcements.view', 'announcements.edit', 'announcements.delete',
                'notifications.create', 'notifications.view', 'notifications.edit', 'notifications.delete',
                'reports.create', 'reports.view', 'reports.edit', 'reports.delete',
                'audit_logs.view',
                'users.create', 'users.view', 'users.edit', 'users.delete',
                'settings.view', 'settings.edit',
            ],
            school_admin: [
                'dashboard.view',
                'import.create', 'import.view',
                'attendance_links.create', 'attendance_links.view',
                'students.create', 'students.view', 'students.edit', 'students.delete',
                'teachers.create', 'teachers.view', 'teachers.edit', 'teachers.delete',
                'classes.create', 'classes.view', 'classes.edit', 'classes.delete',
                'subjects.create', 'subjects.view', 'subjects.edit', 'subjects.delete',
                'timetable.create', 'timetable.view', 'timetable.edit', 'timetable.delete',
                'attendance.create', 'attendance.view', 'attendance.edit', 'attendance.delete',
                'grades.create', 'grades.view', 'grades.edit', 'grades.delete',
                'fees.create', 'fees.view', 'fees.edit', 'fees.delete',
                'payments.create', 'payments.view', 'payments.edit', 'payments.delete',
                'invoices.create', 'invoices.view', 'invoices.edit', 'invoices.delete',
                'messages.create', 'messages.view', 'messages.edit', 'messages.delete',
                'announcements.create', 'announcements.view', 'announcements.edit', 'announcements.delete',
                'notifications.create', 'notifications.view', 'notifications.edit', 'notifications.delete',
                'reports.create', 'reports.view', 'reports.edit', 'reports.delete',
                'audit_logs.view',
                'users.create', 'users.view', 'users.edit', 'users.delete',
                'settings.view', 'settings.edit',
            ],
            headmaster: [
                'dashboard.view',
                'students.view', 'teachers.view', 'classes.view',
                'subjects.view', 'timetable.view', 'attendance.view', 'grades.view',
                'fees.view', 'payments.view',
                'messages.view', 'announcements.view', 'notifications.view', 'reports.view',
                'audit_logs.view', 'settings.view',
            ],
            accountant: [
                'dashboard.view', 'students.view',
                'fees.create', 'fees.view', 'fees.edit', 'fees.delete',
                'payments.create', 'payments.view', 'payments.edit', 'payments.delete',
                'invoices.create', 'invoices.view', 'invoices.edit', 'invoices.delete',
                'reports.create', 'reports.view',
            ],
            teacher: [
                'dashboard.view',
                'students.view', 'classes.view', 'subjects.view', 'timetable.view',
                'attendance.create', 'attendance.view', 'attendance.edit',
                'attendance_links.view',
                'grades.create', 'grades.view', 'grades.edit',
                'messages.create', 'messages.view',
                'announcements.view', 'notifications.view',
            ],
            student: [
                'dashboard.view',
                'timetable.view', 'attendance.view', 'grades.view',
                'announcements.view', 'messages.view',
            ],
            parent: [
                'dashboard.view',
                'students.view', 'attendance.view', 'grades.view',
                'fees.view', 'invoices.view',
                'announcements.view', 'messages.view',
            ],
        };

        // Gather all permissions for this role
        const rolePerms = rolePermissionMap[role] || [];
        if (rolePerms === true) {
            // superadmin: skip check
            return next();
        }
        // Check if any of the required permissions match this role's defaults
        for (const perm of permissions) {
            if (rolePerms.includes(perm)) {
                return next();
            }
        }
    }

    const hasAny = permissions.some((perm) => userPerms.includes(perm));
    if (!hasAny) {
        return res.status(403).json({
            error: `Missing required permission: ${permissions.join(' or ')}`,
        });
    }

    next();
};

module.exports = { requirePermission };
