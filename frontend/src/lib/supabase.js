// =========================================================================
// 🚀 ALSHAM 360° PRIMA - SUPABASE LIB NASA 10/10 ENTERPRISE
// =========================================================================
// VERSÃO NASA 10.0 - MISSÃO CRÍTICA PRODUCTION READY
// Seguindo Template "Produção-Primeiro" - Zero Mocking Policy
// =========================================================================

import { createClient } from '@supabase/supabase-js'

// =========================================================================
// 🔐 SEÇÃO 1: CONFIGURAÇÃO DE PRODUÇÃO - FONTE DA VERDADE
// =========================================================================

/**
 * @fileoverview ALSHAM 360° PRIMA Supabase Integration Library
 * @version 10.0.0
 * @description Enterprise-grade Supabase client with NASA 10/10 standards
 * @author ALSHAM Team
 * @license Proprietary
 */

// Contratos de Dados - Fonte da Verdade (Railway Production)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY

// =========================================================================
// 🏗️ SEÇÃO 2: ARQUITETURA MODULAR (PADRÃO SOLID)
// =========================================================================

/**
 * @class ConfigValidator
 * @description Validates configuration and environment variables
 */
class ConfigValidator {
  /**
   * Validates required environment variables
   * @returns {Object} Validation result
   */
  static validateEnvironment() {
    const missing = []
    
    if (!SUPABASE_URL) missing.push('VITE_SUPABASE_URL')
    if (!SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY')
    
    if (missing.length > 0) {
      return {
        valid: false,
        error: {
          message: '🚨 CRITICAL: Missing required environment variables',
          code: 'ENV_VALIDATION_FAILED',
          missing,
          expected: {
            VITE_SUPABASE_URL: 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co',
            VITE_SUPABASE_ANON_KEY: 'Your Supabase anon key'
          },
          timestamp: new Date().toISOString()
        }
      }
    }
    
    return { valid: true, error: null }
  }

  /**
   * Validates UUID format for security
   * @param {string} uuid - UUID to validate
   * @returns {boolean} Is valid UUID
   */
  static isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

/**
 * @class ErrorTracker
 * @description Structured error handling and logging
 */
class ErrorTracker {
  /**
   * Creates structured error object
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} context - Additional context
   * @returns {Object} Structured error
   */
  static createError(message, code = 'UNKNOWN_ERROR', context = {}) {
    return {
      message,
      code,
      context,
      timestamp: new Date().toISOString(),
      service: 'supabase-lib',
      version: '10.0.0',
      environment: import.meta.env.MODE || 'production'
    }
  }

  /**
   * Logs error with structured format
   * @param {Object} error - Error object
   * @param {string} operation - Operation that failed
   */
  static logError(error, operation) {
    console.error(`🚨 [${operation.toUpperCase()}] Error:`, {
      message: error.message,
      code: error.code,
      context: error.context,
      timestamp: error.timestamp,
      stack: error.stack
    })
  }

  /**
   * Logs successful operation
   * @param {string} operation - Operation name
   * @param {Object} context - Operation context
   */
  static logSuccess(operation, context = {}) {
    if (import.meta.env.DEV) {
      console.log(`✅ [${operation.toUpperCase()}] Success:`, {
        operation,
        context,
        timestamp: new Date().toISOString()
      })
    }
  }
}

/**
 * @class DataValidator
 * @description Validates data according to business rules
 */
class DataValidator {
  /**
   * Validates required parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object|null} Validation error or null
   */
  static validateRequired(params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined || value === '') {
        return ErrorTracker.createError(
          `${key} é obrigatório`,
          'MISSING_PARAMETER',
          { parameter: key, received: value }
        )
      }
    }
    return null
  }

  /**
   * Validates lead data structure
   * @param {Object} lead - Lead data
   * @returns {Object|null} Validation error or null
   */
  static validateLead(lead) {
    const required = this.validateRequired({ 
      nome: lead.nome, 
      email: lead.email 
    })
    if (required) return required

    if (!ConfigValidator.isValidEmail(lead.email)) {
      return ErrorTracker.createError(
        'Formato de email inválido',
        'INVALID_EMAIL',
        { email: lead.email }
      )
    }

    return null
  }

  /**
   * Validates organization ID
   * @param {string} orgId - Organization ID
   * @returns {Object|null} Validation error or null
   */
  static validateOrgId(orgId) {
    if (!orgId) {
      return ErrorTracker.createError(
        'Organization ID é obrigatório',
        'MISSING_ORG_ID'
      )
    }

    if (!ConfigValidator.isValidUUID(orgId)) {
      return ErrorTracker.createError(
        'Organization ID deve ser um UUID válido',
        'INVALID_ORG_ID',
        { orgId }
      )
    }

    return null
  }
}

