/**
 * ALSHAM 360° PRIMA - Dashboard Simples e Funcional V1.0
 * Sistema de dashboard que funciona com dados reais do Supabase
 * 
 * @version 1.0.0 - FUNCIONAL
 * @author ALSHAM Development Team
 * 
 * ✅ FUNCIONALIDADES:
 * - KPIs reais baseados nos dados do Supabase
 * - Gráficos funcionais com Chart.js
 * - Interface responsiva
 * - Sem exports/imports problemáticos
 * - Compatível com estrutura atual
 */

// ===== ESTADO DO DASHBOARD =====
const dashboardState = {
    user: null,
    orgId: null,
    isLoading: false,
    leads: [],
    kpis: {
        totalLeads: 0,
        newLeadsToday: 0,
        qualifiedLeads: 0,
        convertedLeads: 0,
        conversionRate: 0
    },
    charts: {
        statusChart: null,
        dailyChart: null
    }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('📊 Inicializando Dashboard ALSHAM 360°...');
        
        // Verificar se AlshamSupabase está disponível
        if (!window.AlshamSupabase) {
            console.error('❌ AlshamSupabase não disponível');
            showError('Sistema não inicializado corretamente');
            return;
        }

        showLoading(true, 'Carregando dashboard...');

        // Autenticar usuário
        const authResult = await authenticateUser();
        if (!authResult.success) {
            redirectToLogin();
            return;
        }

        dashboardState.user = authResult.user;
        dashboardState.orgId = authResult.orgId;

        // Carregar dados
        await loadDashboardData();

        // Renderizar interface
        renderDashboard();
        
        showLoading(false);
        console.log('✅ Dashboard inicializado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar dashboard:', error);
        showLoading(false);
        loadDemoData();
        showError('Erro ao carregar. Dados demo carregados.');
    }
});

// ===== AUTENTICAÇÃO =====
async function authenticateUser() {
    try {
        const session = await window.AlshamSupabase.getCurrentSession();
        
        if (!session?.user) {
            return { success: false };
        }

        const orgId = await window.AlshamSupabase.getCurrentOrgId();
        
        return { 
            success: true, 
            user: session.user, 
            orgId: orgId
        };
        
    } catch (error) {
        console.error('❌ Erro na autenticação:', error);
        return { success: false };
    }
}

function redirectToLogin() {
    window.location.href = '/login.html';
}

// ===== CARREGAMENTO DE DADOS =====
async function loadDashboardData() {
    try {
        dashboardState.isLoading = true;
        
        // Carregar leads usando função disponível
        const { data: leads, error } = await window.AlshamSupabase.getLeads(dashboardState.orgId);
        
        if (error) {
            console.error('❌ Erro ao carregar leads:', error);
            throw error;
        }

        dashboardState.leads = leads || [];
        
        // Calcular KPIs
        calculateKPIs();
        
        console.log(`✅ ${dashboardState.leads.length} leads carregados`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        throw error;
    } finally {
        dashboardState.isLoading = false;
    }
}

// ===== CÁLCULO DE KPIs =====
function calculateKPIs() {
    const leads = dashboardState.leads;
    const today = new Date().toDateString();
    
    dashboardState.kpis = {
        totalLeads: leads.length,
        
        newLeadsToday: leads.filter(lead => 
            new Date(lead.created_at).toDateString() === today
        ).length,
        
        qualifiedLeads: leads.filter(lead => 
            lead.status === 'qualificado'
        ).length,
        
        convertedLeads: leads.filter(lead => 
            lead.status === 'convertido'
        ).length,
        
        conversionRate: leads.length > 0 
            ? ((leads.filter(l => l.status === 'convertido').length / leads.length) * 100).toFixed(1)
            : 0
    };
    
    console.log('📊 KPIs calculados:', dashboardState.kpis);
}

// ===== RENDERIZAÇÃO =====
function renderDashboard() {
    try {
        updatePlaceholderText();
        renderKPIs();
        renderCharts();
        
        console.log('🎨 Dashboard renderizado');
        
    } catch (error) {
        console.error('❌ Erro ao renderizar dashboard:', error);
    }
}

function updatePlaceholderText() {
    // Remover texto de placeholder e mostrar que dados foram carregados
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        const placeholder = mainContent.querySelector('p');
        if (placeholder && placeholder.textContent.includes('Sistema carregando')) {
            placeholder.innerHTML = `
                <div class="text-green-600 font-medium">
                    ✅ Sistema carregado com ${dashboardState.kpis.totalLeads} leads do Supabase
                </div>
            `;
        }
    }
}

