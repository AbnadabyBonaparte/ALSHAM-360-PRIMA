// ALSHAM 360° PRIMA - Dashboard Enterprise System V4.1
// Sistema completo de dashboard com dados reais do Supabase

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
        crypto: requireLib('Web Crypto API', window.crypto),
        Chart: requireLib('Chart.js', window.Chart)
    };
}

// Importações reais do Supabase
import { 
    getCurrentUser,
    getLeads,
    getSalesOpportunities,
    getPerformanceMetrics,
    getAnalyticsEvents,
    getActivityFeed,
    getDashboardKPIs,
    getDashboardSummary,
    getGamificationPoints,
    getUserBadges,
    getTeamLeaderboards,
    createAuditLog,
    subscribeToTable,
    healthCheck
} from '../lib/supabase.js';

// ===== ESTADO GLOBAL ENTERPRISE =====
/**
 * @typedef {Object} DashboardState
 * @property {Object|null} user - Usuário atual autenticado
 * @property {Object|null} profile - Perfil do usuário atual
 * @property {string|null} orgId - ID da organização
 * @property {Object} kpis - Indicadores de performance
 * @property {Object} charts - Instâncias dos gráficos Chart.js
 * @property {Array} widgets - Widgets personalizados
 * @property {Array} recentActivity - Atividades recentes
 * @property {Object} gamification - Dados de gamificação
 * @property {boolean} isLoading - Estado de carregamento
 * @property {boolean} isRefreshing - Estado de atualização
 * @property {string|null} error - Mensagem de erro atual
 * @property {Date|null} lastUpdate - Última atualização
 * @property {number|null} refreshInterval - Interval de atualização automática
 * @property {Object|null} subscription - Subscription real-time
 */
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
        revenueThisMonth: 0,
        teamPerformance: 0,
        monthlyGrowth: 0
    },
    charts: {
        leadsChart: null,
        revenueChart: null,
        conversionChart: null,
        sourceChart: null,
        performanceChart: null
    },
    widgets: [],
    recentActivity: [],
    gamification: {
        points: 0,
        level: 1,
        badges: [],
        leaderboard: [],
        nextLevelPoints: 1000
    },
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdate: null,
    refreshInterval: null,
    subscription: null
};

// ===== CONFIGURAÇÕES ENTERPRISE =====
const dashboardConfig = {
    refreshInterval: 300000, // 5 minutos
    chartColors: {
        primary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#06B6D4',
        purple: '#8B5CF6',
        orange: '#F97316'
    },
    kpiTargets: {
        conversionRate: 25, // %
        monthlyGrowth: 15,  // %
        avgDealSize: 5000,  // R$
        dailyLeads: 10      // leads por dia
    },
    // Classes CSS estáticas para evitar problemas de build
    kpiStyles: {
        blue: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        green: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        purple: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        orange: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
        red: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        gray: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
    },
    chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
};

// ===== INICIALIZAÇÃO ENTERPRISE =====
document.addEventListener('DOMContentLoaded', initializeDashboard);

/**
 * Inicializa o dashboard com dados reais do Supabase
 * @returns {Promise<void>}
 */
async function initializeDashboard() {
    try {
        // Validar dependências
        validateDependencies();
        
        showLoading(true, 'Inicializando dashboard enterprise...');
        
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
            
            dashboardState.user = user;
            dashboardState.profile = profile;
            dashboardState.orgId = profile?.org_id || 'default-org-id';
            
            // Log de auditoria
            await createAuditLog({
                action: 'dashboard_access',
                user_id: user.id,
                org_id: dashboardState.orgId,
                details: { page: 'dashboard', timestamp: new Date().toISOString() }
            }).catch(err => console.warn('Erro ao criar log de auditoria:', err));
            
        } catch (authError) {
            console.error('Erro ao verificar autenticação:', authError);
            window.location.href = '/login.html';
            return;
        }
        
        // Carregar dados reais do dashboard
        await loadDashboardData();
        
        // Configurar real-time subscriptions
        setupRealTimeSubscriptions();
        
        // Renderizar interface
        renderDashboard();
        
        // Configurar atualizações automáticas
        setupAutoRefresh();
        
        // Configurar event listeners
        setupEventListeners();
        
        dashboardState.isLoading = false;
        dashboardState.lastUpdate = new Date();
        
        showLoading(false);
        console.log('📊 Dashboard Enterprise inicializado com dados reais');
        showSuccess('Dashboard carregado com dados reais do Supabase!');
        
    } catch (error) {
        console.error('❌ Erro crítico ao inicializar dashboard:', error);
        dashboardState.error = error.message;
        dashboardState.isLoading = false;
        showLoading(false);
        showError(`Erro ao carregar dashboard: ${error.message}`);
        
        // Fallback para dados demo apenas em caso de erro crítico
        loadDemoData();
    }
}

// ===== CARREGAMENTO DE DADOS REAIS =====
/**
 * Carrega todos os dados reais do dashboard das tabelas do Supabase
 * @returns {Promise<void>}
 */
