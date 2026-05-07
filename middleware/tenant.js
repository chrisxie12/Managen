const supabase = require('../config/db');
const redis = require('../config/redis');

const isRedisReady = () => redis && redis.status === 'ready';

const extractSubdomain = (host) => {
    if (!host) return null;

    const cleanHost = String(host)
        .split(',')[0]
        .trim()
        .toLowerCase()
        .split(':')[0];

    if (!cleanHost || cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
        return null;
    }

    const parts = cleanHost.split('.');
    if (parts.length < 2) return null;

    const candidate = parts[0];
    if (!candidate || ['www', 'app', 'api'].includes(candidate)) return null;

    return candidate;
};

const tenantMiddleware = async (req, res, next) => {
    try {
        const forwardedHost = req.headers['x-forwarded-host'];
        const host          = forwardedHost || req.hostname || req.headers.host;

        const subdomainFromHost = extractSubdomain(host);
        const fallbackSubdomain = String(
            req.headers['x-tenant-subdomain'] || req.query.subdomain || ''
        ).trim().toLowerCase() || null;

        const subdomain = subdomainFromHost || fallbackSubdomain;

        if (!subdomain) {
            return next();
        }

        const cacheKey = `tenant:${subdomain}`;
        let tenant = null;

        if (isRedisReady()) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    tenant = JSON.parse(cached);
                }
            } catch (redisErr) {
                console.error('Redis tenant cache get error:', redisErr.message || redisErr);
            }
        }

        if (!tenant) {
            const { data: dbTenant, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('subdomain', subdomain)
                .in('status', ['active', 'trial'])
                .maybeSingle();

            if (error) {
                return res.status(500).json({ error: 'Error resolving school.' });
            }

            if (!dbTenant) {
                return res.status(404).json({ error: 'School not found or account inactive.' });
            }

            tenant = dbTenant;

            if (isRedisReady()) {
                try {
                    await redis.setex(cacheKey, 300, JSON.stringify(tenant));
                } catch (redisErr) {
                    console.error('Redis tenant cache set error:', redisErr.message || redisErr);
                }
            }
        }



        req.tenant   = tenant;
        req.tenantId = tenant.id;
        next();
    } catch (err) {
        console.error('Tenant middleware error:', err);
        return res.status(500).json({ error: 'Server error resolving school.' });
    }
};

module.exports = { tenantMiddleware };
