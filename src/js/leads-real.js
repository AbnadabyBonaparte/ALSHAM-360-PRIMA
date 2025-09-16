/**
 * ALSHAM 360° PRIMA - Sistema de Leads Simplificado V1.0
 * Versão funcional e otimizada para resolver problemas de build
 * 
 * @version 1.0.0 - FUNCIONAL
 * @author ALSHAM Development Team
 * 
 * ✅ CORREÇÕES APLICADAS:
 * - Importações corrigidas e validadas
 * - Código simplificado e funcional
 * - Compatibilidade com Vercel e Vite
 * - Sem dependências circulares
 * - Performance otimizada
 */

// ===== IMPORTAÇÃO DO CLIENTE SUPABASE UNIFICADO =====
import { supabase } from '../lib/supabase.js';

// ===== CONFIGURAÇÃO =====
const LEADS_CONFIG = {
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
    ]
};

// ===== ESTADO GLOBAL =====
const leadsState = {
    user: null,
    orgId: null,
    leads: [],
    filteredLeads: [],
    currentView: 'table',
    isLoading: false,
    filters: {
        search: '',
        status: '',
        priority: ''
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
        conversionRate: 0
    }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeLeadsSystem);

async function initializeLeadsSystem() {
    try {
        showLoading(true, 'Inicializando sistema de leads...');
        
        // Verificar autenticação
        const authResult = await authenticateUser();
        if (!authResult.success) {
            redirectToLogin();
            return;
        }
        
        leadsState.user = authResult.user;
        leadsState.orgId = authResult.profile?.org_id || 'default-org';
        
        // Carregar dados
        await loadLeadsData();
        
        // Configurar interface
        setupEventListeners();
        renderInterface();
        
        showLoading(false);
        showSuccess('Sistema de leads carregado com sucesso!');
        
        console.log('✅ Sistema de leads inicializado');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema de leads:', error);
        showLoading(false);
        loadDemoData();
        showWarning('Carregando dados demo - verifique a conexão');
    }
}

// ===== AUTENTICAÇÃO =====
async function authenticateUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            return { success: false };
        }
        
        // Buscar perfil do usuário
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        return { success: true, user, profile };
        
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return { success: false };
    }
}

function redirectToLogin() {
    window.location.href = '/login.html';
}

