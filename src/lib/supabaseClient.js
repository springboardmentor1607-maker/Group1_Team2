import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase Dashboard: Project Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lreefiutqhkpjrsfjrwa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

let supabase;
try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (err) {
    console.error('Failed to initialize Supabase:', err);
    supabase = null;
}

export { supabase };
