-- Run this in your Supabase Dashboard SQL Editor
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS password_reset_token TEXT DEFAULT null,
  ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ DEFAULT null;
