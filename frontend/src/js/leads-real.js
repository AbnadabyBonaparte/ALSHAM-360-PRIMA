// ALSHAM 360° PRIMA - Sistema de Leads Ultimate 10/10
// Interface premium para gestão completa de leads com CRM avançado

import { supabase } from '../lib/supabase.js';

// ===== ESTADO GLOBAL =====
const leadsState = {
    user: null,
    currentUserProfile: null,
    leads: [],
    filteredLeads: [],
    selectedLeads: [],
    currentView: 'table', // table, grid, kanban
    filters: {
        search: '',
        status: '',
        period: '',
        priority: '',
        source: '',
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
        avgValue: 0
    },
    isLoading: false,
    error: null,
    bulkActionMode: false
};

// ===== CONFIGURAÇÕES =====
const leadsConfig = {
    tableName: 'leads_crm',
    statusOptions: [
        { value: 'novo', label: 'Novo', color: 'blue', icon: '🆕' },
        { value: 'contatado', label: 'Contatado', color: 'yellow', icon: '📞' },
        { value: 'qualificado', label: 'Qualificado', color: 'purple', icon: '✅' },
        { value: 'proposta', label: 'Proposta', color: 'orange', icon: '📋' },
        { value: 'convertido', label: 'Convertido', color: 'green', icon: '💰' },
        { value: 'perdido', label: 'Perdido', color: 'red', icon: '❌' }
    ],
    priorityOptions: [
        { value: 'baixa', label: 'Baixa', color: 'gray' },
        { value: 'media', label: 'Média', color: 'yellow' },
        { value: 'alta', label: 'Alta', color: 'orange' },
        { value: 'urgente', label: 'Urgente', color: 'red' }
    ],
    sourceOptions: [
        { value: 'website', label: 'Website', icon: '🌐' },
        { value: 'social_media', label: 'Redes Sociais', icon: '📱' },
        { value: 'email_marketing', label: 'Email Marketing', icon: '📧' },
        { value: 'referral', label: 'Indicação', icon: '👥' },
        { value: 'cold_call', label: 'Cold Call', icon: '☎️' },
        { value: 'event', label: 'Evento', icon: '🎯' },
        { value: 'other', label: 'Outro', icon: '📌' }
    ]
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeLeadsPage);

async function initializeLeadsPage() {
    try {
        showLoading(true, 'Carregando sistema de leads...');
        
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/login.html';
            return;
        }
        
        leadsState.user = user;
        
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('org_id, full_name')
            .eq('user_id', user.id)
            .single();
            
        if (profileError || !profile) {
            throw new Error('Perfil ou organização do usuário não encontrada.');
        }
        
        leadsState.currentUserProfile = profile;
        
        // Carregar dados iniciais
        await Promise.all([
            loadLeads(),
            loadKPIs()
        ]);
        
        setupUI();
        setupEventListeners();
        setupRealTimeUpdates();
        
        showLoading(false);
        showToast('Sistema de leads carregado com sucesso!', 'success');
        console.log('👥 Sistema de leads Ultimate inicializado');
        
    } catch (error) {
        console.error('Erro ao inicializar sistema de leads:', error);
        leadsState.error = error.message;
        showLoading(false);
        showToast('Erro ao carregar sistema de leads: ' + error.message, 'error');
        loadDemoData();
    }
}

// ===== CARREGAMENTO DE DADOS =====
async function loadLeads() {
    try {
        leadsState.isLoading = true;
        
        let query = supabase
            .from(leadsConfig.tableName)
            .select('*')
            .eq('org_id', leadsState.currentUserProfile.org_id);
        
        // Aplicar filtros
        query = applyFilters(query);
        
        // Aplicar ordenação
        query = query.order(leadsState.sorting.field, { 
            ascending: leadsState.sorting.direction === 'asc' 
        });
        
        // Aplicar paginação
        const from = (leadsState.pagination.currentPage - 1) * leadsState.pagination.itemsPerPage;
        const to = from + leadsState.pagination.itemsPerPage - 1;
        query = query.range(from, to);
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        leadsState.leads = data || [];
        leadsState.filteredLeads = leadsState.leads;
        leadsState.pagination.totalItems = count || 0;
        
        renderCurrentView();
        updatePagination();
        
    } catch (error) {
        console.error('Erro ao carregar leads:', error);
        throw error;
    } finally {
        leadsState.isLoading = false;
    }
}

