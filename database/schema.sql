-- PostgreSQL schema for Farm2Home

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  start_price INTEGER NOT NULL CHECK (start_price >= 0),
  current_price INTEGER NOT NULL CHECK (current_price >= 0),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  winner_id BIGINT REFERENCES users(id),
  minimum_increment INTEGER NOT NULL DEFAULT 100 CHECK (minimum_increment > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  id BIGSERIAL PRIMARY KEY,
  auction_id BIGINT NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bid_amount INTEGER NOT NULL CHECK (bid_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  auction_id BIGINT REFERENCES auctions(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id BIGSERIAL PRIMARY KEY,
  auction_id BIGINT REFERENCES auctions(id) ON DELETE SET NULL,
  buyer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_auctions_product_id ON auctions(product_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_winner_id ON auctions(winner_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_auction_id ON orders(auction_id);

-- =============================================================
-- Seed: default accounts (auto-created on first Docker run)
-- Admin    → admin@farm2home.com / admin@123
-- Farmer   → farmer@test.com    / password123
-- Buyer    → buyer@test.com     / password123
-- =============================================================
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin',       'admin@farm2home.com', '$2b$10$Ivyg7KMBsh7L7Fm4RkTBOOat/nvjWmevQF47nBdB4YoBbixLBEJBW', 'admin'),
  ('Test Farmer', 'farmer@test.com',     '$2b$10$Ba6s342kEh8AwLPntmtuVOSIs5/0aJbZ09gecl1rgHZ/qeWphTk/q', 'farmer'),
  ('Test Buyer',  'buyer@test.com',      '$2b$10$Ba6s342kEh8AwLPntmtuVOSIs5/0aJbZ09gecl1rgHZ/qeWphTk/q', 'buyer')
ON CONFLICT (email) DO NOTHING;

-- =============================================================
-- Seed: sample products (created by Test Farmer)
-- Uses subquery so farmer_id is always correct regardless of sequence
-- =============================================================
INSERT INTO products (farmer_id, name, description, price_cents, stock)
SELECT id, 'Organic Tomatoes',    'Fresh red organic tomatoes grown without pesticides. Perfect for salads and cooking.', 4500,  150 FROM users WHERE email = 'farmer@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO products (farmer_id, name, description, price_cents, stock)
SELECT id, 'Raw Honey 500g',      'Pure raw honey harvested directly from beehives. Rich in natural enzymes.', 32000, 40  FROM users WHERE email = 'farmer@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO products (farmer_id, name, description, price_cents, stock)
SELECT id, 'Fresh Spinach 500g',  'Crisp green spinach leaves, farm-fresh and packed with iron and vitamins.', 2500,  200 FROM users WHERE email = 'farmer@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO products (farmer_id, name, description, price_cents, stock)
SELECT id, 'Turmeric Powder 1kg', 'Authentic whole and ground turmeric with high curcumin content.', 18000, 80  FROM users WHERE email = 'farmer@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO products (farmer_id, name, description, price_cents, stock)
SELECT id, 'Basmati Rice 5kg',    'Premium long-grain basmati rice. Aged for 2 years for perfect aroma and texture.', 95000, 60  FROM users WHERE email = 'farmer@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO products (farmer_id, name, description, price_cents, stock)
SELECT id, 'Farm Fresh Eggs (12)','Free-range farm eggs from grain-fed hens. Rich in protein and omega-3.', 12000, 120 FROM users WHERE email = 'farmer@test.com'
ON CONFLICT DO NOTHING;

-- =============================================================
-- Seed: 2 active auctions (for the first 2 products)
-- =============================================================
INSERT INTO auctions (product_id, start_price, current_price, start_time, end_time, status, minimum_increment)
SELECT p.id, p.price_cents, p.price_cents,
  NOW(),
  NOW() + INTERVAL '5 minutes',
  'active',
  100
FROM products p
JOIN users u ON u.id = p.farmer_id
WHERE u.email = 'farmer@test.com'
  AND p.name = 'Organic Tomatoes'
ON CONFLICT DO NOTHING;

INSERT INTO auctions (product_id, start_price, current_price, start_time, end_time, status, minimum_increment)
SELECT p.id, p.price_cents, p.price_cents,
  NOW(),
  NOW() + INTERVAL '3 minutes',
  'active',
  200
FROM products p
JOIN users u ON u.id = p.farmer_id
WHERE u.email = 'farmer@test.com'
  AND p.name = 'Raw Honey 500g'
ON CONFLICT DO NOTHING;
