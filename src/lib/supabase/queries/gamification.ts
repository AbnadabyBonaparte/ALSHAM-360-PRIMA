import { supabase } from '../client'
import type { NotificationInsert } from '../types'

// Interface que corresponde ao schema REAL da tabela gamification_points
export interface GamificationPoint {
  id: number // bigint = number em JS
  user_id: string
  org_id: string
  activity_type: string
  points_awarded: number
  related_entity_id: string | null
  reason: string | null
  created_at: string
}

// Interface para inserção de pontos
export interface GamificationPointInsert {
  user_id: string
  org_id: string
  activity_type: string
  points_awarded: number
  related_entity_id?: string
  reason?: string
}

// Queries para Gamificação
export const gamificationQueries = {
  // Buscar pontos do usuário
  async getUserPoints(userId: string) {
    const { data, error } = await supabase
      .from('gamification_points')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user points:', error)
      return { data: [] as GamificationPoint[], error }
    }

    return { data: (data || []) as GamificationPoint[], error: null }
  },

  // Buscar total de pontos do usuário
  async getUserTotalPoints(userId: string) {
    const { data, error } = await supabase
      .from('gamification_points')
      .select('points_awarded')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user total points:', error)
      return { data: 0, error }
    }

    const total = (data || []).reduce(
      (sum: number, point: { points_awarded: number }) => sum + (point.points_awarded || 0),
      0
    )
    return { data: total, error: null }
  },

  // Adicionar pontos ao usuário
  async addPoints(
    userId: string,
    orgId: string,
    pointsAwarded: number,
    activityType: string,
    reason?: string,
    relatedEntityId?: string
  ) {
    const insertData = {
      user_id: userId,
      org_id: orgId,
      points_awarded: pointsAwarded,
      activity_type: activityType,
      reason: reason || null,
      related_entity_id: relatedEntityId || null
    } as GamificationPointInsert

    const { data, error } = await supabase
      .from('gamification_points')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error adding points:', error)
      return { data: null, error }
    }

    // Criar notificação para o usuário
    await this.createPointsNotification(userId, pointsAwarded, reason || activityType)

    return { data: data as GamificationPoint, error: null }
  },

  // Buscar badges disponíveis
  async getAvailableBadges() {
    const { data, error } = await supabase
      .from('gamification_badges')
      .select('*')
      .order('points_required')

    if (error) {
      console.error('Error fetching available badges:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Buscar badges conquistadas pelo usuário
  async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:gamification_badges(*)
      `)
      .eq('user_id', userId)
      .order('conquered_at', { ascending: false })

    if (error) {
      console.error('Error fetching user badges:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Verificar e conceder badges automaticamente
  async checkAndAwardBadges(userId: string) {
    const { data: userTotalPoints } = await this.getUserTotalPoints(userId)
    const { data: availableBadges } = await this.getAvailableBadges()
    const { data: userBadges } = await this.getUserBadges(userId)

    const userBadgeIds = userBadges.map((ub: any) => ub.badge_id)
    const newBadges = availableBadges.filter(
      (badge: any) => !userBadgeIds.includes(badge.id) && userTotalPoints >= badge.points_required
    )

    // Conceder novos badges
    for (const badge of newBadges) {
      await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badge.id,
          conquered_at: new Date().toISOString()
        })

      // Criar notificação
      await this.createBadgeNotification(userId, badge.name, badge.icon)
    }

    return { data: newBadges, error: null }
  },

  // Buscar leaderboard da organização
  async getOrganizationLeaderboard(orgId?: string) {
    // Primeiro buscar todos os usuários da org atual
    let query = supabase
      .from('user_profiles')
      .select('user_id, full_name, avatar_url')

    // Se orgId foi fornecido, filtrar por org
    if (orgId) {
      query = query.eq('org_id', orgId)
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return { data: [], error: usersError }
    }

    // Buscar pontos de cada usuário
    const leaderboard = await Promise.all(
      (users || []).map(async (user: any) => {
        const { data: totalPoints } = await this.getUserTotalPoints(user.user_id)
        return {
          user_id: user.user_id,
          full_name: user.full_name || 'Usuário',
          avatar_url: user.avatar_url,
          total_points: totalPoints || 0
        }
      })
    )

    // Ordenar por pontos (maior primeiro)
    leaderboard.sort((a, b) => b.total_points - a.total_points)

    return { data: leaderboard, error: null }
  },

  // Buscar estatísticas de gamificação do usuário
  async getUserGamificationStats(userId: string) {
    const { data: totalPoints } = await this.getUserTotalPoints(userId)
    const { data: badges } = await this.getUserBadges(userId)
    const { data: leaderboard } = await this.getOrganizationLeaderboard()

    const userRank = leaderboard.findIndex((user: any) => user.user_id === userId) + 1
    const totalUsers = leaderboard.length

    return {
      data: {
        total_points: totalPoints || 0,
        badges_count: badges?.length || 0,
        current_rank: userRank || 0,
        total_users: totalUsers || 0,
        rank_percentage: totalUsers > 0 ? ((totalUsers - userRank + 1) / totalUsers) * 100 : 0
      },
      error: null
    }
  },

  // Buscar histórico de pontos por tipo de atividade
  async getPointsByActivityType(userId: string, activityType?: string) {
    let query = supabase
      .from('gamification_points')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (activityType) {
      query = query.eq('activity_type', activityType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching points by activity:', error)
      return { data: [], error }
    }

    return { data: (data || []) as GamificationPoint[], error: null }
  },

  // Buscar pontos por período
  async getPointsByPeriod(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('gamification_points')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching points by period:', error)
      return { data: [], error }
    }

    return { data: (data || []) as GamificationPoint[], error: null }
  },

  // Criar notificação de pontos
  async createPointsNotification(userId: string, points: number, reason: string) {
    const notification = {
      user_id: userId,
      type: 'gamification',
      title: 'Pontos conquistados! 🏆',
      message: `Você ganhou ${points} pontos por: ${reason}`,
      data: { points, reason, type: 'points' }
    }

    const { error } = await supabase
      .from('notifications')
      .insert(notification)

    if (error) {
      console.error('Error creating points notification:', error)
    }
  },

  // Criar notificação de badge
  async createBadgeNotification(userId: string, badgeName: string, badgeIcon: string) {
    const notification = {
      user_id: userId,
      type: 'gamification',
      title: 'Novo badge conquistado! 🎖️',
      message: `Parabéns! Você conquistou o badge "${badgeName}"`,
      data: { badge_name: badgeName, badge_icon: badgeIcon, type: 'badge' }
    }

    const { error } = await supabase
      .from('notifications')
      .insert(notification)

    if (error) {
      console.error('Error creating badge notification:', error)
    }
  }
}






