// ALSHAM 360° PRIMA - Leads Real System CORRIGIDO
// Interface premium para gestão completa de leads com CRM avançado

import { 
    getCurrentUser,
    getLeads,
    createLead,
    updateLead,
    deleteLead,
    getLeadById,
    getLeadInteractions,
    createLeadInteraction,
    getLeadSources,
    getLeadTags,
    getUserProfiles
} from '../lib/supabase.js';

// ===== ESTADO GLOBAL =====
const leadsState = {
    user: null,
    currentUserProfile: null,
    orgId: null,
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
    isRefreshing: false,
    error: null,
    bulkActionMode: false,
    editingLead: null,
    leadSources: [],
    leadTags: [],
    teamMembers: [],
    searchTimeout: null
};

// ===== CONFIGURAÇÕES =====
const leadsConfig = {
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
    ],
    // CORRIGIDO: Classes CSS estáticas
    statusStyles: {
        novo: { bg: 'bg-blue-100', text: 'text-blue-800' },
        contatado: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        qualificado: { bg: 'bg-purple-100', text: 'text-purple-800' },
        proposta: { bg: 'bg-orange-100', text: 'text-orange-800' },
        convertido: { bg: 'bg-green-100', text: 'text-green-800' },
        perdido: { bg: 'bg-red-100', text: 'text-red-800' },
        default: { bg: 'bg-gray-100', text: 'text-gray-800' }
    }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeLeadsPage);

async function initializeLeadsPage() {
    try {
        showLoading(true, 'Carregando sistema de leads...');
        
        // CORRIGIDO: Melhor tratamento de autenticação
        try {
            const { user, profile, error } = await getCurrentUser();
            if (error) {
                console.error('Erro de autenticação:', error);
                window.location.href = '/login.html';
                return;
            }
            
            if (!user) {
                console.log('Usuário não autenticado, redirecionando...');
                window.location.href = '/login.html';
                return;
            }
            
            leadsState.user = user;
            leadsState.currentUserProfile = profile;
            leadsState.orgId = profile?.org_id || 'default-org-id';
            
        } catch (authError) {
            console.error('Erro ao verificar autenticação:', authError);
            window.location.href = '/login.html';
            return;
        }
        
        // Carregar dados auxiliares
        await loadAuxiliaryData();
        
        // Carregar leads
        await loadLeads();
        
        // Configurar interface
        setupEventListeners();
        renderInterface();
        
        leadsState.isLoading = false;
        showLoading(false);
        
        console.log('🎯 Sistema de Leads Real inicializado');
        showSuccess('Sistema de leads carregado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar leads:', error);
        leadsState.error = error.message;
        leadsState.isLoading = false;
        showLoading(false);
        showError(`Erro ao carregar leads: ${error.message}`);
        loadDemoData();
    }
}

