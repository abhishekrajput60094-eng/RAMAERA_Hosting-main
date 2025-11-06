/*
  # Create Orders Table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - User who placed the order
      - `plan_id` (uuid) - Selected plan
      - `billing_cycle_id` (uuid) - Billing cycle
      - `amount` (numeric) - Total order amount
      - `status` (text) - Order status (pending, paid, cancelled, refunded)
      - `payment_method` (text) - Payment method used
      - `payment_reference` (text) - Payment gateway reference
      - `is_recurring` (boolean) - Whether this is a recurring order
      - `next_billing_date` (timestamptz) - Next billing date for recurring orders
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on orders table
    - Users can read their own orders
    - Admins can read all orders
    - Orders are created through secure functions only

  3. Indexes
    - Index on user_id for user queries
    - Index on status for filtering
    - Index on next_billing_date for billing automation
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  billing_cycle_id uuid NOT NULL REFERENCES billing_cycles(id) ON DELETE RESTRICT,
  amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  payment_method text,
  payment_reference text,
  is_recurring boolean DEFAULT false,
  next_billing_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_next_billing_date ON orders(next_billing_date);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();