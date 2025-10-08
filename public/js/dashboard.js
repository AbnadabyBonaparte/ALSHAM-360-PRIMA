/**
 * 📊 ALSHAM 360° PRIMA - Dashboard Executivo
 * @version 8.1.1 - PRODUÇÃO FINAL AUDITADA
 * @author ALSHAM Development
 * ✅ Revisão: segurança, logs, validação Chart.js e Supabase
 */

console.log("📊 Dashboard v8.1.1 — inicializando...");

// ============================================================================
// ESTADO GLOBAL
// ============================================================================
const DashboardState = {
  kpis: {},
  leads: [],
  charts: {},
  orgId: null,
  isLoading: false,
};

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  console.info("🚀 DOM pronto — iniciando Dashboard");
  await initDashboard();
});

async function initDashboard() {
  try {
    DashboardState.isLoading = true;
    showLoading(true);

    // ✅ Proteção Supabase
    if (
      !window.AlshamSupabase ||
      typeof window.AlshamSupabase.getCurrentOrgId !== "function"
    ) {
      throw new Error("Supabase não carregado ou funções indisponíveis.");
    }

    DashboardState.orgId = await window.AlshamSupabase.getCurrentOrgId();
    if (!DashboardState.orgId) throw new Error("Org ID não encontrado.");

    await loadDashboardData();
    renderDashboard();
    setupRealtime();

    console.info("✅ Dashboard inicializado com sucesso");
  } catch (error) {
    console.error("❌ Falha na inicialização do Dashboard:", error);
    showError("Erro ao inicializar: " + error.message);
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
    console.log("📥 Carregando dados do Supabase...");

    if (typeof window.AlshamSupabase.getDashboardKPIs !== "function") {
      throw new Error("Função getDashboardKPIs ausente no Supabase.");
    }

    const kpis = await window.AlshamSupabase.getDashboardKPIs(DashboardState.orgId);
    DashboardState.kpis = kpis || {};

    const leadsResult = await window.AlshamSupabase.getLeads(100, DashboardState.orgId);
    DashboardState.leads = leadsResult?.data || [];

    if (!DashboardState.kpis?.total_leads) {
      console.warn("⚠️ View não retornou dados, calculando KPIs localmente...");
      DashboardState.kpis = calculateKPIsFromLeads(DashboardState.leads);
    }

    console.log(`✅ ${DashboardState.leads.length} leads carregados`);
  } catch (error) {
    console.error("❌ Erro ao carregar dados do dashboard:", error);
    throw error;
  }
}

function calculateKPIsFromLeads(leads) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const today = new Date().toDateString();

  return {
    total_leads: leads.length,
    new_leads_last_7_days: leads.filter(l => new Date(l.created_at) >= sevenDaysAgo).length,
    new_leads_today: leads.filter(l => new Date(l.created_at).toDateString() === today).length,
    qualified_leads: leads.filter(l => ["qualificado", "em_contato"].includes(l.status)).length,
    hot_leads: leads.filter(l => l.temperatura === "quente").length,
    warm_leads: leads.filter(l => l.temperatura === "morno").length,
    cold_leads: leads.filter(l => l.temperatura === "frio").length,
    converted_leads: leads.filter(l => l.status === "convertido").length,
    lost_leads: leads.filter(l => l.status === "perdido").length,
    conversion_rate: leads.length
      ? ((leads.filter(l => l.status === "convertido").length / leads.length) * 100).toFixed(1)
      : 0,
  };
}

// ============================================================================
// RENDERIZAÇÃO PRINCIPAL
// ============================================================================
function renderDashboard() {
  if (typeof Chart === "undefined") {
    console.error("⚠️ Chart.js não encontrado — abortando renderização.");
    showError("Erro: Chart.js não carregado.");
    return;
  }

  renderKPIs();
  renderStatusChart();
  renderDailyChart();
  renderLeadsTable();
}

// -----------------------------------------------------------------------------
// KPIs
// -----------------------------------------------------------------------------
function renderKPIs() {
  const { kpis } = DashboardState;
  const container = document.getElementById("dashboard-kpis");
  if (!container) return console.warn("⚠️ Container #dashboard-kpis não encontrado.");

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      ${createKpiCard("Total de Leads", kpis.total_leads || 0, "text-blue-600", "bg-blue-100", "👥")}
      ${createKpiCard("Novos Hoje", kpis.new_leads_today || 0, "text-green-600", "bg-green-100", "🟢")}
      ${createKpiCard("Qualificados", kpis.qualified_leads || 0, "text-purple-600", "bg-purple-100", "⭐")}
      ${createKpiCard("Taxa Conversão", (kpis.conversion_rate || 0) + "%", "text-yellow-600", "bg-yellow-100", "📈")}
    </div>
  `;
}

function createKpiCard(label, value, textClass, bgClass, icon) {
  return `
    <div class="bg-white rounded-lg shadow p-6 transition hover:shadow-md">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">${label}</p>
          <h3 class="text-3xl font-bold ${textClass}">${value}</h3>
        </div>
        <div class="${bgClass} rounded-full p-3 text-xl">${icon}</div>
      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// GRÁFICOS
// -----------------------------------------------------------------------------
function renderStatusChart() {
  const canvas = document.getElementById("status-chart");
  if (!canvas) return console.warn("⚠️ Canvas #status-chart não encontrado.");

  DashboardState.charts.statusChart?.destroy();

  const leads = DashboardState.leads;
  const counts = {
    novo: leads.filter(l => l.status === "novo").length,
    em_contato: leads.filter(l => l.status === "em_contato").length,
    qualificado: leads.filter(l => l.status === "qualificado").length,
    convertido: leads.filter(l => l.status === "convertido").length,
    perdido: leads.filter(l => l.status === "perdido").length,
  };

  DashboardState.charts.statusChart = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ["#3B82F6", "#F59E0B", "#8B5CF6", "#10B981", "#EF4444"],
        borderWidth: 2,
        borderColor: "#fff",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const perc = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
              return `${ctx.label}: ${ctx.parsed} (${perc}%)`;
            },
          },
        },
      },
    },
  });
}

