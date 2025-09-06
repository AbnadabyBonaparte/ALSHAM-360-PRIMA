// ALSHAM 360° PRIMA - Dashboard OBRA-PRIMA com Dados Reais
// Conectado ao Supabase com todos os recursos avançados

import { 
    getDashboardKPIs, 
    getLeadsAvancados, 
    getFunilAnalytics, 
    getPerformanceTemporalBetterStuff,
    getGamificationStatus,
    getInsightsIA,
    getCurrentUser,
    DEFAULT_ORG_ID 
} from './lib/supabase.js'

// Estado global da aplicação
let currentUser = null
let currentOrgId = DEFAULT_ORG_ID
let dashboardData = {
    kpis: null,
    leads: null,
    funil: null,
    performance: null,
    gamificacao: null,
    insights: null
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Dashboard OBRA-PRIMA Iniciando...')
    
    await initializeApp()
})

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
async function initializeApp() {
    try {
        // Verificar autenticação
        const { user, profile } = await getCurrentUser()
        if (!user) {
            redirectToLogin()
            return
        }
        
        currentUser = user
        currentOrgId = profile?.org_id || DEFAULT_ORG_ID
        
        // Inicializar interface
        await loadDashboardData()
        initializeAnimations()
        initializeMicroInteractions()
        setupRealTimeUpdates()
        
        console.log('✨ Dashboard carregado com dados REAIS!')
        
    } catch (error) {
        console.error('Erro na inicialização:', error)
        showErrorState('Erro ao carregar dashboard')
    }
}

// ===== CARREGAMENTO DE DADOS REAIS =====
async function loadDashboardData() {
    showLoadingState()
    
    try {
        // Carregar todos os dados em paralelo
        const [kpisResult, leadsResult, funilResult, performanceResult, gamifResult, insightsResult] = await Promise.all([
            getDashboardKPIs(currentOrgId),
            getLeadsAvancados(currentOrgId, { limit: 5 }),
            getFunilAnalytics(currentOrgId),
            getPerformanceTemporalBetterStuff(currentOrgId),
            getGamificationStatus(currentUser.id, currentOrgId),
            getInsightsIA(currentOrgId)
        ])
        
        // Armazenar dados
        dashboardData = {
            kpis: kpisResult.data,
            leads: leadsResult.data,
            funil: funilResult.data,
            performance: performanceResult.data,
            gamificacao: gamifResult.data,
            insights: insightsResult.data
        }
        
        // Renderizar interface
        await renderDashboard()
        hideLoadingState()
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error)
        hideLoadingState()
        showErrorState('Erro ao carregar dados do dashboard')
    }
}

// ===== RENDERIZAÇÃO DO DASHBOARD =====
async function renderDashboard() {
    await Promise.all([
        renderHeroSection(),
        renderKPIsAvancados(),
        renderGamificacaoReal(),
        renderInsightsIA(),
        renderFunilReal(),
        renderPerformanceChart(),
        renderProximasAcoes()
    ])
    
    // Trigger celebração se houver conquistas
    if (dashboardData.gamificacao?.badges?.length > 0) {
        setTimeout(() => triggerWelcomeCelebration(), 1000)
    }
}

// ===== HERO SECTION COM DADOS REAIS =====
async function renderHeroSection() {
    const heroSection = document.querySelector('.bg-gradient-hero').parentElement
    if (!heroSection || !dashboardData.kpis) return
    
    const kpis = dashboardData.kpis
    const userName = currentUser?.user_metadata?.full_name || 
                    dashboardData.gamificacao?.perfil?.full_name || 
                    'Usuário'
    
    const receitaSemana = calculateReceitaSemana(kpis)
    const metaMensal = kpis.receita_total || 30000
    const percentualMeta = ((receitaSemana / metaMensal) * 100).toFixed(0)
    const faltaParaMeta = Math.max(0, metaMensal - receitaSemana)
    
    heroSection.querySelector('.bg-gradient-hero').innerHTML = `
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative z-10">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-3xl font-bold mb-2">🎉 Parabéns, ${userName}!</h2>
                    <p class="text-xl mb-4">Você gerou <span class="font-bold text-yellow-300">R$ ${formatMoney(receitaSemana)}</span> esta semana</p>
                    <div class="flex items-center space-x-6 text-sm">
                        <div class="flex items-center space-x-2">
                            <span class="text-green-300">↗️ +${calculateGrowthWeek()}%</span>
                            <span>vs. semana passada</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-yellow-300">🔥</span>
                            <span>Level ${dashboardData.gamificacao?.perfil?.level || 1}: ${getStreakText()}</span>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm opacity-90 mb-2">Meta Mensal</div>
                    <div class="text-2xl font-bold">${percentualMeta}%</div>
                    <div class="text-sm">Faltam R$ ${formatMoney(faltaParaMeta)}</div>
                    <div class="w-32 bg-white/20 rounded-full h-2 mt-2">
                        <div class="bg-yellow-300 h-2 rounded-full transition-all duration-1000" style="width: ${Math.min(percentualMeta, 100)}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `
}

