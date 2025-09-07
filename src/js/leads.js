// ALSHAM 360° PRIMA - Sistema de Leads Ultimate Fusion 10/10
// Combina a estrutura limpa do código atual com interface premium e recursos avançados

import {
    getCurrentUser,
    getLeads,
    createLead,
    updateLead,
    deleteLead
} from '../lib/supabase.js';

// ===== ESTADO GLOBAL =====
const leadsState = {
    currentOrgId: null,
    userProfile: null,
    allLeads: [],
    filteredLeads: [],
    selectedLeads: [],
    currentView: 'table', // table, grid, kanban
    editingLead: null,
    filters: {
        search: '',
        status: '',
        period: '',
        priority: '',
        assignee: ''
    },
    sorting: {
        field: 'created_at',
        direction: 'desc'
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 0
    },
    kpis: {
        total: 0,
        newToday: 0,
        qualified: 0,
        converted: 0,
        conversionRate: 0,
        avgValue: 0,
        totalValue: 0
    },
    isLoading: false,
    bulkActionMode: false
};

// ===== CONFIGURAÇÕES =====
const config = {
    statusOptions: [
        { value: 'new', label: 'Novo', color: 'blue', icon: '🆕' },
        { value: 'contacted', label: 'Contatado', color: 'yellow', icon: '📞' },
        { value: 'qualified', label: 'Qualificado', color: 'purple', icon: '✅' },
        { value: 'proposal', label: 'Proposta', color: 'orange', icon: '📋' },
        { value: 'converted', label: 'Convertido', color: 'green', icon: '💰' },
        { value: 'lost', label: 'Perdido', color: 'red', icon: '❌' }
    ],
    priorityOptions: [
        { value: 'low', label: 'Baixa', color: 'gray' },
        { value: 'medium', label: 'Média', color: 'yellow' },
        { value: 'high', label: 'Alta', color: 'orange' },
        { value: 'urgent', label: 'Urgente', color: 'red' }
    ]
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeLeadsPage);

