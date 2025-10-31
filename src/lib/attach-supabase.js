// src/lib/attach-supabase.js
console.info('Iniciando attach-supabase...');

...');

export async function ensureSupabaseGlobal() {
  if (typeof window === 'undefined') return null;
  if (window.AlshamSupabase?.supabase) {
    console.info('Supabase já inicializado.');
    return window.AlshamSupabase;
  }

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes.');
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key);

  window.supabase = supabase;
  window.AlshamSupabase = { supabase, auth: supabase.auth };

  console.info('Supabase conectado com sucesso!');
  return window.AlshamSupabase;
}

export default ensureSupabaseGlobal;
