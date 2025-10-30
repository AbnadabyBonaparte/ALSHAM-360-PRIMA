(async () => {
  console.info('🚀 [Supabase Init] Iniciando...');

  const globalEnv = {
    ...(window?.ENV || {}),
    ...(window?.ALSHAM_ENV || {})
  };

  const fallbackMap = {
    VITE_SUPABASE_URL: window?.__VITE_SUPABASE_URL__ || window?.SUPABASE_URL,
    SUPABASE_URL: window?.SUPABASE_URL || window?.__VITE_SUPABASE_URL__,
    VITE_SUPABASE_ANON_KEY: window?.__VITE_SUPABASE_ANON_KEY__ || window?.SUPABASE_KEY,
    SUPABASE_KEY: window?.SUPABASE_KEY || window?.__VITE_SUPABASE_ANON_KEY__,
    SUPABASE_ANON_KEY: window?.__VITE_SUPABASE_ANON_KEY__ || window?.SUPABASE_ANON_KEY,
    N8N_GUARDIAN_WEBHOOK:
      window?.__N8N_GUARDIAN_WEBHOOK__ || window?.N8N_GUARDIAN_WEBHOOK || window?.ENV?.N8N_GUARDIAN_WEBHOOK
  };

  for (const [key, value] of Object.entries(fallbackMap)) {
    if (!globalEnv[key] && value) {
      globalEnv[key] = value;
    }
  }

  const placeholderPattern = /<.*?>|YOUR_|SUPABASE_URL\b|SUPABASE_KEY\b|SUPABASE_ANON_KEY\b/i;

  const valueFrom = (...candidates) => {
    for (const value of candidates) {
      if (typeof value !== 'string') continue;
      const trimmed = value.trim();
      if (!trimmed || placeholderPattern.test(trimmed)) continue;
      return trimmed;
    }
    return '';
  };

  const SUPABASE_URL = valueFrom(
    globalEnv.VITE_SUPABASE_URL,
    globalEnv.SUPABASE_URL,
    globalEnv.PUBLIC_SUPABASE_URL,
    globalEnv.NEXT_PUBLIC_SUPABASE_URL
  );

  const SUPABASE_KEY = valueFrom(
    globalEnv.VITE_SUPABASE_ANON_KEY,
    globalEnv.SUPABASE_KEY,
    globalEnv.PUBLIC_SUPABASE_KEY,
    globalEnv.NEXT_PUBLIC_SUPABASE_KEY,
    globalEnv.SUPABASE_ANON_KEY
  );

  const webhookUrl = valueFrom(
    globalEnv.N8N_GUARDIAN_WEBHOOK,
    globalEnv.VITE_N8N_GUARDIAN_WEBHOOK,
    globalEnv.NEXT_PUBLIC_N8N_GUARDIAN_WEBHOOK
  ) || 'https://n8n.yourdomain.com/webhook/supabase_guardian';

  const isWebhookConfigured = webhookUrl && !/yourdomain\.com|example\.com/i.test(webhookUrl);

  const notifyGuardian = async (payload) => {
    if (!isWebhookConfigured) {
      console.info('ℹ️ [Supabase Init] Webhook n8n Guardian não configurado. Payload:', payload);
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn(`⚠️ [Supabase Init] Notificação n8n retornou status ${response.status}.`);
      }
    } catch (error) {
      console.warn('⚠️ [Supabase Init] Falha ao notificar n8n Guardian:', error);
    }
  };

  try {
    if (window.AlshamSupabase?.supabase) {
      console.info('♻️ [Supabase Init] Supabase já inicializado, reutilizando instância global.');
      await notifyGuardian({
        status: 'ok',
        message: 'Supabase reutilizado a partir da instância existente',
        project: 'ALSHAM 360° PRIMA'
      });
      return;
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Variáveis SUPABASE_URL/SUPABASE_KEY ausentes ou usando placeholders.');
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.4');

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    window.supabase = supabaseClient;

    window.AlshamSupabase = window.AlshamSupabase || {};
    window.AlshamSupabase.supabase = supabaseClient;
    window.AlshamSupabase.auth = supabaseClient.auth;

    console.info('✅ [Supabase Init] Supabase conectado e anexado ao window.');

    await notifyGuardian({
      status: 'ok',
      message: 'Supabase inicializado com sucesso',
      project: 'ALSHAM 360° PRIMA'
    });
  } catch (err) {
    console.error('❌ [Supabase Init] Falha crítica:', err);

    await notifyGuardian({
      status: 'error',
      error: err.message,
      project: 'ALSHAM 360° PRIMA'
    });
  }
})();