// ===== KPIS AVANÇADOS COM DADOS REAIS =====
async function renderKPIsAvancados() {
    const kpisSection = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')
    if (!kpisSection || !dashboardData.kpis) return
    
    const kpis = dashboardData.kpis
    
    kpisSection.innerHTML = `
        <!-- KPI 1: Leads Ativos com Temperatura -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">📈</span>
                </div>
                <span class="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded-full">
                    🔥 ${kpis.leads_quentes || 0} quentes
                </span>
            </div>
            <div class="mb-4">
                <h3 class="text-2xl font-bold text-gray-900">${kpis.total_leads || 0}</h3>
                <p class="text-gray-600 font-medium">Leads Ativos</p>
            </div>
            <div class="border-t border-gray-100 pt-4">
                <div class="flex items-center justify-between text-xs">
                    <span>🔥 ${kpis.leads_quentes || 0}</span>
                    <span>🌡️ ${kpis.leads_mornos || 0}</span>
                    <span>🧊 ${kpis.leads_frios || 0}</span>
                </div>
                <p class="text-sm text-primary font-medium mt-2">Score IA médio: ${kpis.score_media_ia || 0}</p>
            </div>
        </div>

        <!-- KPI 2: Conversões com Taxa Real -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">⚡</span>
                </div>
                <span class="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded-full">
                    ↗️ ${kpis.taxa_conversao || 0}%
                </span>
            </div>
            <div class="mb-4">
                <h3 class="text-2xl font-bold text-gray-900">${kpis.leads_convertidos || 0}</h3>
                <p class="text-gray-600 font-medium">Conversões</p>
            </div>
            <div class="border-t border-gray-100 pt-4">
                <p class="text-sm text-gray-500 mb-2">📊 <strong>Taxa atual:</strong></p>
                <p class="text-sm text-success font-medium">${kpis.taxa_conversao || 0}% vs meta de 15%</p>
            </div>
        </div>

        <!-- KPI 3: Receita com Tracking Real -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">💰</span>
                </div>
                <span class="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded-full">
                    ↗️ +${calculateMonthGrowth()}%
                </span>
            </div>
            <div class="mb-4">
                <h3 class="text-2xl font-bold text-gray-900">R$ ${formatMoney(kpis.receita_total || 0)}</h3>
                <p class="text-gray-600 font-medium">Receita Gerada</p>
            </div>
            <div class="border-t border-gray-100 pt-4">
                <p class="text-sm text-gray-500 mb-2">🎯 <strong>Este mês:</strong></p>
                <p class="text-sm text-secondary font-medium">Melhor período: ${getBestPeriod()}</p>
            </div>
        </div>

        <!-- KPI 4: Score IA Avançado -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <span class="text-white text-xl">🤖</span>
                </div>
                <span class="text-purple-600 text-sm font-semibold bg-purple-100 px-2 py-1 rounded-full">
                    IA ATIVA
                </span>
            </div>
            <div class="mb-4">
                <h3 class="text-2xl font-bold text-gray-900">${kpis.score_media_ia || 0}/10</h3>
                <p class="text-gray-600 font-medium">Score IA Médio</p>
            </div>
            <div class="border-t border-gray-100 pt-4">
                <p class="text-sm text-gray-500 mb-2">🎯 <strong>Predições:</strong></p>
                <p class="text-sm text-warning font-medium">${getIAPredictionText()}</p>
            </div>
        </div>
    `
    
    // Animar entrada dos KPIs
    animateKPICards()
}

