// ALSHAM 360° PRIMA - Sistema de Configurações Ultimate 10/10
// Interface premium para gestão completa de perfil, organização, equipe, notificações e integrações

import { supabase } from '../lib/supabase.js';

// ===== ESTADO GLOBAL =====
const configState = {
    user: null,
    profile: null,
    organization: null,
    team: [],
    notifications: null,
    integrations: [],
    security: null,
    billing: null,
    analytics: null,
    activeSection: 'profile',
    isLoading: false,
    isSaving: false,
    unsavedChanges: false,
    error: null
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeConfigurationsPage);

async function initializeConfigurationsPage() {
    try {
        showLoader(true, 'Carregando configurações...');
        
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/login.html';
            return;
        }
        
        configState.user = user;
        
        // Carregar todos os dados em paralelo
        await Promise.all([
            loadUserProfile(),
            loadOrganization(),
            loadTeamMembers(),
            loadNotificationSettings(),
            loadIntegrations(),
            loadSecuritySettings(),
            loadBillingInfo(),
            loadAnalyticsSettings()
        ]);
        
        setupNavigation();
        setupEventListeners();
        setupAutoSave();
        renderCurrentSection();
        
        showLoader(false);
        showToast('Configurações carregadas com sucesso!', 'success');
        console.log('⚙️ Sistema de configurações Ultimate inicializado');
        
    } catch (error) {
        console.error('Erro ao inicializar configurações:', error);
        configState.error = 'Erro ao carregar configurações';
        showLoader(false);
        loadDemoData();
    }
}

// ===== CARREGAMENTO DE DADOS REAIS =====
async function loadUserProfile() {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', configState.user.id)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error;
        
        configState.profile = data || createDefaultProfile();
        
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        configState.profile = createDefaultProfile();
    }
}

async function loadOrganization() {
    try {
        if (!configState.profile?.org_id) {
            configState.organization = createDefaultOrganization();
            return;
        }
        
        const { data, error } = await supabase
            .from('organizations')
            .select(`
                *,
                organization_settings (*)
            `)
            .eq('id', configState.profile.org_id)
            .single();
            
        if (error) throw error;
        configState.organization = data || createDefaultOrganization();
        
    } catch (error) {
        console.error('Erro ao carregar organização:', error);
        configState.organization = createDefaultOrganization();
    }
}

async function loadTeamMembers() {
    try {
        if (!configState.profile?.org_id) {
            configState.team = [];
            return;
        }
        
        const { data, error } = await supabase
            .from('user_organizations')
            .select(`
                *,
                user_profiles (
                    full_name,
                    position,
                    avatar_url,
                    last_login
                )
            `)
            .eq('org_id', configState.profile.org_id);
            
        if (error) throw error;
        configState.team = data || [];
        
    } catch (error) {
        console.error('Erro ao carregar equipe:', error);
        configState.team = createDemoTeam();
    }
}

async function loadNotificationSettings() {
    try {
        const { data, error } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', configState.user.id)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error;
        configState.notifications = data || createDefaultNotifications();
        
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        configState.notifications = createDefaultNotifications();
    }
}

async function loadIntegrations() {
    try {
        const { data, error } = await supabase
            .from('integrations')
            .select('*')
            .eq('org_id', configState.profile?.org_id);
            
        if (error) throw error;
        configState.integrations = data || [];
        
    } catch (error) {
        console.error('Erro ao carregar integrações:', error);
        configState.integrations = createDemoIntegrations();
    }
}

async function loadSecuritySettings() {
    try {
        const { data, error } = await supabase
            .from('security_settings')
            .select('*')
            .eq('user_id', configState.user.id)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error;
        configState.security = data || createDefaultSecurity();
        
    } catch (error) {
        console.error('Erro ao carregar configurações de segurança:', error);
        configState.security = createDefaultSecurity();
    }
}

async function loadBillingInfo() {
    try {
        const { data, error } = await supabase
            .from('billing_info')
            .select('*')
            .eq('org_id', configState.profile?.org_id)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error;
        configState.billing = data || createDefaultBilling();
        
    } catch (error) {
        console.error('Erro ao carregar informações de cobrança:', error);
        configState.billing = createDefaultBilling();
    }
}

