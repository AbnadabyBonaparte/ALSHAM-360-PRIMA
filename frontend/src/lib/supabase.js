// ALSHAM 360° PRIMA - Configuração Supabase
// Conexão segura com o banco de dados auditado

import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase (baseado na auditoria final)
const supabaseUrl = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTIzNjIsImV4cCI6MjA3MDQ4ODM2Mn0.CxKiXMiYLz2b-yux0JI-A37zu4Q_nxQUnRf_MzKw-VI'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'alsham-360-prima'
    }
  }
})

// Organização padrão (baseado na auditoria)
export const DEFAULT_ORG_ID = 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe'

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

/**
 * Fazer login com email e senha
 */
export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    // Buscar perfil do usuário após login
    if (data.user) {
      const profile = await getUserProfile(data.user.id)
      return { user: data.user, profile, session: data.session }
    }
    
    return data
  } catch (error) {
    console.error('Erro no login:', error.message)
    throw error
  }
}

/**
 * Fazer registro com email e senha
 */
export async function signUpWithEmail(userData) {
  try {
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
    
    // Criar perfil do usuário usando função bootstrap
    if (data.user) {
      await createUserProfile(data.user.id, {
        full_name: userData.fullName || '',
        org_id: userData.orgId || DEFAULT_ORG_ID,
        role: 'user'
      })
    }
    
    return data
  } catch (error) {
    console.error('Erro no registro:', error.message)
    throw error
  }
}

/**
 * Login com Google OAuth
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro no login com Google:', error.message)
    throw error
  }
}

/**
 * Login com Microsoft OAuth
 */
export async function signInWithMicrosoft() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: 'email profile'
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro no login com Microsoft:', error.message)
    throw error
  }
}

/**
 * Fazer logout
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Limpar dados locais
    localStorage.removeItem('alsham_user_profile')
    localStorage.removeItem('alsham_org_id')
    
    return true
  } catch (error) {
    console.error('Erro no logout:', error.message)
    throw error
  }
}

/**
 * Obter usuário atual
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    if (user) {
      const profile = await getUserProfile(user.id)
      return { user, profile }
    }
    
    return { user: null, profile: null }
  } catch (error) {
    console.error('Erro ao obter usuário:', error.message)
    return { user: null, profile: null }
  }
}

/**
 * Obter sessão atual
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Erro ao obter sessão:', error.message)
    return null
  }
}

// ===== FUNÇÕES DE PERFIL =====

/**
 * Buscar perfil do usuário
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    
    // Cache local
    if (data) {
      localStorage.setItem('alsham_user_profile', JSON.stringify(data))
      localStorage.setItem('alsham_org_id', data.org_id)
    }
    
    return data
  } catch (error) {
    console.error('Erro ao buscar perfil:', error.message)
    return null
  }
}

/**
 * Criar perfil do usuário (usando função bootstrap do programador)
 */
export async function createUserProfile(userId, profileData) {
  try {
    // Usar função bootstrap criada pelo programador
    const { error: bootstrapError } = await supabase.rpc('bootstrap_profile_and_membership', {
      p_full_name: profileData.full_name || '',
      p_org: profileData.org_id || DEFAULT_ORG_ID
    })

    if (bootstrapError) {
      console.warn('Erro no bootstrap (pode ser normal se usuário já existe):', bootstrapError)
    }

    // Buscar perfil criado para retornar
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Erro ao criar perfil:', error.message)
    throw error
  }
}

/**
 * Atualizar perfil do usuário
 */
export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    // Atualizar cache local
    if (data) {
      localStorage.setItem('alsham_user_profile', JSON.stringify(data))
    }
    
    return data
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error.message)
    throw error
  }
}

// ===== FUNÇÕES DE ORGANIZAÇÃO =====

/**
 * Obter dados da organização
 */
export async function getOrganization(orgId = DEFAULT_ORG_ID) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar organização:', error.message)
    return null
  }
}

// ===== LISTENERS DE AUTENTICAÇÃO =====

/**
 * Escutar mudanças de autenticação
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session?.user?.email)
    
    let profile = null
    if (session?.user) {
      profile = await getUserProfile(session.user.id)
    }
    
    callback(event, session, profile)
  })
}

// ===== UTILITÁRIOS =====

/**
 * Verificar se usuário está autenticado
 */
export function isAuthenticated() {
  const session = supabase.auth.getSession()
  return !!session?.user
}

/**
 * Obter org_id do usuário atual
 */
export function getCurrentOrgId() {
  const cached = localStorage.getItem('alsham_org_id')
  return cached || DEFAULT_ORG_ID
}

/**
 * Obter token JWT atual
 */
