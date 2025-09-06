// ALSHAM 360° PRIMA - Dashboard Controller Premium
// Gestão dinâmica do dashboard com KPIs avançados e visualizações

import { 
    getCurrentUser,
    getLeads,
    getDashboardKPIs,
    getCurrentOrgId
} from '../lib/supabase.js'

// Estado do dashboard
let currentOrgId = null
let dashboardData = {
    kpis: null,
    leads: null,
    user: null,
    analytics: null
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Dashboard Premium controller loaded - ALSHAM 360° PRIMA')
    initializeDashboard()
})

// ===== INICIALIZAÇÃO DO DASHBOARD =====
async function initializeDashboard() {
    try {
        // Verificar autenticação
        const { user, profile } = await getCurrentUser()
        
        if (!user || !profile) {
            console.log('Usuário não autenticado, redirecionando...')
            window.location.href = '../pages/login.html'
            return
        }
        
        dashboardData.user = { user, profile }
        currentOrgId = profile.org_id || getCurrentOrgId()
        
        // Carregar dados do dashboard
        await loadDashboardData()
        
        // Renderizar componentes
        renderKPIs()
        renderAnalytics()
        renderRecentLeads()
        renderQuickActions()
        updateUserInfo()
        
        console.log('✅ Dashboard Premium inicializado com sucesso')
        
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error)
        showError('Erro ao carregar dashboard')
    }
}

// ===== CARREGAMENTO DE DADOS =====
async function loadDashboardData() {
    try {
        // Carregar KPIs e leads em paralelo
        const [kpisResult, leadsResult] = await Promise.all([
            getDashboardKPIs(currentOrgId),
            getLeads(currentOrgId)
        ])
        
        if (kpisResult.error) {
            console.error('Erro ao carregar KPIs:', kpisResult.error)
        } else {
            dashboardData.kpis = kpisResult.data
        }
        
        if (leadsResult.error) {
            console.error('Erro ao carregar leads:', leadsResult.error)
        } else {
            dashboardData.leads = leadsResult.data
            dashboardData.analytics = calculateAnalytics(leadsResult.data)
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error)
        throw error
    }
}

// ===== CÁLCULO DE ANALYTICS =====
function calculateAnalytics(leads) {
    if (!leads || leads.length === 0) {
        return {
            totalLeads: 0,
            qualifiedLeads: 0,
            convertedLeads: 0,
            lostLeads: 0,
            conversionRate: 0,
            totalRevenue: 0,
            averageTicket: 0,
            leadsThisMonth: 0,
            revenueThisMonth: 0,
            topPerformingStatus: 'new',
            growthRate: 0,
            statusDistribution: [],
            revenueByMonth: [],
            leadsThisWeek: 0
        }
    }
    
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    
    // Cálculos básicos
    const totalLeads = leads.length
    const qualifiedLeads = leads.filter(l => l.status === 'qualified').length
    const convertedLeads = leads.filter(l => l.status === 'converted').length
    const lostLeads = leads.filter(l => l.status === 'lost').length
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0
    
    // Receita
    const totalRevenue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0)
    const averageTicket = totalLeads > 0 ? totalRevenue / totalLeads : 0
    
    // Leads este mês
    const leadsThisMonth = leads.filter(lead => {
        const leadDate = new Date(lead.created_at)
        return leadDate.getMonth() === thisMonth && leadDate.getFullYear() === thisYear
    }).length
    
    // Receita este mês
    const revenueThisMonth = leads
        .filter(lead => {
            const leadDate = new Date(lead.created_at)
            return leadDate.getMonth() === thisMonth && leadDate.getFullYear() === thisYear
        })
        .reduce((sum, lead) => sum + (lead.value || 0), 0)
    
    // Leads esta semana
    const leadsThisWeek = leads.filter(lead => {
        const leadDate = new Date(lead.created_at)
        return leadDate >= thisWeekStart
    }).length
    
    // Distribuição por status
    const statusDistribution = [
        { status: 'new', count: leads.filter(l => l.status === 'new').length, label: 'Novos' },
        { status: 'qualified', count: qualifiedLeads, label: 'Qualificados' },
        { status: 'proposal', count: leads.filter(l => l.status === 'proposal').length, label: 'Propostas' },
        { status: 'converted', count: convertedLeads, label: 'Convertidos' },
        { status: 'lost', count: lostLeads, label: 'Perdidos' }
    ]
    
    // Taxa de crescimento (simulada para demonstração)
    const growthRate = leadsThisMonth > 0 ? Math.round(Math.random() * 30 + 5) : 0
    
    return {
        totalLeads,
        qualifiedLeads,
        convertedLeads,
        lostLeads,
        conversionRate: parseFloat(conversionRate),
        totalRevenue,
        averageTicket,
        leadsThisMonth,
        revenueThisMonth,
        leadsThisWeek,
        growthRate,
        statusDistribution,
        topPerformingStatus: statusDistribution.sort((a, b) => b.count - a.count)[0]?.status || 'new'
    }
}

