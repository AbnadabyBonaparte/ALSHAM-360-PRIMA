// =====================================================
// ALSHAM 360° PRIMA - SISTEMA ENTERPRISE 10/10
// Arquitetura Modular de Nível NASA
// =====================================================

/**
 * @fileoverview Sistema principal de automações enterprise
 * @version 2.0.0
 * @author ALSHAM Team
 * @license Proprietary
 */

// =====================================================
// 1. ERROR TRACKER & MONITORING (Padrão 10/10)
// =====================================================

/**
 * Sistema centralizado de rastreamento de erros
 * Implementa logging estruturado e monitoramento em tempo real
 */
class ErrorTracker {
    constructor() {
        this.errors = [];
        this.sessionId = this.generateSessionId();
        this.isProduction = window.location.hostname !== 'localhost';
    }

    /**
     * Captura e estrutura erros para análise
     * @param {Error} error - Erro capturado
     * @param {Object} context - Contexto adicional
     */
    captureError(error, context = {}) {
        const errorData = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            context: {
                component: context.component || 'unknown',
                action: context.action || 'unknown',
                userId: StateManager.getCurrentUser()?.id || 'anonymous',
                ...context
            }
        };

        this.errors.push(errorData);
        
        // Log estruturado
        console.error('🚨 Error Captured:', errorData);
        
        // Em produção, enviar para serviço de monitoramento
        if (this.isProduction && typeof APIClient !== 'undefined') {
            this.sendToMonitoring(errorData);
        }

        // Notificar usuário se erro crítico
        if (context.severity === 'critical' && typeof NotificationManager !== 'undefined') {
            NotificationManager.error('Sistema temporariamente indisponível. Equipe técnica notificada.');
        }
    }

    /**
     * Envia erro para serviço de monitoramento
     * @param {Object} errorData - Dados estruturados do erro
     */
    async sendToMonitoring(errorData) {
        try {
            // APIClient pode não estar disponível se o erro for na inicialização do APIClient
            if (typeof APIClient !== 'undefined' && APIClient.post) {
                await APIClient.post('/api/errors', errorData, { timeout: 5000 });
            }
        } catch (monitoringError) {
            console.warn('Failed to send error to monitoring:', monitoringError);
        }
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// =====================================================
// 2. STATE MANAGER (Padrão Reativo 10/10)
// =====================================================

/**
 * Gerenciador de estado reativo usando padrão Observer/PubSub
 * Centraliza todo o estado da aplicação
 */
class StateManager {
    constructor() {
        this.state = {
            user: null,
            automations: [],
            campaigns: [],
            executionHistory: [],
            systemHealth: { api: 'unknown', processing: 'unknown' },
            ui: {
                loading: true,
                activeTab: 'email',
                filter: 'all'
            }
        };
        
        this.subscribers = new Map();
        this.isInitialized = false;
    }

    /**
     * Subscreve a mudanças de estado
     * @param {string} key - Chave do estado a observar
     * @param {Function} callback - Função executada na mudança
     * @returns {Function} Função para cancelar subscription
     */
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        
        this.subscribers.get(key).add(callback);
        
        // Retorna função de cleanup
        return () => {
            this.subscribers.get(key)?.delete(callback);
        };
    }

    /**
     * Atualiza estado e notifica subscribers
     * @param {string} key - Chave do estado
     * @param {*} value - Novo valor
     */
    setState(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        // Notifica subscribers apenas se valor mudou (comparação simples; para objetos profundos, usar JSON.stringify é mais seguro)
        if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
            this.notifySubscribers(key, value, oldValue);
        }
    }

    /**
     * Obtém valor do estado
     * @param {string} key - Chave do estado
     * @returns {*} Valor atual
     */
    getState(key) {
        return this.state[key];
    }

    /**
     * Notifica todos os subscribers de uma chave
     * @param {string} key - Chave modificada
     * @param {*} newValue - Novo valor
     * @param {*} oldValue - Valor anterior
     */
    notifySubscribers(key, newValue, oldValue) {
        const callbacks = this.subscribers.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    // Usa o tracker global
                    window.errorTracker?.captureError(error, { 
                        component: 'StateManager', 
                        action: 'notifySubscribers',
                        key 
                    });
                }
            });
        }
    }

    /**
     * Inicializa estado da aplicação
     */
    async initialize() {
        try {
            this.setState('ui', { ...this.state.ui, loading: true });
            
            // Carrega dados essenciais
            await Promise.allSettled([
                this.loadUserData(),
                this.loadAutomations(),
                this.loadSystemHealth()
            ]);
            
            this.isInitialized = true;
            this.setState('ui', { ...this.state.ui, loading: false });
            
        } catch (error) {
            window.errorTracker?.captureError(error, { 
                component: 'StateManager', 
                action: 'initialize',
                severity: 'critical'
            });
        }
    }

    async loadUserData() {
        const user = await window.apiClient.get('/api/user/profile');
        this.setState('user', user);
    }

    async loadAutomations() {
        const automations = await window.apiClient.get('/api/automations');
        this.setState('automations', automations);
    }

    async loadSystemHealth() {
        const health = await window.apiClient.get('/api/health');
        this.setState('systemHealth', health);
    }

    static getCurrentUser() {
        return window.stateManager?.getState('user');
    }
}

