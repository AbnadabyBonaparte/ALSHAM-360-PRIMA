import { supabase } from '../client'
import type { Organization, OrganizationInsert, OrganizationUpdate } from '../types'

// Queries para Organizations
export const organizationsQueries = {
  // Buscar todas as organizações (apenas para usuários com múltiplas orgs)
  async getAll() {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching organizations:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Buscar organização por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching organization:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Buscar organização por slug
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching organization by slug:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Criar nova organização
  async create(organization: OrganizationInsert) {
    const { data, error } = await supabase
      .from('organizations')
      .insert(organization)
      .select()
      .single()

    if (error) {
      console.error('Error creating organization:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Atualizar organização
  async update(id: string, updates: OrganizationUpdate) {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating organization:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Deletar organização
  async delete(id: string) {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting organization:', error)
      return { error }
    }

    return { error: null }
  },

  // Buscar organizações do usuário logado
  async getUserOrganizations(userId: string) {
    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user organizations:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Adicionar usuário à organização
  async addUserToOrganization(orgId: string, userId: string, role: string = 'member') {
    const { data, error } = await supabase
      .from('user_organizations')
      .insert({
        org_id: orgId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding user to organization:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Remover usuário da organização
  async removeUserFromOrganization(orgId: string, userId: string) {
    const { error } = await supabase
      .from('user_organizations')
      .delete()
      .eq('org_id', orgId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing user from organization:', error)
      return { error }
    }

    return { error: null }
  },

  // Atualizar role do usuário na organização
  async updateUserRole(orgId: string, userId: string, role: string) {
    const { data, error } = await supabase
      .from('user_organizations')
      .update({ role })
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user role:', error)
      return { data: null, error }
    }

    return { data, error: null }
  }
}