/**
 * @class APIClient
 * @description Enterprise-grade API client with retry logic and caching
 */
class APIClient {
  constructor() {
    this.cache = new Map()
    this.requestQueue = []
    this.isProcessingQueue = false
    this.maxRetries = 3
    this.baseDelay = 1000
  }

  /**
   * Handles Supabase response with structured error handling
   * @param {*} data - Response data
   * @param {Object} error - Supabase error
   * @param {string} operation - Operation name
   * @param {Object} context - Additional context
   * @returns {Object} Standardized response
   */
  handleResponse(data, error, operation = 'operação', context = {}) {
    if (error) {
      const structuredError = ErrorTracker.createError(
        `Erro na ${operation}: ${error.message}`,
        'DATABASE_ERROR',
        { 
          operation, 
          supabaseError: error,
          context 
        }
      )
      
      ErrorTracker.logError(structuredError, operation)
      
      return { 
        data: null, 
        error: structuredError,
        success: false,
        metadata: {
          operation,
          timestamp: new Date().toISOString()
        }
      }
    }
    
    ErrorTracker.logSuccess(operation, { 
      recordCount: Array.isArray(data) ? data.length : 1,
      context 
    })
    
    return { 
      data, 
      error: null, 
      success: true,
      metadata: {
        operation,
        recordCount: Array.isArray(data) ? data.length : 1,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Executes operation with retry logic and exponential backoff
   * @param {Function} operation - Operation to execute
   * @param {string} operationName - Operation name for logging
   * @param {number} attempt - Current attempt number
   * @returns {Promise<Object>} Operation result
   */
  async executeWithRetry(operation, operationName, attempt = 1) {
    try {
      const result = await operation()
      return result
    } catch (error) {
      if (attempt >= this.maxRetries) {
        const finalError = ErrorTracker.createError(
          `Operação ${operationName} falhou após ${this.maxRetries} tentativas`,
          'MAX_RETRIES_EXCEEDED',
          { attempts: attempt, originalError: error.message }
        )
        
        ErrorTracker.logError(finalError, operationName)
        return { data: null, error: finalError, success: false }
      }

      const delay = this.baseDelay * Math.pow(2, attempt - 1)
      console.warn(`⚠️ Tentativa ${attempt} falhou para ${operationName}. Tentando novamente em ${delay}ms...`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.executeWithRetry(operation, operationName, attempt + 1)
    }
  }

  /**
   * Gets cached data or executes operation
   * @param {string} cacheKey - Cache key
   * @param {Function} operation - Operation to execute if not cached
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<*>} Cached or fresh data
   */
  async getCachedOrExecute(cacheKey, operation, ttl = 300000) { // 5 minutes default
    const cached = this.cache.get(cacheKey)
    
    if (cached && (Date.now() - cached.timestamp) < ttl) {
      ErrorTracker.logSuccess('cache-hit', { cacheKey })
      return cached.data
    }

    const result = await operation()
    
    if (result.success) {
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
    }

    return result
  }

  /**
   * Clears cache for specific key or all cache
   * @param {string} [key] - Specific key to clear
   */
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key)
      ErrorTracker.logSuccess('cache-clear', { key })
    } else {
      this.cache.clear()
      ErrorTracker.logSuccess('cache-clear-all')
    }
  }
}

/**
 * @class StateManager
 * @description Reactive state management with Observer pattern
 */
class StateManager {
  constructor() {
    this.state = {
      currentOrgId: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    }
    this.observers = []
  }

  /**
   * Subscribes to state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.observers.push(callback)
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback)
    }
  }

  /**
   * Updates state and notifies observers
   * @param {Object} newState - New state values
   */
  setState(newState) {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...newState }
    
    this.observers.forEach(callback => {
      try {
        callback(this.state, prevState)
      } catch (error) {
        ErrorTracker.logError(error, 'state-observer')
      }
    })
  }

