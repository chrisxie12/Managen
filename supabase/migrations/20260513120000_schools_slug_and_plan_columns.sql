-- Align public.schools with application code (slug + plan).
-- Safe to re-run: uses information_schema guards.
--
-- ROLLBACK (run only if you need to revert column names — adjust if your
-- pre-migration state differed):
-- BEGIN;
-- DO $$ BEGIN
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'slug')
--      AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'subdomain') THEN
--     ALTER TABLE public.schools RENAME COLUMN slug TO subdomain;
--   END IF;
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'plan')
--      AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'subscription_plan') THEN
--     ALTER TABLE public.schools RENAME COLUMN plan TO subscription_plan;
--   END IF;
-- END $$;
-- COMMIT;

BEGIN;

-- 1) Tenant URL key: prefer column name "slug"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'subdomain'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.schools RENAME COLUMN subdomain TO slug;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'subdomain'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'slug'
  ) THEN
    UPDATE public.schools
    SET slug = COALESCE(NULLIF(BTRIM(slug::text), ''), subdomain::text)
    WHERE slug IS NULL OR BTRIM(slug::text) = '';
    ALTER TABLE public.schools DROP COLUMN subdomain;
  END IF;
END $$;

ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- 2) Billing tier: prefer column name "plan"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'subscription_plan'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.schools RENAME COLUMN subscription_plan TO plan;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'subscription_plan'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'plan'
  ) THEN
    UPDATE public.schools
    SET plan = COALESCE(NULLIF(BTRIM(plan::text), ''), subscription_plan::text, 'trial');
    ALTER TABLE public.schools DROP COLUMN subscription_plan;
  END IF;
END $$;

ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'trial';

UPDATE public.schools SET plan = 'trial' WHERE plan IS NULL OR BTRIM(plan::text) = '';

ALTER TABLE public.schools ALTER COLUMN plan SET DEFAULT 'trial';

COMMIT;
