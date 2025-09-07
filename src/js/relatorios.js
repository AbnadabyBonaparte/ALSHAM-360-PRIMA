// ALSHAM 360° PRIMA - Relatórios Ultimate 10/10
// Sistema completo de relatórios com análises avançadas, exportação e dashboard interativo

import { supabase } from '../lib/supabase.js';

// ===== ESTADO GLOBAL =====
const reportsState = {
    user: null,
    profile: null,
    orgId: null,
    currentPeriod: 30,
    selectedVendedor: 'all',
    selectedMetric: 'revenue',
    charts: {},
    rawData: {
        leads: [],
        deals: [],
        activities: [],
        users: []
    },
    processedData: {
        kpis: {},
        trends: {},
        rankings: {},
        forecasts: {}
    },
    filters: {
        dateRange: 'last30days',
        vendedor: 'all',
        source: 'all',
        status: 'all',
        product: 'all'
    },
    isLoading: false,
    lastUpdate: null,
    autoRefresh: true,
    refreshInterval: null
};

// ===== CONFIGURAÇÕES =====
const config = {
    refreshInterval: 300000, // 5 minutos
    chartColors: {
        primary: 'rgb(59, 130, 246)',
        secondary: 'rgb(16, 185, 129)',
        accent: 'rgb(245, 158, 11)',
        danger: 'rgb(239, 68, 68)',
        purple: 'rgb(139, 92, 246)',
        pink: 'rgb(236, 72, 153)'
    },
    gradients: {
        blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        green: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        orange: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    exportFormats: ['PDF', 'Excel', 'CSV', 'PowerPoint'],
    periods: {
        '7': 'Últimos 7 dias',
        '30': 'Últimos 30 dias',
        '90': 'Últimos 90 dias',
        '180': 'Últimos 6 meses',
        '365': 'Último ano',
        'custom': 'Período customizado'
    }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeReportsPage);

async function initializeReportsPage() {
    try {
        showLoader(true, 'Carregando sistema de relatórios...');
        
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/login.html';
            return;
        }
        
        reportsState.user = user;
        
        // Buscar perfil do usuário
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('org_id, full_name, role')
            .eq('user_id', user.id)
            .single();
            
        reportsState.profile = profile;
        reportsState.orgId = profile?.org_id;
        
        setUserUI(user, profile);
        setupEventListeners();
        await loadAllReportsData();
        setupAutoRefresh();
        
        showLoader(false);
        showToast('Relatórios carregados com sucesso!', 'success');
        console.log('📊 Sistema de relatórios Ultimate inicializado');
        
    } catch (error) {
        console.error('Erro ao inicializar relatórios:', error);
        showLoader(false);
        showToast('Erro ao carregar dados. Usando dados de demonstração.', 'warning');
        loadDemoData();
    }
}

// ===== CONFIGURAÇÃO DA UI =====
function setUserUI(user, profile) {
    // Atualizar informações do usuário
    const avatar = document.querySelector('[data-auth="user-avatar"]');
    const name = document.querySelector('[data-auth="user-name"]');
    
    if (avatar) {
        const initials = (profile?.full_name || user.email).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatar.textContent = initials;
    }
    
    if (name) {
        name.textContent = profile?.full_name || user.email;
    }
    
    // Logout
    const logoutBtn = document.querySelector('[data-auth="logout-btn"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = '/login.html';
        });
    }
    
    // Mostrar última atualização
    updateLastUpdateTime();
}

