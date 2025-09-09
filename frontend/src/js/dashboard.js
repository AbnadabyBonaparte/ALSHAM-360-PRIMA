// ALSHAM 360° PRIMA - Dashboard System CORRIGIDO
// Sistema completo de dashboard com métricas, KPIs e analytics em tempo real

import { 
    getCurrentUser,
    getLeads,
    getSalesOpportunities,
    getPerformanceMetrics,
    getAnalyticsEvents,
    getActivityFeed,
    getDashboardWidgets,
    getGamificationPoints,
    checkConnectionHealth
} from '../lib/supabase.js';

// ===== ESTADO DO DASHBOARD =====
const dashboardState = {
    user: null,
    profile: null,
    orgId: null,
    kpis: {
        totalLeads: 0,
        newLeadsToday: 0,
        conversionRate: 0,
        totalRevenue: 0,
        activeOpportunities: 0,
        avgDealSize: 0,
        leadsThisMonth: 0,
        revenueThisMonth: 0
    },
    charts: {
        leadsChart: null,
        revenueChart: null,
        conversionChart: null,
        sourceChart: null
    },
    widgets: [],
    recentActivity: [],
    gamification: {
        points: 0,
        level: 1,
        badges: [],
        leaderboard: []
    },
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdate: null,
    refreshInterval: null
};

// ===== CONFIGURAÇÕES =====
const config = {
    refreshInterval: 300000, // 5 minutos
    chartColors: {
        primary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#06B6D4'
    },
    kpiTargets: {
        conversionRate: 25, // %
        monthlyGrowth: 15,  // %
        avgDealSize: 5000   // R$
    },
    // CORRIGIDO: Classes CSS estáticas
    kpiStyles: {
        blue: { color: 'text-blue-600', bg: 'bg-blue-50' },
        green: { color: 'text-green-600', bg: 'bg-green-50' },
        purple: { color: 'text-purple-600', bg: 'bg-purple-50' },
        orange: { color: 'text-orange-600', bg: 'bg-orange-50' }
    }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeDashboard);

async function initializeDashboard() {
    try {
        showLoading(true, 'Carregando dashboard...');
        
        // CORRIGIDO: Melhor verificação de conexão
        try {
            const healthCheck = await checkConnectionHealth();
            if (!healthCheck.healthy) {
                throw new Error('Falha na conexão com o banco de dados');
            }
        } catch (healthError) {
            console.warn('Aviso: Não foi possível verificar a saúde da conexão:', healthError);
        }
        
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
            
            dashboardState.user = user;
            dashboardState.profile = profile;
            dashboardState.orgId = profile?.org_id || 'default-org-id';
            
        } catch (authError) {
            console.error('Erro ao verificar autenticação:', authError);
            window.location.href = '/login.html';
            return;
        }
        
        // Carregar dados do dashboard
        await loadDashboardData();
        
        // Renderizar interface
        renderDashboard();
        
        // Configurar atualizações automáticas
        setupAutoRefresh();
        
        // Configurar event listeners
        setupEventListeners();
        
        dashboardState.isLoading = false;
        dashboardState.lastUpdate = new Date();
        
        showLoading(false);
        console.log('📊 Dashboard inicializado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar dashboard:', error);
        dashboardState.error = error.message;
        dashboardState.isLoading = false;
        showLoading(false);
        showError(`Erro ao carregar dashboard: ${error.message}`);
        loadDemoData();
    }
}

