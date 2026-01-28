
import { createClient } from '@supabase/supabase-js';

// Kredensial Database 1AIX
const supabaseUrl = 'https://hjvbkodhzxxoohsjjpdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdmJrb2Roenh4b29oc2pqcGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDM0NjUsImV4cCI6MjA4NDgxOTQ2NX0.ujM1GcSJsS4lAWS6gPxgtE66NaeVx7a6YCYrtYqpDNk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ==============================================================================
 * SALINAN SKRIP SQL (DATABASE SCHEMA) - TERBARU
 * Jalankan perintah ini di SQL Editor Supabase Anda untuk sinkronisasi penuh.
 * ==============================================================================
 * 
 * -- 1. TABEL PENULIS (AUTHORS)
 * CREATE TABLE IF NOT EXISTS authors (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   role TEXT CHECK (role IN ('ADMIN', 'AUTHOR')) DEFAULT 'AUTHOR',
 *   email TEXT UNIQUE NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 2. TABEL IKLAN (ADS BANNERS)
 * CREATE TABLE IF NOT EXISTS ads_banners (
 *   id TEXT PRIMARY KEY, -- 'header', 'article', 'sidebar'
 *   image_url TEXT,
 *   target_url TEXT,
 *   title TEXT,
 *   subtitle TEXT,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- RLS UNTUK IKLAN
 * ALTER TABLE ads_banners ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Public view ads" ON ads_banners FOR SELECT USING (true);
 * CREATE POLICY "Admin manage ads" ON ads_banners FOR ALL USING (auth.jwt() ->> 'email' IN ('admin@1aix.com', 'rifki.mau@gmail.com'));
 * 
 * -- INSERT DEFAULT VALUES
 * INSERT INTO ads_banners (id, image_url, target_url) 
 * VALUES ('header', '', '#'), ('article', '', '#'), ('sidebar', '', '#') 
 * ON CONFLICT (id) DO NOTHING;
 *
 * -- 3. TABEL SMARTPHONE (KATALOG LENGKAP DENGAN FIELD TEKNIS)
 * CREATE TABLE smartphones (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   brand TEXT NOT NULL,
 *   model_name TEXT NOT NULL,
 *   market_category TEXT, 
 *   release_status TEXT CHECK (release_status IN ('Tersedia', 'Pre-Order', 'Segera Rilis')),
 *   release_month TEXT,
 *   release_year TEXT,
 *   launch_date_indo DATE,
 *   tkdn_score NUMERIC,
 *   chipset TEXT,
 *   ram_storage TEXT,
 *   price_srp BIGINT,
 *   image_url TEXT,
 *   official_store_link TEXT,
 *   order_rank INTEGER DEFAULT 0,
 *   dimensions_weight TEXT,
 *   material TEXT,
 *   colors TEXT,
 *   network TEXT DEFAULT 'GSM / HSPA / LTE / 5G',
 *   wifi TEXT,
 *   display_type TEXT, 
 *   os TEXT, 
 *   cpu TEXT, 
 *   gpu TEXT,
 *   camera_main TEXT, 
 *   camera_video_main TEXT,
 *   camera_selfie TEXT, 
 *   camera_video_selfie TEXT,
 *   battery_capacity TEXT, 
 *   charging TEXT,
 *   sensors TEXT,
 *   usb_type TEXT DEFAULT 'USB Type-C 2.0',
 *   audio TEXT DEFAULT 'Loudspeaker, 3.5mm jack',
 *   features_extra TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 4. TABEL ARTIKEL (BERITA & REVIEW)
 * CREATE TABLE articles (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   cover_image_url TEXT,
 *   tags TEXT,
 *   permalink TEXT UNIQUE,
 *   publish_date DATE DEFAULT CURRENT_DATE,
 *   summary TEXT,
 *   content TEXT,
 *   categories TEXT[], 
 *   status TEXT CHECK (status IN ('DRAFT', 'PUBLISHED', 'TRASH')) DEFAULT 'DRAFT',
 *   author_name TEXT DEFAULT 'Redaksi 1AIX',
 *   author_id UUID REFERENCES authors(id),
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 5. TABEL PROFIL PENGGUNA (MEMBER)
 * CREATE TABLE profiles (
 *   id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
 *   display_name TEXT,
 *   email TEXT,
 *   is_blocked BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 6. TABEL TKDN MONITOR
 * CREATE TABLE tkdn_monitor (
 *   cert_number TEXT PRIMARY KEY,
 *   brand TEXT,
 *   codename TEXT,
 *   marketing_name TEXT,
 *   tkdn_score NUMERIC,
 *   cert_date DATE,
 *   status TEXT CHECK (status IN ('UPCOMING', 'RELEASED')) DEFAULT 'UPCOMING',
 *   is_visible BOOLEAN DEFAULT TRUE,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 7. TABEL KOMENTAR
 * CREATE TABLE comments (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   target_id UUID, 
 *   user_id UUID REFERENCES auth.users,
 *   user_name TEXT,
 *   text TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 8. TABEL RATING (LIKES/DISLIKES)
 * CREATE TABLE ratings (
 *   target_id UUID PRIMARY KEY,
 *   likes INTEGER DEFAULT 0,
 *   dislikes INTEGER DEFAULT 0,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 9. TABEL ANALITIK
 * CREATE TABLE site_analytics (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   event_type TEXT NOT NULL,
 *   value NUMERIC DEFAULT 1,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */
