import { createClient } from '@supabase/supabase-js';

// Kredensial Database 1AIX
const supabaseUrl = 'https://hjvbkodhzxxoohsjjpdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdmJrb2Roenh4b29oc2pqcGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDM0NjUsImV4cCI6MjA4NDgxOTQ2NX0.ujM1GcSJsS4lAWS6gPxgtE66NaeVx7a6YCYrtYqpDNk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ==============================================================================
 * SKEMA DATABASE BARU - PRODUCT VOTES (LIKE/DISLIKE)
 * Jalankan perintah ini di SQL Editor Supabase Anda.
 * ==============================================================================
 * 
 * -- 1. Buat tabel untuk menyimpan setiap suara unik
 * CREATE TABLE IF NOT EXISTS product_votes (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   target_id UUID NOT NULL,
 *   vote_type TEXT CHECK (vote_type IN ('like', 'dislike')),
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   UNIQUE(user_id, target_id) -- Mencegah 1 user voting berkali-kali pada 1 produk
 * );
 * 
 * -- 2. Aktifkan RLS
 * ALTER TABLE product_votes ENABLE ROW LEVEL SECURITY;
 * 
 * -- 3. Kebijakan Baca (Publik/Guest bisa lihat siapa saja yang vote)
 * CREATE POLICY "Siapa saja bisa melihat data vote" ON product_votes FOR SELECT USING (true);
 * 
 * -- 4. Kebijakan Insert/Update/Delete (Hanya user sendiri)
 * CREATE POLICY "User hanya bisa mengelola vote miliknya sendiri" 
 * ON product_votes FOR ALL 
 * USING (auth.uid() = user_id)
 * WITH CHECK (auth.uid() = user_id);
 */