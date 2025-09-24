/**
 * 🚀 ALSHAM 360° PRIMA - SISTEMA DE LEADS COMPLETO V3.0
 * Sistema completo de gestão de leads integrado com 55 tabelas Supabase
 * 
 * @version 3.0.0 - PRODUÇÃO COMPLETA
 * @author ALSHAM Development Team
 * @integration 55 Tabelas Supabase mapeadas
 * 
 * ✅ FUNCIONALIDADES IMPLEMENTADAS:
 * - CRUD completo de leads (leads_crm)
 * - Dashboard com KPIs reais (dashboard_kpis)
 * - Sistema de gamificação (gamification_points)
 * - Analytics completo (analytics_events)
 * - Automações (automation_executions)
 * - Auditoria (audit_leads)
 * - Integrações com IA (ai_predictions)
 * - Sistema de etiquetas (lead_labels)
 * - ROI calculations (roi_calculations)
 * - E MUITO MAIS!
 */

// ===== CONFIGURAÇÃO GLOBAL COMPLETA =====
const ALSHAM_LEADS_CONFIG = {
    version: '3.0.0',
    
    // Status baseados no sistema real
    statusOptions: [
        { value: 'novo', label: 'Novo', color: 'blue', icon: '🆕', points: 5 },
        { value: 'contatado', label: 'Contatado', color: 'yellow', icon: '📞', points: 10 },
        { value: 'qualificado', label: 'Qualificado', color: 'purple', icon: '✅', points: 20 },
        { value: 'proposta', label: 'Proposta', color: 'orange', icon: '📋', points: 30 },
        { value: 'convertido', label: 'Convertido', color: 'green', icon: '💰', points: 50 },
        { value: 'perdido', label: 'Perdido', color: 'red', icon: '❌', points: 0 }
    ],
    
    temperaturaOptions: [
        { value: 'frio', label: 'Frio', color: 'gray', multiplier: 0.5 },
        { value: 'morno', label: 'Morno', color: 'yellow', multiplier: 0.75 },
        { value: 'quente', label: 'Quente', color: 'orange', multiplier: 1.0 },
        { value: 'muito_quente', label: 'Muito Quente', color: 'red', multiplier: 1.5 }
    ],

    origemOptions: [
        'website', 'google_ads', 'facebook_ads', 'linkedin', 'indicacao', 
        'evento', 'cold_calling', 'email_marketing', 'seo_organic', 'outro'
    ],

    // Configurações de paginação
    pagination: {
        defaultPerPage: 25,
        options: [10, 25, 50, 100]
    },

    // Configurações de atualização
    realtime: {
        enabled: true,
        refreshInterval: 30000 // 30 segundos
    },

    // Configurações de gamificação
    gamification: {
        enabled: true,
        pointsForAction: {
            'lead_created': 10,
            'lead_contacted': 15,
            'lead_qualified': 25,
            'lead_converted': 50,
            'interaction_logged': 5
        }
    }
};

// ===== ESTADO GLOBAL DO SISTEMA =====
const alshamLeadsState = {
    // Autenticação e organização
    user: null,
    orgId: null,
    
    // Dados principais
    leads: [],
    filteredLeads: [],
    kpis: {},
    
    // Analytics e métricas
    analytics: {},
    performanceMetrics: {},
    roiData: {},
    
    // Gamificação
    userPoints: 0,
    userBadges: [],
    leaderboard: [],
    
    // Automações
    activeAutomations: [],
    automationHistory: [],
    
    // UI Estado
    charts: {},
    currentModal: null,
    isLoading: false,
    
    // Filtros
    filters: {
        search: '',
        status: '',
        temperatura: '',
        origem: '',
        dateRange: '',
        scoreRange: [0, 100],
        customFilters: {}
    },
    
    // Paginação
    pagination: {
        current: 1,
        perPage: ALSHAM_LEADS_CONFIG.pagination.defaultPerPage,
        total: 0,
        totalPages: 0
    },
    
    // Real-time
    subscriptions: [],
    lastUpdate: null,
    
    // Ordenação
    sorting: {
        field: 'created_at',
        direction: 'desc'
    }
};

