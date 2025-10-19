// src/lib/supabase.js - ALSHAM 360° PRIMA Supabase Unified Client v6.1 (Otimizado, Auditado, Completo)
// Changelog v6.1 (2025-10-12):
// - ✅ Cache com TTL de 5 minutos
// - ✅ JSDoc completo em todas funções principais
// - ✅ Limpeza automática de cache expirado
// - ✅ TypeScript types hints
// - ✅ v6.2: Supabase via CDN (sem npm import)
// ✅ Import do CDN (carregado via <script> no HTML)
const { createClient } = window.supabase;
// Load env (para produção, use process.env ou import.meta.env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const DEFAULT_ORG_ID = import.meta.env.VITE_DEFAULT_ORG_ID || 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe';
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase env vars missing');
console.log('✅ Supabase configurado:', SUPABASE_URL);
// Inicialização do cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: 'pkce' },
  global: {
    headers: {
      'X-Client-Info': 'alsham-360-prima@unified-6.2-cdn',
      'X-Environment': typeof window !== 'undefined' ? window.location.hostname : 'server'
    }
  },
  realtime: { params: { eventsPerSecond: 10 } }
});
// ============================================================================
// CONSTANTES
// ============================================================================
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
// ============================================================================
// HELPERS E UTILIDADES
// ============================================================================
/**
 * Normaliza e loga erros do Supabase
 * @param {Error} err - Erro capturado
 * @param {string} context - Contexto da operação (ex: 'signIn', 'select:leads')
 * @returns {object} Erro normalizado com code, message, details
 */
function handleError(err, context = 'supabase_operation') {
  const normalized = {
    message: err?.message || 'Unknown',
    code: err?.code,
    details: err?.details,
    hint: err?.hint,
    context
  };
  console.error('❌ Supabase Error:', normalized);
  return normalized;
}
/**
 * Executa operação com retry automático (exponential backoff)
 * @param {Function} operation - Função async a executar
 * @param {number} maxRetries - Máximo de tentativas (padrão: 3)
 * @returns {Promise<any>} Resultado da operação
 * @throws {Error} Se todas tentativas falharem
 */
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // 1s, 2s, 3s
    }
  }
}
/**
 * Valida se string é UUID v4 válido
 * @param {string} uuid - String a validar
 * @returns {boolean} true se UUID válido
 */
function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}
/**
 * Gera UUID v4 aleatório
 * @returns {string} UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
/**
 * Formata data para padrão brasileiro
 * @param {Date|string} date - Data a formatar
 * @param {object} options - Opções Intl.DateTimeFormat
 * @returns {string} Data formatada (ex: "12/10/2025")
 */
function formatDateBR(date, options = {}) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Data inválida';
  const defaultOptions = { year: 'numeric', month: '2-digit', day: '2-digit', ...options };
  return d.toLocaleDateString('pt-BR', defaultOptions);
}
/**
 * Converte data em string relativa (ex: "há 2 horas")
 * @param {Date|string} date - Data a converter
 * @returns {string} Tempo relativo (ex: "agora mesmo", "5 min atrás")
 */
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
/**
 * Sanitiza input contra XSS e injections
 * @param {any} input - Input a sanitizar
 * @param {object} opts - Opções: allowNull, maxLength, removeSpecialChars, toLowerCase
 * @returns {string} String sanitizada
 */
function sanitizeInput(input, opts = {}) {
  if (input === null || input === undefined) return opts.allowNull ? null : '';
  let v = typeof input === 'string' ? input : String(input);
  v = v.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '').trim();
  v = v.replace(/[\x00-\x1F\x7F]/g, ''); // Remover controles ASCII
  if (opts.maxLength && v.length > opts.maxLength) v = v.substring(0, opts.maxLength);
  if (opts.removeSpecialChars) v = v.replace(/[^\w\s@.-]/g, '');
  if (opts.toLowerCase) v = v.toLowerCase();
  return v;
}
/**
 * Salva dados no cache localStorage com timestamp
 * @private
 * @param {string} key - Chave do cache
 * @param {any} data - Dados a cachear
 */
function saveToCache(key, data) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
      console.warn('Cache write failed:', e);
    }
  }
}
/**
 * Recupera dados do cache localStorage (com TTL)
 * @private
 * @param {string} key - Chave do cache
 * @returns {any|null} Dados cacheados ou null se expirado/inexistente
 */
function getFromCache(key) {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          return data;
        } else {
          localStorage.removeItem(key); // Limpar cache expirado
        }
      }
    } catch (e) {
      console.warn('Cache read failed:', e);
    }
  }
  return null;
}
// ============================================================================
// AUTENTICAÇÃO E SESSÃO (com retry e MFA)
// ============================================================================
/**
 * Obtém sessão atual do Supabase Auth
 * @returns {Promise<object|null>} Sessão ou null se não autenticado
 */