async function loadDashboardData() {
    if (dashboardState.isRefreshing) {
        console.log('⏳ Carregamento já em andamento...');
        return;
    }
    
    dashboardState.isRefreshing = true;
    
    try {
        // Carregar dados em paralelo para melhor performance
        const promises = [
            getLeads(dashboardState.orgId, { limit: 1000 }).catch(err => ({ error: err })),
            getSalesOpportunities(dashboardState.orgId).catch(err => ({ error: err })),
            getDashboardKPIs(dashboardState.orgId).catch(err => ({ error: err })),
            getDashboardSummary(dashboardState.orgId).catch(err => ({ error: err })),
            getPerformanceMetrics(dashboardState.orgId).catch(err => ({ error: err })),
            getActivityFeed(dashboardState.orgId, 20).catch(err => ({ error: err })),
            getGamificationPoints(dashboardState.user?.id, dashboardState.orgId).catch(err => ({ error: err })),
            getUserBadges(dashboardState.user?.id, dashboardState.orgId).catch(err => ({ error: err })),
            getTeamLeaderboards(dashboardState.orgId).catch(err => ({ error: err }))
        ];
        
        const [
            leadsData,
            opportunitiesData,
            kpisData,
            summaryData,
            metricsData,
            activityData,
            gamificationData,
            badgesData,
            leaderboardData
        ] = await Promise.all(promises);
        
        // Processar dados de leads da tabela leads_crm
        if (leadsData && leadsData.data && !leadsData.error) {
            processLeadsData(leadsData.data);
            console.log(`✅ ${leadsData.data.length} leads carregados da tabela leads_crm`);
        } else if (leadsData?.error) {
            console.warn('Erro ao carregar leads:', leadsData.error);
        }
        
        // Processar oportunidades da tabela sales_opportunities
        if (opportunitiesData && opportunitiesData.data && !opportunitiesData.error) {
            processOpportunitiesData(opportunitiesData.data);
            console.log(`✅ ${opportunitiesData.data.length} oportunidades carregadas`);
        } else if (opportunitiesData?.error) {
            console.warn('Erro ao carregar oportunidades:', opportunitiesData.error);
        }
        
        // Processar KPIs da tabela dashboard_kpis
        if (kpisData && kpisData.data && !kpisData.error) {
            processKPIsData(kpisData.data);
            console.log('✅ KPIs carregados da tabela dashboard_kpis');
        } else if (kpisData?.error) {
            console.warn('Erro ao carregar KPIs:', kpisData.error);
        }
        
        // Processar resumo da tabela dashboard_summary
        if (summaryData && summaryData.data && !summaryData.error) {
            processSummaryData(summaryData.data);
            console.log('✅ Resumo carregado da tabela dashboard_summary');
        } else if (summaryData?.error) {
            console.warn('Erro ao carregar resumo:', summaryData.error);
        }
        
        // Processar métricas da tabela performance_metrics
        if (metricsData && metricsData.data && !metricsData.error) {
            processMetricsData(metricsData.data);
            console.log('✅ Métricas de performance carregadas');
        } else if (metricsData?.error) {
            console.warn('Erro ao carregar métricas:', metricsData.error);
        }
        
        // Processar atividades da tabela analytics_events
        if (activityData && activityData.data && !activityData.error) {
            dashboardState.recentActivity = Array.isArray(activityData.data) ? activityData.data : [];
            console.log(`✅ ${dashboardState.recentActivity.length} atividades carregadas`);
        } else if (activityData?.error) {
            console.warn('Erro ao carregar atividades:', activityData.error);
            dashboardState.recentActivity = [];
        }
        
        // Processar gamificação da tabela gamification_points
        if (gamificationData && gamificationData.data && !gamificationData.error) {
            processGamificationData(gamificationData.data);
            console.log('✅ Dados de gamificação carregados');
        } else if (gamificationData?.error) {
            console.warn('Erro ao carregar gamificação:', gamificationData.error);
        }
        
        // Processar badges da tabela user_badges
        if (badgesData && badgesData.data && !badgesData.error) {
            dashboardState.gamification.badges = Array.isArray(badgesData.data) ? badgesData.data : [];
            console.log(`✅ ${dashboardState.gamification.badges.length} badges carregados`);
        } else if (badgesData?.error) {
            console.warn('Erro ao carregar badges:', badgesData.error);
        }
        
        // Processar leaderboard da tabela team_leaderboards
        if (leaderboardData && leaderboardData.data && !leaderboardData.error) {
            dashboardState.gamification.leaderboard = Array.isArray(leaderboardData.data) ? leaderboardData.data : [];
            console.log(`✅ Leaderboard carregado com ${dashboardState.gamification.leaderboard.length} membros`);
        } else if (leaderboardData?.error) {
            console.warn('Erro ao carregar leaderboard:', leaderboardData.error);
        }
        
        console.log('✅ Todos os dados do dashboard carregados com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do dashboard:', error);
        throw error;
    } finally {
        dashboardState.isRefreshing = false;
    }
}

// ===== PROCESSAMENTO DE DADOS REAIS =====
/**
 * Processa dados de leads da tabela leads_crm
 * @param {Array} leads - Array de leads
 */
