// ALSHAM 360° PRIMA - Sistema de Automações Enterprise
// Versão compatível com Vite/Rollup build system

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

// ===== CONFIGURAÇÕES GLOBAIS =====
const AUTOMATION_CONFIG = {
    REFRESH_INTERVAL: 30000,
    CACHE_TTL: 300000,
    MAX_RETRIES: 3,
    DEBOUNCE_DELAY: 300,
    
    AUTOMATION_TYPES: [
        { value: 'lead_nurturing', label: 'Nutrição de Leads', icon: '🌱', color: 'emerald' },
        { value: 'email_sequence', label: 'Sequência de Email', icon: '📧', color: 'blue' },
        { value: 'sms_campaign', label: 'Campanha SMS', icon: '📱', color: 'purple' },
        { value: 'whatsapp_flow', label: 'Fluxo WhatsApp', icon: '💬', color: 'green' },
        { value: 'lead_scoring', label: 'Pontuação de Leads', icon: '⭐', color: 'yellow' },
        { value: 'follow_up', label: 'Follow-up Automático', icon: '🔄', color: 'orange' },
        { value: 'task_creation', label: 'Criação de Tarefas', icon: '📋', color: 'gray' },
        { value: 'notification', label: 'Notificações', icon: '🔔', color: 'red' }
    ],
    
    STATUS_OPTIONS: [
        { value: 'active', label: 'Ativo', color: 'green', icon: '✅' },
        { value: 'paused', label: 'Pausado', color: 'yellow', icon: '⏸️' },
        { value: 'draft', label: 'Rascunho', color: 'gray', icon: '📝' },
        { value: 'error', label: 'Erro', color: 'red', icon: '❌' },
        { value: 'testing', label: 'Teste', color: 'blue', icon: '🧪' }
    ],
    
    // Classes CSS estáticas para evitar problemas de build
    STATIC_STYLES: {
        active: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
        paused: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
        draft: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
        error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
        testing: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
        
        success: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
        failed: { bg: 'bg-red-100', text: 'text-red-800' },
        running: { bg: 'bg-blue-100', text: 'text-blue-800' },
        pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
        completed: { bg: 'bg-emerald-100', text: 'text-emerald-800' }
    }
};

// ===== ESTADO GLOBAL =====
const automationState = {
    // Core data
    user: null,
    profile: null,
    orgId: null,
    
    // Collections
    automations: new Map(),
    executionHistory: new Map(),
    templates: new Map(),
    campaigns: {
        email: new Map(),
        sms: new Map(),
        whatsapp: new Map()
    },
    workflows: new Map(),
    
    // Metrics
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
    
    // UI State
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
    refreshInterval: null
};

// ===== UTILITÁRIOS =====
class Utils {
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    
    static formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            console.warn('Erro ao formatar data:', error);
            return 'Data inválida';
        }
    }
    
    static formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        return num.toLocaleString('pt-BR');
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    static validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    static sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.trim().replace(/[<>]/g, '');
    }
}

