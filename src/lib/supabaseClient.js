// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://yfzlvocdvrrplvrkhokh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmemx2b2NkdnJycGx2cmtob2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjQwNzMsImV4cCI6MjA3ODIwMDA3M30.Ky7RALAi4Vt2DhxYBYRmTOivrFLW9kQ4-ftjG_-Oz60';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});