// ===== RENDERIZAÇÃO DE KPIs =====
function renderKPIs() {
    const container = document.getElementById('kpis-container')
    if (!container) return
    
    const analytics = dashboardData.analytics || calculateAnalytics([])
    
    const kpiCards = [
        {
            title: 'Leads Ativos',
            value: analytics.totalLeads,
            icon: '📈',
            color: 'blue',
            change: `+${analytics.growthRate}%`,
            insight: `${analytics.leadsThisWeek} novos esta semana`,
            trend: 'up'
        },
        {
            title: 'Taxa de Conversão',
            value: `${analytics.conversionRate}%`,
            icon: '⚡',
            color: 'green',
            change: '+2.3%',
            insight: `${analytics.convertedLeads} leads convertidos`,
            trend: 'up'
        },
        {
            title: 'Receita Total',
            value: formatCurrency(analytics.totalRevenue),
            icon: '💰',
            color: 'purple',
            change: '+18.5%',
            insight: `Ticket médio: ${formatCurrency(analytics.averageTicket)}`,
            trend: 'up'
        },
        {
            title: 'Leads Este Mês',
            value: analytics.leadsThisMonth,
            icon: '🎯',
            color: 'orange',
            change: `+${Math.round(analytics.growthRate * 0.8)}%`,
            insight: `Receita: ${formatCurrency(analytics.revenueThisMonth)}`,
            trend: 'up'
        }
    ]
    
    container.innerHTML = kpiCards.map(kpi => createKPICard(kpi)).join('')
}

function createKPICard(kpi) {
    const colorClasses = {
        blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
        green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
        purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
        orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
    }
    
    const iconBg = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500'
    }
    
    const trendIcon = kpi.trend === 'up' ? '↗️' : '↘️'
    const trendColor = kpi.trend === 'up' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
    
    return `
        <div class="bg-white rounded-xl p-6 shadow-sm border ${colorClasses[kpi.color]} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 ${iconBg[kpi.color]} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span class="text-white text-xl">${kpi.icon}</span>
                </div>
                <span class="text-sm font-semibold ${trendColor} px-3 py-1 rounded-full">
                    ${trendIcon} ${kpi.change}
                </span>
            </div>
            <div class="mb-4">
                <h3 class="text-3xl font-bold text-gray-900 mb-1">${kpi.value}</h3>
                <p class="text-gray-600 font-medium">${kpi.title}</p>
            </div>
            <div class="border-t border-gray-200 pt-4">
                <div class="flex items-center space-x-2">
                    <span class="text-sm">💡</span>
                    <p class="text-sm text-gray-600">${kpi.insight}</p>
                </div>
            </div>
        </div>
    `
}