async function loadKPIs() {
    try {
        // Carregar estatísticas dos leads
        const { data: stats, error } = await supabase
            .rpc('get_leads_kpis', { p_org_id: leadsState.currentUserProfile.org_id });
            
        if (error) throw error;
        
        if (stats && stats.length > 0) {
            leadsState.kpis = stats[0];
        } else {
            calculateDemoKPIs();
        }
        
        updateKPICards();
        
    } catch (error) {
        console.error('Erro ao carregar KPIs:', error);
        calculateDemoKPIs();
        updateKPICards();
    }
}

function applyFilters(query) {
    const { filters } = leadsState;
    
    if (filters.status) {
        query = query.eq('status', filters.status);
    }
    
    if (filters.search) {
        query = query.or(`nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%,empresa.ilike.%${filters.search}%`);
    }
    
    if (filters.priority) {
        query = query.eq('prioridade', filters.priority);
    }
    
    if (filters.source) {
        query = query.eq('origem', filters.source);
    }
    
    if (filters.assignee) {
        query = query.eq('responsavel', filters.assignee);
    }
    
    if (filters.period) {
        const periodFilter = getPeriodFilter(filters.period);
        if (periodFilter) {
            query = query.gte('created_at', periodFilter.toISOString());
        }
    }
    
    return query;
}

function getPeriodFilter(period) {
    const now = new Date();
    
    switch (period) {
        case 'today':
            return new Date(now.setHours(0, 0, 0, 0));
        case 'week':
            return new Date(now.setDate(now.getDate() - 7));
        case 'month':
            return new Date(now.setDate(now.getDate() - 30));
        case 'quarter':
            return new Date(now.setDate(now.getDate() - 90));
        case 'year':
            return new Date(now.setFullYear(now.getFullYear() - 1));
        default:
            return null;
    }
}

// ===== DADOS DEMO =====
function loadDemoData() {
    leadsState.leads = [
        {
            id: '1',
            nome: 'Maria Silva',
            email: 'maria.silva@empresa.com',
            telefone: '+55 11 99999-1111',
            empresa: 'Tech Solutions Ltda',
            cargo: 'Diretora de TI',
            status: 'qualificado',
            prioridade: 'alta',
            origem: 'website',
            valor_negocio: 25000,
            responsavel: 'João Santos',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            ultima_interacao: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            score_ia: 8.5,
            observacoes: 'Interesse em migração para cloud. Orçamento aprovado.'
        },
        {
            id: '2',
            nome: 'Pedro Costa',
            email: 'pedro@startup.com.br',
            telefone: '+55 11 88888-2222',
            empresa: 'Startup Inovadora',
            cargo: 'CEO',
            status: 'novo',
            prioridade: 'media',
            origem: 'social_media',
            valor_negocio: 15000,
            responsavel: 'Ana Oliveira',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            ultima_interacao: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            score_ia: 7.2,
            observacoes: 'Startup em crescimento. Precisa de solução escalável.'
        },
        {
            id: '3',
            nome: 'Ana Rodrigues',
            email: 'ana.rodrigues@corp.com',
            telefone: '+55 11 77777-3333',
            empresa: 'Corporação Nacional',
            cargo: 'Gerente de Compras',
            status: 'proposta',
            prioridade: 'urgente',
            origem: 'referral',
            valor_negocio: 45000,
            responsavel: 'Carlos Silva',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            ultima_interacao: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            score_ia: 9.1,
            observacoes: 'Proposta enviada. Aguardando aprovação da diretoria.'
        }
    ];
    
    leadsState.filteredLeads = leadsState.leads;
    calculateDemoKPIs();
    renderCurrentView();
    updateKPICards();
}

