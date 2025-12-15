import { supabase } from '../client'
import type { Lead, LeadInsert, LeadUpdate } from '../types'

// Queries para Leads CRM
export const leadsQueries = {
  // Buscar todos os leads da organização atual
  async getAll(filters?: {
    status?: string
    stage?: string
    temperature?: string
    owner_id?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('leads_crm')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.stage) {
      query = query.eq('stage', filters.stage)
    }

    if (filters?.temperature) {
      query = query.eq('temperature', filters.temperature)
    }

    if (filters?.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
    }

    // Ordenação
    query = query.order('updated_at', { ascending: false })

    // Paginação
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return { data: [], error, count: 0 }
    }

    return { data: data || [], error: null, count: count || 0 }
  },

  // Buscar lead por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('leads_crm')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching lead:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Criar novo lead
  async create(lead: LeadInsert) {
    const { data, error } = await supabase
      .from('leads_crm')
      .insert(lead)
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Atualizar lead
  async update(id: string, updates: LeadUpdate) {
    const { data, error } = await supabase
      .from('leads_crm')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Deletar lead
  async delete(id: string) {
    const { error } = await supabase
      .from('leads_crm')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lead:', error)
      return { error }
    }

    return { error: null }
  },

  // Buscar leads por status para estatísticas
  async getStatsByStatus() {
    const { data, error } = await supabase
      .from('leads_crm')
      .select('status, count(*)')
      .select()

    if (error) {
      console.error('Error fetching leads stats:', error)
      return { data: [], error }
    }

    // Agrupar por status
    const stats = data.reduce((acc: Record<string, number>, lead: any) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {})

    return { data: stats, error: null }
  },

  // Buscar leads por temperatura
  async getStatsByTemperature() {
    const { data, error } = await supabase
      .from('leads_crm')
      .select('temperature, count(*)')
      .select()

    if (error) {
      console.error('Error fetching leads temperature stats:', error)
      return { data: [], error }
    }

    // Agrupar por temperatura
    const stats = data.reduce((acc: Record<string, number>, lead: any) => {
      acc[lead.temperature] = (acc[lead.temperature] || 0) + 1
      return acc
    }, {})

    return { data: stats, error: null }
  },

  // Buscar leads recentes (últimos 30 dias)
  async getRecent(days: number = 30) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days)

    const { data, error } = await supabase
      .from('leads_crm')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching recent leads:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Buscar leads por owner
  async getByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('leads_crm')
      .select('*')
      .eq('owner_id', ownerId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching leads by owner:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Atualizar score do lead
  async updateScore(id: string, score: number) {
    const { data, error } = await supabase
      .from('leads_crm')
      .update({ score })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead score:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Adicionar tags ao lead
  async addTags(id: string, tags: string[]) {
    // Primeiro buscar tags atuais
    const { data: currentLead, error: fetchError } = await supabase
      .from('leads_crm')
      .select('tags')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching current tags:', fetchError)
      return { data: null, error: fetchError }
    }

    const currentTags = currentLead.tags || []
    const newTags = [...new Set([...currentTags, ...tags])]

    const { data, error } = await supabase
      .from('leads_crm')
      .update({ tags: newTags })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error adding tags:', error)
      return { data: null, error }
    }

    return { data, error: null }
  }
}
