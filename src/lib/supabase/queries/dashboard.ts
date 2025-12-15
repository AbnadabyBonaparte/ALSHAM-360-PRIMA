import { supabase } from '../client'
import type {
  DashboardKPIs,
  CRMOverview,
  GamificationSummary,
  LeadsHealth,
  ExecutiveOverview,
  LeadsBySource,
  GamificationRank
} from '../types'

// Queries para Dashboard - Dados reais do Supabase
export const dashboardQueries = {
  // Buscar KPIs principais usando views do banco
  async getKPIs(): Promise<DashboardKPIs> {
    try {
      // Buscar dados de múltiplas views em paralelo
      const [
        crmOverview,
        executiveOverview,
        gamificationSummary,
        leadsHealth
      ] = await Promise.all([
        this.getCRMOverview(),
        this.getExecutiveOverview(),
        this.getGamificationSummary(),
        this.getLeadsHealth()
      ])

      // Combinar dados em KPIs do dashboard
      return {
        total_leads: crmOverview?.total_leads || 0,
        qualified_leads: crmOverview?.qualified_leads || 0,
        total_opportunities: crmOverview?.opportunities || 0,
        won_opportunities: crmOverview?.won_opportunities || 0,
        total_revenue: crmOverview?.total_revenue || 0,
        conversion_rate: crmOverview?.conversion_rate || 0,
        monthly_revenue: executiveOverview?.mrr || 0,
        active_users: gamificationSummary?.active_users || 0,
        mrr: executiveOverview?.mrr || 0,
        arr: executiveOverview?.arr || 0,
        churn_rate: executiveOverview?.churn_rate || 0,
        customer_ltv: executiveOverview?.customer_ltv || 0,
        cac: executiveOverview?.cac || 0,
        pipeline_value: executiveOverview?.pipeline_value || 0,
        sales_velocity: executiveOverview?.sales_velocity || 0,
        team_productivity: executiveOverview?.team_productivity || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error)
      // Retornar valores padrão se houver erro
      return {
        total_leads: 0,
        qualified_leads: 0,
        total_opportunities: 0,
        won_opportunities: 0,
        total_revenue: 0,
        conversion_rate: 0,
        monthly_revenue: 0,
        active_users: 0,
        mrr: 0,
        arr: 0,
        churn_rate: 0,
        customer_ltv: 0,
        cac: 0,
        pipeline_value: 0,
        sales_velocity: 0,
        team_productivity: 0
      }
    }
  },

  // Buscar visão geral do CRM
  async getCRMOverview(): Promise<CRMOverview | null> {
    try {
      const { data, error } = await supabase
        .from('v_crm_overview')
        .select('*')
        .single()

      if (error) {
        console.error('Error fetching CRM overview:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching CRM overview:', error)
      return null
    }
  },

  // Buscar visão executiva
  async getExecutiveOverview(): Promise<ExecutiveOverview | null> {
    try {
      const { data, error } = await supabase
        .from('v_executive_overview')
        .select('*')
        .single()

      if (error) {
        console.error('Error fetching executive overview:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching executive overview:', error)
      return null
    }
  },

  // Buscar resumo de gamificação
  async getGamificationSummary(): Promise<GamificationSummary | null> {
    try {
      const { data, error } = await supabase
        .from('v_gamification_summary')
        .select('*')
        .single()

      if (error) {
        console.error('Error fetching gamification summary:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching gamification summary:', error)
      return null
    }
  },

  // Buscar saúde dos leads
  async getLeadsHealth(): Promise<LeadsHealth | null> {
    try {
      const { data, error } = await supabase
        .from('v_leads_health')
        .select('*')
        .single()

      if (error) {
        console.error('Error fetching leads health:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching leads health:', error)
      return null
    }
  },

  // Buscar dados de pipeline por stage (para gráfico)
  async getPipelineData() {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('stage, value, probability')
        .order('stage')

      if (error) {
        console.error('Error fetching pipeline data:', error)
        return []
      }

      // Agrupar por stage
      const stageData: Record<string, { count: number; value: number; avgProbability: number }> = {}

      data?.forEach(opp => {
        if (!stageData[opp.stage]) {
          stageData[opp.stage] = { count: 0, value: 0, avgProbability: 0 }
        }
        stageData[opp.stage].count++
        stageData[opp.stage].value += opp.value || 0
        stageData[opp.stage].avgProbability = ((stageData[opp.stage].avgProbability * (stageData[opp.stage].count - 1)) + (opp.probability || 0)) / stageData[opp.stage].count
      })

      return Object.entries(stageData).map(([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value,
        avgProbability: Math.round(data.avgProbability)
      }))
    } catch (error) {
      console.error('Error fetching pipeline data:', error)
      return []
    }
  },

  // Buscar dados de market split (origem dos leads)
  async getMarketSplitData(): Promise<LeadsBySource[]> {
    try {
      const { data, error } = await supabase
        .from('leads_por_origem')
        .select('*')
        .order('count', { ascending: false })

      if (error) {
        console.error('Error fetching market split data:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching market split data:', error)
      return []
    }
  },

  // Buscar leaderboard de gamificação
  async getLeaderboard(limit: number = 10): Promise<GamificationRank[]> {
    try {
      const { data, error } = await supabase
        .from('vw_gamification_rank')
        .select('*')
        .order('rank_position')
        .limit(limit)

      if (error) {
        console.error('Error fetching leaderboard:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
  },

  // Buscar insights de IA
  async getAIInsights() {
    try {
      const { data, error } = await supabase
        .from('ai_predictions')
        .select(`
          *,
          lead:leads_crm(name, company)
        `)
        .order('confidence', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching AI insights:', error)
        return []
      }

      return data?.map(prediction => ({
        id: prediction.id,
        type: prediction.prediction_type,
        confidence: prediction.confidence,
        lead: prediction.lead,
        data: prediction.prediction_data,
        created_at: prediction.created_at
      })) || []
    } catch (error) {
      console.error('Error fetching AI insights:', error)
      return []
    }
  },

  // Buscar próximas melhores ações
  async getNextBestActions() {
    try {
      const { data, error } = await supabase
        .from('next_best_actions')
        .select(`
          *,
          lead:leads_crm(name, company),
          opportunity:opportunities(title, value)
        `)
        .is('taken_at', null)
        .order('expected_impact', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching next best actions:', error)
        return []
      }

      return data?.map(action => ({
        id: action.id,
        type: action.action_type,
        title: action.action_title,
        description: action.action_description,
        expected_impact: action.expected_impact,
        confidence_score: action.confidence_score,
        lead: action.lead,
        opportunity: action.opportunity
      })) || []
    } catch (error) {
      console.error('Error fetching next best actions:', error)
      return []
    }
  },

  // Buscar campanhas ativas para o spotlight
  async getActiveCampaigns() {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Error fetching active campaigns:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching active campaigns:', error)
      return []
    }
  },

  // Buscar atividades recentes (audit log)
  async getRecentActivities(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select(`
          *,
          user:user_profiles(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent activities:', error)
        return []
      }

      return data?.map(activity => ({
        id: activity.id,
        action: activity.action,
        table_name: activity.table_name,
        user: activity.user?.full_name || 'Sistema',
        created_at: activity.created_at
      })) || []
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      return []
    }
  },

  // Calcular valor total do pipeline (weighted)
  async getWeightedPipelineValue(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('value, probability')

      if (error) {
        console.error('Error calculating weighted pipeline value:', error)
        return 0
      }

      const weightedValue = data?.reduce((total, opp) => {
        const value = opp.value || 0
        const probability = (opp.probability || 0) / 100
        return total + (value * probability)
      }, 0) || 0

      return weightedValue
    } catch (error) {
      console.error('Error calculating weighted pipeline value:', error)
      return 0
    }
  }
}
