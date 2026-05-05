const supabase = require('../config/db');

class AuthService {
    async loadTenantById(tenantId) {
        const { data: tenant, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return tenant;
    }

    async loadTenantBySubdomain(subdomain) {
        const { data: tenant, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('subdomain', subdomain)
            .in('status', ['active', 'trial'])
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return tenant;
    }

    async getUserByEmailAndTenant(email, tenantId) {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, is_active, password')
            .eq('email', email)
            .eq('tenant_id', tenantId)
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return user;
    }

    async getUserById(userId) {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return user;
    }
}

module.exports = new AuthService();
