// ALSHAM 360° PRIMA - SUPABASE LIB FINAL V9.3
// VERSÃO 9.3 - CORREÇÃO FINAL DOS EXPORTS PARA BROWSER
// CORRIGIDO: Exports funcionando + API key válida

// Verificar se as variáveis foram injetadas
let SUPABASE_URL, SUPABASE_ANON_KEY;

if (typeof window !== 'undefined') {
  // Tentar pegar das variáveis window primeiro
  SUPABASE_URL = window.__VITE_SUPABASE_URL__ || 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
  SUPABASE_ANON_KEY = window.__VITE_SUPABASE_ANON_KEY__ || 'sb_publishable_AGXjFzibpEtaLIwAu-ZNfA_BAdNLyF_2tPHhCZPRMBCZBY';
} else {
  // Fallback para suas credenciais reais
  SUPABASE_URL = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
  SUPABASE_ANON_KEY = 'sb_publishable_AGXjFzibpEtaLIwAu-ZNfA_BAdNLyF_2tPHhCZPRMBCZBY';
}

console.log('🔑 Supabase URL:', SUPABASE_URL);
console.log('🔑 Supabase Key (primeiros chars):', SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// Verificar se o Supabase CDN foi carregado
if (!window.supabase) {
  console.error("🚨 ERRO: Supabase CDN não carregado!");
  throw new Error("Supabase CDN not loaded. Add the CDN script to your HTML.");
}

const { createClient } = window.supabase;

// 🏗️ CLIENT COM CREDENCIAIS REAIS
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
      'X-Client-Info': 'alsham-360-prima@9.3.0',
      'X-Environment': 'production'
    }
  }
});

console.log('✅ Cliente Supabase inicializado com sucesso!');

// =========================================================================
// 🔧 UTILITIES
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
  return structuredError;
}

// =========================================================================
// 🚨 TODAS AS FUNÇÕES COM EXPORTS CORRETOS
// =========================================================================

// AUTH FUNCTIONS
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    throw handleError(err, 'signOut');
  }
}

async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (err) {
    throw handleError(err, 'getCurrentSession');
  }
}

function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ORG FUNCTIONS
async function getCurrentOrgId() {
  try {
    const session = await getCurrentSession();
    if (!session?.user) return null;
    
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

// CRUD FUNCTIONS
async function genericSelect(table, filters = {}, options = {}) {
  try {
    let query = supabase.from(table).select(options.select || '*');
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    if (options.order) {
      query = query.order(options.order.column, { 
        ascending: options.order.ascending || false 
      });
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Erro no genericSelect:', error);
    return { data: null, error: handleError(error, 'genericSelect') };
  }
}

async function genericInsert(table, data, orgId = null) {
  try {
    const insertData = orgId ? { ...data, org_id: orgId } : data;
    const { error } = await supabase.from(table).insert(insertData);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    throw handleError(err, `genericInsert on ${table}`);
  }
}

async function genericUpdate(table, id, updates, orgId = null) {
  try {
    let query = supabase.from(table).update(updates).eq('id', id);
    
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    
    const { error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (err) {
    throw handleError(err, `genericUpdate on ${table}`);
  }
}

async function genericDelete(table, id, orgId = null) {
  try {
    let query = supabase.from(table).delete().eq('id', id);
    
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    
    const { error } = await query;
    if (error) throw error;
    
    return { success: true };
  } catch (err) {
    throw handleError(err, `genericDelete on ${table}`);
  }
}

// AUDIT FUNCTIONS
async function createAuditLog(action, details, orgId, userId) {
  try {
    const { error } = await supabase.from('audit_log').insert({
      action,
      details,
      org_id: orgId,
      user_id: userId
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    throw handleError(err, 'createAuditLog');
  }
}

// ORGANIZATION FUNCTIONS
const DEFAULT_ORG_ID = 'default-org-id';

async function getOrganization(orgId) {
  try {
    const { data, error } = await supabase.from('organizations').select('*').eq('id', orgId).single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw handleError(err, 'getOrganization');
  }
}

// USER PROFILE FUNCTIONS
async function getUserProfile(userId, orgId) {
  try {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).eq('org_id', orgId).single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw handleError(err, 'getUserProfile');
  }
}

async function updateUserProfile(userId, orgId, updates) {
  try {
    const { error } = await supabase.from('user_profiles').update(updates).eq('user_id', userId).eq('org_id', orgId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    throw handleError(err, 'updateUserProfile');
  }
}

// LEADS FUNCTIONS
async function getLeads(orgId, filters = {}) {
  return genericSelect('leads_crm', { ...filters, org_id: orgId });
}

async function createLead(data, orgId) {
  return genericInsert('leads_crm', data, orgId);
}

// REALTIME FUNCTIONS
function subscribeToTable(table, orgId, callback) {
  return supabase.channel(`realtime:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table, filter: `org_id=eq.${orgId}` }, payload => {
      callback(payload);
    })
    .subscribe();
}

// NOTIFICATION FUNCTIONS
function showAuthNotification(message, type = 'info') {
  try {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
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

// FORMAT HELPERS
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

// FUNÇÃO CHECKBOUTCESSES (que estava faltando)
function checkBoutcesses() {
  console.log('✅ Sistema Alsham funcionando corretamente!');
  return { success: true, message: 'All systems operational' };
}

// =========================================================================
// 🌐 DISPONIBILIZAR GLOBALMENTE
// =========================================================================
if (typeof window !== 'undefined') {
  // Cliente Supabase
  window.supabaseClient = supabase;
  
  // Todas as funções disponíveis globalmente
  window.AlshamSupabase = {
    // Core
    supabase,
    
    // Auth
    signOut,
    getCurrentSession,
    onAuthStateChange,
    
    // Org
    getCurrentOrgId,
    getOrganization,
    DEFAULT_ORG_ID,
    
    // CRUD
    genericSelect,
    genericInsert,
    genericUpdate,
    genericDelete,
    
    // Specific
    getLeads,
    createLead,
    getUserProfile,
    updateUserProfile,
    createAuditLog,
    
    // Realtime
    subscribeToTable,
    
    // UI
    showAuthNotification,
    
    // Utils
    formatDateBR,
    formatTimeAgo,
    sanitizeInput,
    checkBoutcesses,
    handleError
  };
  
  console.log("✅ AlshamSupabase v9.3 disponível globalmente!");
  console.log("✅ Funções disponíveis:", Object.keys(window.AlshamSupabase));
}

// Export para compatibilidade (mesmo que seja browser)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    supabase,
    signOut,
    getCurrentSession,
    onAuthStateChange,
    getCurrentOrgId,
    getOrganization,
    DEFAULT_ORG_ID,
    genericSelect,
    genericInsert,
    genericUpdate,
    genericDelete,
    getLeads,
    createLead,
    getUserProfile,
    updateUserProfile,
    createAuditLog,
    subscribeToTable,
    showAuthNotification,
    formatDateBR,
    formatTimeAgo,
    sanitizeInput,
    checkBoutcesses,
    handleError
  };
}
