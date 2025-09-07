// ALSHAM 360° PRIMA - Navigation System
// Sistema de navegação dinâmica e controle de menu ativo

// ===== CONFIGURAÇÃO DE ROTAS =====
const routes = {
    '/': { title: 'Dashboard', icon: '📊' },
    '/index.html': { title: 'Dashboard', icon: '📊' },
    '/leads.html': { title: 'Leads', icon: '👥' },
    '/leads-real.html': { title: 'Leads Real', icon: '🎯' },
    '/automacoes.html': { title: 'Automações', icon: '🤖' },
    '/relacionamentos.html': { title: 'Relacionamentos', icon: '🔗' },
    '/gamificacao.html': { title: 'Gamificação', icon: '🎮' },
    '/relatorios.html': { title: 'Relatórios', icon: '📈' },
    '/configuracoes.html': { title: 'Configurações', icon: '⚙️' }
};

// ===== ESTADO DA NAVEGAÇÃO =====
const navState = {
    currentPath: window.location.pathname,
    isMenuOpen: false,
    isMobile: window.innerWidth < 768
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeNavigation);
window.addEventListener('resize', handleResize);

function initializeNavigation() {
    updateActiveMenuItem();
    updatePageTitle();
    setupMobileMenu();
    setupNavigationEvents();
    createBreadcrumb();
    console.log('🧭 Navigation system initialized');
}

// ===== CONTROLE DE MENU ATIVO =====
function updateActiveMenuItem() {
    // Remove classes ativas de todos os itens
    document.querySelectorAll('[data-nav-item]').forEach(item => {
        item.classList.remove('active', 'bg-primary', 'text-white');
        item.classList.add('text-gray-600', 'hover:bg-gray-100');
    });

    // Adiciona classe ativa ao item atual
    const currentItem = document.querySelector(`[data-nav-item="${navState.currentPath}"]`) ||
                       document.querySelector(`[data-nav-item="/"]`);
    
    if (currentItem) {
        currentItem.classList.remove('text-gray-600', 'hover:bg-gray-100');
        currentItem.classList.add('active', 'bg-primary', 'text-white');
    }
}

// ===== TÍTULO DA PÁGINA =====
function updatePageTitle() {
    const route = routes[navState.currentPath] || routes['/'];
    document.title = `${route.title} - ALSHAM 360° PRIMA`;
    
    // Atualiza h1 se existir
    const pageTitle = document.querySelector('[data-page-title]');
    if (pageTitle) {
        pageTitle.textContent = route.title;
    }
}

// ===== BREADCRUMB =====
function createBreadcrumb() {
    const breadcrumbContainer = document.querySelector('[data-breadcrumb]');
    if (!breadcrumbContainer) return;

    const route = routes[navState.currentPath] || routes['/'];
    const breadcrumbHTML = `
        <nav class="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" class="hover:text-primary transition-colors">
                <span class="mr-1">🏠</span>Dashboard
            </a>
            ${navState.currentPath !== '/' && navState.currentPath !== '/index.html' ? `
                <span class="text-gray-400">></span>
                <span class="text-gray-900 font-medium">
                    <span class="mr-1">${route.icon}</span>${route.title}
                </span>
            ` : ''}
        </nav>
    `;
    breadcrumbContainer.innerHTML = breadcrumbHTML;
}

// ===== MENU MOBILE =====
function setupMobileMenu() {
    const menuButton = document.querySelector('[data-mobile-menu-button]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const menuOverlay = document.querySelector('[data-menu-overlay]');

    if (!menuButton || !mobileMenu) return;

    menuButton.addEventListener('click', toggleMobileMenu);
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMobileMenu);
    }

    // Fecha menu ao clicar em link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

function toggleMobileMenu() {
    navState.isMenuOpen = !navState.isMenuOpen;
    updateMobileMenuVisibility();
}

function closeMobileMenu() {
    navState.isMenuOpen = false;
    updateMobileMenuVisibility();
}

function updateMobileMenuVisibility() {
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const menuOverlay = document.querySelector('[data-menu-overlay]');
    const menuButton = document.querySelector('[data-mobile-menu-button]');

    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden', !navState.isMenuOpen);
        mobileMenu.classList.toggle('translate-x-0', navState.isMenuOpen);
        mobileMenu.classList.toggle('-translate-x-full', !navState.isMenuOpen);
    }

    if (menuOverlay) {
        menuOverlay.classList.toggle('hidden', !navState.isMenuOpen);
    }

    if (menuButton) {
        const icon = menuButton.querySelector('span');
        if (icon) {
            icon.textContent = navState.isMenuOpen ? '✕' : '☰';
        }
    }
}

// ===== EVENTOS DE NAVEGAÇÃO =====
function setupNavigationEvents() {
    // Intercepta cliques em links de navegação
    document.addEventListener('click', (e) => {
        const navLink = e.target.closest('[data-nav-item]');
        if (navLink) {
            e.preventDefault();
            const href = navLink.getAttribute('data-nav-item') || navLink.getAttribute('href');
            if (href && href !== navState.currentPath) {
                navigateTo(href);
            }
        }
    });

    // Escuta mudanças na URL (botão voltar/avançar)
    window.addEventListener('popstate', () => {
        navState.currentPath = window.location.pathname;
        updateActiveMenuItem();
        updatePageTitle();
        createBreadcrumb();
    });
}

// ===== NAVEGAÇÃO PROGRAMÁTICA =====
function navigateTo(path) {
    if (path === navState.currentPath) return;
    
    // Mostra loading
    showNavigationLoading();
    
    setTimeout(() => {
        window.location.href = path;
    }, 150); // Pequeno delay para mostrar o loading
}

function showNavigationLoading() {
    const loader = document.createElement('div');
    loader.id = 'nav-loader';
    loader.className = 'fixed top-0 left-0 w-full h-1 bg-primary z-50';
    loader.innerHTML = '<div class="h-full bg-blue-600 animate-pulse"></div>';
    document.body.appendChild(loader);
    
    setTimeout(() => {
        loader?.remove();
    }, 300);
}

// ===== RESPONSIVE =====
function handleResize() {
    const wasMobile = navState.isMobile;
    navState.isMobile = window.innerWidth < 768;
    
    // Se mudou de mobile para desktop, fecha o menu
    if (wasMobile && !navState.isMobile && navState.isMenuOpen) {
        closeMobileMenu();
    }
}

// ===== NOTIFICAÇÕES DE NAVEGAÇÃO =====
function showNavigationToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ===== API PÚBLICA =====
window.navigation = {
    navigateTo,
    updateActiveMenuItem,
    toggleMobileMenu,
    closeMobileMenu,
    getCurrentPath: () => navState.currentPath,
    isMenuOpen: () => navState.isMenuOpen
};

// ===== EXPORTS =====
export {
    navigateTo,
    updateActiveMenuItem,
    toggleMobileMenu,
    closeMobileMenu
};
