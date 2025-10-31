// src/lib/attach-supabase.js
import { createClient } from '@supabase/supabase-js';

export default async function ensureSupabaseGlobal() {
  if (window.AlshamSupabase?.supabase) {
    console.info('Supabase já inicializado globalmente.');
    return;
  }

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes no Vercel.');
  }

  const supabase = createClient(url, key);

  window.supabase = supabase;
  window.AlshamSupabase = {
    supabase,
    auth: supabase.auth
  };

  console.info('Supabase inicializado via attach-supabase.js');
}
