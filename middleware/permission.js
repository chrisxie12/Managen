const requirePermission = (...permissions) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }

    const userPerms = req.user.permissions || [];

    // Fallback: map role names to permissions when user has no explicit permissions
    if (userPerms.length === 0 && req.user.role) {
        const rolePermissionMap = {
            'dashboard:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'accountant', 'teacher', 'student', 'parent'],
            'students:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'accountant', 'teacher', 'parent'],
            'students:manage': ['superadmin', 'school_admin', 'admin'],
            'teachers:read': ['superadmin', 'school_admin', 'admin', 'headmaster'],
            'teachers:manage': ['superadmin', 'school_admin', 'admin'],
            'classes:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'teacher'],
            'classes:manage': ['superadmin', 'school_admin', 'admin'],
            'subjects:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'teacher'],
            'subjects:manage': ['superadmin', 'school_admin', 'admin'],
            'timetable:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'teacher', 'student'],
            'timetable:manage': ['superadmin', 'school_admin', 'admin'],
            'attendance:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'teacher', 'student', 'parent'],
            'attendance:manage': ['superadmin', 'school_admin', 'admin', 'teacher'],
            'grades:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'teacher', 'student', 'parent'],
            'grades:manage': ['superadmin', 'school_admin', 'admin', 'teacher'],
            'grades:approve': ['superadmin', 'school_admin', 'admin', 'headmaster'],
            'fees:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'accountant', 'parent'],
            'fees:manage': ['superadmin', 'school_admin', 'admin', 'accountant'],
            'fees:waive': ['superadmin', 'school_admin', 'admin'],
            'payments:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'accountant'],
            'payments:manage': ['superadmin', 'school_admin', 'admin', 'accountant'],
            'invoices:read': ['superadmin', 'school_admin', 'admin', 'accountant', 'parent'],
            'invoices:manage': ['superadmin', 'school_admin', 'admin', 'accountant'],
            'messages:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'teacher', 'student', 'parent'],
            'messages:manage': ['superadmin', 'school_admin', 'admin'],
            'announcements:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'teacher', 'student', 'parent'],
            'announcements:manage': ['superadmin', 'school_admin', 'admin', 'headmaster'],
            'reports:read': ['superadmin', 'school_admin', 'admin', 'headmaster', 'accountant'],
            'reports:export': ['superadmin', 'school_admin', 'admin', 'accountant'],
            'settings:manage': ['superadmin', 'school_admin', 'admin'],
            'users:manage': ['superadmin', 'school_admin', 'admin'],
            'audit_logs:read': ['superadmin'],
            'schools:manage': ['superadmin'],
            'plans:manage': ['superadmin'],
            'roles:manage': ['superadmin'],
            'permissions:manage': ['superadmin'],
        };

        for (const perm of permissions) {
            const allowedRoles = rolePermissionMap[perm];
            if (allowedRoles && allowedRoles.includes(req.user.role)) {
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
