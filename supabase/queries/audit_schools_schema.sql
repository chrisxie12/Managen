-- Run in Supabase SQL Editor (or psql) to audit schools + RLS.
-- Does not modify data.

-- All columns on public.schools
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'schools'
ORDER BY ordinal_position;

-- Policies on schools (if any)
SELECT pol.polname AS policy_name,
       pg_get_expr(pol.polqual, pol.polrelid) AS using_expr,
       pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expr
FROM pg_policy pol
JOIN pg_class cls ON cls.oid = pol.polrelid
JOIN pg_namespace nsp ON nsp.oid = cls.relnamespace
WHERE nsp.nspname = 'public' AND cls.relname = 'schools';

-- Policies mentioning legacy column names (any table)
SELECT c.relname AS table_name, pol.polname AS policy_name,
       pg_get_expr(pol.polqual, pol.polrelid) AS using_expr
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND (
    pg_get_expr(pol.polqual, pol.polrelid) ILIKE '%subdomain%'
    OR pg_get_expr(pol.polqual, pol.polrelid) ILIKE '%subscription_plan%'
    OR pg_get_expr(pol.polwithcheck, pol.polrelid) ILIKE '%subdomain%'
    OR pg_get_expr(pol.polwithcheck, pol.polrelid) ILIKE '%subscription_plan%'
  );

-- Approximate CREATE TABLE (Postgres 17+: use instead if available)
-- SELECT pg_get_tabledef('public.schools'::regclass);
