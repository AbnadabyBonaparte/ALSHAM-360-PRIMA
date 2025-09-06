// ALSHAM 360° PRIMA - Authentication Middleware
// Proteção de rotas e gestão de sessões

import { 
    getCurrentUser, 
    getCurrentSession, 
    onAuthStateChange,
    signOut
} from '../lib/supabase.js'

// Estado global de autenticação
let currentUser = null
let currentProfile = null
let isAuthenticated = false

// Páginas que não precisam de autenticação
const publicPages = [
    '/src/pages/login.html',
    '/src/pages/register.html',
    '/login.html',
    '/register.html',
    '/',
    '/index.html'
]

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth middleware loaded - ALSHAM 360° PRIMA')
    
    // Inicializar autenticação
    initializeAuth()
    
    // Configurar listeners globais
    setupGlobalListeners()
})

// ===== INICIALIZAÇÃO DE AUTENTICAÇÃO =====
async function initializeAuth() {
    try {
        // Verificar sessão atual
        const session = await getCurrentSession()
        
        if (session?.user) {
            // Buscar dados do usuário
            const { user, profile } = await getCurrentUser()
            
            if (user && profile) {
                setAuthenticatedUser(user, profile)
                console.log('Usuário autenticado:', user.email)
            } else {
                handleUnauthenticated()
            }
        } else {
            handleUnauthenticated()
        }
        
        // Configurar listener de mudanças de auth
        onAuthStateChange(handleAuthStateChange)
        
    } catch (error) {
        console.error('Erro na inicialização de auth:', error)
        handleUnauthenticated()
    }
}

// ===== GESTÃO DE ESTADO =====
function setAuthenticatedUser(user, profile) {
    currentUser = user
    currentProfile = profile
    isAuthenticated = true
    
    // Salvar no localStorage para persistência
    localStorage.setItem('alsham_auth_state', JSON.stringify({
        isAuthenticated: true,
        user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
        },
        profile: profile
    }))
    
    // Atualizar UI
    updateAuthUI()
    
    // Verificar se precisa redirecionar
    checkRouteAccess()
}

function clearAuthenticatedUser() {
    currentUser = null
    currentProfile = null
    isAuthenticated = false
    
    // Limpar localStorage
    localStorage.removeItem('alsham_auth_state')
    localStorage.removeItem('alsham_user_profile')
    localStorage.removeItem('alsham_org_id')
    
    // Atualizar UI
    updateAuthUI()
}

// ===== HANDLERS =====
function handleAuthStateChange(event, session, profile) {
    console.log('Auth state changed:', event)
    
    switch (event) {
        case 'SIGNED_IN':
            if (session?.user && profile) {
                setAuthenticatedUser(session.user, profile)
                showAuthNotification('Login realizado com sucesso!', 'success')
            }
            break
            
        case 'SIGNED_OUT':
            clearAuthenticatedUser()
            handleUnauthenticated()
            showAuthNotification('Logout realizado com sucesso!', 'info')
            break
            
        case 'TOKEN_REFRESHED':
            console.log('Token refreshed')
            break
            
        case 'USER_UPDATED':
            if (session?.user && profile) {
                setAuthenticatedUser(session.user, profile)
            }
            break
    }
}

function handleUnauthenticated() {
    clearAuthenticatedUser()
    
    // Verificar se está em página protegida
    const currentPath = window.location.pathname
    const isPublicPage = publicPages.some(page => 
        currentPath.includes(page) || currentPath === page
    )
    
    if (!isPublicPage) {
        console.log('Página protegida, redirecionando para login')
        redirectToLogin()
    }
}

// ===== PROTEÇÃO DE ROTAS =====
function checkRouteAccess() {
    const currentPath = window.location.pathname
    
    // Se está autenticado e em página de login/registro, redirecionar para dashboard
    if (isAuthenticated) {
        if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
            console.log('Usuário autenticado em página pública, redirecionando...')
            window.location.href = '/index.html'
        }
    }
}

function redirectToLogin() {
    // Salvar URL atual para redirecionar após login
    const currentUrl = window.location.href
    localStorage.setItem('alsham_redirect_after_login', currentUrl)
    
    // Redirecionar para login
    window.location.href = '/src/pages/login.html'
}

function redirectAfterLogin() {
    const redirectUrl = localStorage.getItem('alsham_redirect_after_login')
    localStorage.removeItem('alsham_redirect_after_login')
    
    if (redirectUrl && !redirectUrl.includes('login.html') && !redirectUrl.includes('register.html')) {
        window.location.href = redirectUrl
    } else {
        window.location.href = '/index.html'
    }
}

