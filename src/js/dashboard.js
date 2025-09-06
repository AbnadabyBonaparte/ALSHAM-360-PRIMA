// ALSHAM 360° PRIMA - Dashboard 10/10 Real Dinâmico
// Este arquivo conecta o front premium (index.html) ao Supabase, exibe KPIs, gamificação, gráfico, funil e insights de IA em tempo real.
// Plug & Play para produção.

import {
    getCurrentUser,
    DEFAULT_ORG_ID,
    getDashboardKPIs,
    getDashboardGamificacao,
    getDashboardFunil,
    getDashboardInsights,
    getDashboardPerformance,
    getNextBestAction
} from '../lib/supabase.js';

let appState = {
    user: null,
    profile: null,
    orgId: DEFAULT_ORG_ID,
    kpis: null,
    gamificacao: null,
    funil: null,
    insights: [],
    nextAction: null,
    performance: null,
    chartType: 'revenue',
    loading: true,
    error: null
};

document.addEventListener('DOMContentLoaded', initializeDashboard);

async function initializeDashboard() {
    try {
        showLoader(true);
        // Autenticação real
        const { user, profile } = await getCurrentUser();
        if (!user) {
            window.location.href = '/src/pages/login.html';
            return;
        }
        appState.user = user;
        appState.profile = profile;
        appState.orgId = profile?.org_id || DEFAULT_ORG_ID;

        // Carregar dados reais
        await Promise.all([
            loadKPIs(),
            loadGamificacao(),
            loadFunil(),
            loadInsights(),
            loadPerformance(),
            loadNextAction()
        ]);

        renderDashboard();
        showLoader(false);
        confettiWelcome();

    } catch (err) {
        appState.error = 'Erro ao carregar dashboard!';
        showLoader(false);
        renderError();
        loadDemoData(); // fallback UX
    }
}

// ============== LOADERS & FALLBACK ==============
function showLoader(show) {
    let loader = document.getElementById('dashboard-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'dashboard-loader';
        loader.className = 'fixed inset-0 bg-white/80 z-50 flex items-center justify-center';
        loader.innerHTML = `<div class="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-b-4 border-gray-100"></div>`;
        document.body.appendChild(loader);
    }
    loader.style.display = show ? 'flex' : 'none';
}
function renderError() {
    if (appState.error) {
        let errDiv = document.getElementById('dashboard-error');
        if (!errDiv) {
            errDiv = document.createElement('div');
            errDiv.id = 'dashboard-error';
            errDiv.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow-lg z-50';
            document.body.appendChild(errDiv);
        }
        errDiv.textContent = appState.error;
        setTimeout(() => { errDiv.remove(); }, 5000);
    }
}
async function loadDemoData() {
    // KPIs/Gráficos/IA mock
    appState.kpis = {
        total_leads: 1234,
        leads_convertidos: 456,
        receita_total: 89000,
        score_media_ia: 8.7,
        receita_fechada: 15750,
        delta_receita: 23,
        best_month: "Setembro 2025",
        meta_percent: 73,
        meta_faltante: 8250
    };
    appState.gamificacao = {
        level: 7,
        level_label: "Vendedor Expert",
        level_progress: 80,
        streak: 12,
        next_badge: 15,
        daily_goals: [
            { label: "5 ligações feitas", percent: 100 },
            { label: "3 e-mails enviados", percent: 100 },
            { label: "2 propostas criadas", percent: 50 }
        ]
    };
    appState.funil = {
        steps: [
            { label: "Lead", value: 1234, percent: 100, color: ["from-blue-500", "to-blue-600"] },
            { label: "Qualificado", value: 456, percent: 37, color: ["from-green-500", "to-green-600"] },
            { label: "Proposta", value: 189, percent: 15, color: ["from-yellow-500", "to-yellow-600"] },
            { label: "Fechamento", value: 67, percent: 5.4, color: ["from-purple-500", "to-purple-600"] }
        ],
        insight: {
            icon: "💡",
            title: 'Insight: Gargalo na etapa "Proposta"',
            desc: "Taxa de conversão 40% abaixo da média do setor"
        }
    };
    appState.insights = [
        { icon: "💡", text: "Seus leads de terça-feira convertem 34% mais", sub: "Baseado em 3 meses de dados", bg: "bg-blue-50" },
        { icon: "📊", text: "Clientes do setor Tech têm LTV 2.3x maior", sub: "Oportunidade de foco estratégico", bg: "bg-green-50" },
        { icon: "⚡", text: "Agora é o melhor momento para ligar para João", sub: "89% de chance de atender", bg: "bg-purple-50" }
    ];
    appState.nextAction = {
        name: "Maria Santos",
        phone: "5511999999999",
        chance: 89,
        last_contact: 3,
        sector: "Tecnologia",
        value: 12500
    };
    appState.performance = {
        revenue: [8000, 11300, 12750, 10000, 9000, 13300, 14000],
        leads: [45, 67, 52, 40, 39, 80, 75],
        conversions: [4, 5, 6, 3, 4, 8, 7],
        labels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    };
    renderDashboard();
}

