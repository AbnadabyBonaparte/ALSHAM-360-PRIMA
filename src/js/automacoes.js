/**
 * ALSHAM 360° PRIMA - Enterprise Automation System
 * Production-ready automation platform with advanced features
 * 
 * @version 2.0.0
 * @author ALSHAM Development Team
 * @license MIT
 */

import { 
    getCurrentUser,
    getAutomationRules,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    getAutomationExecutions,
    getWorkflowLogs,
    getEmailCampaigns,
    getSMSCampaigns,
    getNotificationLogs,
    getCommunicationTemplates,
    getMessageQueue,
    getN8NWorkflows,
    getWhatsappIntegration
} from '../lib/supabase.js';

// ===== TYPE DEFINITIONS (TypeScript-like) =====
/**
 * @typedef {Object} AutomationRule
 * @property {string} id - Unique identifier
 * @property {string} name - Rule name
 * @property {string} description - Rule description
 * @property {string} type - Automation type
 * @property {string} status - Current status
 * @property {boolean} is_active - Active state
 * @property {number} execution_count - Number of executions
 * @property {Object} conditions - Trigger conditions
 * @property {Object} actions - Actions to execute
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} ExecutionHistory
 * @property {string} id - Execution ID
 * @property {string} automation_id - Related automation ID
 * @property {string} status - Execution status
 * @property {string} started_at - Start timestamp
 * @property {string} completed_at - Completion timestamp
 * @property {number} execution_time_ms - Duration in milliseconds
 * @property {Object} result - Execution result
 * @property {string} error_message - Error details if failed
 */

// ===== ENTERPRISE STATE MANAGEMENT =====
class AutomationStateManager {
    constructor() {
        this.state = {
            // Core data
            user: null,
            profile: null,
            orgId: null,
            
            // Automation data
            automations: new Map(),
            executionHistory: new Map(),
            templates: new Map(),
            campaigns: {
                email: new Map(),
                sms: new Map(),
                whatsapp: new Map()
            },
            workflows: new Map(),
            
            // Real-time metrics
            metrics: {
                totalExecutions: 0,
                successRate: 0,
                activeAutomations: 0,
                executionsToday: 0,
                totalLeadsProcessed: 0,
                conversionRate: 0,
                avgExecutionTime: 0,
                errorRate: 0
            },
            
            // UI state
            filters: {
                status: 'all',
                type: 'all',
                period: '7d',
                search: ''
            },
            sorting: {
                field: 'updated_at',
                direction: 'desc'
            },
            pagination: {
                currentPage: 1,
                itemsPerPage: 20,
                totalItems: 0
            },
            
            // System state
            isLoading: false,
            isRefreshing: false,
            error: null,
            lastUpdate: null,
            selectedItems: new Set(),
            
            // Feature flags
            features: {
                realTimeUpdates: true,
                bulkOperations: true,
                advancedAnalytics: true,
                a11yMode: false
            }
        };
        
        this.subscribers = new Set();
        this.analytics = new AnalyticsTracker();
        this.cache = new CacheManager();
        this.validator = new DataValidator();
    }
    
    /**
     * Subscribe to state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    
    /**
     * Update state and notify subscribers
     * @param {Object} updates - State updates
     */
    setState(updates) {
        const prevState = structuredClone(this.state);
        this.state = { ...this.state, ...updates };
        
        // Notify subscribers
        this.subscribers.forEach(callback => {
            try {
                callback(this.state, prevState);
            } catch (error) {
                console.error('State subscriber error:', error);
            }
        });
        
        // Track analytics
        this.analytics.trackStateChange(updates);
    }
    
    /**
     * Get current state (immutable)
     * @returns {Object} Current state
     */
    getState() {
        return structuredClone(this.state);
    }
    
    /**
     * Reset state to initial values
     */
    reset() {
        this.state.automations.clear();
        this.state.executionHistory.clear();
        this.state.templates.clear();
        this.state.selectedItems.clear();
        this.setState({
            isLoading: false,
            error: null,
            lastUpdate: null
        });
    }
}

