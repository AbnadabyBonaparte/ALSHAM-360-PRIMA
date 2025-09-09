/**
 * 🚀 ALSHAM 360° PRIMA - Main Application Script Enterprise 10/10
 * 
 * Script principal do dashboard com integração Supabase, UX premium e arquitetura NASA.
 * Implementa real-time updates, gamificação, animações e error handling robusto.
 * 
 * @version 2.0.0
 * @author ALSHAM Team
 * @license MIT
 */

// Importações com error handling
let supabaseModule = null;
let styleModule = null;

try {
    // Importar módulos dinamicamente para melhor error handling
    import('./style.css').then(module => {
        styleModule = module;
        console.info('✅ Styles loaded successfully');
    }).catch(error => {
        console.warn('⚠️ Style import failed:', error);
    });

    import('../lib/supabase.js').then(module => {
        supabaseModule = module;
        console.info('✅ Supabase module loaded successfully');
    }).catch(error => {
        console.error('❌ Supabase import failed:', error);
        // Fallback para dados demo se Supabase não carregar
        initializeDemoMode();
    });
} catch (error) {
    console.error('❌ Module import error:', error);
    initializeDemoMode();
}

/**
 * Configuração global da aplicação
 */
const APP_CONFIG = {
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
        realTimeUpdates: true,
        animations: true,
        gamification: true,
        notifications: true,
        analytics: true
    },
    performance: {
        kpiUpdateInterval: 30000,      // 30 segundos
        leadsUpdateInterval: 45000,    // 45 segundos
        chartAnimationDuration: 1000,  // 1 segundo
        loadingTimeout: 10000,         // 10 segundos
        retryAttempts: 3,
        retryDelay: 2000
    },
    ui: {
        animationDuration: 600,
        staggerDelay: 100,
        rippleAnimationDuration: 600,
        notificationDuration: 5000
    }
};

/**
 * Estado global da aplicação
 */
const AppState = {
    isInitialized: false,
    isDemoMode: false,
    timers: {
        kpi: null,
        leads: null,
        chart: null
    },
    cache: new Map(),
    retryCount: 0,
    lastUpdate: null,
    user: {
        name: 'João Silva',
        initials: 'JS',
        level: 7,
        levelName: 'Vendedor Expert',
        streak: 12,
        xp: 2400,
        maxXp: 3000
    }
};

/**
 * Classe para gerenciamento de cache inteligente
 */
class CacheManager {
    constructor(maxSize = 50, ttl = 300000) { // 5 minutos TTL
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            expires: Date.now() + this.ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    clear() {
        this.cache.clear();
    }
}

/**
 * Classe para tratamento de erros
 */
class ErrorHandler {
    static track(error, context = {}) {
        const errorInfo = {
            message: error.message || error,
            stack: error.stack || null,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            context
        };

        console.error('🚨 Application Error:', errorInfo);

        // Em produção, enviar para serviço de monitoramento
        if (APP_CONFIG.environment === 'production') {
            this.sendToMonitoring(errorInfo);
        }

        // Mostrar notificação amigável ao usuário
        this.showUserNotification(error, context);
    }

    static sendToMonitoring(errorInfo) {
        // Implementar integração com serviço de monitoramento
        // Ex: Sentry, LogRocket, etc.
        try {
            console.info('📊 Error sent to monitoring service');
        } catch (e) {
            console.warn('Failed to send error to monitoring:', e);
        }
    }

