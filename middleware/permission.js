const requirePermission = (...permissions) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }

    const userPerms = req.user.permissions || [];

    // If no permissions are configured (e.g. legacy users, test env),
    // fall back to role-based access for common permissions
    if (userPerms.length === 0 && req.user.role) {
        const rolePermissionMap = {
            'students:read': ['admin', 'school_admin', 'teacher', 'headmaster'],
            'students:manage': ['admin', 'school_admin'],
            'attendance:manage': ['admin', 'school_admin', 'teacher'],
            'grades:read': ['admin', 'school_admin', 'teacher', 'headmaster'],
            'grades:manage': ['admin', 'school_admin', 'teacher'],
            'fees:read': ['admin', 'school_admin', 'accountant', 'headmaster'],
            'fees:manage': ['admin', 'school_admin', 'accountant'],
            'teachers:manage': ['admin', 'school_admin'],
            'classes:manage': ['admin', 'school_admin'],
            'timetable:manage': ['admin', 'school_admin', 'teacher'],
            'announcements:manage': ['admin', 'school_admin', 'headmaster'],
            'messages:read': ['admin', 'school_admin', 'teacher', 'parent', 'student', 'headmaster'],
            'reports:read': ['admin', 'school_admin', 'headmaster', 'accountant'],
            'settings:manage': ['admin', 'school_admin'],
            'users:manage': ['admin', 'school_admin'],
            'dashboard:read': ['admin', 'school_admin', 'teacher', 'student', 'parent', 'headmaster', 'accountant'],
            'payments:read': ['admin', 'school_admin', 'accountant', 'headmaster'],
            'invoices:read': ['admin', 'school_admin', 'accountant', 'parent'],
            'grades:approve': ['headmaster', 'admin', 'school_admin'],
        };

        for (const perm of permissions) {
            const allowedRoles = rolePermissionMap[perm];
            if (allowedRoles && allowedRoles.includes(req.user.role)) {
                return next();
            }
        }

        // If the permission isn't in the map, fall through to the explicit check below
    }

    // Explicit permission check (production flow)
    const hasAny = permissions.some((perm) => userPerms.includes(perm));

    if (!hasAny) {
        return res.status(403).json({
            error: `Missing required permission: ${permissions.join(' or ')}`,
        });
    }

    next();
};

module.exports = { requirePermission };
