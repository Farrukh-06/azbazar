-- ============================================
-- AzBazar Complete Supabase Schema
-- Paste this entire file into Supabase SQL Editor
-- and click "Run"
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');
CREATE TYPE seller_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out_of_stock');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash_on_delivery', 'kapital_bank', 'unibank', 'card');

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- SELLERS
-- ============================================
CREATE TABLE sellers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  shop_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  location TEXT DEFAULT 'Bakı',
  trendyol_link TEXT,
  status seller_status DEFAULT 'pending' NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_sales INT DEFAULT 0,
  commission_rate DECIMAL(4,2) DEFAULT 15.00, -- percentage
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  seller_id INT REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(12,2) NOT NULL,
  compare_price DECIMAL(12,2),
  stock INT DEFAULT 0 NOT NULL,
  sku TEXT,
  images JSONB DEFAULT '[]'::jsonb NOT NULL,
  status product_status DEFAULT 'active' NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bakı',
  postal_code TEXT,
  status order_status DEFAULT 'pending' NOT NULL,
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  payment_method payment_method DEFAULT 'cash_on_delivery' NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) DEFAULT 0.00,
  commission DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  seller_id INT REFERENCES sellers(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  commission DECIMAL(12,2) DEFAULT 0.00,
  seller_earnings DECIMAL(12,2) NOT NULL,
  status order_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);
CREATE INDEX idx_sellers_status ON sellers(status);
CREATE INDEX idx_sellers_user ON sellers(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories: anyone can read
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);

-- Products: anyone can read active products, sellers manage their own
CREATE POLICY "products_public_read" ON products FOR SELECT USING (status = 'active' OR seller_id IN (
  SELECT id FROM sellers WHERE user_id = auth.uid()
));
CREATE POLICY "products_seller_insert" ON products FOR INSERT WITH CHECK (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid() AND status = 'approved')
);
CREATE POLICY "products_seller_update" ON products FOR UPDATE USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);
CREATE POLICY "products_seller_delete" ON products FOR DELETE USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);

-- Sellers: public can read approved, seller manages own
CREATE POLICY "sellers_public_read" ON sellers FOR SELECT USING (status = 'approved' OR user_id = auth.uid());
CREATE POLICY "sellers_insert_own" ON sellers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sellers_update_own" ON sellers FOR UPDATE USING (user_id = auth.uid());

-- Orders: customers see own, sellers see their order items
CREATE POLICY "orders_customer_read" ON orders FOR SELECT USING (
  customer_id = auth.uid() OR
  id IN (SELECT order_id FROM order_items WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()))
);
CREATE POLICY "orders_insert_any" ON orders FOR INSERT WITH CHECK (true);

-- Order items
CREATE POLICY "order_items_read" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()) OR
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (true);

-- Admin bypass (via service role in API routes)
-- Admin reads everything through service role key in API

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sellers_timestamp BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Order number generator
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'AZ' || TO_CHAR(NOW(), 'YYMMDDHH24') || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Categories + Demo Sellers + Products)
-- ============================================

-- Categories
INSERT INTO categories (name, slug, icon, description, image_url) VALUES
('Elektronika', 'elektronika', '📱', 'Telefonlar, planşetlər, aksesuarlar', 'https://picsum.photos/seed/elec/600/400'),
('Geyim', 'geyim', '👗', 'Kişi, qadın və uşaq geyimləri', 'https://picsum.photos/seed/cloth/600/400'),
('Ev və Bağ', 'ev-ve-bag', '🏠', 'Ev dekoru, mebel və bağ əşyaları', 'https://picsum.photos/seed/home/600/400'),
('Kosmetika', 'kosmetika', '💄', 'Makiyaj, qulluq və ətirlər', 'https://picsum.photos/seed/cosm/600/400'),
('Kitablar', 'kitablar', '📚', 'Bədii və dərs kitabları', 'https://picsum.photos/seed/book/600/400'),
('İdman', 'idman', '🏋️', 'İdman ləvazimatları', 'https://picsum.photos/seed/sport/600/400'),
('Əl İşi', 'el-isi', '🏺', 'Yerli sənətkarlardan əl işi məmulatlar', 'https://picsum.photos/seed/handmade/600/400'),
('Mətbəx', 'metbex', '🍳', 'Mətbəx ləvazimatları və qab-qacaq', 'https://picsum.photos/seed/kitch/600/400');

-- ============================================
-- ADMIN USER SETUP (run after creating your account)
-- ============================================
-- After signing up at your site, run this with YOUR user id:
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-USER-UUID-HERE';
--
-- To find your UUID: SELECT id FROM profiles WHERE full_name = 'Your Name';
-- ============================================

-- ============================================
-- USEFUL VIEWS
-- ============================================

-- Products with seller and category info
CREATE OR REPLACE VIEW products_full AS
SELECT
  p.*,
  s.shop_name as seller_name,
  s.logo_url as seller_logo,
  s.rating as seller_rating,
  s.status as seller_status,
  c.name as category_name,
  c.slug as category_slug
FROM products p
LEFT JOIN sellers s ON p.seller_id = s.id
LEFT JOIN categories c ON p.category_id = c.id;

-- Orders with item count
CREATE OR REPLACE VIEW orders_summary AS
SELECT
  o.*,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- Seller dashboard stats
CREATE OR REPLACE VIEW seller_stats AS
SELECT
  s.id as seller_id,
  s.shop_name,
  s.status,
  COUNT(DISTINCT p.id) as product_count,
  COALESCE(SUM(oi.total_price), 0) as total_revenue,
  COALESCE(SUM(oi.seller_earnings), 0) as total_earnings,
  COALESCE(SUM(oi.commission), 0) as total_commission,
  COUNT(DISTINCT oi.order_id) as order_count
FROM sellers s
LEFT JOIN products p ON s.id = p.seller_id
LEFT JOIN order_items oi ON s.id = oi.seller_id
GROUP BY s.id, s.shop_name, s.status;