  /**
   * Gets current state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state }
  }
}

// =========================================================================
// 🔧 SEÇÃO 3: INICIALIZAÇÃO E CONFIGURAÇÃO
// =========================================================================

// Validate environment on module load
const envValidation = ConfigValidator.validateEnvironment()
if (!envValidation.valid) {
  console.error(envValidation.error.message)
  console.error('Required variables:', envValidation.error.missing)
  console.error('Expected configuration:', envValidation.error.expected)
  throw new Error(envValidation.error.message)
}

// Initialize enterprise client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'alsham-360-prima@10.0.0',
      'X-Environment': import.meta.env.MODE || 'production',
      'X-Request-ID': () => crypto.randomUUID()
    }
  }
})

// Initialize singletons
const apiClient = new APIClient()
const stateManager = new StateManager()

// =========================================================================
// 🏢 SEÇÃO 4: ORGANIZATION MANAGEMENT - MULTI-TENANT SECURITY
// =========================================================================

/**
 * @class OrganizationManager
 * @description Manages multi-tenant organization context
 */
class OrganizationManager {
  /**
   * Gets current organization ID from secure storage
   * @returns {string|null} Organization ID or null
   */
  static getCurrentOrgId() {
    try {
      const orgId = localStorage.getItem('alsham_org_id')
      
      if (!orgId) {
        console.warn('⚠️ No organization selected - user must choose organization')
        return null
      }
      
      const validation = DataValidator.validateOrgId(orgId)
      if (validation) {
        ErrorTracker.logError(validation, 'get-org-id')
        localStorage.removeItem('alsham_org_id')
        return null
      }
      
      return orgId
    } catch (error) {
      ErrorTracker.logError(
        ErrorTracker.createError('Erro ao acessar localStorage', 'STORAGE_ERROR', { error: error.message }),
        'get-org-id'
      )
      return null
    }
  }

  /**
   * Sets current organization ID with validation
   * @param {string} orgId - Organization ID
   * @returns {boolean} Success status
   */
  static setCurrentOrgId(orgId) {
    const validation = DataValidator.validateOrgId(orgId)
    if (validation) {
      ErrorTracker.logError(validation, 'set-org-id')
      return false
    }

    try {
      localStorage.setItem('alsham_org_id', orgId)
      stateManager.setState({ currentOrgId: orgId })
      ErrorTracker.logSuccess('set-org-id', { orgId })
      return true
    } catch (error) {
      ErrorTracker.logError(
        ErrorTracker.createError('Erro ao salvar org_id', 'STORAGE_ERROR', { error: error.message }),
        'set-org-id'
      )
      return false
    }
  }

