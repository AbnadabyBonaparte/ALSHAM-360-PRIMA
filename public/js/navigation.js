/**
 * ALSHAM 360° PRIMA - Sistema de Navegação Otimizado V1.1
 * Sistema de navegação funcional e compatível com fix-imports.js
 * 
 * @version 1.1.0 - OTIMIZADO
 * @author ALSHAM Development Team
 * 
 * ✅ FUNCIONALIDADES:
 * - Navegação entre páginas
 * - Verificação de acesso integrada com fix-imports
 * - Menu mobile responsivo
 * - Sem conflitos com funções globais
 */

// ===== AGUARDAR FIX-IMPORTS ESTAR PRONTO =====
function waitForFixImports(callback) {
    if (window.checkRouteAccess && window.showAuthNotification) {
        console.log('✅ Fix-imports já carregado, inicializando navegação');
        callback();
    } else {
        console.log('⏳ Aguardando fix-imports...');
        
        // Escutar evento do fix-imports
        window.addEventListener('fix-imports-ready', () => {
            console.log('✅ Fix-imports pronto, inicializando navegação');
            callback();
        });
        
        // Fallback com timeout
        setTimeout(() => {
            console.log('⚠️ Timeout aguardando fix-imports, inicializando mesmo assim');
            callback();
        }, 3000);
    }
}

// ===== CONFIGURAÇÃO DE ROTAS =====
const ROUTES = {
    dashboard: '/index.html',
    leads: '/leads.html', 
    automacoes: '/automacoes.html',
    relatorios: '/relatorios.html',
    gamificacao: '/gamificacao.html',
    configuracoes: '/configuracoes.html',
    login: '/login.html',
    register: '/register.html'
};

// ===== ESTADO DA NAVEGAÇÃO =====
const navigationState = {
    currentPage: null,
    isAuthenticated: false,
    isInitialized: false,
    mobileMenuOpen: false
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    waitForFixImports(() => {
        try {
            initializeNavigation();
            console.log('✅ Sistema de navegação inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar navegação:', error);
        }
    });
});

function initializeNavigation() {
    // Detectar página atual
    detectCurrentPage();
    
    // Verificar autenticação
    checkAuthentication();
    
    // Configurar menu mobile
    setupMobileMenu();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Atualizar estado visual
    updateNavigationState();
    
    navigationState.isInitialized = true;
    
    // Disparar evento de navegação pronta
    window.dispatchEvent(new CustomEvent('navigation-ready', {
        detail: { currentPage: navigationState.currentPage }
    }));
}

// ===== DETECÇÃO DE PÁGINA =====
function detectCurrentPage() {
    const currentPath = window.location.pathname;
    
    // Mapear URL para página
    if (currentPath.includes('leads')) {
        navigationState.currentPage = 'leads';
    } else if (currentPath.includes('automacoes')) {
        navigationState.currentPage = 'automacoes';
    } else if (currentPath.includes('relatorios')) {
        navigationState.currentPage = 'relatorios';
    } else if (currentPath.includes('gamificacao')) {
        navigationState.currentPage = 'gamificacao';
    } else if (currentPath.includes('configuracoes')) {
        navigationState.currentPage = 'configuracoes';
    } else if (currentPath.includes('login')) {
        navigationState.currentPage = 'login';
    } else if (currentPath.includes('register')) {
        navigationState.currentPage = 'register';
    } else {
        navigationState.currentPage = 'dashboard';
    }
    
    console.log('📍 Página atual detectada:', navigationState.currentPage);
    
    // Atualizar título da página
    updatePageTitle();
}

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
function checkAuthentication() {
    try {
        // Usar função do fix-imports se disponível
        if (window.checkRouteAccess) {
            const currentRoute = ROUTES[navigationState.currentPage] || window.location.pathname;
            navigationState.isAuthenticated = window.checkRouteAccess(currentRoute);
        } else {
            // Fallback básico
            const hasToken = localStorage.getItem('supabase.auth.token') || 
                           sessionStorage.getItem('supabase.auth.token');
            navigationState.isAuthenticated = !!hasToken;
        }
        
        console.log('🔐 Status autenticação:', navigationState.isAuthenticated ? 'Autenticado' : 'Não autenticado');
        
    } catch (error) {
        console.warn('⚠️ Erro ao verificar autenticação:', error);
        navigationState.isAuthenticated = true; // Fallback permissivo
    }
}

// ===== NAVEGAÇÃO MELHORADA =====
function navigateToPage(pageKey, options = {}) {
    try {
        console.log(`🔄 Navegando para: ${pageKey}`);
        
        // Verificar se a rota existe
        const route = ROUTES[pageKey];
        if (!route) {
            console.error('❌ Rota não encontrada:', pageKey);
            window.showToast?.('Página não encontrada', 'error');
            return false;
        }
        
        // Verificar acesso usando função do fix-imports
        if (window.checkRouteAccess && !window.checkRouteAccess(route)) {
            console.warn('⚠️ Acesso negado à rota:', route);
            window.showAuthNotification?.('Acesso não autorizado. Redirecionando...', 'warning');
            setTimeout(() => navigateToPage('login'), 1500);
            return false;
        }
        
        // Fechar menu mobile se aberto
        closeMobileMenu();
        
        // Executar navegação
        if (options.external) {
            window.open(route, options.target || '_blank');
        } else if (options.replace) {
            window.location.replace(route);
        } else {
            // Adicionar loading antes da navegação
            if (options.showLoading !== false) {
                showNavigationLoading();
            }
            window.location.href = route;
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na navegação:', error);
        window.showToast?.('Erro na navegação', 'error');
        return false;
    }
}

// ===== LOADING DE NAVEGAÇÃO =====
function showNavigationLoading() {
    const existingLoader = document.getElementById('navigation-loader');
    if (existingLoader) return;
    
    const loader = document.createElement('div');
    loader.id = 'navigation-loader';
    loader.className = 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50';
    loader.innerHTML = `
        <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Carregando página...</p>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    // Remover loader após timeout de segurança
    setTimeout(() => {
        if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }, 5000);
}

// ===== ATUALIZAÇÃO DE TÍTULO =====
function updatePageTitle() {
    const pageTitles = {
        dashboard: 'Dashboard - ALSHAM 360°',
        leads: 'Gestão de Leads - ALSHAM 360°',
        automacoes: 'Automações - ALSHAM 360°',
        relatorios: 'Relatórios - ALSHAM 360°',
        gamificacao: 'Gamificação - ALSHAM 360°',
        configuracoes: 'Configurações - ALSHAM 360°',
        login: 'Login - ALSHAM 360°',
        register: 'Cadastro - ALSHAM 360°'
    };
    
    const newTitle = pageTitles[navigationState.currentPage] || 'ALSHAM 360° PRIMA';
    if (document.title !== newTitle) {
        document.title = newTitle;
    }
}

// ===== MENU MOBILE OTIMIZADO =====
function setupMobileMenu() {
    try {
        // Verificar se já existe menu mobile
        const existingMenu = document.getElementById('mobile-menu');
        if (existingMenu) {
            console.log('📱 Menu mobile já existe, configurando eventos');
            setupMobileMenuEvents();
            return;
        }
        
        // Encontrar elementos necessários
        const mobileButton = document.querySelector('[data-mobile-menu-button]') || 
                           document.querySelector('.mobile-menu-button') ||
                           createMobileMenuButton();
        
        if (!mobileButton) {
            console.warn('⚠️ Botão do menu mobile não encontrado');
            return;
        }
        
        // Criar menu mobile
        createMobileMenuStructure();
        
        // Configurar eventos
        setupMobileMenuEvents();
        
        console.log('📱 Menu mobile configurado');
        
    } catch (error) {
        console.error('❌ Erro ao configurar menu mobile:', error);
    }
}

function createMobileMenuButton() {
    const header = document.querySelector('header') || document.querySelector('nav')?.parentElement;
    if (!header) return null;
    
    const button = document.createElement('button');
    button.className = 'md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors';
    button.setAttribute('data-mobile-menu-button', '');
    button.setAttribute('aria-label', 'Menu de navegação');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
    `;
    
    header.appendChild(button);
    return button;
}

function createMobileMenuStructure() {
    const header = document.querySelector('header');
    if (!header) return null;
    
    const menu = document.createElement('div');
    menu.id = 'mobile-menu';
    menu.className = 'hidden md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 max-h-screen overflow-y-auto';
    
    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Visão geral do sistema' },
        { key: 'leads', label: 'Leads', icon: '👥', description: 'Gestão de prospects' },
        { key: 'automacoes', label: 'Automações', icon: '🤖', description: 'Fluxos automatizados' },
        { key: 'relatorios', label: 'Relatórios', icon: '📈', description: 'Análises e métricas' },
        { key: 'gamificacao', label: 'Gamificação', icon: '🎮', description: 'Sistema de pontuação' },
        { key: 'configuracoes', label: 'Configurações', icon: '⚙️', description: 'Ajustes do sistema' }
    ];
    
    const menuHTML = menuItems.map(item => {
        const route = ROUTES[item.key];
        const isActive = navigationState.currentPage === item.key;
        const activeClass = isActive ? 
            'text-blue-600 bg-blue-50 border-l-4 border-blue-600' : 
            'text-gray-700 hover:text-blue-600 hover:bg-gray-50 border-l-4 border-transparent';
        
        return `
            <a href="${route}" 
               class="block px-4 py-3 transition-all duration-200 ${activeClass}"
               data-page="${item.key}"
               onclick="closeMobileMenu()">
                <div class="flex items-center">
                    <span class="text-xl mr-3">${item.icon}</span>
                    <div>
                        <div class="font-medium">${item.label}</div>
                        <div class="text-sm text-gray-500">${item.description}</div>
                    </div>
                </div>
            </a>
        `;
    }).join('');
    
    // Adicionar seção de logout se autenticado
    const logoutSection = navigationState.isAuthenticated ? `
        <hr class="my-2 border-gray-200">
        <button onclick="handleLogout()" 
                class="w-full text-left block px-4 py-3 text-red-600 hover:bg-red-50 transition-colors">
            <div class="flex items-center">
                <span class="text-xl mr-3">🚪</span>
                <div>
                    <div class="font-medium">Sair do Sistema</div>
                    <div class="text-sm text-red-500">Encerrar sessão</div>
                </div>
            </div>
        </button>
    ` : '';
    
    menu.innerHTML = `<div class="py-2">${menuHTML}${logoutSection}</div>`;
    
    // Inserir após o header
    header.parentNode.insertBefore(menu, header.nextSibling);
    return menu;
}

