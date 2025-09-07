// ALSHAM 360° PRIMA - Automações CRM
// Sistema completo de automações de marketing e vendas

import { supabase } from '../lib/supabase.js';

// ===== ESTADO DAS AUTOMAÇÕES =====
const automationState = {
    user: null,
    orgId: null,
    automations: [],
    templates: [],
    activeFilters: {
        status: 'all',
        type: 'all'
    },
    selectedAutomation: null,
    isLoading: true,
    error: null
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeAutomations);

async function initializeAutomations() {
    try {
        showLoader(true);
        
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/login.html';
            return;
        }
        
        automationState.user = user;
        
        // Buscar perfil do usuário
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('org_id')
            .eq('user_id', user.id)
            .single();
            
        automationState.orgId = profile?.org_id;
        
        // Carregar dados
        await Promise.all([
            loadAutomations(),
            loadTemplates()
        ]);
        
        automationState.isLoading = false;
        render();
        setupEventListeners();
        showLoader(false);
        
        console.log('🤖 Sistema de automações inicializado');
        
    } catch (error) {
        console.error('Erro ao inicializar automações:', error);
        automationState.error = 'Erro ao carregar automações';
        automationState.isLoading = false;
        showLoader(false);
        loadDemoData();
    }
}

// ===== CARREGAMENTO DE DADOS =====
async function loadAutomations() {
    try {
        const { data, error } = await supabase
            .from('automations')
            .select(`
                *,
                automation_steps (
                    id,
                    step_type,
                    step_order,
                    config
                )
            `)
            .eq('org_id', automationState.orgId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        automationState.automations = data || [];
        
    } catch (error) {
        console.error('Erro ao carregar automações:', error);
        throw error;
    }
}

async function loadTemplates() {
    try {
        const { data, error } = await supabase
            .from('automation_templates')
            .select('*')
            .order('name');
            
        if (error) throw error;
        automationState.templates = data || [];
        
    } catch (error) {
        console.error('Erro ao carregar templates:', error);
        // Não quebra o fluxo se templates falharem
    }
}

// ===== DADOS DEMO (FALLBACK) =====
function loadDemoData() {
    automationState.automations = [
        {
            id: '1',
            name: 'Sequência de Boas-vindas',
            description: 'Email automático para novos leads',
            type: 'email',
            status: 'active',
            trigger_type: 'lead_created',
            leads_processed: 145,
            conversion_rate: 23.5,
            created_at: '2025-09-01',
            automation_steps: [
                { id: '1', step_type: 'wait', step_order: 1, config: { delay: 1, unit: 'hours' } },
                { id: '2', step_type: 'email', step_order: 2, config: { template_id: 'welcome_1' } },
                { id: '3', step_type: 'wait', step_order: 3, config: { delay: 3, unit: 'days' } },
                { id: '4', step_type: 'email', step_order: 4, config: { template_id: 'followup_1' } }
            ]
        },
        {
            id: '2',
            name: 'Follow-up WhatsApp',
            description: 'Mensagem automática após 7 dias sem contato',
            type: 'whatsapp',
            status: 'active',
            trigger_type: 'no_contact_7_days',
            leads_processed: 89,
            conversion_rate: 18.2,
            created_at: '2025-08-15',
            automation_steps: [
                { id: '5', step_type: 'whatsapp', step_order: 1, config: { message: 'Olá! Como está o seu projeto?' } }
            ]
        },
        {
            id: '3',
            name: 'Nutrição de Leads',
            description: 'Sequência educativa semanal',
            type: 'email',
            status: 'paused',
            trigger_type: 'lead_qualified',
            leads_processed: 267,
            conversion_rate: 31.8,
            created_at: '2025-07-20',
            automation_steps: [
                { id: '6', step_type: 'email', step_order: 1, config: { template_id: 'education_1' } },
                { id: '7', step_type: 'wait', step_order: 2, config: { delay: 7, unit: 'days' } },
                { id: '8', step_type: 'email', step_order: 3, config: { template_id: 'education_2' } }
            ]
        }
    ];
    
    automationState.templates = [
        { id: 'welcome_1', name: 'Boas-vindas Padrão', type: 'email' },
        { id: 'followup_1', name: 'Follow-up Inicial', type: 'email' },
        { id: 'education_1', name: 'Conteúdo Educativo 1', type: 'email' }
    ];
    
    render();
}

// ===== RENDERIZAÇÃO =====
function render() {
    renderStats();
    renderAutomationsList();
    renderFilters();
}

function renderStats() {
    const stats = calculateStats();
    const statsContainer = document.getElementById('automation-stats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Total de Automações</p>
                        <p class="text-2xl font-bold text-gray-900">${stats.total}</p>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span class="text-2xl">🤖</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Ativas</p>
                        <p class="text-2xl font-bold text-green-600">${stats.active}</p>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <span class="text-2xl">✅</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Leads Processados</p>
                        <p class="text-2xl font-bold text-blue-600">${stats.leadsProcessed}</p>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span class="text-2xl">👥</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Taxa de Conversão</p>
                        <p class="text-2xl font-bold text-purple-600">${stats.avgConversion}%</p>
                    </div>
                    <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <span class="text-2xl">📈</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAutomationsList() {
    const container = document.getElementById('automations-list');
    if (!container) return;
    
    const filteredAutomations = getFilteredAutomations();
    
    if (filteredAutomations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl">🤖</span>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma automação encontrada</h3>
                <p class="text-gray-600 mb-6">Crie sua primeira automação para começar</p>
                <button onclick="openCreateModal()" class="btn-primary">
                    Criar Primeira Automação
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            ${filteredAutomations.map(automation => `
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-${getTypeColor(automation.type)}-100 rounded-lg flex items-center justify-center">
                                <span class="text-lg">${getTypeIcon(automation.type)}</span>
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-900">${automation.name}</h3>
                                <p class="text-sm text-gray-600">${automation.description}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(automation.status)}">
                                ${automation.status === 'active' ? 'Ativa' : automation.status === 'paused' ? 'Pausada' : 'Inativa'}
                            </span>
                            <button onclick="toggleAutomationMenu('${automation.id}')" class="text-gray-400 hover:text-gray-600">
                                <span class="text-lg">⋮</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p class="text-xs text-gray-500">Leads Processados</p>
                            <p class="text-lg font-semibold text-gray-900">${automation.leads_processed || 0}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Taxa de Conversão</p>
                            <p class="text-lg font-semibold text-green-600">${(automation.conversion_rate || 0).toFixed(1)}%</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500">
                            ${automation.automation_steps?.length || 0} etapas
                        </span>
                        <div class="flex space-x-2">
                            <button onclick="viewAutomation('${automation.id}')" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors">
                                Ver
                            </button>
                            <button onclick="editAutomation('${automation.id}')" class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition-colors">
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderFilters() {
    const container = document.getElementById('automation-filters');
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex flex-wrap gap-4 mb-6">
            <select id="status-filter" class="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="paused">Pausadas</option>
                <option value="inactive">Inativas</option>
            </select>
            
            <select id="type-filter" class="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="all">Todos os Tipos</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
            </select>
            
            <button onclick="openCreateModal()" class="btn-primary ml-auto">
                <span class="mr-2">+</span>
                Nova Automação
            </button>
        </div>
    `;
}

// ===== FUNÇÕES AUXILIARES =====
function calculateStats() {
    const total = automationState.automations.length;
    const active = automationState.automations.filter(a => a.status === 'active').length;
    const leadsProcessed = automationState.automations.reduce((sum, a) => sum + (a.leads_processed || 0), 0);
    const avgConversion = total > 0 
        ? (automationState.automations.reduce((sum, a) => sum + (a.conversion_rate || 0), 0) / total).toFixed(1)
        : 0;
    
    return { total, active, leadsProcessed, avgConversion };
}

function getFilteredAutomations() {
    return automationState.automations.filter(automation => {
        const statusMatch = automationState.activeFilters.status === 'all' || 
                           automation.status === automationState.activeFilters.status;
        const typeMatch = automationState.activeFilters.type === 'all' || 
                         automation.type === automationState.activeFilters.type;
        return statusMatch && typeMatch;
    });
}

function getTypeIcon(type) {
    const icons = {
        email: '📧',
        whatsapp: '💬',
        sms: '📱',
        webhook: '🔗'
    };
    return icons[type] || '🤖';
}

function getTypeColor(type) {
    const colors = {
        email: 'blue',
        whatsapp: 'green',
        sms: 'purple',
        webhook: 'orange'
    };
    return colors[type] || 'gray';
}

function getStatusBadgeClass(status) {
    const classes = {
        active: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Filtros
    const statusFilter = document.getElementById('status-filter');
    const typeFilter = document.getElementById('type-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            automationState.activeFilters.status = e.target.value;
            renderAutomationsList();
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            automationState.activeFilters.type = e.target.value;
            renderAutomationsList();
        });
    }
}

// ===== AÇÕES DAS AUTOMAÇÕES =====
window.viewAutomation = function(id) {
    const automation = automationState.automations.find(a => a.id === id);
    if (!automation) return;
    
    showToast(`Visualizando ${automation.name}`);
    // Implementar modal de visualização
};

window.editAutomation = function(id) {
    const automation = automationState.automations.find(a => a.id === id);
    if (!automation) return;
    
    showToast(`Editando ${automation.name}`);
    // Implementar modal de edição
};

window.openCreateModal = function() {
    showToast('Modal de criação em desenvolvimento');
    // Implementar modal de criação
};

window.toggleAutomationMenu = function(id) {
    showToast('Menu de ações em desenvolvimento');
    // Implementar menu de contexto
};

// ===== FUNÇÕES DE UTILIDADE =====
function showLoader(show) {
    let loader = document.getElementById('automation-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'automation-loader';
        loader.className = 'fixed inset-0 bg-white/80 z-50 flex items-center justify-center';
        loader.innerHTML = '<div class="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-b-4 border-gray-100"></div>';
        document.body.appendChild(loader);
    }
    loader.style.display = show ? 'flex' : 'none';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== EXPORTS =====
export {
    automationState,
    loadAutomations,
    loadTemplates
};
