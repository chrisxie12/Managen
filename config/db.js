const { createClient } = require('@supabase/supabase-js');

const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.SUPABASE_URL || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables.');
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    serviceKey
);

module.exports = supabase;
