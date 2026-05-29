const authService = require('../services/authService');

/**
 * Middleware to require a specific permission for a route.
 * @param {string} permission - The permission name (e.g. 'students:read')
 */
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = req.user; // Set by authMiddleware
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized. Please log in.' });
            }

            // Fetch permissions for the user
            const permissions = await authService.getUserPermissions(user.userId || user.id);
            
            if (!permissions.includes(permission)) {
                return res.status(403).json({ 
                    error: 'Forbidden. You do not have the required permission.',
                    required: permission 
                });
            }

            // School Isolation - Ensure user only accesses data from their own school
            // (Assuming req.params.schoolId or req.schoolId is set by routing or other middleware)
            const requestedSchoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
            
            if (user.role !== 'superadmin' && requestedSchoolId && requestedSchoolId !== user.schoolId) {
                return res.status(403).json({ error: 'Cross-school access denied.' });
            }

            next();
        } catch (err) {
            console.error('RBAC Error:', err);
            return res.status(500).json({ error: 'Error verifying permissions.' });
        }
    };
};

module.exports = { requirePermission };