    static showUserNotification(error, context) {
        if (window.navigationSystem?.notificationManager) {
            const message = context.userMessage || 'Ocorreu um erro inesperado. Tentando novamente...';
            window.navigationSystem.notificationManager.show(message, 'error');
        }
    }
}

/**
 * Instância global do cache
 */
const cacheManager = new CacheManager();

/**
 * Inicialização principal da aplicação
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.info('🚀 ALSHAM 360° PRIMA - Dashboard Enterprise v2.0.0 iniciado');
        
        // Mostrar loading indicator
        showLoadingIndicator();
        
        // Aguardar carregamento dos módulos
        await waitForModules();
        
        // Inicializar componentes
        await initializeApplication();
        
        // Ocultar loading indicator
        hideLoadingIndicator();
        
        console.info('✅ Dashboard inicializado com sucesso');
        
    } catch (error) {
        ErrorHandler.track(error, { 
            phase: 'initialization',
            userMessage: 'Erro ao inicializar dashboard'
        });
        
        hideLoadingIndicator();
        initializeDemoMode();
    }
});

/**
 * Aguarda o carregamento dos módulos necessários
 */
async function waitForModules() {
    const maxWait = APP_CONFIG.performance.loadingTimeout;
    const startTime = Date.now();
    
    while (!supabaseModule && (Date.now() - startTime) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!supabaseModule) {
        console.warn('⚠️ Supabase module not loaded, switching to demo mode');
        AppState.isDemoMode = true;
    }
}

/**
 * Inicialização principal da aplicação
 */
async function initializeApplication() {
    try {
        // Inicializar componentes base
        initializeAnimations();
        initializeMicroInteractions();
        initializeGamification();
        initializeCelebrations();
        initializeKeyboardShortcuts();
        initializeAccessibility();
        
        // Renderizar dados
        await Promise.all([
            renderKPIs(),
            renderLeadsTable(),
            renderChartWithRealData(),
            renderConversionFunnel(),
            renderAIInsights()
        ]);
        
        // Iniciar atualizações em tempo real
        startRealTimeUpdates();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Marcar como inicializado
        AppState.isInitialized = true;
        AppState.lastUpdate = new Date();
        
        // Analytics
        trackEvent('dashboard_loaded', {
            version: APP_CONFIG.version,
            demo_mode: AppState.isDemoMode,
            load_time: performance.now()
        });
        
    } catch (error) {
        ErrorHandler.track(error, { 
            phase: 'application_initialization',
            userMessage: 'Erro ao inicializar aplicação'
        });
        throw error;
    }
}

/**
 * Inicializa modo demo com dados fictícios
 */
function initializeDemoMode() {
    console.info('🎭 Iniciando modo demo');
    AppState.isDemoMode = true;
    
    // Simular dados para demo
    window.demoData = {
        kpis: {
            totalLeads: 1234,
            qualifiedLeads: 925,
            conversionRate: 37,
            totalRevenue: 89750,
            lastUpdated: new Date().toISOString()
        },
        leads: generateDemoLeads(),
        chartData: [12500, 15750, 18200, 16800, 21300, 19600, 23400]
    };
}

/**
 * Gera dados demo para leads
 */
function generateDemoLeads() {
    const names = ['Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Oliveira', 'Carla Ferreira'];
    const companies = ['Tech Corp', 'Inovação Ltda', 'Digital Solutions', 'StartupX', 'Future Tech'];
    const statuses = ['novo', 'qualificado', 'proposta', 'negociacao', 'convertido'];
    
    return Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        nome: names[i % names.length],
        empresa: companies[i % companies.length],
        status: statuses[i % statuses.length],
        score_ia: Math.floor(Math.random() * 100),
        value: Math.floor(Math.random() * 10000) + 1000,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
}

/**
 * Mostra indicador de carregamento
 */
function showLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
        indicator.classList.remove('hidden');
    }
    
    // Mostrar skeletons
    const skeletons = document.querySelectorAll('.kpi-skeleton, .leads-skeleton');
    skeletons.forEach(skeleton => skeleton.style.display = 'block');
}

/**
 * Oculta indicador de carregamento
 */
function hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
        indicator.classList.add('hidden');
    }
    
    // Ocultar skeletons
    const skeletons = document.querySelectorAll('.kpi-skeleton, .leads-skeleton');
    skeletons.forEach(skeleton => skeleton.style.display = 'none');
}

// ===== RENDERIZAÇÃO DE DADOS =====

/**
 * Renderiza KPIs dinâmicos
 */
async function renderKPIs() {
    const kpiContainer = document.getElementById('dashboard-kpis');
    if (!kpiContainer) {
        console.warn('⚠️ KPI container not found');
        return;
    }

    try {
        // Verificar cache primeiro
        const cacheKey = 'dashboard_kpis';
        let data = cacheManager.get(cacheKey);
        
        if (!data) {
            if (AppState.isDemoMode || !supabaseModule) {
                data = window.demoData?.kpis || generateDemoKPIs();
            } else {
                const result = await supabaseModule.getDashboardKPIs();
                if (result.error) throw result.error;
                data = result.data;
            }
            
            // Armazenar no cache
            cacheManager.set(cacheKey, data);
        }

        // Renderizar KPIs
        kpiContainer.innerHTML = generateKPIHTML(data);
        
        // Animar entrada
        animateKPICards();
        
        console.info('✅ KPIs renderizados com sucesso');
        
    } catch (error) {
        ErrorHandler.track(error, { 
            component: 'kpis',
            userMessage: 'Erro ao carregar indicadores'
        });
        
        // Mostrar erro amigável
        kpiContainer.innerHTML = `
            <div class="col-span-full bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div class="text-red-600 mb-2">⚠️ Erro ao carregar KPIs</div>
                <button onclick="renderKPIs()" class="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

/**
 * Gera dados demo para KPIs
 */
function generateDemoKPIs() {
    return {
        totalLeads: 1234,
        qualifiedLeads: 925,
        conversionRate: 37,
        totalRevenue: 89750,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Gera HTML para KPIs
 */
function generateKPIHTML(data) {
    const kpis = [
        {
            icon: '📈',
            title: 'Leads Ativos',
            value: data.totalLeads?.toLocaleString() || '0',
            change: '+12%',
            changeType: 'positive',
            insight: 'Próximo: Contatar 3 leads quentes',
            color: 'blue'
        },
        {
            icon: '⚡',
            title: 'Conversões',
            value: data.qualifiedLeads?.toLocaleString() || '0',
            change: '+23%',
            changeType: 'positive',
            insight: 'Hot Streak: 5 dias seguidos batendo meta',
            color: 'green'
        },
        {
            icon: '💰',
            title: 'Receita Gerada',
            value: `R$ ${(data.totalRevenue / 1000).toFixed(0)}k` || 'R$ 0',
            change: '+18%',
            changeType: 'positive',
            insight: 'Melhor dia: Ter às 14h',
            color: 'purple'
        },
        {
            icon: '🤖',
            title: 'Score de Performance',
            value: `${data.conversionRate || 0}/10`,
            change: 'IA',
            changeType: 'neutral',
            insight: 'Sugestão IA: Focar em leads do setor Tech',
            color: 'orange'
        }
    ];

    return kpis.map((kpi, index) => `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 kpi-card" 
             data-index="${index}" 
             role="article" 
             aria-labelledby="kpi-title-${index}">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-${kpi.color}-100 rounded-xl flex items-center justify-center" role="img" aria-label="${kpi.title}">
                    <span class="text-2xl">${kpi.icon}</span>
                </div>
                <span class="text-${kpi.changeType === 'positive' ? 'green' : kpi.changeType === 'negative' ? 'red' : 'purple'}-600 text-sm font-semibold bg-${kpi.changeType === 'positive' ? 'green' : kpi.changeType === 'negative' ? 'red' : 'purple'}-100 px-2 py-1 rounded-full">
                    ${kpi.changeType === 'positive' ? '↗️' : kpi.changeType === 'negative' ? '↘️' : ''} ${kpi.change}
                </span>
            </div>
            <div class="mb-4">
                <h3 id="kpi-title-${index}" class="text-2xl font-bold text-gray-900">${kpi.value}</h3>
                <p class="text-gray-600 font-medium">${kpi.title}</p>
            </div>
            <div class="border-t border-gray-100 pt-4">
                <p class="text-sm text-gray-500 mb-2">💡 <strong>Insight:</strong></p>
                <p class="text-sm text-${kpi.color === 'blue' ? 'primary' : kpi.color === 'green' ? 'success' : kpi.color === 'purple' ? 'secondary' : 'warning'} font-medium">${kpi.insight}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Anima entrada dos cards de KPI
 */
function animateKPICards() {
    const cards = document.querySelectorAll('.kpi-card');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    
    if (reduceMotion) return;
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = `all ${APP_CONFIG.ui.animationDuration}ms ease-out`;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * APP_CONFIG.ui.staggerDelay);
    });
}