// ============== DADOS REAIS ==============
async function loadKPIs() {
    const { data, error } = await getDashboardKPIs(appState.orgId);
    if (error || !data) throw new Error("Erro ao buscar KPIs");
    appState.kpis = data;
}
async function loadGamificacao() {
    const { data, error } = await getDashboardGamificacao(appState.orgId);
    if (!error && data) appState.gamificacao = data;
}
async function loadFunil() {
    const { data, error } = await getDashboardFunil(appState.orgId);
    if (!error && data) appState.funil = data;
}
async function loadInsights() {
    const { data, error } = await getDashboardInsights(appState.orgId);
    if (!error && data) appState.insights = data;
}
async function loadPerformance() {
    const { data, error } = await getDashboardPerformance(appState.orgId);
    if (!error && data) appState.performance = data;
}
async function loadNextAction() {
    const { data, error } = await getNextBestAction(appState.orgId);
    if (!error && data) appState.nextAction = data;
}

// ============== RENDER PRINCIPAL ==============
function renderDashboard() {
    renderHero();
    renderKPIs();
    renderGamificacao();
    renderInsights();
    renderFunil();
    renderPerformanceChart();
}

// ============== HERO ==============
function renderHero() {
    document.getElementById('hero-greeting').textContent = `🎉 ${getGreeting()}, ${appState.profile?.full_name || "Usuário"}!`;
    document.getElementById('hero-revenue').textContent = formatCurrency(appState.kpis?.receita_fechada || 0);
    document.getElementById('hero-delta').textContent = `↗️ +${appState.kpis?.delta_receita || 0}%`;
    document.getElementById('hero-best-month').textContent = `Seu melhor mês: ${appState.kpis?.best_month || '-'}`;
    document.getElementById('hero-goal-percent').textContent = `${appState.kpis?.meta_percent || 0}%`;
    document.getElementById('hero-goal-remaining').textContent = `Faltam ${formatCurrency(appState.kpis?.meta_faltante || 0)}`;
    document.getElementById('hero-goal-bar').style.width = `${appState.kpis?.meta_percent || 0}%`;
}

// ============== KPIs ==============
function renderKPIs() {
    const KPIs = [
        {
            icon: "📈",
            value: appState.kpis?.total_leads || 0,
            label: "Leads Ativos",
            delta: "+12%",
            deltaColor: "text-green-600 bg-green-100"
        },
        {
            icon: "⚡",
            value: appState.kpis?.leads_convertidos || 0,
            label: "Conversões",
            delta: "+23%",
            deltaColor: "text-green-600 bg-green-100"
        },
        {
            icon: "💰",
            value: formatCurrency(appState.kpis?.receita_total || 0),
            label: "Receita Gerada",
            delta: "+18%",
            deltaColor: "text-green-600 bg-green-100"
        },
        {
            icon: "🤖",
            value: (appState.kpis?.score_media_ia || 0).toFixed(1) + "/10",
            label: "Score de Performance IA",
            delta: "IA",
            deltaColor: "text-purple-600 bg-purple-100"
        }
    ];
    const kpiCards = KPIs.map(kpi => `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">${kpi.icon}</span>
                </div>
                <span class="text-sm font-semibold ${kpi.deltaColor} px-2 py-1 rounded-full">${kpi.delta}</span>
            </div>
            <div class="mb-4">
                <h3 class="text-2xl font-bold text-gray-900">${kpi.value}</h3>
                <p class="text-gray-600 font-medium">${kpi.label}</p>
            </div>
        </div>
    `).join('');
    document.getElementById('kpi-cards').innerHTML = kpiCards;
}