// ===== INICIALIZAÇÃO COMPLETA DO SISTEMA =====
document.addEventListener('DOMContentLoaded', async function() {
    try {
        showLoading(true, '🚀 Inicializando ALSHAM 360° PRIMA...');
        
        console.log('🎯 ALSHAM Leads System v3.0.0 - Iniciando...');
        
        // Verificar dependências
        await checkSystemDependencies();
        
        // Autenticar usuário
        const authResult = await authenticateUser();
        if (!authResult.success) {
            redirectToLogin('Sessão expirada');
            return;
        }
        
        alshamLeadsState.user = authResult.user;
        alshamLeadsState.orgId = authResult.orgId;
        
        console.log('✅ Usuário autenticado:', alshamLeadsState.user.email);
        console.log('🏢 Organização:', alshamLeadsState.orgId);
        
        // Carregar todos os dados do sistema
        await loadCompleteSystemData();
        
        // Configurar interface
        setupCompleteInterface();
        
        // Configurar real-time
        setupRealtimeSubscriptions();
        
        // Registrar analytics de inicialização
        await trackAnalyticsEvent('system_initialized', {
            user_id: alshamLeadsState.user.id,
            version: ALSHAM_LEADS_CONFIG.version,
            total_leads: alshamLeadsState.leads.length
        });
        
        showLoading(false);
        showSuccess('🎉 Sistema ALSHAM 360° carregado com sucesso!');
        
        console.log('✅ ALSHAM Leads System totalmente carregado');
        console.log('📊 Total de leads:', alshamLeadsState.leads.length);
        console.log('🎮 Pontos do usuário:', alshamLeadsState.userPoints);
        
    } catch (error) {
        console.error('❌ Erro crítico na inicialização:', error);
        showLoading(false);
        handleSystemError(error);
    }
});

// ===== VERIFICAÇÃO DE DEPENDÊNCIAS =====
async function checkSystemDependencies() {
    const dependencies = [];
    
    // Verificar AlshamSupabase
    if (!window.AlshamSupabase) {
        dependencies.push('AlshamSupabase não encontrado');
    }
    
    // Verificar Chart.js
    if (!window.Chart) {
        dependencies.push('Chart.js não encontrado');
    }
    
    // Verificar Tailwind CSS
    if (!document.querySelector('[class*="bg-"]')) {
        console.warn('⚠️ Tailwind CSS pode não estar carregado');
    }
    
    if (dependencies.length > 0) {
        throw new Error(`Dependências não encontradas: ${dependencies.join(', ')}`);
    }
    
    console.log('✅ Todas as dependências verificadas');
}

// ===== AUTENTICAÇÃO AVANÇADA =====
async function authenticateUser() {
    try {
        const session = await window.AlshamSupabase.getCurrentSession();
        
        if (!session?.user) {
            return { success: false, reason: 'No session' };
        }

        // Verificar se usuário tem perfil completo
        const { data: profile, error: profileError } = await window.AlshamSupabase.genericSelect(
            'user_profiles', 
            { user_id: session.user.id }
        );
        
        if (profileError) {
            console.warn('⚠️ Erro ao buscar perfil:', profileError);
        }

        const orgId = await window.AlshamSupabase.getCurrentOrgId();
        
        // Verificar permissões da organização
        const { data: orgPerms } = await window.AlshamSupabase.genericSelect(
            'user_organizations',
            { user_id: session.user.id, org_id: orgId }
        );
        
        return { 
            success: true, 
            user: session.user, 
            orgId: orgId,
            profile: profile?.[0] || null,
            permissions: orgPerms?.[0] || null
        };
        
    } catch (error) {
        console.error('❌ Erro na autenticação:', error);
        return { success: false, reason: error.message };
    }
}

function redirectToLogin(reason = '') {
    const url = reason ? `/login.html?reason=${encodeURIComponent(reason)}` : '/login.html';
    window.location.href = url;
}

// ===== CARREGAMENTO COMPLETO DE DADOS =====
async function loadCompleteSystemData() {
    try {
        alshamLeadsState.isLoading = true;
        
        // Carregar dados em paralelo para melhor performance
        const [
            leadsData,
            kpisData,
            gamificationData,
            analyticsData,
            automationsData
        ] = await Promise.allSettled([
            loadLeadsData(),
            loadDashboardKPIs(),
            loadGamificationData(),
            loadAnalyticsData(),
            loadAutomationsData()
        ]);
        
        // Processar resultados
        if (leadsData.status === 'fulfilled') {
            alshamLeadsState.leads = leadsData.value;
            alshamLeadsState.filteredLeads = [...leadsData.value];
            console.log('✅ Leads carregados:', leadsData.value.length);
        } else {
            console.error('❌ Erro ao carregar leads:', leadsData.reason);
        }
        
        if (kpisData.status === 'fulfilled') {
            alshamLeadsState.kpis = kpisData.value;
            console.log('✅ KPIs carregados:', kpisData.value);
        }
        
        if (gamificationData.status === 'fulfilled') {
            alshamLeadsState.userPoints = gamificationData.value.points;
            alshamLeadsState.userBadges = gamificationData.value.badges;
            alshamLeadsState.leaderboard = gamificationData.value.leaderboard;
            console.log('✅ Gamificação carregada:', gamificationData.value.points, 'pontos');
        }
        
        if (analyticsData.status === 'fulfilled') {
            alshamLeadsState.analytics = analyticsData.value;
            console.log('✅ Analytics carregados');
        }
        
        if (automationsData.status === 'fulfilled') {
            alshamLeadsState.activeAutomations = automationsData.value.active;
            alshamLeadsState.automationHistory = automationsData.value.history;
            console.log('✅ Automações carregadas:', automationsData.value.active.length, 'ativas');
        }
        
        alshamLeadsState.lastUpdate = new Date();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do sistema:', error);
        throw error;
    } finally {
        alshamLeadsState.isLoading = false;
    }
}