// =====================================================
// 3. API CLIENT (Performance & Resiliência 10/10)
// =====================================================

/**
 * Cliente API enterprise com cache, retry logic e queue management
 */
class APIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.maxConcurrentRequests = 3;
        this.activeRequests = 0;
        
        // Rate limiting
        this.rateLimiter = {
            requests: 0,
            windowStart: Date.now(),
            maxRequests: 100, // 100 requests per minute
            windowMs: 60000
        };
    }

    /**
     * GET request com cache inteligente
     * @param {string} endpoint - Endpoint da API
     * @param {Object} options - Opções da requisição
     * @returns {Promise} Resposta da API
     */
    async get(endpoint, options = {}) {
        const cacheKey = `GET:${endpoint}:${JSON.stringify(options.params || {})}`;
        
        // Verifica cache se TTL válido
        if (options.cache !== false && this.isCacheValid(cacheKey, options.ttl)) {
            return this.cache.get(cacheKey).data;
        }

        const response = await this.request('GET', endpoint, null, options);
        
        // Cacheia resposta se solicitado
        if (options.cache !== false) {
            this.setCache(cacheKey, response, options.ttl);
        }
        
        return response;
    }

    /**
     * POST request
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados para envio
     * @param {Object} options - Opções da requisição
     * @returns {Promise} Resposta da API
     */
    async post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    /**
     * PUT request
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados para envio
     * @param {Object} options - Opções da requisição
     * @returns {Promise} Resposta da API
     */
    async put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    /**
     * DELETE request
     * @param {string} endpoint - Endpoint da API
     * @param {Object} options - Opções da requisição
     * @returns {Promise} Resposta da API
     */
    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }

    /**
     * Request base com retry logic e rate limiting
     * @param {string} method - Método HTTP
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados para envio
     * @param {Object} options - Opções da requisição
     * @returns {Promise} Resposta da API
     */
    async request(method, endpoint, data = null, options = {}) {
        // Rate limiting check
        this.checkRateLimit();
        
        const requestConfig = {
            method,
            endpoint,
            data,
            options: {
                timeout: 30000,
                retries: 3,
                retryDelay: 1000,
                ...options
            }
        };

        // Adiciona à fila se muitas requisições simultâneas
        if (this.activeRequests >= this.maxConcurrentRequests) {
            return this.queueRequest(requestConfig);
        }

        return this.executeRequest(requestConfig);
    }

    /**
     * Executa requisição com retry logic
     * @param {Object} config - Configuração da requisição
     * @returns {Promise} Resposta da API
     */
    async executeRequest(config) {
        this.activeRequests++;
        
        for (let attempt = 1; attempt <= config.options.retries; attempt++) {
            try {
                const response = await this.performRequest(config);
                this.activeRequests--;
                this.processQueue();
                return response;
                
            } catch (error) {
                console.warn(`Request attempt ${attempt} failed:`, error.message);
                
                // Se é o último attempt, rejeita
                if (attempt === config.options.retries) {
                    this.activeRequests--;
                    this.processQueue();
                    throw error;
                }
                
                // Exponential backoff
                const delay = config.options.retryDelay * Math.pow(2, attempt - 1);
                await this.sleep(delay);
            }
        }
        // Garantia de que o fluxo não chega aqui sem retorno (necessário pelo loop)
        return null; 
    }

    /**
     * Executa a requisição HTTP
     * @param {Object} config - Configuração da requisição
     * @returns {Promise} Resposta da API
     */
    async performRequest(config) {
        const { method, endpoint, data, options } = config;
        
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`,
                ...options.headers
            }
        };

        if (data) {
            fetchOptions.body = JSON.stringify(data);
        }

        // Timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout);
        fetchOptions.signal = controller.signal;

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, fetchOptions);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorBody}`);
            }
            
            return await response.json();
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }

    /**
     * Adiciona requisição à fila
     * @param {Object} config - Configuração da requisição
     * @returns {Promise} Promise que resolve quando requisição for processada
     */
    queueRequest(config) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ config, resolve, reject });
        });
    }

    /**
     * Processa fila de requisições
     */
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;
        
        while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
            const nextJob = this.requestQueue.shift();
            if (nextJob) {
                const { config, resolve, reject } = nextJob;
                
                this.executeRequest(config)
                    .then(resolve)
                    .catch(reject);
            }
        }
        
        this.isProcessingQueue = false;
    }

    /**
     * Verifica rate limiting
     */
    checkRateLimit() {
        const now = Date.now();
        
        // Reset window se necessário
        if (now - this.rateLimiter.windowStart > this.rateLimiter.windowMs) {
            this.rateLimiter.requests = 0;
            this.rateLimiter.windowStart = now;
        }
        
        // Verifica limite
        if (this.rateLimiter.requests >= this.rateLimiter.maxRequests) {
            throw new Error('Rate limit exceeded. Try again later.');
        }
        
        this.rateLimiter.requests++;
    }

    /**
     * Gerenciamento de cache
     */
    isCacheValid(key, ttl = 300000) { // 5 min default
        const cached = this.cache.get(key);
        if (!cached) return false;
        
        return (Date.now() - cached.timestamp) < ttl;
    }

    setCache(key, data, ttl = 300000) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
        
        // Auto-cleanup cache
        setTimeout(() => this.cache.delete(key), ttl);
    }

    getAuthToken() {
        return localStorage.getItem('auth_token') || '';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// =====================================================
// 4. DATA VALIDATOR (Segurança 10/10)
// =====================================================

/**
 * Validador de dados com sanitização e proteção XSS
 */
class DataValidator {
    /**
     * Valida e sanitiza entrada de texto
     * @param {string} input - Texto de entrada
     * @param {Object} rules - Regras de validação
     * @returns {Object} Resultado da validação
     */
    static validateText(input, rules = {}) {
        let sanitizedInput = (typeof input === 'string') ? input : String(input || '');
        const result = { isValid: true, errors: [], sanitized: sanitizedInput };
        
        // Sanitização XSS
        result.sanitized = this.sanitizeHTML(result.sanitized);
        
        // Validações
        if (rules.required && !result.sanitized.trim()) {
            result.isValid = false;
            result.errors.push('Campo obrigatório');
        }
        
        if (rules.minLength && result.sanitized.length < rules.minLength) {
            result.isValid = false;
            result.errors.push(`Mínimo de ${rules.minLength} caracteres`);
        }
        
        if (rules.maxLength && result.sanitized.length > rules.maxLength) {
            result.isValid = false;
            result.errors.push(`Máximo de ${rules.maxLength} caracteres`);
        }
        
        if (rules.pattern && !rules.pattern.test(result.sanitized)) {
            result.isValid = false;
            result.errors.push('Formato inválido');
        }
        
        return result;
    }

    /**
     * Valida email
     * @param {string} email - Email para validação
     * @returns {Object} Resultado da validação
     */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const sanitized = this.sanitizeHTML(String(email || ''));
        
        const isValid = emailRegex.test(sanitized);
        return {
            isValid,
            errors: isValid ? [] : ['Email inválido'],
            sanitized
        };
    }

    /**
     * Sanitiza HTML removendo tags perigosas
     * @param {string} input - HTML de entrada
     * @returns {string} HTML sanitizado
     */
    static sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        const tempDiv = document.createElement('div');
        tempDiv.textContent = input;
        return tempDiv.innerHTML; // Converte <, >, &, etc., para entidades HTML
    }

    /**
     * Valida objeto de automação
     * @param {Object} automation - Dados da automação
     * @returns {Object} Resultado da validação
     */
    static validateAutomation(automation) {
        const errors = [];
        
        const nameValidation = this.validateText(automation.name, {
            required: true,
            minLength: 3,
            maxLength: 100
        });
        
        if (!nameValidation.isValid) {
            errors.push(...nameValidation.errors.map(e => `Nome: ${e}`));
        }
        
        if (!automation.trigger || !automation.trigger.type) {
            errors.push('Trigger é obrigatório');
        }
        
        if (!automation.actions || !Array.isArray(automation.actions) || automation.actions.length === 0) {
            errors.push('Pelo menos uma ação é obrigatória');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            sanitized: {
                ...automation,
                name: nameValidation.sanitized,
                description: this.sanitizeHTML(automation.description || '')
            }
        };
    }
}