async function loadAnalyticsSettings() {
    try {
        const { data, error } = await supabase
            .from('analytics_settings')
            .select('*')
            .eq('org_id', configState.profile?.org_id)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error;
        configState.analytics = data || createDefaultAnalytics();
        
    } catch (error) {
        console.error('Erro ao carregar configurações de analytics:', error);
        configState.analytics = createDefaultAnalytics();
    }
}

// ===== DADOS DEMO =====
function loadDemoData() {
    configState.profile = createDefaultProfile();
    configState.organization = createDefaultOrganization();
    configState.team = createDemoTeam();
    configState.notifications = createDefaultNotifications();
    configState.integrations = createDemoIntegrations();
    configState.security = createDefaultSecurity();
    configState.billing = createDefaultBilling();
    configState.analytics = createDefaultAnalytics();
    
    renderCurrentSection();
}

function createDefaultProfile() {
    return {
        user_id: configState.user.id,
        full_name: configState.user.user_metadata?.full_name || 'Usuário ALSHAM',
        email: configState.user.email,
        phone: '+55 11 99999-9999',
        position: 'Gerente de Vendas',
        department: 'Vendas',
        timezone: 'America/Sao_Paulo',
        locale: 'pt-BR',
        avatar_url: null,
        bio: 'Especialista em vendas com foco em resultados e crescimento sustentável.',
        linkedin_url: '',
        org_id: null,
        preferences: {
            theme: 'light',
            email_frequency: 'daily',
            dashboard_layout: 'default'
        }
    };
}

function createDefaultOrganization() {
    return {
        id: 'demo-org',
        name: 'ALSHAM GLOBAL COMMERCE LTDA',
        cnpj: '59.332.265/0001-30',
        industry: 'technology',
        size: '11-50',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        website: 'https://alshamglobal.com.br',
        description: 'Empresa líder em soluções de CRM e automação de vendas',
        logo_url: null,
        settings: {
            currency: 'BRL',
            date_format: 'dd/mm/yyyy',
            time_format: '24h',
            language: 'pt-BR',
            auto_assign_leads: true,
            lead_scoring_enabled: true
        }
    };
}

function createDemoTeam() {
    return [
        {
            user_id: '1',
            role: 'admin',
            status: 'active',
            invited_at: '2025-08-01',
            user_profiles: {
                full_name: 'Carlos Silva',
                position: 'CEO',
                avatar_url: null,
                last_login: new Date(Date.now() - 2 * 60 * 60 * 1000)
            }
        },
        {
            user_id: '2',
            role: 'manager',
            status: 'active',
            invited_at: '2025-08-15',
            user_profiles: {
                full_name: 'Ana Santos',
                position: 'Gerente de Vendas',
                avatar_url: null,
                last_login: new Date(Date.now() - 30 * 60 * 1000)
            }
        },
        {
            user_id: '3',
            role: 'user',
            status: 'active',
            invited_at: '2025-09-01',
            user_profiles: {
                full_name: 'Pedro Costa',
                position: 'Consultor de Vendas',
                avatar_url: null,
                last_login: new Date(Date.now() - 5 * 60 * 1000)
            }
        }
    ];
}

function createDefaultNotifications() {
    return {
        user_id: configState.user.id,
        email_new_leads: true,
        email_lead_assigned: true,
        email_deal_closed: true,
        email_weekly_report: true,
        email_system_updates: false,
        push_new_leads: true,
        push_reminders: true,
        push_goals_achieved: true,
        push_team_updates: false,
        sms_urgent_alerts: false,
        sms_deal_reminders: false,
        in_app_all: true,
        quiet_hours_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00'
    };
}

function createDemoIntegrations() {
    return [
        {
            id: 'whatsapp',
            name: 'WhatsApp Business',
            type: 'messaging',
            status: 'connected',
            description: 'Envio automático de mensagens via WhatsApp',
            icon: '💬',
            color: 'green',
            connected_at: '2025-08-15'
        },
        {
            id: 'gmail',
            name: 'Gmail',
            type: 'email',
            status: 'connected',
            description: 'Sincronização de emails e calendário',
            icon: '📧',
            color: 'red',
            connected_at: '2025-08-10'
        },
        {
            id: 'linkedin',
            name: 'LinkedIn Sales Navigator',
            type: 'social',
            status: 'available',
            description: 'Prospecção avançada no LinkedIn',
            icon: '💼',
            color: 'blue',
            connected_at: null
        },
        {
            id: 'zapier',
            name: 'Zapier',
            type: 'automation',
            status: 'available',
            description: 'Conecte com 5000+ aplicativos',
            icon: '⚡',
            color: 'orange',
            connected_at: null
        }
    ];
}