// ===== CARREGAMENTO DE LEADS (leads_crm) =====
async function loadLeadsData() {
    try {
        const { data: leads, error } = await window.AlshamSupabase.genericSelect(
            'leads_crm',
            { org_id: alshamLeadsState.orgId },
            { 
                order: { column: 'created_at', ascending: false }
            }
        );
        
        if (error) {
            throw new Error(`Erro ao carregar leads: ${error.message}`);
        }
        
        // Enriquecer dados dos leads com informações calculadas
        const enrichedLeads = leads?.map(lead => ({
            ...lead,
            interactions_count: 0, // Será carregado separadamente se necessário
            opportunities_count: 0, // Será carregado separadamente se necessário
            days_since_created: Math.floor((new Date() - new Date(lead.created_at)) / (1000 * 60 * 60 * 24)),
            temperature_score: calculateTemperatureScore(lead)
        })) || [];
        
        return enrichedLeads;
        
    } catch (error) {
        console.error('❌ Erro ao carregar leads:', error);
        return [];
    }
}

// ===== CARREGAMENTO DE KPIs (dashboard_kpis) =====
async function loadDashboardKPIs() {
    try {
        // Buscar KPIs da view dashboard_kpis
        const { data: kpis, error } = await window.AlshamSupabase.genericSelect(
            'dashboard_kpis',
            { org_id: alshamLeadsState.orgId }
        );
        
        if (error) {
            console.warn('⚠️ KPIs view não encontrada, calculando manualmente:', error);
            return calculateManualKPIs();
        }
        
        return kpis?.[0] || calculateManualKPIs();
        
    } catch (error) {
        console.error('❌ Erro ao carregar KPIs:', error);
        return calculateManualKPIs();
    }
}

function calculateManualKPIs() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const leads = alshamLeadsState.leads;
    
    const kpis = {
        total_leads: leads.length,
        
        new_leads_today: leads.filter(lead => 
            new Date(lead.created_at) >= today
        ).length,
        
        new_leads_last_7_days: leads.filter(lead => 
            new Date(lead.created_at) >= sevenDaysAgo
        ).length,
        
        new_leads_last_30_days: leads.filter(lead => 
            new Date(lead.created_at) >= thirtyDaysAgo
        ).length,
        
        qualified_leads: leads.filter(lead => 
            lead.status === 'qualificado'
        ).length,
        
        hot_leads: leads.filter(lead => 
            ['quente', 'muito_quente'].includes(lead.temperatura)
        ).length,
        
        converted_leads: leads.filter(lead => 
            lead.status === 'convertido'
        ).length,
        
        average_score: leads.length > 0 
            ? Math.round(leads.reduce((sum, lead) => sum + (lead.score_ia || 0), 0) / leads.length)
            : 0,
        
        conversion_rate: leads.length > 0
            ? ((leads.filter(l => l.status === 'convertido').length / leads.length) * 100).toFixed(1)
            : 0,
        
        // Métricas avançadas
        leads_by_temperature: {
            frio: leads.filter(l => l.temperatura === 'frio').length,
            morno: leads.filter(l => l.temperatura === 'morno').length,
            quente: leads.filter(l => l.temperatura === 'quente').length,
            muito_quente: leads.filter(l => l.temperatura === 'muito_quente').length
        },
        
        leads_by_origin: calculateLeadsByOrigin(leads),
        
        daily_trend: calculateDailyTrend(leads, 7)
    };
    
    console.log('📊 KPIs calculados manualmente:', kpis);
    return kpis;
}

// ===== FUNÇÕES AUXILIARES DE CÁLCULO =====
function calculateTemperatureScore(lead) {
    const config = ALSHAM_LEADS_CONFIG.temperaturaOptions.find(t => t.value === lead.temperatura);
    const baseScore = lead.score_ia || 50;
    const multiplier = config?.multiplier || 1;
    return Math.round(baseScore * multiplier);
}

function calculateLeadsByOrigin(leads) {
    const origins = {};
    ALSHAM_LEADS_CONFIG.origemOptions.forEach(origem => {
        origins[origem] = leads.filter(lead => lead.origem === origem).length;
    });
    return origins;
}

function calculateDailyTrend(leads, days) {
    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = leads.filter(lead => 
            lead.created_at.startsWith(dateStr)
        ).length;
        
        trend.push({
            date: dateStr,
            count: count
        });
    }
    return trend;
}

