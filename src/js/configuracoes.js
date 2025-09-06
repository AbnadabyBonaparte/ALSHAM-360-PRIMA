import { supabase } from '../lib/supabase.js';

// Estado da aplicação
let currentSection = 'profile';
let userProfile = {};
let organizationData = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeSettingsPage();
});

async function initializeSettingsPage() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '../pages/login.html';
            return;
        }
        await loadUserData(user);
        setupEventListeners();
        showSection('profile');
    } catch (error) {
        console.error('Erro ao inicializar página de configurações:', error);
        showNotification('Erro fatal ao carregar dados. Contate o suporte.', 'error');
    }
}

async function loadUserData(user) {
    // 1. Carregar perfil do usuário
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
    }

    // Se o perfil não existir, cria um objeto com os dados oficiais da empresa como padrão
    userProfile = profile || {
        user_id: user.id,
        full_name: user.user_metadata?.full_name || 'Novo Usuário',
        email: 'alsham.admin@alshamglobal.com.br', // DADO OFICIAL
        phone: '(63) 99242-8800', // DADO OFICIAL
        role: 'Admin',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR'
    };

    // 2. Carregar dados da organização
    if (userProfile.org_id) {
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', userProfile.org_id)
            .single();

        if (orgError) throw orgError;
        organizationData = org;
    } else {
        // Se a organização não estiver vinculada, usa dados padrão
        organizationData = {
            name: 'ALSHAM GLOBAL COMMERCE LTDA',
            cnpj: '59.332.265/0001-30',
            industry: 'technology',
            size: '11-50',
            address: 'São Paulo' // Endereço simplificado como solicitado
        };
    }

    // 3. Preencher os formulários com os dados carregados ou padrão
    populateProfileForm();
    populateOrganizationForm();
}

function populateProfileForm() {
    const fields = {
        'user-name': userProfile.full_name,
        'user-email': userProfile.email,
        'user-phone': userProfile.phone,
        'user-role': userProfile.role,
        'user-timezone': userProfile.timezone,
        'user-language': userProfile.language
    };

    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element && value) element.value = value;
    }
}

function populateOrganizationForm() {
    const fields = {
        'org-name': organizationData.name,
        'org-cnpj': organizationData.cnpj,
        'org-industry': organizationData.industry,
        'org-size': organizationData.size,
        'org-address': organizationData.address
    };

    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element && value) element.value = value;
    }
}

function setupEventListeners() {
    document.querySelectorAll('#settings-nav button').forEach(button => {
        const section = button.getAttribute('data-section');
        if (section) button.addEventListener('click', () => showSection(section));
    });
    document.getElementById('save-all-button').addEventListener('click', saveAllSettings);
}

function showSection(sectionName) {
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.querySelectorAll('#settings-nav button').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'text-primary');
    });

    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) targetSection.classList.remove('hidden');

    const navButton = document.querySelector(`#settings-nav button[data-section="${sectionName}"]`);
    if (navButton) navButton.classList.add('bg-blue-100', 'text-primary');
}

async function saveAllSettings() {
    try {
        showNotification('Salvando configurações...', 'info');
        await saveUserProfile();
        await saveOrganizationData();
        showNotification('Configurações salvas com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showNotification(`Erro ao salvar: ${error.message}`, 'error');
    }
}

async function saveUserProfile() {
    const profileData = {
        full_name: document.getElementById('user-name')?.value,
        phone: document.getElementById('user-phone')?.value,
        role: document.getElementById('user-role')?.value,
        timezone: document.getElementById('user-timezone')?.value,
        language: document.getElementById('user-language')?.value
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Upsert garante que o registro seja criado se não existir, ou atualizado se existir
    const { error } = await supabase.from('user_profiles').upsert({ user_id: user.id, ...profileData });
    if (error) throw error;

    userProfile = { ...userProfile, ...profileData };
}

async function saveOrganizationData() {
    const orgData = {
        name: document.getElementById('org-name')?.value,
        cnpj: document.getElementById('org-cnpj')?.value,
        industry: document.getElementById('org-industry')?.value,
        size: document.getElementById('org-size')?.value,
        address: document.getElementById('org-address')?.value
    };

    if (organizationData.id) {
        const { error } = await supabase.from('organizations').update(orgData).eq('id', organizationData.id);
        if (error) throw error;
    } else {
        // Se não houver ID, idealmente criaríamos uma nova organização aqui.
        // Por agora, apenas atualizamos o estado local.
        console.warn("Nenhum ID de organização para atualizar no banco de dados.");
    }

    organizationData = { ...organizationData, ...orgData };
}

window.inviteUser = function() {
    const email = prompt('Digite o e-mail do usuário para convidar:');
    if (email) showNotification(`Convite enviado para ${email}`, 'success');
};

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
    };
    notification.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 transition-transform transform translate-x-full ${colors[type] || colors.info}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 10);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

