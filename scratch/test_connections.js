require('dotenv').config();
const supabase = require('../config/db');
const redis = require('../config/redis');

async function testConnections() {
    console.log('--- Connection Test ---');
    
    // Test Supabase
    console.log('Testing Supabase...');
    try {
        const { data, error } = await supabase.from('tenants').select('id').limit(1);
        if (error) {
            console.error('❌ Supabase: Error object -', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Supabase: Connected successfully. Data count:', data.length);
        }
    } catch (err) {
        console.error('❌ Supabase: Catch error -', err.message);
    }

    // Test Redis
    console.log('Testing Redis...');
    try {
        if (!redis.isRedisConfigured()) {
            console.warn('⚠️  Redis: REDIS_URL not configured. Skipping Redis test.');
        } else {
            const pong = await redis.ping();
            console.log('✅ Redis: Connected successfully -', pong);
        }
    } catch (err) {
        console.error('❌ Redis: Catch error -', err.message);
    }

    console.log('Test complete. Waiting 2 seconds before exit...');
    setTimeout(() => {
        console.log('Exiting.');
        process.exit(0);
    }, 2000);
}

testConnections();