// =====================================================
// 5. NOTIFICATION MANAGER (UX 10/10)
// =====================================================

/**
 * Gerenciador de notificações com acessibilidade WCAG AA
 */
class NotificationManager {
    constructor() {
        this.container = null;
        this.announceElement = null;
        this.notifications = [];
        this.maxNotifications = 5;
    }

    /**
     * Inicializa o sistema de notificações
     */
    initialize() {
        this.container = document.getElementById('toast-container');
        this.announceElement = document.getElementById('screen-reader-announcements');
        
        if (!this.container) {
            console.error('Toast container not found. Creating one.');
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            // Adicionar classes CSS necessárias
            document.body.appendChild(this.container);
        }
        if (!this.announceElement) {
            console.error('Screen reader announcement element not found. Creating one.');
            this.announceElement = document.createElement('div');
            this.announceElement.id = 'screen-reader-announcements';
            // Adicionar classes CSS de acessibilidade (sr-only, etc.)
            this.announceElement.setAttribute('aria-live', 'assertive');
            this.announceElement.className = 'sr-only'; // Assumindo classe de screen-reader-only
            document.body.appendChild(this.announceElement);
        }
    }

    /**
     * Mostra notificação de sucesso
     * @param {string} message - Mensagem a exibir
     * @param {Object} options - Opções da notificação
     */
    success(message, options = {}) {
        this.show(message, 'success', options);
    }

    /**
     * Mostra notificação de erro
     * @param {string} message - Mensagem a exibir
     * @param {Object} options - Opções da notificação
     */
    error(message, options = {}) {
        this.show(message, 'error', { duration: 8000, ...options });
    }

    /**
     * Mostra notificação de aviso
     * @param {string} message - Mensagem a exibir
     * @param {Object} options - Opções da notificação
     */
    warning(message, options = {}) {
        this.show(message, 'warning', options);
    }

    /**
     * Mostra notificação informativa
     * @param {string} message - Mensagem a exibir
     * @param {Object} options - Opções da notificação
     */
    info(message, options = {}) {
        this.show(message, 'info', options);
    }

