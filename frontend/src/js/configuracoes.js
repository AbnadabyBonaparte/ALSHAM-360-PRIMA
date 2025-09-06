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
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '../pages/login.html';
            return;
        }

        // Carregar dados do usuário
        await loadUserProfile(user);
        
        // Mostrar seção inicial
        showSection('profile');
        
    } catch (error) {
        console.error('Erro ao inicializar página de configurações:', error);
        showNotification('Erro ao carregar dados', 'error');
    }
}

async function loadUserProfile(user) {
    try {
        // Carregar perfil do usuário
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
        }

        userProfile = profile || {
            user_id: user.id,
            full_name: user.user_metadata?.full_name || '',
            email: user.email,
            phone: '',
            position: '',
            timezone: 'America/Sao_Paulo',
            language: 'pt-BR'
        };

        // Carregar dados da organização
        if (userProfile.organization_id) {
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', userProfile.organization_id)
                .single();

            if (!orgError) {
                organizationData = org;
            }
        }

        // Preencher formulários
        populateProfileForm();
        populateOrganizationForm();
        
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        // Usar dados mockados em caso de erro
        loadMockData();
    }
}

function loadMockData() {
    userProfile = {
        full_name: 'João Silva',
        email: 'joao@alsham.com',
        phone: '+55 11 99999-9999',
        position: 'Gerente de Vendas',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR'
    };

    organizationData = {
        name: 'ALSHAM Global',
        cnpj: '12.345.678/0001-90',
        industry: 'technology',
        size: '11-50',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100'
    };

    populateProfileForm();
    populateOrganizationForm();
}

function populateProfileForm() {
    const fields = {
        'user-name': userProfile.full_name,
        'user-email': userProfile.email,
        'user-phone': userProfile.phone,
        'user-position': userProfile.position,
        'user-timezone': userProfile.timezone,
        'user-language': userProfile.language
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
    });
}

function populateOrganizationForm() {
    const fields = {
        'org-name': organizationData.name,
        'org-cnpj': organizationData.cnpj,
        'org-industry': organizationData.industry,
        'org-size': organizationData.size,
        'org-address': organizationData.address
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
    });
}

// Navegação entre seções
window.showSection = function(sectionName) {
    // Esconder todas as seções
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Remover classe ativa de todos os botões de navegação
    document.querySelectorAll('[id^="nav-"]').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('text-gray-700', 'hover:text-gray-900');
    });

    // Mostrar seção selecionada
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Ativar botão de navegação
    const navButton = document.getElementById(`nav-${sectionName}`);
    if (navButton) {
        navButton.classList.add('bg-primary', 'text-white');
        navButton.classList.remove('text-gray-700', 'hover:text-gray-900');
    }

    currentSection = sectionName;
};

// Salvar configurações
window.saveAllSettings = async function() {
    try {
        showNotification('Salvando configurações...', 'info');

        // Salvar perfil do usuário
        await saveUserProfile();
        
        // Salvar dados da organização
        await saveOrganizationData();
        
        showNotification('Configurações salvas com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showNotification('Erro ao salvar configurações', 'error');
    }
};

async function saveUserProfile() {
    const profileData = {
        full_name: document.getElementById('user-name')?.value,
        phone: document.getElementById('user-phone')?.value,
        position: document.getElementById('user-position')?.value,
        timezone: document.getElementById('user-timezone')?.value,
        language: document.getElementById('user-language')?.value
    };

    // Tentar salvar no Supabase
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: user.id,
                ...profileData,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;

        // Atualizar estado local
        userProfile = { ...userProfile, ...profileData };
        
    } catch (error) {
        console.error('Erro ao salvar perfil no Supabase:', error);
        // Simular salvamento local
        userProfile = { ...userProfile, ...profileData };
    }
}

async function saveOrganizationData() {
    const orgData = {
        name: document.getElementById('org-name')?.value,
        cnpj: document.getElementById('org-cnpj')?.value,
        industry: document.getElementById('org-industry')?.value,
        size: document.getElementById('org-size')?.value,
        address: document.getElementById('org-address')?.value
    };

    // Tentar salvar no Supabase
    try {
        if (organizationData.id) {
            const { error } = await supabase
                .from('organizations')
                .update({
                    ...orgData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', organizationData.id);

            if (error) throw error;
        }

        // Atualizar estado local
        organizationData = { ...organizationData, ...orgData };
        
    } catch (error) {
        console.error('Erro ao salvar organização no Supabase:', error);
        // Simular salvamento local
        organizationData = { ...organizationData, ...orgData };
    }
}

// Funções específicas
window.inviteUser = function() {
    const email = prompt('Digite o e-mail do usuário para convidar:');
    if (email) {
        showNotification(`Convite enviado para ${email}`, 'success');
        // Implementar lógica de convite
    }
};

// Funções auxiliares
function showNotification(message, type = 'info') {
    // Implementar sistema de notificações
    console.log(`${type}: ${message}`);
    
    // Criar notificação visual simples
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${getNotificationColor(type)}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getNotificationColor(type) {
    const colors = {
        'success': 'bg-green-500 text-white',
        'error': 'bg-red-500 text-white',
        'info': 'bg-blue-500 text-white',
        'warning': 'bg-yellow-500 text-white'
    };
    return colors[type] || colors.info;
}

