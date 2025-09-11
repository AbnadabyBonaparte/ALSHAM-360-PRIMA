/**
 * 🚀 ALSHAM 360° PRIMA - Sistema de Navegação Enterprise 10/10
 * 
 * Sistema de navegação modular, seguro e de alta performance seguindo padrões NASA.
 * Implementa arquitetura SOLID, error handling robusto, cache inteligente e UX premium.
 * 
 * @version 2.0.0
 * @author ALSHAM Team
 * @license MIT
 */

/**
 * Configuração central do sistema de navegação
 * @namespace NavigationConfig
 */
const NavigationConfig = {
    // Rotas corrigidas para a estrutura real do projeto
    routes: {
        'dashboard': '/index.html',
        'leads': '/src/pages/leads-real.html',
        'leads-alt': '/src/pages/leads.html',
        'automacoes': '/src/pages/automacoes.html',
        'relatorios': '/src/pages/relatorios.html',
        'configuracoes': '/src/pages/configuracoes.html',
        'gamificacao': '/src/pages/gamificacao.html',
        'login': '/src/pages/login.html',
        'register': '/src/pages/register.html'
    },
    
    // Configuração de menu items com metadados
    menuItems: [
        { 
            key: 'dashboard', 
            label: 'Dashboard', 
            icon: '📊', 
            description: 'Visão geral e KPIs',
            shortcut: 'Ctrl+1',
            requiresAuth: true
        },
        { 
            key: 'leads', 
            label: 'Leads', 
            icon: '👥', 
            description: 'Gestão de leads e pipeline',
            shortcut: 'Ctrl+2',
            requiresAuth: true
        },
        { 
            key: 'automacoes', 
            label: 'Automações', 
            icon: '🤖', 
            description: 'Workflows e automações',
            shortcut: 'Ctrl+3',
            requiresAuth: true
        },
        { 
            key: 'relatorios', 
            label: 'Relatórios', 
            icon: '📈', 
            description: 'Analytics e insights',
            shortcut: 'Ctrl+4',
            requiresAuth: true
        },
        { 
            key: 'gamificacao', 
            label: 'Gamificação', 
            icon: '🎮', 
            description: 'Pontos, badges e rankings',
            shortcut: 'Ctrl+5',
            requiresAuth: true
        },
        { 
            key: 'configuracoes', 
            label: 'Configurações', 
            icon: '⚙️', 
            description: 'Configurações do sistema',
            shortcut: 'Ctrl+6',
            requiresAuth: true
        }
    ],
    
    // Configurações de cache e performance
    cache: {
        ttl: 300000, // 5 minutos
        maxSize: 100
    },
    
    // Configurações de acessibilidade
    a11y: {
        announceNavigation: true,
        focusManagement: true,
        keyboardNavigation: true
    }
};

/**
 * Classe para gerenciamento de cache inteligente
 * @class CacheManager
 */
class CacheManager {
    constructor(maxSize = 100, ttl = 300000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
        this.accessTimes = new Map();
    }
    
    /**
     * Armazena item no cache com TTL
     * @param {string} key - Chave do cache
     * @param {*} value - Valor a ser armazenado
     */
    set(key, value) {
        const now = Date.now();
        
        // Limpar cache se exceder tamanho máximo
        if (this.cache.size >= this.maxSize) {
            this._evictOldest();
        }
        
        this.cache.set(key, {
            value,
            timestamp: now,
            expires: now + this.ttl
        });
        
        this.accessTimes.set(key, now);
    }
    
    /**
     * Recupera item do cache
     * @param {string} key - Chave do cache
     * @returns {*} Valor armazenado ou null se expirado/inexistente
     */
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        const now = Date.now();
        
        // Verificar se expirou
        if (now > item.expires) {
            this.cache.delete(key);
            this.accessTimes.delete(key);
            return null;
        }
        
        // Atualizar tempo de acesso
        this.accessTimes.set(key, now);
        
        return item.value;
    }
    
    /**
     * Remove item mais antigo do cache (LRU)
     * @private
     */
    _evictOldest() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, time] of this.accessTimes) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.accessTimes.delete(oldestKey);
        }
    }
    
    /**
     * Limpa todo o cache
     */
    clear() {
        this.cache.clear();
        this.accessTimes.clear();
    }
}

/**
 * Classe para validação e sanitização de dados
 * @class DataValidator
 */
class DataValidator {
    /**
     * Valida se uma rota é segura
     * @param {string} route - Rota a ser validada
     * @returns {boolean} True se válida
     */
    static validateRoute(route) {
        if (typeof route !== 'string') return false;
        
        // Verificar se a rota existe na configuração
        const validRoutes = Object.values(NavigationConfig.routes);
        return validRoutes.includes(route);
    }
    
    /**
     * Sanitiza string para prevenir XSS
     * @param {string} str - String a ser sanitizada
     * @returns {string} String sanitizada
     */
    static sanitizeString(str) {
        if (typeof str !== 'string') return '';
        
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    /**
     * Valida permissões de acesso
     * @param {string} pageKey - Chave da página
     * @param {Object} userContext - Contexto do usuário
     * @returns {boolean} True se autorizado
     */
    static validateAccess(pageKey, userContext = {}) {
        const menuItem = NavigationConfig.menuItems.find(item => item.key === pageKey);
        
        if (!menuItem) return false;
        
        // Verificar se requer autenticação
        if (menuItem.requiresAuth && !userContext.isAuthenticated) {
            return false;
        }
        
        return true;
    }
}

/**
 * Classe para gerenciamento de notificações
 * @class NotificationManager
 */
class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this._createContainer();
    }
    
    /**
     * Cria container de notificações
     * @private
     */
    _createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-label', 'Notificações do sistema');
        
        document.body.appendChild(this.container);
    }
    
    /**
     * Exibe notificação
     * @param {string} message - Mensagem da notificação
     * @param {string} type - Tipo: success, error, warning, info
     * @param {number} duration - Duração em ms (0 = permanente)
     */
    show(message, type = 'info', duration = 5000) {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = this._getNotificationClasses(type);
        notification.setAttribute('role', 'alert');
        
        const icon = this._getNotificationIcon(type);
        
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${icon}</span>
                <span class="flex-1">${DataValidator.sanitizeString(message)}</span>
                <button class="ml-2 text-gray-400 hover:text-gray-600 transition-colors" 
                        onclick="window.navigationSystem.notificationManager.hide('${id}')"
                        aria-label="Fechar notificação">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);
        
        // Auto-hide se duração especificada
        if (duration > 0) {
            setTimeout(() => this.hide(id), duration);
        }
        
        // Animação de entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });
    }
    
    /**
     * Oculta notificação
     * @param {string} id - ID da notificação
     */
    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 300);
    }
    
    /**
     * Retorna classes CSS para o tipo de notificação
     * @param {string} type - Tipo da notificação
     * @returns {string} Classes CSS
     * @private
     */
    _getNotificationClasses(type) {
        const baseClasses = 'transform translate-x-full opacity-0 transition-all duration-300 ease-in-out max-w-sm w-full bg-white shadow-lg rounded-lg p-4 border-l-4';
        
        const typeClasses = {
            success: 'border-green-500 text-green-800',
            error: 'border-red-500 text-red-800',
            warning: 'border-yellow-500 text-yellow-800',
            info: 'border-blue-500 text-blue-800'
        };
        
        return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
    }
    
    /**
     * Retorna ícone para o tipo de notificação
     * @param {string} type - Tipo da notificação
     * @returns {string} Ícone
     * @private
     */
    _getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        return icons[type] || icons.info;
    }
}

/**
 * Classe para rastreamento de erros
 * @class ErrorTracker
 */
class ErrorTracker {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
    }
    
    /**
     * Registra erro com contexto completo
     * @param {Error|string} error - Erro a ser registrado
     * @param {Object} context - Contexto adicional
     */
    track(error, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            stack: error.stack || null,
            url: window.location.href,
            userAgent: navigator.userAgent,
            context: { ...context }
        };
        
        this.errors.push(errorEntry);
        
        // Manter apenas os últimos N erros
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Log estruturado
        console.error('🚨 Navigation Error:', errorEntry);
        
        // Em produção, enviar para serviço de monitoramento
        if (window.location.hostname !== 'localhost') {
            this._sendToMonitoring(errorEntry);
        }
    }
    
    /**
     * Envia erro para serviço de monitoramento
     * @param {Object} errorEntry - Entrada do erro
     * @private
     */
    _sendToMonitoring(errorEntry) {
        // Implementar integração com serviço de monitoramento
        // Ex: Sentry, LogRocket, etc.
        try {
            // Placeholder para integração futura
            console.info('📊 Error sent to monitoring service');
        } catch (e) {
            console.warn('Failed to send error to monitoring:', e);
        }
    }
    
    /**
     * Retorna histórico de erros
     * @returns {Array} Lista de erros
     */
    getErrors() {
        return [...this.errors];
    }
    
    /**
     * Limpa histórico de erros
     */
    clear() {
        this.errors = [];
    }
}

/**
 * Classe principal do sistema de navegação
 * @class NavigationSystem
 */
class NavigationSystem {
    constructor() {
        this.cache = new CacheManager(
            NavigationConfig.cache.maxSize,
            NavigationConfig.cache.ttl
        );
        this.notificationManager = new NotificationManager();
        this.errorTracker = new ErrorTracker();
        this.currentPage = null;
        this.userContext = { isAuthenticated: false };
        this.isInitialized = false;
        
        // Bind methods
        this.navigateTo = this.navigateTo.bind(this);
        this.handleKeyboardShortcuts = this.handleKeyboardShortcuts.bind(this);
        this.handleMobileMenuToggle = this.handleMobileMenuToggle.bind(this);
    }
    
    /**
     * Inicializa o sistema de navegação
     * @param {Object} options - Opções de configuração
     */
    async initialize(options = {}) {
        try {
            if (this.isInitialized) {
                console.warn('Navigation system already initialized');
                return;
            }
            
            // Merge configurações
            this.userContext = { ...this.userContext, ...options.userContext };
            
            // Detectar página atual
            this._detectCurrentPage();
            
            // Criar elementos de navegação
            await this._createNavigationElements();
            
            // Configurar event listeners
            this._setupEventListeners();
            
            // Configurar acessibilidade
            this._setupAccessibility();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            console.info('🚀 Navigation system initialized successfully');
            
            if (NavigationConfig.a11y.announceNavigation) {
                this.notificationManager.show('Sistema de navegação carregado', 'success', 3000);
            }
            
        } catch (error) {
            this.errorTracker.track(error, { method: 'initialize', options });
            this.notificationManager.show('Erro ao inicializar navegação', 'error');
            throw error;
        }
    }
    
    /**
     * Navega para uma página específica
     * @param {string} pageKey - Chave da página
     * @param {Object} options - Opções de navegação
     */
    async navigateTo(pageKey, options = {}) {
        try {
            // Validar entrada
            if (!pageKey || typeof pageKey !== 'string') {
                throw new Error('Page key must be a non-empty string');
            }
            
            // Verificar se a rota existe
            const route = NavigationConfig.routes[pageKey];
            if (!route) {
                throw new Error(`Route not found for page: ${pageKey}`);
            }
            
            // Validar acesso
            if (!DataValidator.validateAccess(pageKey, this.userContext)) {
                this.notificationManager.show('Acesso negado a esta página', 'error');
                return false;
            }
            
            // Validar rota
            if (!DataValidator.validateRoute(route)) {
                throw new Error(`Invalid route: ${route}`);
            }
            
            // Loading state
            if (options.showLoading !== false) {
                this._showLoadingState();
            }
            
            // Anunciar navegação para leitores de tela
            if (NavigationConfig.a11y.announceNavigation) {
                this._announceNavigation(pageKey);
            }
            
            // Executar navegação
            const success = await this._executeNavigation(route, pageKey, options);
            
            if (success) {
                this.currentPage = pageKey;
                this._updateNavigationState();
                
                // Cache da página visitada
                this.cache.set(`last-visit-${pageKey}`, Date.now());
                
                console.info(`✅ Navigated to: ${pageKey} (${route})`);
            }
            
            return success;
            
        } catch (error) {
            this.errorTracker.track(error, { 
                method: 'navigateTo', 
                pageKey, 
                options,
                currentPage: this.currentPage
            });
            
            this.notificationManager.show(
                `Erro na navegação: ${error.message}`, 
                'error'
            );
            
            return false;
        } finally {
            this._hideLoadingState();
        }
    }
    
    /**
     * Executa a navegação propriamente dita
     * @param {string} route - Rota de destino
     * @param {string} pageKey - Chave da página
     * @param {Object} options - Opções
     * @returns {boolean} Sucesso da operação
     * @private
     */
    async _executeNavigation(route, pageKey, options) {
        try {
            // Verificar se é navegação externa
            if (options.external) {
                window.open(route, options.target || '_blank');
                return true;
            }
            
            // Navegação interna
            if (options.replace) {
                window.location.replace(route);
            } else {
                window.location.href = route;
            }
            
            return true;
            
        } catch (error) {
            throw new Error(`Navigation execution failed: ${error.message}`);
        }
    }
    