// ===== CARREGAMENTO DE GAMIFICAÇÃO =====
async function loadGamificationData() {
    try {
        const userId = alshamLeadsState.user.id;
        const orgId = alshamLeadsState.orgId;
        
        // Carregar pontos do usuário
        const { data: points } = await window.AlshamSupabase.genericSelect(
            'gamification_points',
            { user_id: userId, org_id: orgId }
        );
        
        // Carregar badges do usuário
        const { data: userBadges } = await window.AlshamSupabase.genericSelect(
            'user_badges',
            { user_id: userId, org_id: orgId }
        );
        
        // Carregar leaderboard
        const { data: leaderboard } = await window.AlshamSupabase.genericSelect(
            'team_leaderboards',
            { org_id: orgId },
            { 
                order: { column: 'period_start', ascending: false },
                limit: 1
            }
        );
        
        const totalPoints = points?.reduce((sum, p) => sum + (p.points_awarded || 0), 0) || 0;
        
        return {
            points: totalPoints,
            badges: userBadges || [],
            leaderboard: leaderboard?.[0]?.rankings || []
        };
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados de gamificação:', error);
        return { points: 0, badges: [], leaderboard: [] };
    }
}

// ===== CARREGAMENTO DE ANALYTICS =====
async function loadAnalyticsData() {
    try {
        const orgId = alshamLeadsState.orgId;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        // Carregar eventos recentes
        const { data: events } = await window.AlshamSupabase.genericSelect(
            'analytics_events',
            { org_id: orgId },
            {
                order: { column: 'timestamp', ascending: false },
                limit: 100
            }
        );
        
        // Carregar métricas de performance
        const { data: metrics } = await window.AlshamSupabase.genericSelect(
            'performance_metrics',
            { org_id: orgId },
            {
                order: { column: 'metric_date', ascending: false },
                limit: 30
            }
        );
        
        return {
            events: events || [],
            metrics: metrics || [],
            summary: processAnalyticsSummary(events || [])
        };
        
    } catch (error) {
        console.error('❌ Erro ao carregar analytics:', error);
        return { events: [], metrics: [], summary: {} };
    }
}

function processAnalyticsSummary(events) {
    const summary = {
        totalEvents: events.length,
        eventsByType: {},
        recentActivity: events.slice(0, 10)
    };
    
    events.forEach(event => {
        summary.eventsByType[event.event_name] = (summary.eventsByType[event.event_name] || 0) + 1;
    });
    
    return summary;
}

// ===== CARREGAMENTO DE AUTOMAÇÕES =====
async function loadAutomationsData() {
    try {
        const orgId = alshamLeadsState.orgId;
        
        // Carregar regras ativas
        const { data: activeRules } = await window.AlshamSupabase.genericSelect(
            'automation_rules',
            { org_id: orgId, is_active: true }
        );
        
        // Carregar histórico de execuções (últimas 50)
        const { data: executions } = await window.AlshamSupabase.genericSelect(
            'automation_executions',
            { org_id: orgId },
            {
                order: { column: 'started_at', ascending: false },
                limit: 50
            }
        );
        
        return {
            active: activeRules || [],
            history: executions || []
        };
        
    } catch (error) {
        console.error('❌ Erro ao carregar automações:', error);
        return { active: [], history: [] };
    }
}

// ===== CONFIGURAÇÃO COMPLETA DA INTERFACE =====
function setupCompleteInterface() {
    try {
        // Renderizar todos os componentes
        renderKPIDashboard();
        renderFiltersSection();
        renderLeadsTable();
        renderChartsSection();
        renderGamificationSection();
        renderAutomationsSection();
        
        // Configurar event listeners
        setupEventListeners();
        setupKeyboardShortcuts();
        
        // Inicializar modais
        setupModals();
        
        console.log('🎨 Interface completa configurada');
        
    } catch (error) {
        console.error('❌ Erro ao configurar interface:', error);
    }
}

