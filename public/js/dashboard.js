/**
 * 📊 ALSHAM 360° PRIMA - Dashboard Executivo
 * @version 8.0.0 - PRODUÇÃO FINAL
 * @author ALSHAM Development Team
 */

console.log('📊 Dashboard v8.0 carregando...');

// Estado global do dashboard
const DashboardState = {
  kpis: {},
  leads: [],
  opportunities: [],
  charts: {},
  orgId: null,
  isLoading: false
};

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOM carregado, iniciando dashboard...');
  await initDashboard();
});

async function initDashboard() {
  try {
    DashboardState.isLoading = true;
    showLoading(true);

    // Verificar se Supabase está carregado
    if (!window.AlshamSupabase) {
      console.error('❌ AlshamSupabase não está disponível');
      showError('Erro ao conectar com o banco de dados');
      return;
    }

    // Obter org_id
    DashboardState.orgId = await window.AlshamSupabase.getCurrentOrgId();
    console.log('📍 Org ID:', DashboardState.orgId);

    // Carregar dados
    await loadDashboardData();

    // Renderizar interface
    renderDashboard();

    // Setup de atualizações em tempo real
    setupRealtime();

    console.log('✅ Dashboard inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar dashboard:', error);
    showError('Erro ao carregar dashboard: ' + error.message);
  } finally {
    DashboardState.isLoading = false;
    showLoading(false);
  }
}

// ============================================================================
// CARREGAMENTO DE DADOS
// ============================================================================
async function loadDashboardData() {
  try {
    console.log('📥 Carregando dados do dashboard...');

    // Carregar KPIs
    const kpis = await window.AlshamSupabase.getDashboardKPIs();
    console.log('📊 KPIs recebidos:', kpis);
    DashboardState.kpis = kpis;

    // Carregar leads
    const leadsResult = await window.AlshamSupabase.getLeads(100);
    DashboardState.leads = leadsResult.data || [];
    console.log('📋 Leads carregados:', DashboardState.leads.length);

    // Calcular KPIs adicionais se necessário
    if (!DashboardState.kpis || DashboardState.kpis.total_leads === undefined) {
      DashboardState.kpis = calculateKPIsFromLeads(DashboardState.leads);
    }

  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    throw error;
  }
}

function calculateKPIsFromLeads(leads) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const today = new Date().toDateString();

  return {
    total_leads: leads.length,
    new_leads_last_7_days: leads.filter(l => new Date(l.created_at) >= sevenDaysAgo).length,
    new_leads_today: leads.filter(l => new Date(l.created_at).toDateString() === today).length,
    qualified_leads: leads.filter(l => ['qualificado', 'em_contato'].includes(l.status)).length,
    hot_leads: leads.filter(l => l.temperatura === 'quente').length,
    warm_leads: leads.filter(l => l.temperatura === 'morno').length,
    cold_leads: leads.filter(l => l.temperatura === 'frio').length,
    converted_leads: leads.filter(l => l.status === 'convertido').length,
    lost_leads: leads.filter(l => l.status === 'perdido').length,
    conversion_rate: leads.length ? ((leads.filter(l => l.status === 'convertido').length / leads.length) * 100).toFixed(1) : 0
  };
}

// ============================================================================
// RENDERIZAÇÃO
// ============================================================================
function renderDashboard() {
  renderKPIs();
  renderStatusChart();
  renderDailyChart();
  renderLeadsTable();
}

