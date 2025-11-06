/*
  # Fix Demo User Passwords

  1. Changes
    - Update password encryption for admin and user accounts
    - Use proper Supabase auth password format
    - Ensure passwords work with signInWithPassword
  
  2. Notes
    - Password is "1234" for both accounts
    - Uses pgcrypto extension for proper bcrypt hashing
*/

-- Update admin password
UPDATE auth.users
SET 
  encrypted_password = crypt('1234', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@test.com';

-- Update user password
UPDATE auth.users
SET 
  encrypted_password = crypt('1234', gen_salt('bf')),
  updated_at = now()
WHERE email = 'user@test.com';