    /**
     * Mostra notificação
     * @param {string} message - Mensagem a exibir
     * @param {string} type - Tipo da notificação
     * @param {Object} options - Opções da notificação
     */
    show(message, type, options = {}) {
        if (!this.container) {
            console.error("Notification container not initialized.");
            return;
        }

        const config = {
            duration: 5000,
            persistent: false,
            action: null,
            ...options
        };

        const notification = {
            id: this.generateId(),
            message: DataValidator.sanitizeHTML(message),
            type,
            timestamp: Date.now(),
            ...config
        };

        // Remove notificações antigas se necessário
        this.pruneNotifications();
        
        // Adiciona nova notificação
        this.notifications.push(notification);
        this.renderNotification(notification);
        
        // Anuncia para leitores de tela
        this.announceToScreenReader(message, type);
        
        // Auto-remove se não for persistente
        if (!notification.persistent) {
            setTimeout(() => this.remove(notification.id), notification.duration);
        }
    }

    /**
     * Renderiza notificação na tela
     * @param {Object} notification - Dados da notificação
     */
    renderNotification(notification) {
        const element = document.createElement('div');
        element.id = `toast-${notification.id}`;
        element.className = this.getNotificationClasses(notification.type);
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-live', 'polite');
        
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        element.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 text-lg" aria-hidden="true">
                    ${iconMap[notification.type] || 'ℹ️'}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">${notification.message}</p>
                    ${notification.action && notification.action.label ? `
                        <button data-action-id="${notification.id}" class="mt-2 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            ${notification.action.label}
                        </button>
                    ` : ''}
                </div>
                <button class="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-lg p-1" 
                        data-dismiss-id="${notification.id}"
                        aria-label="Fechar notificação">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;
        
        // Adiciona event listener para ação se existir
        if (notification.action && notification.action.handler) {
            element.querySelector(`[data-action-id="${notification.id}"]`)?.addEventListener('click', notification.action.handler);
        }
        
        // Adiciona event listener para fechar
        element.querySelector(`[data-dismiss-id="${notification.id}"]`)?.addEventListener('click', () => this.remove(notification.id));

        // Animação de entrada
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        this.container.appendChild(element);
        
        // Trigger animation
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.3s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
    }