// ===== CARREGAMENTO DE DADOS =====
async function loadLeadsData() {
    try {
        leadsState.isLoading = true;
        
        // Tentar carregar leads reais do Supabase
        const { data: leads, error } = await supabase
            .from('leads_crm')
            .select('*')
            .eq('org_id', leadsState.orgId)
            .order('created_at', { ascending: false });
        
        if (error) {
            throw new Error('Erro ao carregar leads: ' + error.message);
        }
        
        leadsState.leads = leads || [];
        leadsState.filteredLeads = [...leadsState.leads];
        
        calculateKPIs();
        applyFilters();
        
        console.log(`✅ ${leadsState.leads.length} leads carregados do Supabase`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar leads:', error);
        throw error;
    } finally {
        leadsState.isLoading = false;
    }
}

// ===== DADOS DEMO =====
function loadDemoData() {
    try {
        const demoLeads = [
            {
                id: 'demo-1',
                name: 'João Silva',
                email: 'joao@exemplo.com',
                company: 'Tech Solutions',
                phone: '(11) 99999-9999',
                status: 'novo',
                priority: 'alta',
                source: 'website',
                value: 5000,
                created_at: new Date().toISOString()
            },
            {
                id: 'demo-2',
                name: 'Maria Santos',
                email: 'maria@exemplo.com',
                company: 'Digital Corp',
                phone: '(11) 88888-8888',
                status: 'contatado',
                priority: 'media',
                source: 'indicacao',
                value: 3000,
                created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'demo-3',
                name: 'Pedro Costa',
                email: 'pedro@exemplo.com',
                company: 'Innovation Ltd',
                phone: '(11) 77777-7777',
                status: 'qualificado',
                priority: 'urgente',
                source: 'referral',
                value: 8000,
                created_at: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        
        leadsState.leads = demoLeads;
        leadsState.filteredLeads = [...demoLeads];
        
        calculateKPIs();
        applyFilters();
        renderInterface();
        
        console.log('✅ Dados demo carregados');
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados demo:', error);
    }
}

// ===== CÁLCULO DE KPIS =====
function calculateKPIs() {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        leadsState.kpis.total = leadsState.leads.length;
        
        leadsState.kpis.newToday = leadsState.leads.filter(lead => 
            new Date(lead.created_at) >= today
        ).length;
        
        leadsState.kpis.qualified = leadsState.leads.filter(lead => 
            lead.status === 'qualificado'
        ).length;
        
        leadsState.kpis.converted = leadsState.leads.filter(lead => 
            lead.status === 'convertido'
        ).length;
        
        leadsState.kpis.conversionRate = leadsState.kpis.total > 0 
            ? ((leadsState.kpis.converted / leadsState.kpis.total) * 100).toFixed(1)
            : 0;
        
        console.log('📊 KPIs calculados:', leadsState.kpis);
        
    } catch (error) {
        console.error('❌ Erro ao calcular KPIs:', error);
    }
}

// ===== FILTROS =====
function applyFilters() {
    try {
        let filtered = [...leadsState.leads];
        
        // Filtro de busca
        if (leadsState.filters.search) {
            const search = leadsState.filters.search.toLowerCase();
            filtered = filtered.filter(lead => 
                (lead.name && lead.name.toLowerCase().includes(search)) ||
                (lead.email && lead.email.toLowerCase().includes(search)) ||
                (lead.company && lead.company.toLowerCase().includes(search))
            );
        }
        
        // Filtro de status
        if (leadsState.filters.status) {
            filtered = filtered.filter(lead => lead.status === leadsState.filters.status);
        }
        
        // Filtro de prioridade
        if (leadsState.filters.priority) {
            filtered = filtered.filter(lead => lead.priority === leadsState.filters.priority);
        }
        
        leadsState.filteredLeads = filtered;
        leadsState.pagination.totalItems = filtered.length;
        
        console.log(`🔍 Filtros aplicados - ${filtered.length} resultados`);
        
    } catch (error) {
        console.error('❌ Erro ao aplicar filtros:', error);
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    try {
        // Busca
        const searchInput = document.getElementById('search-leads');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                leadsState.filters.search = e.target.value;
                applyFilters();
                renderLeadsList();
            }, 300));
        }
        
        // Filtro de status
        const statusFilter = document.getElementById('filter-status');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                leadsState.filters.status = e.target.value;
                applyFilters();
                renderLeadsList();
            });
        }
        
        // Filtro de prioridade
        const priorityFilter = document.getElementById('filter-priority');
        if (priorityFilter) {
            priorityFilter.addEventListener('change', (e) => {
                leadsState.filters.priority = e.target.value;
                applyFilters();
                renderLeadsList();
            });
        }
        
        // Botão refresh
        const refreshBtn = document.getElementById('refresh-leads');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', refreshData);
        }
        
        // Botão limpar filtros
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearFilters);
        }
        
        console.log('✅ Event listeners configurados');
        
    } catch (error) {
        console.error('❌ Erro ao configurar event listeners:', error);
    }
}

// ===== RENDERIZAÇÃO =====
function renderInterface() {
    try {
        renderKPIs();
        renderFilters();
        renderLeadsList();
        
        console.log('🎨 Interface renderizada');
        
    } catch (error) {
        console.error('❌ Erro ao renderizar interface:', error);
    }
}