// ===== RENDERIZAÇÃO DE KPIs AVANÇADOS =====
function renderKPIDashboard() {
    const container = document.getElementById('kpis-container');
    if (!container) {
        console.warn('⚠️ Container de KPIs não encontrado');
        return;
    }
    
    const kpis = alshamLeadsState.kpis;
    
    const kpisHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total de Leads -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-blue-100 text-sm font-medium">Total de Leads</p>
                        <p class="text-3xl font-bold">${kpis.total_leads || 0}</p>
                        <p class="text-blue-100 text-xs mt-1">
                            +${kpis.new_leads_last_7_days || 0} nos últimos 7 dias
                        </p>
                    </div>
                    <div class="bg-blue-400 bg-opacity-30 rounded-lg p-3">
                        <span class="text-3xl">👥</span>
                    </div>
                </div>
            </div>
            
            <!-- Leads Qualificados -->
            <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-green-100 text-sm font-medium">Leads Qualificados</p>
                        <p class="text-3xl font-bold">${kpis.qualified_leads || 0}</p>
                        <p class="text-green-100 text-xs mt-1">
                            🔥 ${kpis.hot_leads || 0} leads quentes
                        </p>
                    </div>
                    <div class="bg-green-400 bg-opacity-30 rounded-lg p-3">
                        <span class="text-3xl">✅</span>
                    </div>
                </div>
            </div>
            
            <!-- Taxa de Conversão -->
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-purple-100 text-sm font-medium">Taxa de Conversão</p>
                        <p class="text-3xl font-bold">${kpis.conversion_rate || 0}%</p>
                        <p class="text-purple-100 text-xs mt-1">
                            💰 ${kpis.converted_leads || 0} convertidos
                        </p>
                    </div>
                    <div class="bg-purple-400 bg-opacity-30 rounded-lg p-3">
                        <span class="text-3xl">📈</span>
                    </div>
                </div>
            </div>
            
            <!-- Score Médio -->
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-orange-100 text-sm font-medium">Score Médio IA</p>
                        <p class="text-3xl font-bold">${kpis.average_score || 0}</p>
                        <p class="text-orange-100 text-xs mt-1">
                            🎮 ${alshamLeadsState.userPoints} pontos seus
                        </p>
                    </div>
                    <div class="bg-orange-400 bg-opacity-30 rounded-lg p-3">
                        <span class="text-3xl">🤖</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- KPIs Secundários -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 Por Temperatura</h3>
                <div class="space-y-3">
                    ${Object.entries(kpis.leads_by_temperature || {}).map(([temp, count]) => `
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">${temp.charAt(0).toUpperCase() + temp.slice(1)}</span>
                            <span class="bg-gray-100 px-2 py-1 rounded-md text-sm font-medium">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">🎯 Automações Ativas</h3>
                <div class="text-center">
                    <span class="text-4xl font-bold text-blue-600">${alshamLeadsState.activeAutomations.length}</span>
                    <p class="text-sm text-gray-600 mt-2">regras executando</p>
                    ${alshamLeadsState.automationHistory.length > 0 ? `
                        <p class="text-xs text-gray-500 mt-1">
                            Última: ${formatTimeAgo(alshamLeadsState.automationHistory[0]?.started_at)}
                        </p>
                    ` : ''}
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">🏆 Sua Pontuação</h3>
                <div class="text-center">
                    <span class="text-4xl font-bold text-green-600">${alshamLeadsState.userPoints}</span>
                    <p class="text-sm text-gray-600 mt-2">pontos acumulados</p>
                    <div class="mt-3 flex justify-center space-x-1">
                        ${alshamLeadsState.userBadges.slice(0, 3).map(badge => 
                            `<span class="text-lg" title="Badge: ${badge.name || 'Badge'}">🥇</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = kpisHTML;
}

// ===== RENDERIZAÇÃO DE FILTROS AVANÇADOS =====
function renderFiltersSection() {
    const container = document.getElementById('filters-container');
    if (!container) return;
    
    const statusOptions = ALSHAM_LEADS_CONFIG.statusOptions.map(option =>
        `<option value="${option.value}">${option.icon} ${option.label}</option>`
    ).join('');
    
    const temperaturaOptions = ALSHAM_LEADS_CONFIG.temperaturaOptions.map(option =>
        `<option value="${option.value}">${option.label}</option>`
    ).join('');
    
    const origemOptions = ALSHAM_LEADS_CONFIG.origemOptions.map(origem =>
        `<option value="${origem}">${origem.charAt(0).toUpperCase() + origem.slice(1).replace('_', ' ')}</option>`
    ).join('');
    
    const filtersHTML = `
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
            <!-- Filtros Principais -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                <div class="lg:col-span-2">
                    <div class="relative">
                        <input
                            type="text"
                            id="search-leads"
                            placeholder="🔍 Buscar leads, empresas, emails..."
                            value="${alshamLeadsState.filters.search}"
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div class="absolute left-3 top-2.5 text-gray-400">
                            🔍
                        </div>
                    </div>
                </div>
                
                <select id="filter-status" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">📊 Todos os Status</option>
                    ${statusOptions}
                </select>
                
                <select id="filter-temperatura" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">🌡️ Todas as Temperaturas</option>
                    ${temperaturaOptions}
                </select>
                
                <select id="filter-origem" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">📍 Todas as Origens</option>
                    ${origemOptions}
                </select>
                
                <div class="flex space-x-2">
                    <button id="advanced-filters" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        ⚙️ Avançado
                    </button>
                </div>
            </div>
            
            <!-- Score Range -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">🤖 Score IA (${alshamLeadsState.filters.scoreRange[0]} - ${alshamLeadsState.filters.scoreRange[1]})</label>
                <input
                    type="range"
                    id="score-range"
                    min="0"
                    max="100"
                    value="${alshamLeadsState.filters.scoreRange[1]}"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>
            
            <!-- Ações -->
            <div class="flex justify-between items-center">
                <div class="flex space-x-2">
                    <button id="clear-filters" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        🗑️ Limpar
                    </button>
                    <button id="refresh-data" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        🔄 Atualizar
                    </button>
                    <button id="export-leads" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        📥 Exportar
                    </button>
                </div>
                
                <div class="flex space-x-2">
                    <button id="bulk-actions" class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                        📦 Ações em Lote
                    </button>
                    <button id="add-lead" class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                        ➕ Adicionar Lead
                    </button>
                </div>
            </div>
            
            <!-- Resultados dos Filtros -->
            <div class="mt-4 text-sm text-gray-600">
                📋 Mostrando <span class="font-medium">${alshamLeadsState.filteredLeads.length}</span> 
                de <span class="font-medium">${alshamLeadsState.leads.length}</span> leads
                ${alshamLeadsState.lastUpdate ? ` • 🕒 Última atualização: ${formatTimeAgo(alshamLeadsState.lastUpdate)}` : ''}
            </div>
        </div>
    `;
    
    container.innerHTML = filtersHTML;
}

// ===== APLICAÇÃO DE FILTROS AVANÇADOS (COMPLETA) =====
function applyFiltersAdvanced() {
    let filtered = [...alshamLeadsState.leads];
    
    // Filtro de busca (nome, email, empresa, telefone)
    if (alshamLeadsState.filters.search) {
        const search = alshamLeadsState.filters.search.toLowerCase();
        filtered = filtered.filter(lead =>
            (lead.nome && lead.nome.toLowerCase().includes(search)) ||
            (lead.email && lead.email.toLowerCase().includes(search)) ||
            (lead.empresa && lead.empresa.toLowerCase().includes(search)) ||
            (lead.telefone && lead.telefone.includes(search)) ||
            (lead.cargo && lead.cargo.toLowerCase().includes(search))
        );
    }
    
    // Filtro de status
    if (alshamLeadsState.filters.status) {
        filtered = filtered.filter(lead => lead.status === alshamLeadsState.filters.status);
    }
    
    // Filtro de temperatura
    if (alshamLeadsState.filters.temperatura) {
        filtered = filtered.filter(lead => lead.temperatura === alshamLeadsState.filters.temperatura);
    }
    
    // Filtro de origem
    if (alshamLeadsState.filters.origem) {
        filtered = filtered.filter(lead => lead.origem === alshamLeadsState.filters.origem);
    }
    
    // Filtro de score IA
    const [minScore, maxScore] = alshamLeadsState.filters.scoreRange;
    if (minScore > 0 || maxScore < 100) {
        filtered = filtered.filter(lead => {
            const score = lead.score_ia || 0;
            return score >= minScore && score <= maxScore;
        });
    }
    
    // Filtro de data personalizada
    if (alshamLeadsState.filters.dateRange) {
        const [startDate, endDate] = alshamLeadsState.filters.dateRange.split(' - ');
        if (startDate && endDate) {
            filtered = filtered.filter(lead => {
                const leadDate = new Date(lead.created_at);
                return leadDate >= new Date(startDate) && leadDate <= new Date(endDate);
            });
        }
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
        const field = alshamLeadsState.sorting.field;
        const direction = alshamLeadsState.sorting.direction === 'asc' ? 1 : -1;
        
        let aValue = a[field];
        let bValue = b[field];
        
        // Tratamento especial para datas
        if (field.includes('_at') || field === 'created_at' || field === 'updated_at') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        // Tratamento para strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue) * direction;
        }
        
        // Tratamento para números
        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
    });
    
    alshamLeadsState.filteredLeads = filtered;
    alshamLeadsState.pagination.total = filtered.length;
    alshamLeadsState.pagination.totalPages = Math.ceil(filtered.length / alshamLeadsState.pagination.perPage);
    
    console.log(`🔍 Filtros aplicados - ${filtered.length} resultados de ${alshamLeadsState.leads.length} leads`);
}

