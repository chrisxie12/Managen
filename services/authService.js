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
            .eq('slug', subdomain)
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        if (school && school.is_active === false) {
            return null;
        }
        return school;
    }

    async getUserByEmailAndSchool(email, schoolId) {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, email, role, role_id, is_active, password')
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
            .select('id, full_name, email, role, role_id')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return user;
    }

    async getUserByEmail(email) {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, email, school_id')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
        return user;
    }

    async getUserByResetToken(token) {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, email')
            .eq('password_reset_token', token)
            .gt('password_reset_expires', new Date().toISOString())
            .maybeSingle();

        if (error) return null;
        return user;
    }

    async setPasswordResetToken(userId, token) {
        const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        const { error } = await supabase
            .from('users')
            .update({ password_reset_token: token, password_reset_expires: expires })
            .eq('id', userId);

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
    }

    async updatePassword(userId, hashedPassword) {
        const { error } = await supabase
            .from('users')
            .update({ password: hashedPassword, password_reset_token: null, password_reset_expires: null })
            .eq('id', userId);

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
    }

    async verifyUserEmail(userId) {
        const { error } = await supabase
            .from('users')
            .update({ email_verified: true })
            .eq('id', userId);

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }
    }

    async getUserPermissions(userId) {
        try {
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('role_id')
                .eq('id', userId)
                .maybeSingle();

            if (userError || !user?.role_id) {
                return [];
            }

            const { data: role, error: roleError } = await supabase
                .from('roles')
                .select(`
                    name,
                    role_permissions (
                        permissions (
                            name
                        )
                    )
                `)
                .eq('id', user.role_id)
                .maybeSingle();

            if (roleError || !role) {
                return [];
            }

            let permissions = [];
            try {
                const rpArray = role.role_permissions || [];
                permissions = rpArray
                    .map(rp => {
                        const perm = rp.permissions || {};
                        return perm.name || null;
                    })
                    .filter(name => name !== null && name !== undefined);
            } catch (extractError) {
                permissions = [];
            }

            return permissions;
        } catch (error) {
            return [];
        }
    }
}

module.exports = new AuthService();
