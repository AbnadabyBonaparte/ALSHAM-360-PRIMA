// Sistema de navegação global para ALSHAM 360° PRIMA

// Configuração das rotas para produção
const routes = {
    'dashboard': '/index.html',
    'leads': '/leads.html',
    'automacoes': '/automacoes.html',
    'relatorios': '/relatorios.html',
    'configuracoes': '/configuracoes.html',
    'gamificacao': '/gamificacao.html',
    'login': '/login.html',
    'register': '/register.html'
};

// Função para navegar entre páginas
window.navigateTo = function(page) {
    const url = routes[page];
    if (url) {
        window.location.href = url;
    } else {
        console.error(`Página não encontrada: ${page}`);
    }
};

// Função para atualizar navegação ativa
function updateActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.includes(href.replace('../../', '').replace('.html', ''))) {
            link.classList.add('text-primary', 'font-medium', 'border-b-2', 'border-primary', 'pb-1');
            link.classList.remove('text-gray-600', 'hover:text-primary');
        } else {
            link.classList.remove('text-primary', 'font-medium', 'border-b-2', 'border-primary', 'pb-1');
            link.classList.add('text-gray-600', 'hover:text-primary');
        }
    });
}

// Função para criar menu de navegação dinâmico
function createNavigationMenu() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'leads', label: 'Leads', icon: '👥' },
        { key: 'automacoes', label: 'Automações', icon: '🤖' },
        { key: 'relatorios', label: 'Relatórios', icon: '📈' },
        { key: 'gamificacao', label: 'Gamificação', icon: '🎮' },
        { key: 'configuracoes', label: 'Configurações', icon: '⚙️' }
    ];

    const currentPath = window.location.pathname;
    
    nav.innerHTML = menuItems.map(item => {
        const isActive = currentPath.includes(item.key) || 
                        (item.key === 'dashboard' && currentPath.includes('index.html'));
        
        const activeClass = isActive ? 
            'text-primary font-medium border-b-2 border-primary pb-1' : 
            'text-gray-600 hover:text-primary transition-colors font-medium';
            
        return `
            <a href="${routes[item.key]}" class="${activeClass}">
                <span class="hidden sm:inline">${item.icon}</span> ${item.label}
            </a>
        `;
    }).join('');
}

// Função para criar breadcrumb
function createBreadcrumb() {
    const breadcrumbContainer = document.getElementById('breadcrumb');
    if (!breadcrumbContainer) return;

    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment);
    
    let breadcrumbHTML = `
        <nav class="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <a href="${routes.dashboard}" class="hover:text-primary transition-colors">🏠 Dashboard</a>
    `;
    
    if (currentPath.includes('leads')) {
        breadcrumbHTML += `<span>›</span><span class="text-gray-900 font-medium">👥 Leads</span>`;
    } else if (currentPath.includes('automacoes')) {
        breadcrumbHTML += `<span>›</span><span class="text-gray-900 font-medium">🤖 Automações</span>`;
    } else if (currentPath.includes('relatorios')) {
        breadcrumbHTML += `<span>›</span><span class="text-gray-900 font-medium">📈 Relatórios</span>`;
    } else if (currentPath.includes('gamificacao')) {
        breadcrumbHTML += `<span>›</span><span class="text-gray-900 font-medium">🎮 Gamificação</span>`;
    } else if (currentPath.includes('configuracoes')) {
        breadcrumbHTML += `<span>›</span><span class="text-gray-900 font-medium">⚙️ Configurações</span>`;
    }
    
    breadcrumbHTML += `</nav>`;
    breadcrumbContainer.innerHTML = breadcrumbHTML;
}

// Função para criar menu mobile
function createMobileMenu() {
    const header = document.querySelector('header');
    if (!header) return;

    // Adicionar botão de menu mobile
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors';
    mobileMenuButton.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
    `;
    
    // Adicionar menu mobile
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'hidden md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40';
    mobileMenu.id = 'mobile-menu';
    
    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'leads', label: 'Leads', icon: '👥' },
        { key: 'automacoes', label: 'Automações', icon: '🤖' },
        { key: 'relatorios', label: 'Relatórios', icon: '📈' },
        { key: 'gamificacao', label: 'Gamificação', icon: '🎮' },
        { key: 'configuracoes', label: 'Configurações', icon: '⚙️' }
    ];
    
    mobileMenu.innerHTML = `
        <div class="px-4 py-2 space-y-1">
            ${menuItems.map(item => `
                <a href="${routes[item.key]}" class="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                    ${item.icon} ${item.label}
                </a>
            `).join('')}
        </div>
    `;
    
    // Adicionar event listener para toggle
    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });
    
    // Inserir elementos no header
    const headerContainer = header.querySelector('.max-w-7xl');
    if (headerContainer) {
        headerContainer.appendChild(mobileMenu);
        
        // Adicionar botão antes do nav existente
        const nav = headerContainer.querySelector('nav');
        if (nav) {
            nav.parentNode.insertBefore(mobileMenuButton, nav);
        }
    }
}

// Função para destacar página atual no menu
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a, #mobile-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Verificar se o link corresponde à página atual
        const isActive = currentPath.includes(href.replace('../../', '').replace('.html', '')) ||
                         (href.includes('index.html') && currentPath.includes('index.html'));
        
        if (isActive) {
            link.classList.add('text-primary', 'font-medium');
            link.classList.remove('text-gray-600', 'text-gray-700');
            
            // Para navegação desktop
            if (link.closest('nav') && !link.closest('#mobile-menu')) {
                link.classList.add('border-b-2', 'border-primary', 'pb-1');
            }
            
            // Para navegação mobile
            if (link.closest('#mobile-menu')) {
                link.classList.add('bg-primary/10');
            }
        }
    });
}

// Função para criar atalhos de teclado
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Verificar se Ctrl/Cmd está pressionado
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
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
                case '4':
                    e.preventDefault();
                    navigateTo('relatorios');
                    break;
                case '5':
                    e.preventDefault();
                    navigateTo('gamificacao');
                    break;
                case '6':
                    e.preventDefault();
                    navigateTo('configuracoes');
                    break;
            }
        }
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Criar navegação dinâmica
    createNavigationMenu();
    
    // Criar breadcrumb
    createBreadcrumb();
    
    // Criar menu mobile
    createMobileMenu();
    
    // Destacar página atual
    highlightCurrentPage();
    
    // Configurar atalhos de teclado
    setupKeyboardShortcuts();
    
    // Fechar menu mobile ao clicar fora
    document.addEventListener('click', function(e) {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
        
        if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuButton?.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
});

// Exportar funções para uso global
window.navigationUtils = {
    navigateTo,
    updateActiveNavigation,
    createNavigationMenu,
    createBreadcrumb,
    highlightCurrentPage
};

