import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project-url.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.info(
    '💡 Supabase is not configured with environment variables (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY). Running in Local Storage Demo Mode.'
  );
}

// Fallback dummy URL to prevent createClient initialization crash when unconfigured
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
