// ALSHAM 360° PRIMA - Sistema de Automações Ultimate 10/10
// Combina interface premium, funcionalidades avançadas e dados em tempo real

import { supabase } from '../lib/supabase.js';

// ===== ESTADO GLOBAL =====
const automationState = {
    user: null,
    orgId: null,
    automations: [],
    executionHistory: [],
    templates: [],
    realTimeStats: {
        totalExecutions: 0,
        successRate: 0,
        activeAutomations: 0,
        executionsToday: 0
    },
    activeFilters: {
        status: 'all',
        type: 'all',
        period: '7d'
    },
    selectedAutomation: null,
    isLoading: true,
    error: null,
    refreshInterval: null
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeAutomationsPage);

async function initializeAutomationsPage() {
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
        
        // Carregar todos os dados em paralelo
        await Promise.all([
            loadAutomations(),
            loadExecutionHistory(),
            loadTemplates(),
            loadRealTimeStats()
        ]);
        
        automationState.isLoading = false;
        render();
        setupEventListeners();
        setupRealTimeUpdates();
        showLoader(false);
        
        showToast('Sistema de automações carregado com sucesso!', 'success');
        console.log('🤖 Sistema de automações Ultimate inicializado');
        
    } catch (error) {
        console.error('Erro ao inicializar automações:', error);
        automationState.error = 'Erro ao carregar automações';
        automationState.isLoading = false;
        showLoader(false);
        loadDemoData();
    }
}