function calculateDemoKPIs() {
    const leads = leadsState.leads;
    const today = new Date().toDateString();
    
    leadsState.kpis = {
        total: leads.length,
        newToday: leads.filter(l => new Date(l.created_at).toDateString() === today).length,
        qualified: leads.filter(l => l.status === 'qualificado' || l.status === 'proposta').length,
        converted: leads.filter(l => l.status === 'convertido').length,
        conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'convertido').length / leads.length * 100).toFixed(1) : 0,
        avgValue: leads.length > 0 ? (leads.reduce((sum, l) => sum + (l.valor_negocio || 0), 0) / leads.length) : 0
    };
}

// ===== RENDERIZAÇÃO =====
function renderCurrentView() {
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
    updateResultsCount();
}

function renderTableView() {
    const container = document.getElementById('leads-container');
    if (!container) return;
    
    if (leadsState.leads.length === 0) {
        container.innerHTML = renderEmptyState();
        return;
    }
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-3 text-left">
                                <input type="checkbox" id="select-all" class="rounded border-gray-300">
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortBy('nome')">
                                Nome
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortBy('empresa')">
                                Empresa
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortBy('status')">
                                Status
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortBy('prioridade')">
                                Prioridade
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortBy('valor_negocio')">
                                Valor
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortBy('created_at')">
                                Criado
                            </th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${leadsState.leads.map(lead => renderTableRow(lead)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    setupTableEvents();
}

function renderTableRow(lead) {
    const statusConfig = getStatusConfig(lead.status);
    const priorityConfig = getPriorityConfig(lead.prioridade);
    
    return `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-4">
                <input type="checkbox" class="lead-checkbox rounded border-gray-300" value="${lead.id}">
            </td>
            <td class="px-4 py-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span class="text-white font-semibold text-sm">
                            ${(lead.nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${lead.nome}</p>
                        <p class="text-sm text-gray-600">${lead.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4">
                <div>
                    <p class="font-medium text-gray-900">${lead.empresa || '-'}</p>
                    <p class="text-sm text-gray-600">${lead.cargo || '-'}</p>
                </div>
            </td>
            <td class="px-4 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800">
                    <span class="mr-1">${statusConfig.icon}</span>
                    ${statusConfig.label}
                </span>
            </td>
            <td class="px-4 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${priorityConfig.color}-100 text-${priorityConfig.color}-800">
                    ${priorityConfig.label}
                </span>
            </td>
            <td class="px-4 py-4">
                <p class="font-medium text-gray-900">${formatCurrency(lead.valor_negocio)}</p>
                ${lead.score_ia ? `<p class="text-xs text-purple-600">Score IA: ${lead.score_ia}/10</p>` : ''}
            </td>
            <td class="px-4 py-4">
                <p class="text-sm text-gray-900">${formatDate(lead.created_at)}</p>
                <p class="text-xs text-gray-600">${formatTimeAgo(lead.ultima_interacao)}</p>
            </td>
            <td class="px-4 py-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                    <button onclick="viewLead('${lead.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver
                    </button>
                    <button onclick="editLead('${lead.id}')" class="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        Editar
                    </button>
                    <button onclick="showLeadActions('${lead.id}')" class="text-gray-400 hover:text-gray-600">
                        <span class="text-lg">⋮</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderGridView() {
    const container = document.getElementById('leads-container');
    if (!container) return;
    
    if (leadsState.leads.length === 0) {
        container.innerHTML = renderEmptyState();
        return;
    }
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${leadsState.leads.map(lead => renderLeadCard(lead)).join('')}
        </div>
    `;
}

function renderLeadCard(lead) {
    const statusConfig = getStatusConfig(lead.status);
    const priorityConfig = getPriorityConfig(lead.prioridade);
    
    return `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold">
                        ${(lead.nome || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="w-3 h-3 rounded-full bg-${priorityConfig.color}-500"></span>
                    <button onclick="showLeadActions('${lead.id}')" class="text-gray-400 hover:text-gray-600">
                        <span class="text-lg">⋮</span>
                    </button>
                </div>
            </div>
            
            <div class="mb-4">
                <h3 class="font-semibold text-gray-900 mb-1">${lead.nome}</h3>
                <p class="text-sm text-gray-600">${lead.empresa || 'Empresa não informada'}</p>
                <p class="text-xs text-gray-500">${lead.cargo || ''}</p>
            </div>
            
            <div class="mb-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800">
                    <span class="mr-1">${statusConfig.icon}</span>
                    ${statusConfig.label}
                </span>
            </div>
            
            <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Valor:</span>
                    <span class="font-medium text-gray-900">${formatCurrency(lead.valor_negocio)}</span>
                </div>
                ${lead.score_ia ? `
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Score IA:</span>
                        <span class="font-medium text-purple-600">${lead.score_ia}/10</span>
                    </div>
                ` : ''}
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Criado:</span>
                    <span class="text-gray-900">${formatDate(lead.created_at)}</span>
                </div>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="contactLead('${lead.id}', 'phone')" class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    📞 Ligar
                </button>
                <button onclick="contactLead('${lead.id}', 'email')" class="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                    📧 Email
                </button>
            </div>
        </div>
    `;
}

function renderKanbanView() {
    const container = document.getElementById('leads-container');
    if (!container) return;
    
    const statusGroups = groupLeadsByStatus();
    
    container.innerHTML = `
        <div class="flex space-x-6 overflow-x-auto pb-6">
            ${leadsConfig.statusOptions.map(status => `
                <div class="flex-shrink-0 w-80">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div class="p-4 border-b border-gray-200">
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
    const priorityConfig = getPriorityConfig(lead.prioridade);
    
    return `
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-all cursor-pointer" onclick="viewLead('${lead.id}')">
            <div class="flex items-start justify-between mb-2">
                <h4 class="font-medium text-gray-900 text-sm">${lead.nome}</h4>
                <span class="w-2 h-2 rounded-full bg-${priorityConfig.color}-500"></span>
            </div>
            <p class="text-xs text-gray-600 mb-2">${lead.empresa || 'Empresa não informada'}</p>
            <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-900">${formatCurrency(lead.valor_negocio)}</span>
                <span class="text-xs text-gray-500">${formatTimeAgo(lead.created_at)}</span>
            </div>
        </div>
    `;
}

function groupLeadsByStatus() {
    const groups = {};
    leadsConfig.statusOptions.forEach(status => {
        groups[status.value] = [];
    });
    
    leadsState.leads.forEach(lead => {
        if (groups[lead.status]) {
            groups[lead.status].push(lead);
        }
    });
    
    return groups;
}

function renderEmptyState() {
    return `
        <div class="text-center py-16">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-4xl">👥</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum lead encontrado</h3>
            <p class="text-gray-600 mb-8 max-w-md mx-auto">
                ${leadsState.filters.search || Object.values(leadsState.filters).some(f => f) 
                    ? 'Nenhum lead encontrado com os filtros aplicados. Tente ajustar os critérios de busca.'
                    : 'Crie seu primeiro lead para começar a gerenciar seus contatos e oportunidades de vendas.'
                }
            </p>
            <div class="flex gap-4 justify-center">
                <button onclick="openNewLeadModal()" class="btn-primary">
                    Criar Primeiro Lead
                </button>
                ${Object.values(leadsState.filters).some(f => f) ? `
                    <button onclick="clearAllFilters()" class="btn-secondary">
                        Limpar Filtros
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function updateKPICards() {
    const kpis = leadsState.kpis;
    
    const kpiData = [
        { label: 'Total de Leads', value: kpis.total, icon: '👥', color: 'blue' },
        { label: 'Novos Hoje', value: kpis.newToday, icon: '🆕', color: 'green' },
        { label: 'Qualificados', value: kpis.qualified, icon: '✅', color: 'purple' },
        { label: 'Convertidos', value: kpis.converted, icon: '💰', color: 'orange' },
        { label: 'Taxa de Conversão', value: `${kpis.conversionRate}%`, icon: '📈', color: 'red' },
        { label: 'Valor Médio', value: formatCurrency(kpis.avgValue), icon: '💎', color: 'pink' }
    ];
    
    const container = document.getElementById('kpi-cards');
    if (!container) return;
    
    container.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            ${kpiData.map(kpi => `
                <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div class="flex items-center justify-between mb-2">
                        <div class="w-10 h-10 bg-${kpi.color}-100 rounded-lg flex items-center justify-center">
                            <span class="text-lg">${kpi.icon}</span>
                        </div>
                    </div>
                    <p class="text-2xl font-bold text-gray-900">${kpi.value}</p>
                    <p class="text-sm text-gray-600">${kpi.label}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== CONFIGURAÇÃO DA UI =====
function setupUI() {
    setupFilters();
    setupBulkActions();
    setupViewSwitcher();
}

function setupFilters() {
    // Filtro de busca
    const searchInput = document.getElementById('search-filter');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            leadsState.filters.search = e.target.value;
            loadLeads();
        }, 300));
    }
    
    // Filtros de select
    ['status-filter', 'priority-filter', 'source-filter', 'period-filter'].forEach(filterId => {
        const select = document.getElementById(filterId);
        if (select) {
            select.addEventListener('change', (e) => {
                const filterKey = filterId.split('-')[0];
                leadsState.filters[filterKey] = e.target.value;
                loadLeads();
            });
        }
    });
}

function setupBulkActions() {
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.lead-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            updateBulkActionBar();
        });
    }
}

function setupViewSwitcher() {
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const view = e.target.getAttribute('data-view');
            switchView(view);
        });
    });
}

function setupEventListeners() {
    // Event listeners adicionais podem ser configurados aqui
}

function setupTableEvents() {
    // Configurar eventos específicos da tabela
    const leadCheckboxes = document.querySelectorAll('.lead-checkbox');
    leadCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActionBar);
    });
}

function setupRealTimeUpdates() {
    // Configurar atualizações em tempo real via Supabase
    const subscription = supabase
        .channel('leads_realtime')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: leadsConfig.tableName,
            filter: `org_id=eq.${leadsState.currentUserProfile.org_id}`
        }, (payload) => {
            console.log('Atualização em tempo real:', payload);
            loadLeads();
        })
        .subscribe();
    
    // Limpar subscription quando sair da página
    window.addEventListener('beforeunload', () => {
        supabase.removeChannel(subscription);
    });
}

// ===== AÇÕES =====
window.openNewLeadModal = function() {
    showToast('Modal de criação de lead em desenvolvimento', 'info');
};

window.viewLead = function(leadId) {
    const lead = leadsState.leads.find(l => l.id === leadId);
    if (lead) {
        showToast(`Visualizando ${lead.nome}`, 'info');
    }
};

window.editLead = function(leadId) {
    const lead = leadsState.leads.find(l => l.id === leadId);
    if (lead) {
        showToast(`Editando ${lead.nome}`, 'info');
    }
};

window.deleteLead = function(leadId) {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
        showToast('Função de exclusão em desenvolvimento', 'info');
    }
};

window.contactLead = function(leadId, method) {
    const lead = leadsState.leads.find(l => l.id === leadId);
    if (!lead) return;
    
    if (method === 'phone') {
        if (lead.telefone) {
            window.open(`tel:${lead.telefone.replace(/\D/g, '')}`);
            showToast(`Ligando para ${lead.nome}`, 'success');
        } else {
            showToast('Telefone não cadastrado', 'warning');
        }
    } else if (method === 'email') {
        if (lead.email) {
            window.open(`mailto:${lead.email}?subject=Contato - ALSHAM 360°`);
            showToast(`Abrindo email para ${lead.nome}`, 'success');
        } else {
            showToast('Email não cadastrado', 'warning');
        }
    }
};

window.showLeadActions = function(leadId) {
    showToast('Menu de ações em desenvolvimento', 'info');
};

window.switchView = function(view) {
    leadsState.currentView = view;
    renderCurrentView();
};

window.sortBy = function(field) {
    if (leadsState.sorting.field === field) {
        leadsState.sorting.direction = leadsState.sorting.direction === 'asc' ? 'desc' : 'asc';
    } else {
        leadsState.sorting.field = field;
        leadsState.sorting.direction = 'asc';
    }
    loadLeads();
};

window.clearAllFilters = function() {
    leadsState.filters = {
        search: '',
        status: '',
        period: '',
        priority: '',
        source: '',
        assignee: ''
    };
    
    // Limpar campos de filtro
    document.getElementById('search-filter').value = '';
    ['status-filter', 'priority-filter', 'source-filter', 'period-filter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    loadLeads();
};

// ===== FUNÇÕES AUXILIARES =====
function getStatusConfig(status) {
    return leadsConfig.statusOptions.find(s => s.value === status) || leadsConfig.statusOptions[0];
}

function getPriorityConfig(priority) {
    return leadsConfig.priorityOptions.find(p => p.value === priority) || leadsConfig.priorityOptions[1];
}

function formatCurrency(value) {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
}

function formatTimeAgo(date) {
    if (!date) return '-';
    
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

function updateViewButtons() {
    const buttons = document.querySelectorAll('[data-view]');
    buttons.forEach(button => {
        const view = button.getAttribute('data-view');
        const isActive = view === leadsState.currentView;
        
        button.classList.toggle('bg-primary', isActive);
        button.classList.toggle('text-white', isActive);
        button.classList.toggle('bg-gray-100', !isActive);
        button.classList.toggle('text-gray-700', !isActive);
    });
}

function updateResultsCount() {
    const counter = document.getElementById('results-count');
    if (counter) {
        const { currentPage, itemsPerPage, totalItems } = leadsState.pagination;
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        
        counter.textContent = `Mostrando ${start}-${end} de ${totalItems} leads`;
    }
}

function updatePagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const { currentPage, totalItems, itemsPerPage } = leadsState.pagination;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <div class="flex items-center justify-between">
            <button onclick="changePage(${currentPage - 1})" 
                    class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${currentPage === 1 ? 'disabled' : ''}>
                Anterior
            </button>
            
            <span class="text-sm text-gray-700">
                Página ${currentPage} de ${totalPages}
            </span>
            
            <button onclick="changePage(${currentPage + 1})" 
                    class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${currentPage === totalPages ? 'disabled' : ''}>
                Próxima
            </button>
        </div>
    `;
}

function updateBulkActionBar() {
    const selectedCheckboxes = document.querySelectorAll('.lead-checkbox:checked');
    const bulkBar = document.getElementById('bulk-action-bar');
    
    if (selectedCheckboxes.length > 0) {
        if (bulkBar) {
            bulkBar.classList.remove('hidden');
            bulkBar.querySelector('#selected-count').textContent = selectedCheckboxes.length;
        }
    } else {
        if (bulkBar) {
            bulkBar.classList.add('hidden');
        }
    }
}

window.changePage = function(page) {
    const totalPages = Math.ceil(leadsState.pagination.totalItems / leadsState.pagination.itemsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        leadsState.pagination.currentPage = page;
        loadLeads();
    }
};

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

// ===== FUNÇÕES DE UTILIDADE =====
function showLoading(show, message = 'Carregando...') {
    let loader = document.getElementById('leads-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'leads-loader';
        loader.className = 'fixed inset-0 bg-white/90 z-50 flex items-center justify-center backdrop-blur-sm';
        loader.innerHTML = `
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-b-4 border-gray-100 mx-auto mb-4"></div>
                <p class="text-gray-600 font-medium" id="leads-loader-message">${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }
    
    const messageEl = loader.querySelector('#leads-loader-message');
    if (messageEl) messageEl.textContent = message;
    
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

// ===== EXPORTS =====
export {
    leadsState,
    loadLeads,
    renderCurrentView
};
