
-- 1AIX DATABASE SCHEMA (SUPABASE)
-- Execute this script in the Supabase SQL Editor

-- 1. Profiles Table (Extends Auth Users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Smartphones Table (Catalog)
CREATE TABLE smartphones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model_name TEXT NOT NULL,
  release_status TEXT DEFAULT 'Tersedia',
  release_month TEXT,
  release_year TEXT,
  launch_date_indo DATE,
  tkdn_score NUMERIC(5,2),
  chipset TEXT,
  ram_storage TEXT,
  price_srp BIGINT,
  image_url TEXT,
  official_store_link TEXT,
  postel_cert TEXT,
  model_code TEXT,
  dimensions_weight TEXT,
  material TEXT,
  colors TEXT,
  network TEXT,
  wifi TEXT,
  display_type TEXT,
  os TEXT,
  cpu TEXT,
  gpu TEXT,
  camera_main TEXT,
  camera_video_main TEXT,
  camera_selfie TEXT,
  camera_video_selfie TEXT,
  battery_capacity TEXT,
  charging TEXT,
  sensors TEXT,
  usb_type TEXT,
  audio TEXT,
  features_extra TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Articles Table (News/Reviews)
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT,
  permalink TEXT UNIQUE,
  publish_date DATE DEFAULT CURRENT_DATE,
  summary TEXT,
  content TEXT,
  categories TEXT[], -- Array of categories
  status TEXT DEFAULT 'DRAFT', -- DRAFT or PUBLISHED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TKDN Published Table (Monitor Feed)
CREATE TABLE tkdn_published (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT,
  codename TEXT,
  marketing_name TEXT,
  tkdn_score NUMERIC(5,2),
  cert_number TEXT,
  cert_date DATE,
  status TEXT DEFAULT 'UPCOMING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE smartphones ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tkdn_published ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ACCESS POLICIES
CREATE POLICY "Public read smartphones" ON smartphones FOR SELECT USING (true);
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public read tkdn" ON tkdn_published FOR SELECT USING (true);
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- ADMIN WRITE ACCESS (Assumes an 'admin' role or specific UID - Adjust as needed)
-- For development, you might want to restrict these to authenticated users:
CREATE POLICY "Auth users can manage smartphones" ON smartphones FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth users can manage articles" ON articles FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth users can manage tkdn" ON tkdn_published FOR ALL TO authenticated USING (true);
