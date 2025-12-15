export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Core CRM - Leads
      leads_crm: {
        Row: {
          id: string
          org_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          position: string | null
          status: string
          stage: string
          temperature: string
          score: number
          score_ia: number | null
          source: string | null
          campaign_id: string | null
          owner_id: string | null
          tags: string[] | null
          metadata: Json | null
          notes: string | null
          consent: boolean
          consent_at: string | null
          origem_captura: string | null
          canal_captura: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          position?: string | null
          status?: string
          stage?: string
          temperature?: string
          score?: number
          score_ia?: number | null
          source?: string | null
          campaign_id?: string | null
          owner_id?: string | null
          tags?: string[] | null
          metadata?: Json | null
          notes?: string | null
          consent?: boolean
          consent_at?: string | null
          origem_captura?: string | null
          canal_captura?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          position?: string | null
          status?: string
          stage?: string
          temperature?: string
          score?: number
          score_ia?: number | null
          source?: string | null
          campaign_id?: string | null
          owner_id?: string | null
          tags?: string[] | null
          metadata?: Json | null
          notes?: string | null
          consent?: boolean
          consent_at?: string | null
          origem_captura?: string | null
          canal_captura?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Leads com labels (view)
      leads_crm_with_labels: {
        Row: {
          id: string
          org_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          position: string | null
          status: string
          stage: string
          temperature: string
          score: number
          score_ia: number | null
          labels: Json[] | null
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      opportunities: {
        Row: {
          id: string
          org_id: string
          lead_id: string
          title: string
          value: number
          currency: string
          stage: string
          probability: number
          expected_close_date: string | null
          owner_id: string
          campaign_id: string | null
          deal_size: string | null
          competitors: string[] | null
          decision_makers: Json[] | null
          pain_points: string[] | null
          timeline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          lead_id: string
          title: string
          value: number
          currency?: string
          stage?: string
          probability?: number
          expected_close_date?: string | null
          owner_id: string
          campaign_id?: string | null
          deal_size?: string | null
          competitors?: string[] | null
          decision_makers?: Json[] | null
          pain_points?: string[] | null
          timeline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          lead_id?: string
          title?: string
          value?: number
          currency?: string
          stage?: string
          probability?: number
          expected_close_date?: string | null
          owner_id?: string
          campaign_id?: string | null
          deal_size?: string | null
          competitors?: string[] | null
          decision_makers?: Json[] | null
          pain_points?: string[] | null
          timeline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          org_id: string
          name: string
          type: string
          status: string
          budget: number
          spent: number
          start_date: string
          end_date: string | null
          owner_id: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          type: string
          status?: string
          budget: number
          spent?: number
          start_date: string
          end_date?: string | null
          owner_id: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          type?: string
          status?: string
          budget?: number
          spent?: number
          start_date?: string
          end_date?: string | null
          owner_id?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          domain: string | null
          logo_url: string | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          domain?: string | null
          logo_url?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          domain?: string | null
          logo_url?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          org_id: string
          full_name: string | null
          avatar_url: string | null
          role: string
          permissions: Json | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          org_id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          permissions?: Json | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          org_id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          permissions?: Json | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_organizations: {
        Row: {
          id: string
          user_id: string
          org_id: string
          role: string
          permissions: Json | null
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          org_id: string
          role?: string
          permissions?: Json | null
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          org_id?: string
          role?: string
          permissions?: Json | null
          joined_at?: string
        }
      }

      // Gamificação
      gamification_points: {
        Row: {
          id: string
          org_id: string
          user_id: string
          points: number
          reason: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          points: number
          reason: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          points?: number
          reason?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      gamification_badges: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string
          icon: string
          criteria: Json
          points_required: number
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description: string
          icon: string
          criteria: Json
          points_required: number
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string
          icon?: string
          criteria?: Json
          points_required?: number
          created_at?: string
        }
      }

      // Notificações
      notifications: {
        Row: {
          id: string
          org_id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }

      // AI Tables
      ai_predictions: {
        Row: {
          id: string
          org_id: string
          lead_id: string
          prediction_type: string
          confidence: number
          prediction_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          lead_id: string
          prediction_type: string
          confidence: number
          prediction_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          lead_id?: string
          prediction_type?: string
          confidence?: number
          prediction_data?: Json
          created_at?: string
        }
      }

      // Contacts
      contacts: {
        Row: {
          id: string
          org_id: string
          lead_id: string | null
          account_id: string | null
          name: string
          email: string | null
          phone: string | null
          position: string | null
          linkedin_url: string | null
          twitter_handle: string | null
          is_decision_maker: boolean
          influence_level: string
          relationship_status: string
          last_contact: string | null
          next_followup: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          lead_id?: string | null
          account_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          position?: string | null
          linkedin_url?: string | null
          twitter_handle?: string | null
          is_decision_maker?: boolean
          influence_level?: string
          relationship_status?: string
          last_contact?: string | null
          next_followup?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          lead_id?: string | null
          account_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          position?: string | null
          linkedin_url?: string | null
          twitter_handle?: string | null
          is_decision_maker?: boolean
          influence_level?: string
          relationship_status?: string
          last_contact?: string | null
          next_followup?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Accounts
      accounts: {
        Row: {
          id: string
          org_id: string
          name: string
          domain: string | null
          industry: string | null
          size: string | null
          revenue: number | null
          location: string | null
          website: string | null
          linkedin_url: string | null
          description: string | null
          status: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          domain?: string | null
          industry?: string | null
          size?: string | null
          revenue?: number | null
          location?: string | null
          website?: string | null
          linkedin_url?: string | null
          description?: string | null
          status?: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          domain?: string | null
          industry?: string | null
          size?: string | null
          revenue?: number | null
          location?: string | null
          website?: string | null
          linkedin_url?: string | null
          description?: string | null
          status?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }

      // User Roles
      user_roles: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role_name: string
          permissions: Json
          assigned_at: string
          assigned_by: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role_name: string
          permissions: Json
          assigned_at?: string
          assigned_by: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role_name?: string
          permissions?: Json
          assigned_at?: string
          assigned_by?: string
          expires_at?: string | null
        }
      }

      // Gamification Rank History
      gamification_rank_history: {
        Row: {
          id: string
          org_id: string
          user_id: string
          rank_position: number
          points_at_rank: number
          achieved_at: string
          period_start: string
          period_end: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          rank_position: number
          points_at_rank: number
          achieved_at?: string
          period_start: string
          period_end: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          rank_position?: number
          points_at_rank?: number
          achieved_at?: string
          period_start?: string
          period_end?: string
        }
      }

      // Gamification Rewards
      gamification_rewards: {
        Row: {
          id: string
          org_id: string
          user_id: string
          badge_id: string | null
          reward_type: string
          reward_value: number
          reward_metadata: Json | null
          granted_at: string
          granted_by: string | null
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          badge_id?: string | null
          reward_type: string
          reward_value: number
          reward_metadata?: Json | null
          granted_at?: string
          granted_by?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          badge_id?: string | null
          reward_type?: string
          reward_value?: number
          reward_metadata?: Json | null
          granted_at?: string
          granted_by?: string | null
        }
      }

      // Automations
      automations: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string | null
          trigger_type: string
          trigger_config: Json
          actions: Json[]
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description?: string | null
          trigger_type: string
          trigger_config: Json
          actions: Json[]
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string | null
          trigger_type?: string
          trigger_config?: Json
          actions?: Json[]
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }

      // NFT Gallery
      nft_gallery: {
        Row: {
          id: string
          org_id: string
          user_id: string
          nft_contract: string
          token_id: string
          name: string
          description: string | null
          image_url: string
          metadata: Json
          acquired_at: string
          acquired_value: number | null
          current_value: number | null
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          nft_contract: string
          token_id: string
          name: string
          description?: string | null
          image_url: string
          metadata: Json
          acquired_at?: string
          acquired_value?: number | null
          current_value?: number | null
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          nft_contract?: string
          token_id?: string
          name?: string
          description?: string | null
          image_url?: string
          metadata?: Json
          acquired_at?: string
          acquired_value?: number | null
          current_value?: number | null
        }
      }

      // Security Audit Log
      security_audit_log: {
        Row: {
          id: string
          org_id: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          ip_address: string
          user_agent: string
          location: Json | null
          risk_level: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          ip_address: string
          user_agent: string
          location?: Json | null
          risk_level?: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          action?: string
          resource_type?: string
          resource_id?: string
          ip_address?: string
          user_agent?: string
          location?: Json | null
          risk_level?: string
          details?: Json | null
          created_at?: string
        }
      }

      // Audit
      audit_log: {
        Row: {
          id: string
          org_id: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          action?: string
          table_name?: string
          record_id?: string
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      // CRM Overview
      v_crm_overview: {
        Row: {
          org_id: string
          total_leads: number
          qualified_leads: number
          opportunities: number
          won_opportunities: number
          total_revenue: number
          conversion_rate: number
          avg_deal_size: number
        }
        Insert: never
        Update: never
      }

      // Gamification Summary
      v_gamification_summary: {
        Row: {
          org_id: string
          total_users: number
          active_users: number
          total_points: number
          avg_points_per_user: number
          total_badges: number
          top_performer: string
          top_performer_points: number
        }
        Insert: never
        Update: never
      }

      // Leads Health
      v_leads_health: {
        Row: {
          org_id: string
          total_leads: number
          hot_leads: number
          warm_leads: number
          cold_leads: number
          unqualified_leads: number
          health_score: number
          avg_score: number
        }
        Insert: never
        Update: never
      }

      // Executive Overview
      v_executive_overview: {
        Row: {
          org_id: string
          mrr: number
          arr: number
          churn_rate: number
          customer_ltv: number
          cac: number
          pipeline_value: number
          sales_velocity: number
          team_productivity: number
        }
        Insert: never
        Update: never
      }

      // Leads por Origem
      leads_por_origem: {
        Row: {
          org_id: string
          origem: string
          count: number
          percentage: number
        }
        Insert: never
        Update: never
      }

      // Gamification Rank View
      vw_gamification_rank: {
        Row: {
          user_id: string
          org_id: string
          full_name: string
          total_points: number
          rank_position: number
          badges_count: number
          level: number
        }
        Insert: never
        Update: never
      }
    }
    Functions: {
      current_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos utilitários
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Tipos específicos para uso comum
export type Lead = Tables<'leads_crm'>
export type Opportunity = Tables<'opportunities'>
export type Campaign = Tables<'campaigns'>
export type Organization = Tables<'organizations'>
export type UserProfile = Tables<'user_profiles'>
export type UserOrganization = Tables<'user_organizations'>
export type GamificationPoints = Tables<'gamification_points'>
export type GamificationBadge = Tables<'gamification_badges'>
export type Notification = Tables<'notifications'>
export type AIPrediction = Tables<'ai_predictions'>
export type AuditLog = Tables<'audit_log'>

// Tipos para inserts/updates
export type LeadInsert = Database['public']['Tables']['leads_crm']['Insert']
export type LeadUpdate = Database['public']['Tables']['leads_crm']['Update']
export type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert']
export type OpportunityUpdate = Database['public']['Tables']['opportunities']['Update']
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

// Tipos para Auth do Supabase
export type AuthUser = {
  id: string
  email?: string
  phone?: string
  created_at: string
  updated_at: string
  email_confirmed_at?: string
  phone_confirmed_at?: string
  last_sign_in_at?: string
}

// Tipos para organização do usuário
export type UserOrganizationWithDetails = UserOrganization & {
  organization: Organization
}

// Estados de autenticação
export type AuthState = {
  user: AuthUser | null
  session: any | null
  currentOrg: Organization | null
  organizations: Organization[]
  loading: boolean
  error: string | null
}

// Tipos para gamificação
export type UserGamificationStats = {
  total_points: number
  current_level: number
  badges_earned: number
  rank_in_org: number
}

// AI Tables
export type AIPrediction = Tables<'ai_predictions'>

// AI Predictions
export interface ai_predictions {
  Row: {
    id: string
    org_id: string
    lead_id: string | null
    opportunity_id: string | null
    prediction_type: string
    confidence: number
    prediction_data: Json
    model_version: string
    created_at: string
  }
  Insert: {
    id?: string
    org_id: string
    lead_id?: string | null
    opportunity_id?: string | null
    prediction_type: string
    confidence: number
    prediction_data: Json
    model_version?: string
    created_at?: string
  }
  Update: {
    id?: string
    org_id?: string
    lead_id?: string | null
    opportunity_id?: string | null
    prediction_type?: string
    confidence?: number
    prediction_data?: Json
    model_version?: string
    created_at?: string
  }
}

// AI Recommendations
export interface ai_recommendations {
  Row: {
    id: string
    org_id: string
    lead_id: string | null
    user_id: string
    recommendation_type: string
    priority: string
    title: string
    description: string
    actions: Json[]
    expires_at: string | null
    created_at: string
  }
  Insert: {
    id?: string
    org_id: string
    lead_id?: string | null
    user_id: string
    recommendation_type: string
    priority?: string
    title: string
    description: string
    actions: Json[]
    expires_at?: string | null
    created_at?: string
  }
  Update: {
    id?: string
    org_id?: string
    lead_id?: string | null
    user_id?: string
    recommendation_type?: string
    priority?: string
    title?: string
    description?: string
    actions?: Json[]
    expires_at?: string | null
    created_at?: string
  }
}

// Next Best Actions
export interface next_best_actions {
  Row: {
    id: string
    org_id: string
    lead_id: string | null
    opportunity_id: string | null
    user_id: string
    action_type: string
    action_title: string
    action_description: string
    expected_impact: number
    confidence_score: number
    suggested_at: string
    taken_at: string | null
    result: string | null
  }
  Insert: {
    id?: string
    org_id: string
    lead_id?: string | null
    opportunity_id?: string | null
    user_id: string
    action_type: string
    action_title: string
    action_description: string
    expected_impact?: number
    confidence_score?: number
    suggested_at?: string
    taken_at?: string | null
    result?: string | null
  }
  Update: {
    id?: string
    org_id?: string
    lead_id?: string | null
    opportunity_id?: string | null
    user_id?: string
    action_type?: string
    action_title?: string
    action_description?: string
    expected_impact?: number
    confidence_score?: number
    suggested_at?: string
    taken_at?: string | null
    result?: string | null
  }
}

// Tipos para dashboard KPIs
export type DashboardKPIs = {
  total_leads: number
  qualified_leads: number
  total_opportunities: number
  won_opportunities: number
  total_revenue: number
  conversion_rate: number
  monthly_revenue: number
  active_users: number
  mrr: number
  arr: number
  churn_rate: number
  customer_ltv: number
  cac: number
  pipeline_value: number
  sales_velocity: number
  team_productivity: number
}

// Tipos para AI
export type AIPredictionType = Tables<'ai_predictions'>
export type AIRecommendation = ai_recommendations['Row']
export type NextBestAction = next_best_actions['Row']

// Tipos para views
export type CRMOverview = Database['public']['Views']['v_crm_overview']['Row']
export type GamificationSummary = Database['public']['Views']['v_gamification_summary']['Row']
export type LeadsHealth = Database['public']['Views']['v_leads_health']['Row']
export type ExecutiveOverview = Database['public']['Views']['v_executive_overview']['Row']
export type LeadsBySource = Database['public']['Views']['leads_por_origem']['Row']
export type GamificationRank = Database['public']['Views']['vw_gamification_rank']['Row']
