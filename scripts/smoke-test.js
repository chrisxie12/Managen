const assert = require('assert');

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';
process.env.TENANT_BASE_URL = 'https://schools.example.com';

const {
    slugifySchoolName,
    getPlanConfig,
    getPublicPlans,
    buildTenantLoginUrl,
    PLAN_CATALOG,
} = require('../services/provisionService');

const run = () => {
    assert.strictEqual(slugifySchoolName('Green Valley School!'), 'greenvalleyschool');
    assert.strictEqual(slugifySchoolName('   ***   '), 'school');
    assert.ok(slugifySchoolName('A very very long school name beyond twenty chars').length <= 20);

    const trialPlan = getPlanConfig('trial');
    assert.strictEqual(trialPlan.name, 'trial');
    assert.deepStrictEqual(trialPlan.modules, ['attendance', 'fees']);

    const premiumPlan = getPlanConfig('premium');
    assert.strictEqual(premiumPlan.maxStudents, null);
    assert.deepStrictEqual(premiumPlan.modules, ['all']);

    const plans = getPublicPlans();
    assert.ok(Array.isArray(plans));
    assert.ok(plans.some((plan) => plan.name === 'basic'));
    assert.ok(plans.some((plan) => plan.name === 'premium'));
    assert.strictEqual(Object.keys(PLAN_CATALOG).length, 4);

    assert.strictEqual(
        buildTenantLoginUrl('greenvalley'),
        'https://schools.example.com/login?subdomain=greenvalley'
    );

    console.log('Smoke tests passed.');
};

run();