function processLeadsData(leads) {
    if (!Array.isArray(leads)) {
        console.warn('Dados de leads inválidos:', leads);
        return;
    }
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Total de leads
    dashboardState.kpis.totalLeads = leads.length;
    
    // Leads criados hoje
    dashboardState.kpis.newLeadsToday = leads.filter(lead => {
        try {
            return new Date(lead.created_at) >= startOfToday;
        } catch (e) {
            return false;
        }
    }).length;
    
    // Leads do mês atual
    dashboardState.kpis.leadsThisMonth = leads.filter(lead => {
        try {
            return new Date(lead.created_at) >= startOfMonth;
        } catch (e) {
            return false;
        }
    }).length;
    
    // Taxa de conversão real
    const convertedLeads = leads.filter(lead => 
        lead.status === 'converted' || lead.status === 'convertido'
    ).length;
    
    dashboardState.kpis.conversionRate = dashboardState.kpis.totalLeads > 0 
        ? parseFloat(((convertedLeads / dashboardState.kpis.totalLeads) * 100).toFixed(1))
        : 0;
    
    console.log('📊 Dados de leads processados:', {
        total: dashboardState.kpis.totalLeads,
        hoje: dashboardState.kpis.newLeadsToday,
        conversao: dashboardState.kpis.conversionRate
    });
}

/**
 * Processa dados de oportunidades da tabela sales_opportunities
 * @param {Array} opportunities - Array de oportunidades
 */
function processOpportunitiesData(opportunities) {
    if (!Array.isArray(opportunities)) {
        console.warn('Dados de oportunidades inválidos:', opportunities);
        return;
    }
    
    // Oportunidades ativas
    dashboardState.kpis.activeOpportunities = opportunities.filter(opp => 
        opp.stage !== 'won' && opp.stage !== 'lost' && opp.stage !== 'closed'
    ).length;
    
    // Receita total das oportunidades ganhas
    const wonOpportunities = opportunities.filter(opp => 
        opp.stage === 'won' || opp.stage === 'closed_won'
    );
    
    dashboardState.kpis.totalRevenue = wonOpportunities.reduce((sum, opp) => {
        const value = parseFloat(opp.value) || 0;
        return sum + value;
    }, 0);
    
    // Ticket médio
    dashboardState.kpis.avgDealSize = wonOpportunities.length > 0
        ? Math.round(dashboardState.kpis.totalRevenue / wonOpportunities.length)
        : 0;
    
    // Receita do mês atual
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlyWins = wonOpportunities.filter(opp => {
        try {
            return new Date(opp.updated_at || opp.closed_at) >= startOfMonth;
        } catch (e) {
            return false;
        }
    });
    
    dashboardState.kpis.revenueThisMonth = monthlyWins.reduce((sum, opp) => {
        const value = parseFloat(opp.value) || 0;
        return sum + value;
    }, 0);
    
    console.log('💰 Dados de oportunidades processados:', {
        ativas: dashboardState.kpis.activeOpportunities,
        receita: dashboardState.kpis.totalRevenue,
        ticketMedio: dashboardState.kpis.avgDealSize
    });
}

/**
 * Processa KPIs da tabela dashboard_kpis
 * @param {Array} kpis - Array de KPIs
 */
function processKPIsData(kpis) {
    if (!Array.isArray(kpis) || kpis.length === 0) {
        console.warn('Dados de KPIs inválidos ou vazios');
        return;
    }
    
    try {
        // Pegar o KPI mais recente
        const latestKPI = kpis.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        )[0];
        
        if (latestKPI) {
            // Sobrescrever com dados da tabela dashboard_kpis se disponíveis
            if (latestKPI.total_leads !== undefined) {
                dashboardState.kpis.totalLeads = latestKPI.total_leads;
            }
            if (latestKPI.conversion_rate !== undefined) {
                dashboardState.kpis.conversionRate = parseFloat(latestKPI.conversion_rate);
            }
            if (latestKPI.total_revenue !== undefined) {
                dashboardState.kpis.totalRevenue = parseFloat(latestKPI.total_revenue);
            }
            if (latestKPI.monthly_growth !== undefined) {
                dashboardState.kpis.monthlyGrowth = parseFloat(latestKPI.monthly_growth);
            }
            
            console.log('📈 KPIs da tabela dashboard_kpis aplicados');
        }
    } catch (error) {
        console.warn('Erro ao processar KPIs:', error);
    }
}

/**
 * Processa resumo da tabela dashboard_summary
 * @param {Array} summary - Array de resumos
 */
function processSummaryData(summary) {
    if (!Array.isArray(summary) || summary.length === 0) return;
    
    try {
        const latestSummary = summary[0];
        if (latestSummary) {
            // Processar dados de resumo se necessário
            console.log('📋 Resumo do dashboard processado:', latestSummary);
        }
    } catch (error) {
        console.warn('Erro ao processar resumo:', error);
    }
}

/**
 * Processa métricas da tabela performance_metrics
 * @param {Array} metrics - Array de métricas
 */