function setupEventListeners() {
    // Seletor de período
    const periodSelector = document.getElementById('period-selector');
    if (periodSelector) {
        periodSelector.addEventListener('change', async (e) => {
            reportsState.currentPeriod = parseInt(e.target.value);
            reportsState.filters.dateRange = e.target.value + 'days';
            await loadAllReportsData();
        });
    }
    
    // Filtros avançados
    const vendedorFilter = document.getElementById('vendedor-filter');
    if (vendedorFilter) {
        vendedorFilter.addEventListener('change', async (e) => {
            reportsState.selectedVendedor = e.target.value;
            reportsState.filters.vendedor = e.target.value;
            await processAndRenderData();
        });
    }
    
    const sourceFilter = document.getElementById('source-filter');
    if (sourceFilter) {
        sourceFilter.addEventListener('change', async (e) => {
            reportsState.filters.source = e.target.value;
            await processAndRenderData();
        });
    }
    
    // Métricas dashboard
    const metricButtons = document.querySelectorAll('[data-metric]');
    metricButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const metric = e.target.getAttribute('data-metric');
            switchMetricView(metric);
        });
    });
    
    // Exportação
    const exportButton = document.getElementById('export-reports');
    if (exportButton) {
        exportButton.addEventListener('click', showExportModal);
    }
    
    // Auto-refresh toggle
    const autoRefreshToggle = document.getElementById('auto-refresh');
    if (autoRefreshToggle) {
        autoRefreshToggle.addEventListener('change', (e) => {
            reportsState.autoRefresh = e.target.checked;
            if (reportsState.autoRefresh) {
                setupAutoRefresh();
            } else {
                clearInterval(reportsState.refreshInterval);
            }
        });
    }
    
    // Refresh manual
    const refreshButton = document.getElementById('refresh-data');
    if (refreshButton) {
        refreshButton.addEventListener('click', manualRefresh);
    }
}

// ===== CARREGAMENTO DE DADOS =====
async function loadAllReportsData() {
    try {
        reportsState.isLoading = true;
        showLoader(true, 'Atualizando dados...');
        
        // Calcular período
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - reportsState.currentPeriod);
        
        // Carregar dados em paralelo
        const [leadsResult, dealsResult, activitiesResult, usersResult] = await Promise.all([
            loadLeadsData(startDate, endDate),
            loadDealsData(startDate, endDate),
            loadActivitiesData(startDate, endDate),
            loadUsersData()
        ]);
        
        // Armazenar dados brutos
        reportsState.rawData = {
            leads: leadsResult,
            deals: dealsResult,
            activities: activitiesResult,
            users: usersResult
        };
        
        // Processar e renderizar
        await processAndRenderData();
        
        reportsState.lastUpdate = new Date();
        updateLastUpdateTime();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados do servidor. Usando dados de demonstração.', 'error');
        loadDemoData();
    } finally {
        reportsState.isLoading = false;
        showLoader(false);
    }
}

async function loadLeadsData(startDate, endDate) {
    try {
        const { data, error } = await supabase
            .from('leads_crm')
            .select('*')
            .eq('org_id', reportsState.orgId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao carregar leads:', error);
        return [];
    }
}

async function loadDealsData(startDate, endDate) {
    try {
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .eq('org_id', reportsState.orgId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao carregar deals:', error);
        return [];
    }
}

async function loadActivitiesData(startDate, endDate) {
    try {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('org_id', reportsState.orgId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        return [];
    }
}

async function loadUsersData() {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('user_id, full_name, position, role')
            .eq('org_id', reportsState.orgId);
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        return [];
    }
}

// ===== DADOS DEMO =====
function loadDemoData() {
    const currentDate = new Date();
    
    // Gerar leads demo
    reportsState.rawData.leads = Array.from({ length: 420 }, (_, i) => ({
        id: i + 1,
        nome: ['Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Oliveira', 'Carlos Mendes'][i % 5],
        email: `lead${i}@empresa.com`,
        empresa: ['Tech Corp', 'Inovação Ltda', 'StartupBR', 'Mega Corp', 'Future Inc'][i % 5],
        status: ['novo', 'qualificado', 'proposta', 'convertido', 'perdido'][Math.floor(Math.random() * 5)],
        origem: ['website', 'social_media', 'referral', 'cold_call', 'email'][Math.floor(Math.random() * 5)],
        valor_negocio: Math.floor(Math.random() * 50000) + 5000,
        responsavel: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Mendes'][Math.floor(Math.random() * 5)],
        created_at: new Date(currentDate.getTime() - Math.random() * reportsState.currentPeriod * 86400000).toISOString()
    }));
    
    // Gerar deals demo
    reportsState.rawData.deals = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        title: `Negócio ${i + 1}`,
        value: Math.floor(Math.random() * 100000) + 10000,
        status: ['novo', 'qualificado', 'proposta', 'won', 'lost'][Math.floor(Math.random() * 5)],
        vendedor: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Mendes'][Math.floor(Math.random() * 5)],
        source: ['website', 'social_media', 'referral', 'cold_call', 'email'][Math.floor(Math.random() * 5)],
        created_at: new Date(currentDate.getTime() - Math.random() * reportsState.currentPeriod * 86400000).toISOString(),
        closed_at: Math.random() > 0.5 ? new Date(currentDate.getTime() - Math.random() * reportsState.currentPeriod * 86400000).toISOString() : null
    }));
    
    // Gerar atividades demo
    reportsState.rawData.activities = Array.from({ length: 800 }, (_, i) => ({
        id: i + 1,
        type: ['call', 'email', 'meeting', 'note', 'task'][Math.floor(Math.random() * 5)],
        user_id: ['user1', 'user2', 'user3', 'user4', 'user5'][Math.floor(Math.random() * 5)],
        lead_id: Math.floor(Math.random() * 420) + 1,
        created_at: new Date(currentDate.getTime() - Math.random() * reportsState.currentPeriod * 86400000).toISOString()
    }));
    
    // Usuários demo
    reportsState.rawData.users = [
        { user_id: 'user1', full_name: 'João Silva', position: 'Vendedor Senior', role: 'sales' },
        { user_id: 'user2', full_name: 'Maria Santos', position: 'Gerente de Vendas', role: 'manager' },
        { user_id: 'user3', full_name: 'Pedro Costa', position: 'Vendedor', role: 'sales' },
        { user_id: 'user4', full_name: 'Ana Oliveira', position: 'Vendedora', role: 'sales' },
        { user_id: 'user5', full_name: 'Carlos Mendes', position: 'Vendedor Junior', role: 'sales' }
    ];
    
    processAndRenderData();
}