// ============== GAMIFICAÇÃO ==============
function renderGamificacao() {
    document.getElementById('user-level').textContent = appState.gamificacao?.level || '-';
    document.getElementById('user-level-label').textContent = appState.gamificacao?.level_label || '-';
    document.getElementById('user-level-progress').textContent = (appState.gamificacao?.level_progress || 0) + '%';
    document.getElementById('user-level-bar').style.width = (appState.gamificacao?.level_progress || 0) + '%';
    document.getElementById('user-streak').textContent = appState.gamificacao?.streak || '-';
    document.getElementById('user-next-badge').textContent = appState.gamificacao?.next_badge || '-';
    // Metas diárias
    const dailyGoals = appState.gamificacao?.daily_goals?.map(goal => `
        <div class="flex items-center space-x-3">
            <span class="${goal.percent === 100 ? 'text-green-500' : 'text-orange-500'} text-xl">${goal.percent === 100 ? '✅' : '⏳'}</span>
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">${goal.label}</p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div class="${goal.percent === 100 ? 'bg-success' : 'bg-warning'} h-2 rounded-full" style="width: ${goal.percent}%"></div>
                </div>
            </div>
            <span class="text-sm font-semibold ${goal.percent === 100 ? 'text-success' : 'text-warning'}">${goal.percent}%</span>
        </div>
    `).join('');
    document.getElementById('daily-goals').innerHTML = dailyGoals || '';
}

// ============== INSIGHTS DE IA ==============
function renderInsights() {
    const insights = appState.insights?.map(i => `
        <div class="flex items-start space-x-3 p-4 ${i.bg} rounded-xl">
            <span class="text-xl">${i.icon}</span>
            <div>
                <p class="text-sm font-medium text-gray-900">${i.text}</p>
                <p class="text-xs text-gray-600 mt-1">${i.sub}</p>
            </div>
        </div>
    `).join('');
    document.getElementById('ai-insights').innerHTML = insights || '';
    // Próxima ação sugerida
    if (appState.nextAction) {
        document.getElementById('next-action').innerHTML = `
            <p class="text-sm font-medium text-gray-900 mb-2">"Contate ${appState.nextAction.name}"</p>
            <p class="text-xs text-gray-600 mb-3">${appState.nextAction.chance}% chance de conversão • Último contato: ${appState.nextAction.last_contact} dias</p>
            <div class="flex items-center space-x-2 text-xs text-gray-500">
                <span>💼 Setor: ${appState.nextAction.sector}</span>
                <span>•</span>
                <span>💰 Valor: ${formatCurrency(appState.nextAction.value)}</span>
            </div>
        `;
        document.getElementById('next-action-buttons').innerHTML = `
            <button class="btn-primary text-xs px-3 py-2 flex items-center justify-center space-x-1" onclick="callLead('${appState.nextAction.phone}')">
                <span>📞</span>
                <span>Ligar</span>
            </button>
            <button onclick="openWhatsApp('${appState.nextAction.phone}', '${appState.nextAction.name}')" class="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1">
                <span>💬</span>
                <span>WhatsApp</span>
            </button>
            <button class="btn-secondary text-xs px-3 py-2 flex items-center justify-center space-x-1" onclick="sendEmail('${appState.nextAction.name}')">
                <span>📧</span>
                <span>Email</span>
            </button>
            <button class="btn-outline text-xs px-3 py-2 flex items-center justify-center space-x-1" onclick="scheduleDemo('${appState.nextAction.name}')">
                <span>📅</span>
                <span>Agendar</span>
            </button>
        `;
    }
}

