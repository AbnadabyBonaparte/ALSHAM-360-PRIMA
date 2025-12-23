import { supabase } from '../client'
import type { GamificationPoints, GamificationBadge, NotificationInsert } from '../types'

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
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Buscar total de pontos do usuário
  async getUserTotalPoints(userId: string) {
    const { data, error } = await supabase
      .from('gamification_points')
      .select('points')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user total points:', error)
      return { data: 0, error }
    }

    const total = data.reduce((sum: number, point: any) => sum + point.points, 0)
    return { data: total, error: null }
  },

  // Adicionar pontos ao usuário
  async addPoints(userId: string, points: number, reason: string, metadata?: any) {
    const { data, error } = await supabase
      .from('gamification_points')
      .insert({
        user_id: userId,
        points,
        reason,
        metadata
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding points:', error)
      return { data: null, error }
    }

    // Criar notificação para o usuário
    await this.createPointsNotification(userId, points, reason)

    return { data, error: null }
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
  async getOrganizationLeaderboard() {
    // Primeiro buscar todos os usuários da org atual
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, avatar_url')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return { data: [], error: usersError }
    }

    // Buscar pontos de cada usuário
    const leaderboard = await Promise.all(
      users.map(async (user: any) => {
        const { data: totalPoints } = await this.getUserTotalPoints(user.user_id)
        return {
          user_id: user.user_id,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          total_points: totalPoints
        }
      })
    )

    // Ordenar por pontos
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
        total_points: totalPoints,
        badges_count: badges.length,
        current_rank: userRank,
        total_users: totalUsers,
        rank_percentage: totalUsers > 0 ? ((totalUsers - userRank + 1) / totalUsers) * 100 : 0
      },
      error: null
    }
  },

  // Criar notificação de pontos
  async createPointsNotification(userId: string, points: number, reason: string) {
    const notification: NotificationInsert = {
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
    const notification: NotificationInsert = {
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