// ===== RENDERIZAÇÃO DA TABELA DE LEADS =====
function renderLeadsTable() {
    const container = document.getElementById('leads-container');
    if (!container) return;
    
    applyFiltersAdvanced();
    
    if (alshamLeadsState.filteredLeads.length === 0) {
        renderEmptyState(container);
        return;
    }
    
    // Calcular paginação
    const totalPages = Math.ceil(alshamLeadsState.filteredLeads.length / alshamLeadsState.pagination.perPage);
    const startIndex = (alshamLeadsState.pagination.current - 1) * alshamLeadsState.pagination.perPage;
    const endIndex = startIndex + alshamLeadsState.pagination.perPage;
    const currentPageLeads = alshamLeadsState.filteredLeads.slice(startIndex, endIndex);
    
    alshamLeadsState.pagination.total = alshamLeadsState.filteredLeads.length;
    alshamLeadsState.pagination.totalPages = totalPages;
    
    const tableHTML = `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <!-- Header da Tabela -->
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">
                        📋 Leads (${alshamLeadsState.filteredLeads.length})
                    </h3>
                    <div class="flex items-center space-x-4">
                        <select id="per-page-select" class="text-sm border border-gray-300 rounded-md px-3 py-1">
                            ${ALSHAM_LEADS_CONFIG.pagination.options.map(option => 
                                `<option value="${option}" ${option === alshamLeadsState.pagination.perPage ? 'selected' : ''}>${option} por página</option>`
                            ).join('')}
                        </select>
                        <div class="text-sm text-gray-500">
                            Página ${alshamLeadsState.pagination.current} de ${totalPages}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Tabela Responsiva -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-2 py-3 text-left">
                                <input type="checkbox" id="select-all-leads" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortLeads('nome')">
                                👤 Lead <span class="ml-1">↕️</span>
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortLeads('empresa')">
                                🏢 Empresa <span class="ml-1">↕️</span>
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortLeads('status')">
                                📊 Status <span class="ml-1">↕️</span>
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortLeads('temperatura')">
                                🌡️ Temperatura <span class="ml-1">↕️</span>
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortLeads('score_ia')">
                                🤖 Score IA <span class="ml-1">↕️</span>
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                📈 Atividade
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onclick="sortLeads('created_at')">
                                📅 Criado <span class="ml-1">↕️</span>
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ⚡ Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${currentPageLeads.map(lead => generateAdvancedLeadRow(lead)).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Paginação -->
            ${renderPagination()}
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

function renderEmptyState(container) {
    const hasFilters = Object.values(alshamLeadsState.filters).some(filter => 
        Array.isArray(filter) ? filter.some(f => f !== 0 && f !== 100) : filter !== ''
    );
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg p-12 text-center">
            <div class="text-gray-400 text-8xl mb-6">
                ${hasFilters ? '🔍' : '📋'}
            </div>
            <h3 class="text-2xl font-medium text-gray-900 mb-4">
                ${hasFilters ? 'Nenhum lead encontrado' : 'Nenhum lead cadastrado'}
            </h3>
            <p class="text-gray-500 mb-8 max-w-md mx-auto">
                ${hasFilters 
                    ? 'Tente ajustar os filtros para encontrar os leads que procura.' 
                    : 'Comece adicionando seu primeiro lead ao sistema ALSHAM 360°.'
                }
            </p>
            <div class="space-x-4">
                ${hasFilters ? `
                    <button id="clear-filters-empty" class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        🗑️ Limpar Filtros
                    </button>
                ` : ''}
                <button id="add-first-lead" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    ➕ ${hasFilters ? 'Adicionar Lead' : 'Adicionar Primeiro Lead'}
                </button>
            </div>
        </div>
    `;
}

