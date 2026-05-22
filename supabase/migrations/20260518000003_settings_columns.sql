-- 20260518000001_settings_columns.sql
BEGIN;

ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS registration_number text,
ADD COLUMN IF NOT EXISTS payment_methods jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS fee_categories jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS late_fee_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS receipt_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attendance_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS class_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS security_settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS billing_plan text DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS billing_status text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS billing_renewal_date date;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS invited_at timestamptz,
ADD COLUMN IF NOT EXISTS invitation_token text,
ADD COLUMN IF NOT EXISTS invitation_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

CREATE TABLE IF NOT EXISTS public.billing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'paid',
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  device text,
  browser text,
  ip_address text,
  location text,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  ip_address text,
  device text,
  status text NOT NULL DEFAULT 'success',
  created_at timestamptz DEFAULT now()
);

COMMIT;