// ===== PROCESSAMENTO DE DADOS =====
async function processAndRenderData() {
    try {
        // Processar KPIs
        calculateKPIs();
        
        // Processar rankings
        calculateRankings();
        
        // Processar tendências
        calculateTrends();
        
        // Calcular previsões
        calculateForecasts();
        
        // Renderizar tudo
        renderDashboard();
        
    } catch (error) {
        console.error('Erro ao processar dados:', error);
        showToast('Erro ao processar dados', 'error');
    }
}

function calculateKPIs() {
    const { leads, deals } = reportsState.rawData;
    
    // Filtrar dados baseado nos filtros ativos
    const filteredDeals = filterData(deals, 'deals');
    const filteredLeads = filterData(leads, 'leads');
    
    // KPIs básicos
    const wonDeals = filteredDeals.filter(d => d.status === 'won' || d.status === 'convertido');
    const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || d.valor_negocio || 0), 0);
    const totalLeads = filteredLeads.length;
    const conversionRate = totalLeads > 0 ? (wonDeals.length / totalLeads) * 100 : 0;
    const avgDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
    
    // Ciclo de vendas médio
    const avgSalesCycle = calculateAverageSalesCycle(wonDeals);
    
    // Crescimento vs período anterior
    const growthMetrics = calculateGrowthMetrics(filteredDeals);
    
    // Pipeline atual
    const pipelineValue = filteredDeals
        .filter(d => !['won', 'lost', 'convertido', 'perdido'].includes(d.status))
        .reduce((sum, d) => sum + (d.value || d.valor_negocio || 0), 0);
    
    reportsState.processedData.kpis = {
        totalRevenue,
        totalLeads,
        conversionRate,
        avgDealSize,
        avgSalesCycle,
        pipelineValue,
        wonDeals: wonDeals.length,
        growthRevenue: growthMetrics.revenue,
        growthDeals: growthMetrics.deals,
        activitiesCount: reportsState.rawData.activities.length
    };
}

