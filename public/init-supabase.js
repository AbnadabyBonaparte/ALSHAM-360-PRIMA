(async () => {
  console.info('Iniciando Supabase...');

  const globalEnv = {
    ...(window?.ENV || {}),
    ...(window?.ALSHAM_ENV || {})
  };

  const fallbackMap = {
    VITE_SUPABASE_URL: window?.__VITE_SUPABASE_URL__ || window?.SUPABASE_URL,
    SUPABASE_URL: window?.SUPABASE_URL || window?.__VITE_SUPABASE_URL__,
    VITE_SUPABASE_ANON_KEY: window?.__VITE_SUPABASE_ANON_KEY__ || window?.SUPABASE_KEY,
    SUPABASE_KEY: window?.SUPABASE_KEY || window?.__VITE_SUPABASE_ANON_KEY__,
    SUPABASE_ANON_KEY: window?.__VITE_SUPABASE_ANON_KEY__ || window?.SUPABASE_ANON_KEY
  };

  for (const [key, value] of Object.entries(fallbackMap)) {
    if (!globalEnv[key] && value) globalEnv[key] = value;
  }

  const placeholderPattern = /<.*?>|YOUR_|SUPABASE_URL\b|SUPABASE_KEY\b|placeholder/i;

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
    import.meta.env?.VITE_SUPABASE_URL,
    globalEnv.VITE_SUPABASE_URL,
    globalEnv.SUPABASE_URL
  );

  const SUPABASE_KEY = valueFrom(
    import.meta.env?.VITE_SUPABASE_ANON_KEY,
    globalEnv.VITE_SUPABASE_ANON_KEY,
    globalEnv.SUPABASE_ANON_KEY,
    globalEnv.SUPABASE_KEY
  );

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Falha crítica: SUPABASE_URL ou SUPABASE_KEY ausentes.');
    throw new Error('Variáveis SUPABASE_URL/SUPABASE_KEY ausentes ou inválidas.');
  }

  try {
    if (window.AlshamSupabase?.supabase) {
      console.info('Supabase já inicializado. Reutilizando...');
      return;
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    window.supabase = supabaseClient;
    window.AlshamSupabase = { supabase: supabaseClient, auth: supabaseClient.auth };

    console.info('Supabase conectado com sucesso!');
  } catch (err) {
    console.error('Falha ao inicializar Supabase:', err);
    throw err;
  }
})();
