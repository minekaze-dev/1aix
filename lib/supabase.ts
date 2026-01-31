import { createClient } from '@supabase/supabase-js';

// Kredensial Database 1AIX
const supabaseUrl = 'https://hjvbkodhzxxoohsjjpdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdmJrb2Roenh4b29oc2pqcGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDM0NjUsImV4cCI6MjA4NDgxOTQ2NX0.ujM1GcSJsS4lAWS6gPxgtE66NaeVx7a6YCYrtYqpDNk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ==============================================================================
 * SALINAN SKRIP SQL (DATABASE SCHEMA) - BALAS KOMENTAR & RLS
 * Jalankan perintah ini di SQL Editor Supabase Anda untuk mengaktifkan fitur balas.
 * ==============================================================================
 * 
 * -- 1. PASTIKAN TABEL KOMENTAR MEMILIKI KOLOM parent_id
 * ALTER TABLE comments 
 * ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;
 * 
 * -- 2. AKTIFKAN RLS
 * ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
 * 
 * -- 3. KEBIJAKAN BACA (PUBLIK)
 * CREATE POLICY "Komentar dapat dilihat publik" ON comments FOR SELECT USING (true);
 * 
 * -- 4. KEBIJAKAN INSERT (HANYA USER LOGIN)
 * CREATE POLICY "Hanya user login yang bisa kirim komentar" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
 * 
 * -- 5. SKEMA LENGKAP TABEL KOMENTAR (REFERENSI)
 * 
 * CREATE TABLE IF NOT EXISTS comments (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   target_id UUID NOT NULL, 
 *   parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Field untuk balas komentar
 *   user_id UUID REFERENCES auth.users,
 *   user_name TEXT,
 *   text TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */
