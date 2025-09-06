// Redis Cache Client para ALSHAM 360° PRIMA
import { createClient } from 'redis'

class RedisCache {
  constructor() {
    this.client = null
    this.isConnected = false
  }

  async connect() {
    try {
      // URL do Redis do Railway
      const redisUrl = 'redis://default:deNavqxILiQbNtrMTmjhyzKnjdpkkZEd@redis.railway.internal:6379'
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500)
        }
      })

      this.client.on('error', (err) => {
        console.warn('Redis Client Error:', err)
        this.isConnected = false
      })

      this.client.on('connect', () => {
        console.log('✅ Redis conectado com sucesso!')
        this.isConnected = true
      })

      await this.client.connect()
      return true
    } catch (error) {
      console.warn('⚠️ Redis não disponível, usando fallback:', error.message)
      this.isConnected = false
      return false
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect()
      this.isConnected = false
    }
  }

  // Cache de KPIs do Dashboard
  async cacheKPIs(orgId, kpis) {
    if (!this.isConnected) return false
    
    try {
      const key = `kpis:${orgId}`
      await this.client.setEx(key, 300, JSON.stringify(kpis)) // 5 minutos
      return true
    } catch (error) {
      console.warn('Erro ao cachear KPIs:', error)
      return false
    }
  }

  async getKPIs(orgId) {
    if (!this.isConnected) return null
    
    try {
      const key = `kpis:${orgId}`
      const cached = await this.client.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.warn('Erro ao buscar KPIs do cache:', error)
      return null
    }
  }

  // Cache de Leads
  async cacheLeads(orgId, leads) {
    if (!this.isConnected) return false
    
    try {
      const key = `leads:${orgId}`
      await this.client.setEx(key, 180, JSON.stringify(leads)) // 3 minutos
      return true
    } catch (error) {
      console.warn('Erro ao cachear leads:', error)
      return false
    }
  }

  async getLeads(orgId) {
    if (!this.isConnected) return null
    
    try {
      const key = `leads:${orgId}`
      const cached = await this.client.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.warn('Erro ao buscar leads do cache:', error)
      return null
    }
  }

  // Cache de Sessão do Usuário
  async cacheUserSession(userId, sessionData) {
    if (!this.isConnected) return false
    
    try {
      const key = `session:${userId}`
      await this.client.setEx(key, 3600, JSON.stringify(sessionData)) // 1 hora
      return true
    } catch (error) {
      console.warn('Erro ao cachear sessão:', error)
      return false
    }
  }

  async getUserSession(userId) {
    if (!this.isConnected) return null
    
    try {
      const key = `session:${userId}`
      const cached = await this.client.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.warn('Erro ao buscar sessão do cache:', error)
      return null
    }
  }

  // Invalidar cache específico
  async invalidateCache(pattern) {
    if (!this.isConnected) return false
    
    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
      }
      return true
    } catch (error) {
      console.warn('Erro ao invalidar cache:', error)
      return false
    }
  }

  // Estatísticas do cache
  async getCacheStats() {
    if (!this.isConnected) return null
    
    try {
      const info = await this.client.info('memory')
      return {
        connected: this.isConnected,
        memory: info
      }
    } catch (error) {
      console.warn('Erro ao buscar stats do cache:', error)
      return null
    }
  }
}

// Instância singleton
const redisCache = new RedisCache()

// Conectar automaticamente
redisCache.connect().catch(console.warn)

export default redisCache

