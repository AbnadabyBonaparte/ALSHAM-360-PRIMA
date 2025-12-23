import { supabase } from '../client'
import type { UserProfile, UserProfileInsert, UserProfileUpdate } from '../types'

// Queries para User Profiles
export const usersQueries = {
  // Buscar todos os usuários da organização atual
  async getAll(filters?: {
    role?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (filters?.role) {
      query = query.eq('role', filters.role)
    }

    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%`)
    }

    // Ordenação
    query = query.order('created_at', { ascending: false })

    // Paginação
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return { data: [], error, count: 0 }
    }

    return { data: data || [], error: null, count: count || 0 }
  },

  // Buscar perfil do usuário por ID
  async getById(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Buscar perfil por org_id e user_id
  async getByOrgAndUser(orgId: string, userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile by org:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Criar novo perfil de usuário
  async create(profile: UserProfileInsert) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Atualizar perfil do usuário
  async update(userId: string, orgId: string, updates: UserProfileUpdate) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Buscar usuários por role
  async getByRole(role: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users by role:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Buscar estatísticas de usuários
  async getStats() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role, count(*)')
      .select()

    if (error) {
      console.error('Error fetching user stats:', error)
      return { data: {}, error }
    }

    // Agrupar por role
    const stats = data.reduce((acc: Record<string, number>, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {})

    return { data: stats, error: null }
  }
}






