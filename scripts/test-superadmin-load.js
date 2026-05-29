process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

try {
    require('../routes/superAdmin');

    const provisionService = require('../services/provisionService');
    const requiredSymbols = ['suspendSchool', 'reactivateSchool', 'PLAN_CATALOG'];

    for (const symbol of requiredSymbols) {
        if (!Object.prototype.hasOwnProperty.call(provisionService, symbol) || provisionService[symbol] == null) {
            throw new Error(`Missing symbol: ${symbol}`);
        }
    }

    if (typeof provisionService.suspendSchool !== 'function') {
        throw new Error('Missing symbol: suspendSchool');
    }

    if (typeof provisionService.reactivateSchool !== 'function') {
        throw new Error('Missing symbol: reactivateSchool');
    }

    if (typeof provisionService.PLAN_CATALOG !== 'object') {
        throw new Error('Missing symbol: PLAN_CATALOG');
    }

    console.log('superAdmin routes loaded OK');
} catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
}