// ===== ATUALIZAÇÃO DE UI =====
function updateAuthUI() {
    // Atualizar elementos de navegação
    updateNavigation()
    
    // Atualizar informações do usuário
    updateUserInfo()
    
    // Atualizar botões de ação
    updateActionButtons()
}

function updateNavigation() {
    // Atualizar menu de navegação se existir
    const navUser = document.querySelector('[data-auth="user-nav"]')
    const navGuest = document.querySelector('[data-auth="guest-nav"]')
    
    if (navUser && navGuest) {
        if (isAuthenticated) {
            navUser.classList.remove('hidden')
            navGuest.classList.add('hidden')
        } else {
            navUser.classList.add('hidden')
            navGuest.classList.remove('hidden')
        }
    }
}

function updateUserInfo() {
    // Atualizar nome do usuário
    const userNameElements = document.querySelectorAll('[data-auth="user-name"]')
    userNameElements.forEach(element => {
        if (currentProfile?.full_name) {
            element.textContent = currentProfile.full_name
        }
    })
    
    // Atualizar email do usuário
    const userEmailElements = document.querySelectorAll('[data-auth="user-email"]')
    userEmailElements.forEach(element => {
        if (currentUser?.email) {
            element.textContent = currentUser.email
        }
    })
    
    // Atualizar avatar
    const userAvatarElements = document.querySelectorAll('[data-auth="user-avatar"]')
    userAvatarElements.forEach(element => {
        if (currentProfile?.avatar_url) {
            element.src = currentProfile.avatar_url
        } else if (currentProfile?.full_name) {
            // Usar iniciais como fallback
            const initials = currentProfile.full_name
                .split(' ')
                .map(name => name[0])
                .join('')
                .toUpperCase()
            element.textContent = initials
        }
    })
}

function updateActionButtons() {
    // Atualizar botões de logout
    const logoutButtons = document.querySelectorAll('[data-auth="logout-btn"]')
    logoutButtons.forEach(button => {
        button.addEventListener('click', handleLogout)
    })
}

// ===== AÇÕES DE AUTENTICAÇÃO =====
async function handleLogout() {
    try {
        console.log('Fazendo logout...')
        
        await signOut()
        
        // Redirecionar para página inicial
        window.location.href = '/src/pages/login.html'
        
    } catch (error) {
        console.error('Erro no logout:', error)
        showAuthNotification('Erro ao fazer logout', 'error')
    }
}

// ===== LISTENERS GLOBAIS =====
function setupGlobalListeners() {
    // Listener para mudanças de página (SPA)
    window.addEventListener('popstate', checkRouteAccess)
    
    // Listener para links internos
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href]')
        if (link && link.href.startsWith(window.location.origin)) {
            // Verificar acesso após navegação
            setTimeout(checkRouteAccess, 100)
        }
    })
    
    // Listener para visibilidade da página (detectar quando volta)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && isAuthenticated) {
            // Verificar se sessão ainda é válida
            checkSessionValidity()
        }
    })
}

// ===== VERIFICAÇÃO DE SESSÃO =====
async function checkSessionValidity() {
    try {
        const session = await getCurrentSession()
        
        if (!session || !session.user) {
            console.log('Sessão inválida, fazendo logout')
            handleUnauthenticated()
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        handleUnauthenticated()
    }
}

// ===== NOTIFICAÇÕES =====
function showAuthNotification(message, type = 'info') {
    // Criar notificação
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${getNotificationClasses(type)}`
    
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
                ${getNotificationIcon(type)}
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `
    
    document.body.appendChild(notification)
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)'
    }, 100)
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)'
        setTimeout(() => notification.remove(), 300)
    }, 5000)
}

function getNotificationClasses(type) {
    switch (type) {
        case 'success':
            return 'bg-green-50 border border-green-200 text-green-800'
        case 'error':
            return 'bg-red-50 border border-red-200 text-red-800'
        case 'warning':
            return 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        default:
            return 'bg-blue-50 border border-blue-200 text-blue-800'
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
        case 'error':
            return '<svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
        case 'warning':
            return '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
        default:
            return '<svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
    }
}

// ===== API PÚBLICA =====
window.AlshamAuth = {
    // Estado
    get isAuthenticated() { return isAuthenticated },
    get currentUser() { return currentUser },
    get currentProfile() { return currentProfile },
    
    // Ações
    logout: handleLogout,
    checkSession: checkSessionValidity,
    redirectToLogin,
    redirectAfterLogin,
    
    // Utilitários
    showNotification: showAuthNotification
}

console.log('🔐 Auth middleware configurado - ALSHAM 360° PRIMA')