  /**
   * Clears organization context
   * @returns {boolean} Success status
   */
  static clearOrgId() {
    try {
      localStorage.removeItem('alsham_org_id')
      stateManager.setState({ currentOrgId: null })
      apiClient.clearCache() // Clear all cached data
      ErrorTracker.logSuccess('clear-org-id')
      return true
    } catch (error) {
      ErrorTracker.logError(
        ErrorTracker.createError('Erro ao limpar org_id', 'STORAGE_ERROR', { error: error.message }),
        'clear-org-id'
      )
      return false
    }
  }
}

// Export organization management functions
export const getCurrentOrgId = OrganizationManager.getCurrentOrgId
export const setCurrentOrgId = OrganizationManager.setCurrentOrgId
export const clearOrgId = OrganizationManager.clearOrgId

// =========================================================================
// 🎯 SEÇÃO 5: LEADS CRM - CORE BUSINESS LOGIC
// =========================================================================

/**
 * @class LeadsService
 * @description Enterprise-grade leads management service
 */
class LeadsService {
  /**
   * Retrieves leads with advanced filtering and caching
   * @param {string} [orgId] - Organization ID
   * @param {Object} [filters={}] - Filter options
   * @returns {Promise<Object>} Leads data with metadata
   */
  static async getLeads(orgId = getCurrentOrgId(), filters = {}) {
    const validation = DataValidator.validateOrgId(orgId)
    if (validation) return { data: null, error: validation, success: false }

    const cacheKey = `leads_${orgId}_${JSON.stringify(filters)}`
    
    return apiClient.getCachedOrExecute(cacheKey, async () => {
      return apiClient.executeWithRetry(async () => {
        let query = supabase
          .from('leads_crm')
          .select(`
            *,
            lead_sources(name, channel),
            user_profiles!leads_crm_owner_id_fkey(full_name, avatar_url)
          `)
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })

        // Apply real-world filters
        if (filters.status) query = query.eq('status', filters.status)
        if (filters.source) query = query.eq('origem', filters.source)
        if (filters.owner_id) query = query.eq('owner_id', filters.owner_id)
        if (filters.temperatura) query = query.eq('temperatura', filters.temperatura)
        if (filters.search) {
          query = query.or(`nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%,empresa.ilike.%${filters.search}%`)
        }
        if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
        if (filters.dateTo) query = query.lte('created_at', filters.dateTo)
        if (filters.limit) query = query.limit(filters.limit)
        if (filters.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
        }

        const { data, error } = await query
        return apiClient.handleResponse(data, error, 'busca de leads', { filters, orgId })
      }, 'get-leads')
    }, 300000) // 5 minutes cache
  }

  /**
   * Creates new lead with comprehensive validation
   * @param {Object} lead - Lead data
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<Object>} Created lead data
   */
  static async createLead(lead, orgId = getCurrentOrgId()) {
    const orgValidation = DataValidator.validateOrgId(orgId)
    if (orgValidation) return { data: null, error: orgValidation, success: false }

    const leadValidation = DataValidator.validateLead(lead)
    if (leadValidation) return { data: null, error: leadValidation, success: false }

    return apiClient.executeWithRetry(async () => {
      // Prepare sanitized payload
      const payload = { 
        ...lead, 
        org_id: orgId,
        status: lead.status || 'novo',
        temperatura: lead.temperatura || 'frio',
        score_ia: lead.score_ia || 0,
        consentimento: Boolean(lead.consentimento),
        consentimento_at: lead.consentimento ? new Date().toISOString() : null,
        // Sanitize inputs
        nome: lead.nome?.trim(),
        email: lead.email?.toLowerCase().trim(),
        empresa: lead.empresa?.trim(),
        telefone: lead.telefone?.replace(/\D/g, '') // Remove non-digits
      }

      const { data, error } = await supabase
        .from('leads_crm')
        .insert([payload])
        .select(`
          *,
          lead_sources(name, channel),
          user_profiles!leads_crm_owner_id_fkey(full_name, avatar_url)
        `)
        .single()

      // Clear cache on successful creation
      if (!error) {
        apiClient.clearCache(`leads_${orgId}`)
      }

      return apiClient.handleResponse(data, error, 'criação de lead', { leadData: payload })
    }, 'create-lead')
  }

  /**
   * Updates existing lead with security checks
   * @param {string} leadId - Lead ID
   * @param {Object} lead - Updated lead data
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<Object>} Updated lead data
   */
  static async updateLead(leadId, lead, orgId = getCurrentOrgId()) {
    const validation = DataValidator.validateRequired({ leadId, lead })
    if (validation) return { data: null, error: validation, success: false }

    const orgValidation = DataValidator.validateOrgId(orgId)
    if (orgValidation) return { data: null, error: orgValidation, success: false }

    return apiClient.executeWithRetry(async () => {
      // Remove protected fields to prevent tampering
      const { org_id, created_at, id, ...safeUpdates } = lead

      // Sanitize updates
      if (safeUpdates.nome) safeUpdates.nome = safeUpdates.nome.trim()
      if (safeUpdates.email) safeUpdates.email = safeUpdates.email.toLowerCase().trim()
      if (safeUpdates.empresa) safeUpdates.empresa = safeUpdates.empresa.trim()
      if (safeUpdates.telefone) safeUpdates.telefone = safeUpdates.telefone.replace(/\D/g, '')

      const { data, error } = await supabase
        .from('leads_crm')
        .update(safeUpdates)
        .eq('id', leadId)
        .eq('org_id', orgId) // Security: ensure org ownership
        .select(`
          *,
          lead_sources(name, channel),
          user_profiles!leads_crm_owner_id_fkey(full_name, avatar_url)
        `)
        .single()

      // Clear cache on successful update
      if (!error) {
        apiClient.clearCache(`leads_${orgId}`)
      }

      return apiClient.handleResponse(data, error, 'atualização de lead', { leadId, updates: safeUpdates })
    }, 'update-lead')
  }

  /**
   * Deletes lead with security validation
   * @param {string} leadId - Lead ID
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteLead(leadId, orgId = getCurrentOrgId()) {
    const validation = DataValidator.validateRequired({ leadId })
    if (validation) return { data: null, error: validation, success: false }

    const orgValidation = DataValidator.validateOrgId(orgId)
    if (orgValidation) return { data: null, error: orgValidation, success: false }

    return apiClient.executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('leads_crm')
        .delete()
        .eq('id', leadId)
        .eq('org_id', orgId) // Security: ensure org ownership
        .select()
        .single()

      // Clear cache on successful deletion
      if (!error) {
        apiClient.clearCache(`leads_${orgId}`)
      }

      return apiClient.handleResponse(data, error, 'exclusão de lead', { leadId })
    }, 'delete-lead')
  }

  /**
   * Retrieves single lead by ID with full details
   * @param {string} leadId - Lead ID
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<Object>} Lead data with interactions
   */
  static async getLeadById(leadId, orgId = getCurrentOrgId()) {
    const validation = DataValidator.validateRequired({ leadId })
    if (validation) return { data: null, error: validation, success: false }

    const orgValidation = DataValidator.validateOrgId(orgId)
    if (orgValidation) return { data: null, error: orgValidation, success: false }

    const cacheKey = `lead_${leadId}_${orgId}`

    return apiClient.getCachedOrExecute(cacheKey, async () => {
      return apiClient.executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('leads_crm')
          .select(`
            *,
            lead_sources(name, channel),
            user_profiles!leads_crm_owner_id_fkey(full_name, avatar_url),
            lead_interactions(
              id,
              interaction_type,
              interaction_data,
              duration_minutes,
              outcome,
              notes,
              created_at,
              user_profiles!lead_interactions_user_id_fkey(full_name, avatar_url)
            )
          `)
          .eq('id', leadId)
          .eq('org_id', orgId)
          .single()

        return apiClient.handleResponse(data, error, 'busca de lead por ID', { leadId })
      }, 'get-lead-by-id')
    }, 180000) // 3 minutes cache for individual leads
  }
}