// ===== CARREGAMENTO DE DADOS =====
async function loadDashboardData() {
    if (dashboardState.isRefreshing) {
        console.log('⏳ Refresh já em andamento, pulando...');
        return;
    }
    
    dashboardState.isRefreshing = true;
    
    try {
        // CORRIGIDO: Melhor tratamento de Promise.allSettled
        const promises = [
            getLeads(dashboardState.orgId, { limit: 1000 }).catch(err => ({ error: err })),
            getSalesOpportunities(dashboardState.orgId).catch(err => ({ error: err })),
            getPerformanceMetrics(dashboardState.orgId).catch(err => ({ error: err })),
            getActivityFeed(dashboardState.orgId, 20).catch(err => ({ error: err })),
            getDashboardWidgets(dashboardState.orgId).catch(err => ({ error: err })),
            getGamificationPoints(dashboardState.user?.id, dashboardState.orgId).catch(err => ({ error: err }))
        ];
        
        const [
            leadsData,
            opportunitiesData,
            metricsData,
            activityData,
            widgetsData,
            gamificationData
        ] = await Promise.all(promises);
        
        // CORRIGIDO: Melhor verificação de dados
        if (leadsData && leadsData.data && !leadsData.error) {
            processLeadsData(leadsData.data);
        } else if (leadsData?.error) {
            console.warn('Erro ao carregar leads:', leadsData.error);
        }
        
        if (opportunitiesData && opportunitiesData.data && !opportunitiesData.error) {
            processOpportunitiesData(opportunitiesData.data);
        } else if (opportunitiesData?.error) {
            console.warn('Erro ao carregar oportunidades:', opportunitiesData.error);
        }
        
        if (metricsData && metricsData.data && !metricsData.error) {
            processMetricsData(metricsData.data);
        } else if (metricsData?.error) {
            console.warn('Erro ao carregar métricas:', metricsData.error);
        }
        
        if (activityData && activityData.data && !activityData.error) {
            dashboardState.recentActivity = activityData.data;
        } else if (activityData?.error) {
            console.warn('Erro ao carregar atividades:', activityData.error);
            dashboardState.recentActivity = [];
        }
        
        if (widgetsData && widgetsData.data && !widgetsData.error) {
            dashboardState.widgets = widgetsData.data;
        } else if (widgetsData?.error) {
            console.warn('Erro ao carregar widgets:', widgetsData.error);
            dashboardState.widgets = [];
        }
        
        if (gamificationData && gamificationData.data && !gamificationData.error) {
            processGamificationData(gamificationData.data);
        } else if (gamificationData?.error) {
            console.warn('Erro ao carregar gamificação:', gamificationData.error);
        }
        
        console.log('✅ Dados do dashboard carregados');
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        throw error;
    } finally {
        dashboardState.isRefreshing = false;
    }
}

// ===== PROCESSAMENTO DE DADOS =====
function processLeadsData(leads) {
    if (!Array.isArray(leads)) {
        console.warn('Dados de leads inválidos:', leads);
        return;
    }
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    dashboardState.kpis.totalLeads = leads.length;
    
    // Leads de hoje
    dashboardState.kpis.newLeadsToday = leads.filter(lead => {
        try {
            return new Date(lead.created_at) >= startOfToday;
        } catch (e) {
            return false;
        }
    }).length;
    
    // Leads do mês
    dashboardState.kpis.leadsThisMonth = leads.filter(lead => {
        try {
            return new Date(lead.created_at) >= startOfMonth;
        } catch (e) {
            return false;
        }
    }).length;
    
    // Taxa de conversão
    const convertedLeads = leads.filter(lead => 
        lead.status === 'converted' || lead.status === 'convertido'
    ).length;
    
    dashboardState.kpis.conversionRate = dashboardState.kpis.totalLeads > 0 
        ? ((convertedLeads / dashboardState.kpis.totalLeads) * 100).toFixed(1)
        : 0;
}

function processOpportunitiesData(opportunities) {
    if (!Array.isArray(opportunities)) {
        console.warn('Dados de oportunidades inválidos:', opportunities);
        return;
    }
    
    dashboardState.kpis.activeOpportunities = opportunities.filter(opp => 
        opp.stage !== 'won' && opp.stage !== 'lost'
    ).length;
    
    // Receita total
    const wonOpportunities = opportunities.filter(opp => opp.stage === 'won');
    dashboardState.kpis.totalRevenue = wonOpportunities.reduce((sum, opp) => {
        const value = parseFloat(opp.value) || 0;
        return sum + value;
    }, 0);
    
    // Ticket médio
    dashboardState.kpis.avgDealSize = wonOpportunities.length > 0
        ? Math.round(dashboardState.kpis.totalRevenue / wonOpportunities.length)
        : 0;
    
    // Receita do mês
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlyWins = wonOpportunities.filter(opp => {
        try {
            return new Date(opp.updated_at) >= startOfMonth;
        } catch (e) {
            return false;
        }
    });
    
    dashboardState.kpis.revenueThisMonth = monthlyWins.reduce((sum, opp) => {
        const value = parseFloat(opp.value) || 0;
        return sum + value;
    }, 0);
}