// ===== ENTERPRISE CONFIGURATION =====
const ENTERPRISE_CONFIG = Object.freeze({
    // Performance settings
    PERFORMANCE: {
        DEBOUNCE_DELAY: 300,
        REFRESH_INTERVAL: 30000,
        CACHE_TTL: 300000,
        MAX_CONCURRENT_REQUESTS: 5,
        VIRTUAL_SCROLL_THRESHOLD: 100
    },
    
    // Security settings
    SECURITY: {
        MAX_RETRY_ATTEMPTS: 3,
        SESSION_TIMEOUT: 3600000,
        ENCRYPTION_ALGORITHM: 'AES-GCM',
        CSP_NONCE_LENGTH: 32
    },
    
    // Automation configuration
    AUTOMATION: {
        TYPES: Object.freeze([
            { 
                value: 'lead_nurturing', 
                label: 'Nutrição de Leads', 
                icon: '🌱', 
                color: 'emerald',
                category: 'marketing',
                complexity: 'intermediate'
            },
            { 
                value: 'email_sequence', 
                label: 'Sequência de Email', 
                icon: '📧', 
                color: 'blue',
                category: 'communication',
                complexity: 'basic'
            },
            { 
                value: 'sms_campaign', 
                label: 'Campanha SMS', 
                icon: '📱', 
                color: 'purple',
                category: 'communication',
                complexity: 'basic'
            },
            { 
                value: 'whatsapp_flow', 
                label: 'Fluxo WhatsApp', 
                icon: '💬', 
                color: 'green',
                category: 'communication',
                complexity: 'intermediate'
            },
            { 
                value: 'lead_scoring', 
                label: 'Pontuação de Leads', 
                icon: '⭐', 
                color: 'yellow',
                category: 'analytics',
                complexity: 'advanced'
            },
            { 
                value: 'follow_up', 
                label: 'Follow-up Automático', 
                icon: '🔄', 
                color: 'orange',
                category: 'sales',
                complexity: 'intermediate'
            },
            { 
                value: 'task_creation', 
                label: 'Criação de Tarefas', 
                icon: '📋', 
                color: 'gray',
                category: 'productivity',
                complexity: 'basic'
            },
            { 
                value: 'notification', 
                label: 'Notificações', 
                icon: '🔔', 
                color: 'red',
                category: 'system',
                complexity: 'basic'
            }
        ]),
        
        STATUS_OPTIONS: Object.freeze([
            { value: 'active', label: 'Ativo', color: 'green', icon: '✅' },
            { value: 'paused', label: 'Pausado', color: 'yellow', icon: '⏸️' },
            { value: 'draft', label: 'Rascunho', color: 'gray', icon: '📝' },
            { value: 'error', label: 'Erro', color: 'red', icon: '❌' },
            { value: 'testing', label: 'Teste', color: 'blue', icon: '🧪' }
        ]),
        
        TRIGGER_TYPES: Object.freeze([
            { value: 'lead_created', label: 'Lead Criado', icon: '👤', category: 'event' },
            { value: 'lead_updated', label: 'Lead Atualizado', icon: '✏️', category: 'event' },
            { value: 'email_opened', label: 'Email Aberto', icon: '📖', category: 'engagement' },
            { value: 'link_clicked', label: 'Link Clicado', icon: '🔗', category: 'engagement' },
            { value: 'form_submitted', label: 'Formulário Enviado', icon: '📝', category: 'action' },
            { value: 'time_based', label: 'Baseado em Tempo', icon: '⏰', category: 'schedule' },
            { value: 'score_threshold', label: 'Limite de Pontuação', icon: '🎯', category: 'condition' },
            { value: 'webhook', label: 'Webhook', icon: '🔌', category: 'integration' }
        ])
    },
    
    // UI configuration
    UI: {
        THEMES: {
            light: {
                primary: 'blue',
                success: 'emerald',
                warning: 'amber',
                danger: 'red',
                info: 'cyan'
            },
            dark: {
                primary: 'blue',
                success: 'emerald', 
                warning: 'amber',
                danger: 'red',
                info: 'cyan'
            }
        },
        
        STATIC_STYLES: Object.freeze({
            // Status badges
            active: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
            paused: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
            error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
            testing: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
            
            // Execution status
            completed: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
            success: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
            failed: { bg: 'bg-red-100', text: 'text-red-800' },
            running: { bg: 'bg-blue-100', text: 'text-blue-800' },
            pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
            
            // Type colors
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: 'bg-emerald-500' },
            blue: { bg: 'bg-blue-50', text: 'text-blue-700', accent: 'bg-blue-500' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-700', accent: 'bg-purple-500' },
            green: { bg: 'bg-green-50', text: 'text-green-700', accent: 'bg-green-500' },
            yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', accent: 'bg-yellow-500' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-700', accent: 'bg-orange-500' },
            gray: { bg: 'bg-gray-50', text: 'text-gray-700', accent: 'bg-gray-500' },
            red: { bg: 'bg-red-50', text: 'text-red-700', accent: 'bg-red-500' }
        })
    }
});

// ===== ENTERPRISE UTILITIES =====

/**
 * Enterprise Analytics Tracker
 */
class AnalyticsTracker {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
    }
    
    /**
     * Track user interaction
     * @param {string} action - Action name
     * @param {Object} properties - Event properties
     */
    track(action, properties = {}) {
        const event = {
            id: this.generateEventId(),
            sessionId: this.sessionId,
            action,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                referrer: document.referrer
            }
        };
        
        this.events.push(event);
        
        // Send to analytics service (implement as needed)
        this.sendToAnalytics(event);
        
        console.log('📊 Analytics:', action, properties);
    }
    
    /**
     * Track state changes
     * @param {Object} updates - State updates
     */
    trackStateChange(updates) {
        this.track('state_change', {
            updates: Object.keys(updates),
            timestamp: Date.now()
        });
    }
    
    /**
     * Track performance metrics
     * @param {string} operation - Operation name
     * @param {number} duration - Duration in milliseconds
     */
    trackPerformance(operation, duration) {
        this.track('performance', {
            operation,
            duration,
            category: 'timing'
        });
    }
    
    /**
     * Generate unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Generate unique event ID
     * @returns {string} Event ID
     */
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Send event to analytics service
     * @param {Object} event - Event data
     */
    async sendToAnalytics(event) {
        try {
            // Implement analytics service integration
            // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
        } catch (error) {
            console.warn('Analytics sending failed:', error);
        }
    }
    
    /**
     * Get session summary
     * @returns {Object} Session analytics
     */
    getSessionSummary() {
        return {
            sessionId: this.sessionId,
            duration: Date.now() - this.startTime,
            eventCount: this.events.length,
            actions: [...new Set(this.events.map(e => e.action))]
        };
    }
}

/**
 * Enterprise Cache Manager
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.timestamps = new Map();
        this.ttl = ENTERPRISE_CONFIG.PERFORMANCE.CACHE_TTL;
    }
    
    /**
     * Set cache value
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} customTTL - Custom TTL in milliseconds
     */
    set(key, value, customTTL = this.ttl) {
        this.cache.set(key, value);
        this.timestamps.set(key, Date.now() + customTTL);
    }
    
    /**
     * Get cache value
     * @param {string} key - Cache key
     * @returns {*} Cached value or undefined
     */
    get(key) {
        const timestamp = this.timestamps.get(key);
        if (!timestamp || Date.now() > timestamp) {
            this.delete(key);
            return undefined;
        }
        return this.cache.get(key);
    }
    
    /**
     * Delete cache entry
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.timestamps.delete(key);
    }
    
    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.timestamps.clear();
    }
    
    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, timestamp] of this.timestamps.entries()) {
            if (now > timestamp) {
                this.delete(key);
            }
        }
    }
}

/**
 * Enterprise Data Validator
 */
class DataValidator {
    /**
     * Validate automation rule data
     * @param {Object} data - Automation data
     * @returns {Object} Validation result
     */
    validateAutomationRule(data) {
        const errors = [];
        
        if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
            errors.push('Nome deve ter pelo menos 3 caracteres');
        }
        
        if (!data.type || !ENTERPRISE_CONFIG.AUTOMATION.TYPES.find(t => t.value === data.type)) {
            errors.push('Tipo de automação inválido');
        }
        
        if (data.conditions && typeof data.conditions !== 'object') {
            errors.push('Condições devem ser um objeto válido');
        }
        
        if (data.actions && !Array.isArray(data.actions)) {
            errors.push('Ações devem ser um array válido');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Sanitize HTML content
     * @param {string} html - HTML string
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml(html) {
        if (typeof html !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }
    
    /**
     * Validate email address
     * @param {string} email - Email address
     * @returns {boolean} Is valid email
     */
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    /**
     * Validate URL
     * @param {string} url - URL string
     * @returns {boolean} Is valid URL
     */
    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Enterprise Error Handler
 */
class ErrorHandler {
    constructor() {
        this.errors = new Map();
        this.setupGlobalHandlers();
    }
    
    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'global');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'promise');
        });
    }
    
    /**
     * Handle error with context
     * @param {Error} error - Error object
     * @param {string} context - Error context
     * @param {Object} metadata - Additional metadata
     */
    handleError(error, context = 'unknown', metadata = {}) {
        const errorId = this.generateErrorId();
        const errorData = {
            id: errorId,
            message: error.message || error,
            stack: error.stack,
            context,
            metadata,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errors.set(errorId, errorData);
        
        // Log to console
        console.error(`[${context}] Error ${errorId}:`, error, metadata);
        
        // Send to error reporting service
        this.reportError(errorData);
        
        // Show user-friendly notification
        this.showErrorNotification(error, context);
    }
    
    /**
     * Generate unique error ID
     * @returns {string} Error ID
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Report error to external service
     * @param {Object} errorData - Error data
     */
    async reportError(errorData) {
        try {
            // Implement error reporting service
            // await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) });
        } catch (reportingError) {
            console.warn('Error reporting failed:', reportingError);
        }
    }
    
    /**
     * Show user-friendly error notification
     * @param {Error} error - Error object
     * @param {string} context - Error context
     */
    showErrorNotification(error, context) {
        const message = this.getUserFriendlyMessage(error, context);
        NotificationManager.getInstance().show(message, 'error');
    }
    
    /**
     * Get user-friendly error message
     * @param {Error} error - Error object
     * @param {string} context - Error context
     * @returns {string} User-friendly message
     */
    getUserFriendlyMessage(error, context) {
        const commonErrors = {
            'network': 'Problema de conexão. Verifique sua internet.',
            'authentication': 'Sua sessão expirou. Faça login novamente.',
            'validation': 'Dados inválidos. Verifique os campos preenchidos.',
            'permission': 'Você não tem permissão para esta ação.',
            'not_found': 'Recurso não encontrado.',
            'server': 'Erro interno do servidor. Tente novamente.'
        };
        
        if (error.message?.includes('network')) return commonErrors.network;
        if (error.message?.includes('auth')) return commonErrors.authentication;
        if (error.message?.includes('permission')) return commonErrors.permission;
        if (error.message?.includes('404')) return commonErrors.not_found;
        if (error.message?.includes('500')) return commonErrors.server;
        
        return commonErrors[context] || 'Ocorreu um erro inesperado. Tente novamente.';
    }
}

/**
 * Enterprise Notification Manager
 */
class NotificationManager {
    static instance = null;
    
    constructor() {
        if (NotificationManager.instance) {
            return NotificationManager.instance;
        }
        
        this.notifications = new Map();
        this.container = this.createContainer();
        NotificationManager.instance = this;
    }
    
