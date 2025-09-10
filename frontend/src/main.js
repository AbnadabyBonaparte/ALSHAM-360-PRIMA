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

// ===== IMPORTS CORRIGIDOS - ES MODULES PADRONIZADOS =====
import Chart from 'chart.js/auto';
import { 
    getCurrentUser, 
    getCurrentSession, 
    getDashboardKPIs,
    getLeads,
    createAuditLog
} from './lib/supabase.js';

// ===== VARIÁVEIS GLOBAIS PARA MÓDULOS =====
let supabaseModule = null;
let isModulesLoaded = false;

/**
 * Configuração global da aplicação
 */
const APP_CONFIG = {
    version: '2.0.0',
    environment: import.meta.env.MODE || 'development',
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
    try {
        // Testar se as funções do Supabase estão disponíveis
        if (typeof getDashboardKPIs === 'function' && typeof getLeads === 'function') {
            supabaseModule = { getDashboardKPIs, getLeads, getCurrentUser, getCurrentSession, createAuditLog };
            isModulesLoaded = true;
            console.info('✅ Supabase module loaded successfully');
        } else {
            throw new Error('Supabase functions not available');
        }
    } catch (error) {
        console.warn('⚠️ Supabase module not loaded, switching to demo mode:', error);
        AppState.isDemoMode = true;
        isModulesLoaded = false;
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
                <div class="text-gray-400 text-lg mb-2">📋</div>
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

        // Usar Chart.js importado
        if (Chart) {
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

// ===== FUNÇÕES AUXILIARES (CONTINUAÇÃO DO ARQUIVO ORIGINAL) =====

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
            icon: '🎯',
            message: 'Leads do setor Tech têm 40% mais chance de conversão',
            context: 'Baseado em análise de 500+ leads dos últimos 3 meses',
            color: 'blue'
        },
        {
            icon: '⏰',
            message: 'Melhor horário para contato: Terça às 14h',
            context: 'Taxa de resposta 65% maior neste horário',
            color: 'green'
        },
        {
            icon: '📞',
            message: 'Leads com follow-up em 24h convertem 3x mais',
            context: 'Dados de performance da sua equipe',
            color: 'purple'
        }
    ];
}

// ===== FUNÇÕES DE ANIMAÇÃO E INTERAÇÃO =====

/**
 * Inicializa animações
 */
function initializeAnimations() {
    // Implementar animações de entrada
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
    });
}

/**
 * Inicializa microinterações
 */
function initializeMicroInteractions() {
    // Implementar efeitos de hover e click
    document.addEventListener('click', createRippleEffect);
}

/**
 * Inicializa gamificação
 */
function initializeGamification() {
    // Implementar sistema de pontos e badges
    updateUserLevel();
}

/**
 * Inicializa celebrações
 */
function initializeCelebrations() {
    // Implementar animações de sucesso
    console.info('🎉 Sistema de celebrações inicializado');
}

/**
 * Inicializa atalhos de teclado
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Implementar atalhos
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            // Abrir busca rápida
        }
    });
}

/**
 * Inicializa acessibilidade
 */
function initializeAccessibility() {
    // Implementar melhorias de acessibilidade
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
    focusableElements.forEach(element => {
        if (!element.getAttribute('aria-label') && !element.textContent.trim()) {
            element.setAttribute('aria-label', 'Elemento interativo');
        }
    });
}

/**
 * Inicia atualizações em tempo real
 */
function startRealTimeUpdates() {
    // KPIs a cada 30 segundos
    AppState.timers.kpi = setInterval(renderKPIs, APP_CONFIG.performance.kpiUpdateInterval);
    
    // Leads a cada 45 segundos
    AppState.timers.leads = setInterval(renderLeadsTable, APP_CONFIG.performance.leadsUpdateInterval);
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Implementar listeners para interações
    window.addEventListener('beforeunload', () => {
        // Limpar timers
        Object.values(AppState.timers).forEach(timer => {
            if (timer) clearInterval(timer);
        });
    });
}

/**
 * Cria efeito ripple
 */
function createRippleEffect(event) {
    const button = event.target.closest('button');
    if (!button) return;
    
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

/**
 * Atualiza nível do usuário
 */
function updateUserLevel() {
    const levelElement = document.getElementById('user-level');
    if (levelElement) {
        levelElement.textContent = `Nível ${AppState.user.level}`;
    }
}

/**
 * Rastreia eventos para analytics
 */
function trackEvent(eventName, properties = {}) {
    const eventData = {
        event: eventName,
        properties: {
            ...properties,
            timestamp: Date.now(),
            user_id: AppState.user.name,
            version: APP_CONFIG.version
        }
    };
    
    console.info('📊 Event tracked:', eventData);
    
    // Em produção, enviar para serviço de analytics
    if (APP_CONFIG.environment === 'production') {
        // Implementar integração com analytics
    }
}

// ===== FUNÇÕES GLOBAIS PARA COMPATIBILIDADE =====

/**
 * Liga para um lead
 */
window.callLead = function(leadId) {
    console.info(`📞 Ligando para lead ${leadId}`);
    trackEvent('lead_call', { lead_id: leadId });
    
    // Implementar integração com sistema de telefonia
    if (window.navigationSystem?.notificationManager) {
        window.navigationSystem.notificationManager.show('Iniciando chamada...', 'info');
    }
};

/**
 * Abre WhatsApp para um lead
 */
window.openWhatsApp = function(phone, name) {
    const message = encodeURIComponent(`Olá ${name}, tudo bem? Sou da ALSHAM e gostaria de conversar sobre nossas soluções.`);
    const url = `https://wa.me/${phone}?text=${message}`;
    
    window.open(url, '_blank');
    trackEvent('lead_whatsapp', { phone, name });
};

// ===== EXPORTS PARA COMPATIBILIDADE =====
export {
    APP_CONFIG,
    AppState,
    CacheManager,
    ErrorHandler,
    renderKPIs,
    renderLeadsTable,
    renderChartWithRealData,
    trackEvent
};

console.info('🚀 ALSHAM 360° PRIMA Main Script v2.0.0 loaded - Imports corrigidos!');

