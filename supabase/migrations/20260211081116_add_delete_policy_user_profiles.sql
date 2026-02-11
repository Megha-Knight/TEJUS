/*
  # Add DELETE policy to user_profiles RLS

  This migration adds the missing DELETE policy for user_profiles table.
  Users should be able to delete their own profiles (through account deletion).
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can delete own profile'
  ) THEN
    DROP POLICY "Users can delete own profile" ON user_profiles;
  END IF;
END $$;

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
