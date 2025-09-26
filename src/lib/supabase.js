// -----------------------------------------------------------------------------
// src/lib/supabase.js
// ALSHAM 360° PRIMA - Supabase Unified Client v1.3 (Produção)
// Fonte única da verdade para toda integração com Supabase no sistema.
// Multi-tenant: cada cliente opera isolado pelo seu próprio org_id.
// ----------------------------------------------------------------------------- 

import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// Configuração (URL, Key e Org Padrão)
// -----------------------------------------------------------------------------
const SUPABASE_URL =
  typeof __SUPABASE_URL__ !== 'undefined'
    ? __SUPABASE_URL__
    : import.meta?.env?.VITE_SUPABASE_URL || '';

const SUPABASE_ANON_KEY =
  typeof __SUPABASE_ANON_KEY__ !== 'undefined'
    ? __SUPABASE_ANON_KEY__
    : import.meta?.env?.VITE_SUPABASE_ANON_KEY || '';

const DEFAULT_ORG_ID =
  typeof __DEFAULT_ORG_ID__ !== 'undefined'
    ? __DEFAULT_ORG_ID__
    : import.meta?.env?.VITE_DEFAULT_ORG_ID || null;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase URL ou Key não configuradas — verifique variáveis no Vercel.');
}

// -----------------------------------------------------------------------------
// Inicialização do cliente Supabase
// -----------------------------------------------------------------------------
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'alsham-360-prima@unified-1.3',
      'X-Environment':
        (typeof window !== 'undefined' && window.location?.hostname) || 'server'
    }
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  }
});

// -----------------------------------------------------------------------------
// Helpers de erro e utilidades
// -----------------------------------------------------------------------------
function handleError(err, context = 'supabase_operation') {
  if (!err) return { message: 'unknown error', context };
  const normalized = {
    message: err.message || String(err),
    code: err.code || null,
    details: err.details || null,
    hint: err.hint || null,
    context
  };
  console.error('Supabase Error:', normalized);
  return normalized;
}

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatDateBR(date, options = {}) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Data inválida';
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };
  return d.toLocaleDateString('pt-BR', defaultOptions);
}

function formatTimeAgo(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Data inválida';
  const now = new Date();
  const s = Math.floor((now - d) / 1000);
  if (s < 60) return 'agora mesmo';
  if (s < 3600) return `${Math.floor(s / 60)} min atrás`;
  if (s < 86400) return `${Math.floor(s / 3600)} h atrás`;
  if (s < 2592000) return `${Math.floor(s / 86400)} dias atrás`;
  return `${Math.floor(s / 2592000)} meses atrás`;
}

function sanitizeInput(input, opts = {}) {
  if (input === null || input === undefined) return opts.allowNull ? null : '';
  let v = typeof input === 'string' ? input : String(input);
  v = v.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '').trim();
  if (opts.maxLength && v.length > opts.maxLength) v = v.substring(0, opts.maxLength);
  if (opts.removeSpecialChars) v = v.replace(/[^\w\s@.-]/g, '');
  if (opts.toLowerCase) v = v.toLowerCase();
  return v;
}

// -----------------------------------------------------------------------------
// Autenticação e Sessão
// -----------------------------------------------------------------------------
async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data?.session || null;
  } catch (err) {
    handleError(err, 'getCurrentSession');
    return null;
  }
}

async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  } catch (err) {
    handleError(err, 'getCurrentUser');
    return null;
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: handleError(err, 'signOut') };
  }
}

function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    try {
      callback(event, session);
    } catch (e) {
      console.error('onAuth callback error', e);
    }
  });
}

// -----------------------------------------------------------------------------
// Funções de Auth Estendidas (para register.js e reset-password.js)
// -----------------------------------------------------------------------------
async function signUpWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { data, success: true };
  } catch (err) {
    return { success: false, error: handleError(err, 'signUpWithEmail') };
  }
}

async function resetPassword(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });
    if (error) throw error;
    return { data, success: true };
  } catch (err) {
    return { success: false, error: handleError(err, 'resetPassword') };
  }
}

async function checkEmailExists(email) {
  try {
    const { data, error } = await supabase.from('user_profiles').select('id').eq('email', email).maybeSingle();
    if (error) throw error;
    return !!data;
  } catch (err) {
    handleError(err, 'checkEmailExists');
    return false;
  }
}

async function createUserProfile(profile, orgIdParam = null) {
  try {
    const org_id = orgIdParam || (await getCurrentOrgId());
    const payload = {
      id: generateUUID(),
      user_id: profile.user_id,
      first_name: sanitizeInput(profile.first_name, { maxLength: 50 }),
      last_name: sanitizeInput(profile.last_name, { maxLength: 50 }),
      email: sanitizeInput(profile.email, { maxLength: 100, toLowerCase: true }),
      org_id,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('user_profiles').insert(payload).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: handleError(err, 'createUserProfile') };
  }
}

// -----------------------------------------------------------------------------
// Organização (org_id)
// -----------------------------------------------------------------------------
function getDefaultOrgId() {
  return DEFAULT_ORG_ID;
}

async function getCurrentOrgId() {
  try {
    const session = await getCurrentSession();
    if (!session?.user) return getDefaultOrgId();
    const userId = session.user.id;
    const { data, error } = await supabase.from('user_profiles').select('org_id').eq('user_id', userId).limit(1).maybeSingle();
    if (error) return getDefaultOrgId();
    return isValidUUID(data?.org_id) ? data.org_id : getDefaultOrgId();
  } catch {
    return getDefaultOrgId();
  }
}