function setupMobileMenuEvents() {
    const button = document.querySelector('[data-mobile-menu-button]');
    const menu = document.getElementById('mobile-menu');
    
    if (!button || !menu) return;
    
    // Evento do botão
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (navigationState.mobileMenuOpen && 
            !menu.contains(e.target) && 
            !button.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Fechar menu com tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navigationState.mobileMenuOpen) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const button = document.querySelector('[data-mobile-menu-button]');
    
    if (!menu) return;
    
    if (navigationState.mobileMenuOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const button = document.querySelector('[data-mobile-menu-button]');
    
    if (menu) {
        menu.classList.remove('hidden');
        button?.setAttribute('aria-expanded', 'true');
        navigationState.mobileMenuOpen = true;
        
        // Animar entrada
        requestAnimationFrame(() => {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';
            menu.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            
            requestAnimationFrame(() => {
                menu.style.opacity = '1';
                menu.style.transform = 'translateY(0)';
            });
        });
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const button = document.querySelector('[data-mobile-menu-button]');
    
    if (menu && navigationState.mobileMenuOpen) {
        // Animar saída
        menu.style.opacity = '0';
        menu.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            menu.classList.add('hidden');
            menu.style.opacity = '';
            menu.style.transform = '';
            menu.style.transition = '';
        }, 200);
        
        button?.setAttribute('aria-expanded', 'false');
        navigationState.mobileMenuOpen = false;
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Atalhos de teclado
    document.addEventListener('keydown', function(e) {
        // Atalhos com Ctrl/Cmd
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    navigateToPage('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    navigateToPage('leads');
                    break;
                case '3':
                    e.preventDefault();
                    navigateToPage('automacoes');
                    break;
                case '4':
                    e.preventDefault();
                    navigateToPage('relatorios');
                    break;
                case '5':
                    e.preventDefault();
                    navigateToPage('gamificacao');
                    break;
            }
        }
    });
    
    // Interceptar cliques em links de navegação
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[data-page]');
        if (link) {
            const pageKey = link.getAttribute('data-page');
            console.log(`📊 Clique na navegação: ${pageKey}`);
        }
    });
}

