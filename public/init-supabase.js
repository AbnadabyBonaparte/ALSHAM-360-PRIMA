/**
 * ALSHAM 360° PRIMA - Supabase Initialization (Universal)
 * Compatível com Vercel e ambiente local.
 */

(function() {
  console.log('⚡ Iniciando Supabase global...');

  const SUPABASE_URL = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
  const SUPABASE_ANON_KEY = '<<COLE_AQUI_SUA_CHAVE_PUBLIC_ANON_COMPLETA>>'; // 🔑

  // Carregar Supabase CDN se ainda não existir
  function loadCDN() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) return resolve();

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.crossOrigin = 'anonymous';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Inicializar cliente Supabase
  async function initSupabase() {
    try {
      await loadCDN();
      console.log('✅ Supabase CDN carregado');

      const { createClient } = window.supabase;
      window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          storageKey: 'alsham.auth'
        }
      });

      console.log('✅ Supabase client inicializado com sucesso!');
      window.dispatchEvent(new Event('supabase-ready'));
    } catch (e) {
      console.error('❌ Falha ao inicializar Supabase:', e);
    }
  }

  initSupabase();
})();
