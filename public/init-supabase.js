(async () => {
  console.info('🚀 [Supabase Init] Iniciando...');

  try {
    // Importa Supabase via ESM CDN para evitar dependência local
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.43.4');

    const SUPABASE_URL = window?.ENV?.SUPABASE_URL || 'https://<SEU-PROJETO>.supabase.co';
    const SUPABASE_KEY = window?.ENV?.SUPABASE_KEY || '<SUA-CHAVE-PUBLICA>';

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn('⚠️ [Supabase Init] Variáveis de ambiente ausentes. Verifique SUPABASE_URL e SUPABASE_KEY no painel do Vercel.');
    }

    // Cria o cliente e o expõe globalmente
    window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.info('✅ [Supabase Init] Supabase carregado e anexado ao window.');
  } catch (err) {
    console.error('❌ [Supabase Init] Falha crítica:', err);
  }
})();
