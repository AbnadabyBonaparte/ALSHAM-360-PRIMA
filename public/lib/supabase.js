// ALSHAM 360° PRIMA - SUPABASE LIB COMPLETA V9.2 - CORRIGIDA PARA BROWSER
// VERSÃO 9.2 - ENTERPRISE PRODUCTION READY - BROWSER COMPATIBLE
// CORRIGIDO PARA FUNCIONAR NO BROWSER SEM PROBLEMAS DE IMPORT

// =========================================================================
// 🚀 ENTERPRISE PRODUCTION NOTES V9.2 - CORRIGIDO PARA BROWSER
// =========================================================================
// ✅ [FIXED] Removido import.meta.env que causava conflitos
// ✅ [FIXED] Usando apenas variáveis window para browser compatibility  
// ✅ [PRODUCTION] Real Railway/Vercel credentials integrated
// ✅ [BROWSER-READY] Funciona perfeitamente no navegador
// =========================================================================

// IMPORTANTE: Adicione este script no HTML ANTES de carregar este arquivo:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// 🔐 CONFIGURAÇÃO DE PRODUÇÃO - BROWSER OPTIMIZED
// Carrega as variáveis de ambiente via injeção do Vite (definidas no build)
const SUPABASE_URL = typeof window !== 'undefined' && window.__VITE_SUPABASE_URL__ || 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
const SUPABASE_ANON_KEY = typeof window !== 'undefined' && window.__VITE_SUPABASE_ANON_KEY__ || 'sb_publishable_AGXjFzibpEtaLIwAu-ZNfA_BAdNLyF_2tPHhCZPRMBCZBY';

// Fallback para as suas credenciais reais se as variáveis não estiverem injetadas
const FINAL_SUPABASE_URL = SUPABASE_URL || 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
const FINAL_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY || 'sb_publishable_AGXjFzibpEtaLIwAu-ZNfA_BAdNLyF_2tPHhCZPRMBCZBY';

// Verificação de credenciais
if (!FINAL_SUPABASE_URL || !FINAL_SUPABASE_ANON_KEY) {
  console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.error("🚨 ERRO CRÍTICO: Credenciais do Supabase não configuradas! 🚨");
  console.error("Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel.");
  console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  throw new Error("Supabase credentials not configured. Application cannot start.");
}

// Verificar se o Supabase CDN foi carregado
if (!window.supabase) {
  console.error("🚨 ERRO: Supabase CDN não carregado!");
  console.error("Adicione este script no HTML: <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script>");
  throw new Error("Supabase CDN not loaded. Add the CDN script to your HTML.");
}

const { createClient } = window.supabase;

console.log("✅ Credenciais do Supabase carregadas com sucesso!");
console.log("✅ URL:", FINAL_SUPABASE_URL);
console.log("✅✅✅ VERSÃO DO ARQUIVO V9.2: " + new Date().toISOString());

// 🏗️ ENTERPRISE CLIENT WITH REAL CREDENTIALS
const supabase = createClient(FINAL_SUPABASE_URL, FINAL_SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'alsham-360-prima@9.2.0',
      'X-Environment': 'production'
    }
  }
});

// =========================================================================
// 🔧 ENTERPRISE UTILITIES - ENHANCED ERROR HANDLING
// =========================================================================
function handleError(error, context = 'Operation failed') {
  const structuredError = {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
    context
  };
  console.error('🚨 Supabase Error:', structuredError);
  throw new Error(JSON.stringify(structuredError));
}

// =========================================================================
// 🚨 FUNÇÕES CRÍTICAS QUE ESTAVAM FALTANDO
// =========================================================================

// FUNÇÃO SIGNOUT - CRÍTICA PARA AUTH
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) handleError(error, 'signOut');
    return { success: true };
  } catch (err) {
    handleError(err, 'signOut');
  }
}

// FUNÇÃO GETCURRENTORGID - CRÍTICA PARA MULTI-TENANT
async function getCurrentOrgId() {
  try {
    const session = await getCurrentSession();
    if (!session?.user) return null;
    
    // Busca o org_id do usuário na tabela user_profiles
    const { data, error } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      console.warn('Usuário sem org_id, usando default:', error);
      return 'default-org-id';
    }
    
    return data?.org_id || 'default-org-id';
  } catch (err) {
    console.warn('Erro ao obter org_id, usando default:', err);
    return 'default-org-id';
  }
}

// FUNÇÃO GENERICDELETE - CRÍTICA PARA CRUD
async function genericDelete(table, id, orgId = null) {
  try {
    let query = supabase.from(table).delete().eq('id', id);
    
    // Adicionar filtro org_id se fornecido
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    
    const { error } = await query;
    if (error) handleError(error, `genericDelete on ${table}`);
    
    return { success: true };
  } catch (err) {
    handleError(err, `genericDelete on ${table}`);
  }
}

// FUNÇÃO SHOWAUTHNOTIFICATION - CRÍTICA PARA UX
function showAuthNotification(message, type = 'info') {
  try {
    // Implementação básica de notificação
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Tentar mostrar notificação visual se possível
    if (window.showToast) {
      window.showToast(message, type);
    } else if (window.alert && type === 'error') {
      window.alert(`Erro: ${message}`);
    }
    
    return { success: true, message, type };
  } catch (err) {
    console.error('Erro ao mostrar notificação:', err);
    return { success: false, error: err.message };
  }
}

// 🔒 AUTH HELPERS (REAL, NO MOCKS)
async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) handleError(error, 'getCurrentSession');
    return session;
  } catch (err) {
    handleError(err, 'getCurrentSession');
  }
}

