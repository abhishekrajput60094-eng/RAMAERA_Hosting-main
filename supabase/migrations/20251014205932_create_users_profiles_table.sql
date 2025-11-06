/*
  # Create Users Profiles Table

  1. New Tables
    - `users_profiles`
      - `id` (uuid, primary key) - matches Supabase auth.users id
      - `full_name` (text) - user's full name
      - `role` (text) - user role (customer, admin, super_admin)
      - `account_status` (text) - account status (active, suspended, inactive)
      - `created_at` (timestamptz) - when profile was created
      - `updated_at` (timestamptz) - last profile update

  2. Security
    - Enable RLS on users_profiles table
    - Users can read their own profile
    - Users can insert their own profile during signup
    - Users can update their own profile (except role and account_status)
    - Only admins can update roles and account status
    - Only admins can read all profiles

  3. Indexes
    - Index on role for admin queries
    - Index on account_status for filtering
*/

CREATE TABLE IF NOT EXISTS users_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'customer',
  account_status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('customer', 'admin', 'super_admin')),
  CONSTRAINT valid_status CHECK (account_status IN ('active', 'suspended', 'inactive'))
);

CREATE INDEX IF NOT EXISTS idx_users_profiles_role ON users_profiles(role);
CREATE INDEX IF NOT EXISTS idx_users_profiles_status ON users_profiles(account_status);

ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM users_profiles WHERE id = auth.uid()) AND
    account_status = (SELECT account_status FROM users_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can read all profiles"
  ON users_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON users_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_profiles_updated_at
  BEFORE UPDATE ON users_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();