function createDefaultSecurity() {
    return {
        user_id: configState.user.id,
        two_factor_enabled: false,
        login_notifications: true,
        session_timeout: 480,
        password_last_changed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        trusted_devices: [],
        last_security_check: new Date()
    };
}

function createDefaultBilling() {
    return {
        org_id: configState.profile?.org_id,
        plan: 'premium',
        status: 'active',
        billing_cycle: 'monthly',
        next_billing_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        amount: 297.00,
        currency: 'BRL',
        payment_method: 'credit_card',
        card_last_four: '4532',
        usage: {
            leads_this_month: 1247,
            leads_limit: 5000,
            users_count: 3,
            users_limit: 10,
            automations_count: 5,
            automations_limit: 50
        }
    };
}

function createDefaultAnalytics() {
    return {
        org_id: configState.profile?.org_id,
        google_analytics_enabled: true,
        google_analytics_id: 'GA-XXXXXXXX',
        facebook_pixel_enabled: false,
        facebook_pixel_id: '',
        custom_tracking_enabled: true,
        data_retention_days: 365,
        anonymize_ip: true,
        cookie_consent_required: true
    };
}

// ===== NAVEGAÇÃO E UI =====
function setupNavigation() {
    const navButtons = document.querySelectorAll('[data-section]');
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const section = button.getAttribute('data-section');
            switchSection(section);
        });
    });
}

function switchSection(section) {
    configState.activeSection = section;
    updateNavigationState();
    renderCurrentSection();
    updateUrl(section);
}

function updateNavigationState() {
    const navButtons = document.querySelectorAll('[data-section]');
    navButtons.forEach(button => {
        const section = button.getAttribute('data-section');
        const isActive = section === configState.activeSection;
        
        button.classList.toggle('bg-primary', isActive);
        button.classList.toggle('text-white', isActive);
        button.classList.toggle('text-gray-600', !isActive);
        button.classList.toggle('hover:bg-gray-100', !isActive);
    });
}

function updateUrl(section) {
    const url = new URL(window.location);
    url.searchParams.set('section', section);
    window.history.replaceState({}, '', url);
}

function renderCurrentSection() {
    // Esconder todas as seções
    document.querySelectorAll('.config-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar seção ativa
    const activeSection = document.getElementById(`section-${configState.activeSection}`);
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }
    
    // Renderizar conteúdo específico da seção
    switch (configState.activeSection) {
        case 'profile':
            renderProfileSection();
            break;
        case 'organization':
            renderOrganizationSection();
            break;
        case 'team':
            renderTeamSection();
            break;
        case 'notifications':
            renderNotificationsSection();
            break;
        case 'integrations':
            renderIntegrationsSection();
            break;
        case 'security':
            renderSecuritySection();
            break;
        case 'billing':
            renderBillingSection();
            break;
        case 'analytics':
            renderAnalyticsSection();
            break;
    }
}

// ===== RENDERIZAÇÃO DAS SEÇÕES =====
function renderProfileSection() {
    populateForm('profile-form', configState.profile);
    updateAvatarDisplay();
}

function renderOrganizationSection() {
    populateForm('organization-form', configState.organization);
    if (configState.organization?.settings) {
        populateForm('org-settings-form', configState.organization.settings);
    }
}

function renderTeamSection() {
    const container = document.getElementById('team-members-list');
    if (!container) return;
    
    if (configState.team.length === 0) {
        container.innerHTML = renderEmptyTeam();
        return;
    }
    
    container.innerHTML = configState.team.map(member => renderTeamMember(member)).join('');
}

function renderTeamMember(member) {
    const profile = member.user_profiles;
    const isOnline = member.user_profiles?.last_login && 
                    (Date.now() - new Date(member.user_profiles.last_login).getTime()) < 15 * 60 * 1000;
    
    return `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span class="text-white font-semibold">
                                ${(profile?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                        </div>
                        ${isOnline ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>' : ''}
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900">${profile?.full_name || 'Usuário'}</h3>
                        <p class="text-sm text-gray-600">${profile?.position || 'Sem cargo definido'}</p>
                        <p class="text-xs text-gray-500">
                            ${isOnline ? 'Online agora' : `Último acesso: ${formatTimeAgo(member.user_profiles?.last_login)}`}
                        </p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(member.role)}">
                        ${getRoleLabel(member.role)}
                    </span>
                    <button onclick="editTeamMember('${member.user_id}')" class="text-gray-400 hover:text-gray-600">
                        <span class="text-lg">⋮</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderNotificationsSection() {
    populateNotificationSettings();
}

function renderIntegrationsSection() {
    const container = document.getElementById('integrations-list');
    if (!container) return;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${configState.integrations.map(integration => renderIntegrationCard(integration)).join('')}
        </div>
    `;
}

