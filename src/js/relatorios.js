import { supabase } from '../lib/supabase.js';

// Estado da aplicação
let currentPeriod = 30;
let charts = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeReportsPage();
});

async function initializeReportsPage() {
    try {
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '../pages/login.html';
            return;
        }

        // Configurar event listeners
        setupEventListeners();
        
        // Carregar dados e gráficos
        await loadReportsData();
        
        // Inicializar gráficos
        initializeCharts();
        
    } catch (error) {
        console.error('Erro ao inicializar página de relatórios:', error);
        showNotification('Erro ao carregar dados', 'error');
    }
}

function setupEventListeners() {
    const periodSelector = document.getElementById('period-selector');
    if (periodSelector) {
        periodSelector.addEventListener('change', function() {
            currentPeriod = parseInt(this.value);
            loadReportsData();
        });
    }
}

async function loadReportsData() {
    try {
        // Calcular data de início baseada no período
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - currentPeriod);

        // Carregar dados do Supabase
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        if (error) throw error;

        // Processar dados e atualizar KPIs
        updateKPIs(leads || []);
        updatePerformanceTable();
        updateCharts(leads || []);
        
    } catch (error) {
        console.error('Erro ao carregar dados dos relatórios:', error);
        // Usar dados mockados em caso de erro
        loadMockData();
    }
}

function loadMockData() {
    // Dados mockados para demonstração
    const mockLeads = generateMockLeads();
    updateKPIs(mockLeads);
    updatePerformanceTable();
    updateCharts(mockLeads);
}

function generateMockLeads() {
    const statuses = ['new', 'qualified', 'proposal', 'converted', 'lost'];
    const sources = ['website', 'social_media', 'referral', 'cold_call', 'email'];
    const companies = ['Tech Corp', 'Digital Solutions', 'Innovation Labs', 'Future Systems', 'Smart Business'];
    
    const leads = [];
    for (let i = 0; i < 500; i++) {
        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * currentPeriod));
        
        leads.push({
            id: i + 1,
            name: `Lead ${i + 1}`,
            email: `lead${i + 1}@example.com`,
            company: companies[Math.floor(Math.random() * companies.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            source: sources[Math.floor(Math.random() * sources.length)],
            value: Math.floor(Math.random() * 50000) + 5000,
            created_at: createdDate.toISOString()
        });
    }
    return leads;
}

function updateKPIs(leads) {
    // Calcular KPIs
    const totalRevenue = leads
        .filter(lead => lead.status === 'converted')
        .reduce((sum, lead) => sum + (lead.value || 0), 0);
    
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
    const conversionRate = leads.length > 0 ? (convertedLeads / leads.length * 100) : 0;
    
    const avgDealSize = convertedLeads > 0 ? totalRevenue / convertedLeads : 0;
    const avgCycle = 15; // Mockado - seria calculado baseado em datas reais

    // Atualizar DOM
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('conversion-rate').textContent = `${conversionRate.toFixed(1)}%`;
    document.getElementById('avg-cycle').textContent = `${avgCycle} dias`;
    document.getElementById('avg-deal-size').textContent = formatCurrency(avgDealSize);
}

function updatePerformanceTable() {
    const performanceData = [
        { name: 'João Silva', revenue: 125000, conversions: 12, rate: 24.5, activity: 95, rank: 1 },
        { name: 'Maria Santos', revenue: 98000, conversions: 10, rate: 22.1, activity: 88, rank: 2 },
        { name: 'Pedro Costa', revenue: 87000, conversions: 8, rate: 19.8, activity: 92, rank: 3 },
        { name: 'Ana Oliveira', revenue: 76000, conversions: 7, rate: 18.2, activity: 85, rank: 4 },
        { name: 'Carlos Mendes', revenue: 65000, conversions: 6, rate: 16.5, activity: 78, rank: 5 }
    ];

    const tableBody = document.getElementById('performance-table');
    if (!tableBody) return;

    tableBody.innerHTML = performanceData.map(seller => `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-4">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold text-xs">${seller.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <span class="font-medium text-gray-900">${seller.name}</span>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="font-semibold text-gray-900">${formatCurrency(seller.revenue)}</span>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-900">${seller.conversions}</span>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-900">${seller.rate}%</span>
            </td>
            <td class="py-4 px-4">
                <div class="flex items-center space-x-2">
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: ${seller.activity}%"></div>
                    </div>
                    <span class="text-xs text-gray-600">${seller.activity}%</span>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${getRankColor(seller.rank)}">
                    #${seller.rank}
                </span>
            </td>
        </tr>
    `).join('');
}

function initializeCharts() {
    initializeRevenueChart();
    initializeFunnelChart();
    initializeSourceChart();
}

function initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Dados mockados para o gráfico de receita
    const labels = [];
    const data = [];
    
    for (let i = currentPeriod - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        data.push(Math.floor(Math.random() * 10000) + 5000);
    }

    charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Receita Diária',
                data: data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
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
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

function initializeFunnelChart() {
    const ctx = document.getElementById('funnelChart');
    if (!ctx) return;

    charts.funnel = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Leads', 'Qualificados', 'Propostas', 'Convertidos'],
            datasets: [{
                data: [1234, 456, 189, 67],
                backgroundColor: [
                    'rgb(59, 130, 246)',
                    'rgb(245, 158, 11)',
                    'rgb(139, 92, 246)',
                    'rgb(16, 185, 129)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function initializeSourceChart() {
    const ctx = document.getElementById('sourceChart');
    if (!ctx) return;

    charts.source = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Website', 'Redes Sociais', 'Indicação', 'Ligação Fria', 'E-mail'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    'rgb(59, 130, 246)',
                    'rgb(245, 158, 11)',
                    'rgb(16, 185, 129)',
                    'rgb(239, 68, 68)',
                    'rgb(139, 92, 246)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                }
            }
        }
    });
}

function updateCharts(leads) {
    // Atualizar gráficos com dados reais quando disponível
    if (charts.revenue) {
        // Lógica para atualizar gráfico de receita
    }
    
    if (charts.funnel) {
        // Lógica para atualizar gráfico de funil
    }
    
    if (charts.source) {
        // Lógica para atualizar gráfico de origem
    }
}

// Funções auxiliares
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function getRankColor(rank) {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800';
    if (rank <= 3) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
}

function showNotification(message, type = 'info') {
    // Implementar sistema de notificações
    console.log(`${type}: ${message}`);
}

// Funções globais
window.generateReport = function() {
    showNotification('Gerando relatório personalizado...', 'info');
    // Implementar geração de relatório
};

window.exportAllReports = function() {
    showNotification('Exportando todos os relatórios...', 'info');
    // Implementar exportação
};

window.optimizeFunnel = function() {
    showNotification('Analisando oportunidades de otimização...', 'info');
    // Implementar otimização de funil
};

window.createCustomReport = function() {
    showNotification('Abrindo criador de relatórios personalizados...', 'info');
    // Implementar criador de relatórios
};