function processMetricsData(metrics) {
    if (!Array.isArray(metrics) || metrics.length === 0) return;
    
    try {
        const latestMetrics = metrics[0];
        // Processar métricas específicas se necessário
        console.log('Métricas processadas:', latestMetrics);
    } catch (error) {
        console.warn('Erro ao processar métricas:', error);
    }
}

function processGamificationData(gamificationData) {
    if (!Array.isArray(gamificationData)) {
        console.warn('Dados de gamificação inválidos:', gamificationData);
        return;
    }
    
    try {
        if (gamificationData.length > 0) {
            dashboardState.gamification.points = gamificationData.reduce((sum, item) => 
                sum + (item.points || 0), 0
            );
            
            // Calcular nível baseado nos pontos
            dashboardState.gamification.level = Math.floor(dashboardState.gamification.points / 1000) + 1;
        }
    } catch (error) {
        console.warn('Erro ao processar gamificação:', error);
    }
}

// ===== RENDERIZAÇÃO =====
function renderDashboard() {
    try {
        renderWelcomeSection();
        renderKPIs();
        renderCharts();
        renderRecentActivity();
        renderQuickActions();
        renderGamification();
        updateLastRefresh();
    } catch (error) {
        console.error('Erro ao renderizar dashboard:', error);
    }
}