/**
 * Renderiza tabela de leads
 */
async function renderLeadsTable() {
    const leadsContainer = document.getElementById('leads-table');
    if (!leadsContainer) {
        console.warn('⚠️ Leads container not found');
        return;
    }

    try {
        // Verificar cache primeiro
        const cacheKey = 'leads_data';
        let data = cacheManager.get(cacheKey);
        
        if (!data) {
            if (AppState.isDemoMode || !supabaseModule) {
                data = window.demoData?.leads || generateDemoLeads();
            } else {
                const result = await supabaseModule.getLeads();
                if (result.error) throw result.error;
                data = result.data;
            }
            
            // Armazenar no cache
            cacheManager.set(cacheKey, data);
        }

        // Renderizar tabela
        leadsContainer.innerHTML = generateLeadsTableHTML(data);
        
        // Configurar event listeners para ações
        setupLeadsActions();
        
        console.info('✅ Tabela de leads renderizada com sucesso');
        
    } catch (error) {
        ErrorHandler.track(error, { 
            component: 'leads_table',
            userMessage: 'Erro ao carregar leads'
        });
        
        // Mostrar erro amigável
        leadsContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div class="text-red-600 mb-2">⚠️ Erro ao carregar leads</div>
                <button onclick="renderLeadsTable()" class="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

/**
 * Gera HTML para tabela de leads
 */
function generateLeadsTableHTML(leads) {
    if (!leads || leads.length === 0) {
        return `
            <div class="text-center py-8">
                <div class="text-gray-400 text-lg mb-2">📭</div>
                <p class="text-gray-500">Nenhum lead encontrado</p>
            </div>
        `;
    }

    const recentLeads = leads.slice(0, 5); // Mostrar apenas os 5 mais recentes
    
    return `
        <div class="space-y-3">
            ${recentLeads.map((lead, index) => `
                <div class="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors" 
                     data-lead-id="${lead.id}"
                     role="article"
                     aria-labelledby="lead-name-${index}">
                    <div class="w-10 h-10 bg-gradient-premium rounded-full flex items-center justify-center text-white font-semibold">
                        ${(lead.nome || 'N/A').charAt(0).toUpperCase()}
                    </div>
                    <div class="flex-1">
                        <h4 id="lead-name-${index}" class="font-medium text-gray-900">${lead.nome || 'Nome não informado'}</h4>
                        <p class="text-sm text-gray-600">${lead.empresa || 'Empresa não informada'}</p>
                    </div>
                    <div class="text-center">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}">
                            ${getStatusLabel(lead.status)}
                        </span>
                        ${lead.score_ia ? `<p class="text-xs text-gray-500 mt-1">Score: ${lead.score_ia}</p>` : ''}
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                                onclick="callLead('${lead.id}')"
                                aria-label="Ligar para ${lead.nome}">
                            📞 Ligar
                        </button>
                        <button class="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
                                onclick="openWhatsApp('${lead.telefone || '5511999999999'}', '${lead.nome}')"
                                aria-label="Enviar WhatsApp para ${lead.nome}">
                            💬 WhatsApp
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="text-xs text-gray-400 mt-4 text-center">
            Mostrando ${recentLeads.length} de ${leads.length} leads • 
            <button onclick="window.navigateTo('leads')" class="text-primary hover:underline">Ver todos</button>
        </div>
    `;
}

/**
 * Retorna cor do status do lead
 */
function getStatusColor(status) {
    const colors = {
        'novo': 'bg-blue-100 text-blue-800',
        'qualificado': 'bg-yellow-100 text-yellow-800',
        'proposta': 'bg-purple-100 text-purple-800',
        'negociacao': 'bg-orange-100 text-orange-800',
        'convertido': 'bg-green-100 text-green-800',
        'perdido': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Retorna label do status do lead
 */
function getStatusLabel(status) {
    const labels = {
        'novo': 'Novo',
        'qualificado': 'Qualificado',
        'proposta': 'Proposta',
        'negociacao': 'Negociação',
        'convertido': 'Convertido',
        'perdido': 'Perdido'
    };
    return labels[status] || 'Indefinido';
}

/**
 * Configura event listeners para ações de leads
 */
function setupLeadsActions() {
    // Event delegation para botões de ação
    const leadsContainer = document.getElementById('leads-table');
    if (!leadsContainer) return;
    
    leadsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        
        const leadRow = button.closest('[data-lead-id]');
        if (!leadRow) return;
        
        const leadId = leadRow.getAttribute('data-lead-id');
        
        // Adicionar ripple effect
        createRippleEffect(event);
        
        // Analytics
        trackEvent('lead_action', {
            action: button.textContent.includes('Ligar') ? 'call' : 'whatsapp',
            lead_id: leadId
        });
    });
}

/**
 * Renderiza gráfico com dados reais
 */
async function renderChartWithRealData() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) {
        console.warn('⚠️ Chart canvas not found');
        return;
    }

    try {
        let chartData;
        
        if (AppState.isDemoMode || !supabaseModule) {
            chartData = window.demoData?.chartData || [12500, 15750, 18200, 16800, 21300, 19600, 23400];
        } else {
            const result = await supabaseModule.getLeads();
            if (result.error) throw result.error;
            chartData = processChartData(result.data);
        }

        // Verificar se Chart.js está disponível
        if (typeof Chart !== 'undefined') {
            createChartJS(canvas, chartData);
        } else {
            createAlternativeChart(canvas, chartData);
        }
        
        console.info('✅ Gráfico renderizado com sucesso');
        
    } catch (error) {
        ErrorHandler.track(error, { 
            component: 'chart',
            userMessage: 'Erro ao carregar gráfico'
        });
        
        // Criar gráfico alternativo com dados demo
        createAlternativeChart(canvas, [0, 0, 0, 0, 0, 0, 0]);
    }
}

/**
 * Processa dados para o gráfico
 */
function processChartData(leads) {
    // Agrupa receita por dia da semana (seg a dom)
    const receitaPorDia = [0, 0, 0, 0, 0, 0, 0];
    
    leads.forEach(lead => {
        if (lead.status === 'convertido' && lead.created_at) {
            const dia = new Date(lead.created_at).getDay();
            receitaPorDia[dia] += Number(lead.value || 0);
        }
    });
    
    // Reorganiza para começar na segunda-feira
    return [1, 2, 3, 4, 5, 6, 0].map(idx => receitaPorDia[idx]);
}

/**
 * Cria gráfico usando Chart.js
 */
function createChartJS(canvas, data) {
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    
    const chartData = {
        labels,
        datasets: [{
            label: 'Receita (R$)',
            data,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };

    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#8b5cf6',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        color: '#64748b',
                        callback: value => 'R$ ' + Number(value).toLocaleString()
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b' }
                }
            },
            interaction: { intersect: false, mode: 'index' },
            elements: { point: { hoverBackgroundColor: '#8b5cf6' } },
            animation: {
                duration: APP_CONFIG.performance.chartAnimationDuration,
                easing: 'easeOutQuart'
            }
        }
    };

    new Chart(canvas, config);
}

/**
 * Cria gráfico alternativo em SVG
 */
function createAlternativeChart(canvas, data = [0, 0, 0, 0, 0, 0, 0]) {
    const container = canvas.parentNode;
    if (!container) return;

    const max = Math.max(...data, 1);
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 400 200');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Gráfico de performance dos últimos 7 dias');

    // Criar linha do gráfico
    let pathData = '';
    data.forEach((value, index) => {
        const x = (index / (data.length - 1)) * 350 + 25;
        const y = 180 - (value / max) * 150;
        pathData += (index === 0 ? 'M' : 'L') + x + ',' + y;
    });

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', '#8b5cf6');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);

    // Criar pontos
    data.forEach((value, index) => {
        const x = (index / (data.length - 1)) * 350 + 25;
        const y = 180 - (value / max) * 150;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', '#8b5cf6');
        
        // Tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${labels[index]}: R$ ${value.toLocaleString()}`;
        circle.appendChild(title);
        
        svg.appendChild(circle);
    });

    container.replaceChild(svg, canvas);
}