// ===== CARREGAMENTO DE DADOS =====
async function loadLeads() {
    if (leadsState.isRefreshing) {
        console.log('⏳ Carregamento já em andamento...');
        return;
    }
    
    try {
        leadsState.isRefreshing = true;
        
        const result = await getLeads(leadsState.orgId, {
            limit: 1000 // Carregar todos os leads para filtros locais
        }).catch(err => ({ error: err }));
        
        if (result.error) {
            throw new Error(result.error.message || 'Erro ao carregar leads');
        }
        
        leadsState.leads = Array.isArray(result.data) ? result.data : [];
        leadsState.filteredLeads = [...leadsState.leads];
        
        calculateKPIs();
        applyFiltersAndSorting();
        
        console.log(`✅ ${leadsState.leads.length} leads carregados`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar leads:', error);
        throw error;
    } finally {
        leadsState.isRefreshing = false;
    }
}

async function loadAuxiliaryData() {
    try {
        // CORRIGIDO: Melhor tratamento de Promise.allSettled
        const promises = [
            getLeadSources(leadsState.orgId).catch(err => ({ error: err })),
            getLeadTags(leadsState.orgId).catch(err => ({ error: err })),
            getUserProfiles(leadsState.orgId).catch(err => ({ error: err }))
        ];
        
        const [sourcesResult, tagsResult, teamResult] = await Promise.all(promises);
        
        if (sourcesResult && sourcesResult.data && !sourcesResult.error) {
            leadsState.leadSources = Array.isArray(sourcesResult.data) ? sourcesResult.data : [];
        } else if (sourcesResult?.error) {
            console.warn('Erro ao carregar fontes de leads:', sourcesResult.error);
        }
        
        if (tagsResult && tagsResult.data && !tagsResult.error) {
            leadsState.leadTags = Array.isArray(tagsResult.data) ? tagsResult.data : [];
        } else if (tagsResult?.error) {
            console.warn('Erro ao carregar tags de leads:', tagsResult.error);
        }
        
        if (teamResult && teamResult.data && !teamResult.error) {
            leadsState.teamMembers = Array.isArray(teamResult.data) ? teamResult.data : [];
        } else if (teamResult?.error) {
            console.warn('Erro ao carregar membros da equipe:', teamResult.error);
        }
        
    } catch (error) {
        console.warn('⚠️ Erro ao carregar dados auxiliares:', error);
        // Continua sem dados auxiliares
    }
}

// ===== CÁLCULO DE KPIs =====
function calculateKPIs() {
    const leads = leadsState.leads;
    if (!Array.isArray(leads)) {
        console.warn('Dados de leads inválidos para cálculo de KPIs');
        return;
    }
    
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    leadsState.kpis.total = leads.length;
    
    // Leads de hoje
    leadsState.kpis.newToday = leads.filter(lead => {
        try {
            return new Date(lead.created_at) >= startOfToday;
        } catch (e) {
            return false;
        }
    }).length;
    
    // Leads qualificados
    leadsState.kpis.qualified = leads.filter(lead => 
        lead.status === 'qualificado' || lead.status === 'qualified'
    ).length;
    
    // Leads convertidos
    leadsState.kpis.converted = leads.filter(lead => 
        lead.status === 'convertido' || lead.status === 'converted'
    ).length;
    
    // Taxa de conversão
    leadsState.kpis.conversionRate = leadsState.kpis.total > 0 
        ? ((leadsState.kpis.converted / leadsState.kpis.total) * 100).toFixed(1)
        : 0;
    
    // Valor médio
    const leadsWithValue = leads.filter(lead => {
        const value = parseFloat(lead.value);
        return !isNaN(value) && value > 0;
    });
    
    leadsState.kpis.avgValue = leadsWithValue.length > 0
        ? Math.round(leadsWithValue.reduce((sum, lead) => sum + parseFloat(lead.value), 0) / leadsWithValue.length)
        : 0;
}

// ===== FILTROS E ORDENAÇÃO =====
function applyFiltersAndSorting() {
    let filtered = [...leadsState.leads];
    
    // Aplicar filtros
    if (leadsState.filters.search) {
        const search = leadsState.filters.search.toLowerCase().trim();
        filtered = filtered.filter(lead => {
            const name = (lead.name || '').toLowerCase();
            const email = (lead.email || '').toLowerCase();
            const company = (lead.company || '').toLowerCase();
            
            return name.includes(search) || 
                   email.includes(search) || 
                   company.includes(search);
        });
    }
    
    if (leadsState.filters.status) {
        filtered = filtered.filter(lead => lead.status === leadsState.filters.status);
    }
    
    if (leadsState.filters.priority) {
        filtered = filtered.filter(lead => lead.priority === leadsState.filters.priority);
    }
    
    if (leadsState.filters.source) {
        filtered = filtered.filter(lead => lead.source === leadsState.filters.source);
    }
    
    if (leadsState.filters.assignee) {
        filtered = filtered.filter(lead => lead.assigned_to === leadsState.filters.assignee);
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
        const field = leadsState.sorting.field;
        const direction = leadsState.sorting.direction === 'asc' ? 1 : -1;
        
        let aValue = a[field];
        let bValue = b[field];
        
        // Tratar valores nulos/undefined
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';
        
        // Tratar datas
        if (field.includes('_at') || field === 'created_at') {
            try {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } catch (e) {
                aValue = new Date(0);
                bValue = new Date(0);
            }
        }
        
        // Tratar números
        if (field === 'value') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
        }
        
        // Tratar strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue) * direction;
        }
        
        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
    });
    
    leadsState.filteredLeads = filtered;
    leadsState.pagination.totalItems = filtered.length;
    
    // Resetar para primeira página se necessário
    const maxPage = Math.ceil(leadsState.pagination.totalItems / leadsState.pagination.itemsPerPage) || 1;
    if (leadsState.pagination.currentPage > maxPage) {
        leadsState.pagination.currentPage = 1;
    }
}