// Export leads functions
export const getLeads = LeadsService.getLeads
export const createLead = LeadsService.createLead
export const updateLead = LeadsService.updateLead
export const deleteLead = LeadsService.deleteLead
export const getLeadById = LeadsService.getLeadById

// =========================================================================
// 🔄 SEÇÃO 6: LEAD INTERACTIONS - ACTIVITY TRACKING
// =========================================================================

/**
 * @class InteractionsService
 * @description Manages lead interactions and activity tracking
 */
class InteractionsService {
  /**
   * Retrieves lead interactions with caching
   * @param {string} leadId - Lead ID
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<Object>} Interactions data
   */
  static async getLeadInteractions(leadId, orgId = getCurrentOrgId()) {
    const validation = DataValidator.validateRequired({ leadId })
    if (validation) return { data: null, error: validation, success: false }

    const orgValidation = DataValidator.validateOrgId(orgId)
    if (orgValidation) return { data: null, error: orgValidation, success: false }

    const cacheKey = `interactions_${leadId}_${orgId}`

    return apiClient.getCachedOrExecute(cacheKey, async () => {
      return apiClient.executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('lead_interactions')
          .select(`
            *,
            user_profiles!lead_interactions_user_id_fkey(full_name, avatar_url)
          `)
          .eq('lead_id', leadId)
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })

        return apiClient.handleResponse(data, error, 'busca de interações', { leadId })
      }, 'get-lead-interactions')
    }, 180000) // 3 minutes cache
  }

  /**
   * Creates new lead interaction
   * @param {Object} interaction - Interaction data
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<Object>} Created interaction
   */
  static async createLeadInteraction(interaction, orgId = getCurrentOrgId()) {
    const validation = DataValidator.validateRequired({ interaction })
    if (validation) return { data: null, error: validation, success: false }

    const orgValidation = DataValidator.validateOrgId(orgId)
    if (orgValidation) return { data: null, error: orgValidation, success: false }

    if (!interaction.lead_id || !interaction.interaction_type) {
      return { 
        data: null, 
        error: ErrorTracker.createError(
          'lead_id e interaction_type são obrigatórios', 
          'BUSINESS_VALIDATION'
        ),
        success: false 
      }
    }

    return apiClient.executeWithRetry(async () => {
      const payload = { 
        ...interaction, 
        org_id: orgId,
        // Sanitize notes
        notes: interaction.notes?.trim()
      }

      const { data, error } = await supabase
        .from('lead_interactions')
        .insert([payload])
        .select(`
          *,
          user_profiles!lead_interactions_user_id_fkey(full_name, avatar_url)
        `)
        .single()

      // Clear related caches
      if (!error) {
        apiClient.clearCache(`interactions_${interaction.lead_id}_${orgId}`)
        apiClient.clearCache(`lead_${interaction.lead_id}_${orgId}`)
      }

      return apiClient.handleResponse(data, error, 'criação de interação', { interactionData: payload })
    }, 'create-lead-interaction')
  }
}

// Export interaction functions
export const getLeadInteractions = InteractionsService.getLeadInteractions
export const createLeadInteraction = InteractionsService.createLeadInteraction

// =========================================================================
// 🎯 SEÇÃO 7: SALES OPPORTUNITIES - PIPELINE MANAGEMENT
// =========================================================================

/**
 * @class OpportunitiesService
 * @description Manages sales opportunities and pipeline
 */
