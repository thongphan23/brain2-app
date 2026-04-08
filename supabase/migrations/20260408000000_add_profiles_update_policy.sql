-- ════════════════════════════════════════════════════════════
-- Fix BUG 11: Add RLS UPDATE policy for profiles
-- Without this, users cannot update their own onboarding_completed field
-- ════════════════════════════════════════════════════════════

-- Enable RLS on profiles (should already be enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to UPDATE their own profile row
-- Using auth.uid() for both USING and WITH CHECK
-- to ensure users can only modify rows that belong to them
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Also add INSERT policy if missing (for profile creation during signup)
-- Check if it exists first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Users can insert own profile'
    AND cmd = 'INSERT'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- Verify policies
SELECT polname, polcmd, qual::text, with_check::text
FROM pg_policies
WHERE tablename = 'profiles';
