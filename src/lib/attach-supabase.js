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
      } else {
        console.warn('⚠️ Supabase não inicializado - função createClient ausente.');
      }
    }

    if (!hasSupabaseCredentials) {
      console.warn('⚠️ Supabase não inicializado - credenciais Supabase ausentes.');
    }

    // ===== HELPER FUNCTIONS =====
    
    /**
     * Obtém a sessão atual do usuário
     */
    async function getCurrentSession() {
      if (!supabaseClient) return null;
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return data?.session || null;
      } catch (error) {
        console.error('❌ Erro ao obter sessão:', error);
        return null;
      }
    }

    /**
     * Obtém o ID da organização atual do usuário
     */
    async function getCurrentOrgId() {
      const session = await getCurrentSession();
      if (!session?.user) return null;
      
      try {
        const { data, error } = await supabaseClient
          .from('users')
          .select('organization_id')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        return data?.organization_id || null;
      } catch (error) {
        console.error('❌ Erro ao obter organization_id:', error);
        return null;
      }
    }

    /**
     * Select genérico em qualquer tabela
     */
    async function genericSelect(table, columns = '*', filters = {}) {
      if (!supabaseClient) {
        console.warn('⚠️ Supabase não disponível para genericSelect');
        return { data: null, error: 'Supabase não inicializado' };
      }

      try {
        let query = supabaseClient.from(table).select(columns);
        
        // Aplica filtros
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { data, error } = await query;
        return { data, error };
      } catch (error) {
        console.error(`❌ Erro ao buscar dados de ${table}:`, error);
        return { data: null, error };
      }
    }

    /**
     * Cria log de auditoria
     */
    async function createAuditLog(action, details = {}) {
      if (!supabaseClient) {
        console.warn('⚠️ Supabase não disponível para createAuditLog');
        return { data: null, error: 'Supabase não inicializado' };
      }

      const session = await getCurrentSession();
      const orgId = await getCurrentOrgId();

      try {
        const { data, error } = await supabaseClient
          .from('audit_logs')
          .insert({
            user_id: session?.user?.id || null,
            organization_id: orgId,
            action,
            details,
            timestamp: new Date().toISOString(),
          });

        return { data, error };
      } catch (error) {
        console.error('❌ Erro ao criar audit log:', error);
        return { data: null, error };
      }
    }

    /**
     * Subscribe para mudanças em tempo real em uma tabela
     */
    function subscribeToTable(table, orgId, callback) {
      if (!supabaseClient) {
        console.warn('⚠️ Supabase não disponível para subscribeToTable');
        return null;
      }

      try {
        const subscription = supabaseClient
          .channel(`${table}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              filter: orgId ? `organization_id=eq.${orgId}` : undefined,
            },
            (payload) => {
              console.log(`🔔 [REALTIME] Mudança detectada em ${table}:`, payload);
              if (typeof callback === 'function') {
                callback(payload);
              }
            }
          )
          .subscribe();

        return subscription;
      } catch (error) {
        console.error(`❌ Erro ao subscrever ${table}:`, error);
        return null;
      }
    }

    // ===== EXPORT TO WINDOW =====
    
    if (supabaseClient) {
      window.supabase = supabaseClient;
      window.AlshamSupabase = {
        supabase: supabaseClient,
        auth: supabaseClient.auth,
        // Helper functions
        getCurrentSession,
        getCurrentOrgId,
        genericSelect,
        createAuditLog,
        subscribeToTable,
      };
      console.log('✅ Supabase inicializado com sucesso!');
    } else {
      // Modo sem Supabase - apenas exporta funções vazias
      window.AlshamSupabase = {
        supabase: null,
        auth: null,
        getCurrentSession: async () => null,
        getCurrentOrgId: async () => null,
        genericSelect: async () => ({ data: null, error: 'Supabase não disponível' }),
        createAuditLog: async () => ({ data: null, error: 'Supabase não disponível' }),
        subscribeToTable: () => null,
      };
    }

    // ===== INITIALIZE ANALYTICS =====
    
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
