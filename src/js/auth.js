// ALSHAM 360° PRIMA - Authentication Middleware (Revisão Gemini)
// Proteção de rotas, gestão de sessões e correção de race conditions.

import { supabase, onAuthStateChange, signOut } from '../lib/supabase.js';

// ===== ESTADO GLOBAL =====
// Usamos um objeto para encapsular o estado e evitar variáveis soltas.
const authState = {
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    isInitialized: false, // Flag para controlar a inicialização
};

// ===== CONFIGURAÇÃO =====
// Páginas que NÃO precisam de autenticação.
// CORREÇÃO: Caminhos simplificados para o Vite.
const publicPages = ['/', '/index.html', '/login.html', '/register.html'];

// ===== INICIALIZAÇÃO =====
// A inicialização agora retorna uma Promise, garantindo que o fluxo espere por ela.
async function initializeAuth() {
    // Previne re-inicialização
    if (authState.isInitialized) return;

    // Ouve as mudanças de estado de autenticação (login, logout)
    onAuthStateChange((_event, session) => {
        updateAuthState(session);
    });

    // Pega a sessão inicial para verificar se o usuário já está logado
    const { data: { session } } = await supabase.auth.getSession();
    await updateAuthState(session);

    authState.isInitialized = true;
    console.log('🔐 Auth middleware inicializado. Autenticado:', authState.isAuthenticated);
}

// ===== FUNÇÃO PRINCIPAL DE CONTROLE DE ACESSO =====
// Esta função será chamada em todas as páginas.
async function protectPage() {
    // Garante que a verificação só ocorra após a inicialização do auth.
    if (!authState.isInitialized) {
        await initializeAuth();
    }

    const currentPath = window.location.pathname;
    const isPublicPage = publicPages.includes(currentPath);

    // 1. Se o usuário ESTÁ autenticado, mas está na página de login/registro, redireciona para o dashboard.
    if (authState.isAuthenticated && (currentPath === '/login.html' || currentPath === '/register.html')) {
        console.log('Usuário autenticado em página pública. Redirecionando para o dashboard...');
        window.location.replace('/index.html'); // Usar replace para não poluir o histórico
        return;
    }

    // 2. Se o usuário NÃO ESTÁ autenticado e a página NÃO é pública, redireciona para o login.
    if (!authState.isAuthenticated && !isPublicPage) {
        console.warn(`Acesso negado a '${currentPath}'. Redirecionando para o login.`);
        window.location.replace('/login.html'); // Usar replace
        return;
    }

    // 3. Se o usuário está autenticado, atualiza a UI com seus dados.
    if (authState.isAuthenticated) {
        updateAuthUI();
    }
}

// ===== GESTÃO DE ESTADO =====
// Função central para atualizar o estado de autenticação.
async function updateAuthState(session) {
    if (session?.user) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, avatar_url') // Pegue os dados que precisar
            .eq('user_id', session.user.id)
            .single();

        authState.user = session.user;
        authState.profile = profile;
        authState.session = session;
        authState.isAuthenticated = true;
    } else {
        authState.user = null;
        authState.profile = null;
        authState.session = null;
        authState.isAuthenticated = false;
    }
}

// ===== ATUALIZAÇÃO DE UI =====
// Atualiza os elementos da página com as informações do usuário.
function updateAuthUI() {
    // Garante que a UI só seja atualizada quando o DOM estiver pronto.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAuthUI);
        return;
    }

    const userNameElements = document.querySelectorAll('[data-auth="user-name"]');
    userNameElements.forEach(el => {
        el.textContent = authState.profile?.full_name || authState.user?.email || 'Visitante';
    });

    const userAvatarElements = document.querySelectorAll('[data-auth="user-avatar"]');
    userAvatarElements.forEach(el => {
        // Lógica para avatar: imagem, ou iniciais se não houver imagem.
        if (authState.profile?.avatar_url) {
            el.innerHTML = `<img src="${authState.profile.avatar_url}" alt="Avatar" class="w-full h-full rounded-full object-cover">`;
        } else {
            const initials = (authState.profile?.full_name || 'U')
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();
            el.textContent = initials;
        }
    });

    const logoutButtons = document.querySelectorAll('[data-auth="logout-btn"]');
    logoutButtons.forEach(button => {
        // Remove listener antigo para evitar duplicação
        button.replaceWith(button.cloneNode(true));
        // Adiciona o novo listener
        document.querySelector('[data-auth="logout-btn"]').addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Fazendo logout...');
            await signOut();
            window.location.replace('/login.html');
        });
    });
}

// ===== EXECUÇÃO IMEDIATA =====
// Inicia a proteção da página assim que o script é carregado.
protectPage();
