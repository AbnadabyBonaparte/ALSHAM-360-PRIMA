// src/lib/attach-supabase.js
console.info('Iniciando attach-supabase.js...');

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERRO: Variáveis VITE_ ausentes no Vercel.');
  throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
}

export async function ensureSupabaseGlobal() {
  if (typeof window === 'undefined') return null;
  if (window.AlshamSupabase?.supabase) {
    console.info('Supabase já inicializado.');
    return window.AlshamSupabase;
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  window.supabase = supabase;
  window.AlshamSupabase = { supabase, auth: supabase.auth };

  console.info('Supabase conectado com sucesso!');
  return window.AlshamSupabase;
}

export default ensureSupabaseGlobal;

if (typeof window !== 'undefined') {
  ensureSupabaseGlobal().catch(() => {});
}
