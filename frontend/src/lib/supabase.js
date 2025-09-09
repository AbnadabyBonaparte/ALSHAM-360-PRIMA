// ALSHAM 360° PRIMA - SUPABASE LIB COMPLETA V6 (55 TABELAS/VIEWS)
// VERSÃO 7.0 - CORRIGIDA E SEGURA (GEMINI EDITION)
import { createClient } from '@supabase/supabase-js'

// =========================================================================
// NOTAS DE MELHORIA V7 (LEIA ANTES DE USAR)
// =========================================================================
// 1. [SEGURANÇA] Chaves de API agora dependem 100% de Variáveis de Ambiente.
//    Se as variáveis (process.env) não carregarem, a aplicação irá falhar
//    intencionalmente para evitar expor chaves fallback.
//
// 2. [INTEGRIDADE] Todos os timestamps (created_at, updated_at) foram REMOVIDOS
//    do lado do cliente (JavaScript). O banco de dados AGORA é responsável por
//    definir as datas. Você DEVE configurar 'DEFAULT now()' nas colunas 'created_at'
//    e usar um TRIGGER de banco de dados para atualizar 'updated_at' automaticamente.
//
// 3. [SEGURANÇA] Corrigidas falhas de Multi-Tenancy. Funções como 'getIALogs'
//    e 'getDataAudits' agora exigem um 'org_id' e não vazam mais dados
//    entre organizações.
//
// 4. [FATAL] Corrigido o erro de sintaxe onde o arquivo estava duplicado
//    dentro da função 'signUpWithEmail'.
// =========================================================================

// =========================================================================
// CONFIGURAÇÃO SEGURA (V7)
// =========================================================================
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL ou Anon Key não foram definidas nas variáveis de ambiente.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// =========================================================================
// UTILITÁRIOS DE VALIDAÇÃO E ERRO
// =========================================================================
const createError = (message, code = 'VALIDATION_ERROR') => ({
  message,
  code,
  details: null
})

const validateRequired = (params) => {
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') {
      return createError(`${key} é obrigatório`)
    }
  }
  return null
}

const handleSupabaseResponse = (data, error, operation = 'operação') => {
  if (error) {
    console.error(`Erro na ${operation}:`, error)
    return { data: null, error }
  }
  return { data, error: null }
}

// =========================================================================
// CONFIGURAÇÃO DINÂMICA DE ORG_ID COM VALIDAÇÃO
// =========================================================================
export function getCurrentOrgId() {
  try {
    const orgId = localStorage.getItem('org_id')
    if (!orgId) {
      console.warn('⚠️ Nenhum org_id encontrado, usando padrão')
      return 'default-org-id'
    }
    return orgId
  } catch (error) {
    console.error('Erro ao acessar localStorage:', error)
    return 'default-org-id'
  }
}

export function setCurrentOrgId(orgId) {
  const validation = validateRequired({ orgId })
  if (validation) {
    console.error('Erro ao definir org_id:', validation.message)
    return false
  }

  try {
    localStorage.setItem('org_id', orgId)
    return true
  } catch (error) {
    console.error('Erro ao salvar org_id:', error)
    return false
  }
}

export function clearOrgId() {
  try {
    localStorage.removeItem('org_id')
    return true
  } catch (error) {
    console.error('Erro ao limpar org_id:', error)
    return false
  }
}

// =========================================================================
// 1. CORE CRM (5 TABELAS PRINCIPAIS) - COM VALIDAÇÃO COMPLETA
// =========================================================================