// ===== CRUD OPERATIONS =====
async function createNewLead(leadData) {
    try {
        showLoading(true, 'Criando lead...');
        
        const result = await createLead(leadData, leadsState.orgId);
        
        if (result.error) {
            throw new Error(result.error.message || 'Erro ao criar lead');
        }
        
        // Adicionar à lista local
        if (result.data) {
            leadsState.leads.unshift(result.data);
            calculateKPIs();
            applyFiltersAndSorting();
            renderInterface();
        }
        
        showSuccess('Lead criado com sucesso!');
        console.log('✅ Lead criado:', result.data);
        
        return result.data;
        
    } catch (error) {
        console.error('❌ Erro ao criar lead:', error);
        showError(`Erro ao criar lead: ${error.message}`);
        throw error;
    } finally {
        showLoading(false);
    }
}

async function updateExistingLead(leadId, leadData) {
    try {
        showLoading(true, 'Atualizando lead...');
        
        const result = await updateLead(leadId, leadData, leadsState.orgId);
        
        if (result.error) {
            throw new Error(result.error.message || 'Erro ao atualizar lead');
        }
        
        // Atualizar na lista local
        if (result.data) {
            const index = leadsState.leads.findIndex(lead => lead.id === leadId);
            if (index !== -1) {
                leadsState.leads[index] = result.data;
            }
            
            calculateKPIs();
            applyFiltersAndSorting();
            renderInterface();
        }
        
        showSuccess('Lead atualizado com sucesso!');
        console.log('✅ Lead atualizado:', result.data);
        
        return result.data;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar lead:', error);
        showError(`Erro ao atualizar lead: ${error.message}`);
        throw error;
    } finally {
        showLoading(false);
    }
}

async function deleteExistingLead(leadId) {
    try {
        if (!showConfirmDialog('Tem certeza que deseja excluir este lead?')) {
            return;
        }
        
        showLoading(true, 'Excluindo lead...');
        
        const result = await deleteLead(leadId, leadsState.orgId);
        
        if (result.error) {
            throw new Error(result.error.message || 'Erro ao excluir lead');
        }
        
        // Remover da lista local
        leadsState.leads = leadsState.leads.filter(lead => lead.id !== leadId);
        leadsState.selectedLeads = leadsState.selectedLeads.filter(id => id !== leadId);
        
        calculateKPIs();
        applyFiltersAndSorting();
        renderInterface();
        
        showSuccess('Lead excluído com sucesso!');
        console.log('✅ Lead excluído:', leadId);
        
    } catch (error) {
        console.error('❌ Erro ao excluir lead:', error);
        showError(`Erro ao excluir lead: ${error.message}`);
        throw error;
    } finally {
        showLoading(false);
    }
}

// ===== RENDERIZAÇÃO =====
function renderInterface() {
    try {
        renderKPIs();
        renderFilters();
        renderLeadsTable();
        renderPagination();
    } catch (error) {
        console.error('Erro ao renderizar interface:', error);
    }
}

