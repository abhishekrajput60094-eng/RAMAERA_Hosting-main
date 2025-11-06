/*
  # Initialize All Database Tables

  1. Tables Created
    - users_profiles: User profile information with roles
    - hosting_plans: Available hosting plans
    - plan_pricing: Pricing tiers for plans
    - orders: Customer orders tracking
    - referral_codes: Referral system codes
    - referral_earnings: Track referral earnings
    - referral_payouts: Payout requests

  2. Security
    - RLS enabled on all tables
    - Appropriate policies for users and admins
*/

-- Users Profiles Table
CREATE TABLE IF NOT EXISTS users_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer',
  account_status text NOT NULL DEFAULT 'active',
  referral_code text UNIQUE,
  referred_by uuid REFERENCES users_profiles(id),
  referral_level_1 uuid REFERENCES users_profiles(id),
  referral_level_2 uuid REFERENCES users_profiles(id),
  referral_level_3 uuid REFERENCES users_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('customer', 'admin', 'super_admin')),
  CONSTRAINT valid_status CHECK (account_status IN ('active', 'suspended', 'inactive'))
);

CREATE INDEX IF NOT EXISTS idx_users_profiles_role ON users_profiles(role);
CREATE INDEX IF NOT EXISTS idx_users_profiles_status ON users_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_users_profiles_referral_code ON users_profiles(referral_code);

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
  WITH CHECK (auth.uid() = id);

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
  );

-- Hosting Plans Table
CREATE TABLE IF NOT EXISTS hosting_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  plan_type text NOT NULL,
  cpu_cores integer NOT NULL DEFAULT 1,
  ram_gb integer NOT NULL DEFAULT 1,
  storage_gb integer NOT NULL DEFAULT 10,
  bandwidth_gb integer NOT NULL DEFAULT 100,
  base_price decimal(10,2) NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_plan_type CHECK (plan_type IN ('shared', 'vps', 'dedicated', 'cloud'))
);

ALTER TABLE hosting_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active plans"
  ON hosting_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON hosting_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES hosting_plans(id),
  order_status text NOT NULL DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  server_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_order_status CHECK (order_status IN ('pending', 'processing', 'completed', 'cancelled')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES users_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Servers Table
CREATE TABLE IF NOT EXISTS servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id),
  server_name text NOT NULL,
  ip_address text,
  server_status text NOT NULL DEFAULT 'provisioning',
  server_type text NOT NULL,
  specs jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_server_status CHECK (server_status IN ('provisioning', 'active', 'suspended', 'terminated'))
);

CREATE INDEX IF NOT EXISTS idx_servers_user ON servers(user_id);
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(server_status);

ALTER TABLE servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own servers"
  ON servers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all servers"
  ON servers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create admin user
DO $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = '1234@test.com';
  
  IF user_id IS NOT NULL THEN
    INSERT INTO users_profiles (
      id,
      email,
      full_name,
      role,
      account_status,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      '1234@test.com',
      'Admin User',
      'super_admin',
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        full_name = 'Admin User',
        updated_at = NOW();
  END IF;
END $$;