function renderDailyChart() {
  const canvas = document.getElementById("daily-chart");
  if (!canvas) return console.warn("⚠️ Canvas #daily-chart não encontrado.");

  DashboardState.charts.dailyChart?.destroy();

  const leads = DashboardState.leads;
  const days = [];
  const counts = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
    counts.push(leads.filter(l => l.created_at?.startsWith(key)).length);
  }

  DashboardState.charts.dailyChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: days,
      datasets: [{
        label: "Novos Leads",
        data: counts,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59,130,246,0.1)",
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
        x: { grid: { display: false } },
      },
    },
  });
}

// -----------------------------------------------------------------------------
// TABELA DE LEADS
// -----------------------------------------------------------------------------
function renderLeadsTable() {
  const container = document.getElementById("leads-table");
  if (!container) return;

  const leads = DashboardState.leads.slice(0, 10);
  if (!leads.length) {
    container.innerHTML = `<div class="text-center py-8 text-gray-500">Nenhum lead encontrado</div>`;
    return;
  }

  const rows = leads
    .map(l => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-3 font-medium text-gray-900">${l.nome || "N/A"}</td>
        <td class="px-6 py-3 text-gray-600">${l.email || "—"}</td>
        <td class="px-6 py-3 text-gray-600">${l.empresa || "—"}</td>
        <td class="px-6 py-3">${getStatusBadge(l.status)}</td>
        <td class="px-6 py-3">${getTemperaturaBadge(l.temperatura)}</td>
        <td class="px-6 py-3 text-gray-600">${new Date(l.created_at).toLocaleDateString("pt-BR")}</td>
      </tr>
    `)
    .join("");

  container.innerHTML = `
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Leads Recentes</h3>
      </div>
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
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// ============================================================================
// HELPERS DE UI
// ============================================================================
function getStatusBadge(status) {
  const map = {
    novo: "bg-blue-100 text-blue-800",
    em_contato: "bg-yellow-100 text-yellow-800",
    qualificado: "bg-purple-100 text-purple-800",
    convertido: "bg-green-100 text-green-800",
    perdido: "bg-red-100 text-red-800",
  };
  return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${map[status] || "bg-gray-100 text-gray-800"}">${status || "N/A"}</span>`;
}

function getTemperaturaBadge(temp) {
  const map = {
    quente: "bg-red-100 text-red-800",
    morno: "bg-orange-100 text-orange-800",
    frio: "bg-blue-100 text-blue-800",
  };
  return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${map[temp] || "bg-gray-100 text-gray-800"}">${temp || "N/A"}</span>`;
}

function showLoading(show) {
  const el = document.getElementById("loading-indicator");
  if (el) el.style.display = show ? "flex" : "none";
}

function showError(msg) {
  const container = document.getElementById("dashboard-kpis");
  if (container) {
    container.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar Dashboard</h3>
        <p class="text-red-700 mb-4">${msg}</p>
        <button onclick="location.reload()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Tentar Novamente</button>
      </div>`;
  }
}

// ============================================================================
// REALTIME
// ============================================================================
function setupRealtime() {
  try {
    if (!window.AlshamSupabase?.subscribeToTable || !DashboardState.orgId) return;
    console.log("📡 Ativando monitoramento em tempo real...");
    window.AlshamSupabase.subscribeToTable("leads_crm", DashboardState.orgId, () => {
      console.log("🔄 Atualização em tempo real detectada");
      refreshDashboard();
    });
  } catch (err) {
    console.warn("⚠️ Realtime indisponível:", err.message);
  }
}

async function refreshDashboard() {
  try {
    await loadDashboardData();
    renderDashboard();
    console.log("🔁 Dashboard atualizado");
  } catch (err) {
    console.error("Erro ao atualizar Dashboard:", err);
  }
}

// ============================================================================
// EXPORTAÇÃO GLOBAL
// ============================================================================
window.DashboardApp = {
  state: DashboardState,
  init: initDashboard,
  refresh: refreshDashboard,
};

console.log("✅ Dashboard v8.1.1 carregado e auditado");
