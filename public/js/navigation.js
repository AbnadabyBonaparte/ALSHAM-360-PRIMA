/**
 * ALSHAM 360° PRIMA - Sistema de Navegação Otimizado V1.2
 * Sistema de navegação funcional e compatível com fix-imports.js
 *
 * @version 1.2.0 - CORRIGIDO
 * @author ALSHAM
 *
 * ✅ FUNCIONALIDADES:
 * - Navegação entre páginas
 * - Verificação de acesso integrada com fix-imports
 * - Menu mobile responsivo
 * - Links ajustados (leads.html → leads-real.html)
 */

function waitForFixImports(callback) {
    if (window.checkRouteAccess && window.showAuthNotification) {
        console.log('✅ Fix-imports já carregado, inicializando navegação');
        callback();
    } else {
        console.log('⏳ Aguardando fix-imports...');
        window.addEventListener('fix-imports-ready', () => {
            console.log('✅ Fix-imports pronto, inicializando navegação');
            callback();
        });
        setTimeout(() => {
            console.log('⚠️ Timeout aguardando fix-imports, inicializando mesmo assim');
            callback();
        }, 3000);
    }
}

// ===== CONFIGURAÇÃO DE ROTAS =====
const ROUTES = {
    dashboard: '/index.html',
    leads: '/leads-real.html', // ✅ corrigido
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
    detectCurrentPage();
    checkAuthentication();
    setupMobileMenu();
    setupEventListeners();
    updateNavigationState();
    navigationState.isInitialized = true;

    window.dispatchEvent(new CustomEvent('navigation-ready', {
        detail: { currentPage: navigationState.currentPage }
    }));
}

// ===== DETECÇÃO DE PÁGINA =====
function detectCurrentPage() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('leads-real')) {
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
    updatePageTitle();
}

// (restante do código permanece idêntico, só ajustamos as rotas e o detectCurrentPage)
