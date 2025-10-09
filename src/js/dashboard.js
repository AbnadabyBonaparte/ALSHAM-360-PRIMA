/**
 * 📊 ALSHAM 360° PRIMA - Dashboard Executivo
 * @version 8.2.0 - PRODUÇÃO FINAL (Unificado, Corrigido)
 * @author ALSHAM Development Team
 */

console.log('📊 Dashboard v8.2 carregando...');

// Estado global do dashboard
const DashboardState = {
  kpis: {},
  leads: [],
  charts: {},
  orgId: null,
  isLoading: false,
  roi: { revenue: 0, spend: 0, roi: 0 },
  gamification: { points: 0 },
  user: null
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

    // Obter usuário logado, se a função existir
    if (typeof window.AlshamSupabase.getCurrentUser === 'function') {
      DashboardState.user = await window.AlshamSupabase.getCurrentUser();
      if (!DashboardState.user || !DashboardState.user.id) {
        showError('Usuário não autenticado');
        return;
      }
    }

    // Obter org_id
    DashboardState.orgId = await window.AlshamSupabase.getCurrentOrgId();
    console.log('📍 Org ID:', DashboardState.orgId);

    if (!DashboardState.orgId) {
      throw new Error('Org ID não encontrado');
    }

    // Carregar dados (paralelo)
    await loadDashboardData();

    // Renderizar interface
    renderDashboard();

    // Setup de atualizações em tempo real
    setupRealtime();

    // Gamificação: pontua ao acessar dashboard
    await awardGamificationPoints('dashboard_access', 'access');

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
// CARREGAMENTO DE DADOS (com ROI e Gamificação)
// ============================================================================
async function loadDashboardData() {
  try {
    console.log('📥 Carregando dados do dashboard...');
    // Carregamento paralelo
    const [kpis, roi, leadsResult, gamification] = await Promise.all([
      window.AlshamSupabase.getDashboardKPIs(DashboardState.orgId),
      window.AlshamSupabase.getROI(DashboardState.orgId),
      window.AlshamSupabase.getLeads(100, DashboardState.orgId),
      loadGamification()
    ]);
    DashboardState.kpis = kpis || {};
    DashboardState.roi = roi || { revenue: 0, spend: 0, roi: 0 };
    DashboardState.leads = leadsResult?.data || [];
    DashboardState.gamification = gamification || { points: 0 };

    // KPIs fallback manual se necessário
    if (!DashboardState.kpis || DashboardState.kpis.total_leads === undefined) {
      DashboardState.kpis = calculateKPIsFromLeads(DashboardState.leads);
    }

    // Trigger n8n se conversão baixa
    if (DashboardState.kpis.conversion_rate < 5) await triggerN8nOnLowConversion();
    console.log(`✅ ${DashboardState.leads.length} leads carregados`);
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

async function loadGamification() {
  if (!DashboardState.user?.id) return { points: 0 };
  const { data } = await window.AlshamSupabase.genericSelect("gamification_points", { user_id: DashboardState.user.id, org_id: DashboardState.orgId });
  return { points: data?.reduce((s, p) => s + (p.points_awarded || 0), 0) || 0 };
}

async function awardGamificationPoints(action, type) {
  if (!DashboardState.user?.id) return;
  const points = 10;
  const payload = {
    user_id: DashboardState.user.id,
    points_awarded: points,
    reason: `${type}: ${action}`
  };
  await window.AlshamSupabase.genericInsert('gamification_points', payload);
  DashboardState.gamification.points += points;
}

async function triggerN8nOnLowConversion() {
  const endpoint = 'https://your-n8n-url/webhook/low-conversion'; // Configure in env
  const payload = { orgId: DashboardState.orgId, conversion_rate: DashboardState.kpis.conversion_rate };
  await window.AlshamSupabase.triggerN8n(endpoint, payload);
}

// ============================================================================
// RENDERIZAÇÃO
// ============================================================================
function renderDashboard() {
  renderKPIs();
  renderROI();
  renderStatusChart();
  renderDailyChart();
  renderLeadsTable();
}

// KPIs
function renderKPIs() {
  const kpis = DashboardState.kpis;
  const gamification = DashboardState.gamification;
  const container = document.getElementById('dashboard-kpis');
  if (!container) {
    console.warn('⚠️ Container dashboard-kpis não encontrado');
    return;
  }
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Total de Leads</p>
          <h3 class="text-3xl font-bold text-gray-900">${kpis.total_leads || 0}</h3>
        </div>
        <div class="bg-blue-100 rounded-full p-3 mt-3 text-blue-600">👥</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Novos Hoje</p>
          <h3 class="text-3xl font-bold text-gray-900">${kpis.new_leads_today || 0}</h3>
        </div>
        <div class="bg-green-100 rounded-full p-3 mt-3 text-green-600">🟢</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Qualificados</p>
          <h3 class="text-3xl font-bold text-gray-900">${kpis.qualified_leads || 0}</h3>
        </div>
        <div class="bg-purple-100 rounded-full p-3 mt-3 text-purple-600">⭐</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Taxa Conversão</p>
          <h3 class="text-3xl font-bold text-gray-900">${kpis.conversion_rate || 0}%</h3>
        </div>
        <div class="bg-yellow-100 rounded-full p-3 mt-3 text-yellow-600">🏆</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Pontos Gamificação</p>
          <h3 class="text-3xl font-bold text-gray-900">${gamification.points || 0}</h3>
        </div>
        <div class="bg-yellow-100 rounded-full p-3 mt-3 text-yellow-600">🏅</div>
      </div>
    </div>
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

// ROI Card
function renderROI() {
  const container = document.getElementById("roi-container");
  if (!container) return;
  const { roi } = DashboardState;
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">ROI Mensal</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
          <p class="text-sm text-gray-600 mb-1">Receita</p>
          <h3 class="text-2xl font-bold text-green-600">R$ ${roi.revenue?.toFixed(2) || "0.00"}</h3>
        </div>
        <div class="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
          <p class="text-sm text-gray-600 mb-1">Gasto</p>
          <h3 class="text-2xl font-bold text-red-600">R$ ${roi.spend?.toFixed(2) || "0.00"}</h3>
        </div>
        <div class="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
          <p class="text-sm text-gray-600 mb-1">ROI</p>
          <h3 class="text-2xl font-bold text-blue-600">${roi.roi?.toFixed(1) || "0.0"}%</h3>
        </div>
      </div>
    </div>
  `;
}

// GRÁFICOS
function renderStatusChart() {
  const canvas = document.getElementById('status-chart');
  if (!canvas || !window.Chart) {
    console.warn('Canvas status-chart ou Chart.js não disponível');
    return;
  }

  const leads = DashboardState.leads;
  if (DashboardState.charts.statusChart) DashboardState.charts.statusChart.destroy();

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
        backgroundColor: ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#059669', '#EF4444'],
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
          labels: { padding: 15, font: { size: 12 } }
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
  if (DashboardState.charts.dailyChart) DashboardState.charts.dailyChart.destroy();

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
          ticks: { stepSize: 1, font: { size: 11 } },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
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
  const leads = DashboardState.leads.slice(0, 10);
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
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">Leads Recentes</h3>
        <button onclick="exportLeadsCSV()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Exportar CSV</button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temperatura</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">${rows}</tbody>
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
  const loader = document.getElementById('loading-indicator');
  if (loader) loader.style.display = show ? 'flex' : 'none';
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
// EXPORTAÇÃO CSV
// ============================================================================
window.exportLeadsCSV = function() {
  function esc(val) {
    if (val == null) return '';
    return `"${String(val).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
  }
  const csvContent = "data:text/csv;charset=utf-8," +
    "ID,Nome,Email,Telefone,Empresa,Cargo,Status,Origem,Score IA,Data Criação\n" +
    DashboardState.leads.map(l =>
      `${esc(l.id)},${esc(l.nome)},${esc(l.email)},${esc(l.telefone)},${esc(l.empresa)},${esc(l.cargo)},${esc(l.status)},${esc(l.origem)},${esc(l.score_ia || 0)},${esc(new Date(l.created_at).toLocaleDateString('pt-BR'))}`
    ).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "dashboard_leads_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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

console.log('✅ Dashboard v8.2 carregado e pronto');