// ============== FUNIL ==============
function renderFunil() {
    if (!appState.funil?.steps) return;
    const funnelSteps = appState.funil.steps.map(s => `
        <div class="flex items-center space-x-4">
            <div class="w-20 text-sm font-medium text-gray-700">${s.label}</div>
            <div class="flex-1 bg-gray-200 rounded-full h-8 relative">
                <div class="bg-gradient-to-r ${s.color.join(' ')} h-8 rounded-full flex items-center justify-center text-white font-semibold" style="width: ${s.percent}%">
                    ${s.value}
                </div>
            </div>
            <div class="w-16 text-sm font-semibold text-gray-900">${s.percent}%</div>
        </div>
    `).join('');
    document.getElementById('funnel-steps').innerHTML = funnelSteps;
    document.getElementById('funnel-insight').innerHTML = `
        <div class="flex items-start space-x-3">
            <span class="text-xl">${appState.funil.insight.icon}</span>
            <div>
                <p class="text-sm font-semibold text-gray-900 mb-1">${appState.funil.insight.title}</p>
                <p class="text-xs text-gray-600 mb-3">${appState.funil.insight.desc}</p>
                <button class="text-xs bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700 transition-colors">
                    🎯 Ver Sugestão de Melhoria
                </button>
            </div>
        </div>
    `;
}

// ============== GRÁFICO DE PERFORMANCE ==============
let perfChart = null;
function renderPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx || !appState.performance) return;

    let type = appState.chartType;
    let data = [];
    let label = '';
    if (type === 'revenue') {
        data = appState.performance.revenue;
        label = 'Receita';
    } else if (type === 'leads') {
        data = appState.performance.leads;
        label = 'Leads';
    } else {
        data = appState.performance.conversions;
        label = 'Conversões';
    }
    if (perfChart) perfChart.destroy();
    perfChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: appState.performance.labels,
            datasets: [{
                label,
                data,
                borderColor: type === 'revenue' ? "#3b82f6" : type === 'leads' ? "#16a34a" : "#f59e42",
                backgroundColor: 'rgba(59,130,246,0.07)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => type === 'revenue' ? formatCurrency(v) : v }
                }
            }
        }
    });
}

// ============== AÇÕES DOS BOTÕES ==============
window.openWhatsApp = function(phone, name) {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${name}! Sou da ALSHAM e gostaria de conversar sobre nossa proposta. Quando seria um bom momento para você?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    showToast('WhatsApp iniciado!');
};
window.callLead = function(phone) {
    window.open(`tel:${phone.replace(/\D/g, '')}`);
    showToast('Ligação iniciada!');
};
window.sendEmail = function(name) {
    window.open(`mailto:?subject=Proposta ALSHAM&body=Olá ${name}, gostaria de conversar sobre nossa proposta.`);
    showToast('Email iniciado!');
};
window.scheduleDemo = function(name) {
    showToast(`Abrindo agenda para ${name}...`);
    // Integrar agenda real...
};
window.showAchievements = function() {
    showToast('Conquistas em breve!');
};
// Alternar gráfico
document.getElementById('chart-type-revenue').onclick = () => { appState.chartType = 'revenue'; renderPerformanceChart(); };
document.getElementById('chart-type-leads').onclick = () => { appState.chartType = 'leads'; renderPerformanceChart(); };
document.getElementById('chart-type-conversions').onclick = () => { appState.chartType = 'conversions'; renderPerformanceChart(); };

// ============== HELPERS & UX ==============
function confettiWelcome() {
    if (window.confetti) {
        window.confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}
function showToast(msg) {
    let toast = document.getElementById('dashboard-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dashboard-toast';
        toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-white px-8 py-3 rounded-2xl shadow-xl z-50 text-center text-base animate-fade-in-up';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2200);
}
function formatCurrency(value) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0); }
function getGreeting() { const h = new Date().getHours(); if (h < 12) return 'Bom dia'; if (h < 18) return 'Boa tarde'; return 'Boa noite'; }