function renderIntegrationCard(integration) {
    return `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-${integration.color}-100 rounded-xl flex items-center justify-center">
                        <span class="text-2xl">${integration.icon}</span>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900">${integration.name}</h3>
                        <p class="text-sm text-gray-600">${integration.description}</p>
                    </div>
                </div>
                <span class="px-3 py-1 text-xs font-medium rounded-full ${getIntegrationStatusClass(integration.status)}">
                    ${getIntegrationStatusLabel(integration.status)}
                </span>
            </div>
            
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">
                    ${integration.connected_at ? `Conectado em ${formatDate(integration.connected_at)}` : 'Não conectado'}
                </span>
                <button onclick="toggleIntegration('${integration.id}')" 
                        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    integration.status === 'connected' 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-primary text-white hover:bg-primary-dark'
                }">
                    ${integration.status === 'connected' ? 'Desconectar' : 'Conectar'}
                </button>
            </div>
        </div>
    `;
}

function renderSecuritySection() {
    populateForm('security-form', configState.security);
    updateSecurityStatus();
}

function renderBillingSection() {
    populateBillingInfo();
    renderUsageStats();
}

function renderAnalyticsSection() {
    populateForm('analytics-form', configState.analytics);
}

// ===== FUNÇÕES DE FORMULÁRIO =====
function populateForm(formId, data) {
    const form = document.getElementById(formId);
    if (!form || !data) return;
    
    Object.keys(data).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = Boolean(data[key]);
            } else {
                field.value = data[key] || '';
            }
        }
    });
}

function populateNotificationSettings() {
    if (!configState.notifications) return;
    
    Object.keys(configState.notifications).forEach(key => {
        const checkbox = document.querySelector(`[data-notification="${key}"]`);
        if (checkbox) {
            checkbox.checked = Boolean(configState.notifications[key]);
        }
    });
}

