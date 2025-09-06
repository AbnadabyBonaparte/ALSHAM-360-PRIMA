import { 
    getCurrentUser, 
    // getCurrentSession, -> REMOVIDO: Esta função não existe no nosso supabase.js
    // onAuthStateChange, -> REMOVIDO: A verificação será mais simples
    signOut
} from '../lib/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
    setupEventListeners();
});

async function updateUserUI() {
    const { user, profile } = await getCurrentUser();

    const userNameElements = document.querySelectorAll('[data-auth="user-name"]');
    const userAvatarElements = document.querySelectorAll('[data-auth="user-avatar"]');

    if (user) {
        const name = profile?.full_name || user.email;
        const initials = (profile?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        userNameElements.forEach(el => el.textContent = name);
        userAvatarElements.forEach(el => el.textContent = initials);
    } else {
        userNameElements.forEach(el => el.textContent = 'Visitante');
        userAvatarElements.forEach(el => el.textContent = 'V');
    }
}

function setupEventListeners() {
    const logoutButtons = document.querySelectorAll('[data-auth="logout-btn"]');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut();
                window.location.href = '/src/pages/login.html'; // Redireciona para o login após o logout
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
            }
        });
    });
}
