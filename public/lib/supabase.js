// ALSHAM 360° PRIMA - SUPABASE LIB FINAL V10.0
// VERSÃO 10.0 - ARQUITETURA ES6 MODULES PURA
// CORRIGIDO: Credenciais reais + ES6 imports + Sem dependência de CDN

import { createClient } from '@supabase/supabase-js';

// ===== CREDENCIAIS REAIS DO SEU PROJETO =====
const SUPABASE_URL = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyODczMDQsImV4cCI6MjA1MTg2MzMwNH0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2Znhocm';

console.log('🔑 Supabase URL:', SUPABASE_URL);
console.log('🔑 Chave carregada:', SUPABASE_ANON_KEY.substring(0, 50) + '...');

// ===== CLIENTE SUPABASE COM CONFIGURAÇÕES OTIMIZADAS =====
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage, // Usar localStorage explicitamente
    storageKey: 'alsham-auth-token'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'alsham-360-prima@10.0.0',
      'X-Environment': 'production'
    }
  },
  db: {
    schema: 'public'
  }
});

console.log('✅ Cliente Supabase inicializado com módulos ES6!');

// ===== UTILITIES =====
function handleError(error, context = 'Operation failed') {
  const structuredError = {
    message: error.message || 'Erro desconhecido',
    code: error.code || 'UNKNOWN_ERROR',
    details: error.details || null,
    hint: error.hint || null,
    context,
    timestamp: new Date().toISOString()
  };
  console.error('🚨 Supabase Error:', structuredError);
  return structuredError;
}

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

function getDefaultOrgId() {
  return DEFAULT_ORG_ID;
}

// ===== AUTH FUNCTIONS =====
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    console.log('✅ Usuário deslogado com sucesso');
    return { success: true };
  } catch (err) {
    const error = handleError(err, 'signOut');
    return { success: false, error };
  }
}

export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (err) {
    const error = handleError(err, 'getCurrentSession');
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (err) {
    const error = handleError(err, 'getCurrentUser');
    return null;
  }
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state change:', event, session?.user?.email || 'No user');
    callback(event, session);
  });
}

export async function signInWithPassword(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    console.log('✅ Login realizado com sucesso:', data.user?.email);
    return { success: true, data };
  } catch (err) {
    const error = handleError(err, 'signInWithPassword');
    return { success: false, error };
  }
}

// ===== ORG FUNCTIONS =====
export async function getCurrentOrgId() {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      console.log('⚠️ Sem usuário autenticado, usando org padrão');
      return getDefaultOrgId();
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', session.user.id)
      .single();
    
    if (error || !data?.org_id || !isValidUUID(data.org_id)) {
      console.log('⚠️ Org ID inválido ou não encontrado, usando padrão');
      return getDefaultOrgId();
    }
    
    return data.org_id;
  } catch (err) {
    console.warn('Erro ao obter org_id, usando padrão:', err);
    return getDefaultOrgId();
  }
}

// ===== CRUD FUNCTIONS =====
export async function genericSelect(table, filters = {}, options = {}) {
  try {
    let query = supabase.from(table).select(options.select || '*');
    
    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Aplicar ordenação
    if (options.order) {
      query = query.order(options.order.column, { 
        ascending: options.order.ascending !== false 
      });
    }
    
    // Aplicar limite
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    // Aplicar range (paginação)
    if (options.range) {
      query = query.range(options.range.from, options.range.to);
    }
    
    const { data, error, count } = await query;
    if (error) throw error;
    
    return { 
      data: data || [], 
      error: null, 
      count: count || data?.length || 0 
    };
  } catch (error) {
    console.error(`Erro no genericSelect (${table}):`, error);
    return { 
      data: [], 
      error: handleError(error, `genericSelect on ${table}`),
      count: 0
    };
  }
}

export async function genericInsert(table, data, orgId = null) {
  try {
    const insertData = orgId ? { ...data, org_id: orgId } : data;
    const { data: result, error } = await supabase
      .from(table)
      .insert(insertData)
      .select()
      .single();
      
    if (error) throw error;
    
    console.log(`✅ Registro criado em ${table}:`, result?.id);
    return { success: true, data: result };
  } catch (err) {
    const error = handleError(err, `genericInsert on ${table}`);
    return { success: false, error };
  }
}

export async function genericUpdate(table, id, updates, orgId = null) {
  try {
    let query = supabase.from(table).update(updates).eq('id', id);
    
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    
    const { data, error } = await query.select().single();
    if (error) throw error;
    
    console.log(`✅ Registro atualizado em ${table}:`, id);
    return { success: true, data };
  } catch (err) {
    const error = handleError(err, `genericUpdate on ${table}`);
    return { success: false, error };
  }
}

export async function genericDelete(table, id, orgId = null) {
  try {
    let query = supabase.from(table).delete().eq('id', id);
    
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    
    const { error } = await query;
    if (error) throw error;
    
    console.log(`✅ Registro deletado de ${table}:`, id);
    return { success: true };
  } catch (err) {
    const error = handleError(err, `genericDelete on ${table}`);
    return { success: false, error };
  }
}