    static getInstance() {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }
    
    /**
     * Create notification container
     * @returns {HTMLElement} Container element
     */
    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-label', 'Notificações');
            document.body.appendChild(container);
        }
        return container;
    }
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     * @param {number} duration - Auto-dismiss duration
     * @param {Object} options - Additional options
     * @returns {string} Notification ID
     */
    show(message, type = 'info', duration = 5000, options = {}) {
        const id = this.generateId();
        const notification = this.createNotification(id, message, type, duration, options);
        
        this.notifications.set(id, notification);
        this.container.appendChild(notification.element);
        
        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }
        
        // Announce to screen readers
        this.announceToScreenReader(message, type);
        
        return id;
    }
    
    /**
     * Create notification element
     * @param {string} id - Notification ID
     * @param {string} message - Message text
     * @param {string} type - Notification type
     * @param {number} duration - Duration
     * @param {Object} options - Options
     * @returns {Object} Notification object
     */
    createNotification(id, message, type, duration, options) {
        const typeConfig = {
            success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: '✅' },
            error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '❌' },
            warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: '⚠️' },
            info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'ℹ️' }
        };
        
        const config = typeConfig[type] || typeConfig.info;
        
        const element = document.createElement('div');
        element.id = `notification-${id}`;
        element.className = `
            ${config.bg} ${config.border} ${config.text}
            border rounded-lg p-4 shadow-lg transform transition-all duration-300
            min-w-80 max-w-md opacity-0 translate-x-full
        `;
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-live', 'polite');
        
        element.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <span class="text-lg" role="img" aria-label="${type}">${config.icon}</span>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium">${this.sanitizeText(message)}</p>
                    ${options.description ? `<p class="mt-1 text-sm opacity-75">${this.sanitizeText(options.description)}</p>` : ''}
                </div>
                <div class="ml-4 flex-shrink-0">
                    <button 
                        type="button" 
                        class="inline-flex rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        onclick="window.notificationManager?.dismiss('${id}')"
                        aria-label="Fechar notificação"
                    >
                        <span class="sr-only">Fechar</span>
                        <span class="text-lg">×</span>
                    </button>
                </div>
            </div>
            ${duration > 0 ? `
                <div class="mt-2 h-1 bg-black bg-opacity-10 rounded-full overflow-hidden">
                    <div class="h-full bg-current opacity-50 transition-all duration-${duration} ease-linear w-full"></div>
                </div>
            ` : ''}
        `;
        
        // Animate in
        requestAnimationFrame(() => {
            element.classList.remove('opacity-0', 'translate-x-full');
        });
        
        return {
            id,
            element,
            type,
            message,
            createdAt: Date.now()
        };
    }
    
    /**
     * Dismiss notification
     * @param {string} id - Notification ID
     */
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        // Animate out
        notification.element.classList.add('opacity-0', 'translate-x-full');
        
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(id);
        }, 300);
    }
    
    /**
     * Clear all notifications
     */
    clear() {
        this.notifications.forEach((_, id) => this.dismiss(id));
    }
    
    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Sanitize text content
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Announce to screen readers
     * @param {string} message - Message to announce
     * @param {string} type - Message type
     */
    announceToScreenReader(message, type) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `${type}: ${message}`;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

/**
 * Enterprise Performance Monitor
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
        this.setupObservers();
    }
    
    /**
     * Setup performance observers
     */
    setupObservers() {
        if ('PerformanceObserver' in window) {
            // Long task observer
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.recordMetric('long_task', {
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.push(longTaskObserver);
            } catch (e) {
                console.warn('Long task observer not supported');
            }
            
            // Layout shift observer
            try {
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            this.recordMetric('layout_shift', {
                                value: entry.value,
                                startTime: entry.startTime
                            });
                        }
                    }
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.push(clsObserver);
            } catch (e) {
                console.warn('Layout shift observer not supported');
            }
        }
    }
    
    /**
     * Start timing an operation
     * @param {string} name - Operation name
     * @returns {Function} End timing function
     */
    startTiming(name) {
        const startTime = performance.now();
        return () => {
            const duration = performance.now() - startTime;
            this.recordMetric('timing', { name, duration, startTime });
            return duration;
        };
    }
    
    /**
     * Record performance metric
     * @param {string} type - Metric type
     * @param {Object} data - Metric data
     */
    recordMetric(type, data) {
        const metric = {
            type,
            data,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        if (!this.metrics.has(type)) {
            this.metrics.set(type, []);
        }
        
        this.metrics.get(type).push(metric);
        
        // Keep only last 100 metrics per type
        const typeMetrics = this.metrics.get(type);
        if (typeMetrics.length > 100) {
            typeMetrics.splice(0, typeMetrics.length - 100);
        }
        
        // Report to analytics
        if (window.analytics) {
            window.analytics.trackPerformance(type, data);
        }
    }
    
    /**
     * Get performance summary
     * @returns {Object} Performance summary
     */
    getSummary() {
        const summary = {};
        
        for (const [type, metrics] of this.metrics.entries()) {
            if (type === 'timing') {
                const durations = metrics.map(m => m.data.duration);
                summary[type] = {
                    count: durations.length,
                    avg: durations.reduce((a, b) => a + b, 0) / durations.length || 0,
                    min: Math.min(...durations) || 0,
                    max: Math.max(...durations) || 0
                };
            } else {
                summary[type] = {
                    count: metrics.length,
                    latest: metrics[metrics.length - 1]?.data
                };
            }
        }
        
        return summary;
    }
    
    /**
     * Cleanup observers
     */
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// ===== GLOBAL INSTANCES =====
const stateManager = new AutomationStateManager();
const errorHandler = new ErrorHandler();
const notificationManager = new NotificationManager();
const performanceMonitor = new PerformanceMonitor();

// Make notification manager globally available
window.notificationManager = notificationManager;
window.analytics = stateManager.analytics;

// ===== ENTERPRISE API CLIENT =====
class AutomationAPIClient {
    constructor() {
        this.cache = new CacheManager();
        this.requestQueue = [];
        this.isProcessing = false;
        this.retryAttempts = new Map();
    }
    
    /**
     * Execute API request with caching and error handling
     * @param {Function} apiFunction - API function to call
     * @param {Array} args - Function arguments
     * @param {Object} options - Request options
     * @returns {Promise} API response
     */
    async executeRequest(apiFunction, args = [], options = {}) {
        const cacheKey = options.cacheKey || `${apiFunction.name}_${JSON.stringify(args)}`;
        
        // Check cache first
        if (options.useCache !== false) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return cached;
            }
        }
        
        const request = {
            id: Date.now() + Math.random(),
            apiFunction,
            args,
            options,
            cacheKey,
            retryCount: 0
        };
        
        return this.queueRequest(request);
    }
    
    /**
     * Queue API request
     * @param {Object} request - Request object
     * @returns {Promise} Request promise
     */
    async queueRequest(request) {
        return new Promise((resolve, reject) => {
            request.resolve = resolve;
            request.reject = reject;
            
            this.requestQueue.push(request);
            this.processQueue();
        });
    }
    
    /**
     * Process request queue
     */
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const activeRequests = this.requestQueue.splice(0, ENTERPRISE_CONFIG.PERFORMANCE.MAX_CONCURRENT_REQUESTS);
            
            await Promise.allSettled(
                activeRequests.map(request => this.executeQueuedRequest(request))
            );
        }
        
        this.isProcessing = false;
    }
    
    /**
     * Execute queued request
     * @param {Object} request - Request object
     */
    async executeQueuedRequest(request) {
        const endTiming = performanceMonitor.startTiming(`api_${request.apiFunction.name}`);
        
        try {
            const result = await request.apiFunction(...request.args);
            
            // Handle different response formats
            let data, error;
            if (result && typeof result === 'object') {
                if ('data' in result && 'error' in result) {
                    ({ data, error } = result);
                } else {
                    data = result;
                    error = null;
                }
            } else {
                data = result;
                error = null;
            }
            
            if (error) {
                throw new Error(error.message || 'API Error');
            }
            
            // Cache successful response
            if (request.options.useCache !== false) {
                this.cache.set(request.cacheKey, { data, error: null });
            }
            
            request.resolve({ data, error: null });
            
        } catch (apiError) {
            const shouldRetry = this.shouldRetry(request, apiError);
            
            if (shouldRetry) {
                request.retryCount++;
                setTimeout(() => {
                    this.requestQueue.unshift(request);
                    this.processQueue();
                }, Math.pow(2, request.retryCount) * 1000); // Exponential backoff
            } else {
                errorHandler.handleError(apiError, 'api', {
                    function: request.apiFunction.name,
                    args: request.args,
                    retryCount: request.retryCount
                });
                
                request.reject({ data: null, error: apiError });
            }
        } finally {
            endTiming();
        }
    }
    
    /**
     * Determine if request should be retried
     * @param {Object} request - Request object
     * @param {Error} error - Error object
     * @returns {boolean} Should retry
     */
    shouldRetry(request, error) {
        const maxRetries = ENTERPRISE_CONFIG.SECURITY.MAX_RETRY_ATTEMPTS;
        
        if (request.retryCount >= maxRetries) return false;
        
        // Retry on network errors and 5xx responses
        const retryableErrors = [
            'NetworkError',
            'TimeoutError',
            'AbortError'
        ];
        
        return retryableErrors.some(type => 
            error.name?.includes(type) || 
            error.message?.includes(type) ||
            error.message?.includes('50')
        );
    }
    
    /**
     * Clear cache for specific pattern
     * @param {string} pattern - Cache key pattern
     */
    clearCache(pattern = '') {
        if (!pattern) {
            this.cache.clear();
            return;
        }
        
        for (const [key] of this.cache.cache.entries()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
}

// ===== MAIN APPLICATION CLASS =====
class EnterpriseAutomationSystem {
    constructor() {
        this.apiClient = new AutomationAPIClient();
        this.isInitialized = false;
        this.refreshInterval = null;
        this.unsubscribers = [];
        
        // Bind methods
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.handleKeyboardShortcuts = this.handleKeyboardShortcuts.bind(this);
    }
    
    /**
     * Initialize the automation system
     */
    async initialize() {
        if (this.isInitialized) return;
        
        const endTiming = performanceMonitor.startTiming('app_initialization');
        
        try {
            notificationManager.show('Inicializando sistema de automações...', 'info', 3000);
            
            // Verify authentication
            const authResult = await this.verifyAuthentication();
            if (!authResult.success) {
                window.location.href = '/login.html';
                return;
            }
            
            // Load data with progress tracking
            await this.loadAllData();
            
            // Setup UI
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            this.setupAccessibility();
            
            // Render interface
            this.renderInterface();
            
            // Setup real-time features
            this.setupRealTimeUpdates();
            this.setupPerformanceMonitoring();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Update state
            stateManager.setState({
                isLoading: false,
                lastUpdate: new Date().toISOString()
            });
            
            // Success notification
            notificationManager.show(
                'Sistema de automações carregado com sucesso!', 
                'success', 
                3000,
                { description: `${stateManager.state.automations.size} automações carregadas` }
            );
            
            // Track successful initialization
            stateManager.analytics.track('app_initialized', {
                duration: endTiming(),
                automationsCount: stateManager.state.automations.size,
                executionsCount: stateManager.state.executionHistory.size
            });
            
            console.log('🤖 Enterprise Automation System initialized successfully');
            
        } catch (error) {
            errorHandler.handleError(error, 'initialization');
            this.handleInitializationError(error);
        } finally {
            endTiming();
        }
    }
    
    /**
     * Verify user authentication
     * @returns {Promise<Object>} Authentication result
     */
    async verifyAuthentication() {
        try {
            const result = await this.apiClient.executeRequest(
                getCurrentUser,
                [],
                { cacheKey: 'current_user', useCache: true }
            );
            
            if (result.error || !result.data?.user) {
                return { success: false, error: 'Not authenticated' };
            }
            
            const { user, profile } = result.data;
            
            stateManager.setState({
                user,
                profile,
                orgId: profile?.org_id || 'default-org-id'
            });
            
            return { success: true, user, profile };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Load all automation data
     */
    async loadAllData() {
        const { orgId } = stateManager.state;
        
        const dataLoaders = [
            { name: 'automations', fn: getAutomationRules, args: [orgId] },
            { name: 'executions', fn: getAutomationExecutions, args: [orgId] },
            { name: 'templates', fn: getCommunicationTemplates, args: [orgId] },
            { name: 'emailCampaigns', fn: getEmailCampaigns, args: [orgId] },
            { name: 'smsCampaigns', fn: getSMSCampaigns, args: [orgId] },
            { name: 'workflows', fn: getN8NWorkflows, args: [orgId] },
            { name: 'whatsappIntegration', fn: getWhatsappIntegration, args: [orgId] }
        ];
        
        const results = await Promise.allSettled(
            dataLoaders.map(loader => 
                this.apiClient.executeRequest(
                    loader.fn,
                    loader.args,
                    { cacheKey: `${loader.name}_${orgId}` }
                )
            )
        );
        
        // Process results
        const updates = {};
        
        results.forEach((result, index) => {
            const loader = dataLoaders[index];
            
            if (result.status === 'fulfilled' && result.value?.data) {
                const data = Array.isArray(result.value.data) ? result.value.data : [result.value.data];
                
                switch (loader.name) {
                    case 'automations':
                        updates.automations = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'executions':
                        updates.executionHistory = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'templates':
                        updates.templates = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'emailCampaigns':
                        if (!updates.campaigns) updates.campaigns = { ...stateManager.state.campaigns };
                        updates.campaigns.email = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'smsCampaigns':
                        if (!updates.campaigns) updates.campaigns = { ...stateManager.state.campaigns };
                        updates.campaigns.sms = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'whatsappIntegration':
                        if (!updates.campaigns) updates.campaigns = { ...stateManager.state.campaigns };
                        updates.campaigns.whatsapp = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'workflows':
                        updates.workflows = new Map(data.map(item => [item.id, item]));
                        break;
                }
            } else if (result.status === 'rejected') {
                console.warn(`Failed to load ${loader.name}:`, result.reason);
            }
        });
        
        // Calculate metrics
        updates.metrics = this.calculateMetrics(updates);
        
        // Update state
        stateManager.setState(updates);
    }
    
    /**
     * Calculate real-time metrics
     * @param {Object} data - Data to calculate from
     * @returns {Object} Calculated metrics
     */
    calculateMetrics(data = stateManager.state) {
        const automations = Array.from(data.automations?.values() || []);
        const executions = Array.from(data.executionHistory?.values() || []);
        
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // Basic counts
        const totalExecutions = executions.length;
        const activeAutomations = automations.filter(auto => 
            auto.is_active === true || auto.status === 'active'
        ).length;
        
        // Today's executions
        const executionsToday = executions.filter(exec => {
            try {
                const execDate = new Date(exec.created_at || exec.executed_at || exec.started_at);
                return execDate >= startOfToday;
            } catch {
                return false;
            }
        }).length;
        
        // Success rate
        const successfulExecutions = executions.filter(exec => 
            exec.status === 'completed' || exec.status === 'success'
        ).length;
        
        const successRate = totalExecutions > 0 
            ? Number(((successfulExecutions / totalExecutions) * 100).toFixed(1))
            : 0;
        
        // Error rate
        const failedExecutions = executions.filter(exec => 
            exec.status === 'failed' || exec.status === 'error'
        ).length;
        
        const errorRate = totalExecutions > 0 
            ? Number(((failedExecutions / totalExecutions) * 100).toFixed(1))
            : 0;
        
        // Average execution time
        const executionsWithTime = executions.filter(exec => 
            exec.execution_time_ms && !isNaN(exec.execution_time_ms)
        );
        
        const avgExecutionTime = executionsWithTime.length > 0
            ? Math.round(executionsWithTime.reduce((sum, exec) => 
                sum + Number(exec.execution_time_ms), 0) / executionsWithTime.length)
            : 0;
        
        // Estimated metrics
        const totalLeadsProcessed = Math.floor(totalExecutions * 1.2);
        const conversionRate = Number((successRate * 0.15).toFixed(1));
        
        return {
            totalExecutions,
            successRate,
            errorRate,
            activeAutomations,
            executionsToday,
            totalLeadsProcessed,
            conversionRate,
            avgExecutionTime
        };
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Subscribe to state changes
        const unsubscribe = stateManager.subscribe((newState, prevState) => {
            this.handleStateChange(newState, prevState);
        });
        this.unsubscribers.push(unsubscribe);
        
        // DOM event listeners
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('change', this.handleChange.bind(this));
        document.addEventListener('input', this.handleInput.bind(this));
        
        // Page lifecycle events
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        
        // Resize observer for responsive updates
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(entries => {
                this.handleResize(entries);
            });
            resizeObserver.observe(document.body);
        }
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', this.handleKeyboardShortcuts);
    }
    
    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Focus management
        this.setupFocusManagement();
        
        // ARIA live regions
        this.setupARIALiveRegions();
        
        // High contrast mode detection
        this.setupHighContrastMode();
        
        // Reduced motion preference
        this.setupReducedMotion();
    }
    
    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50';
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Focus trap for modals (implement when modals are created)
        this.focusTrap = null;
    }
    
    /**
     * Setup ARIA live regions
     */
    setupARIALiveRegions() {
        // Status announcements
        if (!document.getElementById('status-announcements')) {
            const statusRegion = document.createElement('div');
            statusRegion.id = 'status-announcements';
            statusRegion.setAttribute('aria-live', 'polite');
            statusRegion.setAttribute('aria-atomic', 'true');
            statusRegion.className = 'sr-only';
            document.body.appendChild(statusRegion);
        }
        
        // Alert announcements
        if (!document.getElementById('alert-announcements')) {
            const alertRegion = document.createElement('div');
            alertRegion.id = 'alert-announcements';
            alertRegion.setAttribute('aria-live', 'assertive');
            alertRegion.setAttribute('aria-atomic', 'true');
            alertRegion.className = 'sr-only';
            document.body.appendChild(alertRegion);
        }
    }
    
    /**
     * Setup high contrast mode
     */
    setupHighContrastMode() {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        
        const handleContrastChange = (e) => {
            document.body.classList.toggle('high-contrast', e.matches);
            stateManager.setState({
                features: {
                    ...stateManager.state.features,
                    highContrast: e.matches
                }
            });
        };
        
        handleContrastChange(mediaQuery);
        mediaQuery.addListener(handleContrastChange);
    }
    
    /**
     * Setup reduced motion
     */
    setupReducedMotion() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleMotionChange = (e) => {
            document.body.classList.toggle('reduce-motion', e.matches);
            stateManager.setState({
                features: {
                    ...stateManager.state.features,
                    reducedMotion: e.matches
                }
            });
        };
        
        handleMotionChange(mediaQuery);
        mediaQuery.addListener(handleMotionChange);
    }
    
    /**
     * Handle state changes
     * @param {Object} newState - New state
     * @param {Object} prevState - Previous state
     */
    handleStateChange(newState, prevState) {
        // Check if we need to re-render
        const shouldRerender = this.shouldRerender(newState, prevState);
        
        if (shouldRerender) {
            this.renderInterface();
        }
        
        // Update document title with live metrics
        this.updateDocumentTitle(newState);
        
        // Announce important changes to screen readers
        this.announceImportantChanges(newState, prevState);
    }
    
    /**
     * Determine if interface should re-render
     * @param {Object} newState - New state
     * @param {Object} prevState - Previous state
     * @returns {boolean} Should re-render
     */
    shouldRerender(newState, prevState) {
        const watchedFields = [
            'automations',
            'executionHistory',
            'campaigns',
            'metrics',
            'filters',
            'sorting',
            'pagination'
        ];
        
        return watchedFields.some(field => 
            newState[field] !== prevState[field]
        );
    }
    
    /**
     * Update document title with metrics
     * @param {Object} state - Current state
     */
    updateDocumentTitle(state) {
        const { metrics } = state;
        const baseTitle = 'ALSHAM 360° - Automações';
        
        if (metrics.activeAutomations > 0) {
            document.title = `(${metrics.activeAutomations}) ${baseTitle}`;
        } else {
            document.title = baseTitle;
        }
    }
    
    /**
     * Announce important changes to screen readers
     * @param {Object} newState - New state
     * @param {Object} prevState - Previous state
     */
    announceImportantChanges(newState, prevState) {
        const statusRegion = document.getElementById('status-announcements');
        if (!statusRegion) return;
        
        // Announce when automations are loaded
        if (newState.automations.size > prevState.automations.size) {
            const diff = newState.automations.size - prevState.automations.size;
            statusRegion.textContent = `${diff} nova${diff > 1 ? 's' : ''} automação${diff > 1 ? 'ões' : ''} carregada${diff > 1 ? 's' : ''}`;
        }
        
        // Announce execution updates
        if (newState.metrics.executionsToday > prevState.metrics.executionsToday) {
            const diff = newState.metrics.executionsToday - prevState.metrics.executionsToday;
            statusRegion.textContent = `${diff} nova${diff > 1 ? 's' : ''} execução${diff > 1 ? 'ões' : ''} hoje`;
        }
        
        // Clear announcement after delay
        setTimeout(() => {
            statusRegion.textContent = '';
        }, 3000);
    }
    
    /**
     * Handle click events
     * @param {Event} event - Click event
     */
    handleClick(event) {
        const { target } = event;
        const action = target.dataset.action;
        const id = target.dataset.id;
        
        // Track click analytics
        stateManager.analytics.track('click', {
            element: target.tagName.toLowerCase(),
            action,
            id,
            text: target.textContent?.trim().substring(0, 50)
        });
        
        // Handle specific actions
        switch (action) {
            case 'create-automation':
                event.preventDefault();
                this.openAutomationModal();
                break;
                
            case 'edit-automation':
                event.preventDefault();
                this.editAutomation(id);
                break;
                
            case 'delete-automation':
                event.preventDefault();
                this.deleteAutomation(id);
                break;
                
            case 'toggle-automation':
                event.preventDefault();
                this.toggleAutomation(id);
                break;
                
            case 'create-campaign':
                event.preventDefault();
                this.openCampaignModal(target.dataset.type || 'email');
                break;
                
            case 'view-templates':
                event.preventDefault();
                this.openTemplatesModal();
                break;
                
            case 'refresh-data':
                event.preventDefault();
                this.refreshData();
                break;
                
            case 'export-data':
                event.preventDefault();
                this.exportData(target.dataset.format || 'csv');
                break;
                
            case 'bulk-action':
                event.preventDefault();
                this.handleBulkAction(target.dataset.bulkAction);
                break;
        }
        
        // Handle button clicks
        if (target.id) {
            switch (target.id) {
                case 'create-automation-btn':
                case 'create-automation-quick':
                    event.preventDefault();
                    this.openAutomationModal();
                    break;
                    
                case 'create-campaign-btn':
                case 'create-email-campaign':
                    event.preventDefault();
                    this.openCampaignModal('email');
                    break;
                    
                case 'create-sms-campaign':
                    event.preventDefault();
                    this.openCampaignModal('sms');
                    break;
                    
                case 'view-templates':
                    event.preventDefault();
                    this.openTemplatesModal();
                    break;
            }
        }
    }
    
    /**
     * Handle input events
     * @param {Event} event - Input event
     */
    handleInput(event) {
        const { target } = event;
        
        if (target.dataset.filter) {
            this.handleFilterChange(target.dataset.filter, target.value);
        }
        
        if (target.id === 'search-input') {
            this.handleSearch(target.value);
        }
    }
    
    /**
     * Handle change events
     * @param {Event} event - Change event
     */
    handleChange(event) {
        const { target } = event;
        
        if (target.type === 'checkbox' && target.dataset.selectItem) {
            this.handleItemSelection(target.dataset.selectItem, target.checked);
        }
        
        if (target.id === 'select-all') {
            this.handleSelectAll(target.checked);
        }
    }
    
    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardShortcuts(event) {
        const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
        const cmdOrCtrl = ctrlKey || metaKey;
        
        // Global shortcuts
        if (cmdOrCtrl && !altKey && !shiftKey) {
            switch (key) {
                case 'n':
                    event.preventDefault();
                    this.openAutomationModal();
                    stateManager.analytics.track('keyboard_shortcut', { action: 'new_automation' });
                    break;
                    
                case 'r':
                    event.preventDefault();
                    this.refreshData();
                    stateManager.analytics.track('keyboard_shortcut', { action: 'refresh' });
                    break;
                    
                case 'e':
                    event.preventDefault();
                    this.exportData();
                    stateManager.analytics.track('keyboard_shortcut', { action: 'export' });
                    break;
                    
                case 'f':
                    event.preventDefault();
                    this.focusSearch();
                    stateManager.analytics.track('keyboard_shortcut', { action: 'search' });
                    break;
            }
        }
        
        // Alt shortcuts
        if (altKey && !cmdOrCtrl && !shiftKey) {
            switch (key) {
                case '1':
                    event.preventDefault();
                    this.navigateToSection('stats');
                    break;
                    
                case '2':
                    event.preventDefault();
                    this.navigateToSection('automations');
                    break;
                    
                case '3':
                    event.preventDefault();
                    this.navigateToSection('campaigns');
                    break;
                    
                case '4':
                    event.preventDefault();
                    this.navigateToSection('history');
                    break;
            }
        }
        
        // Escape key
        if (key === 'Escape') {
            this.handleEscape();
        }
    }
    
    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page hidden - pause updates
            this.pauseRealTimeUpdates();
            stateManager.analytics.track('visibility_change', { visible: false });
        } else {