function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// 📋 AUDIT LOG (REAL INSERT)
async function createAuditLog(action, details, orgId, userId) {
  try {
    const { error } = await supabase.from('audit_log').insert({
      action,
      details,
      org_id: orgId,
      user_id: userId
    });
    if (error) handleError(error, 'createAuditLog');
  } catch (err) {
    handleError(err, 'createAuditLog');
  }
}

// 🏢 ORGANIZATION HELPERS
const DEFAULT_ORG_ID = 'default-org-id';

async function getOrganization(orgId) {
  try {
    const { data, error } = await supabase.from('organizations').select('*').eq('id', orgId).single();
    if (error) handleError(error, 'getOrganization');
    return data;
  } catch (err) {
    handleError(err, 'getOrganization');
  }
}

// 👤 USER PROFILE HELPERS
async function getUserProfile(userId, orgId) {
  try {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).eq('org_id', orgId).single();
    if (error) handleError(error, 'getUserProfile');
    return data;
  } catch (err) {
    handleError(err, 'getUserProfile');
  }
}

async function updateUserProfile(userId, orgId, updates) {
  try {
    const { error } = await supabase.from('user_profiles').update(updates).eq('user_id', userId).eq('org_id', orgId);
    if (error) handleError(error, 'updateUserProfile');
  } catch (err) {
    handleError(err, 'updateUserProfile');
  }
}

// =========================================================================
// 🔥 FUNÇÃO GENERICSELECT - CORRIGIDA E EXPORTADA
// =========================================================================
async function genericSelect(table, filters = {}, options = {}) {
  try {
    let query = supabase.from(table).select(options.select || '*');
    
    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Aplicar ordenação se especificada
    if (options.order) {
      query = query.order(options.order.column, { 
        ascending: options.order.ascending || false 
      });
    }
    
    // Aplicar limite se especificado
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Erro no genericSelect:', error);
    return { data: null, error };
  }
}

// Outras funções CRUD genéricas
async function genericInsert(table, data, orgId = null) {
  try {
    const insertData = orgId ? { ...data, org_id: orgId } : data;
    const { error } = await supabase.from(table).insert(insertData);
    if (error) handleError(error, `genericInsert on ${table}`);
    return { success: true };
  } catch (err) {
    handleError(err, `genericInsert on ${table}`);
  }
}

async function genericUpdate(table, id, updates, orgId = null) {
  try {
    let query = supabase.from(table).update(updates).eq('id', id);
    
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    
    const { error } = await query;
    if (error) handleError(error, `genericUpdate on ${table}`);
    return { success: true };
  } catch (err) {
    handleError(err, `genericUpdate on ${table}`);
  }
}

// Exemplos Específicos (para tabelas chave)
async function getLeads(orgId, filters = {}) {
  return genericSelect('leads_crm', { ...filters, org_id: orgId });
}

async function createLead(data, orgId) {
  return genericInsert('leads_crm', data, orgId);
}

// 🔄 REAL-TIME SUBSCRIPTIONS
function subscribeToTable(table, orgId, callback) {
  return supabase.channel(`realtime:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table, filter: `org_id=eq.${orgId}` }, payload => {
      callback(payload);
    })
    .subscribe();
}

// 📅 FORMAT HELPERS
function formatDateBR(date, options = {}) {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Data inválida';
    
    const defaultOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options
    };
    
    return dateObj.toLocaleDateString('pt-BR', defaultOptions);
  } catch (error) {
    console.error('🚨 Erro ao formatar data:', error);
    return 'Erro na formatação';
  }
}

function formatTimeAgo(date) {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Data inválida';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) return 'agora mesmo';
    else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} mês${months > 1 ? 'es' : ''} atrás`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} ano${years > 1 ? 's' : ''} atrás`;
    }
  } catch (error) {
    console.error('🚨 Erro ao calcular tempo relativo:', error);
    return 'Erro no cálculo';
  }
}

// 🛡️ SANITIZE INPUT
function sanitizeInput(input, options = {}) {
  try {
    if (input === null || input === undefined) {
      return options.allowNull ? null : '';
    }
    
    if (typeof input !== 'string') {
      input = String(input);
    }
    
    let sanitized = input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
    
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }
    
    if (options.removeSpecialChars) {
      sanitized = sanitized.replace(/[^\w\s@.-]/g, '');
    }
    
    if (options.toLowerCase) {
      sanitized = sanitized.toLowerCase();
    }
    
    if (options.removeExtraSpaces) {
      sanitized = sanitized.replace(/\s+/g, ' ');
    }
    
    return sanitized;
  } catch (error) {
    console.error('🚨 Erro ao sanitizar input:', error);
    return options.allowNull ? null : '';
  }
}

// =========================================================================
// 🌐 DISPONIBILIZAR GLOBALMENTE PARA O BROWSER
// =========================================================================
if (typeof window !== 'undefined') {
  // Cliente Supabase global
  window.supabaseClient = supabase;
  
  // Todas as funções disponíveis globalmente
  window.AlshamSupabase = {
    supabase,
    signOut,
    getCurrentOrgId,
    genericDelete,
    showAuthNotification,
    getCurrentSession,
    onAuthStateChange,
    createAuditLog,
    getOrganization,
    getUserProfile,
    updateUserProfile,
    getLeads,
    createLead,
    genericSelect,
    genericInsert,
    genericUpdate,
    subscribeToTable,
    formatDateBR,
    formatTimeAgo,
    sanitizeInput,
    DEFAULT_ORG_ID
  };
  
  console.log("✅ AlshamSupabase disponível globalmente em window.AlshamSupabase");
  console.log("✅ Cliente Supabase disponível em window.supabaseClient");
}