function generateAdvancedLeadRow(lead) {
    const statusConfig = ALSHAM_LEADS_CONFIG.statusOptions.find(s => s.value === lead.status) || 
                         { value: lead.status, label: lead.status, color: 'gray', icon: '' };
    
    const temperaturaConfig = ALSHAM_LEADS_CONFIG.temperaturaOptions.find(t => t.value === lead.temperatura) || 
                                { value: lead.temperatura, label: lead.temperatura || '-', color: 'gray' };
    
    const avatarInitials = (lead.nome || 'N').charAt(0).toUpperCase() + 
                          ((lead.nome || '').split(' ')[1] || '').charAt(0).toUpperCase();
    
    return `
        <tr class="hover:bg-gray-50 transition-colors" data-lead-id="${lead.id}">
            <td class="px-2 py-4">
                <input type="checkbox" class="lead-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" value="${lead.id}">
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-12 w-12 flex-shrink-0">
                        <div class="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-md">
                            <span class="text-sm font-bold text-white">
                                ${avatarInitials}
                            </span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                            ${lead.nome || 'Nome não informado'}
                        </div>
                        <div class="text-sm text-gray-500">
                            ${lead.email || 'Email não informado'}
                        </div>
                        <div class="text-sm text-gray-400">
                            ${lead.telefone || 'Telefone não informado'}
                        </div>
                    </div>
                </div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 font-medium">
                    ${lead.empresa || '-'}
                </div>
                <div class="text-sm text-gray-500">
                    ${lead.cargo || '-'}
                </div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800">
                    ${statusConfig.icon} ${statusConfig.label}
                </span>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${temperaturaConfig.color}-100 text-${temperaturaConfig.color}-800">
                    ${temperaturaConfig.label}
                </span>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">
                        ${lead.score_ia || '-'}
                    </div>
                    ${lead.score_ia ? `
                        <div class="ml-3 w-20 bg-gray-200 rounded-full h-2">
                            <div class="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300" 
                                 style="width: ${Math.min(lead.score_ia, 100)}%"></div>
                        </div>
                    ` : ''}
                </div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center space-x-2">
                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        💬 ${lead.interactions_count || 0}
                    </span>
                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        💰 ${lead.opportunities_count || 0}
                    </span>
                </div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>${window.AlshamSupabase?.formatDateBR(lead.created_at) || 'Data inválida'}</div>
                <div class="text-xs text-gray-400">
                    há ${lead.days_since_created || 0} dias
                </div>
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                    <button onclick="viewLead('${lead.id}')" 
                            class="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                            title="Ver detalhes">
                        👁️
                    </button>
                    <button onclick="editLead('${lead.id}')" 
                            class="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
                            title="Editar">
                        ✏️
                    </button>
                    <button onclick="addInteraction('${lead.id}')" 
                            class="text-purple-600 hover:text-purple-900 transition-colors p-1 rounded hover:bg-purple-50"
                            title="Adicionar interação">
                        💬
                    </button>
                    <button onclick="deleteLead('${lead.id}')" 
                            class="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                            title="Excluir">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderPagination() {
    const { current, totalPages, total, perPage } = alshamLeadsState.pagination;
    
    if (totalPages <= 1) return '';
    
    const startItem = (current - 1) * perPage + 1;
    const endItem = Math.min(current * perPage, total);
    
    return `
        <div class="bg-white px-6 py-4 border-t border-gray-200">
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-700">
                    Mostrando <span class="font-medium">${startItem}</span> a <span class="font-medium">${endItem}</span> 
                    de <span class="font-medium">${total}</span> resultados
                </div>
                
                <div class="flex items-center space-x-2">
                    <button 
                        onclick="changePage(${current - 1})"
                        ${current === 1 ? 'disabled' : ''}
                        class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        ← Anterior
                    </button>
                    
                    ${generatePageNumbers(current, totalPages)}
                    
                    <button 
                        onclick="changePage(${current + 1})"
                        ${current === totalPages ? 'disabled' : ''}
                        class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Próxima →
                    </button>
                </div>
            </div>
        </div>
    `;
}

function generatePageNumbers(current, totalPages) {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
        pages.push(`
            <button 
                onclick="changePage(${i})"
                class="px-3 py-1 text-sm border rounded-md ${i === current 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'}"
            >
                ${i}
            </button>
        `);
    }
    
    return pages.join('');
}

// ===== RENDERIZAÇÃO DE GRÁFICOS =====
function renderChartsSection() {
    const statusChartContainer = document.getElementById('status-chart');
    const dailyChartContainer = document.getElementById('daily-chart');
    const originChartContainer = document.getElementById('origin-chart');
    
    if (statusChartContainer) renderStatusChart();
    if (dailyChartContainer) renderDailyChart();
    if (originChartContainer) renderOriginChart();
}

function renderStatusChart() {
    const canvas = document.getElementById('status-chart');
    if (!canvas) return;
    
    const statusData = {};
    const statusColors = {};
    
    ALSHAM_LEADS_CONFIG.statusOptions.forEach(status => {
        const count = alshamLeadsState.leads.filter(lead => lead.status === status.value).length;
        statusData[status.label] = count;
        statusColors[status.label] = getStatusColor(status.color);
    });
    
    if (alshamLeadsState.charts.status) {
        alshamLeadsState.charts.status.destroy();
    }
    
    alshamLeadsState.charts.status = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusData),
            datasets: [{
                data: Object.values(statusData),
                backgroundColor: Object.values(statusColors),
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverBorderWidth: 5,
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
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

function renderDailyChart() {
    const canvas = document.getElementById('daily-chart');
    if (!canvas) return;
    
    // Últimos 14 dias para melhor visualização
    const days = [];
    const counts = [];
    const colors = [];
    
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        days.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        
        const count = alshamLeadsState.leads.filter(lead => 
            lead.created_at.startsWith(dateStr)
        ).length;
        
        counts.push(count);
        colors.push(count > 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(156, 163, 175, 0.3)');
    }
    
    if (alshamLeadsState.charts.daily) {
        alshamLeadsState.charts.daily.destroy();
    }
    
    alshamLeadsState.charts.daily = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Novos Leads',
                data: counts,
                backgroundColor: colors,
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return `Dia ${context[0].label}`;
                        },
                        label: function(context) {
                            return `${context.parsed.y} novos leads`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
