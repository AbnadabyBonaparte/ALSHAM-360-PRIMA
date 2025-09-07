// Sistema de navegação global para ALSHAM 360° PRIMA (Versão Final Otimizada)
// Combina a robustez da versão do Copilot com a correção de caminhos do Gemini para o Vite.

/**
 * Mapeamento centralizado das rotas.
 * CORREÇÃO CRÍTICA: Caminhos ajustados para o servidor do Vite.
 * O Vite serve os HTMLs como se estivessem na raiz.
 */
const routes = {
    'dashboard': '/', // Aponta para o index.html na raiz
    'leads': '/leads-real.html',
    'automacoes': '/automacoes.html',
    'configuracoes': '/configuracoes.html',
    'gamificacao': '/gamificacao.html',
    'relacionamentos': '/relacionamentos.html',
    'login': '/login.html',
    'register': '/register.html'
    // 'relatorios': '/relatorios.html', // Descomente quando a página for criada
};

/**
 * Verifica se um link está ativo baseado no pathname.
 * Lógica robusta que funciona para a raiz e outras páginas.
 */
function isLinkActive(linkHref, currentPath) {
    if (!linkHref) return false;
    // Trata o caso da dashboard (index.html) que pode ser '/' ou '/index.html'
    if (linkHref === '/' || linkHref.endsWith('index.html')) {
        return currentPath === '/' || currentPath.endsWith('/index.html');
    }
    // Para outras páginas, uma verificação exata é mais segura
    return currentPath.endsWith(linkHref);
}

/**
 * Navegação para uma página.
 */
window.navigateTo = function(pageKey) {
    const url = routes[pageKey];
    if (url !== undefined) {
        window.location.href = url;
    } else {
        console.error(`[Navegação] Rota não encontrada para a chave: ${pageKey}`);
    }
};

/**
 * Atualiza os estilos dos links de navegação para destacar o ativo.
 */
function updateActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a, #mobile-menu a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (isLinkActive(href, currentPath)) {
            link.classList.add('text-primary', 'font-medium', 'border-b-2', 'border-primary', 'pb-1');
            link.classList.remove('text-gray-600', 'hover:text-primary', 'text-gray-700');
        } else {
            link.classList.remove('text-primary', 'font-medium', 'border-b-2', 'border-primary', 'pb-1');
            link.classList.add('text-gray-600', 'hover:text-primary');
        }
    });
}

/**
 * Gera e insere o menu de navegação principal dinamicamente.
 * O nav principal deve ter a classe 'main-nav'
 */
function createNavigationMenu() {
    const nav = document.querySelector('nav.main-nav');
    if (!nav) return;

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'leads', label: 'Leads', icon: '👥' },
        { key: 'automacoes', label: 'Automações', icon: '🤖' },
        { key: 'relacionamentos', label: 'Relacionamentos', icon: '🔗' },
        { key: 'gamificacao', label: 'Gamificação', icon: '🎮' },
        { key: 'configuracoes', label: 'Configurações', icon: '⚙️' },
        // { key: 'relatorios', label: 'Relatórios', icon: '📈' }, // Aparecerá quando a rota for adicionada
    ].filter(item => routes[item.key]); // Só mostra se existir rota

    const currentPath = window.location.pathname;

    nav.innerHTML = menuItems.map(item => {
        const href = routes[item.key];
        const activeClass = isLinkActive(href, currentPath)
            ? 'text-primary font-medium border-b-2 border-primary pb-1'
            : 'text-gray-600 hover:text-primary transition-colors font-medium';

        return `
            <a href="${href}" class="${activeClass}">
                <span class="hidden sm:inline">${item.icon}</span> ${item.label}
            </a>
        `;
    }).join('');
}

/**
 * Gera e insere o breadcrumb na página.
 */
