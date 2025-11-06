/*
  # Create Referral System

  1. New Columns in users_profiles
    - `referral_code` (text, unique) - User's unique referral code
    - `referred_by` (uuid) - ID of user who referred them
    - `referral_level_1` (uuid) - Direct referrer (L1)
    - `referral_level_2` (uuid) - L2 referrer
    - `referral_level_3` (uuid) - L3 referrer
    - `total_referrals` (integer) - Total number of referrals
    - `l1_referrals` (integer) - Direct referrals count
    - `l2_referrals` (integer) - Level 2 referrals count
    - `l3_referrals` (integer) - Level 3 referrals count
    - `total_earnings` (numeric) - Total commission earned
    - `available_balance` (numeric) - Available balance for withdrawal
    - `total_withdrawn` (numeric) - Total amount withdrawn

  2. New Tables
    - `referral_earnings` - Track all commission earnings
      - `id` (uuid, primary key)
      - `user_id` (uuid) - User who earned the commission
      - `referral_user_id` (uuid) - User who was referred
      - `order_id` (uuid) - Related order
      - `level` (integer) - Referral level (1, 2, or 3)
      - `commission_percentage` (numeric) - Commission rate applied
      - `order_amount` (numeric) - Order amount
      - `commission_amount` (numeric) - Commission earned
      - `is_recurring` (boolean) - Whether this is recurring commission
      - `created_at` (timestamptz)

    - `referral_payouts` - Track payout requests and status
      - `id` (uuid, primary key)
      - `user_id` (uuid) - User requesting payout
      - `payout_number` (text, unique) - Unique payout identifier
      - `gross_amount` (numeric) - Amount before deductions
      - `tds_amount` (numeric) - TDS deduction (10%)
      - `service_tax_amount` (numeric) - GST (18%)
      - `net_amount` (numeric) - Final payout amount
      - `status` (text) - requested, under_review, approved, rejected, paid
      - `payment_method` (text) - bank_transfer, upi, paypal
      - `bank_account_details` (jsonb) - Bank account info
      - `upi_id` (text) - UPI ID
      - `paypal_email` (text) - PayPal email
      - `requested_at` (timestamptz)
      - `processed_at` (timestamptz)
      - `payment_reference` (text) - Payment reference number
      - `rejected_reason` (text) - Reason for rejection
      - `tax_year` (integer) - Year for tax purposes
      - `tax_quarter` (integer) - Quarter for tax purposes
      - `created_at` (timestamptz)

  3. Functions
    - `generate_referral_code()` - Generate unique referral code
    - `process_referral_commission()` - Calculate and distribute commissions
    - `request_referral_payout()` - Request payout
    - `admin_approve_payout()` - Approve payout request
    - `admin_reject_payout()` - Reject payout request
    - `get_admin_referral_stats()` - Get admin statistics

  4. Security
    - Enable RLS on all new tables
    - Add policies for user and admin access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN referral_code text UNIQUE;
    ALTER TABLE users_profiles ADD COLUMN referred_by uuid REFERENCES users_profiles(id);
    ALTER TABLE users_profiles ADD COLUMN referral_level_1 uuid REFERENCES users_profiles(id);
    ALTER TABLE users_profiles ADD COLUMN referral_level_2 uuid REFERENCES users_profiles(id);
    ALTER TABLE users_profiles ADD COLUMN referral_level_3 uuid REFERENCES users_profiles(id);
    ALTER TABLE users_profiles ADD COLUMN total_referrals integer DEFAULT 0;
    ALTER TABLE users_profiles ADD COLUMN l1_referrals integer DEFAULT 0;
    ALTER TABLE users_profiles ADD COLUMN l2_referrals integer DEFAULT 0;
    ALTER TABLE users_profiles ADD COLUMN l3_referrals integer DEFAULT 0;
    ALTER TABLE users_profiles ADD COLUMN total_earnings numeric(10, 2) DEFAULT 0;
    ALTER TABLE users_profiles ADD COLUMN available_balance numeric(10, 2) DEFAULT 0;
    ALTER TABLE users_profiles ADD COLUMN total_withdrawn numeric(10, 2) DEFAULT 0;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS referral_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
  referral_user_id uuid NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  level integer NOT NULL CHECK (level IN (1, 2, 3)),
  commission_percentage numeric(5, 2) NOT NULL,
  order_amount numeric(10, 2) NOT NULL,
  commission_amount numeric(10, 2) NOT NULL,
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
  payout_number text UNIQUE NOT NULL,
  gross_amount numeric(10, 2) NOT NULL,
  tds_amount numeric(10, 2) NOT NULL,
  service_tax_amount numeric(10, 2) NOT NULL,
  net_amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'under_review', 'approved', 'rejected', 'paid')),
  payment_method text NOT NULL CHECK (payment_method IN ('bank_transfer', 'upi', 'paypal')),
  bank_account_details jsonb,
  upi_id text,
  paypal_email text,
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  payment_reference text,
  rejected_reason text,
  tax_year integer NOT NULL,
  tax_quarter integer NOT NULL CHECK (tax_quarter BETWEEN 1 AND 4),
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  code_exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));

    SELECT EXISTS(SELECT 1 FROM users_profiles WHERE referral_code = code) INTO code_exists;

    IF NOT code_exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION set_user_referral_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_set_referral_code'
  ) THEN
    CREATE TRIGGER trigger_set_referral_code
      BEFORE INSERT ON users_profiles
      FOR EACH ROW
      EXECUTE FUNCTION set_user_referral_code();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION process_referral_commission(
  p_order_id uuid,
  p_user_id uuid,
  p_order_amount numeric,
  p_is_recurring boolean
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_l1_user_id uuid;
  v_l2_user_id uuid;
  v_l3_user_id uuid;
  v_l1_commission numeric;
  v_l2_commission numeric;
  v_l3_commission numeric;
  v_l1_rate numeric;
  v_l2_rate numeric;
  v_l3_rate numeric;
BEGIN
  SELECT referral_level_1, referral_level_2, referral_level_3
  INTO v_l1_user_id, v_l2_user_id, v_l3_user_id
  FROM users_profiles
  WHERE id = p_user_id;

  IF p_is_recurring THEN
    v_l1_rate := 5.0;
    v_l2_rate := 1.0;
    v_l3_rate := 1.0;
  ELSE
    v_l1_rate := 15.0;
    v_l2_rate := 3.0;
    v_l3_rate := 2.0;
  END IF;

  IF v_l1_user_id IS NOT NULL THEN
    v_l1_commission := p_order_amount * (v_l1_rate / 100);

    INSERT INTO referral_earnings (
      user_id, referral_user_id, order_id, level,
      commission_percentage, order_amount, commission_amount, is_recurring
    ) VALUES (
      v_l1_user_id, p_user_id, p_order_id, 1,
      v_l1_rate, p_order_amount, v_l1_commission, p_is_recurring
    );

    UPDATE users_profiles
    SET total_earnings = total_earnings + v_l1_commission,
        available_balance = available_balance + v_l1_commission
    WHERE id = v_l1_user_id;
  END IF;

  IF v_l2_user_id IS NOT NULL THEN
    v_l2_commission := p_order_amount * (v_l2_rate / 100);

    INSERT INTO referral_earnings (
      user_id, referral_user_id, order_id, level,
      commission_percentage, order_amount, commission_amount, is_recurring
    ) VALUES (
      v_l2_user_id, p_user_id, p_order_id, 2,
      v_l2_rate, p_order_amount, v_l2_commission, p_is_recurring
    );

    UPDATE users_profiles
    SET total_earnings = total_earnings + v_l2_commission,
        available_balance = available_balance + v_l2_commission
    WHERE id = v_l2_user_id;
  END IF;

  IF v_l3_user_id IS NOT NULL THEN
    v_l3_commission := p_order_amount * (v_l3_rate / 100);

    INSERT INTO referral_earnings (
      user_id, referral_user_id, order_id, level,
      commission_percentage, order_amount, commission_amount, is_recurring
    ) VALUES (
      v_l3_user_id, p_user_id, p_order_id, 3,
      v_l3_rate, p_order_amount, v_l3_commission, p_is_recurring
    );

    UPDATE users_profiles
    SET total_earnings = total_earnings + v_l3_commission,
        available_balance = available_balance + v_l3_commission
    WHERE id = v_l3_user_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION request_referral_payout(
  p_amount numeric,
  p_payment_method text,
  p_bank_account_details jsonb DEFAULT NULL,
  p_upi_id text DEFAULT NULL,
  p_paypal_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_available_balance numeric;
  v_payout_id uuid;
  v_payout_number text;
  v_tds_amount numeric;
  v_service_tax_amount numeric;
  v_net_amount numeric;
  v_current_year integer;
  v_current_quarter integer;
BEGIN
  v_user_id := auth.uid();

  SELECT available_balance INTO v_available_balance
  FROM users_profiles
  WHERE id = v_user_id;

  IF v_available_balance < 500 THEN
    RAISE EXCEPTION 'Minimum payout amount is ₹500';
  END IF;

  IF p_amount > v_available_balance THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  v_tds_amount := p_amount * 0.10;
  v_service_tax_amount := p_amount * 0.18;
  v_net_amount := p_amount - v_tds_amount - v_service_tax_amount;

  v_current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  v_current_quarter := EXTRACT(QUARTER FROM CURRENT_DATE);

  v_payout_number := 'PO' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' ||
                     lpad(floor(random() * 10000)::text, 4, '0');

  INSERT INTO referral_payouts (
    user_id, payout_number, gross_amount, tds_amount,
    service_tax_amount, net_amount, status, payment_method,
    bank_account_details, upi_id, paypal_email,
    tax_year, tax_quarter
  ) VALUES (
    v_user_id, v_payout_number, p_amount, v_tds_amount,
    v_service_tax_amount, v_net_amount, 'requested', p_payment_method,
    p_bank_account_details, p_upi_id, p_paypal_email,
    v_current_year, v_current_quarter
  ) RETURNING id INTO v_payout_id;

  UPDATE users_profiles
  SET available_balance = available_balance - p_amount
  WHERE id = v_user_id;

  RETURN v_payout_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_approve_payout(
  p_payout_id uuid,
  p_payment_reference text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_gross_amount numeric;
BEGIN
  SELECT user_id, gross_amount INTO v_user_id, v_gross_amount
  FROM referral_payouts
  WHERE id = p_payout_id AND status IN ('requested', 'under_review');

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Payout not found or already processed';
  END IF;

  UPDATE referral_payouts
  SET status = 'paid',
      processed_at = now(),
      payment_reference = p_payment_reference
  WHERE id = p_payout_id;

  UPDATE users_profiles
  SET total_withdrawn = total_withdrawn + v_gross_amount
  WHERE id = v_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_reject_payout(
  p_payout_id uuid,
  p_rejected_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_gross_amount numeric;
BEGIN
  SELECT user_id, gross_amount INTO v_user_id, v_gross_amount
  FROM referral_payouts
  WHERE id = p_payout_id AND status IN ('requested', 'under_review');

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Payout not found or already processed';
  END IF;

  UPDATE referral_payouts
  SET status = 'rejected',
      processed_at = now(),
      rejected_reason = p_rejected_reason
  WHERE id = p_payout_id;

  UPDATE users_profiles
  SET available_balance = available_balance + v_gross_amount
  WHERE id = v_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_admin_referral_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats json;
BEGIN
  SELECT json_build_object(
    'totalReferrals', COALESCE(SUM(total_referrals), 0),
    'totalEarnings', COALESCE(SUM(total_earnings), 0),
    'pendingPayouts', COALESCE(
      (SELECT SUM(gross_amount) FROM referral_payouts
       WHERE status IN ('requested', 'under_review')), 0
    ),
    'completedPayouts', COALESCE(
      (SELECT SUM(gross_amount) FROM referral_payouts
       WHERE status = 'paid'), 0
    )
  ) INTO v_stats
  FROM users_profiles;

  RETURN v_stats;
END;
$$;

CREATE OR REPLACE FUNCTION update_referral_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.referral_level_1 IS NOT NULL THEN
    UPDATE users_profiles
    SET l1_referrals = l1_referrals + 1,
        total_referrals = total_referrals + 1
    WHERE id = NEW.referral_level_1;
  END IF;

  IF NEW.referral_level_2 IS NOT NULL THEN
    UPDATE users_profiles
    SET l2_referrals = l2_referrals + 1,
        total_referrals = total_referrals + 1
    WHERE id = NEW.referral_level_2;
  END IF;

  IF NEW.referral_level_3 IS NOT NULL THEN
    UPDATE users_profiles
    SET l3_referrals = l3_referrals + 1,
        total_referrals = total_referrals + 1
    WHERE id = NEW.referral_level_3;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_referral_counts'
  ) THEN
    CREATE TRIGGER trigger_update_referral_counts
      AFTER INSERT ON users_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_referral_counts();
  END IF;
END $$;

ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earnings"
  ON referral_earnings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payouts"
  ON referral_payouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all earnings"
  ON referral_earnings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view all payouts"
  ON referral_payouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update payouts"
  ON referral_payouts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