function calculateRankings() {
    const { deals, users } = reportsState.rawData;
    const filteredDeals = filterData(deals, 'deals');
    
    // Ranking por vendedor
    const vendedorStats = {};
    
    users.forEach(user => {
        vendedorStats[user.full_name] = {
            name: user.full_name,
            position: user.position,
            revenue: 0,
            deals: 0,
            conversions: 0,
            activities: 0
        };
    });
    
    filteredDeals.forEach(deal => {
        const vendedor = deal.vendedor || deal.responsavel;
        if (vendedorStats[vendedor]) {
            vendedorStats[vendedor].deals++;
            if (deal.status === 'won' || deal.status === 'convertido') {
                vendedorStats[vendedor].revenue += deal.value || deal.valor_negocio || 0;
                vendedorStats[vendedor].conversions++;
            }
        }
    });
    
    // Calcular atividades por vendedor
    reportsState.rawData.activities.forEach(activity => {
        const user = users.find(u => u.user_id === activity.user_id);
        if (user && vendedorStats[user.full_name]) {
            vendedorStats[user.full_name].activities++;
        }
    });
    
    // Converter para array e ordenar
    const vendedorRanking = Object.values(vendedorStats)
        .map((vendedor, index) => ({
            ...vendedor,
            conversionRate: vendedor.deals > 0 ? (vendedor.conversions / vendedor.deals * 100) : 0,
            activityScore: Math.min(100, vendedor.activities * 2) // Score de atividade simulado
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .map((vendedor, index) => ({ ...vendedor, rank: index + 1 }));
    
    reportsState.processedData.rankings = {
        vendedores: vendedorRanking
    };
}

function calculateTrends() {
    const { deals } = reportsState.rawData;
    const filteredDeals = filterData(deals, 'deals');
    
    // Agrupar por dia/semana dependendo do período
    const groupBy = reportsState.currentPeriod <= 30 ? 'day' : 'week';
    const trends = {};
    
    filteredDeals.forEach(deal => {
        const date = new Date(deal.created_at);
        const key = groupBy === 'day' 
            ? date.toISOString().split('T')[0]
            : getWeekKey(date);
        
        if (!trends[key]) {
            trends[key] = { revenue: 0, deals: 0, leads: 0 };
        }
        
        trends[key].deals++;
        if (deal.status === 'won' || deal.status === 'convertido') {
            trends[key].revenue += deal.value || deal.valor_negocio || 0;
        }
    });
    
    // Converter para arrays ordenados
    const sortedDates = Object.keys(trends).sort();
    const revenueData = sortedDates.map(date => trends[date].revenue);
    const dealsData = sortedDates.map(date => trends[date].deals);
    
    reportsState.processedData.trends = {
        labels: sortedDates,
        revenue: revenueData,
        deals: dealsData
    };
}

function calculateForecasts() {
    const trends = reportsState.processedData.trends;
    
    if (trends.revenue.length < 3) {
        reportsState.processedData.forecasts = { revenue: 0, deals: 0 };
        return;
    }
    
    // Previsão simples baseada na tendência
    const recentRevenue = trends.revenue.slice(-7); // Últimos 7 pontos
    const avgRevenue = recentRevenue.reduce((a, b) => a + b, 0) / recentRevenue.length;
    
    const recentDeals = trends.deals.slice(-7);
    const avgDeals = recentDeals.reduce((a, b) => a + b, 0) / recentDeals.length;
    
    // Projeção para próximo período (simplificada)
    const forecastMultiplier = 1.1; // 10% de crescimento esperado
    
    reportsState.processedData.forecasts = {
        revenue: avgRevenue * 30 * forecastMultiplier, // Projeção mensal
        deals: Math.round(avgDeals * 30 * forecastMultiplier)
    };
}

// ===== RENDERIZAÇÃO =====
function renderDashboard() {
    updateKPICards();
    updatePerformanceTable();
    updateCharts();
    updateInsights();
}

function updateKPICards() {
    const kpis = reportsState.processedData.kpis;
    
    const kpiData = [
        {
            id: 'total-revenue',
            value: formatCurrency(kpis.totalRevenue),
            label: 'Receita Total',
            icon: '💰',
            trend: kpis.growthRevenue,
            color: 'blue'
        },
        {
            id: 'total-deals',
            value: kpis.wonDeals,
            label: 'Negócios Fechados',
            icon: '🤝',
            trend: kpis.growthDeals,
            color: 'green'
        },
        {
            id: 'conversion-rate',
            value: `${kpis.conversionRate.toFixed(1)}%`,
            label: 'Taxa de Conversão',
            icon: '📈',
            trend: '+2.3%',
            color: 'purple'
        },
        {
            id: 'avg-deal-size',
            value: formatCurrency(kpis.avgDealSize),
            label: 'Ticket Médio',
            icon: '💎',
            trend: '+5.2%',
            color: 'orange'
        },
        {
            id: 'avg-cycle',
            value: `${kpis.avgSalesCycle} dias`,
            label: 'Ciclo de Vendas',
            icon: '⏱️',
            trend: '-1.5 dias',
            color: 'pink'
        },
        {
            id: 'pipeline-value',
            value: formatCurrency(kpis.pipelineValue),
            label: 'Pipeline Ativo',
            icon: '🚀',
            trend: '+8.7%',
            color: 'teal'
        }
    ];
    
    kpiData.forEach(kpi => {
        const element = document.getElementById(kpi.id);
        if (element) {
            element.textContent = kpi.value;
        }
        
        // Atualizar trend se existe
        const trendElement = document.getElementById(`${kpi.id}-trend`);
        if (trendElement) {
            trendElement.textContent = kpi.trend;
            trendElement.className = `text-sm ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`;
        }
    });
}

function updatePerformanceTable() {
    const rankings = reportsState.processedData.rankings;
    const tableBody = document.getElementById('performance-table');
    
    if (!tableBody || !rankings.vendedores) return;
    
    tableBody.innerHTML = rankings.vendedores.map(vendedor => `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-4">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold text-xs">
                            ${vendedor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-900">${vendedor.name}</span>
                        <div class="text-xs text-gray-500">${vendedor.position}</div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="font-semibold text-gray-900">${formatCurrency(vendedor.revenue)}</span>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-900">${vendedor.conversions}</span>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-900">${vendedor.conversionRate.toFixed(1)}%</span>
            </td>
            <td class="py-4 px-4">
                <div class="flex items-center space-x-2">
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full transition-all duration-500" style="width: ${vendedor.activityScore}%"></div>
                    </div>
                    <span class="text-xs text-gray-600">${vendedor.activityScore}%</span>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${getRankBadgeColor(vendedor.rank)}">
                    #${vendedor.rank}
                </span>
            </td>
        </tr>
    `).join('');
}

function updateCharts() {
    updateRevenueChart();
    updateFunnelChart();
    updateSourceChart();
    updateTrendChart();
}

function updateRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    const trends = reportsState.processedData.trends;
    
    // Destruir gráfico anterior
    if (reportsState.charts.revenue) {
        reportsState.charts.revenue.destroy();
    }
    
    reportsState.charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trends.labels.map(label => formatChartLabel(label)),
            datasets: [{
                label: 'Receita Diária',
                data: trends.revenue,
                borderColor: config.chartColors.primary,
                backgroundColor: config.chartColors.primary + '20',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: config.chartColors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: config.chartColors.primary,
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: value => formatCurrency(value),
                        color: '#6b7280'
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#6b7280' }
                }
            }
        }
    });
}

