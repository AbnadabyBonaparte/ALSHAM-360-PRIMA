// ALSHAM 360° PRIMA - Leads Enterprise System V4.1
// Sistema completo de gestão de leads com dados reais do Supabase

/**
 * Dependency validation system
 * @param {string} libName - Nome da biblioteca
 * @param {any} lib - Referência da biblioteca
 * @returns {any} Biblioteca validada
 * @throws {Error} Se a biblioteca não estiver disponível
 */
function requireLib(libName, lib) {
    if (!lib) {
        throw new Error(`❌ Dependência ${libName} não carregada! Verifique se está incluída no HTML.`);
    }
    return lib;
}

/**
 * Validate all required dependencies
 * @returns {Object} Validated dependencies
 */
function validateDependencies() {
    return {
        localStorage: requireLib('Local Storage', window.localStorage),
        sessionStorage: requireLib('Session Storage', window.sessionStorage),
        crypto: requireLib('Web Crypto API', window.crypto)
    };
}

// Importações reais do Supabase
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
    getUserProfiles,
    createAuditLog,
    subscribeToTable,
    healthCheck
} from '../lib/supabase.js';

// ===== ESTADO GLOBAL ENTERPRISE =====
/**
 * @typedef {Object} LeadsState
 * @property {Object|null} user - Usuário atual autenticado
 * @property {Object|null} currentUserProfile - Perfil do usuário atual
 * @property {string|null} orgId - ID da organização
 * @property {Array} leads - Lista completa de leads
 * @property {Array} filteredLeads - Leads filtrados
 * @property {Array} selectedLeads - IDs dos leads selecionados
 * @property {string} currentView - Visualização atual (table, grid, kanban)
 * @property {Object} filters - Filtros aplicados
 * @property {Object} sorting - Configuração de ordenação
 * @property {Object} pagination - Configuração de paginação
 * @property {Object} kpis - Indicadores de performance
 * @property {boolean} isLoading - Estado de carregamento
 * @property {boolean} isRefreshing - Estado de atualização
 * @property {string|null} error - Mensagem de erro atual
 * @property {boolean} bulkActionMode - Modo de ações em lote
 * @property {Object|null} editingLead - Lead sendo editado
 * @property {Array} leadSources - Fontes de leads disponíveis
 * @property {Array} leadTags - Tags disponíveis
 * @property {Array} teamMembers - Membros da equipe
 * @property {number|null} searchTimeout - Timeout da busca
 * @property {Object|null} subscription - Subscription real-time
 */
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
    searchTimeout: null,
    subscription: null
};

// ===== CONFIGURAÇÕES ENTERPRISE =====
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
    // Classes CSS estáticas para evitar problemas de build
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

// ===== INICIALIZAÇÃO ENTERPRISE =====
document.addEventListener('DOMContentLoaded', initializeLeadsPage);

/**
 * Inicializa o sistema de leads com dados reais
 * @returns {Promise<void>}
 */
async function initializeLeadsPage() {
    try {
        // Validar dependências
        validateDependencies();
        
        showLoading(true, 'Inicializando sistema de leads...');
        
        // Verificar saúde da conexão
        const health = await healthCheck().catch(err => ({ error: err }));
        if (health.error) {
            console.warn('⚠️ Problema de conectividade:', health.error);
        }
        
        // Autenticação enterprise
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
            
            // Log de auditoria
            await createAuditLog({
                action: 'leads_page_access',
                user_id: user.id,
                org_id: leadsState.orgId,
                details: { page: 'leads', timestamp: new Date().toISOString() }
            }).catch(err => console.warn('Erro ao criar log de auditoria:', err));
            
        } catch (authError) {
            console.error('Erro ao verificar autenticação:', authError);
            window.location.href = '/login.html';
            return;
        }
        
        // Carregar dados auxiliares
        await loadAuxiliaryData();
        
        // Carregar leads reais
        await loadLeads();
        
        // Configurar real-time subscriptions
        setupRealTimeSubscriptions();
        
        // Configurar interface
        setupEventListeners();
        renderInterface();
        
        leadsState.isLoading = false;
        showLoading(false);
        
        console.log('🎯 Sistema de Leads Enterprise inicializado com sucesso');
        showSuccess('Sistema de leads carregado com dados reais!');
        
    } catch (error) {
        console.error('❌ Erro crítico ao inicializar leads:', error);
        leadsState.error = error.message;
        leadsState.isLoading = false;
        showLoading(false);
        showError(`Erro ao carregar leads: ${error.message}`);
        
        // Fallback para dados demo apenas em caso de erro crítico
        loadDemoData();
    }
}