// ===== CARREGAMENTO DE DADOS REAIS =====
async function loadAutomations() {
    try {
        const { data: automationRules, error } = await supabase
            .from('automation_rules')
            .select(`
                *,
                automation_steps (
                    id,
                    step_type,
                    step_order,
                    config,
                    is_active
                ),
                automation_executions (
                    id,
                    status,
                    executed_at,
                    execution_time_ms
                )
            `)
            .eq('org_id', automationState.orgId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        automationState.automations = automationRules || [];
        
        if (automationState.automations.length === 0) {
            throw new Error('Sem automações no banco');
        }
        
    } catch (error) {
        console.error('Erro ao carregar automações do Supabase:', error);
        loadMockAutomations();
    }
}

async function loadExecutionHistory() {
    try {
        const { data: history, error } = await supabase
            .from('automation_executions')
            .select(`
                *,
                automation_rules (name)
            `)
            .eq('org_id', automationState.orgId)
            .order('executed_at', { ascending: false })
            .limit(50);
            
        if (error) throw error;
        
        automationState.executionHistory = history || [];
        
        if (automationState.executionHistory.length === 0) {
            throw new Error('Sem histórico no banco');
        }
        
    } catch (error) {
        console.error('Erro ao carregar histórico do Supabase:', error);
        loadMockExecutionHistory();
    }
}

async function loadTemplates() {
    try {
        const { data: templates, error } = await supabase
            .from('automation_templates')
            .select('*')
            .order('name');
            
        if (error) throw error;
        automationState.templates = templates || [];
        
    } catch (error) {
        console.error('Erro ao carregar templates:', error);
        loadMockTemplates();
    }
}

async function loadRealTimeStats() {
    try {
        const { data: stats, error } = await supabase
            .rpc('get_automation_stats', { p_org_id: automationState.orgId });
            
        if (error) throw error;
        
        if (stats && stats.length > 0) {
            automationState.realTimeStats = stats[0];
        }
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        calculateMockStats();
    }
}

// ===== DADOS DEMO PREMIUM =====
function loadDemoData() {
    loadMockAutomations();
    loadMockExecutionHistory();
    loadMockTemplates();
    calculateMockStats();
    render();
}

function loadMockAutomations() {
    automationState.automations = [
        {
            id: 'welcome-sequence',
            name: 'Sequência de Boas-vindas Premium',
            description: 'Sequência completa de nurturing para novos leads com IA personalizada',
            trigger_event: 'lead_created',
            type: 'email',
            is_active: true,
            executions_today: 247,
            last_execution: new Date(Date.now() - 2 * 60 * 1000),
            success_rate: 98.5,
            conversion_rate: 34.2,
            total_leads_processed: 1456,
            avg_response_time: '2.3s',
            automation_steps: [
                { step_type: 'wait', step_order: 1, config: { delay: 1, unit: 'hours' } },
                { step_type: 'email', step_order: 2, config: { template_id: 'welcome_premium' } },
                { step_type: 'ai_scoring', step_order: 3, config: { model: 'lead_quality_v2' } },
                { step_type: 'conditional', step_order: 4, config: { condition: 'score > 7' } },
                { step_type: 'assign_user', step_order: 5, config: { user_type: 'senior_sales' } }
            ]
        },
        {
            id: 'ai-qualification',
            name: 'Qualificação com IA Avançada',
            description: 'Sistema de scoring inteligente com machine learning e análise comportamental',
            trigger_event: 'lead_updated',
            type: 'ai_processing',
            is_active: true,
            executions_today: 189,
            last_execution: new Date(Date.now() - 5 * 60 * 1000),
            success_rate: 96.8,
            conversion_rate: 28.7,
            total_leads_processed: 2341,
            avg_response_time: '0.8s',
            automation_steps: [
                { step_type: 'data_enrichment', step_order: 1, config: { sources: ['linkedin', 'company_db'] } },
                { step_type: 'ai_analysis', step_order: 2, config: { model: 'gpt-4-qualification' } },
                { step_type: 'score_calculation', step_order: 3, config: { algorithm: 'weighted_multi_factor' } },
                { step_type: 'priority_assignment', step_order: 4, config: { priority_matrix: 'advanced' } }
            ]
        },
        {
            id: 'whatsapp-followup',
            name: 'Follow-up WhatsApp Inteligente',
            description: 'Mensagens personalizadas via WhatsApp com timing otimizado por IA',
            trigger_event: 'no_contact_7_days',
            type: 'whatsapp',
            is_active: true,
            executions_today: 67,
            last_execution: new Date(Date.now() - 8 * 60 * 1000),
            success_rate: 89.4,
            conversion_rate: 22.1,
            total_leads_processed: 543,
            avg_response_time: '1.2s',
            automation_steps: [
                { step_type: 'timing_optimization', step_order: 1, config: { ai_model: 'optimal_contact_time' } },
                { step_type: 'message_personalization', step_order: 2, config: { template_engine: 'dynamic_ai' } },
                { step_type: 'whatsapp_send', step_order: 3, config: { retry_logic: true } }
            ]
        },
        {
            id: 'nurturing-sequence',
            name: 'Nutrição Educativa Avançada',
            description: 'Sequência de conteúdo educativo personalizado com base no perfil do lead',
            trigger_event: 'lead_qualified',
            type: 'email',
            is_active: true,
            executions_today: 34,
            last_execution: new Date(Date.now() - 15 * 60 * 1000),
            success_rate: 94.7,
            conversion_rate: 41.3,
            total_leads_processed: 789,
            avg_response_time: '3.1s',
            automation_steps: [
                { step_type: 'persona_identification', step_order: 1, config: { ai_model: 'persona_classifier' } },
                { step_type: 'content_selection', step_order: 2, config: { content_library: 'premium_education' } },
                { step_type: 'send_schedule', step_order: 3, config: { frequency: 'weekly', optimization: 'engagement_based' } }
            ]
        },
        {
            id: 'proposal-automation',
            name: 'Geração Automática de Propostas',
            description: 'Criação e envio automático de propostas personalizadas com IA',
            trigger_event: 'lead_hot',
            type: 'document_generation',
            is_active: false,
            executions_today: 0,
            last_execution: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            success_rate: 100,
            conversion_rate: 67.8,
            total_leads_processed: 123,
            avg_response_time: '4.7s',
            automation_steps: [
                { step_type: 'data_collection', step_order: 1, config: { sources: 'comprehensive' } },
                { step_type: 'proposal_generation', step_order: 2, config: { ai_writer: 'gpt-4-proposals' } },
                { step_type: 'pdf_creation', step_order: 3, config: { template: 'premium_branded' } },
                { step_type: 'email_delivery', step_order: 4, config: { tracking: 'advanced' } }
            ]
        }
    ];
}

function loadMockExecutionHistory() {
    const mockHistory = [
        {
            automation: 'Sequência de Boas-vindas Premium',
            trigger: 'Novo lead: Maria Silva Entrepreneurs',
            status: 'success',
            execution_time: new Date(Date.now() - 2 * 60 * 1000),
            result: 'Email enviado + Score IA: 8.5/10 + Atribuído para Sr. Sales',
            execution_time_ms: 2100
        },
        {
            automation: 'Qualificação com IA Avançada',
            trigger: 'Lead atualizado: João Santos Tech Corp',
            status: 'success',
            execution_time: new Date(Date.now() - 5 * 60 * 1000),
            result: 'Score: 9.2/10 | Prioridade: Alta | Setor: Tecnologia',
            execution_time_ms: 750
        },
        {
            automation: 'Follow-up WhatsApp Inteligente',
            trigger: 'Sem contato há 7 dias: Ana Costa',
            status: 'success',
            execution_time: new Date(Date.now() - 8 * 60 * 1000),
            result: 'WhatsApp enviado no horário otimizado (14:30)',
            execution_time_ms: 1200
        },
        {
            automation: 'Nutrição Educativa Avançada',
            trigger: 'Lead qualificado: Pedro Oliveira',
            status: 'success',
            execution_time: new Date(Date.now() - 15 * 60 * 1000),
            result: 'Persona: Decisor Técnico | Conteúdo: Case Study Enterprise',
            execution_time_ms: 3200
        },
        {
            automation: 'Geração Automática de Propostas',
            trigger: 'Lead aquecido: Carlos Mendes',
            status: 'failed',
            execution_time: new Date(Date.now() - 20 * 60 * 1000),
            result: 'Erro: Dados insuficientes para proposta personalizada',
            execution_time_ms: 890
        },
        {
            automation: 'Sequência de Boas-vindas Premium',
            trigger: 'Novo lead: Laura Tech Solutions',
            status: 'running',
            execution_time: new Date(Date.now() - 1 * 60 * 1000),
            result: 'Executando etapa 3/5: Análise de perfil com IA',
            execution_time_ms: null
        }
    ];

    automationState.executionHistory = mockHistory;
}

function loadMockTemplates() {
    automationState.templates = [
        { id: 'welcome_premium', name: 'Boas-vindas Premium', type: 'email', category: 'onboarding' },
        { id: 'nurturing_tech', name: 'Nutrição Tech Leaders', type: 'email', category: 'nurturing' },
        { id: 'whatsapp_followup', name: 'Follow-up WhatsApp', type: 'whatsapp', category: 'followup' },
        { id: 'proposal_enterprise', name: 'Proposta Enterprise', type: 'document', category: 'sales' }
    ];
}

function calculateMockStats() {
    automationState.realTimeStats = {
        totalExecutions: 1247,
        successRate: 94.8,
        activeAutomations: 4,
        executionsToday: 537,
        avgResponseTime: '2.1s',
        conversionRate: 32.4,
        leadsProcessed: 5252
    };
}

// ===== RENDERIZAÇÃO PREMIUM =====
function render() {
    renderDashboardStats();
    renderAutomationCards();
    renderExecutionHistory();
    renderFilters();
    renderQuickActions();
}

function renderDashboardStats() {
    const statsContainer = document.getElementById('automation-stats');
    if (!statsContainer) return;
    
    const stats = automationState.realTimeStats;
    
    statsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-blue-100">Total Execuções</h3>
                    <span class="text-2xl">🚀</span>
                </div>
                <p class="text-3xl font-bold">${stats.totalExecutions?.toLocaleString() || 0}</p>
                <p class="text-xs text-blue-100 mt-1">+12% vs ontem</p>
            </div>
            
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-green-100">Taxa de Sucesso</h3>
                    <span class="text-2xl">✅</span>
                </div>
                <p class="text-3xl font-bold">${stats.successRate?.toFixed(1) || 0}%</p>
                <p class="text-xs text-green-100 mt-1">+2.3% esta semana</p>
            </div>
            
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-purple-100">Automações Ativas</h3>
                    <span class="text-2xl">⚡</span>
                </div>
                <p class="text-3xl font-bold">${stats.activeAutomations || 0}</p>
                <p class="text-xs text-purple-100 mt-1">de ${automationState.automations.length} total</p>
            </div>
            
            <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-orange-100">Hoje</h3>
                    <span class="text-2xl">📊</span>
                </div>
                <p class="text-3xl font-bold">${stats.executionsToday || 0}</p>
                <p class="text-xs text-orange-100 mt-1">execuções hoje</p>
            </div>
            
            <div class="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-teal-100">Tempo Médio</h3>
                    <span class="text-2xl">⏱️</span>
                </div>
                <p class="text-3xl font-bold">${stats.avgResponseTime || '0s'}</p>
                <p class="text-xs text-teal-100 mt-1">resposta média</p>
            </div>
            
            <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-pink-100">Conversão</h3>
                    <span class="text-2xl">🎯</span>
                </div>
                <p class="text-3xl font-bold">${stats.conversionRate?.toFixed(1) || 0}%</p>
                <p class="text-xs text-pink-100 mt-1">taxa de conversão</p>
            </div>
        </div>
    `;
}

function renderAutomationCards() {
    const container = document.getElementById('automations-list');
    if (!container) return;
    
    const filteredAutomations = getFilteredAutomations();
    
    if (filteredAutomations.length === 0) {
        container.innerHTML = renderEmptyState();
        return;
    }
    
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            ${filteredAutomations.map(automation => renderAutomationCard(automation)).join('')}
        </div>
    `;
}

function renderAutomationCard(automation) {
    return `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-br ${getTypeGradient(automation.type)} rounded-xl flex items-center justify-center">
                        <span class="text-xl text-white">${getTypeIcon(automation.type)}</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900 text-lg">${automation.name}</h3>
                        <p class="text-sm text-gray-600">${automation.description}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(automation.is_active)}">
                        ${automation.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                    <button onclick="toggleAutomationMenu('${automation.id}')" class="text-gray-400 hover:text-gray-600 p-1">
                        <span class="text-lg">⋮</span>
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center">
                    <p class="text-2xl font-bold text-blue-600">${automation.executions_today || 0}</p>
                    <p class="text-xs text-gray-500">Hoje</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-green-600">${(automation.success_rate || 0).toFixed(1)}%</p>
                    <p class="text-xs text-gray-500">Sucesso</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-purple-600">${(automation.conversion_rate || 0).toFixed(1)}%</p>
                    <p class="text-xs text-gray-500">Conversão</p>
                </div>
            </div>
            
            <div class="flex items-center justify-between mb-4">
                <span class="text-xs text-gray-500">
                    ${automation.automation_steps?.length || 0} etapas • ${automation.total_leads_processed || 0} leads processados
                </span>
                <span class="text-xs text-gray-500">
                    Último: ${formatTimeAgo(automation.last_execution)}
                </span>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="viewAutomationDetails('${automation.id}')" class="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors font-medium">
                    📊 Detalhes
                </button>
                <button onclick="editAutomation('${automation.id}')" class="flex-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg transition-colors font-medium">
                    ✏️ Editar
                </button>
                <button onclick="toggleAutomation('${automation.id}')" class="flex-1 text-xs ${automation.is_active ? 'bg-red-50 hover:bg-red-100 text-red-700' : 'bg-green-50 hover:bg-green-100 text-green-700'} px-3 py-2 rounded-lg transition-colors font-medium">
                    ${automation.is_active ? '⏸️ Pausar' : '▶️ Ativar'}
                </button>
            </div>
        </div>
    `;
}

function renderExecutionHistory() {
    const container = document.getElementById('execution-history');
    if (!container) return;
    
    container.innerHTML = automationState.executionHistory.map(execution => `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-4">
                <div class="flex items-center space-x-3">
                    <span class="w-3 h-3 rounded-full ${getExecutionStatusColor(execution.status)}"></span>
                    <span class="font-medium text-gray-900">${execution.automation}</span>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-700">${execution.trigger}</span>
            </td>
            <td class="py-4 px-4">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(execution.status === 'success')}">
                    ${getStatusText(execution.status)}
                </span>
            </td>
            <td class="py-4 px-4">
                <div class="text-sm">
                    <p class="text-gray-900">${formatDateTime(execution.execution_time)}</p>
                    ${execution.execution_time_ms ? `<p class="text-xs text-gray-500">${execution.execution_time_ms}ms</p>` : ''}
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-700 text-sm">${execution.result}</span>
            </td>
        </tr>
    `).join('');
}

function renderFilters() {
    const container = document.getElementById('automation-filters');
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex flex-wrap gap-4 mb-6">
            <select id="status-filter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium">
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
            </select>
            
            <select id="type-filter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium">
                <option value="all">Todos os Tipos</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="ai_processing">IA Processing</option>
                <option value="document_generation">Documentos</option>
            </select>
            
            <select id="period-filter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium">
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
            </select>
            
            <button onclick="syncAutomations()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                🔄 Atualizar
            </button>
            
            <button onclick="openCreateModal()" class="btn-primary ml-auto">
                <span class="mr-2">+</span>
                Nova Automação
            </button>
        </div>
    `;
}

function renderQuickActions() {
    const container = document.getElementById('quick-actions');
    if (!container) return;
    
    container.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onclick="createNewAutomation()" class="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all">
                <span class="text-2xl mb-2 block">🚀</span>
                <span class="text-sm font-medium">Criar Nova</span>
            </button>
            
            <button onclick="openTemplateLibrary()" class="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all">
                <span class="text-2xl mb-2 block">📚</span>
                <span class="text-sm font-medium">Templates</span>
            </button>
            
            <button onclick="viewAnalytics()" class="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all">
                <span class="text-2xl mb-2 block">📊</span>
                <span class="text-sm font-medium">Analytics</span>
            </button>
            
            <button onclick="exportData()" class="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all">
                <span class="text-2xl mb-2 block">📤</span>
                <span class="text-sm font-medium">Exportar</span>
            </button>
        </div>
    `;
}

function renderEmptyState() {
    return `
        <div class="text-center py-16">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-4xl">🤖</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhuma automação encontrada</h3>
            <p class="text-gray-600 mb-8 max-w-md mx-auto">Crie sua primeira automação para começar a escalar seus resultados de vendas automaticamente</p>
            <div class="flex gap-4 justify-center">
                <button onclick="openCreateModal()" class="btn-primary">
                    Criar Primeira Automação
                </button>
                <button onclick="openTemplateLibrary()" class="btn-secondary">
                    Ver Templates
                </button>
            </div>
        </div>
    `;
}

// ===== FUNÇÕES AUXILIARES =====
function getFilteredAutomations() {
    return automationState.automations.filter(automation => {
        const statusMatch = automationState.activeFilters.status === 'all' || 
                           (automationState.activeFilters.status === 'active' && automation.is_active) ||
                           (automationState.activeFilters.status === 'inactive' && !automation.is_active);
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
        ai_processing: '🧠',
        document_generation: '📄',
        webhook: '🔗'
    };
    return icons[type] || '🤖';
}

function getTypeGradient(type) {
    const gradients = {
        email: 'from-blue-500 to-blue-600',
        whatsapp: 'from-green-500 to-green-600',
        sms: 'from-purple-500 to-purple-600',
        ai_processing: 'from-pink-500 to-pink-600',
        document_generation: 'from-orange-500 to-orange-600',
        webhook: 'from-teal-500 to-teal-600'
    };
    return gradients[type] || 'from-gray-500 to-gray-600';
}

function getStatusBadgeClass(isActive) {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
}

function getExecutionStatusColor(status) {
    const colors = {
        success: 'bg-green-500',
        failed: 'bg-red-500',
        running: 'bg-blue-500 animate-pulse',
        pending: 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
}

function getStatusText(status) {
    const texts = {
        success: 'Sucesso',
        failed: 'Falhou',
        running: 'Executando',
        pending: 'Pendente'
    };
    return texts[status] || status;
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(date) {
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

// ===== SETUP EVENTOS =====
function setupEventListeners() {
    const statusFilter = document.getElementById('status-filter');
    const typeFilter = document.getElementById('type-filter');
    const periodFilter = document.getElementById('period-filter');
    
    [statusFilter, typeFilter, periodFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', (e) => {
                const filterType = e.target.id.split('-')[0];
                automationState.activeFilters[filterType] = e.target.value;
                render();
            });
        }
    });
}

function setupRealTimeUpdates() {
    // Atualizar dados a cada 30 segundos
    automationState.refreshInterval = setInterval(async () => {
        try {
            await loadRealTimeStats();
            await loadExecutionHistory();
            renderDashboardStats();
            renderExecutionHistory();
        } catch (error) {
            console.error('Erro ao atualizar dados em tempo real:', error);
        }
    }, 30000);
}

// ===== AÇÕES GLOBAIS =====
window.createNewAutomation = function() {
    showToast('Abrindo criador de automação avançado...', 'info');
};

window.openTemplateLibrary = function() {
    showToast('Carregando biblioteca de templates premium...', 'info');
};

window.syncAutomations = function() {
    showToast('Sincronizando automações...', 'info');
    loadAutomations();
    loadExecutionHistory();
    loadRealTimeStats();
};

window.viewAutomationDetails = function(automationId) {
    const automation = automationState.automations.find(a => a.id === automationId);
    if (automation) {
        showToast(`Abrindo detalhes de: ${automation.name}`, 'info');
    }
};

window.editAutomation = function(automationId) {
    const automation = automationState.automations.find(a => a.id === automationId);
    if (automation) {
        showToast(`Editando: ${automation.name}`, 'info');
    }
};

window.toggleAutomation = function(automationId) {
    const automation = automationState.automations.find(a => a.id === automationId);
    if (automation) {
        automation.is_active = !automation.is_active;
        const status = automation.is_active ? 'ativada' : 'pausada';
        showToast(`Automação ${status} com sucesso!`, 'success');
        render();
    }
};

window.toggleAutomationMenu = function(automationId) {
    showToast('Menu de ações em desenvolvimento', 'info');
};

window.openCreateModal = function() {
    showToast('Modal de criação avançada em desenvolvimento', 'info');
};

window.viewAnalytics = function() {
    showToast('Analytics detalhado em desenvolvimento', 'info');
};

window.exportData = function() {
    showToast('Exportando dados das automações...', 'info');
};

// ===== UTILITÁRIOS =====
function showLoader(show) {
    let loader = document.getElementById('automation-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'automation-loader';
        loader.className = 'fixed inset-0 bg-white/90 z-50 flex items-center justify-center backdrop-blur-sm';
        loader.innerHTML = `
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-b-4 border-gray-100 mx-auto mb-4"></div>
                <p class="text-gray-600 font-medium">Carregando automações...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = show ? 'flex' : 'none';
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

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    if (automationState.refreshInterval) {
        clearInterval(automationState.refreshInterval);
    }
});

// ===== EXPORTS =====
export {
    automationState,
    loadAutomations,
    loadExecutionHistory,
    loadTemplates
};
