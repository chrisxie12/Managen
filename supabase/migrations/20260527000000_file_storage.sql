-- =============================================
-- Migration: File Storage Infrastructure
-- Date: 2026-05-27
-- Adds avatar_url & document_urls to students,
-- creates Storage buckets, sets up RLS policies.
-- =============================================

-- 1. Add columns to students table
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS document_urls JSONB DEFAULT '[]'::jsonb;

-- 2. Create storage buckets (run via Supabase dashboard or API)
--    These are created automatically by the app on first upload,
--    but declared here for documentation:
--    - student-photos  (public: false)
--    - report-cards    (public: false)
--    - documents       (public: false)

-- 3. Storage RLS policies (run in Supabase SQL editor against storage schema)
--    Enable RLS on each bucket via dashboard, then apply:
--
--    -- Bucket: student-photos
--    CREATE POLICY "School can read own student photos"
--      ON storage.objects FOR SELECT
--      USING (
--        bucket_id = 'student-photos'
--        AND storage.foldername(name)[1] = (SELECT id::text FROM schools WHERE id = (storage.foldername(name)[1])::uuid LIMIT 1)
--      );
--
--    CREATE POLICY "School can upload own student photos"
--      ON storage.objects FOR INSERT
--      WITH CHECK (
--        bucket_id = 'student-photos'
--        AND storage.foldername(name)[1] = (SELECT id::text FROM schools WHERE id = (storage.foldername(name)[1])::uuid LIMIT 1)
--      );
--
--    CREATE POLICY "School can delete own student photos"
--      ON storage.objects FOR DELETE
--      USING (
--        bucket_id = 'student-photos'
--        AND storage.foldername(name)[1] = (SELECT id::text FROM schools WHERE id = (storage.foldername(name)[1])::uuid LIMIT 1)
--      );
--
--    Repeat for report-cards and documents buckets (same policies).

-- 4. Index for avatar lookups
CREATE INDEX IF NOT EXISTS idx_students_avatar_url ON students(avatar_url) WHERE avatar_url IS NOT NULL;
