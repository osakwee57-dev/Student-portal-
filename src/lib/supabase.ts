import { createClient } from '@supabase/supabase-js';

// Fallback values provided by user for preview stability
const FALLBACK_URL = 'https://bannvfxsibavzhflpkcb.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhbm52ZnhzaWJhdnpoZmxwa2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODA3MDAsImV4cCI6MjA5MzE1NjcwMH0.PkpsHusxPzNm8d1cRZWBMaxbvsaGR8zdF9gJMUCmnYo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase initialized successfully with project URL: ", supabaseUrl);