class OpportunitiesService {
  /**
   * Retrieves sales opportunities with filtering
   * @param {string} [orgId] - Organization ID
   * @param {Object} [filters={}] - Filter options
   * @returns {Promise<Object>} Opportunities data
   */
  static async getSalesOpportunities(orgId = getCurrentOrgId(), filters = {}) {
    const orgValidation = DataValidator.validateOrgId(orgId)
    if (orgValidation) return { data: null, error: orgValidation, success: false }

    const cacheKey = `opportunities_${orgId}_${JSON.stringify(filters)}`

    return apiClient.getCachedOrExecute(cacheKey, async () => {
      return apiClient.executeWithRetry(async () => {
        let query = supabase
          .from('sales_opportunities')
          .select(`
            *,
            leads_crm!sales_opportunities_lead_id_fkey(nome, email, empresa),
            user_profiles!sales_opportunities_owner_id_fkey(full_name, avatar_url)
          `)
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })

        // Apply filters
        if (filters.etapa) query = query.eq('etapa', filters.etapa)
        if (filters.owner_id) query = query.eq('owner_id', filters.owner_id)
        if (filters.minValue) query = query.gte('valor', filters.minValue)
        if (filters.maxValue) query = query.lte('valor', filters.maxValue)
        if (filters.limit) query = query.limit(filters.limit)

        const { data, error } = await query
        return apiClient.handleResponse(data, error, 'busca de oportunidades', { filters })
      }, 'get-sales-opportunities')
    }, 300000) // 5 minutes cache
  }

  /**
   * Creates new sales opportunity
   * @param {Object} opportunity - Opportunity data
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<Object>} Created opportunity
   */
  static async createSalesOpportunity(opportunity, orgId = getCurrentOrgId()) {
    const validation = DataValidator.validateRequired({ opportunity })
    if (validation) return { data: null, error: validation, success: false }

    const orgValidation = DataValidator.validateOrgId(orgId)
    if (orgValidation) return { data: null, error: orgValidation, success: false }

    if (!opportunity.titulo || !opportunity.valor) {
      return { 
        data: null, 
        error: ErrorTracker.createError(
          'Título e valor são obrigatórios', 
          'BUSINESS_VALIDATION'
        ),
        success: false 
      }
    }

    return apiClient.executeWithRetry(async () => {
      const payload = { 
        ...opportunity, 
        org_id: orgId,
        etapa: opportunity.etapa || 'prospeccao',
        // Sanitize title
        titulo: opportunity.titulo?.trim()
      }

      const { data, error } = await supabase
        .from('sales_opportunities')
        .insert([payload])
        .select(`
          *,
          leads_crm!sales_opportunities_lead_id_fkey(nome, email, empresa),
          user_profiles!sales_opportunities_owner_id_fkey(full_name, avatar_url)
        `)
        .single()

      // Clear cache on successful creation
      if (!error) {
        apiClient.clearCache(`opportunities_${orgId}`)
      }

      return apiClient.handleResponse(data, error, 'criação de oportunidade', { opportunityData: payload })
    }, 'create-sales-opportunity')
  }
}

// Export opportunities functions
export const getSalesOpportunities = OpportunitiesService.getSalesOpportunities
export const createSalesOpportunity = OpportunitiesService.createSalesOpportunity

// =========================================================================
// 🏢 SEÇÃO 8: ORGANIZATIONS - MULTI-TENANT MANAGEMENT
// =========================================================================

/**
 * @class OrganizationsService
 * @description Manages organizations and user associations
 */