// ===== NOTIFICAÇÕES =====
class NotificationSystem {
    constructor() {
        this.notifications = new Map();
        this.container = this.createContainer();
    }
    
    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
        return container;
    }
    
    show(message, type = 'info', duration = 5000) {
        const id = Utils.generateId();
        const notification = this.createNotification(id, message, type, duration);
        
        this.notifications.set(id, notification);
        this.container.appendChild(notification.element);
        
        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }
        
        return id;
    }
    
    createNotification(id, message, type, duration) {
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
        
        element.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <span class="text-lg" role="img">${config.icon}</span>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium">${Utils.escapeHtml(message)}</p>
                </div>
                <div class="ml-4 flex-shrink-0">
                    <button 
                        type="button" 
                        class="inline-flex rounded-md hover:opacity-75"
                        onclick="window.notificationSystem.dismiss('${id}')"
                        aria-label="Fechar notificação"
                    >
                        <span class="text-lg">×</span>
                    </button>
                </div>
            </div>
        `;
        
        // Animate in
        requestAnimationFrame(() => {
            element.classList.remove('opacity-0', 'translate-x-full');
        });
        
        return { id, element, type, message, createdAt: Date.now() };
    }
    
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        notification.element.classList.add('opacity-0', 'translate-x-full');
        
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(id);
        }, 300);
    }
    
    clear() {
        this.notifications.forEach((_, id) => this.dismiss(id));
    }
}

// ===== GERENCIAMENTO DE DADOS =====
class DataManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
    }
    
    async executeRequest(apiFunction, args = [], options = {}) {
        const cacheKey = options.cacheKey || `${apiFunction.name}_${JSON.stringify(args)}`;
        
        // Check cache
        if (options.useCache !== false && this.isValidCache(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const result = await apiFunction(...args);
            
            // Handle different response formats
            let data, error;
            if (result && typeof result === 'object') {
                if ('data' in result && 'error' in result) {
                    data = result.data;
                    error = result.error;
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
            if (options.useCache !== false) {
                this.setCache(cacheKey, { data, error: null });
            }
            
            return { data, error: null };
            
        } catch (apiError) {
            console.error(`API Error in ${apiFunction.name}:`, apiError);
            throw apiError;
        }
    }
    
    isValidCache(key) {
        const timestamp = this.cacheTimestamps.get(key);
        return timestamp && (Date.now() - timestamp < AUTOMATION_CONFIG.CACHE_TTL);
    }
    
    setCache(key, value) {
        this.cache.set(key, value);
        this.cacheTimestamps.set(key, Date.now());
    }
    
    clearCache(pattern = '') {
        if (!pattern) {
            this.cache.clear();
            this.cacheTimestamps.clear();
            return;
        }
        
        for (const [key] of this.cache.entries()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
                this.cacheTimestamps.delete(key);
            }
        }
    }
}

// ===== SISTEMA PRINCIPAL =====
class AutomationSystem {
    constructor() {
        this.dataManager = new DataManager();
        this.notificationSystem = new NotificationSystem();
        this.isInitialized = false;
        
        // Bind methods
        this.handleClick = this.handleClick.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.refreshData = Utils.debounce(this.refreshData.bind(this), AUTOMATION_CONFIG.DEBOUNCE_DELAY);
    }
    
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            this.showLoading(true, 'Inicializando sistema de automações...');
            
            // Verify authentication
            const authResult = await this.verifyAuth();
            if (!authResult.success) {
                window.location.href = '/login.html';
                return;
            }
            
            // Load data
            await this.loadAllData();
            
            // Setup UI
            this.setupEventListeners();
            this.renderInterface();
            this.setupRealTimeUpdates();
            
            this.isInitialized = true;
            automationState.isLoading = false;
            
            this.showLoading(false);
            this.notificationSystem.show('Sistema carregado com sucesso!', 'success');
            
            console.log('🤖 Automation System initialized');
            
        } catch (error) {
            console.error('Initialization error:', error);
            automationState.error = error.message;
            this.showLoading(false);
            this.notificationSystem.show(`Erro: ${error.message}`, 'error');
            this.loadDemoData();
        }
    }
    
    async verifyAuth() {
        try {
            const result = await this.dataManager.executeRequest(getCurrentUser, [], { useCache: false });
            
            if (result.error || !result.data || !result.data.user) {
                return { success: false };
            }
            
            const { user, profile } = result.data;
            automationState.user = user;
            automationState.profile = profile;
            automationState.orgId = profile?.org_id || 'default-org-id';
            
            return { success: true };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async loadAllData() {
        const { orgId } = automationState;
        
        const loaders = [
            { name: 'automations', fn: getAutomationRules, args: [orgId] },
            { name: 'executions', fn: getAutomationExecutions, args: [orgId] },
            { name: 'templates', fn: getCommunicationTemplates, args: [orgId] },
            { name: 'emailCampaigns', fn: getEmailCampaigns, args: [orgId] },
            { name: 'smsCampaigns', fn: getSMSCampaigns, args: [orgId] },
            { name: 'workflows', fn: getN8NWorkflows, args: [orgId] },
            { name: 'whatsappIntegration', fn: getWhatsappIntegration, args: [orgId] }
        ];
        
        const results = await Promise.allSettled(
            loaders.map(loader => 
                this.dataManager.executeRequest(loader.fn, loader.args, { cacheKey: `${loader.name}_${orgId}` })
            )
        );
        
        // Process results
        results.forEach((result, index) => {
            const loader = loaders[index];
            
            if (result.status === 'fulfilled' && result.value && result.value.data) {
                const data = Array.isArray(result.value.data) ? result.value.data : [result.value.data];
                
                switch (loader.name) {
                    case 'automations':
                        automationState.automations = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'executions':
                        automationState.executionHistory = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'templates':
                        automationState.templates = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'emailCampaigns':
                        automationState.campaigns.email = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'smsCampaigns':
                        automationState.campaigns.sms = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'whatsappIntegration':
                        automationState.campaigns.whatsapp = new Map(data.map(item => [item.id, item]));
                        break;
                    case 'workflows':
                        automationState.workflows = new Map(data.map(item => [item.id, item]));
                        break;
                }
            }
        });
        
        this.calculateMetrics();
        automationState.lastUpdate = new Date().toISOString();
    }
    
    calculateMetrics() {
        const automations = Array.from(automationState.automations.values());
        const executions = Array.from(automationState.executionHistory.values());
        
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // Basic metrics
        automationState.metrics.totalExecutions = executions.length;
        automationState.metrics.activeAutomations = automations.filter(auto => 
            auto.is_active === true || auto.status === 'active'
        ).length;
        
        // Today's executions
        automationState.metrics.executionsToday = executions.filter(exec => {
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
        
        automationState.metrics.successRate = automationState.metrics.totalExecutions > 0 
            ? Number(((successfulExecutions / automationState.metrics.totalExecutions) * 100).toFixed(1))
            : 0;
        
        // Error rate
        const failedExecutions = executions.filter(exec => 
            exec.status === 'failed' || exec.status === 'error'
        ).length;
        
        automationState.metrics.errorRate = automationState.metrics.totalExecutions > 0 
            ? Number(((failedExecutions / automationState.metrics.totalExecutions) * 100).toFixed(1))
            : 0;
        
        // Estimated metrics
        automationState.metrics.totalLeadsProcessed = Math.floor(automationState.metrics.totalExecutions * 1.2);
        automationState.metrics.conversionRate = Number((automationState.metrics.successRate * 0.15).toFixed(1));
    }
    
    renderInterface() {
        this.renderStats();
        this.renderAutomationsList();
        this.renderCampaigns();
        this.renderExecutionHistory();
        this.renderQuickActions();
    }
    
    renderStats() {
        const container = document.getElementById('automation-stats');
        if (!container) return;
        
        const { metrics } = automationState;
        
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div class="bg-white rounded-lg p-4 shadow-sm border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Automações Ativas</p>
                            <p class="text-2xl font-bold text-emerald-600">${Utils.formatNumber(metrics.activeAutomations)}</p>
                        </div>
                        <div class="text-emerald-600 text-2xl">🤖</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-4 shadow-sm border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Execuções Hoje</p>
                            <p class="text-2xl font-bold text-blue-600">${Utils.formatNumber(metrics.executionsToday)}</p>
                        </div>
                        <div class="text-blue-600 text-2xl">⚡</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-4 shadow-sm border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Taxa de Sucesso</p>
                            <p class="text-2xl font-bold text-purple-600">${metrics.successRate}%</p>
                        </div>
                        <div class="text-purple-600 text-2xl">📈</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-4 shadow-sm border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Total Execuções</p>
                            <p class="text-2xl font-bold text-orange-600">${Utils.formatNumber(metrics.totalExecutions)}</p>
                        </div>
                        <div class="text-orange-600 text-2xl">🔄</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-4 shadow-sm border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Leads Processados</p>
                            <p class="text-2xl font-bold text-indigo-600">${Utils.formatNumber(metrics.totalLeadsProcessed)}</p>
                        </div>
                        <div class="text-indigo-600 text-2xl">👥</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-4 shadow-sm border">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Taxa Conversão</p>
                            <p class="text-2xl font-bold text-emerald-600">${metrics.conversionRate}%</p>
                        </div>
                        <div class="text-emerald-600 text-2xl">💰</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAutomationsList() {
        const container = document.getElementById('automations-list');
        if (!container) return;
        
        const automations = Array.from(automationState.automations.values());
        
        if (automations.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-lg p-8 text-center shadow-sm border">
                    <div class="text-gray-400 text-6xl mb-4">🤖</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma automação encontrada</h3>
                    <p class="text-gray-600 mb-4">Crie sua primeira automação para começar.</p>
                    <button data-action="create-automation" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Criar Primeira Automação
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-medium text-gray-900">Automações (${automations.length})</h3>
                        <button data-action="create-automation" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            + Nova Automação
                        </button>
                    </div>
                </div>
                
                <div class="divide-y divide-gray-200">
                    ${automations.map(automation => `
                        <div class="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="text-2xl">${this.getAutomationIcon(automation.type)}</div>
                                    <div>
                                        <h4 class="text-sm font-medium text-gray-900">${Utils.escapeHtml(automation.name || 'Automação sem nome')}</h4>
                                        <p class="text-sm text-gray-600">${Utils.escapeHtml(automation.description || 'Sem descrição')}</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center space-x-4">
                                    ${this.renderStatusBadge(automation.status || (automation.is_active ? 'active' : 'paused'))}
                                    
                                    <div class="text-sm text-gray-600">
                                        ${Utils.formatNumber(automation.execution_count || 0)} execuções
                                    </div>
                                    
                                    <div class="flex space-x-2">
                                        <button class="text-blue-600 hover:text-blue-900 text-sm" data-action="edit-automation" data-id="${automation.id}">
                                            Editar
                                        </button>
                                        <button class="text-red-600 hover:text-red-900 text-sm" data-action="delete-automation" data-id="${automation.id}">
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderCampaigns() {
        const container = document.getElementById('campaigns-section');
        if (!container) return;
        
        const emailCount = automationState.campaigns.email.size;
        const smsCount = automationState.campaigns.sms.size;
        const whatsappCount = automationState.campaigns.whatsapp.size;
        const totalCampaigns = emailCount + smsCount + whatsappCount;
        
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Campanhas de Comunicação</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div class="text-3xl mb-2">📧</div>
                        <p class="text-sm text-gray-600">Email</p>
                        <p class="text-2xl font-bold text-blue-600">${Utils.formatNumber(emailCount)}</p>
                    </div>
                    
                    <div class="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div class="text-3xl mb-2">📱</div>
                        <p class="text-sm text-gray-600">SMS</p>
                        <p class="text-2xl font-bold text-purple-600">${Utils.formatNumber(smsCount)}</p>
                    </div>
                    
                    <div class="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div class="text-3xl mb-2">💬</div>
                        <p class="text-sm text-gray-600">WhatsApp</p>
                        <p class="text-2xl font-bold text-emerald-600">${Utils.formatNumber(whatsappCount)}</p>
                    </div>
                </div>
                
                ${totalCampaigns === 0 ? `
                    <div class="text-center mt-6">
                        <p class="text-gray-600 mb-4">Nenhuma campanha ativa encontrada.</p>
                        <button data-action="create-campaign" data-type="email" class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
                            Criar Primeira Campanha
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderExecutionHistory() {
        const container = document.getElementById('execution-history');
        if (!container) return;
        
        const executions = Array.from(automationState.executionHistory.values()).slice(0, 10);
        
        if (executions.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <div class="text-gray-400 text-4xl mb-2">📊</div>
                    <p class="text-gray-600">Nenhuma execução recente encontrada.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Execuções Recentes</h3>
                </div>
                
                <div class="divide-y divide-gray-200">
                    ${executions.map(execution => `
                        <div class="px-6 py-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-900">
                                        ${Utils.escapeHtml(execution.automation_name || 'Automação')}
                                    </p>
                                    <p class="text-sm text-gray-600">
                                        ${Utils.formatDate(execution.created_at || execution.executed_at)}
                                    </p>
                                </div>
                                
                                <div class="flex items-center space-x-2">
                                    ${this.renderExecutionStatus(execution.status)}
                                    <span class="text-sm text-gray-600">
                                        ${execution.execution_time_ms ? `${execution.execution_time_ms}ms` : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderQuickActions() {
        const container = document.getElementById('quick-actions');
        if (!container) return;
        
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
                
                <div class="space-y-3">
                    <button data-action="create-automation" class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <span class="text-2xl mr-3">🤖</span>
                        <div>
                            <p class="font-medium text-gray-900">Nova Automação</p>
                            <p class="text-sm text-gray-600">Criar fluxo automatizado</p>
                        </div>
                    </button>
                    
                    <button data-action="create-campaign" data-type="email" class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <span class="text-2xl mr-3">📧</span>
                        <div>
                            <p class="font-medium text-gray-900">Campanha Email</p>
                            <p class="text-sm text-gray-600">Envio em massa de emails</p>
                        </div>
                    </button>
                    
                    <button data-action="create-campaign" data-type="sms" class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <span class="text-2xl mr-3">📱</span>
                        <div>
                            <p class="font-medium text-gray-900">Campanha SMS</p>
                            <p class="text-sm text-gray-600">Mensagens automáticas</p>
                        </div>
                    </button>
                    
                    <button data-action="view-templates" class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <span class="text-2xl mr-3">📋</span>
                        <div>
                            <p class="font-medium text-gray-900">Templates</p>
                            <p class="text-sm text-gray-600">Modelos de comunicação</p>
                        </div>
                    </button>
                </div>
            </div>
        `;
    }
    
    // Helper methods
    getAutomationIcon(type) {
        const typeConfig = AUTOMATION_CONFIG.AUTOMATION_TYPES.find(t => t.value === type);
        return typeConfig ? typeConfig.icon : '🤖';
    }
    
    renderStatusBadge(status) {
        const styles = AUTOMATION_CONFIG.STATIC_STYLES[status] || AUTOMATION_CONFIG.STATIC_STYLES.draft;
        const statusConfig = AUTOMATION_CONFIG.STATUS_OPTIONS.find(s => s.value === status) || 
                            { label: status || 'Desconhecido', icon: '❓' };
        
        return `
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}">
                <span class="mr-1">${statusConfig.icon}</span>
                ${Utils.escapeHtml(statusConfig.label)}
            </span>
        `;
    }
    
    renderExecutionStatus(status) {
        const styles = AUTOMATION_CONFIG.STATIC_STYLES[status] || AUTOMATION_CONFIG.STATIC_STYLES.pending;
        const statusMap = {
            'completed': { label: 'Concluído', icon: '✅' },
            'success': { label: 'Sucesso', icon: '✅' },
            'failed': { label: 'Falhou', icon: '❌' },
            'error': { label: 'Erro', icon: '❌' },
            'running': { label: 'Executando', icon: '⏳' },
            'pending': { label: 'Pendente', icon: '⏸️' }
        };
        
        const config = statusMap[status] || { label: status || 'Desconhecido', icon: '❓' };
        
        return `
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text}">
                <span class="mr-1">${config.icon}</span>
                ${Utils.escapeHtml(config.label)}
            </span>
        `;
    }
    
    // Event handlers
    setupEventListeners() {
        document.addEventListener('click', this.handleClick);
        document.addEventListener('input', this.handleInput);
        document.addEventListener('change', this.handleChange);
        document.addEventListener('keydown', this.handleKeydown);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
    
    handleClick(event) {
        const { target } = event;
        const action = target.dataset.action;
        
        switch (action) {
            case 'create-automation':
                event.preventDefault();
                this.openAutomationModal();
                break;
                
            case 'edit-automation':
                event.preventDefault();
                this.editAutomation(target.dataset.id);
                break;
                
            case 'delete-automation':
                event.preventDefault();
                this.deleteAutomation(target.dataset.id);
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
        }
    }
    
    handleInput(event) {
        const { target } = event;
        
        if (target.id === 'search-input') {
            automationState.filters.search = target.value;
            this.applyFilters();
        }
    }
    
    handleChange(event) {
        const { target } = event;
        
        if (target.dataset.filter) {
            automationState.filters[target.dataset.filter] = target.value;
            this.applyFilters();
        }
    }
    
    handleKeydown(event) {
        const { key, ctrlKey, metaKey } = event;
        const cmdOrCtrl = ctrlKey || metaKey;
        
        if (cmdOrCtrl && key === 'n') {
            event.preventDefault();
            this.openAutomationModal();
        }
        
        if (cmdOrCtrl && key === 'r') {
            event.preventDefault();
            this.refreshData();
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseRealTimeUpdates();
        } else {
            this.resumeRealTimeUpdates();
        }
    }
    
    // Action methods
    openAutomationModal() {
        this.notificationSystem.show('Modal de automação em desenvolvimento', 'info');
        console.log('📝 Opening automation modal');
    }
    
    editAutomation(id) {
        this.notificationSystem.show(`Editando automação: ${id}`, 'info');
        console.log('✏️ Editing automation:', id);
    }
    
    async deleteAutomation(id) {
        if (!confirm('Tem certeza que deseja excluir esta automação?')) return;
        
        try {
            this.showLoading(true, 'Excluindo automação...');
            
            const result = await this.dataManager.executeRequest(deleteAutomationRule, [id, automationState.orgId]);
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            automationState.automations.delete(id);
            this.calculateMetrics();
            this.renderInterface();
            
            this.notificationSystem.show('Automação excluída com sucesso!', 'success');
            
        } catch (error) {
            console.error('Delete error:', error);
            this.notificationSystem.show(`Erro ao excluir: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    openCampaignModal(type) {
        this.notificationSystem.show(`Modal de campanha ${type} em desenvolvimento`, 'info');
        console.log(`📧 Opening ${type} campaign modal`);
    }
    
    openTemplatesModal() {
        this.notificationSystem.show('Modal de templates em desenvolvimento', 'info');
        console.log('📋 Opening templates modal');
    }
    
    async refreshData() {
        if (automationState.isRefreshing) return;
        
        try {
            automationState.isRefreshing = true;
            this.notificationSystem.show('Atualizando dados...', 'info', 2000);
            
            this.dataManager.clearCache();
            await this.loadAllData();
            this.renderInterface();
            
            this.notificationSystem.show('Dados atualizados com sucesso!', 'success');
            
        } catch (error) {
            console.error('Refresh error:', error);
            this.notificationSystem.show(`Erro ao atualizar: ${error.message}`, 'error');
        } finally {
            automationState.isRefreshing = false;
        }
    }
    
    applyFilters() {
        // Implement filtering logic
        this.renderInterface();
    }
    
    setupRealTimeUpdates() {
        automationState.refreshInterval = setInterval(() => {
            if (!document.hidden && !automationState.isRefreshing) {
                this.refreshData();
            }
        }, AUTOMATION_CONFIG.REFRESH_INTERVAL);
    }
    
    pauseRealTimeUpdates() {
        if (automationState.refreshInterval) {
            clearInterval(automationState.refreshInterval);
            automationState.refreshInterval = null;
        }
    }
    
    resumeRealTimeUpdates() {
        if (!automationState.refreshInterval) {
            this.setupRealTimeUpdates();
        }
    }
    
    showLoading(show, message = 'Carregando...') {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            if (show) {
                loader.textContent = message;
                loader.classList.remove('hidden');
            } else {
                loader.classList.add('hidden');
            }
        }
        console.log(show ? `🔄 ${message}` : '✅ Loading complete');
    }
    
    loadDemoData() {
        console.log('🤖 Loading demo data...');
        
        automationState.automations = new Map([
            ['1', {
                id: '1',
                name: 'Nutrição de Leads',
                description: 'Sequência automática de emails para novos leads',
                type: 'lead_nurturing',
                status: 'active',
                is_active: true,
                execution_count: 156
            }],
            ['2', {
                id: '2',
                name: 'Follow-up Automático',
                description: 'Acompanhamento automático após 3 dias',
                type: 'follow_up',
                status: 'active',
                is_active: true,
                execution_count: 89
            }]
        ]);
        
        automationState.executionHistory = new Map([
            ['1', {
                id: '1',
                automation_name: 'Nutrição de Leads',
                status: 'completed',
                created_at: new Date().toISOString(),
                execution_time_ms: 1250
            }],
            ['2', {
                id: '2',
                automation_name: 'Follow-up Automático',
                status: 'success',
                created_at: new Date(Date.now() - 3600000).toISOString(),
                execution_time_ms: 890
            }]
        ]);
        
        automationState.campaigns.email = new Map([['1', { id: '1', name: 'Campanha Boas-vindas' }]]);
        automationState.campaigns.sms = new Map([['1', { id: '1', name: 'SMS Lembrete' }]]);
        
        this.calculateMetrics();
        automationState.isLoading = false;
        this.renderInterface();
        
        this.notificationSystem.show('Dados demo carregados', 'success');
    }
    
    cleanup() {
        this.pauseRealTimeUpdates();
        this.notificationSystem.clear();
        
        // Remove event listeners
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('input', this.handleInput);
        document.removeEventListener('change', this.handleChange);
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
}

// ===== GLOBAL INITIALIZATION =====
const automationSystem = new AutomationSystem();

// Make notification system globally available
window.notificationSystem = automationSystem.notificationSystem;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    automationSystem.initialize();
});

// Public API
window.automations = {
    refresh: () => automationSystem.refreshData(),
    getState: () => automationState,
    system: automationSystem
};

console.log('🤖 Automation module loaded - Build Compatible Version');
