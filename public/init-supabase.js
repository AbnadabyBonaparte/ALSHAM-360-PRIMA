(async () => {
  console.info('🚀 [Supabase Init] Iniciando...');

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.43.4');

    const SUPABASE_URL = window?.ENV?.SUPABASE_URL || 'https://<SEU-PROJETO>.supabase.co';
    const SUPABASE_KEY = window?.ENV?.SUPABASE_KEY || '<SUA-CHAVE-PUBLICA>';

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn('⚠️ [Supabase Init] Variáveis de ambiente ausentes.');
    }

    window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.info('✅ [Supabase Init] Supabase conectado e anexado ao window.');

    // Envio de sucesso ao n8n Guardian Monitor
    fetch('https://n8n.yourdomain.com/webhook/supabase_guardian', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ok', message: 'Supabase inicializado com sucesso', project: 'ALSHAM 360° PRIMA' })
    });

  } catch (err) {
    console.error('❌ [Supabase Init] Falha crítica:', err);

    // Reporta falha ao n8n Guardian
    fetch('https://n8n.yourdomain.com/webhook/supabase_guardian', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'error', error: err.message, project: 'ALSHAM 360° PRIMA' })
    });
  }
})();
