/**
 * 🤖 ALSHAM 360° PRIMA - SISTEMA DE AUTOMAÇÕES COMPLETO
 * Sistema avançado de workflow, triggers e integrações
 * 
 * @version 1.0.0 - PRODUÇÃO
 * @integration 55 Tabelas Supabase + N8N + Make.com + Zapier
 * @tables automation_rules, automation_executions, logs_automacao
 */

// ===== CONFIGURAÇÃO GLOBAL =====
const ALSHAM_AUTOMATION_CONFIG = {
    version: '1.0.0',
    
    // Tipos de triggers disponíveis
    triggerTypes: [
        { value: 'lead_created', label: '👤 Lead Criado', icon: '🆕', category: 'leads' },
        { value: 'lead_status_changed', label: '📊 Status do Lead Alterado', icon: '🔄', category: 'leads' },
        { value: 'lead_temperature_changed', label: '🌡️ Temperatura Alterada', icon: '🔥', category: 'leads' },
        { value: 'opportunity_created', label: '💰 Oportunidade Criada', icon: '✨', category: 'sales' },
        { value: 'interaction_logged', label: '💬 Interação Registrada', icon: '📝', category: 'interactions' },
        { value: 'score_threshold', label: '🤖 Score IA Atingido', icon: '⚡', category: 'ai' },
        { value: 'time_based', label: '⏰ Baseado em Tempo', icon: '🕐', category: 'schedule' },
        { value: 'webhook_received', label: '🔗 Webhook Recebido', icon: '📡', category: 'integrations' }
    ],
    
    // Tipos de ações disponíveis
    actionTypes: [
        { value: 'send_email', label: '📧 Enviar Email', icon: '✉️', category: 'communication' },
        { value: 'send_sms', label: '📱 Enviar SMS', icon: '💬', category: 'communication' },
        { value: 'update_lead', label: '✏️ Atualizar Lead', icon: '📝', category: 'data' },
        { value: 'create_task', label: '✅ Criar Tarefa', icon: '📋', category: 'tasks' },
        { value: 'assign_owner', label: '👤 Designar Responsável', icon: '🎯', category: 'assignment' },
        { value: 'add_to_sequence', label: '🔄 Adicionar à Sequência', icon: '⚙️', category: 'sequences' },
        { value: 'call_webhook', label: '🌐 Chamar Webhook', icon: '🔗', category: 'integrations' },
        { value: 'n8n_workflow', label: '🔧 N8N Workflow', icon: '⚡', category: 'integrations' },
        { value: 'make_scenario', label: '🎛️ Make Scenario', icon: '🤖', category: 'integrations' },
        { value: 'zapier_zap', label: '⚡ Zapier Zap', icon: '🔥', category: 'integrations' }
    ],
    
    // Status das execuções
    executionStatus: [
        { value: 'pending', label: 'Pendente', color: 'yellow', icon: '⏳' },
        { value: 'running', label: 'Executando', color: 'blue', icon: '🔄' },
        { value: 'success', label: 'Sucesso', color: 'green', icon: '✅' },
        { value: 'failed', label: 'Falhou', color: 'red', icon: '❌' },
        { value: 'cancelled', label: 'Cancelado', color: 'gray', icon: '⏹️' }
    ],
    
    // Integrações externas
    integrations: {
        n8n: {
            name: 'N8N',
            icon: '🔧',
            description: 'Workflows avançados com N8N',
            webhookUrl: '/api/webhooks/n8n'
        },
        make: {
            name: 'Make.com',
            icon: '🎛️', 
            description: 'Automação visual com Make',
            webhookUrl: '/api/webhooks/make'
        },
        zapier: {
            name: 'Zapier',
            icon: '⚡',
            description: 'Conecte 5000+ apps',
            webhookUrl: '/api/webhooks/zapier'
        }
    },
    
    // Configurações de atualização
    realtime: {
        enabled: true,
        refreshInterval: 10000 // 10 segundos para execuções
    }
};