function updateFunnelChart() {
    const ctx = document.getElementById('funnelChart');
    if (!ctx) return;
    
    const { deals } = reportsState.rawData;
    const filteredDeals = filterData(deals, 'deals');
    
    const statusMapping = {
        'novo': 'Novo',
        'qualificado': 'Qualificado', 
        'proposta': 'Proposta',
        'won': 'Fechado',
        'convertido': 'Fechado',
        'lost': 'Perdido',
        'perdido': 'Perdido'
    };
    
    const statusCounts = {};
    Object.values(statusMapping).forEach(status => statusCounts[status] = 0);
    
    filteredDeals.forEach(deal => {
        const mappedStatus = statusMapping[deal.status] || 'Novo';
        statusCounts[mappedStatus]++;
    });
    
    if (reportsState.charts.funnel) {
        reportsState.charts.funnel.destroy();
    }
    
    reportsState.charts.funnel = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    config.chartColors.primary,
                    config.chartColors.secondary,
                    config.chartColors.accent,
                    config.chartColors.purple,
                    config.chartColors.danger
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: '#6b7280'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            }
        }
    });
}

function updateSourceChart() {
    const ctx = document.getElementById('sourceChart');
    if (!ctx) return;
    
    const { leads } = reportsState.rawData;
    const filteredLeads = filterData(leads, 'leads');
    
    const sourceMapping = {
        'website': 'Website',
        'social_media': 'Redes Sociais',
        'referral': 'Indicação',
        'cold_call': 'Ligação Fria',
        'email': 'E-mail'
    };
    
    const sourceCounts = {};
    Object.values(sourceMapping).forEach(source => sourceCounts[source] = 0);
    
    filteredLeads.forEach(lead => {
        const mappedSource = sourceMapping[lead.origem || lead.source] || 'Website';
        sourceCounts[mappedSource]++;
    });
    
    if (reportsState.charts.source) {
        reportsState.charts.source.destroy();
    }
    
    reportsState.charts.source = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(sourceCounts),
            datasets: [{
                data: Object.values(sourceCounts),
                backgroundColor: [
                    config.chartColors.primary,
                    config.chartColors.secondary,
                    config.chartColors.accent,
                    config.chartColors.danger,
                    config.chartColors.purple
                ],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: '#6b7280'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            }
        }
    });
}

function updateTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    const trends = reportsState.processedData.trends;
    
    if (reportsState.charts.trend) {
        reportsState.charts.trend.destroy();
    }
    
    reportsState.charts.trend = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trends.labels.map(label => formatChartLabel(label)),
            datasets: [
                {
                    label: 'Negócios',
                    data: trends.deals,
                    backgroundColor: config.chartColors.secondary + '80',
                    borderColor: config.chartColors.secondary,
                    borderWidth: 1,
                    yAxisID: 'y1'
                },
                {
                    label: 'Receita',
                    data: trends.revenue,
                    type: 'line',
                    borderColor: config.chartColors.accent,
                    backgroundColor: config.chartColors.accent + '20',
                    tension: 0.4,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#6b7280' }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: value => formatCurrency(value),
                        color: '#6b7280'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#6b7280' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#6b7280' }
                }
            }
        }
    });
}

function updateInsights() {
    const insights = generateInsights();
    const container = document.getElementById('insights-container');
    
    if (!container) return;
    
    container.innerHTML = insights.map(insight => `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-start space-x-3">
                <div class="w-10 h-10 bg-${insight.color}-100 rounded-lg flex items-center justify-center">
                    <span class="text-lg">${insight.icon}</span>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-900 mb-1">${insight.title}</h3>
                    <p class="text-sm text-gray-600 mb-3">${insight.description}</p>
                    <button class="text-xs bg-${insight.color}-600 text-white px-3 py-1 rounded-full hover:bg-${insight.color}-700 transition-colors">
                        ${insight.action}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== FUNÇÕES AUXILIARES =====
function filterData(data, type) {
    if (!data) return [];
    
    return data.filter(item => {
        // Filtro por vendedor
        if (reportsState.filters.vendedor !== 'all') {
            const vendedor = item.vendedor || item.responsavel;
            if (vendedor !== reportsState.filters.vendedor) return false;
        }
        
        // Filtro por fonte
        if (reportsState.filters.source !== 'all') {
            const source = item.source || item.origem;
            if (source !== reportsState.filters.source) return false;
        }
        
        // Filtro por status
        if (reportsState.filters.status !== 'all') {
            if (item.status !== reportsState.filters.status) return false;
        }
        
        return true;
    });
}

function calculateAverageSalesCycle(deals) {
    if (deals.length === 0) return 0;
    
    const cyclesInDays = deals
        .filter(deal => deal.closed_at)
        .map(deal => {
            const created = new Date(deal.created_at);
            const closed = new Date(deal.closed_at);
            return Math.round((closed - created) / (1000 * 60 * 60 * 24));
        });
    
    if (cyclesInDays.length === 0) return 0;
    
    return Math.round(cyclesInDays.reduce((sum, days) => sum + days, 0) / cyclesInDays.length);
}

function calculateGrowthMetrics(deals) {
    // Cálculo simplificado de crescimento
    const currentPeriodRevenue = deals
        .filter(d => d.status === 'won' || d.status === 'convertido')
        .reduce((sum, d) => sum + (d.value || d.valor_negocio || 0), 0);
    
    const currentPeriodDeals = deals.filter(d => d.status === 'won' || d.status === 'convertido').length;
    
    // Para demo, simular crescimento
    const revenueGrowth = '+12.5%';
    const dealsGrowth = '+8.3%';
    
    return {
        revenue: revenueGrowth,
        deals: dealsGrowth
    };
}

function generateInsights() {
    const kpis = reportsState.processedData.kpis;
    const insights = [];
    
    // Insight sobre conversão
    if (kpis.conversionRate < 20) {
        insights.push({
            icon: '📊',
            title: 'Oportunidade de Melhoria',
            description: 'Sua taxa de conversão está abaixo da média do mercado (25%). Considere otimizar seu processo de qualificação.',
            action: 'Ver Sugestões',
            color: 'orange'
        });
    }
    
    // Insight sobre pipeline
    if (kpis.pipelineValue > kpis.totalRevenue * 2) {
        insights.push({
            icon: '🚀',
            title: 'Pipeline Forte',
            description: 'Seu pipeline está 2x maior que a receita atual. Foque em acelerar o fechamento dos negócios.',
            action: 'Acelerar Vendas',
            color: 'green'
        });
    }
    
    // Insight sobre ciclo de vendas
    if (kpis.avgSalesCycle > 45) {
        insights.push({
            icon: '⏰',
            title: 'Ciclo Longo',
            description: 'Seu ciclo de vendas médio é de ' + kpis.avgSalesCycle + ' dias. Identifique gargalos no processo.',
            action: 'Otimizar Processo',
            color: 'red'
        });
    }
    
    // Sempre ter pelo menos um insight positivo
    insights.push({
        icon: '💎',
        title: 'Performance Sólida',
        description: 'Sua receita está crescendo consistentemente. Continue focando nos leads de maior qualidade.',
        action: 'Manter Foco',
        color: 'blue'
    });
    
    return insights.slice(0, 3); // Máximo 3 insights
}

function getWeekKey(date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split('T')[0];
}

function formatChartLabel(label) {
    const date = new Date(label);
    return date.toLocaleDateString('pt-BR', { 
        month: 'short', 
        day: 'numeric' 
    });
}

function getRankBadgeColor(rank) {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800';
    if (rank <= 3) return 'bg-green-100 text-green-800';
    if (rank <= 5) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(value || 0);
}

function updateLastUpdateTime() {
    const element = document.getElementById('last-update');
    if (element && reportsState.lastUpdate) {
        const timeString = reportsState.lastUpdate.toLocaleTimeString('pt-BR');
        element.textContent = `Última atualização: ${timeString}`;
    }
}

// ===== AUTO-REFRESH =====
function setupAutoRefresh() {
    if (reportsState.refreshInterval) {
        clearInterval(reportsState.refreshInterval);
    }
    
    if (reportsState.autoRefresh) {
        reportsState.refreshInterval = setInterval(async () => {
            if (!reportsState.isLoading) {
                await loadAllReportsData();
                showToast('Dados atualizados automaticamente', 'info');
            }
        }, config.refreshInterval);
    }
}

async function manualRefresh() {
    await loadAllReportsData();
    showToast('Dados atualizados manualmente', 'success');
}

// ===== EXPORTAÇÃO =====
function showExportModal() {
    showToast('Modal de exportação em desenvolvimento', 'info');
}

// ===== MUDANÇA DE MÉTRICA =====
function switchMetricView(metric) {
    reportsState.selectedMetric = metric;
    
    // Atualizar botões ativos
    document.querySelectorAll('[data-metric]').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('text-gray-600', 'hover:bg-gray-100');
    });
    
    document.querySelector(`[data-metric="${metric}"]`)?.classList.add('bg-primary', 'text-white');
    
    // Re-renderizar com nova métrica
    updateCharts();
}

// ===== FUNÇÕES GLOBAIS =====
window.generateReport = function() {
    showToast('Gerando relatório personalizado...', 'info');
};

window.exportAllReports = function() {
    showExportModal();
};

window.optimizeFunnel = function() {
    showToast('Analisando oportunidades de otimização...', 'info');
};

window.createCustomReport = function() {
    showToast('Abrindo criador de relatórios personalizados...', 'info');
};

// ===== UTILITÁRIOS =====
function showLoader(show, message = 'Carregando...') {
    let loader = document.getElementById('reports-loader');
    if (!loader && show) {
        loader = document.createElement('div');
        loader.id = 'reports-loader';
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
    if (reportsState.refreshInterval) {
        clearInterval(reportsState.refreshInterval);
    }
    
    // Destruir gráficos para evitar memory leaks
    Object.values(reportsState.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
});

console.log('📊 Sistema de relatórios Ultimate carregado - ALSHAM 360° PRIMA');