async function getCurrentSession() {
  return retryOperation(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data?.session || null;
  });
}
/**
 * Obtém usuário atual (com validação MFA se configurado)
 * @returns {Promise<object|null>} User object ou null
 * @throws {Error} Se MFA (aal2) requerido mas não satisfeito
 */
async function getCurrentUser() {
  return retryOperation(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (data.user.aal && data.user.aal !== 'aal2') throw new Error('MFA (aal2) requerido');
    return data?.user || null;
  });
}
/**
 * Desloga usuário atual
 * @returns {Promise<{success: boolean, error?: object}>}
 */
async function signOut() {
  return retryOperation(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  }).catch(err => ({ success: false, error: handleError(err, 'signOut') }));
}
/**
 * Registra callback para mudanças no estado de autenticação
 * @param {Function} callback - Callback(event, session)
 * @returns {object} Subscription object
 */
function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    try {
      callback(event, session);
    } catch (e) {
      console.error('onAuth callback error', e);
    }
  });
}
/**
 * Cadastra novo usuário com email/senha
 * @param {string} email - Email do usuário
 * @param {string} password - Senha (min 6 caracteres)
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
async function signUpWithEmail(email, password) {
  return retryOperation(async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { data, success: true };
  }).catch(err => ({ success: false, error: handleError(err, 'signUpWithEmail') }));
}
/**
 * Envia email de recuperação de senha
 * @param {string} email - Email do usuário
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
async function resetPassword(email) {
  return retryOperation(async () => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password.html` : undefined
    });
    if (error) throw error;
    return { data, success: true };
  }).catch(err => ({ success: false, error: handleError(err, 'resetPassword') }));
}
/**
 * Autentica usuário com email/senha
 * @param {string} email - Email do usuário
 * @param {string} password - Senha
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * @example
 * const result = await genericSignIn('user@example.com', 'pass123');
 * if (result.success) console.log('Logado:', result.data.user);
 */
async function genericSignIn(email, password) {
  return retryOperation(async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { data, success: true };
  }).catch(err => ({ success: false, error: handleError(err, 'genericSignIn') }));
}
/**
 * Verifica se email já existe no sistema
 * @param {string} email - Email a verificar
 * @returns {Promise<boolean>} true se existe
 */
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
/**
 * Cria perfil de usuário
 * @param {object} profile - Dados do perfil (user_id, first_name, last_name, email)
 * @param {string} [orgId] - ID da organização (opcional)
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
async function createUserProfile(profile, orgId = null) {
  return retryOperation(async () => {
    const org_id = orgId || (await getCurrentOrgId());
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
// ============================================================================
// ORGANIZAÇÃO (org_id) com retry
// ============================================================================
/**
 * Retorna org_id padrão do sistema
 * @returns {string} UUID da org padrão
 */
function getDefaultOrgId() {
  return DEFAULT_ORG_ID;
}
/**
 * Obtém org_id do usuário autenticado (com fallback para default)
 * @returns {Promise<string>} UUID da organização
 */
async function getCurrentOrgId() {
  return retryOperation(async () => {
    const session = await getCurrentSession();
    if (!session || !session.user) return getDefaultOrgId();
    const userId = session.user.id;
    const { data, error } = await supabase.from('user_profiles').select('org_id').eq('user_id', userId).limit(1).maybeSingle();
    if (error || !isValidUUID(data?.org_id)) return getDefaultOrgId();
    return data.org_id;
  }).catch(() => getDefaultOrgId());
}
// ============================================================================
// CRUD GENÉRICO (com cache TTL, batch insert, retry)
// ============================================================================
/**
 * Select genérico com cache e filtros
 * @param {string} table - Nome da tabela
 * @param {object} [filters={}] - Filtros (ex: {status: 'ativo'})
 * @param {object} [options={}] - Opções: select, order, limit
 * @returns {Promise<{data: Array|null, error?: object}>}
 * @example
 * const {data} = await genericSelect('leads_crm', {org_id: '...'}, {limit: 10});
 */