function renderKPIs() {
    const kpisContainer = document.getElementById('kpis-section');
    if (!kpisContainer) return;
    
    kpisContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div class="bg-white rounded-lg p-4 shadow-sm border">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Total</p>
                        <p class="text-2xl font-bold text-gray-900">${leadsState.kpis.total.toLocaleString('pt-BR')}</p>
                    </div>
                    <div class="text-blue-600">👥</div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg p-4 shadow-sm border">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Hoje</p>
                        <p class="text-2xl font-bold text-green-600">${leadsState.kpis.newToday.toLocaleString('pt-BR')}</p>
                    </div>
                    <div class="text-green-600">🆕</div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg p-4 shadow-sm border">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Qualificados</p>
                        <p class="text-2xl font-bold text-purple-600">${leadsState.kpis.qualified.toLocaleString('pt-BR')}</p>
                    </div>
                    <div class="text-purple-600">✅</div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg p-4 shadow-sm border">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Convertidos</p>
                        <p class="text-2xl font-bold text-green-600">${leadsState.kpis.converted.toLocaleString('pt-BR')}</p>
                    </div>
                    <div class="text-green-600">💰</div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg p-4 shadow-sm border">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Taxa Conversão</p>
                        <p class="text-2xl font-bold text-blue-600">${leadsState.kpis.conversionRate}%</p>
                    </div>
                    <div class="text-blue-600">📈</div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg p-4 shadow-sm border">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Valor Médio</p>
                        <p class="text-2xl font-bold text-orange-600">R$ ${leadsState.kpis.avgValue.toLocaleString('pt-BR')}</p>
                    </div>
                    <div class="text-orange-600">💎</div>
                </div>
            </div>
        </div>
    `;
}

function renderFilters() {
    const filtersContainer = document.getElementById('filters-section');
    if (!filtersContainer) return;
    
    filtersContainer.innerHTML = `
        <div class="bg-white rounded-lg p-4 shadow-sm border mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                    <input type="text" 
                           id="search-input"
                           placeholder="Buscar leads..." 
                           value="${escapeHtml(leadsState.filters.search)}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                
                <div>
                    <select id="status-filter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todos os Status</option>
                        ${leadsConfig.statusOptions.map(option => `
                            <option value="${escapeHtml(option.value)}" ${leadsState.filters.status === option.value ? 'selected' : ''}>
                                ${escapeHtml(option.label)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <select id="priority-filter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todas as Prioridades</option>
                        ${leadsConfig.priorityOptions.map(option => `
                            <option value="${escapeHtml(option.value)}" ${leadsState.filters.priority === option.value ? 'selected' : ''}>
                                ${escapeHtml(option.label)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <select id="source-filter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todas as Fontes</option>
                        ${leadsConfig.sourceOptions.map(option => `
                            <option value="${escapeHtml(option.value)}" ${leadsState.filters.source === option.value ? 'selected' : ''}>
                                ${escapeHtml(option.label)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <button id="clear-filters" class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                        Limpar Filtros
                    </button>
                </div>
                
                <div>
                    <button id="new-lead-btn" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        + Novo Lead
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderLeadsTable() {
    const tableContainer = document.getElementById('leads-table-container');
    if (!tableContainer) return;
    
    const startIndex = (leadsState.pagination.currentPage - 1) * leadsState.pagination.itemsPerPage;
    const endIndex = startIndex + leadsState.pagination.itemsPerPage;
    const paginatedLeads = leadsState.filteredLeads.slice(startIndex, endIndex);
    
    if (paginatedLeads.length === 0) {
        tableContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div class="text-gray-400 text-6xl mb-4">🎯</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
                <p class="text-gray-600 mb-4">Não há leads que correspondam aos filtros aplicados.</p>
                <button id="clear-filters-empty" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Limpar Filtros
                </button>
            </div>
        `;
        return;
    }
    
    tableContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input type="checkbox" id="select-all" class="rounded">
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-sort="name">
                                Nome ${getSortIcon('name')}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-sort="email">
                                Email ${getSortIcon('email')}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-sort="status">
                                Status ${getSortIcon('status')}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-sort="source">
                                Fonte ${getSortIcon('source')}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-sort="value">
                                Valor ${getSortIcon('value')}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-sort="created_at">
                                Criado ${getSortIcon('created_at')}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${paginatedLeads.map(lead => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <input type="checkbox" class="lead-checkbox rounded" value="${escapeHtml(lead.id)}">
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="text-sm font-medium text-gray-900">${escapeHtml(lead.name || 'N/A')}</div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">${escapeHtml(lead.email || 'N/A')}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    ${renderStatusBadge(lead.status)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">${escapeHtml(getSourceLabel(lead.source))}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        ${lead.value ? `R$ ${parseFloat(lead.value).toLocaleString('pt-BR')}` : '-'}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        ${formatDate(lead.created_at)}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div class="flex space-x-2">
                                        <button class="text-blue-600 hover:text-blue-900" data-action="edit" data-id="${escapeHtml(lead.id)}">
                                            Editar
                                        </button>
                                        <button class="text-red-600 hover:text-red-900" data-action="delete" data-id="${escapeHtml(lead.id)}">
                                            Excluir
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination-section');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(leadsState.pagination.totalItems / leadsState.pagination.itemsPerPage);
    const currentPage = leadsState.pagination.currentPage;
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    const startItem = ((currentPage - 1) * leadsState.pagination.itemsPerPage) + 1;
    const endItem = Math.min(currentPage * leadsState.pagination.itemsPerPage, leadsState.pagination.totalItems);
    
    paginationContainer.innerHTML = `
        <div class="flex items-center justify-between mt-6">
            <div class="text-sm text-gray-700">
                Mostrando ${startItem.toLocaleString('pt-BR')} a 
                ${endItem.toLocaleString('pt-BR')} 
                de ${leadsState.pagination.totalItems.toLocaleString('pt-BR')} leads
            </div>
            
            <div class="flex space-x-2">
                <button ${currentPage === 1 ? 'disabled' : ''} 
                        class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        data-page="${currentPage - 1}">
                    Anterior
                </button>
                
                ${generatePageButtons(currentPage, totalPages)}
                
                <button ${currentPage === totalPages ? 'disabled' : ''} 
                        class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        data-page="${currentPage + 1}">
                    Próximo
                </button>
            </div>
        </div>
    `;
}

// ===== UTILITÁRIOS =====
// CORRIGIDO: Status badge com classes estáticas
function renderStatusBadge(status) {
    const statusConfig = leadsConfig.statusOptions.find(s => s.value === status) || 
                        { label: status || 'N/A', color: 'gray', icon: '❓' };
    
    const styles = leadsConfig.statusStyles[status] || leadsConfig.statusStyles.default;
    
    return `
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}">
            <span class="mr-1">${statusConfig.icon}</span>
            ${escapeHtml(statusConfig.label)}
        </span>
    `;
}

function getSourceLabel(source) {
    const sourceConfig = leadsConfig.sourceOptions.find(s => s.value === source);
    return sourceConfig ? `${sourceConfig.icon} ${sourceConfig.label}` : (source || 'N/A');
}

function getSortIcon(field) {
    if (leadsState.sorting.field !== field) return '';
    return leadsState.sorting.direction === 'asc' ? '▲' : '▼';
}

function generatePageButtons(currentPage, totalPages) {
    const buttons = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let page = startPage; page <= endPage; page++) {
        const isActive = page === currentPage;
        buttons.push(`
            <button class="px-3 py-2 text-sm ${isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 rounded-md hover:bg-gray-50"
                    data-page="${page}">
                ${page}
            </button>
        `);
    }
    
    return buttons.join('');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    } catch (error) {
        console.warn('Erro ao formatar data:', error);
        return 'Erro';
    }
}

// NOVO: Função para escape HTML
function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// CORRIGIDO: Melhor sistema de notificações
function showLoading(show, message = 'Carregando...') {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        if (show) {
            loadingElement.textContent = message;
            loadingElement.classList.remove('hidden');
        } else {
            loadingElement.classList.add('hidden');
        }
    }
    console.log(show ? `🔄 ${message}` : '✅ Loading complete');
}

function showError(message) {
    console.error('❌', message);
    
    // Tentar usar notificação personalizada primeiro
    const errorElement = document.getElementById('error-notification');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    } else {
        // Fallback para alert apenas se não houver elemento de notificação
        alert(`Erro: ${message}`);
    }
}

function showSuccess(message) {
    console.log('✅', message);
    
    // Tentar usar notificação personalizada primeiro
    const successElement = document.getElementById('success-notification');
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
        setTimeout(() => {
            successElement.classList.add('hidden');
        }, 3000);
    }
}

function showConfirmDialog(message) {
    // Melhor seria implementar um modal customizado
    return confirm(message);
}

// NOVO: Debounce para busca
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

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // CORRIGIDO: Busca com debounce
    document.addEventListener('input', (e) => {
        if (e.target.id === 'search-input') {
            if (leadsState.searchTimeout) {
                clearTimeout(leadsState.searchTimeout);
            }
            
            leadsState.searchTimeout = setTimeout(() => {
                leadsState.filters.search = e.target.value;
                leadsState.pagination.currentPage = 1; // Reset para primeira página
                applyFiltersAndSorting();
                renderInterface();
            }, 300);
        }
    });
    
    document.addEventListener('change', (e) => {
        if (e.target.id === 'status-filter') {
            leadsState.filters.status = e.target.value;
            leadsState.pagination.currentPage = 1;
            applyFiltersAndSorting();
            renderInterface();
        }
        
        if (e.target.id === 'priority-filter') {
            leadsState.filters.priority = e.target.value;
            leadsState.pagination.currentPage = 1;
            applyFiltersAndSorting();
            renderInterface();
        }
        
        if (e.target.id === 'source-filter') {
            leadsState.filters.source = e.target.value;
            leadsState.pagination.currentPage = 1;
            applyFiltersAndSorting();
            renderInterface();
        }
    });
    
    // Botões
    document.addEventListener('click', (e) => {
        if (e.target.id === 'clear-filters' || e.target.id === 'clear-filters-empty') {
            leadsState.filters = { search: '', status: '', period: '', priority: '', source: '', assignee: '' };
            leadsState.pagination.currentPage = 1;
            applyFiltersAndSorting();
            renderInterface();
        }
        
        if (e.target.id === 'new-lead-btn') {
            openLeadModal();
        }
        
        if (e.target.dataset.action === 'edit') {
            editLead(e.target.dataset.id);
        }
        
        if (e.target.dataset.action === 'delete') {
            deleteExistingLead(e.target.dataset.id);
        }
        
        if (e.target.dataset.page) {
            const page = parseInt(e.target.dataset.page);
            if (page > 0) {
                leadsState.pagination.currentPage = page;
                renderInterface();
            }
        }
    });
    
    // Ordenação
    document.addEventListener('click', (e) => {
        if (e.target.dataset.sort) {
            const field = e.target.dataset.sort;
            if (leadsState.sorting.field === field) {
                leadsState.sorting.direction = leadsState.sorting.direction === 'asc' ? 'desc' : 'asc';
            } else {
                leadsState.sorting.field = field;
                leadsState.sorting.direction = 'asc';
            }
            applyFiltersAndSorting();
            renderInterface();
        }
    });
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (leadsState.searchTimeout) {
            clearTimeout(leadsState.searchTimeout);
        }
    });
}