// ===== CARREGAMENTO DE DADOS REAIS =====
/**
 * Carrega leads reais da tabela leads_crm
 * @returns {Promise<void>}
 */
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
            throw new Error(result.error.message || 'Erro ao carregar leads da tabela leads_crm');
        }
        
        leadsState.leads = Array.isArray(result.data) ? result.data : [];
        leadsState.filteredLeads = [...leadsState.leads];
        
        calculateKPIs();
        applyFiltersAndSorting();
        
        console.log(`✅ ${leadsState.leads.length} leads carregados da tabela leads_crm`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar leads:', error);
        throw error;
    } finally {
        leadsState.isRefreshing = false;
    }
}

/**
 * Carrega dados auxiliares das tabelas relacionadas
 * @returns {Promise<void>}
 */
async function loadAuxiliaryData() {
    try {
        const promises = [
            getLeadSources(leadsState.orgId).catch(err => ({ error: err })),
            getLeadTags(leadsState.orgId).catch(err => ({ error: err })),
            getUserProfiles(leadsState.orgId).catch(err => ({ error: err }))
        ];
        
        const [sourcesResult, tagsResult, teamResult] = await Promise.all(promises);
        
        // Lead Sources da tabela lead_sources
        if (sourcesResult && sourcesResult.data && !sourcesResult.error) {
            leadsState.leadSources = Array.isArray(sourcesResult.data) ? sourcesResult.data : [];
            console.log(`✅ ${leadsState.leadSources.length} fontes de leads carregadas`);
        } else if (sourcesResult?.error) {
            console.warn('Erro ao carregar fontes de leads:', sourcesResult.error);
        }
        
        // Lead Tags da tabela lead_labels
        if (tagsResult && tagsResult.data && !tagsResult.error) {
            leadsState.leadTags = Array.isArray(tagsResult.data) ? tagsResult.data : [];
            console.log(`✅ ${leadsState.leadTags.length} tags de leads carregadas`);
        } else if (tagsResult?.error) {
            console.warn('Erro ao carregar tags de leads:', tagsResult.error);
        }
        
        // Team Members da tabela user_profiles
        if (teamResult && teamResult.data && !teamResult.error) {
            leadsState.teamMembers = Array.isArray(teamResult.data) ? teamResult.data : [];
            console.log(`✅ ${leadsState.teamMembers.length} membros da equipe carregados`);
        } else if (teamResult?.error) {
            console.warn('Erro ao carregar membros da equipe:', teamResult.error);
        }
        
    } catch (error) {
        console.warn('⚠️ Erro ao carregar dados auxiliares:', error);
        // Continua sem dados auxiliares
    }
}

// ===== REAL-TIME SUBSCRIPTIONS =====
/**
 * Configura subscriptions real-time para atualizações automáticas
 */
function setupRealTimeSubscriptions() {
    try {
        // Subscription para mudanças na tabela leads_crm
        leadsState.subscription = subscribeToTable('leads_crm', {
            event: '*', // INSERT, UPDATE, DELETE
            schema: 'public',
            filter: `org_id=eq.${leadsState.orgId}`
        }, (payload) => {
            console.log('🔄 Atualização real-time recebida:', payload);
            
            switch (payload.eventType) {
                case 'INSERT':
                    if (payload.new) {
                        leadsState.leads.unshift(payload.new);
                        showSuccess('Novo lead adicionado!');
                    }
                    break;
                    
                case 'UPDATE':
                    if (payload.new) {
                        const index = leadsState.leads.findIndex(lead => lead.id === payload.new.id);
                        if (index !== -1) {
                            leadsState.leads[index] = payload.new;
                            showSuccess('Lead atualizado!');
                        }
                    }
                    break;
                    
                case 'DELETE':
                    if (payload.old) {
                        leadsState.leads = leadsState.leads.filter(lead => lead.id !== payload.old.id);
                        showSuccess('Lead removido!');
                    }
                    break;
            }
            
            // Recalcular e re-renderizar
            calculateKPIs();
            applyFiltersAndSorting();
            renderInterface();
        });
        
        console.log('🔄 Real-time subscriptions configuradas');
        
    } catch (error) {
        console.warn('⚠️ Erro ao configurar real-time subscriptions:', error);
    }
}

