/*
  # Create Demo Test Account

  1. Demo User Setup
    - Creates a demo test account in Supabase auth
    - Email: test@demo.com
    - Password: 1234
    - Role: customer
    - Status: active

  2. Important Notes
    - This creates a fixed UUID for the demo user for consistency
    - The password is intentionally simple for testing purposes
    - In production, you may want to remove or change this account
*/

DO $$
DECLARE
  demo_user_id uuid := 'a0000000-0000-0000-0000-000000000001';
BEGIN
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
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    demo_user_id,
    'authenticated',
    'authenticated',
    'test@demo.com',
    crypt('1234', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Test User"}'::jsonb,
    now(),
    now(),
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE user_id = demo_user_id AND provider = 'email'
  ) THEN
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      demo_user_id::text,
      demo_user_id,
      format('{"sub":"%s","email":"test@demo.com"}', demo_user_id)::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  INSERT INTO users_profiles (
    id,
    full_name,
    role,
    account_status
  ) VALUES (
    demo_user_id,
    'Test User',
    'customer',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
END $$;
