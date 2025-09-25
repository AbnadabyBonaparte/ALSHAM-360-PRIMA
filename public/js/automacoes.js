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
    executionStatus: [
        { value: 'pending', label: 'Pendente', color: 'yellow', icon: '⏳' },
        { value: 'running', label: 'Executando', color: 'blue', icon: '🔄' },
        { value: 'success', label: 'Sucesso', color: 'green', icon: '✅' },
        { value: 'failed', label: 'Falhou', color: 'red', icon: '❌' },
        { value: 'cancelled', label: 'Cancelado', color: 'gray', icon: '⏹️' }
    ],
    integrations: {
        n8n: { name: 'N8N', icon: '🔧', description: 'Workflows avançados com N8N', webhookUrl: '/api/webhooks/n8n' },
        make: { name: 'Make.com', icon: '🎛️', description: 'Automação visual com Make', webhookUrl: '/api/webhooks/make' },
        zapier: { name: 'Zapier', icon: '⚡', description: 'Conecte 5000+ apps', webhookUrl: '/api/webhooks/zapier' }
    },
    realtime: { enabled: true, refreshInterval: 10000 }
};

// ===== ESTADO GLOBAL =====
const alshamAutomationState = {
    user: null,
    orgId: null,
    automationRules: [],
    executionHistory: [],
    logs: [],
    executionStats: {},
    performanceMetrics: {},
    charts: {},
    currentModal: null,
    isLoading: false,
    filters: { status: '', category: '', dateRange: '', search: '' },
    pagination: { current: 1, perPage: 20, total: 0 },
    subscriptions: [],
    lastUpdate: null
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async function() {
    try {
        showLoading(true, '🤖 Carregando Sistema de Automações...');
        await authenticateUser();
        await loadAutomationData();
        setupAutomationInterface();
        setupRealtimeSubscriptions();
        showLoading(false);
        showSuccess('🎉 Sistema de Automações carregado!');
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showLoading(false);
        showError('Erro ao carregar sistema de automações');
    }
});

// ===== [restante do código permanece igual ao que você colou até refreshData()] =====

// ===== FUNÇÕES DE FEEDBACK (TOASTS GLOBAIS) =====
function showToast(message, type = 'info') {
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-600',
        info: 'bg-blue-600'
    };
    const div = document.createElement('div');
    div.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${colors[type]}`;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

function showSuccess(msg) { showToast(msg, 'success'); }
function showError(msg) { showToast(msg, 'error'); }
function showWarning(msg) { showToast(msg, 'warning'); }
function showInfo(msg) { showToast(msg, 'info'); }

// ===== EXPORTS =====
const AutomationSystem = {
    getState: () => alshamAutomationState,
    refresh: refreshData,
    createRule: openRuleModal,
    deleteRule,
    toggleRule,
    integrations: ALSHAM_AUTOMATION_CONFIG.integrations,
    version: ALSHAM_AUTOMATION_CONFIG.version
};

export default AutomationSystem;
window.AutomationSystem = AutomationSystem;
console.log('🤖 ALSHAM 360° PRIMA Automations v1.0.0 carregado - PRODUÇÃO');