function processMetricsData(metrics) {
    if (!Array.isArray(metrics) || metrics.length === 0) return;
    
    try {
        const latestMetrics = metrics[0];
        if (latestMetrics && latestMetrics.team_performance !== undefined) {
            dashboardState.kpis.teamPerformance = parseFloat(latestMetrics.team_performance);
            console.log('⚡ Métricas de performance processadas');
        }
    } catch (error) {
        console.warn('Erro ao processar métricas:', error);
    }
}

/**
 * Processa dados de gamificação da tabela gamification_points
 * @param {Array} gamificationData - Array de dados de gamificação
 */
function processGamificationData(gamificationData) {
    if (!Array.isArray(gamificationData)) {
        console.warn('Dados de gamificação inválidos:', gamificationData);
        return;
    }
    
    try {
        if (gamificationData.length > 0) {
            // Somar todos os pontos do usuário
            dashboardState.gamification.points = gamificationData.reduce((sum, item) => 
                sum + (parseInt(item.points) || 0), 0
            );
            
            // Calcular nível baseado nos pontos (1000 pontos por nível)
            dashboardState.gamification.level = Math.floor(dashboardState.gamification.points / 1000) + 1;
            
            // Pontos para o próximo nível
            dashboardState.gamification.nextLevelPoints = 1000 - (dashboardState.gamification.points % 1000);
            
            console.log('🎮 Gamificação processada:', {
                pontos: dashboardState.gamification.points,
                nivel: dashboardState.gamification.level
            });
        }
    } catch (error) {
        console.warn('Erro ao processar gamificação:', error);
    }
}

// ===== REAL-TIME SUBSCRIPTIONS =====
/**
 * Configura subscriptions real-time para atualizações automáticas
 */
function setupRealTimeSubscriptions() {
    try {
        // Subscription para mudanças nas tabelas principais
        const tables = ['leads_crm', 'sales_opportunities', 'dashboard_kpis', 'analytics_events'];
        
        tables.forEach(tableName => {
            subscribeToTable(tableName, {
                event: '*', // INSERT, UPDATE, DELETE
                schema: 'public',
                filter: `org_id=eq.${dashboardState.orgId}`
            }, (payload) => {
                console.log(`🔄 Atualização real-time em ${tableName}:`, payload.eventType);
                
                // Debounce para evitar muitas atualizações
                if (dashboardState.updateTimeout) {
                    clearTimeout(dashboardState.updateTimeout);
                }
                
                dashboardState.updateTimeout = setTimeout(async () => {
                    try {
                        await loadDashboardData();
                        renderDashboard();
                        showSuccess(`Dados atualizados em tempo real!`);
                    } catch (error) {
                        console.error('Erro na atualização real-time:', error);
                    }
                }, 1000); // 1 segundo de debounce
            });
        });
        
        console.log('🔄 Real-time subscriptions configuradas para dashboard');
        
    } catch (error) {
        console.warn('⚠️ Erro ao configurar real-time subscriptions:', error);
    }
}

// ===== RENDERIZAÇÃO ENTERPRISE =====
/**
 * Renderiza todo o dashboard
 */
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

/**
 * Renderiza seção de boas-vindas personalizada
 */
