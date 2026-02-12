-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. PROFILES (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  master_salt TEXT NOT NULL, -- Used for client-side key derivation
  heartbeat_interval_days INTEGER DEFAULT 30,
  grace_period_days INTEGER DEFAULT 7,
  last_heartbeat_at TIMESTAMPTZ DEFAULT NOW(),
  transmission_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure email column exists if table was created earlier
DO $do$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END
$do$;

-- ... (rest of tables)
-- Heirs, Vault Entries, etc. (no changes needed to these tables from previous turns)

-- ... (RLS policies)
-- Ensure INSERT policy exists for profiles
DO $do$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END
$do$;

-- 5. SIGNUP TRIGGER
-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, master_salt)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    encode(extensions.gen_random_bytes(16), 'hex')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$function$;

-- Re-recreate trigger to ensure it's fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
