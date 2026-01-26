
import { createClient } from '@supabase/supabase-js';

// Kredensial Database Baru
const supabaseUrl = 'https://hjvbkodhzxxoohsjjpdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdmJrb2Roenh4b29oc2pqcGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDM0NjUsImV4cCI6MjA4NDgxOTQ2NX0.ujM1GcSJsS4lAWS6gPxgtE66NaeVx7a6YCYrtYqpDNk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
