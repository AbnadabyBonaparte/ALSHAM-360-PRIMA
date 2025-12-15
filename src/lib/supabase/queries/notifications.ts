import { supabase } from '../client'
import type { Notification, NotificationInsert, NotificationUpdate } from '../types'

// Queries para Notifications
export const notificationsQueries = {
  // Buscar notificações do usuário
  async getUserNotifications(userId: string, filters?: {
    read?: boolean
    type?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)

    // Aplicar filtros
    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
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
      console.error('Error fetching notifications:', error)
      return { data: [], error, count: 0 }
    }

    return { data: data || [], error: null, count: count || 0 }
  },

  // Buscar notificação por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching notification:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Criar nova notificação
  async create(notification: NotificationInsert) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Atualizar notificação
  async update(id: string, updates: NotificationUpdate) {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating notification:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Deletar notificação
  async delete(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting notification:', error)
      return { error }
    }

    return { error: null }
  },

  // Marcar notificação como lida
  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error marking notification as read:', error)
      return { data: null, error }
    }

    return { data, error: null }
  },

  // Marcar todas as notificações como lidas
  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('read', false)
      .select()

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Buscar notificações não lidas
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return { data: 0, error }
    }

    return { data: count || 0, error: null }
  },

  // Buscar notificações recentes (últimas 24 horas)
  async getRecent(userId: string, hours: number = 24) {
    const sinceDate = new Date()
    sinceDate.setHours(sinceDate.getHours() - hours)

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sinceDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recent notifications:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  },

  // Criar notificação de sistema
  async createSystemNotification(userId: string, title: string, message: string, data?: any) {
    const notification: NotificationInsert = {
      user_id: userId,
      type: 'system',
      title,
      message,
      data: data || {}
    }

    return this.create(notification)
  },

  // Criar notificação de lead
  async createLeadNotification(userId: string, leadName: string, action: string) {
    const notification: NotificationInsert = {
      user_id: userId,
      type: 'lead',
      title: 'Atualização de Lead',
      message: `Lead "${leadName}" foi ${action}`,
      data: { lead_name: leadName, action, type: 'lead' }
    }

    return this.create(notification)
  },

  // Criar notificação de oportunidade
  async createOpportunityNotification(userId: string, oppTitle: string, action: string) {
    const notification: NotificationInsert = {
      user_id: userId,
      type: 'opportunity',
      title: 'Atualização de Oportunidade',
      message: `Oportunidade "${oppTitle}" foi ${action}`,
      data: { opportunity_title: oppTitle, action, type: 'opportunity' }
    }

    return this.create(notification)
  },

  // Limpar notificações antigas (mais de 30 dias)
  async cleanupOldNotifications(days: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (error) {
      console.error('Error cleaning up old notifications:', error)
      return { error }
    }

    return { error: null }
  },

  // Buscar notificações por tipo
  async getByType(userId: string, type: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications by type:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  }
}
