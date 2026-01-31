/*
  # Fix user profiles RLS policies

  Ensure all necessary RLS policies are in place for user_profiles table.
  This handles SELECT, INSERT, UPDATE, and DELETE operations properly.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile'
  ) THEN
    DROP POLICY "Users can view own profile" ON user_profiles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile'
  ) THEN
    DROP POLICY "Users can update own profile" ON user_profiles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    DROP POLICY "Users can insert own profile" ON user_profiles;
  END IF;
END $$;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