// ===== LEADS FUNCTIONS =====
export async function getLeads(orgId = null, options = {}) {
  const finalOrgId = orgId || await getCurrentOrgId();
  return genericSelect('leads_crm_with_labels', { org_id: finalOrgId }, options);
}

export async function createLead(leadData, orgId = null) {
  const finalOrgId = orgId || await getCurrentOrgId();
  return genericInsert('leads_crm', leadData, finalOrgId);
}

export async function updateLead(leadId, updates, orgId = null) {
  const finalOrgId = orgId || await getCurrentOrgId();
  return genericUpdate('leads_crm', leadId, updates, finalOrgId);
}

export async function deleteLead(leadId, orgId = null) {
  const finalOrgId = orgId || await getCurrentOrgId();
  return genericDelete('leads_crm', leadId, finalOrgId);
}

// ===== DASHBOARD FUNCTIONS =====
export async function getDashboardKPIs(orgId = null) {
  try {
    const finalOrgId = orgId || await getCurrentOrgId();
    const { data, error } = await supabase
      .from('dashboard_summary')
      .select('*')
      .eq('org_id', finalOrgId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // Não é erro de "não encontrado"
      throw error;
    }
    
    return data || {
      total_leads: 0,
      leads_semana: 0,
      leads_qualificados: 0,
      leads_quentes: 0,
      taxa_qualificacao: 0
    };
  } catch (err) {
    console.error('Erro ao buscar KPIs:', err);
    return {
      total_leads: 0,
      leads_semana: 0,
      leads_qualificados: 0,
      leads_quentes: 0,
      taxa_qualificacao: 0
    };
  }
}

// ===== REALTIME FUNCTIONS =====
export function subscribeToTable(table, orgId, callback) {
  const channel = supabase.channel(`realtime:${table}:${orgId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table, 
        filter: orgId ? `org_id=eq.${orgId}` : null
      }, 
      (payload) => {
        console.log(`📡 Realtime update on ${table}:`, payload);
        callback(payload);
      }
    )
    .subscribe();
    
  console.log(`📡 Subscribed to realtime updates on ${table}`);
  return channel;
}

export function unsubscribeFromTable(channel) {
  if (channel) {
    supabase.removeChannel(channel);
    console.log('📡 Unsubscribed from realtime channel');
  }
}

// ===== AUDIT FUNCTIONS =====
export async function createAuditLog(action, details, orgId = null, userId = null) {
  try {
    const finalOrgId = orgId || await getCurrentOrgId();
    const finalUserId = userId || (await getCurrentUser())?.id;
    
    const auditData = {
      action,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      org_id: finalOrgId,
      user_id: finalUserId,
      created_at: new Date().toISOString()
    };
    
    return genericInsert('audit_log', auditData);
  } catch (err) {
    const error = handleError(err, 'createAuditLog');
    return { success: false, error };
  }
}

// ===== FORMAT HELPERS =====
export function formatDateBR(date, options = {}) {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Data inválida';
    
    const defaultOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
      ...options
    };
    
    return dateObj.toLocaleDateString('pt-BR', defaultOptions);
  } catch (error) {
    console.error('🚨 Erro ao formatar data:', error);
    return 'Erro na formatação';
  }
}

export function formatTimeAgo(date) {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Data inválida';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    }
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} mês${months > 1 ? 'es' : ''} atrás`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ano${years > 1 ? 's' : ''} atrás`;
  } catch (error) {
    console.error('🚨 Erro ao calcular tempo relativo:', error);
    return 'Erro no cálculo';
  }
}

// ===== NOTIFICATION HELPERS =====
export function showNotification(message, type = 'info', duration = 3000) {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Tentar usar sistema de notificação customizado se existir
  if (typeof window !== 'undefined') {
    if (window.showToast) {
      window.showToast(message, type, duration);
    } else if (window.Toastify) {
      window.Toastify({
        text: message,
        duration,
        backgroundColor: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'
      }).showToast();
    }
  }
  
  return { success: true, message, type };
}

// ===== EXPORTS PRINCIPAIS =====
export { 
  supabase,
  DEFAULT_ORG_ID,
  getDefaultOrgId,
  isValidUUID,
  generateUUID,
  handleError
};

// Disponibilizar no window para compatibilidade (se estiver no browser)
if (typeof window !== 'undefined') {
  window.AlshamSupabase = {
    supabase,
    signOut,
    getCurrentSession,
    getCurrentUser,
    onAuthStateChange,
    signInWithPassword,
    getCurrentOrgId,
    getDefaultOrgId,
    genericSelect,
    genericInsert,
    genericUpdate,
    genericDelete,
    getLeads,
    createLead,
    updateLead,
    deleteLead,
    getDashboardKPIs,
    subscribeToTable,
    unsubscribeFromTable,
    createAuditLog,
    formatDateBR,
    formatTimeAgo,
    showNotification,
    DEFAULT_ORG_ID,
    isValidUUID,
    generateUUID,
    handleError
  };
  
  console.log('✅ AlshamSupabase v10.0 disponível globalmente!');
}

export default supabase;