    /**
     * Remove notificação
     * @param {string} id - ID da notificação
     */
    remove(id) {
        const element = document.getElementById(`toast-${id}`);
        if (!element) return;
        
        // Animação de saída
        element.style.transition = 'all 0.3s ease-in';
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            element.remove();
            this.notifications = this.notifications.filter(n => n.id !== id);
        }, 300);
    }

    /**
     * Anuncia para leitores de tela
     * @param {string} message - Mensagem a anunciar
     * @param {string} type - Tipo da notificação
     */
    announceToScreenReader(message, type) {
        if (!this.announceElement) return;
        
        const priority = type === 'error' ? 'Erro: ' : (type === 'warning' ? 'Aviso: ' : '');
        this.announceElement.textContent = `${priority}${message}`;
        
        // Limpa após 1 segundo para permitir novas locuções
        setTimeout(() => {
            this.announceElement.textContent = '';
        }, 1000);
    }

    /**
     * Obtém classes CSS para notificação
     * @param {string} type - Tipo da notificação
     * @returns {string} Classes CSS
     */
    getNotificationClasses(type) {
        const baseClasses = 'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto border p-4';
        
        const typeClasses = {
            success: 'border-green-200 bg-green-50',
            error: 'border-red-200 bg-red-50',
            warning: 'border-yellow-200 bg-yellow-50',
            info: 'border-blue-200 bg-blue-50'
        };
        
        return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
    }

    /**
     * Remove notificações antigas
     */
    pruneNotifications() {
        while (this.notifications.length >= this.maxNotifications) {
            const oldestNotification = this.notifications.shift(); // Remove a mais antiga da array
            if (oldestNotification) {
                this.remove(oldestNotification.id); // Remove do DOM
            }
        }
    }

    generateId() {
        return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// =====================================================
// 6. APPLICATION CONTROLLER (Arquitetura 10/10)
// =====================================================

/**
 * Controlador principal da aplicação
 * Coordena todos os módulos e gerencia o ciclo de vida
 */
class AutomationApp {
    constructor() {
        this.isInitialized = false;
        
        // Instancia os módulos principais
        const errorTracker = new ErrorTracker();
        const notificationManager = new NotificationManager();
        const apiClient = new APIClient();
        const stateManager = new StateManager();

        this.modules = {
            errorTracker,
            apiClient,
            notificationManager,
            stateManager
        };
        
        // Expõe instâncias globais de forma segura
        window.stateManager = stateManager;
        window.notificationManager = notificationManager;
        window.errorTracker = errorTracker;
        window.apiClient = apiClient;
    }

    /**
     * Inicializa a aplicação
     */
    async initialize() {
        try {
            console.info('🚀 Iniciando ALSHAM 360° PRIMA...');
            
            // Inicializa módulos base que o DOM precisa
            this.modules.notificationManager.initialize();
            this.setupEventListeners();
            this.setupOfflineDetection();
            
            // Inicializa estado da aplicação (agora chama o stateManager global)
            await window.stateManager.initialize();
            
            // Inicializa componentes da UI (que dependem do estado)
            this.initializeUIComponents();
            
            // Remove loading screen
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.info('✅ ALSHAM 360° PRIMA inicializado com sucesso');
            
            // Notifica usuário
            this.modules.notificationManager.success('Sistema inicializado com sucesso!');
            
        } catch (error) {
            this.modules.errorTracker.captureError(error, { 
                component: 'AutomationApp', 
                action: 'initialize',
                severity: 'critical'
            });
            
            this.showErrorScreen(error);
        }
    }

    /**
     * Configura event listeners globais
     */
    setupEventListeners() {
        // Retry button no error boundary
        document.getElementById('retry-btn')?.addEventListener('click', () => {
            window.location.reload();
        });
        
        // Botões principais
        document.getElementById('create-automation-btn')?.addEventListener('click', 
            () => this.handleCreateAutomation());
        
        document.getElementById('refresh-automations-btn')?.addEventListener('click', 
            () => this.handleRefreshAutomations());
        
        document.getElementById('sync-automations-btn')?.addEventListener('click', 
            () => this.handleSyncAutomations());
        
        document.getElementById('logout-btn')?.addEventListener('click', 
            () => this.handleLogout());
        
        // Quick actions
        document.getElementById('create-lead-nurturing-btn')?.addEventListener('click', 
            () => this.handleCreateLeadNurturing());
        
        document.getElementById('create-follow-up-btn')?.addEventListener('click', 
            () => this.handleCreateFollowUp());
        
        document.getElementById('create-lead-scoring-btn')?.addEventListener('click', 
            () => this.handleCreateLeadScoring());
        
        // Campaign tabs
        this.setupCampaignTabs();
        
        // Filter
        document.getElementById('automation-filter')?.addEventListener('change', 
            (e) => this.handleFilterChange(e.target.value));
    }

    /**
     * Configura detecção offline/online
     */
    setupOfflineDetection() {
        const updateOnlineStatus = () => {
            const indicator = document.getElementById('offline-indicator');
            if (!navigator.onLine) {
                indicator?.classList.remove('hidden');
                this.modules.notificationManager.warning('Você está offline. Algumas funcionalidades podem estar indisponíveis.', { persistent: true });
            } else {
                indicator?.classList.add('hidden');
                // Poderia fechar a notificação persistente se tivéssemos o ID salvo
            }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }

    /**
     * Inicializa componentes da UI
     */
    initializeUIComponents() {
        // Subscreve a mudanças de estado
        window.stateManager.subscribe('automations', (automations) => {
            this.renderAutomations(automations);
            this.updateStats(automations);
        });
        
        window.stateManager.subscribe('campaigns', (campaigns) => {
            // Re-renderiza campanhas apenas se a aba ativa for relevante (otimização)
            const activeTab = window.stateManager.getState('ui')?.activeTab;
            if (activeTab) {
                this.renderCampaignsByType(activeTab, campaigns);
            }
        });
        
        window.stateManager.subscribe('executionHistory', (history) => {
            this.renderExecutionHistory(history);
        });
        
        window.stateManager.subscribe('systemHealth', (health) => {
            this.updateSystemHealth(health);
        });
        
        window.stateManager.subscribe('user', (user) => {
            this.updateUserInfo(user);
        });

        // Renderização inicial com dados carregados no initialize do stateManager
        this.renderAutomations(window.stateManager.getState('automations'));
        this.renderCampaignsByType(window.stateManager.getState('ui').activeTab, window.stateManager.getState('campaigns'));
        this.renderExecutionHistory(window.stateManager.getState('executionHistory'));
        this.updateSystemHealth(window.stateManager.getState('systemHealth'));
        this.updateUserInfo(window.stateManager.getState('user'));
    }

    /**
     * Renderiza lista de automações
     * @param {Array} automations - Lista de automações
     */
    renderAutomations(automations) {
        const container = document.getElementById('automation-rules-list');
        if (!container) return;
        
        if (!automations || automations.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <div class="text-4xl mb-4">🤖</div>
                    <div class="text-lg font-medium mb-2">Nenhuma automação encontrada</div>
                    <div class="text-sm">Crie sua primeira automação para começar</div>
                    <button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            onclick="window.automationApp.handleCreateAutomation()">
                        Criar Primeira Automação
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = automations.map(automation => `
            <div class="p-6 hover:bg-gray-50 transition-colors border-b last:border-b-0" data-automation-id="${automation.id}">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-3">
                            <div class="w-3 h-3 rounded-full ${automation.active ? 'bg-green-500' : 'bg-gray-300'} flex-shrink-0"></div>
                            <h3 class="text-lg font-medium text-gray-900 truncate">${DataValidator.sanitizeHTML(automation.name)}</h3>
                            <span class="text-xs px-2 py-1 rounded-full ${automation.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} flex-shrink-0">
                                ${automation.active ? 'Ativa' : 'Inativa'}
                            </span>
                        </div>
                        <p class="text-sm text-gray-600 mt-1 truncate">${DataValidator.sanitizeHTML(automation.description || 'Sem descrição')}</p>
                        <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Trigger: ${automation.trigger?.type || 'Não definido'}</span>
                            <span>Ações: ${automation.actions?.length || 0}</span>
                            <span>Última execução: ${automation.lastExecution ? new Date(automation.lastExecution).toLocaleDateString('pt-BR') : 'Nunca'}</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <button class="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                                title="Editar automação"
                                onclick="window.automationApp.handleEditAutomation('${automation.id}')">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="p-2 text-gray-400 hover:text-${automation.active ? 'red' : 'green'}-600 transition-colors" 
                                title="${automation.active ? 'Desativar' : 'Ativar'} automação"
                                onclick="window.automationApp.handleToggleAutomation('${automation.id}')">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                ${automation.active ? 
                                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />' : // Ícone Pause
                                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />' // Ícone Play
                                }
                            </svg>
                        </button>
                        <button class="p-2 text-gray-400 hover:text-red-600 transition-colors" 
                                title="Excluir automação"
                                onclick="window.automationApp.handleDeleteAutomation('${automation.id}')">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Atualiza estatísticas das automações
     * @param {Array} automations - Lista de automações
     */
    updateStats(automations) {
        const container = document.getElementById('automation-stats');
        if (!container || !automations) return;
        
        const stats = {
            total: automations.length,
            active: automations.filter(a => a.active).length,
            executions: automations.reduce((acc, a) => acc + (a.executionCount || 0), 0),
            successRate: this.calculateSuccessRate(automations)
        };
        
        container.innerHTML = `
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div class="ml-4 min-w-0">
                        <p class="text-sm font-medium text-gray-600 truncate">Total de Automações</p>
                        <p class="text-2xl font-bold text-gray-900">${stats.total}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <div class="ml-4 min-w-0">
                        <p class="text-sm font-medium text-gray-600 truncate">Ativas</p>
                        <p class="text-2xl font-bold text-gray-900">${stats.active}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 13v-1m4 1v-3m4 3V8M8 21l4-7 4 7M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                        </svg>
                    </div>
                    <div class="ml-4 min-w-0">
                        <p class="text-sm font-medium text-gray-600 truncate">Execuções (24h)</p>
                        <p class="text-2xl font-bold text-gray-900">${stats.executions.toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                        </svg>
                    </div>
                    <div class="ml-4 min-w-0">
                        <p class="text-sm font-medium text-gray-600 truncate">Taxa de Sucesso</p>
                        <p class="text-2xl font-bold text-gray-900">${stats.successRate}%</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Configura tabs de campanhas
     */
    setupCampaignTabs() {
        const tabContainer = document.getElementById('campaign-tabs');
        if (!tabContainer) return;

        tabContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-tab]');
            if (!button) return;

            const tabId = button.id;
            const campaignType = button.dataset.tab;

            // Remove active de todas as tabs
            tabContainer.querySelectorAll('button[data-tab]').forEach(tab => {
                tab.classList.remove('active', 'border-blue-500', 'text-blue-600', 'bg-blue-50');
                tab.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
                tab.setAttribute('aria-selected', 'false');
                tab.setAttribute('tabindex', '-1');
            });
            
            // Ativa tab clicada
            button.classList.add('active', 'border-blue-500', 'text-blue-600', 'bg-blue-50');
            button.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            button.setAttribute('aria-selected', 'true');
            button.setAttribute('tabindex', '0');
            
            // Atualiza estado
            window.stateManager.setState('ui', {
                ...window.stateManager.getState('ui'),
                activeTab: campaignType
            });
            
            // Renderiza campanhas do tipo selecionado
            this.renderCampaignsByType(campaignType, window.stateManager.getState('campaigns'));
        });
    }

    /**
     * Renderiza campanhas por tipo
     * @param {string} type - Tipo de campanha
     * @param {Array} allCampaigns - (Opcional) Lista completa de campanhas
     */
    renderCampaignsByType(type, allCampaigns) {
        const campaigns = allCampaigns || window.stateManager.getState('campaigns') || [];
        const filteredCampaigns = campaigns.filter(c => c.type === type);
        
        const container = document.getElementById('campaigns-list');
        if (!container) return;
        
        if (filteredCampaigns.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-4">${type === 'email' ? '📧' : type === 'sms' ? '📱' : '💬'}</div>
                    <div class="text-lg font-medium mb-2">Nenhuma campanha de ${type}</div>
                    <div class="text-sm">Crie sua primeira campanha para começar</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredCampaigns.map(campaign => `
            <div class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-4">
                <div class="flex items-center justify-between">
                    <div class="min-w-0">
                        <h4 class="font-medium text-gray-900 truncate">${DataValidator.sanitizeHTML(campaign.name)}</h4>
                        <p class="text-sm text-gray-600 truncate">${DataValidator.sanitizeHTML(campaign.description || '')}</p>
                        <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Status: ${campaign.status}</span>
                            <span>Enviados: ${campaign.sentCount || 0}</span>
                            <span>Taxa de abertura: ${campaign.openRate || 0}%</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <button class="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Ver detalhes">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Atualiza informações do usuário
     * @param {Object} user - Dados do usuário
     */
    updateUserInfo(user) {
        if (!user) return;
        
        const avatar = document.getElementById('user-avatar');
        const name = document.getElementById('user-name');
        
        if (avatar) {
            const initial = user.name?.charAt(0)?.toUpperCase() || 'U';
            avatar.textContent = initial;
            avatar.setAttribute('aria-label', `Avatar de ${user.name || 'usuário'}`);
        }
        
        if (name) {
            name.textContent = DataValidator.sanitizeHTML(user.name || 'Usuário');
        }
    }

    /**
     * Atualiza status de saúde do sistema
     * @param {Object} health - Status de saúde
     */
    updateSystemHealth(health) {
        const apiStatus = document.getElementById('api-status');
        const processingStatus = document.getElementById('processing-status');
        
        if (apiStatus) {
            const isHealthy = health?.api === 'healthy';
            apiStatus.innerHTML = `
                <div class="w-2 h-2 ${isHealthy ? 'bg-green-500' : 'bg-red-500'} rounded-full ${isHealthy ? 'animate-pulse' : ''}"></div>
                <span class="text-sm ${isHealthy ? 'text-green-600' : 'text-red-600'}">
                    API: ${isHealthy ? 'Operacional' : 'Indisponível'}
                </span>
            `;
        }
        
        if (processingStatus) {
            const isNormal = health?.processing === 'normal';
            processingStatus.innerHTML = `
                <div class="w-2 h-2 ${isNormal ? 'bg-green-500' : 'bg-yellow-500'} rounded-full ${isNormal ? 'animate-pulse' : ''}"></div>
                <span class="text-sm ${isNormal ? 'text-green-600' : 'text-yellow-600'}">
                    Processamento: ${isNormal ? 'Normal' : 'Degradado'}
                </span>
            `;
        }
    }

    /**
     * Renderiza histórico de execuções
     * @param {Array} history - Histórico de execuções
     */
    renderExecutionHistory(history) {
        const container = document.getElementById('execution-history');
        if (!container || !history) return;
        
        if (history.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-gray-500">
                    <div class="text-sm">Nenhuma execução recente</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = history.slice(0, 10).map(execution => `
            <div class="p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2">
                            <div class="w-2 h-2 rounded-full ${execution.status === 'success' ? 'bg-green-500' : execution.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}"></div>
                            <span class="text-sm font-medium text-gray-900 truncate">${DataValidator.sanitizeHTML(execution.automationName)}</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                            ${new Date(execution.timestamp).toLocaleString('pt-BR')}
                        </div>
                        ${execution.error ? `
                            <div class="text-xs text-red-600 mt-1 truncate">
                                ${DataValidator.sanitizeHTML(execution.error)}
                            </div>
                        ` : ''}
                    </div>
                    <div class="text-xs text-gray-400 flex-shrink-0 ml-2">
                        ${execution.duration}ms
                    </div>
                </div>
            </div>
        `).join('');
    }

    // =====================================================
    // EVENT HANDLERS (Ações do Usuário)
    // =====================================================

    /**
     * Handler para criar nova automação
     */
    async handleCreateAutomation() {
        try {
            this.modules.notificationManager.info('Abrindo assistente de criação...');
            
            // Simula abertura de modal/página de criação
            console.info('🔧 Create Automation Modal');
            
            // Em implementação real, abriria modal ou redirecionaria
            // this.modules.notificationManager.success('Modal de criação em desenvolvimento');
            
        } catch (error) {
            this.modules.errorTracker.captureError(error, { 
                component: 'AutomationApp', 
                action: 'handleCreateAutomation' 
            });
            this.modules.notificationManager.error('Erro ao abrir criação de automação');
        }
    }

    /**
     * Handler para atualizar automações
     */
    async handleRefreshAutomations() {
        try {
            this.modules.notificationManager.info('Atualizando automações...');
            
            // Recarrega dados
            await window.stateManager.loadAutomations();
            
            this.modules.notificationManager.success('Automações atualizadas com sucesso');
            
        } catch (error) {
            this.modules.errorTracker.captureError(error, { 
                component: 'AutomationApp', 
                action: 'handleRefreshAutomations' 
            });
            this.modules.notificationManager.error('Erro ao atualizar automações');
        }
    }

    /**
     * Handler para sincronizar automações
     */
    async handleSyncAutomations() {
        try {
            this.modules.notificationManager.info('Sincronizando com servidor...');
            
            await this.modules.apiClient.post('/api/automations/sync');
            await window.stateManager.loadAutomations();
            
            this.modules.notificationManager.success('Sincronização concluída');
            
        } catch (error) {
            this.modules.errorTracker.captureError(error, { 
                component: 'AutomationApp', 
                action: 'handleSyncAutomations' 
            });
            this.modules.notificationManager.error('Erro na sincronização');
        }
    }

    /**
     * Handler para logout
     */
    async handleLogout() {
        try {
            const confirmLogout = confirm('Deseja realmente encerrar a sessão?');
            if (!confirmLogout) return;
            
            this.modules.notificationManager.info('Encerrando sessão...');
            
            await this.modules.apiClient.post('/api/auth/logout');
            localStorage.removeItem('auth_token');
            
            window.location.href = '/login';
            
        } catch (error) {
            this.modules.errorTracker.captureError(error, { 
                component: 'AutomationApp', 
                action: 'handleLogout' 
            });
            this.modules.notificationManager.error('Erro ao encerrar sessão');
        }
    }

    /**
     * Handler para filtrar automações
     * @param {string} filter - Filtro selecionado
     */
    handleFilterChange(filter) {
        window.stateManager.setState('ui', {
            ...window.stateManager.getState('ui'),
            filter
        });
        
        const automations = window.stateManager.getState('automations');
        if (!automations) return;
        
        let filteredAutomations = automations;
        
        switch (filter) {
            case 'active':
                filteredAutomations = automations.filter(a => a.active);
                break;
            case 'inactive':
                filteredAutomations = automations.filter(a => !a.active);
                break;
            case 'draft':
                filteredAutomations = automations.filter(a => a.status === 'draft');
                break;
        // O default (case 'all') já está coberto por filteredAutomations = automations
        }
        
        this.renderAutomations(filteredAutomations);
    }

    /**
     * Handlers para quick actions
     */
    async handleCreateLeadNurturing() {
        this.modules.notificationManager.info('Criando sequência de nutrição...');
        // Implementar lógica específica
    }

    async handleCreateFollowUp() {
        this.modules.notificationManager.info('Configurando follow-up inteligente...');
        // Implementar lógica específica
    }

    async handleCreateLeadScoring() {
        this.modules.notificationManager.info('Configurando pontuação de leads...');
        // Implementar lógica específica
    }

    /**
     * Handlers para ações em automações
     */
    async handleEditAutomation(id) {
        console.info(`🔧 Edit automation: ${id}`);
        this.modules.notificationManager.info('Abrindo editor de automação...');
    }

    async handleToggleAutomation(id) {
        try {
            const automations = window.stateManager.getState('automations');
            const automation = automations.find(a => a.id === id);
            
            if (!automation) return;
            
            const newStatus = !automation.active;
            await this.modules.apiClient.put(`/api/automations/${id}/toggle`, { active: newStatus });
            
            // Atualiza estado local (imutável)
            const updatedAutomations = automations.map(a => 
                a.id === id ? { ...a, active: newStatus } : a
            );
            window.stateManager.setState('automations', updatedAutomations);
            
            this.modules.notificationManager.success(
                `Automação ${newStatus ? 'ativada' : 'desativada'} com sucesso`
            );
            
        } catch (error) {
            this.modules.errorTracker.captureError(error, { 
                component: 'AutomationApp', 
                action: 'handleToggleAutomation',
                automationId: id
            });
            this.modules.notificationManager.error('Erro ao alterar status da automação');
        }
    }

    async handleDeleteAutomation(id) {
        try {
            const confirmDelete = confirm('Tem certeza que deseja excluir esta automação? Esta ação não pode ser desfeita.');
            if (!confirmDelete) return;
            
            await this.modules.apiClient.delete(`/api/automations/${id}`);
            
            // Remove do estado local (imutável)
            const automations = window.stateManager.getState('automations');
            const filtered = automations.filter(a => a.id !== id);
            window.stateManager.setState('automations', filtered);
            
            this.modules.notificationManager.success('Automação excluída com sucesso');
            
        } catch (error) {
            this.modules.errorTracker.captureError(error, { 
                component: 'AutomationApp', 
                action: 'handleDeleteAutomation',
                automationId: id
            });
            this.modules.notificationManager.error('Erro ao excluir automação');
        }
    }

    // =====================================================
    // UTILITY METHODS
    // =====================================================

    /**
     * Calcula taxa de sucesso das automações
     * @param {Array} automations - Lista de automações
     * @returns {number} Taxa de sucesso
     */
    calculateSuccessRate(automations) {
        if (!automations || automations.length === 0) return 0;
        
        const totalExecutions = automations.reduce((acc, a) => acc + (a.executionCount || 0), 0);
        const successfulExecutions = automations.reduce((acc, a) => acc + (a.successCount || 0), 0);
        
        if (totalExecutions === 0) return 100; // Se não houve execuções, a taxa é 100% (ou 0, dependendo da regra de negócio)
        return Math.round((successfulExecutions / totalExecutions) * 100);
    }

    /**
     * Remove tela de loading
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 500);
        }
    }

    /**
     * Mostra tela de erro
     */
    showErrorScreen(error) {
        document.getElementById('loading-screen')?.classList.add('hidden');
        const errorBoundary = document.getElementById('error-boundary');
        if (errorBoundary) {
            errorBoundary.classList.remove('hidden');
            const errorMessage = errorBoundary.querySelector('#error-message');
            if (errorMessage && error) {
                errorMessage.textContent = error.message || 'Um erro desconhecido ocorreu.';
            }
        }
    }
}

// =====================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =====================================================

/**
 * Inicializa a aplicação quando DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Cria instância global da aplicação
        window.automationApp = new AutomationApp();
        
        // Inicializa aplicação
        await window.automationApp.initialize();
        
    } catch (error) {
        console.error('❌ Falha crítica na inicialização:', error);
        
        // Fallback para erro crítico
        document.getElementById('loading-screen')?.classList.add('hidden');
        const errorBoundary = document.getElementById('error-boundary');
        if (errorBoundary) {
            errorBoundary.classList.remove('hidden');
            const errorMessage = errorBoundary.querySelector('#error-message');
            if (errorMessage && error) {
                errorMessage.textContent = error.message;
            }
        }
    }
});

// =====================================================
// EXPORTS PARA MÓDULOS EXTERNOS (se necessário)
// =====================================================

// Se este arquivo for um módulo ES6, exportamos as classes.
// Se for um script global, elas já estão no escopo (embora encapsuladas pela classe App).
// Vamos assumir que é um módulo, como os arquivos anteriores.

export {
    ErrorTracker,
    StateManager, 
    APIClient,
    DataValidator,
    NotificationManager,
    AutomationApp
};