// -----------------------------------------------------------------------------
// CRUD Genérico
// -----------------------------------------------------------------------------
async function genericSelect(table, filters = {}, options = {}) {
  try {
    let q = supabase.from(table).select(options.select || '*');
    Object.entries(filters).forEach(([k, v]) => {
      if (v) q = q.eq(k, v);
    });
    if (options.order) q = q.order(options.order.column, { ascending: !!options.order.ascending });
    if (options.limit) q = q.limit(options.limit);
    const { data, error } = await q;
    if (error) throw error;
    return { data };
  } catch (err) {
    return { data: null, error: handleError(err, `select:${table}`) };
  }
}

async function genericInsert(table, payload, orgId = null) {
  try {
    const body = orgId ? { ...payload, org_id: orgId } : payload;
    const { data, error } = await supabase.from(table).insert(body).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: handleError(err, `insert:${table}`) };
  }
}

async function genericUpdate(table, id, updates, orgId = null) {
  try {
    let q = supabase.from(table).update(updates).eq('id', id);
    if (orgId) q = q.eq('org_id', orgId);
    const { data, error } = await q.select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: handleError(err, `update:${table}`) };
  }
}

async function genericDelete(table, id, orgId = null) {
  try {
    let q = supabase.from(table).delete().eq('id', id);
    if (orgId) q = q.eq('org_id', orgId);
    const { data, error } = await q.select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: handleError(err, `delete:${table}`) };
  }
}

// -----------------------------------------------------------------------------
// Domínios específicos ALSHAM
// -----------------------------------------------------------------------------
async function getDashboardKPIs(orgIdParam = null) {
  try {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('dashboard_summary').select('*').eq('org_id', orgId).order('updated_at', { ascending: false }).limit(1);
    if (error) throw error;
    if (!data || data.length === 0) {
      return { leads_total: 0, leads_novos: 0, leads_qualificados: 0, taxa_conversao: 0 };
    }
    return data[0];
  } catch (err) {
    return { error: handleError(err, 'getDashboardKPIs') };
  }
}

async function getLeads(limit = 50, orgIdParam = null) {
  try {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('leads_crm').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return { data };
  } catch (err) {
    return { data: null, error: handleError(err, 'getLeads') };
  }
}

async function createLead(payload, orgIdParam = null) {
  return genericInsert('leads_crm', payload, orgIdParam || (await getCurrentOrgId()));
}

async function createAuditLog(action, details, userId = null, orgIdParam = null) {
  try {
    const org_id = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('audit_log').insert({
      action, details, user_id: userId, org_id, created_at: new Date().toISOString()
    }).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: handleError(err, 'auditLog') };
  }
}

async function getUserProfile(userId, orgIdParam = null) {
  try {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).eq('org_id', orgId).maybeSingle();
    if (error) throw error;
    return { data };
  } catch (err) {
    return { data: null, error: handleError(err, 'getUserProfile') };
  }
}

async function updateUserProfile(userId, updates, orgIdParam = null) {
  try {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('user_profiles').update(updates).eq('user_id', userId).eq('org_id', orgId).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: handleError(err, 'updateUserProfile') };
  }
}

// -----------------------------------------------------------------------------
// Realtime
// -----------------------------------------------------------------------------
function subscribeToTable(table, orgId, callback) {
  try {
    return supabase.channel(`realtime:${table}`).on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter: `org_id=eq.${orgId}` },
      payload => callback(payload)
    ).subscribe();
  } catch (err) {
    return { error: handleError(err, 'subscribeToTable') };
  }
}

// -----------------------------------------------------------------------------
// Notificações / UI
// -----------------------------------------------------------------------------
function showNotification(message, type = 'info') {
  if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
    window.showToast(message, type);
    return { success: true };
  }
  console.log(`[${type.toUpperCase()}] ${message}`);
  return { success: true };
}

// -----------------------------------------------------------------------------
// Exposição no Window (para páginas antigas)
// -----------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.supabaseClient = supabase;
  window.AlshamSupabase = {
    supabase,
    getCurrentSession,
    getCurrentUser,
    signOut,
    onAuthStateChange,
    signUpWithEmail,
    resetPassword,
    checkEmailExists,
    createUserProfile,
    getCurrentOrgId,
    getDefaultOrgId,
    DEFAULT_ORG_ID,
    genericSelect,
    genericInsert,
    genericUpdate,
    genericDelete,
    getDashboardKPIs,
    getLeads,
    createLead,
    getUserProfile,
    updateUserProfile,
    createAuditLog,
    subscribeToTable,
    formatDateBR,
    formatTimeAgo,
    sanitizeInput,
    isValidUUID,
    generateUUID,
    showNotification,
    handleError
  };
  console.log('✅ window.AlshamSupabase disponível:', Object.keys(window.AlshamSupabase));
}

// -----------------------------------------------------------------------------
// Export moderno (ESM)
// -----------------------------------------------------------------------------
export {
  supabase,
  getCurrentSession,
  getCurrentUser,
  signOut,
  onAuthStateChange,
  signUpWithEmail,
  resetPassword,
  checkEmailExists,
  createUserProfile,
  getCurrentOrgId,
  getDefaultOrgId,
  DEFAULT_ORG_ID,
  genericSelect,
  genericInsert,
  genericUpdate,
  genericDelete,
  getDashboardKPIs,
  getLeads,
  createLead,
  getUserProfile,
  updateUserProfile,
  createAuditLog,
  subscribeToTable,
  formatDateBR,
  formatTimeAgo,
  sanitizeInput,
  isValidUUID,
  generateUUID,
  showNotification,
  handleError
};

export default supabase;