function createBreadcrumb() {
    const breadcrumbContainer = document.getElementById('breadcrumb');
    if (!breadcrumbContainer) return;

    const currentPath = window.location.pathname;
    // Lógica elegante do Copilot para encontrar a chave e o rótulo
    const key = Object.keys(routes).find(k => isLinkActive(routes[k], currentPath));
    const label = key
        ? {
            'dashboard': '🏠 Dashboard',
            'leads': '👥 Leads',
            'automacoes': '🤖 Automações',
            'configuracoes': '⚙️ Configurações',
            'gamificacao': '🎮 Gamificação',
            'relacionamentos': '🔗 Relacionamentos',
            // 'relatorios': '📈 Relatórios',
        }[key] || 'Página Atual'
        : 'Página Atual';

    let breadcrumbHTML = `
        <nav class="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <a href="${routes.dashboard}" class="hover:text-primary transition-colors">🏠 Dashboard</a>
    `;

    if (key && key !== 'dashboard') {
        breadcrumbHTML += `<span>›</span><span class="text-gray-900 font-medium">${label}</span>`;
    }

    breadcrumbHTML += `</nav>`;
    breadcrumbContainer.innerHTML = breadcrumbHTML;
}

/**
 * Gera o menu mobile.
 */
function createMobileMenu() {
    const header = document.querySelector('header');
    if (!header) return;

    // Botão mobile
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors';
    mobileMenuButton.setAttribute('data-mobile-menu-button', 'true');
    mobileMenuButton.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
    `;

    // Menu mobile
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'hidden md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40';
    mobileMenu.id = 'mobile-menu';

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'leads', label: 'Leads', icon: '👥' },
        { key: 'automacoes', label: 'Automações', icon: '🤖' },
        { key: 'relacionamentos', label: 'Relacionamentos', icon: '🔗' },
        { key: 'gamificacao', label: 'Gamificação', icon: '🎮' },
        { key: 'configuracoes', label: 'Configurações', icon: '⚙️' },
        // { key: 'relatorios', label: 'Relatórios', icon: '📈' }, // Aparecerá quando a rota for adicionada
    ].filter(item => routes[item.key]);

    mobileMenu.innerHTML = `
        <div class="px-4 py-2 space-y-1">
            ${menuItems.map(item => `
                <a href="${routes[item.key]}" class="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                    ${item.icon} ${item.label}
                </a>
            `).join('')}
        </div>
    `;

    // Toggle
    mobileMenuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('hidden');
    });

    // Inserção
    const headerContainer = header.querySelector('.max-w-7xl') || header;
    headerContainer.appendChild(mobileMenu);

    const nav = headerContainer.querySelector('nav');
    if (nav) {
        nav.parentNode.insertBefore(mobileMenuButton, nav);
    }
}

/**
 * Atalhos de teclado para navegação rápida.
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1': e.preventDefault(); navigateTo('dashboard'); break;
                case '2': e.preventDefault(); navigateTo('leads'); break;
                case '3': e.preventDefault(); navigateTo('automacoes'); break;
                case '4': e.preventDefault(); navigateTo('relacionamentos'); break;
                case '5': e.preventDefault(); navigateTo('gamificacao'); break;
                case '6': e.preventDefault(); navigateTo('configuracoes'); break;
                // case '7': e.preventDefault(); navigateTo('relatorios'); break; // Quando existir
            }
        }
    });
}

// Event listener principal que inicializa tudo
document.addEventListener('DOMContentLoaded', function () {
    createNavigationMenu();
    createBreadcrumb();
    createMobileMenu();
    updateActiveNavigation();
    setupKeyboardShortcuts();

    // Fechar menu mobile ao clicar fora
    document.addEventListener('click', function (e) {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
        if (mobileMenu && !mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && !mobileMenuButton?.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
});

// Exporta utilitários para uso global (opcional)
window.navigationUtils = {
    navigateTo,
    updateActiveNavigation,
    createNavigationMenu,
    createBreadcrumb
};