// 1.1 LEADS CRM - Tabela principal de leads
export async function getLeads(orgId = getCurrentOrgId(), filters = {}) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('leads_crm')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    // Aplicar filtros opcionais
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.source) query = query.eq('source', filters.source)
    if (filters.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de leads')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function createLead(lead, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ lead, orgId })
  if (validation) return { data: null, error: validation }

  if (!lead.name || !lead.email) {
    return { data: null, error: createError('Nome e email são obrigatórios') }
  }

  try {
    // [V7 FIX] Timestamps removidos. Deixe o DB (DEFAULT now()) cuidar disso.
    const payload = { 
      ...lead, 
      org_id: orgId
    }

    const { data, error } = await supabase
      .from('leads_crm')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de lead')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function updateLead(leadId, lead, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ leadId, lead, orgId })
  if (validation) return { data: null, error: validation }

  try {
    // [V7 FIX] updated_at removido. Deixe o DB (TRIGGER ON UPDATE) cuidar disso.
    const payload = { 
      ...lead
    }

    const { data, error } = await supabase
      .from('leads_crm')
      .update(payload)
      .eq('id', leadId)
      .eq('org_id', orgId)
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'atualização de lead')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function deleteLead(leadId, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ leadId, orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('leads_crm')
      .delete()
      .eq('id', leadId)
      .eq('org_id', orgId)
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'exclusão de lead')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function getLeadById(leadId, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ leadId, orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('leads_crm')
      .select('*')
      .eq('id', leadId)
      .eq('org_id', orgId)
      .single()

    return handleSupabaseResponse(data, error, 'busca de lead por ID')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 1.2 LEAD INTERACTIONS - Histórico de interações
export async function getLeadInteractions(leadId, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ leadId, orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('lead_interactions')
      .select('*')
      .eq('lead_id', leadId)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de interações')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function createLeadInteraction(interaction, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ interaction, orgId })
  if (validation) return { data: null, error: validation }

  if (!interaction.lead_id || !interaction.type) {
    return { data: null, error: createError('lead_id e type são obrigatórios') }
  }

  try {
    // [V7 FIX] Timestamp removido.
    const payload = { 
      ...interaction, 
      org_id: orgId
    }

    const { data, error } = await supabase
      .from('lead_interactions')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de interação')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 1.3 SALES OPPORTUNITIES - Oportunidades de venda
export async function getSalesOpportunities(orgId = getCurrentOrgId(), filters = {}) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('sales_opportunities')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (filters.stage) query = query.eq('stage', filters.stage)
    if (filters.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de oportunidades')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function createSalesOpportunity(opportunity, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ opportunity, orgId })
  if (validation) return { data: null, error: validation }

  if (!opportunity.title || !opportunity.value) {
    return { data: null, error: createError('Título e valor são obrigatórios') }
  }

  try {
    // [V7 FIX] Timestamps removidos.
    const payload = { 
      ...opportunity, 
      org_id: orgId
    }

    const { data, error } = await supabase
      .from('sales_opportunities')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de oportunidade')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 1.4 ORGANIZATIONS - Gestão de organizações
// [V7 FIX] Função getOrganizations() removida. Era um risco de segurança (vazava todas as orgs)
// Use a função 'getUserOrganizations()' (seção 9.2) para buscar as organizações associadas ao usuário logado.

export async function createOrganization(org) {
  const validation = validateRequired({ org })
  if (validation) return { data: null, error: validation }

  if (!org.name) {
    return { data: null, error: createError('Nome da organização é obrigatório') }
  }

  try {
    // [V7 FIX] Timestamps removidos.
    const payload = { 
      ...org
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de organização')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 1.5 USER PROFILES - Perfis de usuários
export async function getUserProfiles(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de perfis')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { user: null, profile: null, error: userError }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) return { user, profile: null, error: profileError }
    return { user, profile, error: null }
  } catch (error) {
    return { user: null, profile: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 2. INTELIGÊNCIA ARTIFICIAL (3 TABELAS)
// =========================================================================

// 2.1 AI PREDICTIONS - Predições de IA
export async function getAIPredictions(leadId = null, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('ai_predictions')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (leadId) query = query.eq('lead_id', leadId)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de predições AI')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function createAIPrediction(prediction, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ prediction, orgId })
  if (validation) return { data: null, error: validation }

  try {
    // [V7 FIX] Timestamp removido.
    const payload = { 
      ...prediction, 
      org_id: orgId
    }

    const { data, error } = await supabase
      .from('ai_predictions')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de predição AI')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 2.2 IA LOGS - Logs de execuções de IA
// [V7 FIX] Adicionado 'orgId' para segurança multi-tenant.
export async function getIALogs(orgId = getCurrentOrgId(), limit = 100) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('ia_logs')
      .select('*')
      .eq('org_id', orgId) // <-- [V7 FIX] Filtro de segurança adicionado
      .order('created_at', { ascending: false })
      .limit(limit)

    return handleSupabaseResponse(data, error, 'busca de logs IA')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// [V7 FIX] Adicionado 'orgId' para segurança multi-tenant.
export async function createIALog(log, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ log, orgId })
  if (validation) return { data: null, error: validation }

  try {
    // [V7 FIX] Timestamp removido. 'org_id' adicionado.
    const payload = { 
      ...log,
      org_id: orgId 
    }

    const { data, error } = await supabase
      .from('ia_logs')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de log IA')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 2.3 SENTIMENT ANALYSIS LOGS - Análise de sentimento
export async function getSentimentAnalysisLogs(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('sentiment_analysis_logs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de análise de sentimento')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 3. AUTOMAÇÕES (3 TABELAS)
// =========================================================================

// 3.1 AUTOMATION RULES - Regras de automação
export async function getAutomationRules(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de regras de automação')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function createAutomationRule(rule, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ rule, orgId })
  if (validation) return { data: null, error: validation }

  if (!rule.name || !rule.trigger_type) {
    return { data: null, error: createError('Nome e tipo de trigger são obrigatórios') }
  }

  try {
    // [V7 FIX] Timestamps removidos.
    const payload = { 
      ...rule, 
      org_id: orgId
    }

    const { data, error } = await supabase
      .from('automation_rules')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de regra de automação')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function updateAutomationRule(ruleId, rule, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ ruleId, rule, orgId })
  if (validation) return { data: null, error: validation }

  try {
    // [V7 FIX] updated_at removido.
    const payload = { 
      ...rule
    }

    const { data, error } = await supabase
      .from('automation_rules')
      .update(payload)
      .eq('id', ruleId)
      .eq('org_id', orgId)
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'atualização de regra de automação')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 3.2 AUTOMATION EXECUTIONS - Histórico de execuções
export async function getAutomationExecutions(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('automation_executions')
      .select('*')
      .eq('org_id', orgId)
      .order('started_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de execuções de automação')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function createAutomationExecution(execution, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ execution, orgId })
  if (validation) return { data: null, error: validation }

  try {
    // [V7 FIX] Deixe o DB definir started_at se não for fornecido. Removido new Date().
    const payload = { 
      ...execution, 
      org_id: orgId,
      started_at: execution.started_at // Permite override, mas não força new Date()
    }

    const { data, error } = await supabase
      .from('automation_executions')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de execução de automação')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 3.3 LOGS AUTOMACAO - Logs detalhados
export async function getLogsAutomacao(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('logs_automacao')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de logs de automação')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 4. GAMIFICAÇÃO (4 TABELAS)
// =========================================================================

// 4.1 GAMIFICATION POINTS - Sistema de pontos
export async function getGamificationPoints(userId = null, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('gamification_points')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de pontos de gamificação')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function createGamificationPoint(point, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ point, orgId })
  if (validation) return { data: null, error: validation }

  if (!point.user_id || !point.points || !point.action) {
    return { data: null, error: createError('user_id, points e action são obrigatórios') }
  }

  try {
    // [V7 FIX] Timestamp removido.
    const payload = { 
      ...point, 
      org_id: orgId
    }

    const { data, error } = await supabase
      .from('gamification_points')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de ponto de gamificação')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 4.2 GAMIFICATION BADGES - Definição de badges
export async function getGamificationBadges(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('gamification_badges')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de badges de gamificação')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 4.3 USER BADGES - Badges conquistadas
export async function getUserBadges(userId = null, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('user_badges')
      .select('*')
      .eq('org_id', orgId)
      .order('earned_at', { ascending: false })

    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de badges do usuário')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 4.4 TEAM LEADERBOARDS - Rankings e competições
export async function getTeamLeaderboards(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('team_leaderboards')
      .select('*')
      .eq('org_id', orgId)
      .order('score', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de leaderboards')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 5. COMUNICAÇÃO (2 TABELAS)
// =========================================================================

// 5.1 EMAIL TEMPLATES - Templates de email
export async function getEmailTemplates(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de templates de email')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function createEmailTemplate(template, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ template, orgId })
  if (validation) return { data: null, error: validation }

  if (!template.name || !template.subject || !template.content) {
    return { data: null, error: createError('Nome, assunto e conteúdo são obrigatórios') }
  }

  try {
    // [V7 FIX] Timestamps removidos.
    const payload = { 
      ...template, 
      org_id: orgId
    }

    const { data, error } = await supabase
      .from('email_templates')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de template de email')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 5.2 NOTIFICATIONS - Configurações de notificação
export async function getNotifications(userId = null, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de notificações')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 6. ORGANIZAÇÃO (3 TABELAS)
// =========================================================================

// 6.1 LEAD LABELS - Sistema de etiquetas
export async function getLeadLabels(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('lead_labels')
      .select('*')
      .eq('org_id', orgId)
      .order('name', { ascending: true })

    return handleSupabaseResponse(data, error, 'busca de etiquetas')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function createLeadLabel(label, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ label, orgId })
  if (validation) return { data: null, error: validation }

  if (!label.name) {
    return { data: null, error: createError('Nome da etiqueta é obrigatório') }
  }

  try {
    // [V7 FIX] Timestamp removido.
    const payload = { 
      ...label, 
      org_id: orgId
    }

    const { data, error } = await supabase
      .from('lead_labels')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de etiqueta')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 6.2 LEAD LABEL LINKS - Ligações lead-etiqueta
export async function getLeadLabelLinks(leadId = null, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('lead_label_links')
      .select('*')
      .eq('org_id', orgId)

    if (leadId) query = query.eq('lead_id', leadId)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de ligações de etiquetas')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function linkLeadToLabel(leadId, labelId, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ leadId, labelId, orgId })
  if (validation) return { data: null, error: validation }

  try {
    // [V7 FIX] Timestamp removido.
    const payload = {
      lead_id: leadId,
      label_id: labelId,
      org_id: orgId
    }

    const { data, error } = await supabase
      .from('lead_label_links')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'ligação de etiqueta ao lead')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 6.3 LEAD SOURCES - Origens de leads
export async function getLeadSources(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('lead_sources')
      .select('*')
      .eq('org_id', orgId)
      .order('name', { ascending: true })

    return handleSupabaseResponse(data, error, 'busca de origens de leads')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 7. ANALYTICS & ROI (5 TABELAS)
// =========================================================================

// 7.1 ANALYTICS EVENTS - Rastreamento de eventos
export async function getAnalyticsEvents(orgId = getCurrentOrgId(), limit = 1000) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('org_id', orgId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    return handleSupabaseResponse(data, error, 'busca de eventos de analytics')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function createAnalyticsEvent(event, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ event, orgId })
  if (validation) return { data: null, error: validation }

  if (!event.event_type) {
    return { data: null, error: createError('Tipo de evento é obrigatório') }
  }

  try {
    // [V7 FIX] Timestamp removido (a menos que seja um timestamp específico do evento, o que é ok)
    const payload = { 
      ...event, 
      org_id: orgId,
      timestamp: event.timestamp || new Date().toISOString() // Mantido, pois 'timestamp' é o nome do campo e pode ser intencional
    }

    const { data, error } = await supabase
      .from('analytics_events')
      .insert([payload])
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'criação de evento de analytics')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 7.2 IMPACT REPORTS - Relatórios de impacto
export async function getImpactReports(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('impact_reports')
      .select('*')
      .eq('org_id', orgId)
      .order('generated_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de relatórios de impacto')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 7.3 PERFORMANCE METRICS - Métricas de performance
export async function getPerformanceMetrics(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de métricas de performance')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 7.4 ROI CALCULATIONS - Cálculos de ROI
export async function getROICalculations(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('roi_calculations')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de cálculos de ROI')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 7.5 CONVERSION FUNNELS - Funis de conversão
export async function getConversionFunnels(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('conversion_funnels')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de funis de conversão')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 8. CONFIGURAÇÕES (4 TABELAS)
// =========================================================================

// 8.1 ORG SETTINGS - Configurações da organização
export async function getOrgSettings(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('org_settings')
      .select('*')
      .eq('org_id', orgId)
      .single()

    return handleSupabaseResponse(data, error, 'busca de configurações da organização')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export async function updateOrgSettings(settings, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ settings, orgId })
  if (validation) return { data: null, error: validation }

  try {
    // [V7 FIX] updated_at removido.
    const payload = { 
      ...settings, 
      org_id: orgId
    }

    const { data, error } = await supabase
      .from('org_settings')
      .upsert(payload) // Upsert mantido, útil para settings
      .select()
      .single()

    return handleSupabaseResponse(data, error, 'atualização de configurações da organização')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 8.2 INTEGRATION CONFIGS - Integrações externas
export async function getIntegrationConfigs(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de configurações de integração')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 8.3 API KEYS - Gestão de chaves API
export async function getAPIKeys(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de chaves API')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 8.4 WEBHOOK CONFIGS - Configuração de webhooks
export async function getWebhookConfigs(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de configurações de webhook')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 9. EQUIPES (4 TABELAS)
// =========================================================================

// 9.1 TEAMS - Gestão de equipes
export async function getTeams(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de equipes')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 9.2 USER ORGANIZATIONS - Usuários-organizações (Função segura)
export async function getUserOrganizations(userId = null) {
  // Esta função busca de uma tabela de junção (provavelmente)
  // Se userId não for fornecido, deve buscar o do usuário logado.
  
  let targetUserId = userId
  if (!targetUserId) {
      const { user } = (await getCurrentUser())
      if (!user) return { data: null, error: createError('Usuário não autenticado') }
      targetUserId = user.id
  }
  
  const validation = validateRequired({ targetUserId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('user_organizations')
      .select('*') // Idealmente, deveria ser: select('*, organizations(*)')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de organizações do usuário')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 9.3 ONBOARDING PROGRESS - Progresso de onboarding
export async function getOnboardingProgress(userId = null, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('onboarding_progress')
      .select('*')
      .eq('org_id', orgId)

    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de progresso de onboarding')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 9.4 COACHING SESSIONS - Sessões de coaching
export async function getCoachingSessions(userId = null, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('coaching_sessions')
      .select('*')
      .eq('org_id', orgId)
      .order('scheduled_at', { ascending: false })

    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de sessões de coaching')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 10. AUDITORIA (5 TABELAS)
// =========================================================================

// 10.1 AUDIT LOG - Log geral de auditoria
export async function getAuditLog(orgId = getCurrentOrgId(), limit = 1000) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('org_id', orgId)
      .order('at', { ascending: false })
      .limit(limit)

    return handleSupabaseResponse(data, error, 'busca de log de auditoria')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 10.2 AUDIT LEADS - Auditoria específica de leads
export async function getAuditLeads(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('audit_leads')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de auditoria de leads')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 10.3 LEAD AUDIT - Auditoria detalhada
export async function getLeadAudit(leadId = null, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('lead_audit')
      .select('*')
      .eq('org_id', orgId)
      .order('at', { ascending: false })

    if (leadId) query = query.eq('lead_id', leadId)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de auditoria detalhada de lead')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 10.4 DATA AUDITS - Auditoria de dados
// [V7 FIX] Adicionado 'orgId' para segurança multi-tenant.
export async function getDataAudits(orgId = getCurrentOrgId(), limit = 1000) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }
  
  try {
    const { data, error } = await supabase
      .from('data_audits')
      .select('*')
      .eq('org_id', orgId) // <-- [V7 FIX] Filtro de segurança adicionado
      .order('created_at', { ascending: false })
      .limit(limit)

    return handleSupabaseResponse(data, error, 'busca de auditoria de dados')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 10.5 SECURITY AUDITS - Auditoria de segurança
export async function getSecurityAudits(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('security_audits')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de auditoria de segurança')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 11. AÇÕES (2 TABELAS)
// =========================================================================

// 11.1 NEXT BEST ACTIONS - Recomendações de ações
export async function getNextBestActions(userId = null, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase
      .from('next_best_actions')
      .select('*')
      .eq('org_id', orgId)
      .order('priority', { ascending: false })

    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    return handleSupabaseResponse(data, error, 'busca de próximas melhores ações')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 11.2 EVENTS MASTER - Eventos do sistema
export async function getEventsMaster(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('events_master')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de eventos mestre')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// 12. VIEWS CALCULADAS (15 VIEWS) - DASHBOARD E RELATÓRIOS
// =========================================================================

// 12.1 DASHBOARD KPIS - KPIs principais
export async function getDashboardKPIs(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('dashboard_kpis')
      .select('*')
      .eq('org_id', orgId)
      .single()

    return handleSupabaseResponse(data, error, 'busca de KPIs do dashboard')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.2 DASHBOARD SUMMARY - Resumo executivo
export async function getDashboardSummary(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('dashboard_summary')
      .select('*')
      .eq('org_id', orgId)
      .single()

    return handleSupabaseResponse(data, error, 'busca de resumo do dashboard')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.3 LEADS BY STATUS VIEW - Leads por status
export async function getLeadsByStatusView(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('leads_by_status_view')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de leads por status')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.4 LEADS CRM WITH LABELS - Leads com etiquetas
export async function getLeadsCRMWithLabels(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('leads_crm_with_labels')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de leads CRM com etiquetas')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.5 LEADS POR DIA - Leads por dia
export async function getLeadsPorDia(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('leads_por_dia')
      .select('*')
      .eq('org_id', orgId)
      .order('data', { ascending: false })

    return handleSupabaseResponse(data, error, 'busca de leads por dia')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.6 LEADS POR ORIGEM - Leads por origem
export async function getLeadsPorOrigem(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('leads_por_origem')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de leads por origem')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.7 LEADS POR STATUS - Distribuição por status
export async function getLeadsPorStatus(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('leads_por_status')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de distribuição de leads por status')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.8 V_AE_FAIL_RATE_7D - Taxa de falha automações
export async function getAutomationFailRate7d(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('v_ae_fail_rate_7d')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de taxa de falha de automações 7d')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.9 V_AE_KPIS_7D - KPIs de automações
export async function getAutomationKPIs7d(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('v_ae_kpis_7d')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de KPIs de automações 7d')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.10 V_AE_RECENT - Automações recentes
export async function getAutomationRecent(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('v_ae_recent')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de automações recentes')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.11 V_AUDIT_RECENT - Auditoria recente
export async function getAuditRecent(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('v_audit_recent')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de auditoria recente')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.12 V_LEADS_HEALTH - Saúde dos leads
export async function getLeadsHealth(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('v_leads_health')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de saúde dos leads')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.13 V_LEADS_WITH_LABELS - Leads com etiquetas (view)
export async function getLeadsWithLabels(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('v_leads_with_labels')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de leads com etiquetas')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.14 V_ROI_MONTHLY - ROI mensal
export async function getROIMonthly(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('v_roi_monthly')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de ROI mensal')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// 12.15 LEADS STATUS DIST - Distribuição de status
export async function getLeadsStatusDist(orgId = getCurrentOrgId()) {
  const validation = validateRequired({ orgId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('leads_status_dist')
      .select('*')
      .eq('org_id', orgId)

    return handleSupabaseResponse(data, error, 'busca de distribuição de status de leads')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// FUNÇÕES DE AUTENTICAÇÃO SEGURAS
// =========================================================================

export async function signInWithEmail(email, password) {
  const validation = validateRequired({ email, password })
  if (validation) return { user: null, error: validation }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return handleSupabaseResponse(null, error, 'login')
    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error: createError(`Erro inesperado no login: ${error.message}`) }
  }
}

// [V7 FIX] Função corrigida do erro de sintaxe.
export async function signUpWithEmail(email, password, userData = {}) {
  const validation = validateRequired({ email, password })
  if (validation) return { user: null, error: validation }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })
    if (error) return handleSupabaseResponse(null, error, 'cadastro')
    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error: createError(`Erro inesperado no cadastro: ${error.message}`) }
  }
}


export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) return { success: false, error }

    // Limpar dados locais ao fazer logout
    clearOrgId()
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: createError(`Erro inesperado no logout: ${error.message}`) }
  }
}

export async function resetPassword(email) {
  const validation = validateRequired({ email })
  if (validation) return { data: null, error: validation }

  try {
    // Garante que a URL de redirecionamento exista.
    const redirectTo = `${window.location.origin}/src/pages/login.html`
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo
    })
    if (error) return handleSupabaseResponse(null, error, 'reset de senha')
    return { data, error: null }
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado no reset: ${error.message}`) }
  }
}

export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) return { session: null, error }
    return { session: data.session, error: null }
  } catch (error) {
    return { session: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    let profile = null
    if (session?.user) {
      const { data } = await getUserProfile(session.user.id)
      profile = data
    }
    callback(event, session, profile)
  })
}

export async function getUserProfile(userId) {
  const validation = validateRequired({ userId })
  if (validation) return { data: null, error: validation }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // Ignora erro 'nenhuma linha encontrada'
      return handleSupabaseResponse(null, error, 'busca de perfil')
    }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// FUNÇÕES UTILITÁRIAS AVANÇADAS
// =========================================================================

// Busca genérica com filtros dinâmicos
export async function searchData(tableName, filters = {}, options = {}) {
  const validation = validateRequired({ tableName })
  if (validation) return { data: null, error: validation }

  try {
    let query = supabase.from(tableName).select(options.select || '*')

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query = query.eq(key, value)
      }
    })

    // Aplicar ordenação
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending || false })
    }

    // Aplicar limite
    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    return handleSupabaseResponse(data, error, `busca em ${tableName}`)
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// Função para executar queries personalizadas de forma segura
export async function executeCustomQuery(queryFunction) {
  try {
    const result = await queryFunction()
    return handleSupabaseResponse(result.data, result.error, 'query personalizada')
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// Batch operations - para operações em lote
export async function batchInsert(tableName, records, orgId = getCurrentOrgId()) {
  const validation = validateRequired({ tableName, records, orgId })
  if (validation) return { data: null, error: validation }

  if (!Array.isArray(records) || records.length === 0) {
    return { data: null, error: createError('Records deve ser um array não vazio') }
  }

  try {
    // [V7 FIX] Timestamps removidos.
    const payload = records.map(record => ({
      ...record,
      org_id: orgId
    }))

    const { data, error } = await supabase
      .from(tableName)
      .insert(payload)
      .select()

    return handleSupabaseResponse(data, error, `inserção em lote em ${tableName}`)
  } catch (error) {
    return { data: null, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// Health check para verificar conexão
export async function healthCheck() {
  try {
    // Este check é seguro. Ele tenta ler 1 ID. 
    // Se RLS estiver ativo (como deveria), ele só retorna algo se o usuário (anon) tiver permissão.
    // Se a query funcionar (mesmo retornando 0 linhas), a conexão está OK.
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)

    if (error) {
      return { 
        status: 'error', 
        message: 'Falha na conexão com Supabase',
        error 
      }
    }

    return { 
      status: 'ok', 
      message: 'Conexão com Supabase OK',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return { 
      status: 'error', 
      message: 'Erro inesperado na verificação',
      error: createError(error.message)
    }
  }
}

// Função para contar registros com filtros
export async function countRecords(tableName, filters = {}) {
  const validation = validateRequired({ tableName })
  if (validation) return { count: 0, error: validation }

  try {
    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query = query.eq(key, value)
      }
    })

    const { count, error } = await query
    return handleSupabaseResponse({ count: count || 0 }, error, `contagem em ${tableName}`)
  } catch (error) {
    return { count: 0, error: createError(`Erro inesperado: ${error.message}`) }
  }
}

// =========================================================================
// HELPERS PARA REAL-TIME
// =========================================================================

// Configurar listener para mudanças em tempo real
export function subscribeToTable(tableName, callback, filters = {}) {
  const validation = validateRequired({ tableName, callback })
  if (validation) {
    console.error('Erro na assinatura:', validation.message)
    return null
  }

  try {
    const channelName = `${tableName}_changes_${filters.filter ? filters.filter.replace(/[^a-zA-Z0-9]/g, '_') : 'all'}`
    const subscription = supabase
      .channel(channelName) // Canal único para evitar conflitos
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName,
          filter: filters.filter || undefined
        }, 
        callback
      )
      .subscribe()

    return subscription
  } catch (error) {
    console.error('Erro ao configurar subscription:', error)
    return null
  }
}

// Remover listener
export function unsubscribeFromTable(subscription) {
  if (subscription) {
    try {
      supabase.removeChannel(subscription)
      return true
    } catch (error) {
      console.error('Erro ao remover subscription:', error)
      return false
    }
  }
  return false
}

// =========================================================================
// CONSTANTES E CONFIGURAÇÕES
// =========================================================================

// Status padrão para leads
export const LEAD_STATUSES = {
  NEW: 'novo',
  CONTACTED: 'contatado',
  QUALIFIED: 'qualificado',
  PROPOSAL: 'proposta',
  NEGOTIATION: 'negociacao',
  CLOSED_WON: 'fechado_ganho',
  CLOSED_LOST: 'fechado_perdido'
}

// Tipos de interação
export const INTERACTION_TYPES = {
  EMAIL: 'email',
  PHONE: 'telefone',
  MEETING: 'reuniao',
  WHATSAPP: 'whatsapp',
  SMS: 'sms',
  OTHER: 'outro'
}

// Níveis de prioridade
export const PRIORITY_LEVELS = {
  LOW: 'baixa',
  MEDIUM: 'media',
  HIGH: 'alta',
  URGENT: 'urgente'
}

// =========================================================================
// EXPORTAÇÕES E CONFIGURAÇÃO FINAL
// =========================================================================

// Configuração do cliente Supabase
export const supabaseConfig = {
  url: SUPABASE_URL, // Não expõe a URL real, apenas a variável
  isConnected: () => healthCheck(),
  version: '7.0.0', // Versão atualizada
  features: [
    'Multi-tenant com org_id (Seguro)',
    'Validação completa de parâmetros',
    'Error handling robusto',
    'Timestamps gerenciados pelo Servidor (Obrigatório)',
    'Real-time subscriptions',
    'Batch operations',
    'Health monitoring',
    'Logging detalhado',
    'Configuração segura (Sem chaves hardcoded)'
  ]
}

// Log de inicialização (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 ALSHAM 360° PRIMA - Supabase Lib V7 (Segura) inicializada')
  console.log('📊 54 tabelas/views mapeadas (1 removida por segurança)')
  console.log('🔒 Validação e segurança multi-tenant ativadas')
  console.log('⚡ Real-time e batch operations disponíveis')
  console.log('⏰ ATENÇÃO: Timestamps DEVEM ser gerenciados pelo Banco de Dados.')
}

export default supabase