class OrganizationsService {
  /**
   * Creates new organization
   * @param {Object} org - Organization data
   * @returns {Promise<Object>} Created organization
   */
  static async createOrganization(org) {
    const validation = DataValidator.validateRequired({ org })
    if (validation) return { data: null, error: validation, success: false }

    if (!org.name) {
      return { 
        data: null, 
        error: ErrorTracker.createError(
          'Nome da organização é obrigatório', 
          'BUSINESS_VALIDATION'
        ),
        success: false 
      }
    }

    return apiClient.executeWithRetry(async () => {
      const payload = { 
        ...org,
        // Sanitize name
        name: org.name?.trim()
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert([payload])
        .select()
        .single()

      return apiClient.handleResponse(data, error, 'criação de organização', { orgData: payload })
    }, 'create-organization')
  }

  /**
   * Retrieves user organizations
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User organizations
   */
  static async getUserOrganizations(userId) {
    const validation = DataValidator.validateRequired({ userId })
    if (validation) return { data: null, error: validation, success: false }

    const cacheKey = `user_orgs_${userId}`

    return apiClient.getCachedOrExecute(cacheKey, async () => {
      return apiClient.executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('user_organizations')
          .select(`
            *,
            organizations(id, name, created_at)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        return apiClient.handleResponse(data, error, 'busca de organizações do usuário', { userId })
      }, 'get-user-organizations')
    }, 600000) // 10 minutes cache for user orgs
  }
}

// Export organization functions
export const createOrganization = OrganizationsService.createOrganization
export const getUserOrganizations = OrganizationsService.getUserOrganizations

// =========================================================================
// 👥 SEÇÃO 9: USER PROFILES - USER MANAGEMENT
// =========================================================================

/**
 * @class UserProfilesService
 * @description Manages user profiles and authentication
 */
class UserProfilesService {
  /**
   * Retrieves user profiles for organization
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<Object>} User profiles
   */
  static async getUserProfiles(orgId = getCurrentOrgId()) {
    const orgValidation = DataValidator.validateOrgId(orgId)
    if (orgValidation) return { data: null, error: orgValidation, success: false }

    const cacheKey = `user_profiles_${orgId}`

    return apiClient.getCachedOrExecute(cacheKey, async () => {
      return apiClient.executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('user_organizations')
          .select(`
            user_profiles(
              id,
              full_name,
              avatar_url,
              email,
              role,
              created_at
            )
          `)
          .eq('org_id', orgId)

        return apiClient.handleResponse(data, error, 'busca de perfis de usuário', { orgId })
      }, 'get-user-profiles')
    }, 600000) // 10 minutes cache
  }

  /**
   * Updates user profile
   * @param {string} userId - User ID
   * @param {Object} profile - Profile data
   * @returns {Promise<Object>} Updated profile
   */
  static async updateUserProfile(userId, profile) {
    const validation = DataValidator.validateRequired({ userId, profile })
    if (validation) return { data: null, error: validation, success: false }

    return apiClient.executeWithRetry(async () => {
      // Remove protected fields
      const { id, created_at, ...safeUpdates } = profile

      // Sanitize updates
      if (safeUpdates.full_name) safeUpdates.full_name = safeUpdates.full_name.trim()
      if (safeUpdates.email) safeUpdates.email = safeUpdates.email.toLowerCase().trim()

      const { data, error } = await supabase
        .from('user_profiles')
        .update(safeUpdates)
        .eq('id', userId)
        .select()
        .single()

      // Clear related caches
      if (!error) {
        apiClient.clearCache() // Clear all user-related caches
      }

      return apiClient.handleResponse(data, error, 'atualização de perfil', { userId, updates: safeUpdates })
    }, 'update-user-profile')
  }
}

// Export user profile functions
export const getUserProfiles = UserProfilesService.getUserProfiles
export const updateUserProfile = UserProfilesService.updateUserProfile

// =========================================================================
// 🔐 SEÇÃO 10: AUTHENTICATION - SECURE AUTH MANAGEMENT
// =========================================================================

/**
 * @class AuthService
 * @description Handles authentication with enterprise security
 */
class AuthService {
  /**
   * Signs in user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result
   */
  static async signIn(email, password) {
    const validation = DataValidator.validateRequired({ email, password })
    if (validation) return { data: null, error: validation, success: false }

    if (!ConfigValidator.isValidEmail(email)) {
      return {
        data: null,
        error: ErrorTracker.createError('Formato de email inválido', 'INVALID_EMAIL'),
        success: false
      }
    }

    return apiClient.executeWithRetry(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (!error && data.user) {
        stateManager.setState({ 
          user: data.user, 
          isAuthenticated: true 
        })
        ErrorTracker.logSuccess('sign-in', { userId: data.user.id })
      }

      return apiClient.handleResponse(data, error, 'login', { email })
    }, 'sign-in')
  }

  /**
   * Signs up new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} [metadata={}] - Additional user metadata
   * @returns {Promise<Object>} Registration result
   */
  static async signUp(email, password, metadata = {}) {
    const validation = DataValidator.validateRequired({ email, password })
    if (validation) return { data: null, error: validation, success: false }

    if (!ConfigValidator.isValidEmail(email)) {
      return {
        data: null,
        error: ErrorTracker.createError('Formato de email inválido', 'INVALID_EMAIL'),
        success: false
      }
    }

    if (password.length < 8) {
      return {
        data: null,
        error: ErrorTracker.createError('Senha deve ter pelo menos 8 caracteres', 'WEAK_PASSWORD'),
        success: false
      }
    }

    return apiClient.executeWithRetry(async () => {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            ...metadata,
            full_name: metadata.full_name?.trim()
          }
        }
      })

      return apiClient.handleResponse(data, error, 'registro', { email })
    }, 'sign-up')
  }

  /**
   * Signs out current user
   * @returns {Promise<Object>} Sign out result
   */
  static async signOut() {
    return apiClient.executeWithRetry(async () => {
      const { error } = await supabase.auth.signOut()

      if (!error) {
        stateManager.setState({ 
          user: null, 
          isAuthenticated: false,
          currentOrgId: null
        })
        OrganizationManager.clearOrgId()
        apiClient.clearCache()
        ErrorTracker.logSuccess('sign-out')
      }

      return apiClient.handleResponse(null, error, 'logout')
    }, 'sign-out')
  }

  /**
   * Gets current session
   * @returns {Promise<Object>} Current session
   */
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session) {
        stateManager.setState({ 
          user: session.user, 
          isAuthenticated: true 
        })
      }

      return apiClient.handleResponse(session, error, 'verificação de sessão')
    } catch (error) {
      return apiClient.handleResponse(null, error, 'verificação de sessão')
    }
  }

  /**
   * Resets user password
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset result
   */
  static async resetPassword(email) {
    const validation = DataValidator.validateRequired({ email })
    if (validation) return { data: null, error: validation, success: false }

    if (!ConfigValidator.isValidEmail(email)) {
      return {
        data: null,
        error: ErrorTracker.createError('Formato de email inválido', 'INVALID_EMAIL'),
        success: false
      }
    }

    return apiClient.executeWithRetry(async () => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      )

      return apiClient.handleResponse(data, error, 'reset de senha', { email })
    }, 'reset-password')
  }
}

// Export auth functions
export const signIn = AuthService.signIn
export const signUp = AuthService.signUp
export const signOut = AuthService.signOut
export const getSession = AuthService.getSession
export const resetPassword = AuthService.resetPassword

// =========================================================================
// 📊 SEÇÃO 11: HEALTH CHECK & MONITORING
// =========================================================================

/**
 * @class HealthService
 * @description System health monitoring and diagnostics
 */
class HealthService {
  /**
   * Performs comprehensive health check
   * @returns {Promise<Object>} Health status
   */
  static async healthCheck() {
    const startTime = Date.now()
    const checks = {
      database: false,
      auth: false,
      environment: false,
      cache: false
    }

    try {
      // Environment check
      checks.environment = ConfigValidator.validateEnvironment().valid

      // Database connectivity check
      try {
        const { error } = await supabase.from('organizations').select('id').limit(1)
        checks.database = !error
      } catch (error) {
        checks.database = false
      }

      // Auth service check
      try {
        await supabase.auth.getSession()
        checks.auth = true
      } catch (error) {
        checks.auth = false
      }

      // Cache check
      checks.cache = apiClient.cache instanceof Map

      const responseTime = Date.now() - startTime
      const allHealthy = Object.values(checks).every(check => check === true)

      const healthData = {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        responseTime,
        checks,
        version: '10.0.0',
        environment: import.meta.env.MODE || 'production'
      }

      ErrorTracker.logSuccess('health-check', healthData)
      return { data: healthData, error: null, success: true }

    } catch (error) {
      const healthError = ErrorTracker.createError(
        'Health check failed',
        'HEALTH_CHECK_ERROR',
        { error: error.message, checks }
      )

      return { data: null, error: healthError, success: false }
    }
  }

  /**
   * Gets system metrics
   * @returns {Object} System metrics
   */
  static getMetrics() {
    return {
      cacheSize: apiClient.cache.size,
      stateObservers: stateManager.observers.length,
      currentState: stateManager.getState(),
      timestamp: new Date().toISOString()
    }
  }
}

// Export health functions
export const healthCheck = HealthService.healthCheck
export const getMetrics = HealthService.getMetrics

// =========================================================================
// 🎯 SEÇÃO 12: EXPORTS & INITIALIZATION
// =========================================================================

// Export core instances for advanced usage
export { supabase, apiClient, stateManager }

// Export utility classes for extension
export { 
  ConfigValidator, 
  ErrorTracker, 
  DataValidator, 
  APIClient, 
  StateManager 
}

// Initialize auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  stateManager.setState({
    user: session?.user || null,
    isAuthenticated: !!session?.user
  })

  ErrorTracker.logSuccess('auth-state-change', { event, userId: session?.user?.id })
})

// Log successful initialization
ErrorTracker.logSuccess('supabase-lib-initialization', {
  version: '10.0.0',
  environment: import.meta.env.MODE || 'production',
  url: SUPABASE_URL
})

console.log('🚀 ALSHAM 360° PRIMA Supabase Library v10.0.0 initialized successfully')
console.log('📊 NASA 10/10 Enterprise Standards: ✅ Active')
console.log('🔐 Multi-tenant Security: ✅ Enabled')
console.log('⚡ Performance Optimization: ✅ Active')
console.log('🛡️ Error Handling: ✅ Enterprise Grade')

