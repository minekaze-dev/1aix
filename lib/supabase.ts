
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
 * -- 2. TABEL SMARTPHONE (KATALOG LENGKAP DENGAN FIELD TEKNIS)
 * CREATE TABLE smartphones (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   brand TEXT NOT NULL,
 *   model_name TEXT NOT NULL,
 *   market_category TEXT, -- Entry-level, Mid-range, Flagship
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
 *   
 *   -- Spesifikasi Mendetail (Sesuai Layout Tabel Output)
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
 *   
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 3. TABEL ARTIKEL (BERITA & REVIEW)
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
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 4. TABEL PROFIL PENGGUNA (MEMBER)
 * CREATE TABLE profiles (
 *   id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
 *   display_name TEXT,
 *   email TEXT,
 *   is_blocked BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 5. TABEL TKDN MONITOR (EXTENDED)
 * CREATE TABLE tkdn_monitor (
 *   cert_number TEXT PRIMARY KEY,
 *   brand TEXT,
 *   codename TEXT,
 *   marketing_name TEXT,
 *   tkdn_score NUMERIC,
 *   cert_date DATE,
 *   status TEXT CHECK (status IN ('UPCOMING', 'RELEASED')) DEFAULT 'UPCOMING',
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 6. TABEL TKDN MONITOR ORDER (Untuk menyimpan urutan TKDN item)
 * -- Kolom cert_number REFERENSI ke tkdn_monitor, order_rank untuk posisi di UI.
 * CREATE TABLE tkdn_monitor_order (
 *   cert_number TEXT REFERENCES tkdn_monitor(cert_number) ON DELETE CASCADE PRIMARY KEY,
 *   order_rank INTEGER DEFAULT 0
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
 * 
 * -- KEBIJAKAN AKSES (RLS): Pastikan RLS diatur agar Admin bisa menulis, Publik bisa membaca.
 */