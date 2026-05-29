const supabase = require('../config/db');

/**
 * Middleware to log actions to the audit_logs table.
 * @param {string} action - 'created', 'updated', 'deleted', 'viewed'
 * @param {string} resource - 'student', 'fee', 'school', etc.
 */
const auditLog = (action, resource) => {
    return async (req, res, next) => {
        // We wrap the original res.send/res.json to log after successful response
        const originalJson = res.json;
        
        res.json = function (data) {
            // Only log on successful responses (2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const user = req.user;
                const schoolId = req.schoolId || (user && user.schoolId);
                
                // Fire-and-forget logging
                setImmediate(async () => {
                    try {
                        await supabase.from('audit_logs').insert({
                            user_id: user ? (user.userId || user.id) : null,
                            school_id: schoolId,
                            action,
                            resource,
                            resource_id: req.params.id || data?.data?.id || null,
                            metadata: {
                                method: req.method,
                                url: req.originalUrl,
                                body: req.method !== 'GET' ? req.body : undefined,
                                response: data
                            },
                            ip_address: req.ip || req.headers['x-forwarded-for']
                        });
                    } catch (err) {
                        console.error('Audit Log Error:', err.message || err);
                    }
                });
            }
            
            return originalJson.call(this, data);
        };
        
        next();
    };
};

module.exports = { auditLog };