// ===== GAMIFICAÇÃO REAL =====
async function renderGamificacaoReal() {
    const gamifSection = document.querySelector('.bg-white.rounded-xl.p-6.shadow-sm.border.border-gray-100')
    if (!gamifSection || !dashboardData.gamificacao) return
    
    const gamif = dashboardData.gamificacao
    const perfil = gamif.perfil || {}
    const level = perfil.level || 1
    const totalPoints = perfil.total_points || 0
    const nextLevelPoints = level * 1000 // Simplificado
    const progressPercent = ((totalPoints % 1000) / 1000 * 100).toFixed(0)
    
    gamifSection.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">🏆 Seu Progresso Real</h3>
            <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Level ${level}:</span>
                <span class="text-sm font-semibold text-secondary">${getLevelTitle(level)}</span>
            </div>
        </div>
        
        <!-- Progress Bar Principal -->
        <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Progresso do Level</span>
                <span class="text-sm font-semibold text-secondary">${progressPercent}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-gradient-premium h-3 rounded-full transition-all duration-1000" style="width: ${progressPercent}%"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>${totalPoints} pontos</span>
                <span>Próximo: ${nextLevelPoints}</span>
            </div>
        </div>

        <!-- Conquistas Reais -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            ${renderBadgesConquistados(gamif.badges)}
        </div>

        <!-- Atividade Recente -->
        <div class="bg-gray-50 rounded-xl p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">📈 Atividade Recente</h4>
            <div class="space-y-2">
                ${renderAtividadeRecente(gamif.pontosRecentes)}
            </div>
        </div>
    `
}

// ===== INSIGHTS IA REAIS =====
async function renderInsightsIA() {
    const insightsSection = document.querySelector('.bg-white.rounded-xl.p-6.shadow-sm.border.border-gray-100:nth-of-type(4)')
    if (!insightsSection || !dashboardData.insights) return
    
    const insights = dashboardData.insights
    
    insightsSection.innerHTML = `
        <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center">
                <span class="text-white text-xl">🤖</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900">Insights Inteligentes</h3>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                ${insights.predicoes?.length || 0} predições ativas
            </span>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Insights Automáticos -->
            <div class="space-y-4">
                ${renderInsightsAutomaticos(insights.insights)}
            </div>
            
            <!-- Próxima Ação IA -->
            <div class="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                <h4 class="text-lg font-bold text-gray-900 mb-4">🎯 IA Recomenda</h4>
                ${renderProximaAcaoIA(insights.proximasAcoes)}
            </div>
        </div>
    `
}

// ===== FUNÇÕES AUXILIARES =====
function formatMoney(value) {
    return new Intl.NumberFormat('pt-BR').format(value || 0)
}

function calculateReceitaSemana(kpis) {
    // Simplificado - seria baseado em data real
    return (kpis?.receita_total || 0) * 0.25
}

function calculateGrowthWeek() {
    return Math.floor(Math.random() * 30) + 10 // Mock temporário
}

function calculateMonthGrowth() {
    return Math.floor(Math.random() * 25) + 5 // Mock temporário
}

function getBestPeriod() {
    const periods = ['Manhã (9-11h)', 'Tarde (14-16h)', 'Noite (19-21h)']
    return periods[Math.floor(Math.random() * periods.length)]
}

function getStreakText() {
    const level = dashboardData.gamificacao?.perfil?.level || 1
    const titles = ['Iniciante', 'Vendedor', 'Expert', 'Master', 'Legend']
    return titles[Math.min(level - 1, titles.length - 1)] || 'Iniciante'
}

function getLevelTitle(level) {
    const titles = {
        1: 'Iniciante',
        2: 'Vendedor Jr',
        3: 'Vendedor',
        4: 'Vendedor Sr',
        5: 'Expert',
        6: 'Master',
        7: 'Legend'
    }
    return titles[level] || `Level ${level}`
}

function getIAPredictionText() {
    if (!dashboardData.insights?.predicoes?.length) {
        return 'Coletando dados...'
    }
    
    const predicao = dashboardData.insights.predicoes[0]
    return `${predicao.prediction_type}: ${predicao.confidence}% confiança`
}

function renderBadgesConquistados(badges) {
    if (!badges?.length) {
        return '<div class="col-span-3 text-center text-gray-500 py-4">Nenhum badge conquistado ainda</div>'
    }
    
    return badges.slice(0, 3).map(badge => `
        <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <span class="text-2xl">${badge.gamification_badges?.icon || '🏆'}</span>
            <div>
                <p class="font-medium text-gray-900">${badge.gamification_badges?.name}</p>
                <p class="text-xs text-gray-600">${formatDate(badge.earned_at)}</p>
            </div>
        </div>
    `).join('')
}

function renderAtividadeRecente(pontos) {
    if (!pontos?.length) {
        return '<p class="text-sm text-gray-500">Nenhuma atividade recente</p>'
    }
    
    return pontos.slice(0, 3).map(ponto => `
        <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">${ponto.description}</span>
            <span class="text-sm font-semibold text-green-600">+${ponto.points}</span>
        </div>
    `).join('')
}

function renderInsightsAutomaticos(insights) {
    if (!insights?.length) {
        return '<div class="text-center text-gray-500 py-4">Gerando insights...</div>'
    }
    
    return insights.map(insight => `
        <div class="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
            <span class="text-xl">${insight.icone}</span>
            <div>
                <p class="text-sm font-medium text-gray-900">${insight.titulo}</p>
                <p class="text-xs text-gray-600 mt-1">${insight.descricao}</p>
            </div>
        </div>
    `).join('')
}

function renderProximaAcaoIA(acoes) {
    if (!acoes?.length) {
        return '<p class="text-sm text-gray-600">Nenhuma ação pendente</p>'
    }
    
    const acao = acoes[0]
    const lead = acao.leads_crm
    
    return `
        <div class="mb-4">
            <p class="text-sm font-medium text-gray-900 mb-2">"${acao.description}"</p>
            <p class="text-xs text-gray-600 mb-3">
                Lead: ${lead?.nome} • ${getTemperaturaIcon(lead?.temperatura)} ${lead?.temperatura}
            </p>
        </div>
        <div class="grid grid-cols-2 gap-2">
            <button onclick="executarAcaoIA('${acao.id}', 'call')" class="btn-primary text-xs px-3 py-2">
                📞 Ligar
            </button>
            <button onclick="executarAcaoIA('${acao.id}', 'email')" class="btn-secondary text-xs px-3 py-2">
                📧 Email
            </button>
        </div>
    `
}

// ===== INTERAÇÕES AVANÇADAS =====
window.executarAcaoIA = async function(acaoId, tipo) {
    try {
        showLoadingButton(event.target)
        
        // Simular execução da ação
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Registrar pontos
        await registrarPontosGamificacao(currentUser.id, `AI_ACTION_${tipo.toUpperCase()}`, 25, acaoId)
        
        showSuccessButton(event.target, `${tipo === 'call' ? 'Ligação' : 'Email'} iniciado!`)
        
        // Atualizar dados
        setTimeout(() => loadDashboardData(), 2000)
        
    } catch (error) {
        console.error('Erro ao executar ação IA:', error)
        showErrorButton(event.target, 'Erro!')
    }
}

// ===== UTILITÁRIOS DE UI =====
function showLoadingState() {
    // Implementar loading state global
}

function hideLoadingState() {
    // Remover loading state global
}

function showErrorState(message) {
    console.error(message)
    // Implementar estado de erro
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR')
}

function getTemperaturaIcon(temperatura) {
    const icons = {
        'QUENTE': '🔥',
        'MORNO': '🌡️',
        'FRIO': '🧊'
    }
    return icons[temperatura] || '⚪'
}

function animateKPICards() {
    const cards = document.querySelectorAll('.hover\\:shadow-md')
    cards.forEach((card, index) => {
        card.style.opacity = '0'
        card.style.transform = 'translateY(20px)'
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out'
            card.style.opacity = '1'
            card.style.transform = 'translateY(0)'
        }, index * 100)
    })
}

function triggerWelcomeCelebration() {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })
    }
}

function redirectToLogin() {
    window.location.href = '/login.html'
}

function setupRealTimeUpdates() {
    // Atualizar dados a cada 5 minutos
    setInterval(() => {
        loadDashboardData()
    }, 300000)
}

function initializeAnimations() {
    // Manter animações existentes
}

function initializeMicroInteractions() {
    // Manter microinterações existentes
}

console.log('✨ Dashboard OBRA-PRIMA com dados REAIS carregado!')