function renderKPIs() {
    try {
        const kpisContainer = document.getElementById('kpis-container');
        if (!kpisContainer) return;
        
        const kpisHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${leadsState.kpis.total}</div>
                        <div class="text-sm text-gray-600">Total de Leads</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${leadsState.kpis.newToday}</div>
                        <div class="text-sm text-gray-600">Novos Hoje</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">${leadsState.kpis.qualified}</div>
                        <div class="text-sm text-gray-600">Qualificados</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-yellow-600">${leadsState.kpis.converted}</div>
                        <div class="text-sm text-gray-600">Convertidos</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-indigo-600">${leadsState.kpis.conversionRate}%</div>
                        <div class="text-sm text-gray-600">Taxa de Conversão</div>
                    </div>
                </div>
            </div>
        `;
        
        kpisContainer.innerHTML = kpisHTML;
        
    } catch (error) {
        console.error('❌ Erro ao renderizar KPIs:', error);
    }
}

function renderFilters() {
    try {
        const filtersContainer = document.getElementById('filters-container');
        if (!filtersContainer) return;
        
        const statusOptions = LEADS_CONFIG.statusOptions.map(option => 
            `<option value="${option.value}">${option.icon} ${option.label}</option>`
        ).join('');
        
        const priorityOptions = LEADS_CONFIG.priorityOptions.map(option => 
            `<option value="${option.value}">${option.label}</option>`
        ).join('');
        
        const filtersHTML = `
            <div class="bg-white rounded-lg shadow p-4 mb-6">
                <div class="flex flex-wrap gap-4 items-center">
                    <div class="flex-1 min-w-64">
                        <input 
                            type="text" 
                            id="search-leads"
                            placeholder="Buscar leads..." 
                            value="${leadsState.filters.search}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    
                    <select id="filter-status" class="px-3 py-2 border border-gray-300 rounded-md">
                        <option value="">Todos os Status</option>
                        ${statusOptions}
                    </select>
                    
                    <select id="filter-priority" class="px-3 py-2 border border-gray-300 rounded-md">
                        <option value="">Todas as Prioridades</option>
                        ${priorityOptions}
                    </select>
                    
                    <button 
                        id="clear-filters"
                        class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                        Limpar Filtros
                    </button>
                    
                    <button 
                        id="refresh-leads"
                        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        🔄 Atualizar
                    </button>
                </div>
            </div>
        `;
        
        filtersContainer.innerHTML = filtersHTML;
        
    } catch (error) {
        console.error('❌ Erro ao renderizar filtros:', error);
    }
}

function renderLeadsList() {
    try {
        const leadsContainer = document.getElementById('leads-container');
        if (!leadsContainer) return;
        
        if (leadsState.filteredLeads.length === 0) {
            leadsContainer.innerHTML = `
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <div class="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
                    <p class="text-gray-500">Tente ajustar os filtros ou adicionar novos leads.</p>
                </div>
            `;
            return;
        }
        
        const leadsHTML = leadsState.filteredLeads.map(lead => {
            const statusConfig = LEADS_CONFIG.statusOptions.find(s => s.value === lead.status) || {};
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span class="text-sm font-medium text-gray-700">
                                        ${lead.name ? lead.name.charAt(0).toUpperCase() : '?'}
                                    </span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${lead.name || 'Nome não informado'}</div>
                                <div class="text-sm text-gray-500">${lead.email || 'Email não informado'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${lead.company || '-'}</div>
                        <div class="text-sm text-gray-500">${lead.phone || '-'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800">
                            ${statusConfig.icon || ''} ${statusConfig.label || lead.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${lead.priority || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${lead.value ? `R$ ${parseFloat(lead.value).toLocaleString('pt-BR')}` : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formatDate(lead.created_at)}
                    </td>
                </tr>
            `;
        }).join('');
        
        const tableHTML = `
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">
                        Leads (${leadsState.filteredLeads.length})
                    </h3>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lead
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empresa / Telefone
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Prioridade
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Criado
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${leadsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        leadsContainer.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('❌ Erro ao renderizar lista de leads:', error);
    }
}

// ===== AÇÕES =====
async function refreshData() {
    try {
        showLoading(true, 'Atualizando dados...');
        await loadLeadsData();
        renderInterface();
        showLoading(false);
        showSuccess('Dados atualizados com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar dados:', error);
        showLoading(false);
        showError('Erro ao atualizar dados');
    }
}

function clearFilters() {
    try {
        leadsState.filters = {
            search: '',
            status: '',
            priority: ''
        };
        
        // Limpar inputs
        const searchInput = document.getElementById('search-leads');
        if (searchInput) searchInput.value = '';
        
        const statusFilter = document.getElementById('filter-status');
        if (statusFilter) statusFilter.value = '';
        
        const priorityFilter = document.getElementById('filter-priority');
        if (priorityFilter) priorityFilter.value = '';
        
        applyFilters();
        renderLeadsList();
        
        showSuccess('Filtros limpos!');
        
    } catch (error) {
        console.error('❌ Erro ao limpar filtros:', error);
    }
}

// ===== UTILIDADES =====
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

function formatDate(dateString) {
    try {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return '-';
    }
}

// ===== NOTIFICAÇÕES =====
function showLoading(show, message = 'Carregando...') {
    try {
        let loadingElement = document.getElementById('loading-overlay');
        
        if (show) {
            if (!loadingElement) {
                loadingElement = document.createElement('div');
                loadingElement.id = 'loading-overlay';
                loadingElement.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                loadingElement.innerHTML = `
                    <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span class="text-gray-700">${message}</span>
                    </div>
                `;
                document.body.appendChild(loadingElement);
            }
        } else {
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    } catch (error) {
        console.error('Erro no loading:', error);
    }
}

function showNotification(message, type = 'info', duration = 5000) {
    try {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${getNotificationClasses(type)}`;
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="text-gray-400 hover:text-gray-600">
                    ✕
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
        
    } catch (error) {
        console.error('Erro na notificação:', error);
    }
}

function getNotificationClasses(type) {
    switch (type) {
        case 'success':
            return 'bg-green-50 border border-green-200 text-green-800';
        case 'error':
            return 'bg-red-50 border border-red-200 text-red-800';
        case 'warning':
            return 'bg-yellow-50 border border-yellow-200 text-yellow-800';
        default:
            return 'bg-blue-50 border border-blue-200 text-blue-800';
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showWarning(message) {
    showNotification(message, 'warning');
}

// ===== EXPORT =====
export default {
    init: initializeLeadsSystem,
    refresh: refreshData,
    clearFilters: clearFilters,
    state: leadsState
};

console.log('📋 Sistema de Leads Simplificado carregado - Pronto para uso!');