function renderKPIs() {
  const kpis = DashboardState.kpis;
  const container = document.getElementById('dashboard-kpis');
  
  if (!container) {
    console.warn('⚠️ Container dashboard-kpis não encontrado');
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total de Leads -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total de Leads</p>
            <h3 class="text-3xl font-bold text-gray-900">${kpis.total_leads || 0}</h3>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Novos Hoje -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Novos Hoje</p>
            <h3 class="text-3xl font-bold text-gray-900">${kpis.new_leads_today || 0}</h3>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Qualificados -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Qualificados</p>
            <h3 class="text-3xl font-bold text-gray-900">${kpis.qualified_leads || 0}</h3>
          </div>
          <div class="bg-purple-100 rounded-full p-3">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Taxa de Conversão -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Taxa Conversão</p>
            <h3 class="text-3xl font-bold text-gray-900">${kpis.conversion_rate || 0}%</h3>
          </div>
          <div class="bg-yellow-100 rounded-full p-3">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Segunda linha de KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-600">🔥 Leads Quentes</p>
        <h4 class="text-2xl font-bold text-red-600">${kpis.hot_leads || 0}</h4>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-600">🌡️ Leads Mornos</p>
        <h4 class="text-2xl font-bold text-orange-600">${kpis.warm_leads || 0}</h4>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-600">❄️ Leads Frios</p>
        <h4 class="text-2xl font-bold text-blue-600">${kpis.cold_leads || 0}</h4>
      </div>
    </div>
  `;
}

function renderStatusChart() {
  const canvas = document.getElementById('status-chart');
  if (!canvas || !window.Chart) {
    console.warn('Canvas status-chart ou Chart.js não disponível');
    return;
  }

  const leads = DashboardState.leads;
  
  // Destruir gráfico anterior se existir
  if (DashboardState.charts.statusChart) {
    DashboardState.charts.statusChart.destroy();
  }

  const statusCounts = {
    novo: leads.filter(l => l.status === 'novo').length,
    em_contato: leads.filter(l => l.status === 'em_contato').length,
    qualificado: leads.filter(l => l.status === 'qualificado').length,
    proposta: leads.filter(l => l.status === 'proposta').length,
    convertido: leads.filter(l => l.status === 'convertido').length,
    perdido: leads.filter(l => l.status === 'perdido').length
  };

  DashboardState.charts.statusChart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Novo', 'Em Contato', 'Qualificado', 'Proposta', 'Convertido', 'Perdido'],
      datasets: [{
        data: [
          statusCounts.novo,
          statusCounts.em_contato,
          statusCounts.qualificado,
          statusCounts.proposta,
          statusCounts.convertido,
          statusCounts.perdido
        ],
        backgroundColor: [
          '#3B82F6', // azul
          '#F59E0B', // laranja
          '#8B5CF6', // roxo
          '#10B981', // verde
          '#059669', // verde escuro
          '#EF4444'  // vermelho
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
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function renderDailyChart() {
  const canvas = document.getElementById('daily-chart');
  if (!canvas || !window.Chart) {
    console.warn('Canvas daily-chart ou Chart.js não disponível');
    return;
  }

  const leads = DashboardState.leads;
  
  // Destruir gráfico anterior se existir
  if (DashboardState.charts.dailyChart) {
    DashboardState.charts.dailyChart.destroy();
  }

  // Gerar dados dos últimos 7 dias
  const days = [];
  const counts = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    days.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    counts.push(leads.filter(l => l.created_at && l.created_at.startsWith(dateStr)).length);
  }

  DashboardState.charts.dailyChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Novos Leads',
        data: counts,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14 },
          bodyFont: { size: 13 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: { size: 11 }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          ticks: { font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

function renderLeadsTable() {
  const container = document.getElementById('leads-table');
  if (!container) return;

  const leads = DashboardState.leads.slice(0, 10); // Primeiros 10

  if (leads.length === 0) {
    container.innerHTML = '<div class="text-center py-8 text-gray-500">Nenhum lead encontrado</div>';
    return;
  }

  const rows = leads.map(lead => {
    const statusBadge = getStatusBadge(lead.status);
    const tempBadge = getTemperaturaBadge(lead.temperatura);
    const date = new Date(lead.created_at).toLocaleDateString('pt-BR');
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${lead.nome || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${lead.email || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${lead.empresa || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
        <td class="px-6 py-4 whitespace-nowrap">${tempBadge}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${date}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Leads Recentes</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperatura</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// HELPERS DE UI
// ============================================================================
function getStatusBadge(status) {
  const badges = {
    novo: '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Novo</span>',
    em_contato: '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Em Contato</span>',
    qualificado: '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Qualificado</span>',
    proposta: '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Proposta</span>',
    convertido: '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Convertido</span>',
    perdido: '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Perdido</span>'
  };
  return badges[status] || '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">N/A</span>';
}

function getTemperaturaBadge(temp) {
  const badges = {
    quente: '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">🔥 Quente</span>',
    morno: '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">🌡️ Morno</span>',
    frio: '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">❄️ Frio</span>'
  };
  return badges[temp] || '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">N/A</span>';
}

function showLoading(show) {
  const loader = document.getElementById('dashboard-loader');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

function showError(message) {
  const container = document.getElementById('dashboard-kpis');
  if (container) {
    container.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-lg font-semibold text-red-900 mb-2">Erro ao Carregar Dashboard</h3>
        <p class="text-red-700">${message}</p>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Tentar Novamente
        </button>
      </div>
    `;
  }
}

// ============================================================================
// REALTIME
// ============================================================================
function setupRealtime() {
  if (!window.AlshamSupabase || !DashboardState.orgId) return;

  window.AlshamSupabase.subscribeToTable('leads_crm', DashboardState.orgId, (payload) => {
    console.log('🔔 Atualização em tempo real:', payload);
    refreshDashboard();
  });
}

async function refreshDashboard() {
  try {
    await loadDashboardData();
    renderDashboard();
    console.log('🔄 Dashboard atualizado');
  } catch (error) {
    console.error('Erro ao atualizar dashboard:', error);
  }
}

// Expor funções globais
window.DashboardApp = {
  state: DashboardState,
  refresh: refreshDashboard,
  init: initDashboard
};

console.log('✅ Dashboard v8.0 carregado e pronto');
