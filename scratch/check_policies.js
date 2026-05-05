require('dotenv').config();
const supabase = require('../config/db');

async function checkPolicies() {
    try {
        console.log('Querying pg_policies...');
        const { data, error } = await supabase.rpc('get_policies_for_table', { table_name: 'tenants' });
        
        if (error) {
            console.log('RPC failed (likely not exists). Trying raw query via rpc...');
            const { data: rawData, error: rawError } = await supabase.from('pg_policies').select('*').eq('tablename', 'tenants');
            if (rawError) throw rawError;
            console.log('Policies for tenants:', JSON.stringify(rawData, null, 2));
        } else {
            console.log('Policies for tenants:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('❌ Error checking policies:', err.message);
    }
    process.exit(0);
}

checkPolicies();