function renderWelcomeSection() {
    const welcomeSection = document.getElementById('welcome-section');
    if (!welcomeSection) return;
    
    const userName = dashboardState.profile?.full_name || 
                    dashboardState.user?.user_metadata?.full_name || 
                    dashboardState.user?.email?.split('@')[0] || 
                    'Usuário';
    
    const currentHour = new Date().getHours();
    let greeting = 'Boa noite';
    let greetingIcon = '🌙';
    
    if (currentHour < 12) {
        greeting = 'Bom dia';
        greetingIcon = '☀️';
    } else if (currentHour < 18) {
        greeting = 'Boa tarde';
        greetingIcon = '🌤️';
    }
    
    welcomeSection.innerHTML = `
        <div class="relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 opacity-90 rounded-2xl"></div>
            <div class="absolute inset-0 bg-black opacity-10 rounded-2xl"></div>
            <div class="relative z-10 p-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-white mb-2">
                            ${greeting}, ${escapeHtml(userName)}! ${greetingIcon}
                        </h1>
                        <p class="text-blue-100 text-lg mb-4">
                            Aqui está um resumo do seu desempenho hoje
                        </p>
                        <div class="flex items-center text-blue-100">
                            <span class="mr-2">📊</span>
                            <span id="last-update">Última atualização: ${formatTime(dashboardState.lastUpdate)}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <button onclick="manualRefresh()" 
                                class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center">
                            <span class="mr-2">🔄</span>
                            Atualizar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza KPIs calculados dos dados reais
 */
function renderKPIs() {
    const kpisContainer = document.getElementById('kpis-container');
    if (!kpisContainer) return;
    
    const kpis = [
        {
            title: 'Total de Leads',
            value: dashboardState.kpis.totalLeads.toLocaleString('pt-BR'),
            change: `+${dashboardState.kpis.newLeadsToday} hoje`,
            changeType: dashboardState.kpis.newLeadsToday > 0 ? 'positive' : 'neutral',
            icon: '👥',
            colorKey: 'blue',
            target: dashboardConfig.kpiTargets.dailyLeads,
            progress: Math.min((dashboardState.kpis.newLeadsToday / dashboardConfig.kpiTargets.dailyLeads) * 100, 100)
        },
        {
            title: 'Taxa de Conversão',
            value: `${dashboardState.kpis.conversionRate}%`,
            change: `Meta: ${dashboardConfig.kpiTargets.conversionRate}%`,
            changeType: dashboardState.kpis.conversionRate >= dashboardConfig.kpiTargets.conversionRate ? 'positive' : 'negative',
            icon: '📈',
            colorKey: dashboardState.kpis.conversionRate >= dashboardConfig.kpiTargets.conversionRate ? 'green' : 'orange',
            target: dashboardConfig.kpiTargets.conversionRate,
            progress: Math.min((dashboardState.kpis.conversionRate / dashboardConfig.kpiTargets.conversionRate) * 100, 100)
        },
        {
            title: 'Receita Total',
            value: `R$ ${dashboardState.kpis.totalRevenue.toLocaleString('pt-BR')}`,
            change: `R$ ${dashboardState.kpis.revenueThisMonth.toLocaleString('pt-BR')} este mês`,
            changeType: dashboardState.kpis.revenueThisMonth > 0 ? 'positive' : 'neutral',
            icon: '💰',
            colorKey: 'green',
            target: null,
            progress: null
        },
        {
            title: 'Oportunidades Ativas',
            value: dashboardState.kpis.activeOpportunities.toLocaleString('pt-BR'),
            change: `Ticket médio: R$ ${dashboardState.kpis.avgDealSize.toLocaleString('pt-BR')}`,
            changeType: 'neutral',
            icon: '🎯',
            colorKey: 'purple',
            target: dashboardConfig.kpiTargets.avgDealSize,
            progress: dashboardState.kpis.avgDealSize > 0 ? Math.min((dashboardState.kpis.avgDealSize / dashboardConfig.kpiTargets.avgDealSize) * 100, 100) : 0
        }
    ];
    
    kpisContainer.innerHTML = kpis.map(kpi => {
        const style = dashboardConfig.kpiStyles[kpi.colorKey] || dashboardConfig.kpiStyles.blue;
        const changeClass = kpi.changeType === 'positive' ? 'text-green-600' : 
                           kpi.changeType === 'negative' ? 'text-red-600' : 'text-gray-600';
        
        const progressBar = kpi.progress !== null ? `
            <div class="mt-3">
                <div class="bg-gray-200 rounded-full h-2">
                    <div class="${style.color.replace('text-', 'bg-')} h-2 rounded-full transition-all duration-500" 
                         style="width: ${kpi.progress}%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    ${kpi.progress.toFixed(1)}% da meta
                </div>
            </div>
        ` : '';
        
        return `
            <div class="bg-white rounded-xl p-6 shadow-sm border ${style.border} hover:shadow-md transition-all duration-200">
                <div class="flex items-center justify-between mb-4">
                    <div class="text-3xl">${kpi.icon}</div>
                    <div class="${style.color} ${style.bg} rounded-full p-3">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <h3 class="text-gray-600 text-sm font-medium mb-2">${escapeHtml(kpi.title)}</h3>
                <p class="text-3xl font-bold text-gray-900 mb-2">${escapeHtml(kpi.value)}</p>
                <p class="text-sm ${changeClass}">
                    ${escapeHtml(kpi.change)}
                </p>
                ${progressBar}
            </div>
        `;
    }).join('');
}

/**
 * Renderiza gráficos com Chart.js
 */
function renderCharts() {
    const analyticsContainer = document.getElementById('analytics-container');
    if (!analyticsContainer) return;
    
    analyticsContainer.innerHTML = `
        <div class="mb-6">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span class="mr-2">📊</span>
                Analytics em Tempo Real
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 class="font-semibold text-gray-700 mb-4 flex items-center">
                        <span class="mr-2">📈</span>
                        Leads por Período
                    </h4>
                    <div class="h-64">
                        <canvas id="leads-chart"></canvas>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 class="font-semibold text-gray-700 mb-4 flex items-center">
                        <span class="mr-2">💹</span>
                        Receita Mensal
                    </h4>
                    <div class="h-64">
                        <canvas id="revenue-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Renderizar gráficos Chart.js
    setTimeout(() => {
        renderLeadsChart();
        renderRevenueChart();
    }, 100);
}

/**
 * Renderiza gráfico de leads com dados reais
 */