function populateBillingInfo() {
    if (!configState.billing) return;
    
    const elements = {
        'billing-plan': configState.billing.plan,
        'billing-status': configState.billing.status,
        'billing-amount': formatCurrency(configState.billing.amount),
        'billing-next-date': formatDate(configState.billing.next_billing_date),
        'billing-payment-method': `•••• •••• •••• ${configState.billing.card_last_four}`
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
}

function renderUsageStats() {
    if (!configState.billing?.usage) return;
    
    const usage = configState.billing.usage;
    const stats = [
        {
            label: 'Leads este mês',
            current: usage.leads_this_month,
            limit: usage.leads_limit,
            icon: '👥'
        },
        {
            label: 'Usuários',
            current: usage.users_count,
            limit: usage.users_limit,
            icon: '👤'
        },
        {
            label: 'Automações',
            current: usage.automations_count,
            limit: usage.automations_limit,
            icon: '🤖'
        }
    ];
    
    const container = document.getElementById('usage-stats');
    if (!container) return;
    
    container.innerHTML = stats.map(stat => {
        const percentage = (stat.current / stat.limit) * 100;
        return `
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">${stat.icon} ${stat.label}</span>
                    <span class="text-sm text-gray-600">${stat.current}/${stat.limit}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-primary h-2 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== SALVAMENTO =====
function setupEventListeners() {
    // Auto-save on form changes
    document.addEventListener('input', (e) => {
        if (e.target.closest('form')) {
            configState.unsavedChanges = true;
            debounce(autoSave, 2000)();
        }
    });
    
    // Save buttons
    document.querySelectorAll('[data-save]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const section = button.getAttribute('data-save');
            saveSection(section);
        });
    });
    
    // Save all button
    const saveAllButton = document.querySelector('[data-save-all]');
    if (saveAllButton) {
        saveAllButton.addEventListener('click', saveAllSettings);
    }
}

function setupAutoSave() {
    // Warn before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (configState.unsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

async function saveSection(section) {
    try {
        showSaveLoader(true);
        
        switch (section) {
            case 'profile':
                await saveProfile();
                break;
            case 'organization':
                await saveOrganization();
                break;
            case 'notifications':
                await saveNotifications();
                break;
            case 'security':
                await saveSecurity();
                break;
            case 'analytics':
                await saveAnalytics();
                break;
        }
        
        configState.unsavedChanges = false;
        showToast(`${getSectionTitle(section)} salvo com sucesso!`, 'success');
        
    } catch (error) {
        console.error(`Erro ao salvar ${section}:`, error);
        showToast(`Erro ao salvar ${getSectionTitle(section)}`, 'error');
    } finally {
        showSaveLoader(false);
    }
}

async function saveAllSettings() {
    try {
        showSaveLoader(true, 'Salvando todas as configurações...');
        
        await Promise.all([
            saveProfile(),
            saveOrganization(),
            saveNotifications(),
            saveSecurity(),
            saveAnalytics()
        ]);
        
        configState.unsavedChanges = false;
        showToast('Todas as configurações foram salvas com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showToast('Erro ao salvar configurações', 'error');
    } finally {
        showSaveLoader(false);
    }
}

async function saveProfile() {
    const formData = getFormData('profile-form');
    const profileData = {
        ...configState.profile,
        ...formData,
        updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });
        
    if (error) throw error;
    configState.profile = profileData;
}

async function saveOrganization() {
    const formData = getFormData('organization-form');
    const settingsData = getFormData('org-settings-form');
    
    const orgData = {
        ...configState.organization,
        ...formData,
        settings: { ...configState.organization?.settings, ...settingsData },
        updated_at: new Date().toISOString()
    };
    
    if (configState.organization?.id) {
        const { error } = await supabase
            .from('organizations')
            .update(orgData)
            .eq('id', configState.organization.id);
            
        if (error) throw error;
    }
    
    configState.organization = orgData;
}

async function saveNotifications() {
    const notificationData = {
        user_id: configState.user.id,
        ...getNotificationSettings(),
        updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
        .from('notification_settings')
        .upsert(notificationData, { onConflict: 'user_id' });
        
    if (error) throw error;
    configState.notifications = notificationData;
}

async function saveSecurity() {
    const formData = getFormData('security-form');
    const securityData = {
        ...configState.security,
        ...formData,
        updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
        .from('security_settings')
        .upsert(securityData, { onConflict: 'user_id' });
        
    if (error) throw error;
    configState.security = securityData;
}

async function saveAnalytics() {
    const formData = getFormData('analytics-form');
    const analyticsData = {
        ...configState.analytics,
        ...formData,
        updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
        .from('analytics_settings')
        .upsert(analyticsData, { onConflict: 'org_id' });
        
    if (error) throw error;
    configState.analytics = analyticsData;
}

// ===== AÇÕES GLOBAIS =====
window.editTeamMember = function(userId) {
    const member = configState.team.find(m => m.user_id === userId);
    if (member) {
        showToast(`Editando ${member.user_profiles?.full_name}`, 'info');
    }
};

window.inviteTeamMember = function() {
    showToast('Modal de convite em desenvolvimento', 'info');
};

window.toggleIntegration = function(integrationId) {
    const integration = configState.integrations.find(i => i.id === integrationId);
    if (integration) {
        integration.status = integration.status === 'connected' ? 'available' : 'connected';
        integration.connected_at = integration.status === 'connected' ? new Date().toISOString() : null;
        renderIntegrationsSection();
        showToast(`${integration.name} ${integration.status === 'connected' ? 'conectado' : 'desconectado'}!`, 'success');
    }
};

window.changePassword = function() {
    showToast('Modal de alteração de senha em desenvolvimento', 'info');
};

window.enable2FA = function() {
    showToast('Configuração de 2FA em desenvolvimento', 'info');
};

window.upgradePlan = function() {
    showToast('Modal de upgrade em desenvolvimento', 'info');
};

window.downloadInvoice = function() {
    showToast('Download da fatura em desenvolvimento', 'info');
};

// ===== FUNÇÕES AUXILIARES =====
function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        const field = form.querySelector(`[name="${key}"]`);
        if (field?.type === 'checkbox') {
            data[key] = field.checked;
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

function getNotificationSettings() {
    const settings = {};
    document.querySelectorAll('[data-notification]').forEach(checkbox => {
        const key = checkbox.getAttribute('data-notification');
        settings[key] = checkbox.checked;
    });
    return settings;
}

function getRoleBadgeClass(role) {
    const classes = {
        admin: 'bg-purple-100 text-purple-800',
        manager: 'bg-blue-100 text-blue-800',
        user: 'bg-gray-100 text-gray-800'
    };
    return classes[role] || classes.user;
}

function getRoleLabel(role) {
    const labels = {
        admin: 'Administrador',
        manager: 'Gerente',
        user: 'Usuário'
    };
    return labels[role] || 'Usuário';
}

function getIntegrationStatusClass(status) {
    const classes = {
        connected: 'bg-green-100 text-green-800',
        available: 'bg-gray-100 text-gray-800',
        error: 'bg-red-100 text-red-800'
    };
    return classes[status] || classes.available;
}

function getIntegrationStatusLabel(status) {
    const labels = {
        connected: 'Conectado',
        available: 'Disponível',
        error: 'Erro'
    };
    return labels[status] || 'Disponível';
}

function getSectionTitle(section) {
    const titles = {
        profile: 'Perfil',
        organization: 'Organização',
        team: 'Equipe',
        notifications: 'Notificações',
        integrations: 'Integrações',
        security: 'Segurança',
        billing: 'Cobrança',
        analytics: 'Analytics'
    };
    return titles[section] || section;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}

function formatTimeAgo(date) {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function autoSave() {
    if (configState.unsavedChanges && !configState.isSaving) {
        saveSection(configState.activeSection);
    }
}

// ===== FUNÇÕES DE UI =====
function showLoader(show, message = 'Carregando...') {
    let loader = document.getElementById('config-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'config-loader';
        loader.className = 'fixed inset-0 bg-white/90 z-50 flex items-center justify-center backdrop-blur-sm';
        loader.innerHTML = `
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-b-4 border-gray-100 mx-auto mb-4"></div>
                <p class="text-gray-600 font-medium" id="loader-message">${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }
    
    const messageEl = loader.querySelector('#loader-message');
    if (messageEl) messageEl.textContent = message;
    
    loader.style.display = show ? 'flex' : 'none';
}

function showSaveLoader(show, message = 'Salvando...') {
    configState.isSaving = show;
    if (show) {
        showLoader(true, message);
    } else {
        showLoader(false);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-0`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateAvatarDisplay() {
    const avatarContainer = document.getElementById('profile-avatar');
    if (!avatarContainer) return;
    
    const initials = (configState.profile?.full_name || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    
    avatarContainer.innerHTML = `
        <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span class="text-white text-2xl font-bold">${initials}</span>
        </div>
    `;
}

function updateSecurityStatus() {
    const statusContainer = document.getElementById('security-status');
    if (!statusContainer) return;
    
    const score = calculateSecurityScore();
    const level = getSecurityLevel(score);
    
    statusContainer.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full ${level.color}"></div>
            <span class="font-medium ${level.textColor}">${level.label}</span>
            <span class="text-sm text-gray-600">(${score}/100)</span>
        </div>
    `;
}

function calculateSecurityScore() {
    let score = 0;
    
    if (configState.security?.two_factor_enabled) score += 40;
    if (configState.security?.login_notifications) score += 20;
    if (configState.security?.session_timeout && configState.security.session_timeout <= 480) score += 20;
    
    const passwordAge = Date.now() - new Date(configState.security?.password_last_changed || 0).getTime();
    const passwordAgeDays = passwordAge / (1000 * 60 * 60 * 24);
    if (passwordAgeDays <= 90) score += 20;
    
    return score;
}

function getSecurityLevel(score) {
    if (score >= 80) return { label: 'Excelente', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score >= 60) return { label: 'Boa', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (score >= 40) return { label: 'Regular', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { label: 'Fraca', color: 'bg-red-500', textColor: 'text-red-700' };
}

function renderEmptyTeam() {
    return `
        <div class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">👥</span>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum membro na equipe</h3>
            <p class="text-gray-600 mb-6">Convide membros para colaborar no seu workspace</p>
            <button onclick="inviteTeamMember()" class="btn-primary">
                Convidar Primeiro Membro
            </button>
        </div>
    `;
}

// ===== EXPORTS =====
export {
    configState,
    switchSection,
    saveSection,
    saveAllSettings
};