// ===== ATUALIZAÇÃO DE ESTADO =====
function updateNavigationState() {
    try {
        // Atualizar links ativos
        const navLinks = document.querySelectorAll('nav a, #mobile-menu a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            const isActive = (navigationState.currentPage === 'dashboard' && href.includes('index.html')) ||
                            href.includes(navigationState.currentPage);
            
            // Remover classes ativas anteriores
            link.classList.remove('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'bg-blue-50', 'border-l-4');
            
            if (isActive) {
                link.classList.add('text-blue-600', 'font-medium');
                
                // Para navegação desktop
                if (!link.closest('#mobile-menu')) {
                    link.classList.add('border-b-2', 'border-blue-600');
                }
                
                // Para navegação mobile
                if (link.closest('#mobile-menu')) {
                    link.classList.add('bg-blue-50', 'border-l-4', 'border-blue-600');
                }
            } else {
                if (link.closest('#mobile-menu')) {
                    link.classList.add('text-gray-700', 'border-l-4', 'border-transparent');
                } else {
                    link.classList.add('text-gray-600');
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar estado da navegação:', error);
    }
}

// ===== LOGOUT =====
function handleLogout() {
    if (window.signOut) {
        window.signOut().then(() => {
            window.showAuthNotification?.('Logout realizado com sucesso', 'success');
            navigateToPage('login', { replace: true });
        });
    } else {
        // Fallback logout
        localStorage.clear();
        sessionStorage.clear();
        window.showAuthNotification?.('Sessão encerrada', 'info');
        navigateToPage('login', { replace: true });
    }
}

// ===== FUNÇÕES DE UTILIDADE =====
function getCurrentPage() {
    return navigationState.currentPage;
}

function isNavigationInitialized() {
    return navigationState.isInitialized;
}

function getRoutes() {
    return { ...ROUTES };
}

function getNavigationState() {
    return { ...navigationState };
}

// ===== EXPORTAR PARA USO GLOBAL (EVITANDO CONFLITOS) =====
// Só exportar se não existirem no fix-imports
if (!window.navigateTo) {
    window.navigateTo = navigateToPage;
}

// Funções específicas de navegação sempre disponíveis
window.NavigationSystem = {
    navigateTo: navigateToPage,
    getCurrentPage,
    isInitialized: isNavigationInitialized,
    getRoutes,
    getState: getNavigationState,
    toggleMobileMenu,
    closeMobileMenu,
    openMobileMenu,
    handleLogout,
    updateState: updateNavigationState,
    state: navigationState
};

// Aliases para compatibilidade
window.getCurrentPage = getCurrentPage;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.handleLogout = handleLogout;

console.log('🧭 Sistema de navegação otimizado carregado!');
