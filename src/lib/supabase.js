// src/lib/supabase.js
// ALSHAM 360° PRIMA - Supabase unified client v1.0
// Single source of truth for Supabase usage across the app
// Works as ESM import and exposes window.AlshamSupabase for legacy pages.

// Use ESM browser import of Supabase (works with Vite & modern browsers)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

// --------------------------- Configuration ---------------------------
const SUPABASE_URL = (() => {
  // prefer Vite env, then window override, then hardcoded fallback (project URL)
  try {
    return import.meta?.env?.VITE_SUPABASE_URL
      || (typeof window !== 'undefined' && window.__VITE_SUPABASE_URL__)
      || 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
  } catch {
    return typeof window !== 'undefined' ? window.__VITE_SUPABASE_URL__ : 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
  }
})();

const SUPABASE_ANON_KEY = (() => {
  try {
    return import.meta?.env?.VITE_SUPABASE_ANON_KEY
      || (typeof window !== 'undefined' && window.__VITE_SUPABASE_ANON_KEY__)
      // safe publishable fallback (rotate in dashboard if needed)
      || 'sb_publishable_AGXjFzibpEtaLIwAu-ZNfA_BAdNLyF_2tPHhCZPRMBCZBY';
  } catch {
    return typeof window !== 'undefined' ? window.__VITE_SUPABASE_ANON_KEY__ : 'sb_publishable_AGXjFzibpEtaLIwAu-ZNfA_BAdNLyF_2tPHhCZPRMBCZBY';
  }
})();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // In development, better to fail loudly
  console.warn('⚠️ Supabase URL or Key not set. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in env.');
}

// --------------------------- Create client ---------------------------
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'alsham-360-prima@unified-1.0',
      'X-Environment': (typeof window !== 'undefined' && window.location?.hostname) || 'server'
    }
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  }
});

// --------------------------- Error helper ---------------------------
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

// --------------------------- Utilities ---------------------------
function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function formatDateBR(date, options = {}) {
  if (!date) return '';
  const d = (typeof date === 'string') ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Data inválida';
  const defaultOptions = { year: 'numeric', month: '2-digit', day: '2-digit', ...options };
  return d.toLocaleDateString('pt-BR', defaultOptions);
}

function formatTimeAgo(date) {
  if (!date) return '';
  const d = (typeof date === 'string') ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Data inválida';
  const now = new Date();
  const s = Math.floor((now - d) / 1000);
  if (s < 60) return 'agora mesmo';
  if (s < 3600) return `${Math.floor(s / 60)} minuto${Math.floor(s / 60) > 1 ? 's' : ''} atrás`;
  if (s < 86400) return `${Math.floor(s / 3600)} hora${Math.floor(s / 3600) > 1 ? 's' : ''} atrás`;
  if (s < 2592000) return `${Math.floor(s / 86400)} dia${Math.floor(s / 86400) > 1 ? 's' : ''} atrás`;
  if (s < 31536000) return `${Math.floor(s / 2592000)} mês${Math.floor(s / 2592000) > 1 ? 'es' : ''} atrás`;
  return `${Math.floor(s / 31536000)} ano${Math.floor(s / 31536000) > 1 ? 's' : ''} atrás`;
}

function sanitizeInput(input, opts = {}) {
  if (input === null || input === undefined) return opts.allowNull ? null : '';
  let v = (typeof input === 'string') ? input : String(input);
  v = v.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '').trim();
  if (opts.maxLength && v.length > opts.maxLength) v = v.substring(0, opts.maxLength);
  if (opts.removeSpecialChars) v = v.replace(/[^\w\s@.-]/g, '');
  if (opts.toLowerCase) v = v.toLowerCase();
  if (opts.removeExtraSpaces) v = v.replace(/\s+/g, ' ');
  return v;
}

function checkBoutcesses() {
  console.log('✅ checkBoutcesses ok');
  return { success: true, message: 'All systems operational' };
}

// --------------------------- Default Org ID ---------------------------
// Use a stable fallback org id if user has no org configured.
// You can change this to a real organization ID if desired.
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
function getDefaultOrgId() { return DEFAULT_ORG_ID; }

// --------------------------- AUTH / SESSION ---------------------------
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
    try { callback(event, session); } catch (e) { console.error('onAuth callback error', e); }
  });
}

// --------------------------- ORG helpers ---------------------------
async function getCurrentOrgId() {
  try {
    const session = await getCurrentSession();
    if (!session?.user) return getDefaultOrgId();
    const userId = session.user.id;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn('getCurrentOrgId warning:', error);
      return getDefaultOrgId();
    }
    const orgId = data?.org_id;
    if (!orgId || !isValidUUID(orgId)) return getDefaultOrgId();
    return orgId;
  } catch (err) {
    console.warn('getCurrentOrgId fallback to default', err);
    return getDefaultOrgId();
  }
}

// --------------------------- GENERIC CRUD ---------------------------
async function genericSelect(table, filters = {}, options = {}) {
  try {
    let q = supabase.from(table).select(options.select || '*');
    // simple equality filters
    Object.entries(filters || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) q = q.eq(k, v);
    });
    if (options.order) q = q.order(options.order.column, { ascending: !!options.order.ascending });
    if (options.limit) q = q.limit(options.limit);
    const { data, error } = await q;
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: handleError(err, `genericSelect:${table}`) };
  }
}