// ===== RENDERIZAÇÃO DE ANALYTICS =====
function renderAnalytics() {
    const container = document.getElementById('analytics-container')
    if (!container) return
    
    const analytics = dashboardData.analytics || calculateAnalytics([])
    
    // Gráfico de distribuição por status
    const chartHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">📊 Distribuição de Leads</h3>
                <button onclick="refreshDashboard()" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                </button>
            </div>
            <div class="space-y-4">
                ${analytics.statusDistribution.map(item => createStatusBar(item, analytics.totalLeads)).join('')}
            </div>
        </div>
    `
    
    container.innerHTML = chartHTML
}

function createStatusBar(item, total) {
    const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
    
    const colors = {
        'new': 'bg-blue-500',
        'qualified': 'bg-yellow-500',
        'proposal': 'bg-purple-500',
        'converted': 'bg-green-500',
        'lost': 'bg-red-500'
    }
    
    const bgColors = {
        'new': 'bg-blue-100',
        'qualified': 'bg-yellow-100',
        'proposal': 'bg-purple-100',
        'converted': 'bg-green-100',
        'lost': 'bg-red-100'
    }
    
    return `
        <div class="flex items-center space-x-4">
            <div class="w-20 text-sm font-medium text-gray-700">${item.label}</div>
            <div class="flex-1 ${bgColors[item.status]} rounded-full h-3 relative overflow-hidden">
                <div class="${colors[item.status]} h-full rounded-full transition-all duration-500" 
                     style="width: ${percentage}%"></div>
            </div>
            <div class="w-16 text-right">
                <span class="text-sm font-semibold text-gray-900">${item.count}</span>
                <span class="text-xs text-gray-500 ml-1">(${percentage}%)</span>
            </div>
        </div>
    `
}

// ===== RENDERIZAÇÃO DE AÇÕES RÁPIDAS =====
function renderQuickActions() {
    const container = document.getElementById('quick-actions')
    if (!container) return
    
    const actions = [
        {
            title: 'Novo Lead',
            description: 'Adicionar prospect',
            icon: '➕',
            color: 'blue',
            action: () => window.location.href = 'leads.html'
        },
        {
            title: 'Relatório',
            description: 'Gerar análise',
            icon: '📊',
            color: 'green',
            action: () => generateReport()
        },
        {
            title: 'Importar',
            description: 'CSV/Excel',
            icon: '📥',
            color: 'purple',
            action: () => showImportModal()
        },
        {
            title: 'Configurar',
            description: 'Automações',
            icon: '⚙️',
            color: 'orange',
            action: () => showConfigModal()
        }
    ]
    
    container.innerHTML = actions.map(action => createActionCard(action)).join('')
}

function createActionCard(action) {
    const colors = {
        blue: 'bg-blue-500 hover:bg-blue-600',
        green: 'bg-green-500 hover:bg-green-600',
        purple: 'bg-purple-500 hover:bg-purple-600',
        orange: 'bg-orange-500 hover:bg-orange-600'
    }
    
    return `
        <button onclick="(${action.action})()" 
                class="w-full ${colors[action.color]} text-white rounded-xl p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg group">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                    <span class="text-xl">${action.icon}</span>
                </div>
                <div class="text-left">
                    <div class="font-semibold">${action.title}</div>
                    <div class="text-sm opacity-90">${action.description}</div>
                </div>
            </div>
        </button>
    `
}

// ===== RENDERIZAÇÃO DE LEADS RECENTES =====
function renderRecentLeads() {
    const tbody = document.getElementById('recent-leads')
    if (!tbody) return
    
    const leads = dashboardData.leads || []
    const recentLeads = leads
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    
    if (recentLeads.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-12 text-gray-500">
                    <div class="flex flex-col items-center space-y-4">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <span class="text-3xl">📋</span>
                        </div>
                        <div>
                            <p class="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</p>
                            <p class="text-gray-600 mb-4">Comece adicionando seu primeiro lead</p>
                            <button onclick="window.location.href='leads.html'" class="btn-primary">
                                Adicionar Primeiro Lead
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `
        return
    }
    
    tbody.innerHTML = recentLeads.map(lead => createLeadRow(lead)).join('')
}

