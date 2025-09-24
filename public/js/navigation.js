/**
 * ALSHAM 360° PRIMA - Sistema de Navegação Simples V1.0
 * Sistema de navegação funcional e compatível com o ambiente atual
 * 
 * @version 1.0.0 - FUNCIONAL
 * @author ALSHAM Development Team
 * 
 * ✅ FUNCIONALIDADES:
 * - Navegação entre páginas
 * - Verificação de acesso
 * - Menu mobile responsivo
 * - Sem exports/imports problemáticos
 */

// ===== CONFIGURAÇÃO DE ROTAS =====
const ROUTES = {
    dashboard: '/index.html',
    leads: '/leads.html', 
    automacoes: '/automacoes.html',
    relatorios: '/relatorios.html',
    gamificacao: '/gamificacao.html',
    configuracoes: '/configuracoes.html',
    login: '/login.html'
};

// ===== ESTADO DA NAVEGAÇÃO =====
const navigationState = {
    currentPage: null,
    isAuthenticated: false,
    isInitialized: false
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeNavigation();
        console.log('✅ Sistema de navegação inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar navegação:', error);
    }
});

function initializeNavigation() {
    // Detectar página atual
    detectCurrentPage();
    
    // Configurar menu mobile
    setupMobileMenu();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Atualizar estado visual
    updateNavigationState();
    
    navigationState.isInitialized = true;
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
    } else {
        navigationState.currentPage = 'dashboard';
    }
    
    console.log('📍 Página atual detectada:', navigationState.currentPage);
}

// ===== VERIFICAÇÃO DE ACESSO =====
function checkRouteAccess(route) {
    console.log(`🛡️ Verificando acesso à rota: ${route || 'undefined'}`);
    
    // Rotas públicas
    const publicRoutes = ['/login.html', '/register.html'];
    if (publicRoutes.some(publicRoute => route?.includes(publicRoute))) {
        return true;
    }
    
    // Para outras rotas, verificar autenticação básica
    try {
        // Verificar se há sessão armazenada
        const hasSession = localStorage.getItem('supabase.auth.token') || 
                          sessionStorage.getItem('supabase.auth.token') ||
                          window.AlshamSupabase;
        
        return !!hasSession;
    } catch (error) {
        console.warn('Erro ao verificar sessão:', error);
        return true; // Permitir por padrão para evitar bloqueios
    }
}