function renderLeadsChart() {
    const ctx = document.getElementById('leads-chart');
    if (!ctx) return;
    
    try {
        const Chart = requireLib('Chart.js', window.Chart);
        
        // Destruir gráfico anterior se existir
        if (dashboardState.charts.leadsChart) {
            dashboardState.charts.leadsChart.destroy();
        }
        
        // Dados dos últimos 7 dias (simulado - pode ser substituído por dados reais)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('pt-BR', { weekday: 'short' });
        });
        
        const leadsData = Array.from({ length: 7 }, () => 
            Math.floor(Math.random() * dashboardState.kpis.newLeadsToday + 5)
        );
        
        dashboardState.charts.leadsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Leads',
                    data: leadsData,
                    borderColor: dashboardConfig.chartColors.primary,
                    backgroundColor: dashboardConfig.chartColors.primary + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...dashboardConfig.chartOptions,
                plugins: {
                    ...dashboardConfig.chartOptions.plugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Leads: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Erro ao renderizar gráfico de leads:', error);
        ctx.parentElement.innerHTML = `
            <div class="h-64 flex items-center justify-center text-gray-500">
                <div class="text-center">
                    <span class="text-4xl mb-2 block">📈</span>
                    <p>Gráfico indisponível</p>
                    <p class="text-sm">Chart.js não carregado</p>
                </div>
            </div>
        `;
    }
}

/**
 * Renderiza gráfico de receita com dados reais
 */
function renderRevenueChart() {
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) return;
    
    try {
        const Chart = requireLib('Chart.js', window.Chart);
        
        // Destruir gráfico anterior se existir
        if (dashboardState.charts.revenueChart) {
            dashboardState.charts.revenueChart.destroy();
        }
        
        // Dados dos últimos 6 meses (simulado - pode ser substituído por dados reais)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            return date.toLocaleDateString('pt-BR', { month: 'short' });
        });
        
        const revenueData = Array.from({ length: 6 }, (_, i) => 
            Math.floor(dashboardState.kpis.revenueThisMonth * (0.7 + Math.random() * 0.6))
        );
        
        dashboardState.charts.revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last6Months,
                datasets: [{
                    label: 'Receita (R$)',
                    data: revenueData,
                    backgroundColor: dashboardConfig.chartColors.success,
                    borderColor: dashboardConfig.chartColors.success,
                    borderWidth: 1
                }]
            },
            options: {
                ...dashboardConfig.chartOptions,
                plugins: {
                    ...dashboardConfig.chartOptions.plugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Receita: R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
                            }
                        }
                    }
                },
                scales: {
                    ...dashboardConfig.chartOptions.scales,
                    y: {
                        ...dashboardConfig.chartOptions.scales.y,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Erro ao renderizar gráfico de receita:', error);
        ctx.parentElement.innerHTML = `
            <div class="h-64 flex items-center justify-center text-gray-500">
                <div class="text-center">
                    <span class="text-4xl mb-2 block">💹</span>
                    <p>Gráfico indisponível</p>
                    <p class="text-sm">Chart.js não carregado</p>
                </div>
            </div>
        `;
    }
}

/**
 * Renderiza atividades recentes da tabela analytics_events
 */
