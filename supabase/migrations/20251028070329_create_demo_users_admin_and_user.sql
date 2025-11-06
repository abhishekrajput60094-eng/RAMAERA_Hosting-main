/*
  # Create Demo Users - Admin and User

  1. Changes
    - Delete existing test account (1234@test.com)
    - Create admin account with email admin@test.com
    - Create user account with email user@test.com
    - Both use password "1234"
  
  2. Security
    - Users must be created in auth.users first
    - Then profiles are created in users_profiles
    - Admin gets super_admin role
    - User gets customer role
*/

-- First, delete the old test account if it exists
DO $$
DECLARE
  old_user_id uuid;
BEGIN
  -- Get the user ID for 1234@test.com
  SELECT id INTO old_user_id FROM auth.users WHERE email = '1234@test.com';
  
  IF old_user_id IS NOT NULL THEN
    -- Delete from users_profiles first (due to foreign key)
    DELETE FROM users_profiles WHERE id = old_user_id;
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = old_user_id;
  END IF;
END $$;

-- Create admin user in auth.users
DO $$
DECLARE
  admin_user_id uuid;
  regular_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@test.com';
  
  IF admin_user_id IS NULL THEN
    -- Create admin in auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      'admin@test.com',
      crypt('1234', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      'authenticated'
    )
    RETURNING id INTO admin_user_id;

    -- Create admin profile
    INSERT INTO users_profiles (
      id,
      email,
      full_name,
      role,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@test.com',
      'Admin User',
      'super_admin',
      now(),
      now()
    );
  END IF;

  -- Check if regular user already exists
  SELECT id INTO regular_user_id FROM auth.users WHERE email = 'user@test.com';
  
  IF regular_user_id IS NULL THEN
    -- Create regular user in auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      'user@test.com',
      crypt('1234', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      'authenticated'
    )
    RETURNING id INTO regular_user_id;

    -- Create user profile
    INSERT INTO users_profiles (
      id,
      email,
      full_name,
      role,
      created_at,
      updated_at
    ) VALUES (
      regular_user_id,
      'user@test.com',
      'Regular User',
      'customer',
      now(),
      now()
    );
  END IF;
END $$;