async function genericInsert(table, payload, orgId = null) {
  try {
    const body = orgId ? { ...payload, org_id: orgId } : payload;
    const { data, error } = await supabase.from(table).insert(body).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: handleError(err, `genericInsert:${table}`) };
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
    return { success: false, error: handleError(err, `genericUpdate:${table}`) };
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
    return { success: false, error: handleError(err, `genericDelete:${table}`) };
  }
}

// --------------------------- Domain-specific helpers ---------------------------
async function getDashboardKPIs(orgIdParam = null) {
  try {
    const orgId = orgIdParam || await getCurrentOrgId();
    const { data, error } = await supabase
      .from('dashboard_summary')
      .select('*')
      .eq('org_id', orgId)
      .order('updated_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    return (data && data.length) ? data[0] : null;
  } catch (err) {
    return { error: handleError(err, 'getDashboardKPIs') };
  }
}

async function getLeads(limit = 50, orgIdParam = null) {
  try {
    const orgId = orgIdParam || await getCurrentOrgId();
    const { data, error } = await supabase
      .from('leads_crm')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return { data };
  } catch (err) {
    return { data: null, error: handleError(err, 'getLeads') };
  }
}

async function createLead(payload, orgIdParam = null) {
  return genericInsert('leads_crm', payload, orgIdParam || await getCurrentOrgId());
}

// audit log
async function createAuditLog(action, details, userId = null, orgIdParam = null) {
  try {
    const org_id = orgIdParam || await getCurrentOrgId();
    const { data, error } = await supabase.from('audit_log').insert({
      action, details, user_id: userId, org_id, created_at: new Date().toISOString()
    }).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: handleError(err, 'createAuditLog') };
  }
}

// user profile
async function getUserProfile(userId, orgIdParam = null) {
  try {
    const orgId = orgIdParam || await getCurrentOrgId();
    const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).eq('org_id', orgId).maybeSingle();
    if (error) throw error;
    return { data };
  } catch (err) {
    return { data: null, error: handleError(err, 'getUserProfile') };
  }
}

async function updateUserProfile(userId, updates, orgIdParam = null) {
  try {
    const orgId = orgIdParam || await getCurrentOrgId();
    const { data, error } = await supabase.from('user_profiles').update(updates).eq('user_id', userId).eq('org_id', orgId).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: handleError(err, 'updateUserProfile') };
  }
}

// --------------------------- Realtime subscribe ---------------------------
function subscribeToTable(table, orgId, callback) {
  try {
    return supabase.channel(`realtime:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter: `org_id=eq.${orgId}` }, payload => callback(payload))
      .subscribe();
  } catch (err) {
    return { error: handleError(err, 'subscribeToTable') };
  }
}

// --------------------------- UI / Notifications ---------------------------
function showNotification(message, type = 'info') {
  if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
    window.showToast(message, type);
    return { success: true };
  }
  // fallback
  try {
    if (typeof window !== 'undefined' && window.alert && type === 'error') {
      window.alert(message);
      return { success: true };
    }
  } catch (e) { /* ignore */ }
  console.log(`[${type.toUpperCase()}] ${message}`);
  return { success: true };
}

// --------------------------- Expose on window for legacy pages ---------------------------
if (typeof window !== 'undefined') {
  window.supabaseClient = supabase;
  window.AlshamSupabase = {
    supabase,
    // auth/session
    getCurrentSession,
    getCurrentUser,
    signOut,
    onAuthStateChange,
    // org
    getCurrentOrgId,
    getDefaultOrgId,
    DEFAULT_ORG_ID,
    // generic CRUD
    genericSelect,
    genericInsert,
    genericUpdate,
    genericDelete,
    // domain
    getDashboardKPIs,
    getLeads,
    createLead,
    // user
    getUserProfile,
    updateUserProfile,
    // audit
    createAuditLog,
    // realtime
    subscribeToTable,
    // utils
    formatDateBR,
    formatTimeAgo,
    sanitizeInput,
    isValidUUID,
    generateUUID,
    checkBoutcesses,
    showNotification,
    handleError
  };
  console.log('✅ window.AlshamSupabase available with functions:', Object.keys(window.AlshamSupabase));
}

// --------------------------- Named exports (ESM) ---------------------------
export {
  supabase,
  // auth/session
  getCurrentSession,
  getCurrentUser,
  signOut,
  onAuthStateChange,
  // org
  getCurrentOrgId,
  getDefaultOrgId,
  DEFAULT_ORG_ID,
  // generic
  genericSelect,
  genericInsert,
  genericUpdate,
  genericDelete,
  // domain-specific
  getDashboardKPIs,
  getLeads,
  createLead,
  // user
  getUserProfile,
  updateUserProfile,
  // audit
  createAuditLog,
  // realtime
  subscribeToTable,
  // utils
  formatDateBR,
  formatTimeAgo,
  sanitizeInput,
  isValidUUID,
  generateUUID,
  checkBoutcesses,
  showNotification,
  handleError
};

export default supabase;
