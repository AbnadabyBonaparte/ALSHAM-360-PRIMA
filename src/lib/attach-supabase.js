// src/lib/attach-supabase.js
// ALSHAM 360° PRIMA – SUPABASE ATTACH MODULE (V6.4-GRAAL-COMPLIANT+)

console.info('Iniciando attach-supabase.js...');

// === VARIÁVEIS DO VERCEL (VITE_) ===
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// === VALIDAÇÃO RÍGIDA ===
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes no Vercel.');
  throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel Dashboard.');
}

// === FUNÇÃO PRINCIPAL ===
export async function ensureSupabaseGlobal() {
  if (typeof window === 'undefined') return null;

  if (window.AlshamSupabase?.supabase) {
    console.info('Supabase já inicializado. Reutilizando cliente global.');
    return window.AlshamSupabase;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage,
        storageKey: 'alsham.supabase.auth.token'
      }
    });

    window.supabase = supabase;
    window.AlshamSupabase = {
      supabase,
      auth: supabase.auth,
      async getSession() {
        const { data } = await supabase.auth.getSession();
        return data.session;
      },
      __version: 'v6.4-GRAAL'
    };

    console.info('Supabase inicializado com sucesso via attach-supabase.js');
    return window.AlshamSupabase;

  } catch (err) {
    console.error('Falha ao inicializar Supabase:', err);
    throw err;
  }
}

// === EXPORT PADRÃO ===
export default ensureSupabaseGlobal;

// === AUTO-EXECUÇÃO ===
if (typeof window !== 'undefined') {
  ensureSupabaseGlobal().catch(() => {});
}