async function initializeLeadsPage() {
    try {
        showLoading(true, 'Inicializando sistema de leads...');
        
        // Verifica usuário e perfil
        const { user, profile } = await getCurrentUser();
        if (!user || !profile) {
            window.location.href = '/login.html';
            return;
        }
        
        leadsState.currentOrgId = profile.org_id;
        leadsState.userProfile = profile;
        
        updateUserInfo(profile);
        setupEventListeners();
        await loadLeads();
        
        showLoading(false);
        showSuccess('Sistema de leads carregado com sucesso!');
        console.log('👥 Sistema de leads Ultimate Fusion inicializado');
        
    } catch (err) {
        showError('Erro ao carregar usuário ou leads: ' + err.message);
        console.error(err);
        showLoading(false);
        loadDemoData();
    }
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function setupEventListeners() {
    // Botões principais
    document.getElementById('new-lead-btn')?.addEventListener('click', openNewLeadModal);
    document.getElementById('empty-new-lead-btn')?.addEventListener('click', openNewLeadModal);
    
    // Modal
    document.getElementById('close-modal')?.addEventListener('click', closeModal);
    document.getElementById('cancel-lead')?.addEventListener('click', closeModal);
    document.getElementById('lead-form')?.addEventListener('submit', handleLeadSubmit);
    document.getElementById('lead-modal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    // Filtros e busca
    document.getElementById('search-input')?.addEventListener('input', debounce(applyFilters, 200));
    document.getElementById('status-filter')?.addEventListener('change', applyFilters);
    document.getElementById('period-filter')?.addEventListener('change', applyFilters);
    document.getElementById('priority-filter')?.addEventListener('change', applyFilters);
    document.getElementById('clear-filters')?.addEventListener('click', clearFilters);
    
    // Visualizações
    document.getElementById('view-table')?.addEventListener('click', () => switchView('table'));
    document.getElementById('view-grid')?.addEventListener('click', () => switchView('grid'));
    document.getElementById('view-kanban')?.addEventListener('click', () => switchView('kanban'));
    
    // Ações em massa
    document.getElementById('select-all')?.addEventListener('change', handleSelectAll);
    document.getElementById('bulk-delete')?.addEventListener('click', handleBulkDelete);
    document.getElementById('bulk-update-status')?.addEventListener('click', handleBulkUpdateStatus);
    
    // Export/Import
    document.getElementById('export-leads')?.addEventListener('click', exportLeads);
    document.getElementById('import-leads')?.addEventListener('click', importLeads);
}

// ===== CARREGAMENTO DE DADOS =====
async function loadLeads() {
    try {
        leadsState.isLoading = true;
        showLoading(true, 'Carregando leads...');
        
        const { data, error } = await getLeads(leadsState.currentOrgId);
        if (error) throw error;
        
        leadsState.allLeads = data || [];
        leadsState.filteredLeads = [...leadsState.allLeads];
        
        calculateKPIs();
        renderCurrentView();
        updateLeadsCount();
        updateKPICards();
        
    } catch (err) {
        showError('Erro ao carregar leads: ' + err.message);
        console.error(err);
        loadDemoData();
    } finally {
        leadsState.isLoading = false;
        showLoading(false);
    }
}

function loadDemoData() {
    leadsState.allLeads = [
        {
            id: '1',
            name: 'Maria Silva Entrepreneurs',
            email: 'maria.silva@techcorp.com.br',
            phone: '+55 11 99999-1111',
            company: 'Tech Corporation Brasil',
            position: 'Diretora de TI',
            status: 'qualified',
            priority: 'high',
            value: 45000,
            notes: 'Interessada em migração para cloud. Orçamento pré-aprovado de R$ 50k.',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            assignee: 'João Santos',
            source: 'website',
            score: 8.5
        },
        {
            id: '2',
            name: 'Pedro Costa Innovation',
            email: 'pedro@inovastartup.com',
            phone: '+55 11 88888-2222',
            company: 'Inova Startup Ltda',
            position: 'CEO & Founder',
            status: 'new',
            priority: 'medium',
            value: 25000,
            notes: 'Startup em crescimento rápido. Precisa escalar operações.',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            assignee: 'Ana Oliveira',
            source: 'referral',
            score: 7.2
        },
        {
            id: '3',
            name: 'Ana Rodrigues Excellence',
            email: 'ana.rodrigues@megacorp.com.br',
            phone: '+55 11 77777-3333',
            company: 'Mega Corporation',
            position: 'VP of Operations',
            status: 'proposal',
            priority: 'urgent',
            value: 120000,
            notes: 'Proposta enviada. Decisão esperada até sexta-feira.',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            assignee: 'Carlos Silva',
            source: 'cold_call',
            score: 9.1
        },
        {
            id: '4',
            name: 'Roberto Oliveira Scale',
            email: 'roberto@scaletech.io',
            phone: '+55 21 66666-4444',
            company: 'Scale Technologies',
            position: 'CTO',
            status: 'converted',
            priority: 'high',
            value: 85000,
            notes: 'Projeto concluído com sucesso. Cliente satisfeito.',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            assignee: 'Marina Santos',
            source: 'social_media',
            score: 9.8
        },
        {
            id: '5',
            name: 'Juliana Mendes Future',
            email: 'juliana@futuredev.com.br',
            phone: '+55 11 55555-5555',
            company: 'Future Development',
            position: 'Project Manager',
            status: 'contacted',
            priority: 'low',
            value: 15000,
            notes: 'Primeira reunião marcada para próxima semana.',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            assignee: 'Pedro Lima',
            source: 'email_marketing',
            score: 6.4
        }
    ];
    
    leadsState.filteredLeads = [...leadsState.allLeads];
    calculateKPIs();
    renderCurrentView();
    updateLeadsCount();
    updateKPICards();
}

// ===== CÁLCULOS E KPIs =====
function calculateKPIs() {
    const leads = leadsState.allLeads;
    const today = new Date().toDateString();
    
    leadsState.kpis = {
        total: leads.length,
        newToday: leads.filter(l => new Date(l.created_at).toDateString() === today).length,
        qualified: leads.filter(l => ['qualified', 'proposal'].includes(l.status)).length,
        converted: leads.filter(l => l.status === 'converted').length,
        conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length * 100).toFixed(1) : 0,
        avgValue: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.value || 0), 0) / leads.length) : 0,
        totalValue: leads.reduce((sum, l) => sum + (l.value || 0), 0)
    };
}

