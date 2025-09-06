// ALSHAM 360° PRIMA - Configuração Supabase
// Conexão segura e robusta com banco, cache e autenticação

import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTIzNjIsImV4cCI6MjA3MDQ4ODM2Mn0.CxKiXMiYLz2b-yux0JI-A37zu4Q_nxQUnRf_MzKw-VI'

// Cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: { schema: 'public' },
  global: {
    headers: { 'X-Client-Info': 'alsham-360-prima' }
  }
})

export const DEFAULT_ORG_ID = 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe'

// ===== AUTENTICAÇÃO =====

/** Login com email/senha */
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  const user = data.user
  if (user) {
    await supabase.rpc('bootstrap_profile_and_membership', {
      p_full_name: user.user_metadata?.full_name || '',
      p_org: DEFAULT_ORG_ID
    }).catch(() => {})
  }
  const profile = user ? await getUserProfile(user.id) : null
  return { user, profile, session: data.session }
}

/** Registro com email/senha */
export async function signUpWithEmail(userData) {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        full_name: userData.fullName || '',
        org_id: userData.orgId || DEFAULT_ORG_ID
      }
    }
  })
  if (error) throw error

  if (data.user) {
    await createUserProfile(data.user.id, {
      full_name: userData.fullName || '',
      org_id: userData.orgId || DEFAULT_ORG_ID,
      role: 'user'
    })
  }
  return data
}

/** Login OAuth Google */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  })
  if (error) throw error
  return data
}

/** Login OAuth Microsoft */
export async function signInWithMicrosoft() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      scopes: 'email profile'
    }
  })
  if (error) throw error
  return data
}

/** Logout */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  localStorage.removeItem('alsham_user_profile')
  localStorage.removeItem('alsham_org_id')
  return true
}

/** Usuário atual */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  const profile = user ? await getUserProfile(user.id) : null
  return { user, profile }
}

/** Sessão atual */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// ===== PERFIL =====

/** Buscar perfil do usuário */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') throw error

    if (data) {
      localStorage.setItem('alsham_user_profile', JSON.stringify(data))
      if (data.org_id) localStorage.setItem('alsham_org_id', data.org_id)
    }
    return data || null
  } catch (err) {
    console.error('Erro ao buscar perfil:', err?.message || err)
    return null
  }
}

/** Criar perfil do usuário (via função bootstrap) */
export async function createUserProfile(userId, profileData) {
  const { error: bootstrapError } = await supabase.rpc('bootstrap_profile_and_membership', {
    p_full_name: profileData.full_name || '',
    p_org: profileData.org_id || DEFAULT_ORG_ID
  })
  if (bootstrapError) console.warn('Bootstrap retornou aviso:', bootstrapError)

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

/** Atualizar perfil */
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates })
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  if (data) localStorage.setItem('alsham_user_profile', JSON.stringify(data))
  return data
}

// ===== ORGANIZAÇÃO =====

/** Dados da organização */
export async function getOrganization(orgId = DEFAULT_ORG_ID) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()
  if (error) throw error
  return data
}

// ===== LISTENERS DE AUTENTICAÇÃO =====

/** Escutar mudanças de autenticação */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session?.user?.email)
    let profile = null
    if (session?.user) profile = await getUserProfile(session.user.id)
    callback(event, session, profile)
  })
}

// ===== UTILITÁRIOS =====

/** Verifica se usuário está autenticado */
export async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session?.user
}

/** Pega org_id do usuário atual */
export function getCurrentOrgId() {
  return localStorage.getItem('alsham_org_id') || DEFAULT_ORG_ID
}

/** Token JWT atual */
export async function getCurrentToken() {
  const session = await getCurrentSession()
  return session?.access_token || null
}

console.log('🔐 Supabase configurado - ALSHAM 360° PRIMA')

// ===== LEADS (com cache Redis fail-safe) =====

