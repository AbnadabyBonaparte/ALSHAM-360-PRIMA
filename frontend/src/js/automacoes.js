import { supabase } from '../lib/supabase.js';

// Estado da aplicação
let automations = [];
let executionHistory = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeAutomationsPage();
});

async function initializeAutomationsPage() {
    try {
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '../pages/login.html';
            return;
        }

        // Carregar dados
        await loadAutomations();
        loadExecutionHistory();
        
    } catch (error) {
        console.error('Erro ao inicializar página de automações:', error);
        showNotification('Erro ao carregar dados', 'error');
    }
}

async function loadAutomations() {
    try {
        // Tentar carregar do Supabase
        const { data: automationRules, error } = await supabase
            .from('automation_rules')
            .select('*')
            .eq('is_active', true);

        if (error) throw error;

        automations = automationRules || [];
        
        // Se não houver dados, usar dados mockados
        if (automations.length === 0) {
            loadMockAutomations();
        }
        
    } catch (error) {
        console.error('Erro ao carregar automações:', error);
        loadMockAutomations();
    }
}

function loadMockAutomations() {
    automations = [
        {
            id: 'welcome-sequence',
            name: 'Sequência de Boas-vindas',
            description: 'Envia e-mails automáticos para novos leads',
            trigger_event: 'lead_created',
            is_active: true,
            executions_today: 247,
            last_execution: new Date(Date.now() - 2 * 60 * 1000), // 2 min atrás
            success_rate: 98.5
        },
        {
            id: 'auto-qualification',
            name: 'Qualificação Automática',
            description: 'Qualifica leads baseado em critérios pré-definidos',
            trigger_event: 'lead_updated',
            is_active: true,
            executions_today: 89,
            last_execution: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
            success_rate: 94.2
        },
        {
            id: 'weekly-report',
            name: 'Relatório Semanal',
            description: 'Gera e envia relatórios semanais automaticamente',
            trigger_event: 'scheduled',
            is_active: true,
            executions_today: 0,
            last_execution: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
            success_rate: 100
        }
    ];
}

function loadExecutionHistory() {
    // Dados mockados para histórico de execuções
    const mockHistory = [
        {
            automation: 'Sequência de Boas-vindas',
            trigger: 'Novo lead: Maria Silva',
            status: 'success',
            execution_time: new Date(Date.now() - 2 * 60 * 1000),
            result: 'E-mail enviado com sucesso'
        },
        {
            automation: 'Qualificação Automática',
            trigger: 'Lead atualizado: João Santos',
            status: 'success',
            execution_time: new Date(Date.now() - 5 * 60 * 1000),
            result: 'Lead qualificado automaticamente'
        },
        {
            automation: 'Sequência de Boas-vindas',
            trigger: 'Novo lead: Pedro Costa',
            status: 'success',
            execution_time: new Date(Date.now() - 8 * 60 * 1000),
            result: 'E-mail enviado com sucesso'
        },
        {
            automation: 'Follow-up Automático',
            trigger: 'Proposta enviada: Ana Oliveira',
            status: 'failed',
            execution_time: new Date(Date.now() - 15 * 60 * 1000),
            result: 'Erro: E-mail inválido'
        },
        {
            automation: 'Qualificação Automática',
            trigger: 'Lead atualizado: Carlos Mendes',
            status: 'success',
            execution_time: new Date(Date.now() - 20 * 60 * 1000),
            result: 'Lead qualificado automaticamente'
        }
    ];

    renderExecutionHistory(mockHistory);
}

function renderExecutionHistory(history) {
    const tableBody = document.getElementById('execution-history');
    if (!tableBody) return;

    tableBody.innerHTML = history.map(execution => `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-4">
                <span class="font-medium text-gray-900">${execution.automation}</span>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-700">${execution.trigger}</span>
            </td>
            <td class="py-4 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}">
                    ${getStatusText(execution.status)}
                </span>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-600 text-sm">${formatDateTime(execution.execution_time)}</span>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-700 text-sm">${execution.result}</span>
            </td>
        </tr>
    `).join('');
}

// Funções auxiliares
function getStatusColor(status) {
    const colors = {
        'success': 'bg-green-100 text-green-800',
        'failed': 'bg-red-100 text-red-800',
        'running': 'bg-blue-100 text-blue-800',
        'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const texts = {
        'success': 'Sucesso',
        'failed': 'Falhou',
        'running': 'Executando',
        'pending': 'Pendente'
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

function showNotification(message, type = 'info') {
    // Implementar sistema de notificações
    console.log(`${type}: ${message}`);
}

// Funções globais
window.createNewAutomation = function() {
    showNotification('Abrindo criador de automação...', 'info');
    // Implementar criador de automação
};

window.openTemplateLibrary = function() {
    showNotification('Abrindo biblioteca de templates...', 'info');
    // Implementar biblioteca de templates
};

window.syncAutomations = function() {
    showNotification('Sincronizando automações...', 'info');
    loadAutomations();
    loadExecutionHistory();
};

window.viewAutomationStats = function(automationId) {
    showNotification(`Visualizando estatísticas da automação: ${automationId}`, 'info');
    // Implementar visualização de estatísticas
};

window.editAutomation = function(automationId) {
    showNotification(`Editando automação: ${automationId}`, 'info');
    // Implementar edição de automação
};

window.toggleAutomation = function(automationId) {
    const automation = automations.find(a => a.id === automationId);
    if (automation) {
        automation.is_active = !automation.is_active;
        const status = automation.is_active ? 'ativada' : 'pausada';
        showNotification(`Automação ${status} com sucesso!`, 'success');
    }
};

window.useTemplate = function(templateId) {
    showNotification(`Usando template: ${templateId}`, 'info');
    // Implementar uso de template
};

window.createAutomation = function() {
    showNotification('Criando nova automação...', 'info');
    // Implementar criação de automação personalizada
};

window.viewAllTemplates = function() {
    showNotification('Visualizando todos os templates...', 'info');
    // Implementar visualização de todos os templates
};

