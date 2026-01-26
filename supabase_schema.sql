
-- 1AIX DATABASE SCHEMA (SUPABASE) - FULL REWRITE
-- Menghapus tabel lama agar skema bersih (CASCADE akan menghapus foreign key terkait)
DROP TABLE IF EXISTS article_views, ratings, comments, articles, smartphones, profiles CASCADE;

-- 1. Profiles Table (Ekstensi dari auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  role TEXT DEFAULT 'MEMBER', -- 'MEMBER' atau 'ADMIN'
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Smartphones Table (Katalog Utama)
CREATE TABLE public.smartphones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model_name TEXT NOT NULL,
  market_category TEXT DEFAULT 'Mid-range', -- 'Entry-level', 'Mid-range', 'Flagship'
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

-- 3. Articles Table (Berita & Review)
CREATE TABLE public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT,
  permalink TEXT UNIQUE,
  publish_date DATE DEFAULT CURRENT_DATE,
  summary TEXT,
  content TEXT,
  categories TEXT[], 
  status TEXT DEFAULT 'DRAFT', 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Comments Table
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL, 
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  user_name TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ratings Table (Likes/Dislikes)
CREATE TABLE public.ratings (
  target_id UUID PRIMARY KEY,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0
);

-- 6. Article Views (Analitik Sederhana)
CREATE TABLE public.article_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  viewed_at DATE DEFAULT CURRENT_DATE,
  reading_time_seconds INTEGER DEFAULT 0
);

-- AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartphones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- KEBIJAKAN RLS: AKSES BACA PUBLIK
CREATE POLICY "Public read smartphones" ON public.smartphones FOR SELECT USING (true);
CREATE POLICY "Public read articles" ON public.articles FOR SELECT USING (status = 'PUBLISHED' OR (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN')));
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public read ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Public view profiles" ON public.profiles FOR SELECT USING (true);

-- KEBIJAKAN RLS: AKSI PENGGUNA TEROTENTIKASI
CREATE POLICY "Logged in users can post comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Logged in users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- KEBIJAKAN RLS: KONTROL ADMIN (Akses penuh untuk peran ADMIN)
CREATE POLICY "Admins have full access on smartphones" ON public.smartphones FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins have full access on articles" ON public.articles FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins manage comments" ON public.comments FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- TRIGGER OTOMATIS: BUAT PROFIL SETELAH SIGN UP
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email), 'MEMBER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