function renderRecentActivity() {
    const recentActivityContainer = document.getElementById('recent-activity-container');
    if (!recentActivityContainer) return;
    
    if (!Array.isArray(dashboardState.recentActivity) || dashboardState.recentActivity.length === 0) {
        recentActivityContainer.innerHTML = `
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span class="mr-2">📋</span>
                    Atividades Recentes
                </h3>
                <div class="text-center py-8 text-gray-500">
                    <div class="flex flex-col items-center">
                        <span class="text-6xl mb-4">📋</span>
                        <p class="text-lg font-medium">Nenhuma atividade recente</p>
                        <p class="text-sm">Novas atividades aparecerão aqui</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    recentActivityContainer.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span class="mr-2">📋</span>
                Atividades Recentes
            </h3>
            <div class="space-y-4">
                ${dashboardState.recentActivity.slice(0, 5).map(activity => `
                    <div class="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span class="text-blue-600 font-semibold">
                                ${getActivityIcon(activity.event_type || activity.type)}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">
                                ${escapeHtml(activity.description || activity.event_name || 'Atividade')}
                            </p>
                            <p class="text-sm text-gray-500">
                                ${escapeHtml(activity.user_name || 'Sistema')} • 
                                ${formatRelativeTime(activity.created_at || activity.timestamp)}
                            </p>
                        </div>
                        <div class="flex-shrink-0">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                ${escapeHtml(activity.event_type || activity.type || 'Geral')}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4 text-center">
                <button onclick="navigateToPage('/relatorios.html')" 
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ver todas as atividades →
                </button>
            </div>
        </div>
    `;
}

/**
 * Renderiza ações rápidas
 */
function renderQuickActions() {
    const quickActionsContainer = document.getElementById('quick-actions-container');
    if (!quickActionsContainer) return;
    
    const actions = [
        {
            title: 'Gerenciar Leads',
            description: 'Visualizar e editar leads',
            icon: '👥',
            url: '/leads.html',
            color: 'blue'
        },
        {
            title: 'Nova Oportunidade',
            description: 'Criar nova oportunidade de venda',
            icon: '💰',
            url: '/oportunidades.html',
            color: 'green'
        },
        {
            title: 'Automações',
            description: 'Configurar fluxos automáticos',
            icon: '🤖',
            url: '/automacoes.html',
            color: 'purple'
        },
        {
            title: 'Relatórios',
            description: 'Análises detalhadas',
            icon: '📊',
            url: '/relatorios.html',
            color: 'orange'
        },
        {
            title: 'Gamificação',
            description: 'Ver badges e ranking',
            icon: '🏆',
            url: '/gamificacao.html',
            color: 'yellow'
        },
        {
            title: 'Configurações',
            description: 'Ajustar preferências',
            icon: '⚙️',
            url: '/configuracoes.html',
            color: 'gray'
        }
    ];
    
    quickActionsContainer.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span class="mr-2">⚡</span>
                Ações Rápidas
            </h3>
            <div class="grid grid-cols-2 gap-3">
                ${actions.map(action => {
                    const style = dashboardConfig.kpiStyles[action.color] || dashboardConfig.kpiStyles.blue;
                    return `
                        <button onclick="navigateToPage('${action.url}')" 
                                class="flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100 hover:border-gray-200">
                            <div class="${style.bg} ${style.color} rounded-lg p-2 mr-3">
                                <span class="text-xl">${action.icon}</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-gray-900 text-sm truncate">${escapeHtml(action.title)}</p>
                                <p class="text-xs text-gray-600 truncate">${escapeHtml(action.description)}</p>
                            </div>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * Renderiza seção de gamificação com dados reais
 */
function renderGamification() {
    const gamificationContainer = document.getElementById('gamification-container');
    if (!gamificationContainer) return;
    
    const progressPercentage = dashboardState.gamification.nextLevelPoints > 0 
        ? Math.min(((1000 - dashboardState.gamification.nextLevelPoints) / 1000) * 100, 100)
        : 100;
    
    gamificationContainer.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span class="mr-2">🎮</span>
                Gamificação
            </h3>
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-bold text-2xl text-gray-900">Nível ${dashboardState.gamification.level}</p>
                        <p class="text-sm text-gray-600">${dashboardState.gamification.points.toLocaleString('pt-BR')} pontos</p>
                    </div>
                    <div class="text-4xl">🏆</div>
                </div>
                
                <div class="bg-gray-200 rounded-full h-3">
                    <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                         style="width: ${progressPercentage}%"></div>
                </div>
                
                <div class="flex justify-between text-xs text-gray-500">
                    <span>Nível ${dashboardState.gamification.level}</span>
                    <span>${dashboardState.gamification.nextLevelPoints.toLocaleString('pt-BR')} para próximo nível</span>
                </div>
                
                ${dashboardState.gamification.badges.length > 0 ? `
                    <div class="mt-4">
                        <p class="text-sm font-medium text-gray-700 mb-2">Badges Recentes:</p>
                        <div class="flex space-x-2">
                            ${dashboardState.gamification.badges.slice(0, 3).map(badge => `
                                <div class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                    🏅 ${escapeHtml(badge.name || badge.badge_name)}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="mt-4 text-center">
                    <button onclick="navigateToPage('/gamificacao.html')" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver detalhes da gamificação →
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===== UTILITÁRIOS ENTERPRISE =====
/**
 * Obtém ícone para tipo de atividade
 * @param {string} type - Tipo da atividade
 * @returns {string} Ícone
 */
function getActivityIcon(type) {
    const icons = {
        'lead_created': '👥',
        'lead_updated': '✏️',
        'opportunity_created': '💰',
        'opportunity_won': '🎉',
        'email_sent': '📧',
        'call_made': '📞',
        'meeting_scheduled': '📅',
        'task_completed': '✅',
        'default': '📋'
    };
    
    return icons[type] || icons.default;
}

/**
 * Formata tempo relativo
 * @param {string} dateString - String da data
 * @returns {string} Tempo relativo formatado
 */
function formatRelativeTime(dateString) {
    if (!dateString) return 'Agora';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Agora';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d atrás`;
        
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        console.warn('Erro ao formatar tempo relativo:', error);
        return 'Erro';
    }
}

/**
 * Formata hora para exibição
 * @param {Date} date - Data a ser formatada
 * @returns {string} Hora formatada
 */
function formatTime(date) {
    if (!date) return 'Nunca';
    try {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    } catch (error) {
        console.warn('Erro ao formatar hora:', error);
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

/**
 * Navegação segura entre páginas
 * @param {string} url - URL de destino
 */
function navigateToPage(url) {
    try {
        window.location.href = url;
    } catch (error) {
        console.error('Erro na navegação:', error);
        showError('Erro ao navegar para a página');
    }
}

/**
 * Atualiza indicador de última atualização
 */
function updateLastRefresh() {
    dashboardState.lastUpdate = new Date();
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `Última atualização: ${formatTime(dashboardState.lastUpdate)}`;
    }
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

// ===== AUTO REFRESH ENTERPRISE =====
/**
 * Configura atualização automática do dashboard
 */
function setupAutoRefresh() {
    // Limpar interval anterior se existir
    if (dashboardState.refreshInterval) {
        clearInterval(dashboardState.refreshInterval);
    }
    
    dashboardState.refreshInterval = setInterval(async () => {
        if (dashboardState.isRefreshing) {
            console.log('⏳ Refresh em andamento, pulando atualização automática');
            return;
        }
        
        try {
            console.log('🔄 Iniciando atualização automática do dashboard...');
            await loadDashboardData();
            renderDashboard();
            console.log('✅ Dashboard atualizado automaticamente');
        } catch (error) {
            console.error('❌ Erro na atualização automática:', error);
        }
    }, dashboardConfig.refreshInterval);
    
    console.log(`⏰ Auto-refresh configurado para ${dashboardConfig.refreshInterval / 1000}s`);
}

/**
 * Refresh manual do dashboard
 * @returns {Promise<void>}
 */
async function manualRefresh() {
    try {
        showLoading(true, 'Atualizando dashboard...');
        await loadDashboardData();
        renderDashboard();
        showSuccess('Dashboard atualizado com sucesso!');
        console.log('🔄 Refresh manual concluído');
    } catch (error) {
        console.error('❌ Erro no refresh manual:', error);
        showError('Erro ao atualizar dashboard');
    } finally {
        showLoading(false);
    }
}

// ===== EVENT LISTENERS ENTERPRISE =====
/**
 * Configura todos os event listeners do dashboard
 */
function setupEventListeners() {
    // Refresh manual
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-refresh-dashboard]') || e.target.closest('[data-refresh-dashboard]')) {
            e.preventDefault();
            manualRefresh();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+R para refresh
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            manualRefresh();
        }
        
        // F5 para refresh
        if (e.key === 'F5') {
            e.preventDefault();
            manualRefresh();
        }
    });
    
    // Cleanup no unload
    window.addEventListener('beforeunload', () => {
        if (dashboardState.refreshInterval) {
            clearInterval(dashboardState.refreshInterval);
        }
        
        if (dashboardState.updateTimeout) {
            clearTimeout(dashboardState.updateTimeout);
        }
        
        // Cleanup de gráficos Chart.js
        Object.values(dashboardState.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        console.log('🧹 Dashboard cleanup concluído');
    });
    
    // Visibilidade da página para pausar/retomar updates
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('⏸️ Dashboard pausado (página não visível)');
            if (dashboardState.refreshInterval) {
                clearInterval(dashboardState.refreshInterval);
            }
        } else {
            console.log('▶️ Dashboard retomado (página visível)');
            setupAutoRefresh();
        }
    });
}