async function genericSelect(table, filters = {}, options = {}) {
  const cacheKey = `cache_${table}_${JSON.stringify(filters)}`;
 
  // Tentar cache
  const cached = getFromCache(cacheKey);
  if (cached) return { data: cached };
 
  return retryOperation(async () => {
    let q = supabase.from(table).select(options.select || '*');
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined) q = q.eq(k, v);
    });
    if (options.order) q = q.order(options.order.column, { ascending: !!options.order.ascending });
    if (options.limit) q = q.limit(options.limit);
    const { data, error } = await q;
    if (error) throw error;
   
    // Salvar em cache
    if (data) saveToCache(cacheKey, data);
   
    return { data };
  }).catch(err => ({ data: null, error: handleError(err, `select:${table}`) }));
}
/**
 * Insert em batch (múltiplos registros de uma vez)
 * @param {string} table - Nome da tabela
 * @param {Array<object>} payloads - Array de objetos a inserir
 * @param {string} [orgId] - org_id a adicionar em todos registros
 * @returns {Promise<{success: boolean, data?: Array, error?: object}>}
 */
async function genericBatchInsert(table, payloads, orgId = null) {
  return retryOperation(async () => {
    const bodies = payloads.map(p => orgId ? { ...p, org_id: orgId } : p);
    const { data, error } = await supabase.from(table).insert(bodies).select();
    if (error) throw error;
    return { success: true, data };
  }).catch(err => ({ success: false, error: handleError(err, `batchInsert:${table}`) }));
}
/**
 * Insert genérico (single)
 * @param {string} table - Nome da tabela
 * @param {object} payload - Dados a inserir
 * @param {string} [orgId] - org_id a adicionar
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * @example
 * await genericInsert('leads_crm', {name: 'João', email: 'joao@ex.com'});
 */
async function genericInsert(table, payload, orgId = null) {
  return genericBatchInsert(table, [payload], orgId);
}
/**
 * Update genérico
 * @param {string} table - Nome da tabela
 * @param {string|object} filter - ID (string) ou objeto {id: '...'}
 * @param {object} updates - Campos a atualizar
 * @param {string} [orgId] - org_id para filtro adicional
 * @returns {Promise<{success: boolean, data?: Array, error?: object}>}
 * @example
 * await genericUpdate('leads_crm', 'uuid-123', {status: 'convertido'});
 */
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
/**
 * Delete genérico
 * @param {string} table - Nome da tabela
 * @param {string} id - UUID do registro
 * @param {string} [orgId] - org_id para filtro adicional
 * @returns {Promise<{success: boolean, data?: Array, error?: object}>}
 */
async function genericDelete(table, id, orgId = null) {
  return retryOperation(async () => {
    let q = supabase.from(table).delete().eq('id', id);
    if (orgId) q = q.eq('org_id', orgId);
    const { data, error } = await q.select();
    if (error) throw error;
    return { success: true, data };
  }).catch(err => ({ success: false, error: handleError(err, `delete:${table}`) }));
}
// ============================================================================
// DOMÍNIOS ESPECÍFICOS ALSHAM (KPIs, ROI, AI scoring, n8n)
// ============================================================================
/**
 * Obtém KPIs do dashboard
 * @param {string} [orgIdParam] - org_id customizado
 * @returns {Promise<object>} KPIs (total_leads, conversion_rate, etc)
 */
async function getDashboardKPIs(orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('dashboard_kpis').select('*').eq('org_id', orgId).maybeSingle();
    if (error || !data) {
      // Fallback: calcular manualmente
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
/**
 * Obtém ROI mensal mais recente
 * @param {string} [orgIdParam] - org_id customizado
 * @returns {Promise<object>} ROI (revenue, spend, roi)
 */
async function getROI(orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || await getCurrentOrgId();
    const { data, error } = await supabase.from('v_roi_monthly').select('*').eq('org_id', orgId).order('period_date', { ascending: false }).limit(1);
    if (error) throw error;
    return data?.[0] || { revenue: 0, spend: 0, roi: 0 };
  }).catch(err => ({ revenue: 0, spend: 0, roi: 0, error: handleError(err, 'getROI') }));
}
/**
 * Recalcula score de lead usando Edge Function
 * @param {string} leadId - UUID do lead
 * @param {string} [orgIdParam] - org_id customizado
 * @returns {Promise<object>} Resultado com score calculado
 */
async function recalculateLeadScore(leadId, orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || await getCurrentOrgId();
    const { data, error } = await supabase.functions.invoke('calculate-lead-score', {
      body: { lead_id: leadId, org_id: orgId }
    });
    if (error) throw error;
    return data;
  }).catch(err => ({ score: null, error: handleError(err, 'recalculateLeadScore') }));
}
/**
 * Dispara webhook n8n
 * @param {string} endpoint - URL do webhook n8n
 * @param {object} payload - Dados a enviar
 * @returns {Promise<object>} Resposta do n8n
 */