function renderWelcomeSection() {
    const welcomeSection = document.getElementById('welcome-section');
    if (!welcomeSection) return;
    
    const userName = dashboardState.profile?.full_name || 
                    dashboardState.user?.user_metadata?.full_name || 
                    dashboardState.user?.email?.split('@')[0] || 
                    'Usuário';
    
    const currentHour = new Date().getHours();
    let greeting = 'Boa noite';
    if (currentHour < 12) greeting = 'Bom dia';
    else if (currentHour < 18) greeting = 'Boa tarde';
    
    welcomeSection.innerHTML = `
        <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90 rounded-2xl"></div>
            <div class="relative z-10 p-8">
                <h1 class="text-3xl font-bold text-white mb-2">
                    ${greeting}, ${escapeHtml(userName)}! 👋
                </h1>
                <p class="text-blue-100 text-lg">
                    Aqui está um resumo do seu desempenho hoje
                </p>
                <div class="mt-4 flex items-center text-blue-100">
                    <span class="mr-2">📊</span>
                    <span>Última atualização: ${formatTime(dashboardState.lastUpdate)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderKPIs() {
    const kpisContainer = document.getElementById('kpis-container');
    if (!kpisContainer) return;
    
    const kpis = [
        {
            title: 'Total de Leads',
            value: dashboardState.kpis.totalLeads.toLocaleString('pt-BR'),
            change: `+${dashboardState.kpis.newLeadsToday} hoje`,
            changeType: 'positive',
            icon: '👥',
            colorKey: 'blue'
        },
        {
            title: 'Taxa de Conversão',
            value: `${dashboardState.kpis.conversionRate}%`,
            change: `Meta: ${config.kpiTargets.conversionRate}%`,
            changeType: parseFloat(dashboardState.kpis.conversionRate) >= config.kpiTargets.conversionRate ? 'positive' : 'negative',
            icon: '📈',
            colorKey: 'green'
        },
        {
            title: 'Receita Total',
            value: `R$ ${dashboardState.kpis.totalRevenue.toLocaleString('pt-BR')}`,
            change: `R$ ${dashboardState.kpis.revenueThisMonth.toLocaleString('pt-BR')} este mês`,
            changeType: 'positive',
            icon: '💰',
            colorKey: 'purple'
        },
        {
            title: 'Oportunidades Ativas',
            value: dashboardState.kpis.activeOpportunities.toLocaleString('pt-BR'),
            change: `Ticket médio: R$ ${dashboardState.kpis.avgDealSize.toLocaleString('pt-BR')}`,
            changeType: 'neutral',
            icon: '🎯',
            colorKey: 'orange'
        }
    ];
    
    // CORRIGIDO: Classes CSS estáticas
    kpisContainer.innerHTML = kpis.map(kpi => {
        const style = config.kpiStyles[kpi.colorKey] || config.kpiStyles.blue;
        const changeClass = kpi.changeType === 'positive' ? 'text-green-600' : 
                           kpi.changeType === 'negative' ? 'text-red-600' : 'text-gray-600';
        
        return `
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="text-2xl">${kpi.icon}</div>
                    <div class="${style.color} ${style.bg} rounded-full p-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <h3 class="text-gray-600 text-sm font-medium mb-1">${escapeHtml(kpi.title)}</h3>
                <p class="text-2xl font-bold text-gray-900 mb-2">${escapeHtml(kpi.value)}</p>
                <p class="text-sm ${changeClass}">
                    ${escapeHtml(kpi.change)}
                </p>
            </div>
        `;
    }).join('');
}

function renderCharts() {
    const analyticsContainer = document.getElementById('analytics-container');
    if (!analyticsContainer) return;
    
    analyticsContainer.innerHTML = `
        <div class="mb-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4">📊 Analytics</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="font-semibold text-gray-700 mb-4">Leads por Período</h4>
                    <div id="leads-chart" class="h-48 flex items-center justify-center text-gray-500">
                        📈 Gráfico de leads em desenvolvimento
                    </div>
                </div>
                <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="font-semibold text-gray-700 mb-4">Receita Mensal</h4>
                    <div id="revenue-chart" class="h-48 flex items-center justify-center text-gray-500">
                        💹 Gráfico de receita em desenvolvimento
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRecentActivity() {
    const recentLeadsContainer = document.getElementById('recent-leads-tbody');
    if (!recentLeadsContainer) return;
    
    if (!Array.isArray(dashboardState.recentActivity) || dashboardState.recentActivity.length === 0) {
        recentLeadsContainer.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-8 text-gray-500">
                    <div class="flex flex-col items-center">
                        <span class="text-4xl mb-2">📋</span>
                        <p>Nenhuma atividade recente encontrada</p>
                        <p class="text-sm">Novos leads aparecerão aqui</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    recentLeadsContainer.innerHTML = dashboardState.recentActivity.slice(0, 5).map(activity => `
        <tr class="hover:bg-gray-50">
            <td class="py-3 px-4">${escapeHtml(activity.description || 'Atividade')}</td>
            <td class="py-3 px-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${escapeHtml(activity.type || 'Geral')}
                </span>
            </td>
            <td class="py-3 px-4">-</td>
            <td class="py-3 px-4">${escapeHtml(activity.user_name || 'Sistema')}</td>
        </tr>
    `).join('');
}

function renderQuickActions() {
    const quickActionsContainer = document.getElementById('quick-actions-container');
    if (!quickActionsContainer) return;
    
    quickActionsContainer.innerHTML = `
        <h3 class="text-xl font-bold text-gray-900 mb-4">⚡ Ações Rápidas</h3>
        <div class="space-y-3">
            <button onclick="navigateToPage('/leads.html')" 
                    class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <span class="text-2xl mr-3">👥</span>
                <div>
                    <p class="font-medium text-gray-900">Gerenciar Leads</p>
                    <p class="text-sm text-gray-600">Visualizar e editar leads</p>
                </div>
            </button>
            <button onclick="navigateToPage('/automacoes.html')" 
                    class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <span class="text-2xl mr-3">🤖</span>
                <div>
                    <p class="font-medium text-gray-900">Automações</p>
                    <p class="text-sm text-gray-600">Configurar fluxos automáticos</p>
                </div>
            </button>
            <button onclick="navigateToPage('/relatorios.html')" 
                    class="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <span class="text-2xl mr-3">📊</span>
                <div>
                    <p class="font-medium text-gray-900">Relatórios</p>
                    <p class="text-sm text-gray-600">Análises detalhadas</p>
                </div>
            </button>
        </div>
    `;
}

function renderGamification() {
    const insightsContainer = document.getElementById('insights-container');
    if (!insightsContainer) return;
    
    const progressPercentage = Math.min((dashboardState.gamification.points % 1000) / 10, 100);
    const pointsToNext = 1000 - (dashboardState.gamification.points % 1000);
    
    insightsContainer.innerHTML = `
        <h3 class="text-xl font-bold text-gray-900 mb-4">🎮 Gamificação</h3>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium text-gray-900">Nível ${dashboardState.gamification.level}</p>
                    <p class="text-sm text-gray-600">${dashboardState.gamification.points.toLocaleString('pt-BR')} pontos</p>
                </div>
                <div class="text-2xl">🏆</div>
            </div>
            <div class="bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                     style="width: ${progressPercentage}%"></div>
            </div>
            <p class="text-xs text-gray-500">
                ${pointsToNext.toLocaleString('pt-BR')} pontos para o próximo nível
            </p>
        </div>
    `;
}

// ===== UTILITÁRIOS =====
function formatTime(date) {
    if (!date) return 'Nunca';
    try {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (error) {
        console.warn('Erro ao formatar hora:', error);
        return 'Erro';
    }
}

// NOVO: Função para escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// NOVO: Navegação segura
function navigateToPage(url) {
    try {
        window.location.href = url;
    } catch (error) {
        console.error('Erro na navegação:', error);
    }
}

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
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }
}

function showSuccess(message) {
    console.log('✅', message);
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
        setTimeout(() => {
            successElement.classList.add('hidden');
        }, 3000);
    }
}

