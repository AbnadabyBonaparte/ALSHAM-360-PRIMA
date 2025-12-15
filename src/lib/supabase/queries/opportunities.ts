import { supabase } from '../client'
import type { Opportunity, OpportunityInsert, OpportunityUpdate } from '../types'

// Queries para Opportunities (Pipeline de Vendas)
export const opportunitiesQueries = {
  async getAll(filters?: {
    stage?: string
    owner_id?: string
    probability_min?: number
    probability_max?: number
    value_min?: number
    value_max?: number
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('opportunities')
      .select(
        `
        *,
        lead:leads_crm(name, email, company)
      `,
        { count: 'exact' }
      )

    if (filters?.stage) query = query.eq('stage', filters.stage)
    if (filters?.owner_id) query = query.eq('owner_id', filters.owner_id)
    if (filters?.probability_min !== undefined)
      query = query.gte('probability', filters.probability_min)
    if (filters?.probability_max !== undefined)
      query = query.lte('probability', filters.probability_max)
    if (filters?.value_min !== undefined)
      query = query.gte('value', filters.value_min)
    if (filters?.value_max !== undefined)
      query = query.lte('value', filters.value_max)

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%`)
    }

    query = query.order('updated_at', { ascending: false })

    if (filters?.limit) query = query.limit(filters.limit)
    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1
      )
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching opportunities:', error)
      return { data: [], error, count: 0 }
    }

    return { data: data || [], error: null, count: count || 0 }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`*, lead:leads_crm(*)`)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching opportunity:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  async create(opportunity: OpportunityInsert) {
    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunity)
      .select()
      .single()

    if (error) {
      console.error('Error creating opportunity:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  async update(id: string, updates: OpportunityUpdate) {
    const { data, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating opportunity:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting opportunity:', error)
      return { error }
    }

    return { error: null }
  },

  // ✅ CORREÇÃO AQUI
  async getByStage() {
    const { data, error } = await supabase
      .from('opportunities')
      .select('stage, value, probability')

    if (error) {
      console.error('Error fetching opportunities by stage:', error)
      return { data: {}, error }
    }

    const pipelineData = (data || []).reduce(
      (acc: Record<string, any>, opp: any) => {
        if (!acc[opp.stage]) {
          acc[opp.stage] = {
            count: 0,
            total_value: 0,
            avg_probability: 0,
            opportunities: []
          }
        }

        acc[opp.stage].count += 1
        acc[opp.stage].total_value += opp.value || 0
        acc[opp.stage].opportunities.push(opp)

        return acc
      },
      {}
    )

    Object.keys(pipelineData).forEach(stage => {
      const stageData = pipelineData[stage]
      const totalProb = stageData.opportunities.reduce(
        (sum: number, opp: any) => sum + (opp.probability || 0),
        0
      )
      stageData.avg_probability =
        stageData.count > 0 ? totalProb / stageData.count : 0
    })

    return { data: pipelineData, error: null }
  },

  async getByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`*, lead:leads_crm(name, email, company)`)
      .eq('owner_id', ownerId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching opportunities by owner:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  async getValueByStage() {
    const { data, error } = await supabase
      .from('opportunities')
      .select('stage, value')

    if (error) {
      console.error('Error fetching opportunity values:', error)
      return { data: {}, error }
    }

    const valuesByStage = (data || []).reduce(
      (acc: Record<string, number>, opp: any) => {
        acc[opp.stage] = (acc[opp.stage] || 0) + (opp.value || 0)
        return acc
      },
      {}
    )

    return { data: valuesByStage, error: null }
  },

  async getClosingSoon(days: number = 30) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    const { data, error } = await supabase
      .from('opportunities')
      .select(`*, lead:leads_crm(name, email, company)`)
      .lte('expected_close_date', futureDate.toISOString())
      .not('expected_close_date', 'is', null)
      .order('expected_close_date', { ascending: true })

    if (error) {
      console.error('Error fetching closing opportunities:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  async getWeightedRevenue() {
    const { data, error } = await supabase
      .from('opportunities')
      .select('value, probability')

    if (error) {
      console.error('Error calculating weighted revenue:', error)
      return { data: 0, error }
    }

    const weightedRevenue = (data || []).reduce(
      (total: number, opp: any) => {
        const value = opp.value || 0
        const probability = (opp.probability || 0) / 100
        return total + value * probability
      },
      0
    )

    return { data: weightedRevenue, error: null }
  },

  async updateStage(id: string, stage: string) {
    const { data, error } = await supabase
      .from('opportunities')
      .update({ stage })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating opportunity stage:', error)
      return { data: null, error }
    }

    return { data, error: null }
  }
}