export async function getCurrentToken() {
  try {
    const session = await getCurrentSession()
    return session?.access_token || null
  } catch (error) {
    console.error('Erro ao obter token:', error.message)
    return null
  }
}

console.log('🔐 Supabase configurado - ALSHAM 360° PRIMA')


// ===== FUNÇÕES DE LEADS COM CACHE REDIS =====

/**
 * Buscar leads da organização (com cache Redis)
 */
export async function getLeads(orgId = DEFAULT_ORG_ID) {
  try {
    // Tentar buscar do cache primeiro
    const { default: redisCache } = await import('./redis.js')
    const cachedLeads = await redisCache.getLeads(orgId)
    
    if (cachedLeads) {
      console.log('✅ Leads carregados do cache Redis')
      return { data: cachedLeads, error: null, fromCache: true }
    }

    // Se não estiver no cache, buscar do Supabase
    const { data, error } = await supabase
      .from('leads_crm')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Cachear resultado para próximas consultas
    if (data) {
      await redisCache.cacheLeads(orgId, data)
      console.log('✅ Leads cacheados no Redis')
    }

    return { data, error: null, fromCache: false }
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return { data: null, error }
  }
}

/**
 * Criar novo lead (e invalidar cache)
 */
export async function createLead(leadData, orgId = DEFAULT_ORG_ID) {
  try {
    const { data, error } = await supabase
      .from('leads_crm')
      .insert([{
        ...leadData,
        org_id: orgId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    // Invalidar cache de leads para forçar atualização
    const { default: redisCache } = await import('./redis.js')
    await redisCache.invalidateCache(`leads:${orgId}`)
    await redisCache.invalidateCache(`kpis:${orgId}`)
    
    console.log('✅ Lead criado e cache invalidado')
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao criar lead:', error)
    return { data: null, error }
  }
}

/**
 * Atualizar lead (e invalidar cache)
 */
export async function updateLead(leadId, updates, orgId = DEFAULT_ORG_ID) {
  try {
    const { data, error } = await supabase
      .from('leads_crm')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    // Invalidar cache
    const { default: redisCache } = await import('./redis.js')
    await redisCache.invalidateCache(`leads:${orgId}`)
    await redisCache.invalidateCache(`kpis:${orgId}`)
    
    console.log('✅ Lead atualizado e cache invalidado')
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return { data: null, error }
  }
}

/**
 * Deletar lead (e invalidar cache)
 */
export async function deleteLead(leadId, orgId = DEFAULT_ORG_ID) {
  try {
    const { error } = await supabase
      .from('leads_crm')
      .delete()
      .eq('id', leadId)
      .eq('org_id', orgId)

    if (error) throw error

    // Invalidar cache
    const { default: redisCache } = await import('./redis.js')
    await redisCache.invalidateCache(`leads:${orgId}`)
    await redisCache.invalidateCache(`kpis:${orgId}`)
    
    console.log('✅ Lead deletado e cache invalidado')
    return { error: null }
  } catch (error) {
    console.error('Erro ao deletar lead:', error)
    return { error }
  }
}

/**
 * Buscar KPIs do dashboard (com cache Redis)
 */
export async function getDashboardKPIs(orgId = DEFAULT_ORG_ID) {
  try {
    // Tentar buscar do cache primeiro
    const { default: redisCache } = await import('./redis.js')
    const cachedKPIs = await redisCache.getKPIs(orgId)
    
    if (cachedKPIs) {
      console.log('✅ KPIs carregados do cache Redis')
      return { data: cachedKPIs, error: null, fromCache: true }
    }

    // Buscar leads para calcular KPIs
    const { data: leads, error } = await supabase
      .from('leads_crm')
      .select('*')
      .eq('org_id', orgId)

    if (error) throw error

    // Calcular KPIs
    const totalLeads = leads?.length || 0
    const qualifiedLeads = leads?.filter(lead => lead.status === 'qualified')?.length || 0
    const convertedLeads = leads?.filter(lead => lead.status === 'converted')?.length || 0
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : 0
    const totalRevenue = leads?.filter(lead => lead.status === 'converted')
      ?.reduce((sum, lead) => sum + (lead.value || 0), 0) || 0

    const kpis = {
      totalLeads,
      qualifiedLeads,
      conversionRate: parseFloat(conversionRate),
      totalRevenue,
      lastUpdated: new Date().toISOString()
    }

    // Cachear KPIs
    await redisCache.cacheKPIs(orgId, kpis)
    console.log('✅ KPIs calculados e cacheados no Redis')

    return { data: kpis, error: null, fromCache: false }
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error)
    return { data: null, error }
  }
}