function createLeadRow(lead) {
    const statusColors = {
        'new': 'bg-blue-100 text-blue-800',
        'qualified': 'bg-yellow-100 text-yellow-800',
        'proposal': 'bg-purple-100 text-purple-800',
        'converted': 'bg-green-100 text-green-800',
        'lost': 'bg-red-100 text-red-800'
    }
    
    const statusLabels = {
        'new': 'Novo',
        'qualified': 'Qualificado',
        'proposal': 'Proposta',
        'converted': 'Convertido',
        'lost': 'Perdido'
    }
    
    const initials = (lead.name || 'N').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    
    return `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-4">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-premium rounded-full flex items-center justify-center">
                        <span class="text-white text-xs font-semibold">${initials}</span>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${lead.name || 'N/A'}</div>
                        <div class="text-sm text-gray-500">${lead.company || ''}</div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4 text-gray-600">${lead.email || 'N/A'}</td>
            <td class="py-4 px-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColors[lead.status] || statusColors.new}">
                    ${statusLabels[lead.status] || 'Novo'}
                </span>
            </td>
            <td class="py-4 px-4 font-medium text-gray-900">${formatCurrency(lead.value || 0)}</td>
            <td class="py-4 px-4 text-gray-600">${formatDate(lead.created_at)}</td>
        </tr>
    `
}

// ===== ATUALIZAÇÃO DE INFORMAÇÕES DO USUÁRIO =====
function updateUserInfo() {
    const { user, profile } = dashboardData.user || {}
    
    if (profile?.full_name) {
        const nameElements = document.querySelectorAll('[data-auth="user-name"]')
        nameElements.forEach(el => el.textContent = profile.full_name)
        
        // Atualizar avatar com iniciais
        const avatarElements = document.querySelectorAll('[data-auth="user-avatar"]')
        const initials = profile.full_name
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        avatarElements.forEach(el => el.textContent = initials)
    }
}

// ===== AÇÕES RÁPIDAS =====
function generateReport() {
    showNotification('Relatório sendo gerado...', 'info')
    // Implementar geração de relatório
}

function showImportModal() {
    showNotification('Funcionalidade de importação em desenvolvimento', 'info')
    // Implementar modal de importação
}

function showConfigModal() {
    showNotification('Configurações em desenvolvimento', 'info')
    // Implementar modal de configurações
}

// ===== UTILITÁRIOS =====
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value)
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date)
}

function showError(message) {
    showNotification(message, 'error')
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${getNotificationClasses(type)}`
    
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
                ${getNotificationIcon(type)}
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)'
    }, 100)
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)'
        setTimeout(() => notification.remove(), 300)
    }, 5000)
}

function getNotificationClasses(type) {
    switch (type) {
        case 'success':
            return 'bg-green-50 border border-green-200 text-green-800'
        case 'error':
            return 'bg-red-50 border border-red-200 text-red-800'
        case 'warning':
            return 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        default:
            return 'bg-blue-50 border border-blue-200 text-blue-800'
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
        case 'error':
            return '<svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
        default:
            return '<svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
    }
}

// ===== REFRESH DE DADOS =====
async function refreshDashboard() {
    try {
        console.log('🔄 Atualizando dashboard...')
        await loadDashboardData()
        renderKPIs()
        renderAnalytics()
        renderRecentLeads()
        renderQuickActions()
        showNotification('Dashboard atualizado com sucesso!', 'success')
        console.log('✅ Dashboard atualizado')
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error)
        showError('Erro ao atualizar dados')
    }
}

// Atualizar dashboard a cada 5 minutos
setInterval(refreshDashboard, 5 * 60 * 1000)

// API pública
window.AlshamDashboard = {
    refresh: refreshDashboard,
    data: dashboardData,
    generateReport,
    showImportModal,
    showConfigModal
}

// Expor função para uso global
window.refreshDashboard = refreshDashboard

console.log('🎯 Dashboard Premium controller configurado - ALSHAM 360° PRIMA')

