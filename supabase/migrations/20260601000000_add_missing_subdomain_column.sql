-- Add missing subdomain column to schools table
-- Some parts of the system reference subdomain (e.g., RLS policies, older queries)
-- This ensures backward compatibility while slug remains the primary field
BEGIN;

ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS subdomain TEXT;

UPDATE public.schools
SET subdomain = slug
WHERE subdomain IS NULL AND slug IS NOT NULL;

COMMIT;
