const INIT_FLAG = '__ALSHAM_SUPABASE_INITIALIZED__';

function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}

async function bootstrapSupabase() {
  try {
    const [attachModule, supabaseModule] = await Promise.all([
      import('/src/lib/attach-supabase.js'),
      import('/src/lib/supabase.js')
    ]);

    const ensureSupabaseGlobal = attachModule.ensureSupabaseGlobal || (() => null);
    const services = ensureSupabaseGlobal() || window.AlshamSupabase || {};

    const {
      SUPABASE_URL: moduleUrl,
      SUPABASE_ANON_KEY: moduleAnonKey,
      SUPABASE_CONFIG: moduleConfig
    } = supabaseModule;

    const resolvedUrl = moduleUrl || services.SUPABASE_URL || services.config?.url || window.__VITE_SUPABASE_URL__;
    const resolvedAnonKey =
      moduleAnonKey || services.SUPABASE_ANON_KEY || services.config?.anonKey || window.__VITE_SUPABASE_ANON_KEY__;

    if (resolvedUrl) {
      window.__VITE_SUPABASE_URL__ = resolvedUrl;
    }

    if (resolvedAnonKey) {
      window.__VITE_SUPABASE_ANON_KEY__ = resolvedAnonKey;
    }

    const normalizedConfig = {
      ...(services.config || {}),
      ...(moduleConfig || {}),
      url: resolvedUrl || services.config?.url || moduleConfig?.url,
      anonKey: resolvedAnonKey || services.config?.anonKey || moduleConfig?.anonKey
    };

    window.AlshamSupabase = {
      ...services,
      config: normalizedConfig,
      SUPABASE_URL: normalizedConfig.url,
      SUPABASE_ANON_KEY: normalizedConfig.anonKey,
      __alshamAttached: true
    };
  } catch (error) {
    console.error('❌ [Supabase Init] Failed to initialize Supabase globals:', error);
  }
}

if (typeof window !== 'undefined' && !window[INIT_FLAG]) {
  window[INIT_FLAG] = true;
  onReady(() => {
    const initPromise = bootstrapSupabase();
    if (!window.AlshamSupabaseReady) {
      window.AlshamSupabaseReady = initPromise;
    }
  });
}
