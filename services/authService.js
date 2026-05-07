const supabase = require('../config/db');

class AuthService {
    async loadSchoolById(schoolId) {
        const { data: school, error } = await supabase
            .from('schools')
            .select('*')
            .eq('id', schoolId)
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return school;
    }

    async loadSchoolBySubdomain(subdomain) {
        const { data: school, error } = await supabase
            .from('schools')
            .select('*')
            .eq('subdomain', subdomain)
            .in('status', ['active', 'trial'])
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return school;
    }

    async getUserByEmailAndSchool(email, schoolId) {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, email, role_id, is_active, password')
            .eq('email', email)
            .eq('school_id', schoolId)
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
            .select('id, full_name, email, role_id')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return user;
    }

    async getUserPermissions(userId) {
        const { data, error } = await supabase
            .from('users')
            .select(`
                roles (
                    name,
                    role_permissions (
                        permissions (
                            name
                        )
                    )
                )
            `)
            .eq('id', userId)
            .single();

        if (error || !data?.roles) return [];

        const permissions = data.roles.role_permissions.map(rp => rp.permissions.name);
        return permissions;
    }
}

module.exports = new AuthService();
