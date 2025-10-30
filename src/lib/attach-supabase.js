/**
 * 🔧 ATTACH SUPABASE - Versão CDN (CORRIGIDO)
 * 
 * Usa Supabase CDN do HTML ao invés de importar módulo local
 * Resolve problema de bundle em produção
 */

console.log('🔧 [ATTACH-SUPABASE] Iniciando...');

// Pegar variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';
const GLOBAL_CLIENT_KEY = '__alshamSupabaseClient';

console.log('📦 [ATTACH-SUPABASE] URL:', SUPABASE_URL);
console.log('🔑 [ATTACH-SUPABASE] Anon Key:', SUPABASE_ANON_KEY?.substring(0, 20) + '...');

/**
 * Aguardar até que o Supabase CDN esteja disponível
 */
async function waitForSupabaseCDN(maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    if (window.supabase?.createClient) {
      console.log('✅ [ATTACH-SUPABASE] Supabase CDN encontrado!');
      return true;
    }
    
    console.log(`⏳ [ATTACH-SUPABASE] Aguardando Supabase CDN... (${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error('Supabase CDN não carregou após 5 segundos');
}

/**
 * Criar cliente Supabase com configuração correta
 */
function createSupabaseClient() {
  if (!window.supabase?.createClient) {
    throw new Error('Supabase CDN não disponível');
  }

  if (window[GLOBAL_CLIENT_KEY]) {
    console.log('♻️ [ATTACH-SUPABASE] Reutilizando cliente Supabase global.');
    return window[GLOBAL_CLIENT_KEY];
  }

  console.log('🔧 [ATTACH-SUPABASE] Criando cliente Supabase...');

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,        // 🔧 FIX: Salvar sessão no localStorage
      autoRefreshToken: true,      // 🔧 FIX: Renovar token automaticamente
      detectSessionInUrl: true,    // 🔧 FIX: Detectar sessão na URL
      storage: window.localStorage // 🔧 FIX: Usar localStorage explicitamente
    }
  });

  window[GLOBAL_CLIENT_KEY] = client;

  console.log('✅ [ATTACH-SUPABASE] Cliente criado com sucesso!');
  return client;
}

/**
 * Função principal de anexação
 */
export async function ensureSupabaseGlobal() {
  if (typeof window === 'undefined') {
    console.warn('⚠️ [ATTACH-SUPABASE] Ambiente não é browser');
    return null;
  }
  
  // Se já existe, retornar
  if (window.AlshamSupabase?.supabase) {
    console.log('✅ [ATTACH-SUPABASE] AlshamSupabase já existe');
    return window.AlshamSupabase;
  }
  
  try {
    // Aguardar CDN carregar
    await waitForSupabaseCDN();
    
    // Criar cliente
    const supabaseClient = createSupabaseClient();
    
    // Criar objeto AlshamSupabase
    window.AlshamSupabase = window.AlshamSupabase || {};
    if (!window.AlshamSupabase.supabase) {
      window.AlshamSupabase.supabase = supabaseClient;
    }
    if (!window.AlshamSupabase.auth) {
      window.AlshamSupabase.auth = supabaseClient.auth;
    }

    if (typeof window.AlshamSupabase.getCurrentSession !== 'function') {
      window.AlshamSupabase.getCurrentSession = async function getCurrentSession() {
        try {
          const { data, error } = await supabaseClient.auth.getSession();
          if (error) throw error;

          console.log('📦 [ATTACH-SUPABASE] Sessão atual:', data?.session ? 'Existe' : 'Não existe');
          return data?.session ?? null;
        } catch (err) {
          console.error('❌ [ATTACH-SUPABASE] Erro ao buscar sessão:', err);
          throw err;
        }
      };
    }

    window.AlshamSupabase.__alshamAttached = true;
    
    console.log('🎉 [ATTACH-SUPABASE] window.AlshamSupabase criado com sucesso!');
    console.log('✅ [ATTACH-SUPABASE] Configurações:');
    console.log('   - persistSession: true');
    console.log('   - autoRefreshToken: true');
    console.log('   - detectSessionInUrl: true');
    console.log('   - storage: localStorage');
    
    return window.AlshamSupabase;
    
  } catch (error) {
    console.error('❌ [ATTACH-SUPABASE] Erro fatal:', error);
    throw error;
  }
}

// Executar automaticamente se no browser
if (typeof window !== 'undefined') {
  ensureSupabaseGlobal()
    .then(() => {
      console.log('🎉 [ATTACH-SUPABASE] Inicialização completa!');
    })
    .catch(err => {
      console.error('💥 [ATTACH-SUPABASE] Falha na inicialização:', err);
    });
}

export default ensureSupabaseGlobal;
