// ALSHAM 360° PRIMA - Authentication System CORRIGIDO
// Sistema de autenticação global e proteção de rotas

import { 
    getCurrentUser, 
    onAuthStateChange, 
    signOut
} from '../lib/supabase.js'

// ===== ESTADO DE AUTENTICAÇÃO =====
const authState = {
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    orgId: null,
    sessionTimeout: null,
    authUnsubscribe: null // Para limpar o listener
};

// ===== CONFIGURAÇÕES =====
const config = {
    loginPage: '/login.html',
    dashboardPage: '/index.html',
    sessionTimeout: 3600000, // 1 hora
    checkInterval: 300000, // 5 minutos
    publicPages: ['/login.html', '/register.html', '/forgot-password.html', '/reset-password.html']
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeAuth);

async function initializeAuth() {
    console.log('🔐 Auth system initializing...');
    
    try {
        // Verificar se é página pública
        if (isPublicPage()) {
            console.log('📄 Public page - skipping auth check');
            authState.isLoading = false;
            return;
        }

        // Verificar autenticação
        await checkAuthStatus();
        
        // Configurar listeners
        setupAuthListeners();
        
        // Iniciar verificação periódica
        startPeriodicCheck();
        
        console.log('✅ Auth system initialized');
        
    } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        handleAuthError(error);
    } finally {
        authState.isLoading = false;
    }
}

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
async function checkAuthStatus() {
    authState.isLoading = true;
    
    try {
        const { user, profile, error } = await getCurrentUser();
        
        if (error || !user) {
            console.log('❌ User not authenticated');
            handleUnauthenticated();
            return false;
        }
        
        // Usuário autenticado
        authState.user = user;
        authState.profile = profile;
        authState.isAuthenticated = true;
        authState.orgId = profile?.org_id || 'default-org-id';
        
        // Salvar org_id no localStorage
        try {
            localStorage.setItem('org_id', authState.orgId);
        } catch (storageError) {
            console.warn('⚠️ Could not save to localStorage:', storageError);
        }
        
        console.log('✅ User authenticated:', user.email);
        updateUIForAuthenticatedUser();
        
        return true;
        
    } catch (error) {
        console.error('❌ Auth check failed:', error);
        handleAuthError(error);
        return false;
        
    } finally {
        authState.isLoading = false;
    }
}

// ===== LISTENERS DE AUTENTICAÇÃO =====
function setupAuthListeners() {
    // Monitorar mudanças de autenticação - CORRIGIDO
    try {
        const unsubscribe = onAuthStateChange((event, session) => {
            console.log('🔄 Auth state changed:', event);
            
            switch (event) {
                case 'SIGNED_IN':
                    handleSignedIn(session);
                    break;
                case 'SIGNED_OUT':
                    handleSignedOut();
                    break;
                case 'TOKEN_REFRESHED':
                    console.log('🔄 Token refreshed');
                    break;
                default:
                    console.log('🔄 Unknown auth event:', event);
            }
        });
        
        // Salvar referência para cleanup
        authState.authUnsubscribe = unsubscribe;
        
    } catch (error) {
        console.error('❌ Failed to setup auth listener:', error);
    }
    
    // Logout button
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-logout]') || e.target.closest('[data-logout]')) {
            e.preventDefault();
            handleLogout();
        }
    });
    
    // Session timeout warning
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && authState.isAuthenticated) {
            // Debounce para evitar múltiplas chamadas
            clearTimeout(authState.sessionTimeout);
            authState.sessionTimeout = setTimeout(() => {
                checkAuthStatus();
            }, 1000);
        }
    });
    
    // Cleanup quando a página for fechada
    window.addEventListener('beforeunload', () => {
        if (authState.authUnsubscribe) {
            authState.authUnsubscribe();
        }
    });
}

