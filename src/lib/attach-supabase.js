// src/lib/attach-supabase.js
// ALSHAM 360° PRIMA – SUPABASE ATTACH MODULE (V6.4-GRAAL-COMPLIANT+)

/**
 * ATTACH-SUPABASE – VERSÃO FINAL 100% FUNCIONAL
 * 
 * Lê VITE_ do Vercel (build-time)
 * Reutiliza cliente global
 * Zero dependência de window.ENV
 * Suporta SSR (não quebra)
 * Sem .includes() em window.location
 */

console.info('Iniciando attach-supabase.js...');

// === 1. VARIÁVEIS DO VERCEL (VITE_) ===
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// === 2. VALIDAÇÃO RÍGIDA ===
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes no Vercel.');
  throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel Dashboard.');
}

// === 3. FUNÇÃO PRINCIPAL ===
export async function ensureSupabaseGlobal() {
  if (typeof window === 'undefined') return null;

  // Reutiliza cliente existente
  if (window.AlshamSupabase?.supabase) {
    console.info('Supabase já inicializado. Reutilizando cliente global.');
    return window.AlshamSupabase;
  }

  try {
    // Import dinâmico do Supabase
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

    // Anexa ao window
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

// === 4. EXPORT PADRÃO ===
export default ensureSupabaseGlobal;

// === 5. AUTO-EXECUÇÃO (opcional) ===
if (typeof window !== 'undefined') {
  ensureSupabaseGlobal().catch(() => {});
}