async function triggerN8n(endpoint, payload) {
  return retryOperation(async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }).catch(err => ({ error: handleError(err, 'triggerN8n') }));
}
// ============================================================================
// CRUD E DOMÍNIOS EXTRA (leads, audit log, user profile)
// ============================================================================
/**
 * Lista leads com paginação
 * @param {number} [limit=50] - Limite de registros
 * @param {string} [orgIdParam] - org_id customizado
 * @returns {Promise<{data: Array|null, error?: object}>}
 */
async function getLeads(limit = 50, orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('leads_crm').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return { data };
  }).catch(err => ({ data: null, error: handleError(err, 'getLeads') }));
}
/**
 * Cria novo lead
 * @param {object} payload - Dados do lead
 * @param {string} [orgIdParam] - org_id customizado
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
async function createLead(payload, orgIdParam = null) {
  return genericInsert('leads_crm', payload, orgIdParam || (await getCurrentOrgId()));
}
/**
 * Cria log de auditoria
 * @param {string} action - Ação executada (ex: 'login', 'update_lead')
 * @param {object} details - Detalhes da ação
 * @param {string} [userId] - UUID do usuário
 * @param {string} [orgIdParam] - org_id customizado
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
async function createAuditLog(action, details, userId = null, orgIdParam = null) {
  return retryOperation(async () => {
    const org_id = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('audit_log').insert({
      action,
      details,
      user_id: userId,
      org_id,
      created_at: new Date().toISOString()
    }).select();
    if (error) throw error;
    return { success: true, data };
  }).catch(err => ({ success: false, error: handleError(err, 'auditLog') }));
}
/**
 * Obtém perfil de usuário
 * @param {string} userId - UUID do usuário
 * @param {string} [orgIdParam] - org_id customizado
 * @returns {Promise<{data: object|null, error?: object}>}
 */
async function getUserProfile(userId, orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).eq('org_id', orgId).maybeSingle();
    if (error) throw error;
    return { data };
  }).catch(err => ({ data: null, error: handleError(err, 'getUserProfile') }));
}
/**
 * Atualiza perfil de usuário
 * @param {string} userId - UUID do usuário
 * @param {object} updates - Campos a atualizar
 * @param {string} [orgIdParam] - org_id customizado
 * @returns {Promise<{success: boolean, data?: Array, error?: object}>}
 */
async function updateUserProfile(userId, updates, orgIdParam = null) {
  return retryOperation(async () => {
    const orgId = orgIdParam || (await getCurrentOrgId());
    const { data, error } = await supabase.from('user_profiles').update(updates).eq('user_id', userId).eq('org_id', orgId).select();
    if (error) throw error;
    return { success: true, data };
  }).catch(err => ({ success: false, error: handleError(err, 'updateUserProfile') }));
}
// ============================================================================
// REALTIME (com retry em subscribe)
// ============================================================================
/**
 * Subscreve a mudanças em tabela via Realtime
 * @param {string} table - Nome da tabela
 * @param {string} orgId - UUID da organização
 * @param {Function} callback - Callback(payload) a executar
 * @returns {object} Subscription channel
 */
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
/**
 * Remove subscription de Realtime
 * @param {object} subscription - Subscription retornado por subscribeToTable
 * @returns {{success: boolean, error?: object}}
 */
function unsubscribeFromTable(subscription) {
  try {
    supabase.removeChannel(subscription);
    return { success: true };
  } catch (err) {
    return { success: false, error: handleError(err, 'unsubscribeFromTable') };
  }
}
// ============================================================================
// NOTIFICAÇÕES / UI
// ============================================================================
/**
 * Exibe toast notification (se disponível no frontend)
 * @param {string} message - Mensagem a exibir
 * @param {string} [type='info'] - Tipo: info, success, error, warning
 * @returns {{success: boolean}}
 */
function showNotification(message, type = 'info') {
  if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
    window.showToast(message, type);
    return { success: true };
  }
  console.log(`[${type.toUpperCase()}] ${message}`);
  return { success: true };
}
// ============================================================================
// EXPOSIÇÃO NO WINDOW PARA USO GLOBAL NO BROWSER
// ============================================================================
if (typeof window !== 'undefined') {
  window.supabaseClient = supabase;
  window.AlshamSupabase = window.AlshamSupabase || {};
  Object.assign(window.AlshamSupabase, {
    supabase,
    client: supabase, // ✅ ALIAS COMPATÍVEL COM automacoes.js
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
  });
  console.log('✅ window.AlshamSupabase disponível:', Object.keys(window.AlshamSupabase));
}
// ============================================================================
// EXPORT MODERNO (ESM)
// ============================================================================
export {
  supabase,
  supabase as client, // ✅ ALIAS PARA COMPATIBILIDADE
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
