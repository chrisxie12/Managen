require('dotenv').config();
const supabase = require('../config/db');

async function testTables() {
    const tables = ['tenants', 'students', 'teachers', 'payments'];
    for (const table of tables) {
        console.log(`Testing table: ${table}...`);
        try {
            const { data, error } = await supabase.from(table).select('id').limit(1);
            if (error) {
                console.error(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: OK`);
            }
        } catch (err) {
            console.error(`❌ ${table}: ${err.message}`);
        }
    }
    process.exit(0);
}

testTables();