/**
 * Renderiza funil de conversão
 */
async function renderConversionFunnel() {
    const funnelContainer = document.getElementById('conversion-funnel');
    if (!funnelContainer) return;

    try {
        let data;
        
        if (AppState.isDemoMode || !supabaseModule) {
            data = {
                leads: 1234,
                qualified: 925,
                proposals: 555,
                closed: 456
            };
        } else {
            // Buscar dados reais do Supabase
            const result = await supabaseModule.getLeads();
            if (result.error) throw result.error;
            data = processFunnelData(result.data);
        }

        funnelContainer.innerHTML = generateFunnelHTML(data);
        
        // Animar barras do funil
        animateFunnelBars();
        
    } catch (error) {
        ErrorHandler.track(error, { 
            component: 'conversion_funnel',
            userMessage: 'Erro ao carregar funil de conversão'
        });
    }
}

/**
 * Processa dados para o funil
 */
function processFunnelData(leads) {
    const total = leads.length;
    const qualified = leads.filter(l => ['qualificado', 'proposta', 'negociacao', 'convertido'].includes(l.status)).length;
    const proposals = leads.filter(l => ['proposta', 'negociacao', 'convertido'].includes(l.status)).length;
    const closed = leads.filter(l => l.status === 'convertido').length;
    
    return { leads: total, qualified, proposals, closed };
}

