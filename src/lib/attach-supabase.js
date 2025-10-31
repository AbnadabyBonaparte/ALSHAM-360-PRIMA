import { initializeAnalytics } from './analytics.js';

console.info('Iniciando attach-supabase.js...');

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

let initializationPromise = null;

async function setupSupabaseAndAnalytics() {
  console.log('🔐 Iniciando bootstrap do ALSHAM 360°...');

  try {
    if (typeof window === 'undefined') {
      return null;
    }

    if (typeof document !== 'undefined' && document.readyState === 'loading') {
      await new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }

    let hasSupabaseCredentials = Boolean(SUPABASE_URL && SUPABASE_KEY);
    let supabaseClient = window.AlshamSupabase?.supabase || null;

    if (!supabaseClient && hasSupabaseCredentials) {
      const { createClient } = await import('@supabase/supabase-js');

      if (typeof createClient === 'function') {
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabase = supabaseClient;
        window.AlshamSupabase = { supabase: supabaseClient, auth: supabaseClient.auth };
      } else {
        console.warn('⚠️ Supabase não inicializado - função createClient ausente.');
      }
    }

    if (!hasSupabaseCredentials) {
      console.warn('⚠️ Supabase não inicializado - credenciais Supabase ausentes.');
    }

    if (window.AlshamSupabase?.supabase) {
      window.supabase = window.AlshamSupabase.supabase;
      console.log('✅ Supabase inicializado com sucesso!');
    }

    const { client: analyticsClient } = initializeAnalytics({
      api_host: 'https://us.i.posthog.com',
      capture_pageview: false,
      autocapture: true,
      disable_session_recording: false
    });

    if (analyticsClient) {
      console.log('📊 PostHog inicializado com sucesso!');
    } else {
      console.warn('⚠️ PostHog não inicializado - função ausente.');
    }

    return window.AlshamSupabase || null;
  } catch (error) {
    console.error('🚨 Erro crítico ao inicializar ALSHAM 360°:', error);
    throw error;
  }
}

export async function ensureSupabaseGlobal() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (window.AlshamSupabase?.supabase) {
    return window.AlshamSupabase;
  }

  if (!initializationPromise) {
    initializationPromise = setupSupabaseAndAnalytics().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

function scheduleInitialization() {
  ensureSupabaseGlobal().catch((error) => {
    console.error('Falha ao garantir Supabase global:', error);
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleInitialization, { once: true });
  } else {
    scheduleInitialization();
  }
}

export default ensureSupabaseGlobal;