// ===== NAVEGAÇÃO =====
function navigateTo(pageKey, options = {}) {
    try {
        console.log(`🔄 Navegando para: ${pageKey}`);
        
        // Verificar se a rota existe
        const route = ROUTES[pageKey];
        if (!route) {
            console.error('❌ Rota não encontrada:', pageKey);
            return false;
        }
        
        // Verificar acesso
        if (!checkRouteAccess(route)) {
            console.warn('⚠️ Acesso negado à rota:', route);
            navigateTo('login');
            return false;
        }
        
        // Executar navegação
        if (options.external) {
            window.open(route, options.target || '_blank');
        } else if (options.replace) {
            window.location.replace(route);
        } else {
            window.location.href = route;
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na navegação:', error);
        return false;
    }
}

// ===== MENU MOBILE =====
function setupMobileMenu() {
    try {
        // Encontrar ou criar botão do menu mobile
        let mobileButton = document.querySelector('[data-mobile-menu-button]');
        
        if (!mobileButton) {
            mobileButton = createMobileMenuButton();
        }
        
        // Encontrar ou criar menu mobile
        let mobileMenu = document.getElementById('mobile-menu');
        
        if (!mobileMenu) {
            mobileMenu = createMobileMenu();
        }
        
        // Configurar event listeners
        if (mobileButton) {
            mobileButton.addEventListener('click', toggleMobileMenu);
        }
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (mobileMenu && 
                !mobileMenu.contains(e.target) && 
                !mobileButton?.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        console.log('📱 Menu mobile configurado');
        
    } catch (error) {
        console.error('❌ Erro ao configurar menu mobile:', error);
    }
}

function createMobileMenuButton() {
    const nav = document.querySelector('nav');
    if (!nav) return null;
    
    const button = document.createElement('button');
    button.className = 'md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors';
    button.setAttribute('data-mobile-menu-button', '');
    button.setAttribute('aria-label', 'Menu de navegação');
    button.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
    `;
    
    nav.parentNode.insertBefore(button, nav);
    return button;
}

function createMobileMenu() {
    const header = document.querySelector('header');
    if (!header) return null;
    
    const menu = document.createElement('div');
    menu.id = 'mobile-menu';
    menu.className = 'hidden md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40';
    
    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'leads', label: 'Leads', icon: '👥' },
        { key: 'automacoes', label: 'Automações', icon: '🤖' },
        { key: 'relatorios', label: 'Relatórios', icon: '📈' },
        { key: 'gamificacao', label: 'Gamificação', icon: '🎮' },
        { key: 'configuracoes', label: 'Configurações', icon: '⚙️' }
    ];
    
    const menuHTML = menuItems.map(item => {
        const route = ROUTES[item.key];
        const isActive = navigationState.currentPage === item.key;
        const activeClass = isActive ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50';
        
        return `
            <a href="${route}" 
               class="block px-4 py-3 transition-colors ${activeClass}"
               data-page="${item.key}">
                <span class="mr-3">${item.icon}</span>
                ${item.label}
            </a>
        `;
    }).join('');
    
    menu.innerHTML = `<div class="py-2">${menuHTML}</div>`;
    
    header.appendChild(menu);
    return menu;
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const button = document.querySelector('[data-mobile-menu-button]');
    
    if (!menu || !button) return;
    
    const isHidden = menu.classList.contains('hidden');
    
    if (isHidden) {
        openMobileMenu();
    } else {
        closeMobileMenu();
    }
}

function openMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const button = document.querySelector('[data-mobile-menu-button]');
    
    if (menu) {
        menu.classList.remove('hidden');
        button?.setAttribute('aria-expanded', 'true');
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const button = document.querySelector('[data-mobile-menu-button]');
    
    if (menu) {
        menu.classList.add('hidden');
        button?.setAttribute('aria-expanded', 'false');
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Atalhos de teclado básicos
    document.addEventListener('keydown', function(e) {
        // Esc para fechar menu mobile
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
        
        // Atalhos com Ctrl
        if (e.ctrlKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    navigateTo('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    navigateTo('leads');
                    break;
                case '3':
                    e.preventDefault();
                    navigateTo('automacoes');
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
            
            // Fechar menu mobile se estiver aberto
            closeMobileMenu();
        }
    });
}

// ===== ATUALIZAÇÃO DE ESTADO =====
function updateNavigationState() {
    try {
        // Atualizar links ativos na navegação principal
        const navLinks = document.querySelectorAll('nav a, #mobile-menu a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            const isActive = (navigationState.currentPage === 'dashboard' && href.includes('index.html')) ||
                            href.includes(navigationState.currentPage);
            
            if (isActive) {
                link.classList.add('text-blue-600', 'font-medium');
                link.classList.remove('text-gray-600', 'text-gray-700');
                
                // Para navegação desktop
                if (!link.closest('#mobile-menu')) {
                    link.classList.add('border-b-2', 'border-blue-600');
                }
                
                // Para navegação mobile
                if (link.closest('#mobile-menu')) {
                    link.classList.add('bg-blue-50');
                }
            } else {
                link.classList.remove('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'bg-blue-50');
                
                if (link.closest('#mobile-menu')) {
                    link.classList.add('text-gray-700');
                } else {
                    link.classList.add('text-gray-600');
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar estado da navegação:', error);
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

// ===== EXPORTAR PARA USO GLOBAL =====
window.navigateTo = navigateTo;
window.checkRouteAccess = checkRouteAccess;
window.getCurrentPage = getCurrentPage;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;

// Sistema de navegação disponível globalmente
window.NavigationSystem = {
    navigateTo,
    checkRouteAccess,
    getCurrentPage,
    isInitialized: isNavigationInitialized,
    getRoutes,
    toggleMobileMenu,
    closeMobileMenu,
    state: navigationState
};

console.log('🧭 Sistema de navegação simples carregado!');
