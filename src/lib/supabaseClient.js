import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase Dashboard: Project Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lreefiutqhkpjrsfjrwa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