// ===== MODAL DE LEAD =====
function openLeadModal(leadId = null) {
    // Implementar modal de criação/edição de lead
    console.log('📝 Abrindo modal de lead:', leadId);
    showSuccess('Modal de lead em desenvolvimento');
}

function editLead(leadId) {
    // Implementar edição de lead
    console.log('✏️ Editando lead:', leadId);
    openLeadModal(leadId);
}

// ===== DADOS DEMO =====
function loadDemoData() {
    console.log('🎯 Carregando dados demo de leads...');
    
    leadsState.leads = [
        {
            id: '1',
            name: 'João Silva',
            email: 'joao@exemplo.com',
            status: 'novo',
            source: 'website',
            value: 5000,
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Maria Santos',
            email: 'maria@exemplo.com',
            status: 'qualificado',
            source: 'social_media',
            value: 7500,
            created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '3',
            name: 'Carlos Oliveira',
            email: 'carlos@exemplo.com',
            status: 'convertido',
            source: 'referral',
            value: 12000,
            created_at: new Date(Date.now() - 172800000).toISOString()
        }
    ];
    
    leadsState.filteredLeads = [...leadsState.leads];
    calculateKPIs();
    renderInterface();
    showSuccess('Dados demo carregados');
}

// ===== API PÚBLICA =====
window.leadsReal = {
    refresh: loadLeads,
    getState: () => ({ ...leadsState }),
    createLead: createNewLead,
    updateLead: updateExistingLead,
    deleteLead: deleteExistingLead
};

console.log('🎯 Leads Real module loaded');