function updateLastRefresh() {
    dashboardState.lastUpdate = new Date();
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `Última atualização: ${formatTime(dashboardState.lastUpdate)}`;
    }
}

// ===== AUTO REFRESH =====
function setupAutoRefresh() {
    // CORRIGIDO: Limpar interval anterior se existir
    if (dashboardState.refreshInterval) {
        clearInterval(dashboardState.refreshInterval);
    }
    
    dashboardState.refreshInterval = setInterval(async () => {
        if (dashboardState.isRefreshing) {
            console.log('⏳ Refresh em andamento, pulando atualização automática');
            return;
        }
        
        try {
            await loadDashboardData();
            renderDashboard();
            console.log('🔄 Dashboard atualizado automaticamente');
        } catch (error) {
            console.error('❌ Erro na atualização automática:', error);
        }
    }, config.refreshInterval);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Refresh manual
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-refresh-dashboard]')) {
            e.preventDefault();
            manualRefresh();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            manualRefresh();
        }
    });
    
    // Cleanup no unload
    window.addEventListener('beforeunload', () => {
        if (dashboardState.refreshInterval) {
            clearInterval(dashboardState.refreshInterval);
        }
    });
}

// NOVO: Refresh manual
async function manualRefresh() {
    try {
        showLoading(true, 'Atualizando dashboard...');
        await loadDashboardData();
        renderDashboard();
        showSuccess('Dashboard atualizado com sucesso!');
        showLoading(false);
    } catch (error) {
        console.error('Erro no refresh manual:', error);
        showError('Erro ao atualizar dashboard');
        showLoading(false);
    }
}

// ===== DADOS DEMO =====
function loadDemoData() {
    console.log('📊 Carregando dados demo do dashboard...');
    
    dashboardState.kpis = {
        totalLeads: 1247,
        newLeadsToday: 23,
        conversionRate: 18.5,
        totalRevenue: 125000,
        activeOpportunities: 45,
        avgDealSize: 2780,
        leadsThisMonth: 156,
        revenueThisMonth: 28500
    };
    
    dashboardState.gamification = {
        points: 2350,
        level: 3,
        badges: [],
        leaderboard: []
    };
    
    dashboardState.recentActivity = [
        { description: 'Novo lead cadastrado', type: 'Lead', user_name: 'Sistema' },
        { description: 'Oportunidade convertida', type: 'Venda', user_name: 'João Silva' },
        { description: 'Email enviado', type: 'Marketing', user_name: 'Automação' }
    ];
    
    dashboardState.isLoading = false;
    renderDashboard();
    showSuccess('Dados demo carregados');
}

// ===== API PÚBLICA =====
window.dashboard = {
    refresh: manualRefresh,
    getState: () => ({ ...dashboardState }),
    getKPIs: () => ({ ...dashboardState.kpis })
};

// CORRIGIDO: Exportar navegateToPage para uso global
window.navigateToPage = navigateToPage;

console.log('📊 Dashboard module loaded');
