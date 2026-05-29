require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
  // Fix the action column: make it nullable temporarily
  // Use the pg client via Supabase management API

  const queries = [
    `ALTER TABLE permissions ALTER COLUMN action DROP NOT NULL;`,
    `ALTER TABLE permissions ALTER COLUMN action SET DEFAULT '';`,
    `UPDATE permissions SET action = '' WHERE action IS NULL;`,
    `ALTER TABLE permissions ALTER COLUMN description SET DEFAULT '';`,
    `UPDATE permissions SET description = '' WHERE description IS NULL;`,
  ];

  for (const sql of queries) {
    console.log('Executing:', sql.slice(0, 80));
    try {
      const { data, error } = await supabase.rpc('exec_sql', { query: sql });
      if (error) {
        // Try direct REST API
        console.log('RPC failed, trying direct query:', error.message);
        const { data: d2, error: e2 } = await supabase.from('permissions').select('id').limit(1);
        if (e2) console.log('Even simple query failed:', e2.message);
      }
    } catch (err) {
      console.log('Error:', err.message);
    }
  }
  console.log('Done');
}

run().catch(console.error);