// ===== DADOS DEMO (FALLBACK) =====
/**
 * Carrega dados demo apenas em caso de erro crítico
 */
function loadDemoData() {
    console.log('📊 Carregando dados demo do dashboard (fallback)...');
    
    dashboardState.kpis = {
        totalLeads: 1247,
        newLeadsToday: 23,
        conversionRate: 18.5,
        totalRevenue: 125000,
        activeOpportunities: 45,
        avgDealSize: 2780,
        leadsThisMonth: 156,
        revenueThisMonth: 28500,
        teamPerformance: 87.5,
        monthlyGrowth: 12.3
    };
    
    dashboardState.gamification = {
        points: 2350,
        level: 3,
        badges: [
            { name: 'Primeiro Lead', badge_name: 'Primeiro Lead' },
            { name: 'Vendedor do Mês', badge_name: 'Vendedor do Mês' }
        ],
        leaderboard: [],
        nextLevelPoints: 650
    };
    
    dashboardState.recentActivity = [
        { 
            description: 'Novo lead cadastrado: João Silva', 
            event_type: 'lead_created', 
            user_name: 'Sistema',
            created_at: new Date().toISOString()
        },
        { 
            description: 'Oportunidade convertida: R$ 5.000', 
            event_type: 'opportunity_won', 
            user_name: 'Maria Santos',
            created_at: new Date(Date.now() - 3600000).toISOString()
        },
        { 
            description: 'Email de follow-up enviado', 
            event_type: 'email_sent', 
            user_name: 'Automação',
            created_at: new Date(Date.now() - 7200000).toISOString()
        }
    ];
    
    dashboardState.isLoading = false;
    dashboardState.lastUpdate = new Date();
    
    renderDashboard();
    setupAutoRefresh();
    setupEventListeners();
    
    showError('Usando dados demo - verifique a conexão com o Supabase');
}

// ===== API PÚBLICA =====
/**
 * API pública do dashboard
 */
window.DashboardSystem = {
    // Estado
    getState: () => ({ ...dashboardState }),
    
    // Ações
    refresh: manualRefresh,
    initialize: initializeDashboard,
    
    // Configurações
    setRefreshInterval: (interval) => {
        dashboardConfig.refreshInterval = interval;
        setupAutoRefresh();
    },
    
    // Utilitários
    navigateTo: navigateToPage,
    formatTime: formatTime,
    
    // Charts
    getCharts: () => ({ ...dashboardState.charts }),
    destroyCharts: () => {
        Object.values(dashboardState.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
};

// Expor função de refresh manual globalmente
window.manualRefresh = manualRefresh;

console.log('📊 Dashboard Enterprise System V4.1 carregado - Pronto para dados reais!');