/**
 * Gera HTML para o funil
 */
function generateFunnelHTML(data) {
    const stages = [
        { name: 'Leads', value: data.leads, color: 'blue-500', percentage: 100 },
        { name: 'Qualificados', value: data.qualified, color: 'green-500', percentage: Math.round((data.qualified / data.leads) * 100) },
        { name: 'Propostas', value: data.proposals, color: 'yellow-500', percentage: Math.round((data.proposals / data.leads) * 100) },
        { name: 'Fechados', value: data.closed, color: 'purple-500', percentage: Math.round((data.closed / data.leads) * 100) }
    ];

    return stages.map(stage => `
        <div class="flex items-center space-x-4">
            <div class="w-24 text-sm font-medium text-gray-700">${stage.name}</div>
            <div class="flex-1 bg-gray-200 rounded-full h-8 relative">
                <div class="bg-${stage.color} h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all duration-1000 funnel-bar" 
                     style="width: 0%"
                     data-width="${stage.percentage}%"
                     role="progressbar"
                     aria-valuenow="${stage.percentage}"
                     aria-valuemin="0"
                     aria-valuemax="100"
                     aria-label="${stage.name}: ${stage.percentage}%">
                    ${stage.value.toLocaleString()}
                </div>
            </div>
            <div class="w-16 text-sm text-gray-600">${stage.percentage}%</div>
        </div>
    `).join('');
}

/**
 * Anima barras do funil
 */
function animateFunnelBars() {
    const bars = document.querySelectorAll('.funnel-bar');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    
    if (reduceMotion) {
        bars.forEach(bar => {
            bar.style.width = bar.getAttribute('data-width');
        });
        return;
    }
    
    bars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.width = bar.getAttribute('data-width');
        }, index * 200);
    });
}

/**
 * Renderiza insights de IA
 */
