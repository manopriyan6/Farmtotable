/*
  # Farm Direct Marketplace - Initial Database Setup

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `role` (text, either 'farmer' or 'customer')
      - `full_name` (text, required)
      - `farm_name` (text, optional for farmers)
      - `created_at` (timestamp with timezone)

    - `products`
      - `id` (uuid, primary key)
      - `farmer_id` (uuid, references user_profiles)
      - `name` (text, product name)
      - `description` (text, product description)
      - `quantity` (integer, stock quantity)
      - `price` (decimal, product price)
      - `prepared_date` (date, when product was prepared)
      - `qr_code_url` (text, optional QR code URL)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable Row Level Security (RLS) on all tables
    - User profiles: Users can only read and update their own profile
    - Products:
      - All authenticated users can view products
      - Only farmers can create products
      - Farmers can only update/delete their own products

  3. Triggers
    - Automatic `updated_at` timestamp update on product modifications
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('farmer', 'customer')),
  full_name text NOT NULL,
  farm_name text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  price decimal(10,2) NOT NULL,
  prepared_date date NOT NULL,
  qr_code_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for products
CREATE POLICY "Authenticated users can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Farmers can insert own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'farmer'
    )
  );

CREATE POLICY "Farmers can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    farmer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'farmer'
    )
  )
  WITH CHECK (
    farmer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'farmer'
    )
  );

CREATE POLICY "Farmers can delete own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    farmer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'farmer'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