function updateKPICards() {
    const kpis = leadsState.kpis;
    
    const kpiData = [
        { id: 'total-leads', label: 'Total de Leads', value: kpis.total, icon: '👥', color: 'blue', trend: '+5%' },
        { id: 'new-today', label: 'Novos Hoje', value: kpis.newToday, icon: '🆕', color: 'green', trend: '+12%' },
        { id: 'qualified', label: 'Qualificados', value: kpis.qualified, icon: '✅', color: 'purple', trend: '+8%' },
        { id: 'converted', label: 'Convertidos', value: kpis.converted, icon: '💰', color: 'orange', trend: '+15%' },
        { id: 'conversion-rate', label: 'Taxa Conversão', value: `${kpis.conversionRate}%`, icon: '📈', color: 'red', trend: '+3%' },
        { id: 'avg-value', label: 'Valor Médio', value: formatCurrency(kpis.avgValue), icon: '💎', color: 'pink', trend: '+7%' }
    ];
    
    const container = document.getElementById('kpi-cards');
    if (!container) return;
    
    container.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            ${kpiData.map(kpi => `
                <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-3">
                        <div class="w-10 h-10 bg-${kpi.color}-100 rounded-lg flex items-center justify-center">
                            <span class="text-lg">${kpi.icon}</span>
                        </div>
                        <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">${kpi.trend}</span>
                    </div>
                    <p class="text-2xl font-bold text-gray-900 mb-1">${kpi.value}</p>
                    <p class="text-sm text-gray-600">${kpi.label}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== RENDERIZAÇÃO =====
function renderCurrentView() {
    if (!leadsState.filteredLeads.length) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    switch (leadsState.currentView) {
        case 'table':
            renderTableView();
            break;
        case 'grid':
            renderGridView();
            break;
        case 'kanban':
            renderKanbanView();
            break;
        default:
            renderTableView();
    }
    
    updateViewButtons();
}

function renderTableView() {
    const tbody = document.getElementById('leads-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = leadsState.filteredLeads.map(lead => `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-4">
                <input type="checkbox" class="lead-checkbox rounded border-gray-300" value="${lead.id}">
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-semibold">${getInitials(lead.name)}</span>
                        </div>
                        ${lead.score ? `<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">${lead.score}</div>` : ''}
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${lead.name || 'N/A'}</div>
                        <div class="text-sm text-gray-500">${lead.company || ''}</div>
                        <div class="text-xs text-gray-400">${lead.position || ''}</div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="text-gray-900">${lead.email || 'N/A'}</div>
                <div class="text-sm text-gray-500">${lead.phone || ''}</div>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}">
                        ${getStatusIcon(lead.status)} ${getStatusLabel(lead.status)}
                    </span>
                    ${lead.priority ? `<span class="w-2 h-2 rounded-full bg-${getPriorityColor(lead.priority)}-500"></span>` : ''}
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="font-medium text-gray-900">${formatCurrency(lead.value || 0)}</div>
                <div class="text-sm text-gray-500">${lead.assignee || 'Não atribuído'}</div>
            </td>
            <td class="py-4 px-6">
                <div class="text-gray-600">${formatDate(lead.created_at)}</div>
                <div class="text-xs text-gray-500">${formatTimeAgo(lead.created_at)}</div>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                    <button type="button" class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all" onclick="editLead('${lead.id}')" title="Editar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button type="button" class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all" onclick="contactLead('${lead.id}', 'phone')" title="Ligar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                    </button>
                    <button type="button" class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all" onclick="contactLead('${lead.id}', 'email')" title="Email">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                    <button type="button" class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all" onclick="deleteLeadHandler('${lead.id}')" title="Excluir">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    setupTableCheckboxes();
}

function renderGridView() {
    const grid = document.getElementById('leads-grid');
    if (!grid) return;
    
    grid.innerHTML = leadsState.filteredLeads.map(lead => `
        <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
            <div class="absolute top-4 right-4">
                <input type="checkbox" class="lead-checkbox rounded border-gray-300" value="${lead.id}">
            </div>
            
            <div class="flex items-center justify-between mb-4">
                <div class="relative">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold">${getInitials(lead.name)}</span>
                    </div>
                    ${lead.score ? `<div class="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">${lead.score}</div>` : ''}
                </div>
                <div class="flex items-center space-x-2">
                    ${lead.priority ? `<span class="w-3 h-3 rounded-full bg-${getPriorityColor(lead.priority)}-500"></span>` : ''}
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}">
                        ${getStatusIcon(lead.status)} ${getStatusLabel(lead.status)}
                    </span>
                </div>
            </div>
            
            <div class="mb-4">
                <h3 class="font-semibold text-gray-900 mb-1">${lead.name || 'N/A'}</h3>
                <p class="text-sm text-gray-600">${lead.company || 'Empresa não informada'}</p>
                <p class="text-xs text-gray-500">${lead.position || ''}</p>
                <p class="text-sm text-gray-600 mt-1">${lead.email || ''}</p>
            </div>
            
            <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Valor:</span>
                    <span class="font-semibold text-gray-900">${formatCurrency(lead.value || 0)}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Responsável:</span>
                    <span class="text-gray-900">${lead.assignee || 'Não atribuído'}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Criado:</span>
                    <span class="text-gray-900">${formatDate(lead.created_at)}</span>
                </div>
            </div>
            
            ${lead.notes ? `
                <div class="mb-4">
                    <p class="text-xs text-gray-600 bg-gray-50 p-2 rounded">${lead.notes.substring(0, 100)}${lead.notes.length > 100 ? '...' : ''}</p>
                </div>
            ` : ''}
            
            <div class="flex space-x-2">
                <button type="button" class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" onclick="editLead('${lead.id}')">
                    ✏️ Editar
                </button>
                <button type="button" class="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors" onclick="contactLead('${lead.id}', 'phone')">
                    📞
                </button>
                <button type="button" class="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors" onclick="contactLead('${lead.id}', 'email')">
                    📧
                </button>
            </div>
        </div>
    `).join('');
    
    setupGridCheckboxes();
}

function renderKanbanView() {
    const container = document.getElementById('leads-kanban');
    if (!container) return;
    
    const statusGroups = groupLeadsByStatus();
    
    container.innerHTML = `
        <div class="flex space-x-6 overflow-x-auto pb-6">
            ${config.statusOptions.map(status => `
                <div class="flex-shrink-0 w-80">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div class="p-4 border-b border-gray-200 bg-${status.color}-50">
                            <div class="flex items-center justify-between">
                                <h3 class="font-semibold text-gray-900 flex items-center">
                                    <span class="mr-2">${status.icon}</span>
                                    ${status.label}
                                </h3>
                                <span class="bg-${status.color}-100 text-${status.color}-800 text-xs font-medium px-2 py-1 rounded-full">
                                    ${statusGroups[status.value]?.length || 0}
                                </span>
                            </div>
                        </div>
                        <div class="p-4 space-y-3 max-h-96 overflow-y-auto">
                            ${(statusGroups[status.value] || []).map(lead => renderKanbanCard(lead)).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderKanbanCard(lead) {
    return `
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-all cursor-pointer" onclick="viewLead('${lead.id}')">
            <div class="flex items-start justify-between mb-2">
                <h4 class="font-medium text-gray-900 text-sm">${lead.name}</h4>
                ${lead.priority ? `<span class="w-2 h-2 rounded-full bg-${getPriorityColor(lead.priority)}-500"></span>` : ''}
            </div>
            <p class="text-xs text-gray-600 mb-2">${lead.company || 'Empresa não informada'}</p>
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-900">${formatCurrency(lead.value || 0)}</span>
                ${lead.score ? `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">${lead.score}</span>` : ''}
            </div>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">${lead.assignee || 'Não atribuído'}</span>
                <span class="text-xs text-gray-500">${formatTimeAgo(lead.created_at)}</span>
            </div>
        </div>
    `;
}

function groupLeadsByStatus() {
    const groups = {};
    config.statusOptions.forEach(status => {
        groups[status.value] = [];
    });
    
    leadsState.filteredLeads.forEach(lead => {
        if (groups[lead.status]) {
            groups[lead.status].push(lead);
        }
    });
    
    return groups;
}

// ===== MODAL E FORMULÁRIO =====
function openNewLeadModal() {
    leadsState.editingLead = null;
    document.getElementById('modal-title').textContent = 'Novo Lead';
    document.getElementById('lead-form').reset();
    document.getElementById('lead-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function openEditLeadModal(lead) {
    leadsState.editingLead = lead;
    document.getElementById('modal-title').textContent = 'Editar Lead';
    
    // Preencher formulário
    document.getElementById('lead-name').value = lead.name || '';
    document.getElementById('lead-email').value = lead.email || '';
    document.getElementById('lead-phone').value = lead.phone || '';
    document.getElementById('lead-company').value = lead.company || '';
    document.getElementById('lead-position').value = lead.position || '';
    document.getElementById('lead-status').value = lead.status || 'new';
    document.getElementById('lead-priority').value = lead.priority || 'medium';
    document.getElementById('lead-value').value = lead.value || '';
    document.getElementById('lead-assignee').value = lead.assignee || '';
    document.getElementById('lead-notes').value = lead.notes || '';
    
    document.getElementById('lead-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    document.getElementById('lead-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    leadsState.editingLead = null;
}

async function handleLeadSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('lead-name').value,
        email: document.getElementById('lead-email').value,
        phone: document.getElementById('lead-phone').value,
        company: document.getElementById('lead-company').value,
        position: document.getElementById('lead-position').value,
        status: document.getElementById('lead-status').value,
        priority: document.getElementById('lead-priority').value,
        value: parseFloat(document.getElementById('lead-value').value) || 0,
        assignee: document.getElementById('lead-assignee').value,
        notes: document.getElementById('lead-notes').value
    };
    
    try {
        showLoading(true, leadsState.editingLead ? 'Atualizando lead...' : 'Criando lead...');
        
        if (leadsState.editingLead) {
            const { error } = await updateLead(leadsState.editingLead.id, formData, leadsState.currentOrgId);
            if (error) throw error;
            showSuccess('Lead atualizado com sucesso!');
        } else {
            const { error } = await createLead(formData, leadsState.currentOrgId);
            if (error) throw error;
            showSuccess('Lead criado com sucesso!');
        }
        
        closeModal();
        await loadLeads();
        
    } catch (err) {
        showError('Erro ao salvar lead: ' + err.message);
        console.error(err);
    } finally {
        showLoading(false);
    }
}

// ===== AÇÕES DOS LEADS =====
window.editLead = function(leadId) {
    const lead = leadsState.allLeads.find(l => l.id === leadId);
    if (lead) openEditLeadModal(lead);
};

window.viewLead = function(leadId) {
    const lead = leadsState.allLeads.find(l => l.id === leadId);
    if (lead) {
        showSuccess(`Visualizando ${lead.name}`);
        // Implementar modal de visualização detalhada
    }
};

window.deleteLeadHandler = async function(leadId) {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    
    try {
        showLoading(true, 'Excluindo lead...');
        const { error } = await deleteLead(leadId, leadsState.currentOrgId);
        if (error) throw error;
        showSuccess('Lead excluído com sucesso!');
        await loadLeads();
    } catch (err) {
        showError('Erro ao excluir lead: ' + err.message);
        console.error(err);
    } finally {
        showLoading(false);
    }
};

window.contactLead = function(leadId, method) {
    const lead = leadsState.allLeads.find(l => l.id === leadId);
    if (!lead) return;
    
    if (method === 'phone') {
        if (lead.phone) {
            window.open(`tel:${lead.phone.replace(/\D/g, '')}`);
            showSuccess(`Ligando para ${lead.name}`);
        } else {
            showError('Telefone não cadastrado');
        }
    } else if (method === 'email') {
        if (lead.email) {
            window.open(`mailto:${lead.email}?subject=Contato - ALSHAM 360°&body=Olá ${lead.name}, gostaria de conversar sobre nossa proposta.`);
            showSuccess(`Abrindo email para ${lead.name}`);
        } else {
            showError('Email não cadastrado');
        }
    }
};

// ===== FILTROS E BUSCA =====
function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const periodFilter = document.getElementById('period-filter')?.value || '';
    const priorityFilter = document.getElementById('priority-filter')?.value || '';
    
    leadsState.filteredLeads = leadsState.allLeads.filter(lead => {
        const matchesSearch = !searchTerm ||
            (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
            (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
            (lead.company && lead.company.toLowerCase().includes(searchTerm));
            
        const matchesStatus = !statusFilter || lead.status === statusFilter;
        const matchesPriority = !priorityFilter || lead.priority === priorityFilter;
        const matchesPeriod = !periodFilter || matchesPeriodFilter(lead.created_at, periodFilter);
        
        return matchesSearch && matchesStatus && matchesPriority && matchesPeriod;
    });
    
    renderCurrentView();
    updateLeadsCount();
}

function matchesPeriodFilter(dateString, period) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    
    switch (period) {
        case 'today':
            return date.toDateString() === now.toDateString();
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
        case 'month':
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            const leadQuarter = Math.floor(date.getMonth() / 3);
            return leadQuarter === quarter && date.getFullYear() === now.getFullYear();
        default:
            return true;
    }
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('period-filter').value = '';
    document.getElementById('priority-filter').value = '';
    applyFilters();
}

// ===== VISUALIZAÇÕES =====
function switchView(view) {
    leadsState.currentView = view;
    
    // Esconder todas as views
    document.getElementById('leads-table-view')?.classList.add('hidden');
    document.getElementById('leads-grid-view')?.classList.add('hidden');
    document.getElementById('leads-kanban-view')?.classList.add('hidden');
    
    // Mostrar view ativa
    document.getElementById(`leads-${view}-view`)?.classList.remove('hidden');
    
    renderCurrentView();
}

function updateViewButtons() {
    const buttons = ['view-table', 'view-grid', 'view-kanban'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        
        const view = btnId.split('-')[1];
        const isActive = view === leadsState.currentView;
        
        btn.classList.toggle('text-primary', isActive);
        btn.classList.toggle('bg-primary', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('text-gray-400', !isActive);
        btn.classList.toggle('bg-gray-100', !isActive);
    });
}

// ===== AÇÕES EM MASSA =====
function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.lead-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
    updateBulkActionBar();
}

function updateBulkActionBar() {
    const selectedCheckboxes = document.querySelectorAll('.lead-checkbox:checked');
    const bulkBar = document.getElementById('bulk-action-bar');
    
    if (selectedCheckboxes.length > 0) {
        bulkBar?.classList.remove('hidden');
        const countEl = bulkBar?.querySelector('#selected-count');
        if (countEl) countEl.textContent = selectedCheckboxes.length;
    } else {
        bulkBar?.classList.add('hidden');
    }
}

function setupTableCheckboxes() {
    const checkboxes = document.querySelectorAll('.lead-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActionBar);
    });
}

function setupGridCheckboxes() {
    setupTableCheckboxes(); // Mesma lógica
}

function handleBulkDelete() {
    const selected = Array.from(document.querySelectorAll('.lead-checkbox:checked')).map(cb => cb.value);
    if (selected.length === 0) return;
    
    if (confirm(`Tem certeza que deseja excluir ${selected.length} leads?`)) {
        showSuccess('Função de exclusão em massa em desenvolvimento');
    }
}

function handleBulkUpdateStatus() {
    const selected = Array.from(document.querySelectorAll('.lead-checkbox:checked')).map(cb => cb.value);
    if (selected.length === 0) return;
    
    showSuccess('Função de atualização em massa em desenvolvimento');
}

// ===== IMPORT/EXPORT =====
function exportLeads() {
    const data = leadsState.filteredLeads.map(lead => ({
        Nome: lead.name,
        Email: lead.email,
        Telefone: lead.phone,
        Empresa: lead.company,
        Cargo: lead.position,
        Status: getStatusLabel(lead.status),
        Prioridade: lead.priority,
        Valor: lead.value,
        Responsável: lead.assignee,
        Criado: formatDate(lead.created_at),
        Observações: lead.notes
    }));
    
    const csv = convertToCSV(data);
    downloadCSV(csv, 'leads-alsham.csv');
    showSuccess('Leads exportados com sucesso!');
}

function importLeads() {
    showSuccess('Função de importação em desenvolvimento');
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','));
    return [headers, ...rows].join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ===== FUNÇÕES AUXILIARES =====
function getInitials(name) {
    if (!name) return 'N';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getStatusColor(status) {
    const statusConfig = config.statusOptions.find(s => s.value === status);
    return statusConfig ? `bg-${statusConfig.color}-100 text-${statusConfig.color}-800` : 'bg-gray-100 text-gray-800';
}

function getStatusLabel(status) {
    const statusConfig = config.statusOptions.find(s => s.value === status);
    return statusConfig ? statusConfig.label : 'Novo';
}

function getStatusIcon(status) {
    const statusConfig = config.statusOptions.find(s => s.value === status);
    return statusConfig ? statusConfig.icon : '🆕';
}

function getPriorityColor(priority) {
    const priorityConfig = config.priorityOptions.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : 'gray';
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

function formatTimeAgo(dateString) {
    if (!dateString) return 'N/A';
    
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days}d atrás`;
    if (days < 30) return `${Math.floor(days / 7)}sem atrás`;
    return `${Math.floor(days / 30)}mês atrás`;
}

function updateLeadsCount() {
    const count = leadsState.filteredLeads.length;
    const countEl = document.getElementById('leads-count');
    if (countEl) {
        countEl.textContent = `${count} lead${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
    }
}

function updateUserInfo(profile) {
    if (profile?.full_name) {
        document.querySelectorAll('[data-auth="user-name"]').forEach(el => {
            el.textContent = profile.full_name;
        });
        document.querySelectorAll('[data-auth="user-avatar"]').forEach(el => {
            el.textContent = getInitials(profile.full_name);
        });
    }
}

function showEmptyState() {
    document.getElementById('leads-table-view')?.classList.add('hidden');
    document.getElementById('leads-grid-view')?.classList.add('hidden');
    document.getElementById('leads-kanban-view')?.classList.add('hidden');
    document.getElementById('empty-state')?.classList.remove('hidden');
}

function hideEmptyState() {
    document.getElementById('empty-state')?.classList.add('hidden');
    
    // Mostrar view ativa
    if (leadsState.currentView === 'table') {
        document.getElementById('leads-table-view')?.classList.remove('hidden');
    } else if (leadsState.currentView === 'grid') {
        document.getElementById('leads-grid-view')?.classList.remove('hidden');
    } else if (leadsState.currentView === 'kanban') {
        document.getElementById('leads-kanban-view')?.classList.remove('hidden');
    }
}

function showLoading(show = true, message = 'Carregando...') {
    let loader = document.getElementById('leads-loader');
    if (!loader && show) {
        loader = document.createElement('div');
        loader.id = 'leads-loader';
        loader.className = 'fixed inset-0 bg-white/90 z-50 flex items-center justify-center backdrop-blur-sm';
        loader.innerHTML = `
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-b-4 border-gray-100 mx-auto mb-4"></div>
                <p class="text-gray-600 font-medium">${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }
    
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
        if (show) {
            const messageEl = loader.querySelector('p');
            if (messageEl) messageEl.textContent = message;
        }
    }
}

function showSuccess(message) { showNotification(message, 'success'); }
function showError(message) { showNotification(message, 'error'); }

function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-white'
    };
    
    toast.className = `fixed bottom-4 right-4 ${colors[type]} px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-0`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function debounce(fn, ms = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), ms);
    };
}

// ===== EXPORTS =====
export {
    leadsState,
    loadLeads,
    renderCurrentView
};