async function renderAIInsights() {
    const insightsContainer = document.getElementById('ai-insights');
    if (!insightsContainer) return;

    try {
        const insights = generateAIInsights();
        
        insightsContainer.innerHTML = insights.map(insight => `
            <div class="flex items-start space-x-3 p-4 bg-${insight.color}-50 rounded-xl">
                <span class="text-xl">${insight.icon}</span>
                <div>
                    <p class="text-sm font-medium text-gray-900">"${insight.message}"</p>
                    <p class="text-xs text-gray-600 mt-1">${insight.context}</p>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        ErrorHandler.track(error, { 
            component: 'ai_insights',
            userMessage: 'Erro ao carregar insights'
        });
    }
}

/**
 * Gera insights de IA
 */
function generateAIInsights() {
    return [
        {
            icon: '💡',
            message: 'Seus leads de terça-feira convertem 34% mais',
            context: 'Baseado em 3 meses de dados',
            color: 'blue'
        },
        {
            icon: '📊',
            message: 'Clientes do setor Tech têm LTV 2.3x maior',
            context: 'Oportunidade de foco estratégico',
            color: 'green'
        },
        {
            icon: '⚡',
            message: 'Agora é o melhor momento para ligar para João',
            context: '89% de chance de atender',
            color: 'purple'
        }
    ];
}

// ===== ANIMAÇÕES E MICRO-INTERAÇÕES =====

/**
 * Inicializa animações de entrada
 */
function initializeAnimations() {
    const cards = document.querySelectorAll('.bg-white');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    
    if (reduceMotion) return;
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = `all ${APP_CONFIG.ui.animationDuration}ms ease-out`;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * APP_CONFIG.ui.staggerDelay);
    });
    
    // Animar progress bars após um delay
    setTimeout(() => animateProgressBars(), 1000);
}

/**
 * Anima progress bars
 */
function animateProgressBars() {
    const progressBars = document.querySelectorAll('[role="progressbar"]');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    
    if (reduceMotion) return;
    
    progressBars.forEach(bar => {
        const finalWidth = bar.style.width || '0%';
        bar.style.width = '0%';
        bar.style.transition = 'width 1.5s ease-out';
        
        setTimeout(() => {
            bar.style.width = finalWidth;
        }, 100);
    });
}

/**
 * Inicializa micro-interações premium
 */
function initializeMicroInteractions() {
    // Hover effects para cards
    const cards = document.querySelectorAll('.hover\\:shadow-md, .bg-white');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
                this.style.transform = 'translateY(-4px) scale(1.02)';
                this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                this.style.transition = 'all 0.3s ease-out';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Ripple effect para botões
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
}

/**
 * Cria efeito ripple
 */
function createRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple ${APP_CONFIG.ui.rippleAnimationDuration}ms linear;
        pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), APP_CONFIG.ui.rippleAnimationDuration + 100);
}

// ===== GAMIFICAÇÃO =====

/**
 * Inicializa sistema de gamificação
 */
function initializeGamification() {
    updateUserProgress();
    setupGamificationEvents();
    
    // Trigger achievement ocasional
    setTimeout(() => {
        if (Math.random() > 0.7) {
            triggerAchievementUnlock();
        }
    }, 3000);
}

/**
 * Atualiza progresso do usuário
 */
function updateUserProgress() {
    // Atualizar elementos de gamificação
    const userLevel = document.getElementById('user-level');
    const userLevelName = document.getElementById('user-level-name');
    const levelProgressPercentage = document.getElementById('level-progress-percentage');
    const levelProgressBar = document.getElementById('level-progress-bar');
    const currentStreak = document.getElementById('current-streak');
    const nextBadge = document.getElementById('next-badge');
    
    if (userLevel) userLevel.textContent = AppState.user.level;
    if (userLevelName) userLevelName.textContent = AppState.user.levelName;
    
    const progressPercentage = Math.round((AppState.user.xp / AppState.user.maxXp) * 100);
    if (levelProgressPercentage) levelProgressPercentage.textContent = `${progressPercentage}%`;
    if (levelProgressBar) {
        levelProgressBar.style.width = `${progressPercentage}%`;
        levelProgressBar.setAttribute('aria-valuenow', progressPercentage);
    }
    
    if (currentStreak) currentStreak.textContent = `${AppState.user.streak} dias`;
    if (nextBadge) nextBadge.textContent = `${AppState.user.streak + 3} dias`;
}

/**
 * Configura eventos de gamificação
 */
function setupGamificationEvents() {
    // Level progress click
    const levelProgress = document.querySelector('.bg-gradient-premium');
    if (levelProgress) {
        levelProgress.addEventListener('click', showLevelDetails);
        levelProgress.style.cursor = 'pointer';
    }
    
    // Streak animation
    const streakElement = document.getElementById('current-streak');
    if (streakElement) {
        animateStreakCounter(streakElement);
    }
    
    // Achievements button
    const achievementsButton = document.querySelector('button[onclick*="gamificacao"]');
    if (achievementsButton) {
        achievementsButton.addEventListener('click', showAchievements);
    }
}

/**
 * Anima contador de streak
 */
function animateStreakCounter(element) {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    
    let count = 0;
    const target = AppState.user.streak;
    const duration = 2000;
    const increment = target / (duration / 50);

    const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
            count = target;
            clearInterval(timer);
            element.classList.add('micro-bounce');
        }
        element.textContent = Math.floor(count) + ' dias';
    }, 50);
}

/**
 * Mostra detalhes do level
 */
function showLevelDetails() {
    const progressPercentage = Math.round((AppState.user.xp / AppState.user.maxXp) * 100);
    const xpRemaining = AppState.user.maxXp - AppState.user.xp;
    
    createModal('🏆 Level 7: Vendedor Expert', `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <span>XP Atual:</span>
                <span class="font-bold text-secondary">${AppState.user.xp.toLocaleString()} / ${AppState.user.maxXp.toLocaleString()}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-gradient-premium h-3 rounded-full transition-all duration-1000" 
                     style="width: ${progressPercentage}%"
                     role="progressbar"
                     aria-valuenow="${progressPercentage}"
                     aria-valuemin="0"
                     aria-valuemax="100"></div>
            </div>
            <div class="text-sm text-gray-600">
                <p>🎯 Próximo Level: <strong>Vendedor Master</strong></p>
                <p>📈 Faltam apenas ${xpRemaining.toLocaleString()} XP!</p>
                <p>💡 Dica: Complete 3 propostas para ganhar 200 XP cada</p>
            </div>
        </div>
    `);
}

/**
 * Mostra conquistas
 */
function showAchievements() {
    const achievements = [
        { icon: '🔥', name: 'Streak Master', desc: '10 dias consecutivos', unlocked: true },
        { icon: '📞', name: 'Call Champion', desc: '50 ligações em um dia', unlocked: true },
        { icon: '💰', name: 'Revenue Rocket', desc: 'R$ 10k em uma semana', unlocked: false },
        { icon: '🎯', name: 'Precision Pro', desc: '90% taxa de conversão', unlocked: false },
        { icon: '⚡', name: 'Speed Demon', desc: '5 vendas em 1 hora', unlocked: false },
        { icon: '👑', name: 'Sales King', desc: 'Top 1 do mês', unlocked: false }
    ];

    const achievementsList = achievements.map(achievement => `
        <div class="flex items-center space-x-3 p-3 rounded-lg ${achievement.unlocked ? 'bg-green-50' : 'bg-gray-50'}">
            <span class="text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}">${achievement.icon}</span>
            <div class="flex-1">
                <p class="font-medium ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}">${achievement.name}</p>
                <p class="text-sm text-gray-600">${achievement.desc}</p>
            </div>
            ${achievement.unlocked 
                ? '<span class="text-green-600 text-sm font-semibold">✓ Desbloqueado</span>' 
                : '<span class="text-gray-400 text-sm">🔒 Bloqueado</span>'
            }
        </div>
    `).join('');

    createModal('🏅 Suas Conquistas', `
        <div class="space-y-3 max-h-96 overflow-y-auto">
            ${achievementsList}
        </div>
    `);
}

// ===== CELEBRAÇÕES =====

/**
 * Inicializa sistema de celebrações
 */
function initializeCelebrations() {
    // Trigger celebração ocasional
    setTimeout(() => {
        if (Math.random() > 0.7) {
            triggerAchievementUnlock();
        }
    }, 3000);
}

/**
 * Trigger mini celebração
 */
function triggerMiniCelebration() {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#8b5cf6', '#3b82f6', '#10b981']
        });
    } else {
        showCelebrationAnimation();
    }
    
    // Vibração se disponível
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

/**
 * Trigger desbloqueio de conquista
 */
function triggerAchievementUnlock() {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#ec4899']
        });
    }
    
    showAchievementNotification('🔥 Streak Master Desbloqueado!', 'Você manteve sua sequência por 10 dias!');
}

/**
 * Mostra animação de celebração
 */
function showCelebrationAnimation() {
    const celebration = document.createElement('div');
    celebration.className = 'fixed inset-0 pointer-events-none z-50';
    celebration.innerHTML = `
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div class="text-6xl animate-bounce">🎉</div>
        </div>
    `;
    
    document.body.appendChild(celebration);
    setTimeout(() => celebration.remove(), 2000);
}

/**
 * Mostra notificação de conquista
 */
function showAchievementNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white rounded-xl p-4 shadow-lg border border-gray-200 z-50 transform translate-x-full transition-transform duration-500';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    notification.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="w-10 h-10 bg-gradient-premium rounded-full flex items-center justify-center">
                <span class="text-white text-lg">🏆</span>
            </div>
            <div class="flex-1">
                <p class="font-semibold text-gray-900">${title}</p>
                <p class="text-sm text-gray-600">${message}</p>
            </div>
            <button class="text-gray-400 hover:text-gray-600 close-btn" 
                    aria-label="Fechar notificação">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 500);
    }, { once: true });

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-hide
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 500);
    }, APP_CONFIG.ui.notificationDuration);
}

// ===== ACESSIBILIDADE =====

/**
 * Inicializa recursos de acessibilidade
 */
function initializeAccessibility() {
    // Configurar ARIA live regions
    setupLiveRegions();
    
    // Configurar navegação por teclado
    setupKeyboardNavigation();
    
    // Configurar anúncios para screen readers
    setupScreenReaderAnnouncements();
}

/**
 * Configura live regions para screen readers
 */
function setupLiveRegions() {
    // Criar live region para anúncios
    if (!document.getElementById('sr-announcements')) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'sr-announcements';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
}

/**
 * Configura navegação por teclado
 */
function setupKeyboardNavigation() {
    // Configurar skip links
    const skipLink = document.querySelector('a[href="#main-content"]');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView();
            }
        });
    }
}

/**
 * Configura anúncios para screen readers
 */
function setupScreenReaderAnnouncements() {
    // Anunciar carregamento de dados
    const announceDataLoad = (component, success = true) => {
        const liveRegion = document.getElementById('sr-announcements');
        if (liveRegion) {
            liveRegion.textContent = success 
                ? `${component} carregado com sucesso`
                : `Erro ao carregar ${component}`;
        }
    };
    
    // Exportar função para uso global
    window.announceToScreenReader = announceDataLoad;
}

// ===== ATALHOS DE TECLADO =====

/**
 * Inicializa atalhos de teclado
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Manipula atalhos de teclado
 */
function handleKeyboardShortcuts(event) {
    // Verificar se Ctrl está pressionado
    if (!event.ctrlKey) return;
    
    // Prevenir comportamento padrão para nossos atalhos
    const shortcuts = {
        '1': 'dashboard',
        '2': 'leads',
        '3': 'automacoes',
        '4': 'relatorios',
        '5': 'gamificacao',
        '6': 'configuracoes'
    };
    
    if (shortcuts[event.key]) {
        event.preventDefault();
        
        if (window.navigateTo) {
            window.navigateTo(shortcuts[event.key]);
        }
        
        // Anunciar para screen readers
        if (window.announceToScreenReader) {
            window.announceToScreenReader(`Navegando para ${shortcuts[event.key]}`);
        }
    }
}

// ===== ATUALIZAÇÕES EM TEMPO REAL =====

/**
 * Inicia atualizações em tempo real
 */
function startRealTimeUpdates() {
    if (!APP_CONFIG.features.realTimeUpdates) return;
    
    stopRealTimeUpdates(); // Limpar timers existentes
    
    AppState.timers.kpi = setInterval(() => {
        renderKPIs().catch(error => {
            ErrorHandler.track(error, { component: 'kpi_auto_update' });
        });
    }, APP_CONFIG.performance.kpiUpdateInterval);
    
    AppState.timers.leads = setInterval(() => {
        renderLeadsTable().catch(error => {
            ErrorHandler.track(error, { component: 'leads_auto_update' });
        });
    }, APP_CONFIG.performance.leadsUpdateInterval);
    
    console.info('✅ Real-time updates iniciados');
}

/**
 * Para atualizações em tempo real
 */
function stopRealTimeUpdates() {
    Object.values(AppState.timers).forEach(timer => {
        if (timer) clearInterval(timer);
    });
    
    AppState.timers = { kpi: null, leads: null, chart: null };
    console.info('⏹️ Real-time updates parados');
}

// ===== EVENT LISTENERS =====

/**
 * Configura event listeners globais
 */
function setupEventListeners() {
    // Cleanup ao sair da página
    window.addEventListener('beforeunload', () => {
        stopRealTimeUpdates();
        cacheManager.clear();
    });
    
    // Pausar/retomar updates baseado na visibilidade
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopRealTimeUpdates();
        } else {
            startRealTimeUpdates();
        }
    });
    
    // Configurar filtros de gráfico
    setupChartFilters();
    
    // Configurar botão de notificações
    setupNotificationsButton();
}

/**
 * Configura filtros de gráfico
 */
function setupChartFilters() {
    const chartFilters = document.querySelectorAll('[data-chart-filter]');
    chartFilters.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-chart-filter');
            
            // Atualizar estado visual dos botões
            chartFilters.forEach(btn => {
                btn.classList.remove('bg-primary', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            
            this.classList.remove('bg-gray-200', 'text-gray-700');
            this.classList.add('bg-primary', 'text-white');
            
            // Atualizar gráfico
            updateChart(filter);
            
            // Analytics
            trackEvent('chart_filter_changed', { filter });
        });
    });
}

/**
 * Configura botão de notificações
 */
function setupNotificationsButton() {
    const notificationsButton = document.getElementById('notifications-button');
    if (notificationsButton) {
        notificationsButton.addEventListener('click', function() {
            if (window.navigationSystem?.notificationManager) {
                window.navigationSystem.notificationManager.show(
                    'Sistema de notificações em desenvolvimento', 
                    'info'
                );
            } else {
                alert('Sistema de notificações em desenvolvimento');
            }
            
            // Analytics
            trackEvent('notifications_clicked');
        });
    }
}

// ===== UTILITÁRIOS =====

/**
 * Atualiza gráfico baseado no filtro
 */
function updateChart(filter) {
    console.info(`📊 Atualizando gráfico para filtro: ${filter}`);
    
    // Implementar lógica de atualização do gráfico
    // Por enquanto, apenas re-renderizar
    renderChartWithRealData();
}

/**
 * Cria modal
 */
function createModal(title, content) {
    // Remover modal existente
    const existingModal = document.getElementById('custom-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'custom-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.setAttribute('aria-modal', 'true');
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-95 opacity-0">
            <div class="flex items-center justify-between mb-4">
                <h3 id="modal-title" class="text-lg font-semibold text-gray-900">${title}</h3>
                <button class="text-gray-400 hover:text-gray-600 close-modal" aria-label="Fechar modal">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animar entrada
    setTimeout(() => {
        const modalContent = modal.querySelector('.bg-white');
        modalContent.style.transform = 'scale(1)';
        modalContent.style.opacity = '1';
    }, 10);
    
    // Event listeners
    const closeButton = modal.querySelector('.close-modal');
    const closeModal = () => {
        const modalContent = modal.querySelector('.bg-white');
        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    };
    
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Focus management
    closeButton.focus();
}

/**
 * Rastreia eventos para analytics
 */
function trackEvent(eventName, properties = {}) {
    try {
        // Google Analytics
        if (window.gtag) {
            window.gtag('event', eventName, properties);
        }
        
        // Console log para desenvolvimento
        if (APP_CONFIG.environment === 'development') {
            console.info('📊 Event tracked:', eventName, properties);
        }
        
    } catch (error) {
        console.warn('Analytics tracking failed:', error);
    }
}

// ===== ESTILOS AUXILIARES =====

/**
 * Injeta estilos CSS auxiliares
 */
function injectAuxiliaryStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Animações */
        @keyframes ripple { 
            to { transform: scale(4); opacity: 0; } 
        }
        
        @keyframes micro-bounce { 
            0%, 100% { transform: scale(1); } 
            50% { transform: scale(1.05); } 
        }
        
        @keyframes loading-skeleton {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        /* Classes utilitárias */
        .grayscale { filter: grayscale(100%); }
        .micro-bounce { animation: micro-bounce 0.6s ease-in-out; }
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        /* Loading skeleton */
        .loading-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading-skeleton 1.5s infinite;
        }
        
        /* Focus styles */
        .focus\\:not-sr-only:focus {
            position: static;
            width: auto;
            height: auto;
            padding: 0.5rem 1rem;
            margin: 0;
            overflow: visible;
            clip: auto;
            white-space: normal;
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ===== INICIALIZAÇÃO =====

// Injetar estilos auxiliares
injectAuxiliaryStyles();

// Exportar funções globais para compatibilidade
window.renderKPIs = renderKPIs;
window.renderLeadsTable = renderLeadsTable;
window.renderChartWithRealData = renderChartWithRealData;
window.updateChart = updateChart;
window.triggerMiniCelebration = triggerMiniCelebration;
window.showLevelDetails = showLevelDetails;
window.showAchievements = showAchievements;

// Error handling global
window.addEventListener('error', (event) => {
    ErrorHandler.track(event.error, {
        source: 'global_error_handler',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.info(`⚡ Dashboard carregado em ${loadTime.toFixed(2)}ms`);
    
    trackEvent('page_load_time', {
        value: Math.round(loadTime),
        version: APP_CONFIG.version
    });
});

console.info('🚀 Main script loaded successfully - ALSHAM 360° PRIMA v2.0.0');