// ===== HANDLERS DE EVENTOS =====
async function handleSignedIn(session) {
    if (session?.user) {
        console.log('✅ User signed in:', session.user.email);
        
        authState.user = session.user;
        authState.isAuthenticated = true;
        
        // Buscar perfil completo
        try {
            const { profile } = await getCurrentUser();
            authState.profile = profile;
            authState.orgId = profile?.org_id || 'default-org-id';
            
            try {
                localStorage.setItem('org_id', authState.orgId);
            } catch (storageError) {
                console.warn('⚠️ Could not save to localStorage:', storageError);
            }
        } catch (error) {
            console.warn('⚠️ Could not fetch user profile:', error);
        }
        
        // Redirecionar se estiver em página de login
        if (window.location.pathname === config.loginPage) {
            // Verificar se há redirecionamento salvo
            const redirectUrl = sessionStorage.getItem('redirect_after_login');
            if (redirectUrl && redirectUrl !== window.location.href) {
                sessionStorage.removeItem('redirect_after_login');
                window.location.href = redirectUrl;
            } else {
                window.location.href = config.dashboardPage;
            }
        }
        
        updateUIForAuthenticatedUser();
    }
}

function handleSignedOut() {
    console.log('🚪 User signed out');
    
    authState.user = null;
    authState.profile = null;
    authState.isAuthenticated = false;
    authState.orgId = null;
    
    // Limpar localStorage
    try {
        localStorage.removeItem('org_id');
    } catch (error) {
        console.warn('⚠️ Could not clear localStorage:', error);
    }
    
    // Redirecionar para login se não estiver em página pública
    if (!isPublicPage()) {
        window.location.href = config.loginPage;
    }
    
    updateUIForUnauthenticatedUser();
}

async function handleLogout() {
    try {
        console.log('🚪 Logging out...');
        
        // Mostrar loading se necessário
        const logoutButtons = document.querySelectorAll('[data-logout]');
        logoutButtons.forEach(btn => {
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = 'Saindo...';
            
            // Restaurar após 3 segundos em caso de erro
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
            }, 3000);
        });
        
        const { error } = await signOut();
        if (error) {
            console.error('❌ Logout error:', error);
            // Restaurar botões em caso de erro
            logoutButtons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = btn.dataset.originalText || 'Sair';
            });
            return;
        }
        
        console.log('✅ Logged out successfully');
        
        // Limpar estado
        handleSignedOut();
        
    } catch (error) {
        console.error('❌ Logout failed:', error);
    }
}

// ===== PROTEÇÃO DE ROTAS =====
function isPublicPage() {
    const currentPath = window.location.pathname;
    return config.publicPages.some(page => 
        currentPath === page || currentPath.endsWith(page)
    );
}

function handleUnauthenticated() {
    if (!isPublicPage()) {
        console.log('🔒 Redirecting to login...');
        
        // Salvar página atual para redirecionamento após login
        try {
            sessionStorage.setItem('redirect_after_login', window.location.href);
        } catch (error) {
            console.warn('⚠️ Could not save redirect URL:', error);
        }
        
        window.location.href = config.loginPage;
    }
}

function handleAuthError(error) {
    console.error('🚨 Auth error:', error);
    
    // Se for erro de token expirado ou inválido, redirecionar para login
    if (error?.message && (
        error.message.includes('expired') || 
        error.message.includes('invalid') ||
        error.message.includes('unauthorized')
    )) {
        handleUnauthenticated();
    }
}