function renderKPIs() {
    // Tentar encontrar container de KPIs ou criar um
    let kpisContainer = document.getElementById('kpis-container');
    
    if (!kpisContainer) {
        // Criar container se não existir
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            kpisContainer = document.createElement('div');
            kpisContainer.id = 'kpis-container';
            kpisContainer.className = 'mb-8';
            mainContent.appendChild(kpisContainer);
        } else {
            return;
        }
    }
    
    const kpisHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total de Leads -->
            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Total de Leads</p>
                        <p class="text-3xl font-bold text-blue-600">${dashboardState.kpis.totalLeads}</p>
                    </div>
                    <div class="p-3 bg-blue-100 rounded-full">
                        <span class="text-2xl">👥</span>
                    </div>
                </div>
            </div>
            
            <!-- Novos Hoje -->
            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Novos Hoje</p>
                        <p class="text-3xl font-bold text-green-600">${dashboardState.kpis.newLeadsToday}</p>
                    </div>
                    <div class="p-3 bg-green-100 rounded-full">
                        <span class="text-2xl">🆕</span>
                    </div>
                </div>
            </div>
            
            <!-- Qualificados -->
            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Qualificados</p>
                        <p class="text-3xl font-bold text-purple-600">${dashboardState.kpis.qualifiedLeads}</p>
                    </div>
                    <div class="p-3 bg-purple-100 rounded-full">
                        <span class="text-2xl">✅</span>
                    </div>
                </div>
            </div>
            
            <!-- Taxa de Conversão -->
            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                        <p class="text-3xl font-bold text-yellow-600">${dashboardState.kpis.conversionRate}%</p>
                    </div>
                    <div class="p-3 bg-yellow-100 rounded-full">
                        <span class="text-2xl">📈</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    kpisContainer.innerHTML = kpisHTML;
}

function renderCharts() {
    // Tentar encontrar container de gráficos ou criar um
    let chartsContainer = document.getElementById('charts-container');
    
    if (!chartsContainer) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            chartsContainer = document.createElement('div');
            chartsContainer.id = 'charts-container';
            chartsContainer.className = 'mb-8';
            mainContent.appendChild(chartsContainer);
        } else {
            return;
        }
    }
    
    const chartsHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Gráfico de Status -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Leads por Status</h3>
                <div class="relative" style="height: 300px;">
                    <canvas id="status-chart"></canvas>
                </div>
            </div>
            
            <!-- Gráfico Diário -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Leads dos Últimos 7 Dias</h3>
                <div class="relative" style="height: 300px;">
                    <canvas id="daily-chart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    chartsContainer.innerHTML = chartsHTML;
    
    // Renderizar gráficos após inserir HTML
    setTimeout(() => {
        renderStatusChart();
        renderDailyChart();
    }, 100);
}

function renderStatusChart() {
    const canvas = document.getElementById('status-chart');
    if (!canvas || !window.Chart) return;
    
    // Destruir gráfico existente
    if (dashboardState.charts.statusChart) {
        dashboardState.charts.statusChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    // Contar leads por status
    const statusCounts = {
        'Novo': dashboardState.leads.filter(l => l.status === 'novo').length,
        'Contatado': dashboardState.leads.filter(l => l.status === 'contatado').length,
        'Qualificado': dashboardState.leads.filter(l => l.status === 'qualificado').length,
        'Proposta': dashboardState.leads.filter(l => l.status === 'proposta').length,
        'Convertido': dashboardState.leads.filter(l => l.status === 'convertido').length,
        'Perdido': dashboardState.leads.filter(l => l.status === 'perdido').length
    };
    
    dashboardState.charts.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#3B82F6', // Azul
                    '#EF4444', // Vermelho  
                    '#10B981', // Verde
                    '#F59E0B', // Amarelo
                    '#8B5CF6', // Roxo
                    '#6B7280'  // Cinza
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
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
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function renderDailyChart() {
    const canvas = document.getElementById('daily-chart');
    if (!canvas || !window.Chart) return;
    
    // Destruir gráfico existente
    if (dashboardState.charts.dailyChart) {
        dashboardState.charts.dailyChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    // Últimos 7 dias
    const days = [];
    const counts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        days.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        
        const count = dashboardState.leads.filter(lead => 
            lead.created_at && lead.created_at.startsWith(dateStr)
        ).length;
        
        counts.push(count);
    }
    
    dashboardState.charts.dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Novos Leads',
                data: counts,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#3B82F6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ===== DADOS DEMO (FALLBACK) =====
function loadDemoData() {
    dashboardState.leads = [
        {
            id: '1',
            nome: 'João Silva',
            email: 'joao@exemplo.com',
            status: 'novo',
            created_at: new Date().toISOString()
        },
        {
            id: '2', 
            nome: 'Maria Santos',
            email: 'maria@exemplo.com',
            status: 'qualificado',
            created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '3',
            nome: 'Pedro Costa', 
            email: 'pedro@exemplo.com',
            status: 'convertido',
            created_at: new Date(Date.now() - 172800000).toISOString()
        }
    ];
    
    calculateKPIs();
    renderDashboard();
    
    console.log('✅ Dados demo carregados');
}

// ===== ATUALIZAÇÃO =====
async function refreshDashboard() {
    try {
        showLoading(true, 'Atualizando dashboard...');
        
        await loadDashboardData();
        renderDashboard();
        
        showLoading(false);
        showSuccess('Dashboard atualizado!');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar:', error);
        showLoading(false);
        showError('Erro ao atualizar dashboard');
    }
}

// ===== NOTIFICAÇÕES =====
function showLoading(show, message = 'Carregando...') {
    let loader = document.getElementById('loading-overlay');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loading-overlay';
            loader.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loader.innerHTML = `
                <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span class="text-gray-700">${message}</span>
                </div>
            `;
            document.body.appendChild(loader);
        }
    } else {
        if (loader) {
            loader.remove();
        }
    }
}

function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${colors[type]}`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <p class="text-sm font-medium">${message}</p>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-gray-400 hover:text-gray-600">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

// ===== EXPORTAR PARA USO GLOBAL =====
window.DashboardSystem = {
    state: dashboardState,
    refresh: refreshDashboard,
    loadData: loadDashboardData
};

console.log('📊 Dashboard Simples carregado e pronto!');
