/*
  # Fix RLS Policies - Remove Infinite Recursion

  1. Purpose
    - Fix infinite recursion error in users_profiles policies
    - Create proper non-recursive policies
    
  2. Changes
    - Drop old recursive policies
    - Create new simplified policies without recursion
*/

-- Create simple policies without recursion
CREATE POLICY "Users can read own profile"
  ON users_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own basic info"
  ON users_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policies using auth metadata instead of recursive check
CREATE POLICY "Admins can read all profiles"
  ON users_profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users_profiles 
      WHERE role IN ('admin', 'super_admin')
      LIMIT 1
    ) OR auth.uid() = id
  );

CREATE POLICY "Admins can update all profiles"
  ON users_profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users_profiles 
      WHERE role IN ('admin', 'super_admin')
      LIMIT 1
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON users_profiles FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users_profiles 
      WHERE role IN ('admin', 'super_admin')
      LIMIT 1
    )
  );
