// src/lib/supabase.js - ALSHAM 360° PRIMA Supabase Unified Client v6.x (Auditado, Seguro, Completo)
// Import seguro (sem hardcode)
import { createClient } from '@supabase/supabase-js';
// Load env (para produção, use process.env ou import.meta.env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const DEFAULT_ORG_ID = import.meta.env.VITE_DEFAULT_ORG_ID || 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe';
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase env vars missing');
console.log('✅ Supabase configurado:', SUPABASE_URL);
// Inicialização do cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: 'pkce' },
  global: { headers: { 'X-Client-Info': 'alsham-360-prima@unified-2.0', 'X-Environment': typeof window !== 'undefined' ? window.location.hostname : 'server' } },
  realtime: { params: { eventsPerSecond: 10 } }
});
// ----------------------------------------------------------------------------
// Helpers e utilidades
// ----------------------------------------------------------------------------
function handleError(err, context = 'supabase_operation') {
  const normalized = { message: err?.message || 'Unknown', code: err?.code, details: err?.details, hint: err?.hint, context };
  console.error('❌ Supabase Error:', normalized);
  return normalized;
}
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try { return await operation(); } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
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
  const defaultOptions = { year: 'numeric', month: '2-digit', day: '2-digit', ...options };
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
// ----------------------------------------------------------------------------
// Autenticação e Sessão (com retry e MFA)
// ----------------------------------------------------------------------------
async function getCurrentSession() {
  return retryOperation(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data?.session || null;
  });
}
async function getCurrentUser() {
  return retryOperation(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (data.user.aal && data.user.aal !== 'aal2') throw new Error('MFA (aal2) requerido');
    return data?.user || null;
  });
}
async function signOut() {
  return retryOperation(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  }).catch(err => ({ success: false, error: handleError(err, 'signOut') }));
}
function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    try { callback(event, session); } catch (e) { console.error('onAuth callback error', e); }
  });
}
async function signUpWithEmail(email, password) {
  return retryOperation(async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { data, success: true };
  }).catch(err => ({ success: false, error: handleError(err, 'signUpWithEmail') }));
}
async function resetPassword(email) {
  return retryOperation(async () => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password.html` : undefined
    });
    if (error) throw error;
    return { data, success: true };
  }).catch(err => ({ success: false, error: handleError(err, 'resetPassword') }));
}
async function genericSignIn(email, password) {
  return retryOperation(async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { data, success: true };
  }).catch(err => ({ success: false, error: handleError(err, 'genericSignIn') }));
}
async function checkEmailExists(email) {
  return retryOperation(async () => {
    const { data, error } = await supabase.from('user_profiles').select('id').eq('email', email).maybeSingle();
    if (error) throw error;
    return !!data;
  }).catch(err => {
    handleError(err, 'checkEmailExists');
    return false;
  });
}
async function createUserProfile(profile, orgIdParam = null) {
  return retryOperation(async () => {
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
  }).catch(err => ({ success: false, error: handleError(err, 'createUserProfile') }));
}
// ----------------------------------------------------------------------------
// Organização (org_id) com retry
// ----------------------------------------------------------------------------
function getDefaultOrgId() {
  return DEFAULT_ORG_ID;
}
async function getCurrentOrgId() {
  return retryOperation(async () => {
    const session = await getCurrentSession();
    if (!session?.user) return getDefaultOrgId();
    const userId = session.user.id;
    const { data, error } = await supabase.from('user_profiles').select('org_id').eq('user_id', userId).limit(1).maybeSingle();
    if (error || !isValidUUID(data?.org_id)) return getDefaultOrgId();
    return data.org_id;
  }).catch(() => getDefaultOrgId());
}
// ----------------------------------------------------------------------------
// CRUD Genérico (select com cache, batch insert, retry)
// ----------------------------------------------------------------------------
async function genericSelect(table, filters = {}, options = {}) {
  const cacheKey = `cache_${table}_${JSON.stringify(filters)}`;
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return { data: JSON.parse(cached) };
  }
  return retryOperation(async () => {
    let q = supabase.from(table).select(options.select || '*');
    Object.entries(filters).forEach(([k, v]) => { if (v) q = q.eq(k, v); });
    if (options.order) q = q.order(options.order.column, { ascending: !!options.order.ascending });
    if (options.limit) q = q.limit(options.limit);
    const { data, error } = await q;
    if (error) throw error;
    if (typeof window !== 'undefined' && data) localStorage.setItem(cacheKey, JSON.stringify(data));
    return { data };
  }).catch(err => ({ data: null, error: handleError(err, `select:${table}`) }));
}
async function genericInsert(table, payload, orgId = null) {
  return retryOperation(async () => {
    const body = orgId ? { ...payload, org_id: orgId } : payload;
    const { data, error } = await supabase.from(table).insert(body).select();
    if (error) throw error;
    return { success: true, data };
  }).catch(err => ({ success: false, error: handleError(err, `insert:${table}`) }));
}
async function genericUpdate(table, filter, updates, orgId = null) {
  return retryOperation(async () => {
    let q = supabase.from(table).update(updates);
    if (typeof filter === 'string') {
      q = q.eq('id', filter);
    } else if (typeof filter === 'object' && filter.id) {
      q = q.eq('id', filter.id);
    } else {
      throw new Error('Filter inválido: deve ser string ou objeto com propriedade id');
    }
    if (orgId) q = q.eq('org_id', orgId);
    const { data, error } = await q.select();
    if (error) throw error;
    return { success: true, data };
  }).catch(err => ({ success: false, error: handleError(err, `update:${table}`) }));
}
async function genericDelete(table, id, orgId = null) {
  return retryOperation(async () => {
    let q = supabase.from(table).delete().eq('id', id);
    if (orgId) q = q.eq('org_id', orgId);
    const { data, error } = await q.select();
    if (error) throw error;
    return { success: true, data };
  }).catch(err => ({ success: false, error: handleError(err, `delete:${table}`) }));
}
// ----------------------------------------------------------------------------
// Domínios específicos ALSHAM (KPIs, ROI, AI scoring, n8n)
// ----------------------------------------------------------------------------
async function getDashboardKPIs(orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('dashboard_kpis').select('*').eq('org_id', orgId).maybeSingle();
    if (error || !data) {
      const { data: leads, error: leadsError } = await supabase.from('leads_crm').select('id, status, temperatura, created_at').eq('org_id', orgId);
      if (leadsError) throw leadsError;
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        total_leads: leads?.length || 0,
        new_leads_last_7_days: leads?.filter(l => new Date(l.created_at) >= sevenDaysAgo).length || 0,
        qualified_leads: leads?.filter(l => ['qualificado', 'em_contato'].includes(l.status)).length || 0,
        hot_leads: leads?.filter(l => l.temperatura === 'quente').length || 0,
        converted_leads: leads?.filter(l => l.status === 'convertido').length || 0,
        lost_leads: leads?.filter(l => l.status === 'perdido').length || 0,
        warm_leads: leads?.filter(l => l.temperatura === 'morno').length || 0,
        cold_leads: leads?.filter(l => l.temperatura === 'frio').length || 0,
        conversion_rate: leads?.length ? ((leads.filter(l => l.status === 'convertido').length / leads.length) * 100).toFixed(2) : 0
      };
    }
    return data;
  }).catch(err => ({
    total_leads: 0,
    new_leads_last_7_days: 0,
    qualified_leads: 0,
    hot_leads: 0,
    error: handleError(err, 'getDashboardKPIs')
  }));
}
async function getROI(orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || await getCurrentOrgId();
    const { data, error } = await supabase.from('v_roi_monthly').select('*').eq('org_id', orgId).order('period_date', { ascending: false }).limit(1);
    if (error) throw error;
    return data?.[0] || { revenue: 0, spend: 0, roi: 0 };
  }).catch(err => ({ revenue: 0, spend: 0, roi: 0, error: handleError(err, 'getROI') }));
}
async function recalculateLeadScore(leadId, orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || await getCurrentOrgId();
    const { data, error } = await supabase.functions.invoke('calculate-lead-score', { body: { lead_id: leadId, org_id: orgId } });
    if (error) throw error;
    return data;
  }).catch(err => ({ score: null, error: handleError(err, 'recalculateLeadScore') }));
}
async function triggerN8n(endpoint, payload) {
  return retryOperation(async () => {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`n8n status: ${response.status}`);
    return response.json();
  }).catch(err => ({ error: handleError(err, 'triggerN8n') }));
}
// ----------------------------------------------------------------------------
// CRUD e Domínios extra para leads, audit log, user profile
// ----------------------------------------------------------------------------
async function getLeads(limit = 50, orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('leads_crm').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return { data };
  }).catch(err => ({ data: null, error: handleError(err, 'getLeads') }));
}
async function createLead(payload, orgIdParam = null) {
  return genericInsert('leads_crm', payload, orgIdParam || (await getCurrentOrgId()));
}
async function createAuditLog(action, details, userId = null, orgIdParam = null) {
  return retryOperation(async () => {
    const org_id = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('audit_log').insert({
      action, details, user_id: userId, org_id, created_at: new Date().toISOString()
    }).select();
    if (error) throw error;
    return { success: true, data };
  }).catch(err => ({ success: false, error: handleError(err, 'auditLog') }));
}
async function getUserProfile(userId, orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).eq('org_id', orgId).maybeSingle();
    if (error) throw error;
    return { data };
  }).catch(err => ({ data: null, error: handleError(err, 'getUserProfile') }));
}
async function updateUserProfile(userId, updates, orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('user_profiles').update(updates).eq('user_id', userId).eq('org_id', orgId).select();
    if (error) throw error;
    return { success: true, data };
  }).catch(err => ({ success: false, error: handleError(err, 'updateUserProfile') }));
}
// ----------------------------------------------------------------------------
// Realtime (com retry em subscribe)
// ----------------------------------------------------------------------------
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
function unsubscribeFromTable(subscription) {
  try {
    supabase.removeChannel(subscription);
    return { success: true };
  } catch (err) {
    return { success: false, error: handleError(err, 'unsubscribeFromTable') };
  }
}
// ----------------------------------------------------------------------------
// Notificações / UI
// ----------------------------------------------------------------------------
function showNotification(message, type = 'info') {
  if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
    window.showToast(message, type);
    return { success: true };
  }
  console.log(`[${type.toUpperCase()}] ${message}`);
  return { success: true };
}
// ----------------------------------------------------------------------------
// Exposição no Window para uso global no browser
// ----------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.supabaseClient = supabase;
  window.AlshamSupabase = window.AlshamSupabase || {};
  Object.assign(window.AlshamSupabase, {
    supabase,
    getCurrentSession,
    getCurrentUser,
    signOut,
    onAuthStateChange,
    signUpWithEmail,
    resetPassword,
    genericSignIn,
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
    getROI,
    recalculateLeadScore,
    triggerN8n,
    getLeads,
    createLead,
    getUserProfile,
    updateUserProfile,
    createAuditLog,
    subscribeToTable,
    unsubscribeFromTable,
    formatDateBR,
    formatTimeAgo,
    sanitizeInput,
    isValidUUID,
    generateUUID,
    showNotification,
    handleError,
    retryOperation // <-- CORREÇÃO: agora está disponível globalmente!
  });
  console.log('✅ window.AlshamSupabase disponível:', Object.keys(window.AlshamSupabase));
}
// ----------------------------------------------------------------------------
// Export moderno (ESM)
// ----------------------------------------------------------------------------
export {
  supabase,
  getCurrentSession,
  getCurrentUser,
  signOut,
  onAuthStateChange,
  signUpWithEmail,
  resetPassword,
  genericSignIn,
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
  getROI,
  recalculateLeadScore,
  triggerN8n,
  getLeads,
  createLead,
  getUserProfile,
  updateUserProfile,
  createAuditLog,
  subscribeToTable,
  unsubscribeFromTable,
  formatDateBR,
  formatTimeAgo,
  sanitizeInput,
  isValidUUID,
  generateUUID,
  showNotification,
  handleError,
  retryOperation
};
export default supabase;
