import { supabase } from '../client'
import type { Campaign, CampaignInsert, CampaignUpdate } from '../types'

// Queries para Campaigns
export const campaignsQueries = {
  // Buscar todas as campanhas da organização atual
  async getAll(filters?: {
    status?: string
    type?: string
    owner_id?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('campaigns')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%`)
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
      console.error('Error fetching campaigns:', error)
      return { data: [], error, count: 0 }
    }

    return { data: data || [], error: null, count: count || 0 }
  },

  // Buscar campanha por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching campaign:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Criar nova campanha
  async create(campaign: CampaignInsert) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Atualizar campanha
  async update(id: string, updates: CampaignUpdate) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Deletar campanha
  async delete(id: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting campaign:', error)
      return { error }
    }

    return { error: null }
  },

  // Buscar campanhas ativas
  async getActive() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active campaigns:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Buscar campanhas por tipo
  async getByType(type: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns by type:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Atualizar status da campanha
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign status:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Calcular ROI da campanha (simplificado)
  async calculateROI(campaignId: string) {
    // Buscar campanha
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError) {
      console.error('Error fetching campaign for ROI:', campaignError)
      return { data: null, error: campaignError }
    }

    // Buscar leads gerados pela campanha (simplificado)
    // Em um sistema real, haveria uma tabela de relacionamento campaign_leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads_crm')
      .select('id')
      .eq('campaign_id', campaignId)

    if (leadsError) {
      console.error('Error fetching leads for ROI:', leadsError)
      return { data: null, error: leadsError }
    }

    const leadCount = leads?.length || 0
    const costPerLead = campaign.spent / Math.max(leadCount, 1)

    return {
      data: {
        campaign_id: campaignId,
        total_spent: campaign.spent,
        leads_generated: leadCount,
        cost_per_lead: costPerLead,
        roi: leadCount > 0 ? (campaign.budget / campaign.spent) : 0
      },
      error: null
    }
  }
}