    /**
     * Detecta a página atual baseada na URL
     * @private
     */
    _detectCurrentPage() {
        const currentPath = window.location.pathname;
        
        // Mapear URL para chave da página
        for (const [key, route] of Object.entries(NavigationConfig.routes)) {
            if (currentPath.includes(route.replace(/^\//, '').replace('.html', '')) ||
                (key === 'dashboard' && currentPath.includes('index.html'))) {
                this.currentPage = key;
                break;
            }
        }
        
        // Fallback para dashboard
        if (!this.currentPage) {
            this.currentPage = 'dashboard';
        }
    }
    
    /**
     * Cria elementos de navegação no DOM
     * @private
     */
    async _createNavigationElements() {
        await Promise.all([
            this._createMainNavigation(),
            this._createMobileNavigation(),
            this._createBreadcrumb()
        ]);
    }
    
    /**
     * Cria navegação principal
     * @private
     */
    _createMainNavigation() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        const navHTML = NavigationConfig.menuItems
            .filter(item => DataValidator.validateAccess(item.key, this.userContext))
            .map(item => this._createNavItem(item))
            .join('');
        
        nav.innerHTML = navHTML;
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Navegação principal');
    }
    
    /**
     * Cria item de navegação
     * @param {Object} item - Item do menu
     * @returns {string} HTML do item
     * @private
     */
    _createNavItem(item) {
        const isActive = this.currentPage === item.key;
        const route = NavigationConfig.routes[item.key];
        
        const activeClasses = isActive ? 
            'text-primary font-medium border-b-2 border-primary pb-1' : 
            'text-gray-600 hover:text-primary transition-colors font-medium';
        
        return `
            <a href="${route}" 
               class="${activeClasses}"
               data-page="${item.key}"
               title="${DataValidator.sanitizeString(item.description)} (${item.shortcut})"
               aria-current="${isActive ? 'page' : 'false'}">
                <span class="hidden sm:inline" aria-hidden="true">${item.icon}</span>
                <span>${DataValidator.sanitizeString(item.label)}</span>
            </a>
        `;
    }
    
    /**
     * Cria navegação mobile
     * @private
     */
    _createMobileNavigation() {
        const header = document.querySelector('header');
        if (!header) return;
        
        // Botão de menu mobile
        const mobileButton = document.createElement('button');
        mobileButton.className = 'md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors';
        mobileButton.setAttribute('aria-label', 'Abrir menu de navegação');
        mobileButton.setAttribute('aria-expanded', 'false');
        mobileButton.setAttribute('data-mobile-menu-button', '');
        mobileButton.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        `;
        
        // Menu mobile
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'hidden md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40';
        mobileMenu.id = 'mobile-menu';
        mobileMenu.setAttribute('role', 'menu');
        mobileMenu.setAttribute('aria-label', 'Menu de navegação mobile');
        
        const mobileMenuHTML = NavigationConfig.menuItems
            .filter(item => DataValidator.validateAccess(item.key, this.userContext))
            .map(item => this._createMobileNavItem(item))
            .join('');
        
        mobileMenu.innerHTML = `
            <div class="px-4 py-2 space-y-1">
                ${mobileMenuHTML}
            </div>
        `;
        
        // Inserir no header
        const headerContainer = header.querySelector('.max-w-7xl') || header;
        headerContainer.appendChild(mobileMenu);
        
        const nav = headerContainer.querySelector('nav');
        if (nav) {
            nav.parentNode.insertBefore(mobileButton, nav);
        }
    }
    
    /**
     * Cria item de navegação mobile
     * @param {Object} item - Item do menu
     * @returns {string} HTML do item
     * @private
     */
    _createMobileNavItem(item) {
        const isActive = this.currentPage === item.key;
        const route = NavigationConfig.routes[item.key];
        
        const activeClasses = isActive ? 
            'text-primary bg-primary/10 font-medium' : 
            'text-gray-700 hover:text-primary hover:bg-gray-50';
        
        return `
            <a href="${route}" 
               class="block px-3 py-2 rounded-lg transition-colors ${activeClasses}"
               data-page="${item.key}"
               role="menuitem"
               title="${DataValidator.sanitizeString(item.description)}"
               aria-current="${isActive ? 'page' : 'false'}">
                <span aria-hidden="true">${item.icon}</span>
                <span class="ml-2">${DataValidator.sanitizeString(item.label)}</span>
            </a>
        `;
    }
    
    /**
     * Cria breadcrumb
     * @private
     */
    _createBreadcrumb() {
        const breadcrumbContainer = document.getElementById('breadcrumb');
        if (!breadcrumbContainer) return;
        
        const currentItem = NavigationConfig.menuItems.find(item => item.key === this.currentPage);
        if (!currentItem) return;
        
        const breadcrumbHTML = `
            <nav class="flex items-center space-x-2 text-sm text-gray-600 mb-4" 
                 aria-label="Breadcrumb">
                <a href="${NavigationConfig.routes.dashboard}" 
                   class="hover:text-primary transition-colors"
                   aria-label="Voltar ao Dashboard">
                    🏠 Dashboard
                </a>
                ${this.currentPage !== 'dashboard' ? `
                    <span aria-hidden="true">›</span>
                    <span class="text-gray-900 font-medium" aria-current="page">
                        ${currentItem.icon} ${DataValidator.sanitizeString(currentItem.label)}
                    </span>
                ` : ''}
            </nav>
        `;
        
        breadcrumbContainer.innerHTML = breadcrumbHTML;
    }
    
    /**
     * Configura event listeners
     * @private
     */
    _setupEventListeners() {
        // Atalhos de teclado
        document.addEventListener('keydown', this.handleKeyboardShortcuts);
        
        // Menu mobile
        const mobileButton = document.querySelector('[data-mobile-menu-button]');
        if (mobileButton) {
            mobileButton.addEventListener('click', this.handleMobileMenuToggle);
        }
        
        // Fechar menu mobile ao clicar fora
        document.addEventListener('click', (e) => {
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileButton = document.querySelector('[data-mobile-menu-button]');
            
            if (mobileMenu && 
                !mobileMenu.contains(e.target) && 
                !mobileButton?.contains(e.target)) {
                this._closeMobileMenu();
            }
        });
        
        // Interceptar cliques em links de navegação para analytics
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-page]');
            if (link) {
                const pageKey = link.getAttribute('data-page');
                console.info(`📊 Navigation click: ${pageKey}`);
                
                // Aqui poderia enviar analytics
                this._trackNavigation(pageKey);
            }
        });
    }
    
    /**
     * Configura recursos de acessibilidade
     * @private
     */
    _setupAccessibility() {
        // Skip navigation link
        this._createSkipNavigation();
        
        // Focus management
        if (NavigationConfig.a11y.focusManagement) {
            this._setupFocusManagement();
        }
        
        // Anúncios para leitores de tela
        this._createAriaLiveRegion();
    }
    
    /**
     * Cria link de pular navegação
     * @private
     */
    _createSkipNavigation() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50';
        skipLink.textContent = 'Pular para o conteúdo principal';
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    /**
     * Configura gerenciamento de foco
     * @private
     */
    _setupFocusManagement() {
        // Implementar gerenciamento de foco para navegação por teclado
        const focusableElements = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(document.querySelectorAll(focusableElements))
                    .filter(el => !el.disabled && el.offsetParent !== null);
                
                const firstFocusable = focusable[0];
                const lastFocusable = focusable[focusable.length - 1];
                
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });
    }
    
    /**
     * Cria região ARIA live para anúncios
     * @private
     */
    _createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        
        document.body.appendChild(liveRegion);
    }
    
    /**
     * Anuncia navegação para leitores de tela
     * @param {string} pageKey - Chave da página
     * @private
     */
    _announceNavigation(pageKey) {
        const menuItem = NavigationConfig.menuItems.find(item => item.key === pageKey);
        if (!menuItem) return;
        
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = `Navegando para ${menuItem.label}`;
        }
    }
    
    /**
     * Manipula atalhos de teclado
     * @param {KeyboardEvent} e - Evento de teclado
     */
    handleKeyboardShortcuts(e) {
        if (!NavigationConfig.a11y.keyboardNavigation) return;
        
        // Verificar se Ctrl/Cmd está pressionado
        if (e.ctrlKey || e.metaKey) {
            const shortcuts = {
                '1': 'dashboard',
                '2': 'leads',
                '3': 'automacoes',
                '4': 'relatorios',
                '5': 'gamificacao',
                '6': 'configuracoes'
            };
            
            const pageKey = shortcuts[e.key];
            if (pageKey) {
                e.preventDefault();
                this.navigateTo(pageKey);
            }
        }
    }
    
    /**
     * Manipula toggle do menu mobile
     * @param {Event} e - Evento de clique
     */
    handleMobileMenuToggle(e) {
        e.preventDefault();
        
        const mobileMenu = document.getElementById('mobile-menu');
        const button = e.currentTarget;
        
        if (!mobileMenu || !button) return;
        
        const isOpen = !mobileMenu.classList.contains('hidden');
        
        if (isOpen) {
            this._closeMobileMenu();
        } else {
            this._openMobileMenu();
        }
    }
    
    /**
     * Abre menu mobile
     * @private
     */
    _openMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const button = document.querySelector('[data-mobile-menu-button]');
        
        if (mobileMenu && button) {
            mobileMenu.classList.remove('hidden');
            button.setAttribute('aria-expanded', 'true');
            
            // Focar primeiro item do menu
            const firstMenuItem = mobileMenu.querySelector('a');
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }
    }
    
    /**
     * Fecha menu mobile
     * @private
     */
    _closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const button = document.querySelector('[data-mobile-menu-button]');
        
        if (mobileMenu && button) {
            mobileMenu.classList.add('hidden');
            button.setAttribute('aria-expanded', 'false');
        }
    }
    
    /**
     * Atualiza estado da navegação
     * @private
     */
    _updateNavigationState() {
        // Atualizar classes ativas
        const navLinks = document.querySelectorAll('nav a[data-page], #mobile-menu a[data-page]');
        
        navLinks.forEach(link => {
            const pageKey = link.getAttribute('data-page');
            const isActive = pageKey === this.currentPage;
            
            if (isActive) {
                link.classList.add('text-primary', 'font-medium');
                link.classList.remove('text-gray-600', 'text-gray-700');
                link.setAttribute('aria-current', 'page');
                
                // Para navegação desktop
                if (link.closest('nav') && !link.closest('#mobile-menu')) {
                    link.classList.add('border-b-2', 'border-primary', 'pb-1');
                }
                
                // Para navegação mobile
                if (link.closest('#mobile-menu')) {
                    link.classList.add('bg-primary/10');
                }
            } else {
                link.classList.remove('text-primary', 'font-medium', 'border-b-2', 'border-primary', 'pb-1', 'bg-primary/10');
                link.classList.add(link.closest('#mobile-menu') ? 'text-gray-700' : 'text-gray-600');
                link.setAttribute('aria-current', 'false');
            }
        });
    }
    
    /**
     * Exibe estado de carregamento
     * @private
     */
    _showLoadingState() {
        // Implementar loading state visual
        document.body.style.cursor = 'wait';
        
        // Adicionar classe de loading se existir
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        }
    }
    
    /**
     * Oculta estado de carregamento
     * @private
     */
    _hideLoadingState() {
        document.body.style.cursor = '';
        
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
    }
    
    /**
     * Rastreia navegação para analytics
     * @param {string} pageKey - Chave da página
     * @private
     */
    _trackNavigation(pageKey) {
        // Implementar tracking de analytics
        const trackingData = {
            event: 'navigation',
            page: pageKey,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
        
        console.info('📊 Navigation tracked:', trackingData);
        
        // Em produção, enviar para serviço de analytics
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_title: pageKey,
                page_location: window.location.href
            });
        }
    }
    
    /**
     * Retorna informações do sistema
     * @returns {Object} Informações do sistema
     */
    getSystemInfo() {
        return {
            version: '2.0.0',
            isInitialized: this.isInitialized,
            currentPage: this.currentPage,
            cacheSize: this.cache.cache.size,
            errorCount: this.errorTracker.errors.length,
            userContext: { ...this.userContext }
        };
    }
    
    /**
     * Limpa cache e reinicia sistema
     */
    reset() {
        this.cache.clear();
        this.errorTracker.clear();
        this.isInitialized = false;
        
        console.info('🔄 Navigation system reset');
    }
    
    /**
     * Destrói o sistema de navegação
     */
    destroy() {
        // Remover event listeners
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
        
        const mobileButton = document.querySelector('[data-mobile-menu-button]');
        if (mobileButton) {
            mobileButton.removeEventListener('click', this.handleMobileMenuToggle);
        }
        
        // Limpar cache
        this.cache.clear();
        
        // Remover elementos criados
        const elementsToRemove = [
            '#notification-container',
            '#mobile-menu',
            '[data-mobile-menu-button]',
            '#aria-live-region'
        ];
        
        elementsToRemove.forEach(selector => {
            const element = document.querySelector(selector);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        this.isInitialized = false;
        
        console.info('🗑️ Navigation system destroyed');
    }
}

// Instância global do sistema de navegação
window.navigationSystem = new NavigationSystem();

// Funções globais para compatibilidade
window.navigateTo = (pageKey, options) => window.navigationSystem.navigateTo(pageKey, options);

// Inicialização automática quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.navigationSystem.initialize();
    });
} else {
    // DOM já carregado
    window.navigationSystem.initialize();
}

// Exportar para módulos ES6
export { NavigationSystem, NavigationConfig, CacheManager, DataValidator, NotificationManager, ErrorTracker };

// Exportar para uso global
window.NavigationSystem = NavigationSystem;
window.NavigationConfig = NavigationConfig;

console.info('🚀 ALSHAM 360° PRIMA Navigation System v2.0.0 loaded');

