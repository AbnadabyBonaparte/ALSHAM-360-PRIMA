/**
 * 🔧 ATTACH SUPABASE - VERSÃO FINAL COMPATÍVEL (CDN + Fallback Local)
 *
 * ✅ Compatível com builds estáticos, Vercel e ambiente local.
 * ✅ Não depende mais de import.meta.env (que causa erro no bundle).
 * ✅ Reutiliza o cliente global criado por /init-supabase.js se disponível.
 */

console.log('🚀 [ATTACH-SUPABASE] Inicializando...');

// Detecta ambiente (dev/prod)
const isDev = window?.location?.hostname === 'localhost' || window?.location?.includes('127.0.0.1');

// Fallback seguro (caso init-supabase.js ainda não tenha rodado)
const SUPABASE_URL =
  window?.SUPABASE_URL ||
  'https://rgvnbtuqtxvfxhrdnkjg.supabase.co'; // ← substitua pelo seu URL real, se diferente

const SUPABASE_ANON_KEY =
  window?.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NjU3NTIsImV4cCI6MjA1MDE0MTc1Mn0.ey3hbGci0i1JIUzI1NiIsInR5cCI6IkpXVCJ9'; // 🔐 sua anon key

/**
 * Aguarda a presença do Supabase carregado via CDN
 */
async function waitForSupabaseCDN(maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    if (window.supabase?.createClient) {
      console.log('✅ [ATTACH-SUPABASE] Supabase CDN detectado.');
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('❌ Supabase CDN não carregou em tempo hábil.');
}

/**
 * Cria cliente Supabase (ou reutiliza o global já existente)
 */
function createSupabaseClient() {
  if (!window.supabase?.createClient) {
    throw new Error('❌ Supabase CDN não disponível.');
  }

  console.log('🧩 [ATTACH-SUPABASE] Criando cliente Supabase...');

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'supabase.auth.token',
    },
  });

  console.log('✅ [ATTACH-SUPABASE] Cliente criado com sucesso.');
  return client;
}

/**
 * Função principal para garantir o cliente global
 */
export async function ensureSupabaseGlobal() {
  if (typeof window === 'undefined') {
    console.warn('⚠️ [ATTACH-SUPABASE] Ambiente não é browser.');
    return null;
  }

  // Se já existe (por init-supabase.js), reaproveita
  if (window.AlshamSupabase?.supabase) {
    console.log('♻️ [ATTACH-SUPABASE] Usando cliente existente do init-supabase.js');
    return window.AlshamSupabase;
  }

  try {
    await waitForSupabaseCDN();
    const supabaseClient = createSupabaseClient();

    window.AlshamSupabase = {
      supabase: supabaseClient,
      auth: supabaseClient.auth,
      async getCurrentSession() {
        try {
          const { data, error } = await supabaseClient.auth.getSession();
          if (error) throw error;
          console.log('📦 [ATTACH-SUPABASE] Sessão atual:', !!data?.session);
          return data?.session ?? null;
        } catch (err) {
          console.error('❌ [ATTACH-SUPABASE] Erro ao buscar sessão:', err);
          return null;
        }
      },
      __alshamAttached: true,
    };

    console.log('🎯 [ATTACH-SUPABASE] Cliente global pronto!');
    return window.AlshamSupabase;
  } catch (err) {
    console.error('💥 [ATTACH-SUPABASE] Erro ao anexar Supabase:', err);
    return null;
  }
}

// Inicializa automaticamente (somente se rodando no browser)
if (typeof window !== 'undefined') {
  ensureSupabaseGlobal()
    .then(() => console.log('🎉 [ATTACH-SUPABASE] Inicialização completa.'))
    .catch((err) => console.error('🚨 [ATTACH-SUPABASE] Falha crítica:', err));
}

export default ensureSupabaseGlobal;
