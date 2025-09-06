// ALSHAM 360° PRIMA - Authentication Middleware
// Proteção de rotas e gestão de sessões

import { 
    getCurrentUser, 
    getCurrentSession, 
    onAuthStateChange,
    signOut
} from '../lib/supabase.js';

// Estado global de autenticação
let currentUser = null;
let currentProfile = null;
let isAuthenticated = false;

// Páginas que não precisam de autenticação
const publicPages = [
    '/src/pages/login.html',
    '/src/pages/register.html',
    '/login.html',
    '/register.html',
    '/',
    '/index.html'
];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth middleware loaded - ALSHAM 360° PRIMA');
    initializeAuth();
    setupGlobalListeners();
});

// ===== INICIALIZAÇÃO DE AUTENTICAÇÃO =====
async function initializeAuth() {
    try {
        const session = await getCurrentSession();
        
        if (session?.user) {
            const { user, profile } = await getCurrentUser();
            if (user && profile) {
                setAuthenticatedUser(user, profile);
                console.log('Usuário autenticado:', user.email);
            } else {
                handleUnauthenticated();
            }
        } else {
            handleUnauthenticated();
        }
        
        onAuthStateChange(handleAuthStateChange);
        
    } catch (error) {
        console.error('Erro na inicialização de auth:', error);
        handleUnauthenticated();
    }
}

// ===== GESTÃO DE ESTADO =====
function setAuthenticatedUser(user, profile) {
    currentUser = user;
    currentProfile = profile;
    isAuthenticated = true;
    updateAuthUI();
    checkRouteAccess();
}

function clearAuthenticatedUser() {
    currentUser = null;
    currentProfile = null;
    isAuthenticated = false;
    updateAuthUI();
}

// ===== HANDLERS =====
function handleAuthStateChange(event, session, profile) {
    console.log('Auth state changed:', event);
    
    switch (event) {
        case 'SIGNED_IN':
            if (session?.user && profile) {
                setAuthenticatedUser(session.user, profile);
                redirectAfterLogin();
            }
            break;
            
        case 'SIGNED_OUT':
            clearAuthenticatedUser();
            handleUnauthenticated();
            break;
    }
}

function handleUnauthenticated() {
    clearAuthenticatedUser();
    const currentPath = window.location.pathname;
    const isPublicPage = publicPages.some(page => currentPath.endsWith(page));
    
    if (!isPublicPage) {
        console.log('Página protegida, redirecionando para login');
        redirectToLogin();
    }
}

// ===== PROTEÇÃO DE ROTAS =====
function checkRouteAccess() {
    const currentPath = window.location.pathname;
    if (isAuthenticated) {
        if (currentPath.endsWith('login.html') || currentPath.endsWith('register.html')) {
            console.log('Usuário autenticado em página pública, redirecionando...');
            window.location.href = '/index.html';
        }
    }
}

function redirectToLogin() {
    window.location.href = '/src/pages/login.html';
}

function redirectAfterLogin() {
    window.location.href = '/index.html';
}

// ===== ATUALIZAÇÃO DE UI =====
function updateAuthUI() {
    const userNameElements = document.querySelectorAll('[data-auth="user-name"]');
    userNameElements.forEach(element => {
        element.textContent = currentProfile?.full_name || currentUser?.email || 'Visitante';
    });
    
    const userAvatarElements = document.querySelectorAll('[data-auth="user-avatar"]');
    userAvatarElements.forEach(element => {
        const initials = (currentProfile?.full_name || 'U')
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        element.textContent = initials;
    });

    const logoutButtons = document.querySelectorAll('[data-auth="logout-btn"]');
    logoutButtons.forEach(button => {
        button.onclick = (e) => {
            e.preventDefault();
            handleLogout();
        };
    });
}


// ===== AÇÕES DE AUTENTICAÇÃO =====
async function handleLogout() {
    try {
        console.log('Fazendo logout...');
        await signOut();
        window.location.href = '/src/pages/login.html';
    } catch (error) {
        console.error('Erro no logout:', error);
    }
}

// ===== LISTENERS GLOBAIS =====
function setupGlobalListeners() {
    window.addEventListener('popstate', checkRouteAccess);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) checkSessionValidity();
    });
}

// ===== VERIFICAÇÃO DE SESSÃO =====
async function checkSessionValidity() {
    try {
        const session = await getCurrentSession();
        if (!session || !session.user) {
            console.log('Sessão inválida, fazendo logout');
            handleUnauthenticated();
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        handleUnauthenticated();
    }
}