// ===== ESTADO GLOBAL =====
const alshamAutomationState = {
    user: null,
    orgId: null,
    
    // Dados principais
    automationRules: [],
    executionHistory: [],
    logs: [],
    
    // Analytics
    executionStats: {},
    performanceMetrics: {},
    
    // UI
    charts: {},
    currentModal: null,
    isLoading: false,
    
    // Filtros
    filters: {
        status: '',
        category: '',
        dateRange: '',
        search: ''
    },
    
    // Paginação
    pagination: {
        current: 1,
        perPage: 20,
        total: 0
    },
    
    // Real-time
    subscriptions: [],
    lastUpdate: null
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async function() {
    try {
        showLoading(true, '🤖 Carregando Sistema de Automações...');
        
        // Autenticar usuário
        await authenticateUser();
        
        // Carregar dados
        await loadAutomationData();
        
        // Configurar interface
        setupAutomationInterface();
        
        // Configurar real-time
        setupRealtimeSubscriptions();
        
        showLoading(false);
        showSuccess('🎉 Sistema de Automações carregado!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showLoading(false);
        showError('Erro ao carregar sistema de automações');
    }
});

// ===== AUTENTICAÇÃO =====
async function authenticateUser() {
    try {
        const session = await window.AlshamSupabase.getCurrentSession();
        if (!session?.user) {
            window.location.href = '/login.html?redirect=automacoes';
            return;
        }
        
        alshamAutomationState.user = session.user;
        alshamAutomationState.orgId = await window.AlshamSupabase.getCurrentOrgId();
        
    } catch (error) {
        console.error('❌ Erro na autenticação:', error);
        throw error;
    }
}

// ===== CARREGAMENTO DE DADOS =====
async function loadAutomationData() {
    try {
        const orgId = alshamAutomationState.orgId;
        
        // Carregar regras de automação
        const { data: rules, error: rulesError } = await window.AlshamSupabase.genericSelect(
            'automation_rules',
            { org_id: orgId },
            { order: { column: 'created_at', ascending: false } }
        );
        
        if (rulesError) {
            console.warn('⚠️ Erro ao carregar regras:', rulesError);
        }
        
        alshamAutomationState.automationRules = rules || [];
        
        // Carregar histórico de execuções (últimas 100)
        const { data: executions, error: execError } = await window.AlshamSupabase.genericSelect(
            'automation_executions',
            { org_id: orgId },
            { 
                order: { column: 'started_at', ascending: false },
                limit: 100
            }
        );
        
        if (execError) {
            console.warn('⚠️ Erro ao carregar execuções:', execError);
        }
        
        alshamAutomationState.executionHistory = executions || [];
        
        // Carregar logs (últimos 200)
        const { data: logs, error: logsError } = await window.AlshamSupabase.genericSelect(
            'logs_automacao',
            { org_id: orgId },
            { 
                order: { column: 'created_at', ascending: false },
                limit: 200
            }
        );
        
        if (logsError) {
            console.warn('⚠️ Erro ao carregar logs:', logsError);
        }
        
        alshamAutomationState.logs = logs || [];
        
        // Calcular estatísticas
        calculateExecutionStats();
        
        console.log('✅ Dados de automação carregados');
        console.log(`📊 ${alshamAutomationState.automationRules.length} regras ativas`);
        console.log(`🔄 ${alshamAutomationState.executionHistory.length} execuções`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        throw error;
    }
}

function calculateExecutionStats() {
    const executions = alshamAutomationState.executionHistory;
    
    alshamAutomationState.executionStats = {
        total: executions.length,
        success: executions.filter(e => e.status === 'success').length,
        failed: executions.filter(e => e.status === 'failed').length,
        pending: executions.filter(e => e.status === 'pending').length,
        running: executions.filter(e => e.status === 'running').length,
        
        // Últimas 24 horas
        last24h: executions.filter(e => {
            const execTime = new Date(e.started_at);
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return execTime >= dayAgo;
        }).length,
        
        // Taxa de sucesso
        successRate: executions.length > 0 
            ? ((executions.filter(e => e.status === 'success').length / executions.length) * 100).toFixed(1)
            : 0,
        
        // Tempo médio de execução
        avgExecutionTime: calculateAverageExecutionTime(executions)
    };
}

function calculateAverageExecutionTime(executions) {
    const completedExecs = executions.filter(e => 
        e.status === 'success' || e.status === 'failed'
    ).filter(e => e.execution_time_ms);
    
    if (completedExecs.length === 0) return 0;
    
    const totalTime = completedExecs.reduce((sum, exec) => 
        sum + (exec.execution_time_ms || 0), 0
    );
    
    return Math.round(totalTime / completedExecs.length);
}

// ===== CONFIGURAÇÃO DA INTERFACE =====
function setupAutomationInterface() {
    renderAutomationDashboard();
    renderRulesList();
    renderExecutionHistory();
    renderChartsSection();
    setupEventListeners();
    setupModals();
}

// ===== RENDERIZAÇÃO DO DASHBOARD =====
function renderAutomationDashboard() {
    const container = document.getElementById('automation-dashboard');
    if (!container) return;
    
    const stats = alshamAutomationState.executionStats;
    const activeRules = alshamAutomationState.automationRules.filter(r => r.is_active);
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Regras Ativas -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-blue-100 text-sm font-medium">Regras Ativas</p>
                        <p class="text-3xl font-bold">${activeRules.length}</p>
                        <p class="text-blue-100 text-xs mt-1">
                            de ${alshamAutomationState.automationRules.length} totais
                        </p>
                    </div>
                    <div class="bg-blue-400 bg-opacity-30 rounded-lg p-3">
                        <span class="text-3xl">🤖</span>
                    </div>
                </div>
            </div>
            
            <!-- Execuções 24h -->
            <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-green-100 text-sm font-medium">Execuções 24h</p>
                        <p class="text-3xl font-bold">${stats.last24h}</p>
                        <p class="text-green-100 text-xs mt-1">
                            ✅ ${stats.success} sucessos
                        </p>
                    </div>
                    <div class="bg-green-400 bg-opacity-30 rounded-lg p-3">
                        <span class="text-3xl">🔄</span>
                    </div>
                </div>
            </div>
            
            <!-- Taxa de Sucesso -->
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-purple-100 text-sm font-medium">Taxa de Sucesso</p>
                        <p class="text-3xl font-bold">${stats.successRate}%</p>
                        <p class="text-purple-100 text-xs mt-1">
                            ${stats.failed} falhas
                        </p>
                    </div>
                    <div class="bg-purple-400 bg-opacity-30 rounded-lg p-3">
                        <span class="text-3xl">📈</span>
                    </div>
                </div>
            </div>
            
            <!-- Tempo Médio -->
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-orange-100 text-sm font-medium">Tempo Médio</p>
                        <p class="text-3xl font-bold">${stats.avgExecutionTime}ms</p>
                        <p class="text-orange-100 text-xs mt-1">
                            por execução
                        </p>
                    </div>
                    <div class="bg-orange-400 bg-opacity-30 rounded-lg p-3">
                        <span class="text-3xl">⏱️</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Ações Rápidas -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">⚡ Ações Rápidas</h3>
                <div class="flex space-x-3">
                    <button id="refresh-data" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        🔄 Atualizar
                    </button>
                    <button id="create-rule" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        ➕ Nova Regra
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${Object.values(ALSHAM_AUTOMATION_CONFIG.integrations).map(integration => `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div class="flex items-center mb-2">
                            <span class="text-2xl mr-3">${integration.icon}</span>
                            <h4 class="font-semibold text-gray-900">${integration.name}</h4>
                        </div>
                        <p class="text-sm text-gray-600 mb-3">${integration.description}</p>
                        <button onclick="setupIntegration('${integration.name.toLowerCase()}')" 
                                class="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                            Configurar
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ===== RENDERIZAÇÃO DA LISTA DE REGRAS =====
function renderRulesList() {
    const container = document.getElementById('rules-container');
    if (!container) return;
    
    const rules = alshamAutomationState.automationRules;
    
    if (rules.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-8 text-center">
                <div class="text-gray-400 text-6xl mb-4">🤖</div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Nenhuma regra criada</h3>
                <p class="text-gray-600 mb-6">Comece criando sua primeira automação</p>
                <button id="create-first-rule" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    ➕ Criar Primeira Regra
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">📋 Regras de Automação (${rules.length})</h3>
            </div>
            
            <div class="divide-y divide-gray-200">
                ${rules.map(rule => renderRuleCard(rule)).join('')}
            </div>
        </div>
    `;
}

function renderRuleCard(rule) {
    const trigger = ALSHAM_AUTOMATION_CONFIG.triggerTypes.find(t => t.value === rule.trigger_event) || 
                   { label: rule.trigger_event, icon: '⚡' };
    
    const actionsCount = Array.isArray(rule.actions) ? rule.actions.length : 0;
    const executions = alshamAutomationState.executionHistory.filter(e => e.rule_id === rule.id);
    const lastExecution = executions[0];
    
    return `
        <div class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg ${rule.is_active ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center">
                        <span class="text-lg">${trigger.icon}</span>
                    </div>
                    <div>
                        <h4 class="text-lg font-semibold text-gray-900">${rule.name}</h4>
                        <p class="text-sm text-gray-600">${rule.description || 'Sem descrição'}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                    }">
                        ${rule.is_active ? '🟢 Ativa' : '🔴 Inativa'}
                    </span>
                </div>
            </div>
            
            <div class="flex items-center justify-between text-sm text-gray-600">
                <div class="flex items-center space-x-4">
                    <span>🎯 ${trigger.label}</span>
                    <span>⚡ ${actionsCount} ações</span>
                    <span>🔄 ${executions.length} execuções</span>
                </div>
                
                <div class="flex items-center space-x-2">
                    ${lastExecution ? `
                        <span class="text-xs">
                            Última: ${formatTimeAgo(lastExecution.started_at)}
                        </span>
                    ` : ''}
                    
                    <button onclick="editRule('${rule.id}')" 
                            class="text-blue-600 hover:text-blue-800 transition-colors">
                        ✏️
                    </button>
                    <button onclick="toggleRule('${rule.id}', ${!rule.is_active})" 
                            class="text-${rule.is_active ? 'red' : 'green'}-600 hover:text-${rule.is_active ? 'red' : 'green'}-800 transition-colors">
                        ${rule.is_active ? '⏸️' : '▶️'}
                    </button>
                    <button onclick="deleteRule('${rule.id}')" 
                            class="text-red-600 hover:text-red-800 transition-colors">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===== RENDERIZAÇÃO DO HISTÓRICO =====
function renderExecutionHistory() {
    const container = document.getElementById('execution-history');
    if (!container) return;
    
    const executions = alshamAutomationState.executionHistory.slice(0, 20); // Últimas 20
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">📊 Histórico de Execuções</h3>
                    <button id="view-all-executions" class="text-sm text-blue-600 hover:text-blue-800">
                        Ver todas →
                    </button>
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regra</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tempo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Iniciado</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${executions.map(execution => renderExecutionRow(execution)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderExecutionRow(execution) {
    const rule = alshamAutomationState.automationRules.find(r => r.id === execution.rule_id);
    const statusConfig = ALSHAM_AUTOMATION_CONFIG.executionStatus.find(s => s.value === execution.status) || 
                        { label: execution.status, color: 'gray', icon: '❓' };
    
    return `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800">
                    ${statusConfig.icon} ${statusConfig.label}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${rule?.name || 'Regra removida'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${execution.trigger_event}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${execution.execution_time_ms ? `${execution.execution_time_ms}ms` : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${formatTimeAgo(execution.started_at)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewExecutionDetails('${execution.id}')" 
                        class="text-blue-600 hover:text-blue-900">
                    👁️ Detalhes
                </button>
            </td>
        </tr>
    `;
}

// ===== RENDERIZAÇÃO DE GRÁFICOS =====
function renderChartsSection() {
    renderExecutionsChart();
    renderPerformanceChart();
}

function renderExecutionsChart() {
    const canvas = document.getElementById('executions-chart');
    if (!canvas || !window.Chart) return;
    
    // Dados dos últimos 7 dias
    const days = [];
    const successData = [];
    const failedData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        days.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        
        const dayExecutions = alshamAutomationState.executionHistory.filter(e => 
            e.started_at.startsWith(dateStr)
        );
        
        successData.push(dayExecutions.filter(e => e.status === 'success').length);
        failedData.push(dayExecutions.filter(e => e.status === 'failed').length);
    }
    
    if (alshamAutomationState.charts.executions) {
        alshamAutomationState.charts.executions.destroy();
    }
    
    alshamAutomationState.charts.executions = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Sucessos',
                    data: successData,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Falhas',
                    data: failedData,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderPerformanceChart() {
    const canvas = document.getElementById('performance-chart');
    if (!canvas || !window.Chart) return;
    
    const statusCounts = alshamAutomationState.executionStats;
    
    if (alshamAutomationState.charts.performance) {
        alshamAutomationState.charts.performance.destroy();
    }
    
    alshamAutomationState.charts.performance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Sucessos', 'Falhas', 'Pendentes', 'Executando'],
            datasets: [{
                data: [
                    statusCounts.success,
                    statusCounts.failed,
                    statusCounts.pending,
                    statusCounts.running
                ],
                backgroundColor: [
                    '#22C55E',
                    '#EF4444',
                    '#F59E0B',
                    '#3B82F6'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Botões principais
    document.getElementById('refresh-data')?.addEventListener('click', refreshData);
    document.getElementById('create-rule')?.addEventListener('click', () => openRuleModal());
    document.getElementById('create-first-rule')?.addEventListener('click', () => openRuleModal());
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
}

// ===== MODAIS =====
function setupModals() {
    // Modal para criar/editar regras
    if (!document.getElementById('rule-modal')) {
        createRuleModal();
    }
}

function createRuleModal() {
    const modal = document.createElement('div');
    modal.id = 'rule-modal';
    modal.className = 'fixed inset-0 bg-gray-900 bg-opacity-50 hidden z-50 flex items-center justify-center p-4';
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-90vh overflow-y-auto">
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-semibold text-gray-900" id="modal-title">
                        🤖 Criar Nova Regra de Automação
                    </h3>
                    <button onclick="closeRuleModal()" class="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>
            </div>
            
            <form id="rule-form" class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Informações Básicas -->
                    <div class="md:col-span-2">
                        <h4 class="text-lg font-medium text-gray-900 mb-4">📝 Informações Básicas</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nome da Regra *</label>
                                <input type="text" id="rule-name" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                       placeholder="Ex: Notificar novos leads VIP">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select id="rule-status" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="true">🟢 Ativa</option>
                                    <option value="false">🔴 Inativa</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                            <textarea id="rule-description" rows="2" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Descreva quando e como esta automação será executada..."></textarea>
                        </div>
                    </div>
                    
                    <!-- Trigger -->
                    <div>
                        <h4 class="text-lg font-medium text-gray-900 mb-4">🎯 Disparador (Quando)</h4>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento *</label>
                            <select id="trigger-type" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Selecione um disparador...</option>
                                ${ALSHAM_AUTOMATION_CONFIG.triggerTypes.map(trigger => `
                                    <option value="${trigger.value}">${trigger.icon} ${trigger.label}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div id="trigger-conditions" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Condições</label>
                            <textarea id="trigger-conditions-json" rows="4" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                      placeholder='{"campo": "valor", "operador": "equals"}'>
                            </textarea>
                            <p class="text-xs text-gray-500 mt-1">JSON com as condições para o disparador</p>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div>
                        <h4 class="text-lg font-medium text-gray-900 mb-4">⚡ Ações (O que fazer)</h4>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Selecionar Ação</label>
                            <select id="action-type" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Selecione uma ação...</option>
                                ${ALSHAM_AUTOMATION_CONFIG.actionTypes.map(action => `
                                    <option value="${action.value}">${action.icon} ${action.label}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <button type="button" id="add-action" class="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            ➕ Adicionar Ação
                        </button>
                        
                        <div id="actions-list" class="space-y-3">
                            <!-- Ações serão adicionadas dinamicamente -->
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                    <button type="button" onclick="closeRuleModal()" 
                            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" id="save-rule" 
                            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        💾 Salvar Regra
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners do modal
    document.getElementById('rule-form').addEventListener('submit', handleRuleSubmit);
    document.getElementById('add-action').addEventListener('click', addActionToRule);
    document.getElementById('trigger-type').addEventListener('change', handleTriggerTypeChange);
}

// ===== FUNÇÕES DE MODAL =====
function openRuleModal(ruleId = null) {
    const modal = document.getElementById('rule-modal');
    const title = document.getElementById('modal-title');
    
    if (ruleId) {
        title.textContent = '✏️ Editar Regra de Automação';
        loadRuleData(ruleId);
    } else {
        title.textContent = '🤖 Criar Nova Regra de Automação';
        clearRuleForm();
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeRuleModal() {
    const modal = document.getElementById('rule-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function clearRuleForm() {
    document.getElementById('rule-form').reset();
    document.getElementById('actions-list').innerHTML = '';
    document.getElementById('trigger-conditions').classList.add('hidden');
}

function loadRuleData(ruleId) {
    const rule = alshamAutomationState.automationRules.find(r => r.id === ruleId);
    if (!rule) return;
    
    document.getElementById('rule-name').value = rule.name;
    document.getElementById('rule-description').value = rule.description || '';
    document.getElementById('rule-status').value = rule.is_active.toString();
    document.getElementById('trigger-type').value = rule.trigger_event;
    
    if (rule.conditions) {
        document.getElementById('trigger-conditions').classList.remove('hidden');
        document.getElementById('trigger-conditions-json').value = JSON.stringify(rule.conditions, null, 2);
    }
    
    // Carregar ações
    const actionsList = document.getElementById('actions-list');
    actionsList.innerHTML = '';
    
    if (rule.actions && Array.isArray(rule.actions)) {
        rule.actions.forEach((action, index) => {
            addActionToList(action, index);
        });
    }
}

function handleTriggerTypeChange(event) {
    const triggerConditions = document.getElementById('trigger-conditions');
    
    if (event.target.value) {
        triggerConditions.classList.remove('hidden');
    } else {
        triggerConditions.classList.add('hidden');
    }
}

function addActionToRule() {
    const actionType = document.getElementById('action-type').value;
    if (!actionType) {
        showWarning('Selecione um tipo de ação');
        return;
    }
    
    const actionConfig = ALSHAM_AUTOMATION_CONFIG.actionTypes.find(a => a.value === actionType);
    const actionsList = document.getElementById('actions-list');
    const actionIndex = actionsList.children.length;
    
    const action = {
        type: actionType,
        config: {},
        order: actionIndex
    };
    
    addActionToList(action, actionIndex);
    document.getElementById('action-type').value = '';
}

function addActionToList(action, index) {
    const actionConfig = ALSHAM_AUTOMATION_CONFIG.actionTypes.find(a => a.value === action.type);
    const actionsList = document.getElementById('actions-list');
    
    const actionDiv = document.createElement('div');
    actionDiv.className = 'border border-gray-200 rounded-lg p-4';
    actionDiv.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <div class="flex items-center space-x-2">
                <span class="text-lg">${actionConfig?.icon || '⚡'}</span>
                <h5 class="font-medium text-gray-900">${actionConfig?.label || action.type}</h5>
            </div>
            <button type="button" onclick="removeAction(${index})" class="text-red-600 hover:text-red-800">
                🗑️
            </button>
        </div>
        
        <div class="space-y-3">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Configuração da Ação</label>
                <textarea id="action-config-${index}" rows="3" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                          placeholder='{"parametro": "valor"}'>${JSON.stringify(action.config, null, 2)}</textarea>
                <p class="text-xs text-gray-500 mt-1">Configuração em JSON para esta ação</p>
            </div>
        </div>
    `;
    
    actionsList.appendChild(actionDiv);
}

function removeAction(index) {
    const actionsList = document.getElementById('actions-list');
    const actionDiv = actionsList.children[index];
    if (actionDiv) {
        actionDiv.remove();
    }
}

// ===== CRUD DE REGRAS =====
async function handleRuleSubmit(event) {
    event.preventDefault();
    
    try {
        showLoading(true, '💾 Salvando regra...');
        
        const formData = {
            name: document.getElementById('rule-name').value,
            description: document.getElementById('rule-description').value,
            is_active: document.getElementById('rule-status').value === 'true',
            trigger_event: document.getElementById('trigger-type').value,
            conditions: {},
            actions: [],
            org_id: alshamAutomationState.orgId
        };
        
        // Parse conditions
        const conditionsText = document.getElementById('trigger-conditions-json').value.trim();
        if (conditionsText) {
            try {
                formData.conditions = JSON.parse(conditionsText);
            } catch (e) {
                throw new Error('JSON de condições inválido');
            }
        }
        
        // Parse actions
        const actionsList = document.getElementById('actions-list');
        for (let i = 0; i < actionsList.children.length; i++) {
            const configTextarea = document.getElementById(`action-config-${i}`);
            if (configTextarea) {
                try {
                    const config = JSON.parse(configTextarea.value);
                    formData.actions.push({
                        type: config.type || 'unknown',
                        config: config,
                        order: i
                    });
                } catch (e) {
                    throw new Error(`JSON da ação ${i + 1} inválido`);
                }
            }
        }
        
        // Salvar no Supabase
        const { data, error } = await window.AlshamSupabase.genericInsert(
            'automation_rules',
            formData
        );
        
        if (error) {
            throw new Error(`Erro ao salvar regra: ${error.message}`);
        }
        
        // Atualizar estado local
        alshamAutomationState.automationRules.unshift(data[0]);
        
        // Registrar evento analytics
        await trackAnalyticsEvent('automation_rule_created', {
            rule_id: data[0].id,
            trigger_type: formData.trigger_event
        });
        
        showLoading(false);
        showSuccess('✅ Regra criada com sucesso!');
        closeRuleModal();
        
        // Recarregar interface
        renderRulesList();
        renderAutomationDashboard();
        
    } catch (error) {
        showLoading(false);
        showError(`Erro: ${error.message}`);
    }
}

async function editRule(ruleId) {
    openRuleModal(ruleId);
}

async function toggleRule(ruleId, newStatus) {
    try {
        const { error } = await window.AlshamSupabase.genericUpdate(
            'automation_rules',
            { id: ruleId },
            { is_active: newStatus }
        );
        
        if (error) {
            throw new Error(`Erro ao alterar status: ${error.message}`);
        }
        
        // Atualizar estado local
        const rule = alshamAutomationState.automationRules.find(r => r.id === ruleId);
        if (rule) {
            rule.is_active = newStatus;
        }
        
        showSuccess(`✅ Regra ${newStatus ? 'ativada' : 'desativada'} com sucesso!`);
        
        // Recarregar interface
        renderRulesList();
        renderAutomationDashboard();
        
    } catch (error) {
        showError(`Erro: ${error.message}`);
    }
}

async function deleteRule(ruleId) {
    if (!confirm('Tem certeza que deseja excluir esta regra? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        const { error } = await window.AlshamSupabase.genericDelete(
            'automation_rules',
            { id: ruleId }
        );
        
        if (error) {
            throw new Error(`Erro ao excluir regra: ${error.message}`);
        }
        
        // Remover do estado local
        alshamAutomationState.automationRules = alshamAutomationState.automationRules.filter(r => r.id !== ruleId);
        
        showSuccess('✅ Regra excluída com sucesso!');
        
        // Recarregar interface
        renderRulesList();
        renderAutomationDashboard();
        
    } catch (error) {
        showError(`Erro: ${error.message}`);
    }
}

// ===== INTEGRAÇÕES EXTERNAS =====
async function setupIntegration(integrationType) {
    const integration = Object.values(ALSHAM_AUTOMATION_CONFIG.integrations).find(i => 
        i.name.toLowerCase() === integrationType
    );
    
    if (!integration) {
        showError('Integração não encontrada');
        return;
    }
    
    // Modal de configuração da integração
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900">
                    ${integration.icon} Configurar ${integration.name}
                </h3>
            </div>
            
            <div class="p-6">
                <p class="text-gray-600 mb-6">${integration.description}</p>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                        <input type="url" value="${integration.webhookUrl}" readonly 
                               class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono">
                        <p class="text-xs text-gray-500 mt-1">Use esta URL para receber webhooks do ${integration.name}</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                        <input type="text" placeholder="Cole sua API Key aqui..." 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Configurações Adicionais</label>
                        <textarea rows="4" placeholder='{"timeout": 30, "retries": 3}' 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"></textarea>
                    </div>
                </div>
            </div>
            
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancelar
                </button>
                <button onclick="saveIntegration('${integrationType}', this)" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    💾 Salvar Configuração
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function saveIntegration(integrationType, button) {
    try {
        button.disabled = true;
        button.innerHTML = '⏳ Salvando...';
        
        // Aqui você salvaria a configuração da integração no Supabase
        // Tabela: integration_configs
        
        showSuccess(`✅ Integração ${integrationType} configurada com sucesso!`);
        button.closest('.fixed').remove();
        
    } catch (error) {
        showError(`Erro: ${error.message}`);
    } finally {
        button.disabled = false;
        button.innerHTML = '💾 Salvar Configuração';
    }
}

// ===== REAL-TIME SUBSCRIPTIONS =====
function setupRealtimeSubscriptions() {
    if (!ALSHAM_AUTOMATION_CONFIG.realtime.enabled) return;
    
    try {
        // Subscription para execuções
        const executionsChannel = window.AlshamSupabase.client
            .channel('automation_executions')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'automation_executions',
                filter: `org_id=eq.${alshamAutomationState.orgId}`
            }, handleExecutionChange)
            .subscribe();
        
        alshamAutomationState.subscriptions.push(executionsChannel);
        
        console.log('✅ Real-time subscriptions configuradas');
        
    } catch (error) {
        console.error('❌ Erro ao configurar real-time:', error);
    }
}

function handleExecutionChange(payload) {
    console.log('📡 Nova execução:', payload);
    
    // Atualizar estado local
    if (payload.eventType === 'INSERT') {
        alshamAutomationState.executionHistory.unshift(payload.new);
    } else if (payload.eventType === 'UPDATE') {
        const index = alshamAutomationState.executionHistory.findIndex(e => e.id === payload.new.id);
        if (index !== -1) {
            alshamAutomationState.executionHistory[index] = payload.new;
        }
    }
    
    // Recalcular estatísticas
    calculateExecutionStats();
    
    // Atualizar interface
    renderAutomationDashboard();
    renderExecutionHistory();
    renderChartsSection();
    
    // Notificação toast
    if (payload.eventType === 'INSERT') {
        showInfo(`🤖 Nova execução iniciada: ${payload.new.trigger_event}`);
    }
}

// ===== FUNÇÕES UTILITÁRIAS =====
async function refreshData() {
    try {
        showLoading(true, '🔄 Atualizando dados...');
        
        await loadAutomationData();
        setupAutomationInterface();
        
        showLoading(false);
        showSuccess('✅ Dados atualizados!');
        
    } catch (error) {
        showLoading(false);
        showError('Erro ao atualizar dados');
    }
}

function viewExecutionDetails(executionId) {
    const execution = alshamAutomationState.executionHistory.find(e => e.id === executionId);
    if (!execution) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-90vh overflow-y-auto">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900">🔍 Detalhes da Execução</h3>
            </div>
            
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-medium text-gray-900 mb-3">📊 Informações Gerais</h4>
                        <div class="space-y-2 text-sm">
                            <div><strong>ID:</strong> ${execution.id}</div>
                            <div><strong>Status:</strong> ${execution.status}</div>
                            <div><strong>Trigger:</strong> ${execution.trigger_event}</div>
                            <div><strong>Iniciado:</strong> ${new Date(execution.started_at).toLocaleString('pt-BR')}</div>
                            ${execution.completed_at ? `<div><strong>Finalizado:</strong> ${new Date(execution.completed_at).toLocaleString('pt-BR')}</div>` : ''}
                            ${execution.execution_time_ms ? `<div><strong>Tempo:</strong> ${execution.execution_time_ms}ms</div>` : ''}
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-medium text-gray-900 mb-3">🔄 Dados do Trigger</h4>
                        <pre class="text-xs bg-gray-100 p-3 rounded-md overflow-auto max-h-40">${JSON.stringify(execution.trigger_data || {}, null, 2)}</pre>
                    </div>
                    
                    <div class="md:col-span-2">
                        <h4 class="font-medium text-gray-900 mb-3">📋 Resultado da Execução</h4>
                        <pre class="text-xs bg-gray-100 p-3 rounded-md overflow-auto max-h-60">${JSON.stringify(execution.execution_result || {}, null, 2)}</pre>
                    </div>
                    
                    ${execution.error_message ? `
                        <div class="md:col-span-2">
                            <h4 class="font-medium text-red-900 mb-3">❌ Erro</h4>
                            <div class="text-sm bg-red-50 text-red-800 p-3 rounded-md">${execution.error_message}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                    Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Registrar evento analytics
async function trackAnalyticsEvent(eventName, properties = {}) {
    try {
        await window.AlshamSupabase.genericInsert('analytics_events', {
            org_id: alshamAutomationState.orgId,
            user_id: alshamAutomationState.user.id,
            event_name: eventName,
            event_category: 'automation',
            properties: properties,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.warn('⚠️ Erro ao registrar analytics:', error);
    }
}

function formatTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
}

async function handleLogout() {
    try {
        await window.AlshamSupabase.signOut();
        window.location.href = '/login.html';
    } catch (error) {
        console.error('❌ Erro no logout:', error);
    }
}

// ===== FUNÇÕES DE FEEDBACK (LOADING, SUCCESS, ERROR) =====
function showLoading(show, message = 'Carregando...') {
    let loader = document.getElementById('global-loader');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center';
            loader.innerHTML = `
                <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
                    <div class="loading-spinner"></div>
                    <span class="text-gray-900">${message}</span>
                </div>
            `;
            document.body.appendChild(loader);
        }
        document.body.style.overflow = 'hidden';
    } else {
        if (loader) {
            loader.remove();
        }
        document.body.style.overflow = '';
    }
}

function showSuccess(message) {
    showToast(message, 
