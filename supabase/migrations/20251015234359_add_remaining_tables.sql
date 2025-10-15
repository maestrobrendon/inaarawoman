/*
  # Add Remaining Admin Tables
  
  1. New Tables
    - collections
    - collection_products
    - inventory_logs
    - store_settings
    - shipping_zones
    - email_templates
*/

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  status text DEFAULT 'active',
  position integer DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Collection products junction table
CREATE TABLE IF NOT EXISTS collection_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, product_id)
);

ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

-- Inventory logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  change_type text NOT NULL,
  quantity_before integer NOT NULL,
  quantity_after integer NOT NULL,
  quantity_change integer NOT NULL,
  reason text,
  reference_id uuid,
  reference_type text,
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Store settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Shipping zones table
CREATE TABLE IF NOT EXISTS shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  countries text[],
  states text[],
  cities text[],
  flat_rate numeric(10,2),
  free_shipping_threshold numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text,
  variables jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_collection_products_collection ON collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product ON collection_products(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created ON inventory_logs(created_at DESC);

-- Insert default store settings
INSERT INTO store_settings (key, value, category, description)
VALUES
  ('store_name', '"INAARA"', 'general', 'Store name'),
  ('store_email', '"contact@inaara.com"', 'general', 'Store contact email'),
  ('store_currency', '"NGN"', 'general', 'Store currency'),
  ('tax_rate', '0', 'pricing', 'Default tax rate percentage'),
  ('low_stock_threshold', '5', 'inventory', 'Low stock alert threshold')
ON CONFLICT (key) DO NOTHING;
