/*
  # Plans and Pricing System

  1. New Tables
    - `plan_types`
      - `id` (uuid, primary key)
      - `name` (text) - e.g., "General Purpose VM", "CPU Optimized VM"
      - `slug` (text) - e.g., "general_purpose", "cpu_optimized"
      - `description` (text)
      - `icon` (text) - icon identifier
      - `color` (text) - UI color theme
      - `created_at` (timestamptz)
    
    - `plans`
      - `id` (uuid, primary key)
      - `plan_type_id` (uuid, foreign key)
      - `name` (text) - e.g., "G.4GB", "C.8GB"
      - `ram_gb` (integer)
      - `vcpu` (integer)
      - `storage_gb` (integer)
      - `bandwidth_tb` (numeric)
      - `is_popular` (boolean)
      - `features` (jsonb) - array of feature strings
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `billing_cycles`
      - `id` (uuid, primary key)
      - `name` (text) - e.g., "Monthly", "Annually"
      - `slug` (text) - e.g., "monthly", "annually"
      - `months` (integer) - number of months in cycle
      - `discount_percent` (integer) - discount percentage
      - `sort_order` (integer)
      - `created_at` (timestamptz)
    
    - `plan_pricing`
      - `id` (uuid, primary key)
      - `plan_id` (uuid, foreign key)
      - `billing_cycle_id` (uuid, foreign key)
      - `price` (numeric) - price in INR
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `add_ons`
      - `id` (uuid, primary key)
      - `name` (text) - e.g., "Extra Storage", "Additional Bandwidth"
      - `slug` (text)
      - `description` (text)
      - `unit` (text) - e.g., "GB", "TB"
      - `price_per_unit` (numeric)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (plans are public data)
    - Restrict write access to authenticated admin users only

  3. Indexes
    - Index on plan_type_id for fast plan lookups
    - Index on billing_cycle slugs for filtering
    - Composite index on plan_pricing for efficient price queries
*/

CREATE TABLE IF NOT EXISTS plan_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'server',
  color text DEFAULT 'blue',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type_id uuid REFERENCES plan_types(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  ram_gb integer NOT NULL,
  vcpu integer NOT NULL,
  storage_gb integer NOT NULL,
  bandwidth_tb numeric DEFAULT 1,
  is_popular boolean DEFAULT false,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  months integer NOT NULL,
  discount_percent integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plan_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  billing_cycle_id uuid REFERENCES billing_cycles(id) ON DELETE CASCADE NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(plan_id, billing_cycle_id)
);

CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  unit text NOT NULL,
  price_per_unit numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plans_plan_type ON plans(plan_type_id);
CREATE INDEX IF NOT EXISTS idx_billing_cycles_slug ON billing_cycles(slug);
CREATE INDEX IF NOT EXISTS idx_plan_pricing_plan_cycle ON plan_pricing(plan_id, billing_cycle_id);

ALTER TABLE plan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to plan types"
  ON plan_types FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to plans"
  ON plans FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to billing cycles"
  ON billing_cycles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to plan pricing"
  ON plan_pricing FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to active add-ons"
  ON add_ons FOR SELECT
  TO public
  USING (is_active = true);