// ===== ATUALIZAÇÃO DE UI =====
function updateUIForAuthenticatedUser() {
    // Mostrar informações do usuário
    const userElements = document.querySelectorAll('[data-user-email]');
    userElements.forEach(el => {
        el.textContent = authState.user?.email || '';
    });
    
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(el => {
        const name = authState.profile?.full_name || 
                    authState.user?.user_metadata?.full_name || 
                    authState.profile?.name ||
                    authState.user?.email?.split('@')[0] || 
                    'Usuário';
        el.textContent = name;
    });
    
    // Mostrar org info se disponível
    const orgElements = document.querySelectorAll('[data-org-name]');
    orgElements.forEach(el => {
        el.textContent = authState.profile?.org_name || 'Organização';
    });
    
    // Mostrar elementos autenticados
    const authElements = document.querySelectorAll('[data-auth-required]');
    authElements.forEach(el => el.classList.remove('hidden'));
    
    // Esconder elementos não autenticados
    const noAuthElements = document.querySelectorAll('[data-no-auth]');
    noAuthElements.forEach(el => el.classList.add('hidden'));
    
    // Mostrar botão de logout
    const logoutButtons = document.querySelectorAll('[data-logout]');
    logoutButtons.forEach(btn => {
        btn.classList.remove('hidden');
        btn.disabled = false;
    });
    
    // Esconder loading se existir
    const loadingElements = document.querySelectorAll('[data-auth-loading]');
    loadingElements.forEach(el => el.classList.add('hidden'));
}

function updateUIForUnauthenticatedUser() {
    // Esconder elementos autenticados
    const authElements = document.querySelectorAll('[data-auth-required]');
    authElements.forEach(el => el.classList.add('hidden'));
    
    // Mostrar elementos não autenticados
    const noAuthElements = document.querySelectorAll('[data-no-auth]');
    noAuthElements.forEach(el => el.classList.remove('hidden'));
    
    // Esconder botão de logout
    const logoutButtons = document.querySelectorAll('[data-logout]');
    logoutButtons.forEach(btn => btn.classList.add('hidden'));
    
    // Esconder loading se existir
    const loadingElements = document.querySelectorAll('[data-auth-loading]');
    loadingElements.forEach(el => el.classList.add('hidden'));
}

// ===== VERIFICAÇÃO PERIÓDICA =====
function startPeriodicCheck() {
    setInterval(async () => {
        if (authState.isAuthenticated && !isPublicPage() && !authState.isLoading) {
            try {
                const isValid = await checkAuthStatus();
                if (!isValid) {
                    console.log('⚠️ Session expired, redirecting to login');
                    handleUnauthenticated();
                }
            } catch (error) {
                console.error('❌ Periodic auth check failed:', error);
            }
        }
    }, config.checkInterval);
}

// ===== UTILITÁRIOS =====
function getAuthState() {
    return { ...authState };
}

function getCurrentOrgId() {
    if (authState.orgId) return authState.orgId;
    
    try {
        return localStorage.getItem('org_id') || 'default-org-id';
    } catch (error) {
        console.warn('⚠️ Could not access localStorage:', error);
        return 'default-org-id';
    }
}

function requireAuth() {
    if (!authState.isAuthenticated) {
        handleUnauthenticated();
        return false;
    }
    return true;
}

// Função para aguardar autenticação (útil para outras scripts)
function waitForAuth(timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (authState.isAuthenticated) {
            resolve(authState);
            return;
        }
        
        if (!authState.isLoading) {
            reject(new Error('User not authenticated'));
            return;
        }
        
        const checkInterval = setInterval(() => {
            if (!authState.isLoading) {
                clearInterval(checkInterval);
                if (authState.isAuthenticated) {
                    resolve(authState);
                } else {
                    reject(new Error('User not authenticated'));
                }
            }
        }, 100);
        
        // Timeout
        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('Auth check timeout'));
        }, timeout);
    });
}

// ===== API PÚBLICA =====
window.auth = {
    getAuthState,
    getCurrentOrgId,
    requireAuth,
    checkAuthStatus,
    handleLogout,
    waitForAuth,
    isAuthenticated: () => authState.isAuthenticated,
    isLoading: () => authState.isLoading,
    getUser: () => authState.user,
    getProfile: () => authState.profile
};

// ===== EXPORTS =====
export {
    getAuthState,
    getCurrentOrgId,
    requireAuth,
    checkAuthStatus,
    handleLogout,
    waitForAuth
};

console.log('🔐 Auth module loaded');
