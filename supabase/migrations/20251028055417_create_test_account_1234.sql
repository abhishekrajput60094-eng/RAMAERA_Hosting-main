/*
  # Create Test Account with ID 1234

  1. Purpose
    - Creates a test account for easy login access
    - Email: 1234@test.com
    - Password: 1234
  
  2. Security Note
    - This is a test account for development/demo purposes
    - Email confirmation is disabled by default in Supabase
*/

-- Insert test user into auth.users (Supabase will handle the hashing)
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO user_id FROM auth.users WHERE email = '1234@test.com';
  
  IF user_id IS NULL THEN
    -- Insert new user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      '1234@test.com',
      crypt('1234', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO user_id;
  END IF;
END $$;
