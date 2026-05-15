import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 0;

if (!isConfigured) {
  console.error("CRITICAL: Supabase environment variables are missing or invalid.");
  console.warn("Please update your .env.local file with valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any); // Prevent crash on invalid URL during initialization