// ===== CÁLCULO DE KPIs REAIS =====
/**
 * Calcula KPIs baseados nos dados reais dos leads
 */
function calculateKPIs() {
    const leads = leadsState.leads;
    if (!Array.isArray(leads)) {
        console.warn('Dados de leads inválidos para cálculo de KPIs');
        return;
    }
    
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    leadsState.kpis.total = leads.length;
    
    // Leads criados hoje
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
    
    // Taxa de conversão real
    leadsState.kpis.conversionRate = leadsState.kpis.total > 0 
        ? ((leadsState.kpis.converted / leadsState.kpis.total) * 100).toFixed(1)
        : 0;
    
    // Valor médio real dos leads
    const leadsWithValue = leads.filter(lead => {
        const value = parseFloat(lead.value);
        return !isNaN(value) && value > 0;
    });
    
    leadsState.kpis.avgValue = leadsWithValue.length > 0
        ? Math.round(leadsWithValue.reduce((sum, lead) => sum + parseFloat(lead.value), 0) / leadsWithValue.length)
        : 0;
    
    console.log('📊 KPIs calculados:', leadsState.kpis);
}

// ===== FILTROS E ORDENAÇÃO =====
/**
 * Aplica filtros e ordenação aos leads
 */
function applyFiltersAndSorting() {
    let filtered = [...leadsState.leads];
    
    // Aplicar filtros
    if (leadsState.filters.search) {
        const search = leadsState.filters.search.toLowerCase().trim();
        filtered = filtered.filter(lead => {
            const name = (lead.name || '').toLowerCase();
            const email = (lead.email || '').toLowerCase();
            const company = (lead.company || '').toLowerCase();
            const phone = (lead.phone || '').toLowerCase();
            
            return name.includes(search) || 
                   email.includes(search) || 
                   company.includes(search) ||
                   phone.includes(search);
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

// ===== CRUD OPERATIONS COM DADOS REAIS =====
/**
 * Cria um novo lead na tabela leads_crm
 * @param {Object} leadData - Dados do lead
 * @returns {Promise<Object>} Lead criado
 */
async function createNewLead(leadData) {
    try {
        showLoading(true, 'Criando lead...');
        
        // Validar dados obrigatórios
        if (!leadData.name || !leadData.email) {
            throw new Error('Nome e email são obrigatórios');
        }
        
        // Adicionar metadados
        const enrichedData = {
            ...leadData,
            org_id: leadsState.orgId,
            created_by: leadsState.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const result = await createLead(enrichedData, leadsState.orgId);
        
        if (result.error) {
            throw new Error(result.error.message || 'Erro ao criar lead na tabela leads_crm');
        }
        
        // Log de auditoria
        await createAuditLog({
            action: 'lead_created',
            user_id: leadsState.user.id,
            org_id: leadsState.orgId,
            resource_id: result.data?.id,
            details: { lead_name: leadData.name, lead_email: leadData.email }
        }).catch(err => console.warn('Erro ao criar log de auditoria:', err));
        
        showSuccess('Lead criado com sucesso!');
        console.log('✅ Lead criado na tabela leads_crm:', result.data);
        
        return result.data;
        
    } catch (error) {
        console.error('❌ Erro ao criar lead:', error);
        showError(`Erro ao criar lead: ${error.message}`);
        throw error;
    } finally {
        showLoading(false);
    }
}

/**
 * Atualiza um lead existente na tabela leads_crm
 * @param {string} leadId - ID do lead
 * @param {Object} leadData - Dados atualizados
 * @returns {Promise<Object>} Lead atualizado
 */
async function updateExistingLead(leadId, leadData) {
    try {
        showLoading(true, 'Atualizando lead...');
        
        // Adicionar metadados de atualização
        const enrichedData = {
            ...leadData,
            updated_by: leadsState.user.id,
            updated_at: new Date().toISOString()
        };
        
        const result = await updateLead(leadId, enrichedData, leadsState.orgId);
        
        if (result.error) {
            throw new Error(result.error.message || 'Erro ao atualizar lead na tabela leads_crm');
        }
        
        // Log de auditoria
        await createAuditLog({
            action: 'lead_updated',
            user_id: leadsState.user.id,
            org_id: leadsState.orgId,
            resource_id: leadId,
            details: { changes: Object.keys(leadData) }
        }).catch(err => console.warn('Erro ao criar log de auditoria:', err));
        
        showSuccess('Lead atualizado com sucesso!');
        console.log('✅ Lead atualizado na tabela leads_crm:', result.data);
        
        return result.data;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar lead:', error);
        showError(`Erro ao atualizar lead: ${error.message}`);
        throw error;
    } finally {
        showLoading(false);
    }
}

/**
 * Exclui um lead da tabela leads_crm
 * @param {string} leadId - ID do lead
 * @returns {Promise<void>}
 */
async function deleteExistingLead(leadId) {
    try {
        if (!showConfirmDialog('Tem certeza que deseja excluir este lead?')) {
            return;
        }
        
        showLoading(true, 'Excluindo lead...');
        
        const result = await deleteLead(leadId, leadsState.orgId);
        
        if (result.error) {
            throw new Error(result.error.message || 'Erro ao excluir lead da tabela leads_crm');
        }
        
        // Log de auditoria
        await createAuditLog({
            action: 'lead_deleted',
            user_id: leadsState.user.id,
            org_id: leadsState.orgId,
            resource_id: leadId,
            details: { timestamp: new Date().toISOString() }
        }).catch(err => console.warn('Erro ao criar log de auditoria:', err));
        
        showSuccess('Lead excluído com sucesso!');
        console.log('✅ Lead excluído da tabela leads_crm:', leadId);
        
    } catch (error) {
        console.error('❌ Erro ao excluir lead:', error);
        showError(`Erro ao excluir lead: ${error.message}`);
        throw error;
    } finally {
        showLoading(false);
    }
}

// ===== RENDERIZAÇÃO ENTERPRISE =====
/**
 * Renderiza toda a interface do sistema de leads
 */
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

/**
 * Renderiza os KPIs calculados dos dados reais
 */
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

/**
 * Renderiza os filtros do sistema
 */
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

/**
 * Renderiza a tabela de leads com dados reais
 */
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

/**
 * Renderiza a paginação
 */
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

// ===== UTILITÁRIOS ENTERPRISE =====
/**
 * Renderiza badge de status com classes CSS estáticas
 * @param {string} status - Status do lead
 * @returns {string} HTML do badge
 */
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

/**
 * Obtém o label da fonte de lead
 * @param {string} source - Fonte do lead
 * @returns {string} Label formatado
 */
function getSourceLabel(source) {
    const sourceConfig = leadsConfig.sourceOptions.find(s => s.value === source);
    return sourceConfig ? `${sourceConfig.icon} ${sourceConfig.label}` : (source || 'N/A');
}

/**
 * Obtém ícone de ordenação
 * @param {string} field - Campo de ordenação
 * @returns {string} Ícone
 */
function getSortIcon(field) {
    if (leadsState.sorting.field !== field) return '';
    return leadsState.sorting.direction === 'asc' ? '▲' : '▼';
}

/**
 * Gera botões de paginação
 * @param {number} currentPage - Página atual
 * @param {number} totalPages - Total de páginas
 * @returns {string} HTML dos botões
 */
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

/**
 * Formata data para exibição
 * @param {string} dateString - String da data
 * @returns {string} Data formatada
 */
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

/**
 * Escapa HTML para prevenir XSS
 * @param {any} text - Texto a ser escapado
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// ===== SISTEMA DE NOTIFICAÇÕES ENTERPRISE =====
/**
 * Exibe indicador de carregamento
 * @param {boolean} show - Mostrar ou ocultar
 * @param {string} message - Mensagem de carregamento
 */
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

/**
 * Exibe notificação de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    console.error('❌', message);
    
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

/**
 * Exibe notificação de sucesso
 * @param {string} message - Mensagem de sucesso
 */
function showSuccess(message) {
    console.log('✅', message);
    
    const successElement = document.getElementById('success-notification');
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
        setTimeout(() => {
            successElement.classList.add('hidden');
        }, 3000);
    }
}

/**
 * Exibe diálogo de confirmação
 * @param {string} message - Mensagem de confirmação
 * @returns {boolean} Confirmação do usuário
 */
function showConfirmDialog(message) {
    // TODO: Implementar modal customizado
    return confirm(message);
}

/**
 * Função debounce para otimizar performance
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce
 */
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

// ===== EVENT LISTENERS ENTERPRISE =====
/**
 * Configura todos os event listeners do sistema
 */
function setupEventListeners() {
    // Busca com debounce para performance
    document.addEventListener('input', (e) => {
        if (e.target.id === 'search-input') {
            if (leadsState.searchTimeout) {
                clearTimeout(leadsState.searchTimeout);
            }
            
            leadsState.searchTimeout = setTimeout(() => {
                leadsState.filters.search = e.target.value;
                leadsState.pagination.currentPage = 1;
                applyFiltersAndSorting();
                renderInterface();
            }, 300);
        }
    });
    
    // Filtros
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
    
    // Botões e ações
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
    
    // Cleanup ao sair da página
    window.addEventListener('beforeunload', () => {
        if (leadsState.searchTimeout) {
            clearTimeout(leadsState.searchTimeout);
        }
        
        if (leadsState.subscription) {
            try {
                leadsState.subscription.unsubscribe();
            } catch (error) {
                console.warn('Erro ao cancelar subscription:', error);
            }
        }
    });
}

// ===== MODAL DE LEAD =====
/**
 * Abre modal de criação/edição de lead
 * @param {string|null} leadId - ID do lead para edição
 */
function openLeadModal(leadId = null) {
    console.log('📝 Abrindo modal de lead:', leadId);
    showSuccess('Modal de lead em desenvolvimento');
    // TODO: Implementar modal completo
}

/**
 * Edita um lead existente
 * @param {string} leadId - ID do lead
 */
function editLead(leadId) {
    console.log('✏️ Editando lead:', leadId);
    openLeadModal(leadId);
}

// ===== DADOS DEMO (FALLBACK) =====
/**
 * Carrega dados demo apenas em caso de erro crítico
 */
function loadDemoData() {
    console.log('🎯 Carregando dados demo de leads (fallback)...');
    
    leadsState.leads = [
        {
            id: 'demo-1',
            name: 'João Silva',
            email: 'joao@exemplo.com',
            status: 'novo',
            source: 'website',
            value: 5000,
            created_at: new Date().toISOString(),
            org_id: leadsState.orgId
        },
        {
            id: 'demo-2',
            name: 'Maria Santos',
            email: 'maria@exemplo.com',
            status: 'qualificado',
            source: 'social_media',
            value: 7500,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            org_id: leadsState.orgId
        }
    ];
    
    leadsState.filteredLeads = [...leadsState.leads];
    calculateKPIs();
    applyFiltersAndSorting();
    renderInterface();
    
    showError('Usando dados demo - verifique a conexão com o Supabase');
}

// ===== API PÚBLICA =====
/**
 * API pública do sistema de leads
 */
window.LeadsSystem = {
    // Estado
    getState: () => ({ ...leadsState }),
    
    // Ações
    refresh: loadLeads,
    createLead: createNewLead,
    updateLead: updateExistingLead,
    deleteLead: deleteExistingLead,
    
    // Filtros
    setFilter: (key, value) => {
        leadsState.filters[key] = value;
        leadsState.pagination.currentPage = 1;
        applyFiltersAndSorting();
        renderInterface();
    },
    
    clearFilters: () => {
        leadsState.filters = { search: '', status: '', period: '', priority: '', source: '', assignee: '' };
        leadsState.pagination.currentPage = 1;
        applyFiltersAndSorting();
        renderInterface();
    },
    
    // Utilitários
    exportData: () => {
        console.log('📤 Exportando dados de leads...');
        return leadsState.filteredLeads;
    }
};

console.log('🎯 Sistema de Leads Enterprise V4.1 carregado - Pronto para dados reais!');

