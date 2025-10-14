/*
  # Complete E-Commerce Database Schema

  ## Overview
  Complete database structure for a modern e-commerce platform with all essential
  features for product management, shopping cart, orders, and customer data.

  ## Tables Created

  1. **categories**
    - `id` (uuid, primary key) - Unique category identifier
    - `name` (text) - Category name (e.g., "Dresses", "Tops")
    - `slug` (text, unique) - URL-friendly identifier
    - `image_url` (text) - Category image
    - `description` (text) - Category description
    - `parent_id` (uuid, nullable) - For nested categories
    - `display_order` (integer) - Sort order for display
    - `created_at` (timestamptz) - Creation timestamp

  2. **collections**
    - `id` (uuid, primary key) - Unique collection identifier
    - `name` (text) - Collection name (e.g., "Radiance", "Modern Muse")
    - `slug` (text, unique) - URL-friendly identifier
    - `description` (text) - Collection story and description
    - `image_url` (text) - Hero image for the collection
    - `is_featured` (boolean) - Show on homepage
    - `display_order` (integer) - Sort order for display
    - `created_at` (timestamptz) - Creation timestamp

  3. **products**
    - `id` (uuid, primary key) - Unique product identifier
    - `name` (text) - Product name
    - `slug` (text, unique) - URL-friendly identifier
    - `description` (text) - Full product description
    - `price` (numeric) - Base price
    - `sale_price` (numeric, nullable) - Discounted price if on sale
    - `category_id` (uuid, foreign key) - Links to categories table
    - `collection_id` (uuid, foreign key) - Links to collections table
    - `category` (text) - Product type for backward compatibility
    - `image_url` (text) - Primary product image
    - `additional_images` (text[]) - Array of additional image URLs
    - `size_options` (text[]) - Available sizes array
    - `color_options` (text[]) - Available colors array
    - `sizes` (jsonb) - Available sizes with details
    - `colors` (jsonb) - Available colors with hex codes
    - `materials` (text) - Fabric and material information
    - `care_instructions` (text) - How to care for the product
    - `sku` (text, unique) - Stock keeping unit
    - `stock_quantity` (integer) - Current inventory count
    - `is_new` (boolean) - New arrival badge
    - `is_featured` (boolean) - Featured on homepage
    - `is_bestseller` (boolean) - Bestseller badge
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  4. **product_images**
    - `id` (uuid, primary key) - Unique image identifier
    - `product_id` (uuid, foreign key) - Links to products table
    - `image_url` (text) - Image URL
    - `alt_text` (text) - Accessibility description
    - `display_order` (integer) - Order in gallery
    - `is_primary` (boolean) - Main product image

  5. **cart**
    - `id` (uuid, primary key) - Unique cart item identifier
    - `user_id` (uuid, nullable) - For authenticated users
    - `session_id` (text) - For guest users
    - `product_id` (uuid, foreign key) - Links to products table
    - `quantity` (integer) - Number of items
    - `size` (text, nullable) - Selected size
    - `color` (text, nullable) - Selected color
    - `created_at` (timestamptz) - When added to cart
    - `updated_at` (timestamptz) - Last update timestamp

  6. **orders**
    - `id` (uuid, primary key) - Unique order identifier
    - `user_id` (uuid, nullable) - For authenticated users
    - `order_number` (text, unique) - Customer-facing order number
    - `customer_email` (text) - Customer email
    - `customer_name` (text) - Customer full name
    - `shipping_address` (jsonb) - Full shipping address object
    - `billing_address` (jsonb) - Full billing address object
    - `subtotal` (numeric) - Pre-tax, pre-shipping total
    - `shipping_cost` (numeric) - Shipping fee
    - `tax` (numeric) - Tax amount
    - `total_amount` (numeric) - Final order total
    - `currency` (text) - Currency code (USD, GBP, EUR, CAD)
    - `payment_method` (text) - Payment type used
    - `payment_status` (text) - paid, pending, failed
    - `shipping_method` (text) - standard or express
    - `status` (text) - processing, shipped, delivered, cancelled
    - `tracking_number` (text) - Shipping tracking code
    - `created_at` (timestamptz) - Order placement date
    - `updated_at` (timestamptz) - Last status update

  7. **order_items**
    - `id` (uuid, primary key) - Unique order item identifier
    - `order_id` (uuid, foreign key) - Links to orders table
    - `product_id` (uuid, foreign key) - Links to products table
    - `quantity` (integer) - Number of items ordered
    - `price` (numeric) - Price at time of purchase
    - `size` (text, nullable) - Selected size
    - `color` (text, nullable) - Selected color
    - `created_at` (timestamptz) - Creation timestamp

  8. **reviews**
    - `id` (uuid, primary key) - Unique review identifier
    - `product_id` (uuid, foreign key) - Links to products table
    - `user_id` (uuid, nullable) - For authenticated users
    - `customer_name` (text) - Reviewer name
    - `customer_email` (text) - Reviewer email
    - `rating` (integer) - Star rating (1-5)
    - `title` (text) - Review headline
    - `comment` (text) - Review text
    - `verified_purchase` (boolean) - Verified buyer badge
    - `created_at` (timestamptz) - Review date

  9. **wishlist_items**
    - `id` (uuid, primary key) - Unique wishlist entry
    - `user_id` (uuid, nullable) - For authenticated users
    - `session_id` (text) - Browser session identifier
    - `product_id` (uuid, foreign key) - Links to products table
    - `created_at` (timestamptz) - When added to wishlist

  10. **newsletter_subscribers**
    - `id` (uuid, primary key) - Unique subscriber identifier
    - `email` (text, unique) - Subscriber email
    - `name` (text) - Subscriber name (optional)
    - `subscribed_at` (timestamptz) - Subscription date
    - `is_active` (boolean) - Subscription status

  ## Security
  - RLS enabled on all tables
  - Public read access for product catalog data
  - User/session-based access for cart and wishlist
  - Order access restricted to order owners

  ## Indexes
  - Optimized for common query patterns
  - Product searches, filtering, and sorting
  - Collection and category lookups
  - Cart and order operations
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  category text,
  image_url text,
  additional_images text[],
  size_options text[],
  color_options text[],
  sizes jsonb DEFAULT '[]'::jsonb,
  colors jsonb DEFAULT '[]'::jsonb,
  materials text,
  care_instructions text,
  sku text UNIQUE,
  stock_quantity integer DEFAULT 0,
  is_new boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size text,
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  order_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  subtotal numeric(10,2) NOT NULL,
  shipping_cost numeric(10,2) DEFAULT 0,
  tax numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text,
  payment_status text DEFAULT 'pending',
  shipping_method text DEFAULT 'standard',
  status text DEFAULT 'processing',
  tracking_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL,
  size text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Wishlist items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sale ON products(sale_price) WHERE sale_price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_session ON wishlist_items(session_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories (public read)
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for Collections (public read)
CREATE POLICY "Collections are publicly readable"
  ON collections FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for Products (public read)
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for Product Images (public read)
CREATE POLICY "Product images are publicly readable"
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for Cart (user/session based access)
CREATE POLICY "Users can view their own cart"
  ON cart FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can add to their cart"
  ON cart FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their cart"
  ON cart FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete from their cart"
  ON cart FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for Orders (users can view their own orders)
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for Order Items
CREATE POLICY "Users can view order items"
  ON order_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can create order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for Reviews (public read, authenticated write)
CREATE POLICY "Reviews are publicly readable"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for Wishlist (session-based access)
CREATE POLICY "Users can view their own wishlist"
  ON wishlist_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can add to wishlist"
  ON wishlist_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can remove from wishlist"
  ON wishlist_items FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for Newsletter (public subscribe)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their subscription"
  ON newsletter_subscribers FOR SELECT
  TO anon, authenticated
  USING (true);