/** Buscar leads (com cache Redis) */
export async function getLeads(orgId = DEFAULT_ORG_ID) {
  try {
    const { default: redisCache } = await import('./redis.js').catch(() => ({ default: null }))
    if (redisCache) {
      const cachedLeads = await redisCache.getLeads(orgId)
      if (cachedLeads) return { data: cachedLeads, error: null, fromCache: true }
    }

    const { data, error } = await supabase
      .from('leads_crm')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
    if (error) throw error

    if (data && redisCache) await redisCache.cacheLeads(orgId, data)
    return { data, error: null, fromCache: false }
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return { data: null, error }
  }
}

/** Criar novo lead (e invalidar cache) */
export async function createLead(leadData, orgId = DEFAULT_ORG_ID) {
  try {
    const { data: userData } = await supabase.auth.getUser()
    const ownerId = userData?.user?.id
    if (!ownerId) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('leads_crm')
      .insert([{
        ...leadData,
        org_id: orgId,
        owner_id: ownerId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    if (error) throw error

    const { default: redisCache } = await import('./redis.js').catch(() => ({ default: null }))
    if (redisCache) {
      await redisCache.invalidateCache(`leads:${orgId}`)
      await redisCache.invalidateCache(`kpis:${orgId}`)
    }
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao criar lead:', error)
    return { data: null, error }
  }
}

/** Atualizar lead (e invalidar cache) */
export async function updateLead(leadId, updates, orgId = DEFAULT_ORG_ID) {
  try {
    const { data, error } = await supabase
      .from('leads_crm')
      .update({ ...updates })
      .eq('id', leadId)
      .eq('org_id', orgId)
      .select()
      .single()
    if (error) throw error

    const { default: redisCache } = await import('./redis.js').catch(() => ({ default: null }))
    if (redisCache) {
      await redisCache.invalidateCache(`leads:${orgId}`)
      await redisCache.invalidateCache(`kpis:${orgId}`)
    }
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return { data: null, error }
  }
}

/** Deletar lead (e invalidar cache) */
export async function deleteLead(leadId, orgId = DEFAULT_ORG_ID) {
  try {
    const { error } = await supabase
      .from('leads_crm')
      .delete()
      .eq('id', leadId)
      .eq('org_id', orgId)
    if (error) throw error

    const { default: redisCache } = await import('./redis.js').catch(() => ({ default: null }))
    if (redisCache) {
      await redisCache.invalidateCache(`leads:${orgId}`)
      await redisCache.invalidateCache(`kpis:${orgId}`)
    }
    return { error: null }
  } catch (error) {
    console.error('Erro ao deletar lead:', error)
    return { error }
  }
}

/** KPIs do dashboard (com cache Redis) */
export async function getDashboardKPIs(orgId = DEFAULT_ORG_ID) {
  try {
    const { default: redisCache } = await import('./redis.js').catch(() => ({ default: null }))
    if (redisCache) {
      const cached = await redisCache.getKPIs(orgId)
      if (cached) return { data: cached, error: null, fromCache: true }
    }

    const { data: leads, error } = await supabase
      .from('leads_crm')
      .select('*')
      .eq('org_id', orgId)
    if (error) throw error

    const totalLeads = leads?.length || 0
    const qualifiedLeads = leads?.filter(l => l.status === 'qualified')?.length || 0
    const convertedLeads = leads?.filter(l => l.status === 'converted')?.length || 0
    const conversionRate = totalLeads ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0
    const totalRevenue = leads?.filter(l => l.status === 'converted')?.reduce((s, l) => s + (l.value || 0), 0) || 0

    const kpis = { totalLeads, qualifiedLeads, conversionRate, totalRevenue, lastUpdated: new Date().toISOString() }

    if (redisCache) await redisCache.cacheKPIs(orgId, kpis)
    return { data: kpis, error: null, fromCache: false }
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error)
    return { data: null, error }
  }
}
