/**
 * ALSHAM 360° PRIMA - Sistema de Relatórios V2.0
 * CORRIGIDO: Aguarda Supabase e sem ES6 imports
 */

// Aguarda Supabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.getCurrentSession) {
    console.log("✅ Supabase carregado para Relatórios");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou");
    showError("Erro ao carregar sistema");
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

// UI Helpers (fora do waitForSupabase)
function showError(msg) {
  const div = document.createElement("div");
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-red-600";
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showSuccess(msg) {
  const div = document.createElement("div");
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-green-600";
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// Aguarda Supabase antes de executar
waitForSupabase(() => {
  const {
    getCurrentSession,
    getCurrentOrgId,
    genericSelect
  } = window.AlshamSupabase;

  // ===== ESTADO GLOBAL =====
  const relatoriosState = {
    user: null,
    orgId: null,
    kpis: {},
    leadsData: [],
    charts: {},
    isLoading: false
  };

  // ===== INICIALIZAÇÃO =====
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      console.log("📊 Inicializando relatórios...");
      showLoading(true);

      const authResult = await authenticateUser();
      if (!authResult.success) {
        redirectToLogin();
        return;
      }

      relatoriosState.user = authResult.user;
      relatoriosState.orgId = authResult.orgId;

      await loadReportData();
      renderReports();

      showLoading(false);
      showSuccess("Relatórios carregados!");
    } catch (error) {
      console.error("❌ Erro ao inicializar:", error);
      showLoading(false);
      showError("Erro ao carregar relatórios");
    }
  });

  // ===== AUTENTICAÇÃO =====
  async function authenticateUser() {
    try {
      const session = await getCurrentSession();
      if (!session?.user) return { success: false };
      const orgId = await getCurrentOrgId();
      return { success: true, user: session.user, orgId };
    } catch (error) {
      return { success: false, error };
    }
  }

  function redirectToLogin() {
    window.location.href = "/login.html";
  }

  // ===== CARREGAMENTO DE DADOS =====
  async function loadReportData() {
    try {
      relatoriosState.isLoading = true;

      const [kpis, leads] = await Promise.allSettled([
        genericSelect("dashboard_kpis", { org_id: relatoriosState.orgId }),
        genericSelect("leads_crm", { org_id: relatoriosState.orgId })
      ]);

      relatoriosState.kpis = kpis.value?.data?.[0] || {};
      relatoriosState.leadsData = leads.value?.data || [];

      console.log("✅ Dados carregados do Supabase");
    } catch (error) {
      console.error("❌ Erro ao carregar:", error);
      showError("Erro ao carregar dados");
      loadDemoData();
    } finally {
      relatoriosState.isLoading = false;
    }
  }

  function loadDemoData() {
    relatoriosState.kpis = {
      total_leads: 150,
      convertidos: 45,
      conversao: 30,
      receita_total: 125000
    };
    relatoriosState.leadsData = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      status: ["novo", "contatado", "qualificado", "convertido"][Math.floor(Math.random() * 4)]
    }));
  }

  // ===== RENDERIZAÇÃO =====
  function renderReports() {
    renderKPIs();
    renderLeadsChart();
    console.log("🎨 Relatórios renderizados");
  }

  function renderKPIs() {
    const container = document.getElementById("kpi-cards");
    if (!container) return;

    const kpis = relatoriosState.kpis;
    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-sm text-gray-600">Total de Leads</p>
        <p class="text-3xl font-bold text-primary">${kpis.total_leads || 0}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-sm text-gray-600">Convertidos</p>
        <p class="text-3xl font-bold text-green-600">${kpis.convertidos || 0}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-sm text-gray-600">Taxa Conversão</p>
        <p class="text-3xl font-bold text-purple-600">${kpis.conversao || 0}%</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-sm text-gray-600">Receita Total</p>
        <p class="text-3xl font-bold text-orange-600">R$ ${(kpis.receita_total || 0).toLocaleString()}</p>
      </div>
    `;
  }

  function renderLeadsChart() {
    const canvas = document.getElementById("leads-chart");
    if (!canvas || !window.Chart) return;

    if (relatoriosState.charts.leadsChart) {
      relatoriosState.charts.leadsChart.destroy();
    }

    const last30Days = [];
    const counts = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      last30Days.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
      counts.push(relatoriosState.leadsData.filter(l => l.created_at?.startsWith(dateStr)).length);
    }

    relatoriosState.charts.leadsChart = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: last30Days,
        datasets: [{
          label: "Novos Leads",
          data: counts,
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: "top"
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

  // ===== LOADING =====
  function showLoading(show) {
    const el = document.getElementById("relatorios-loader");
    if (el) {
      el.style.display = show ? "flex" : "none";
    }
  }

  // ===== EXPORT =====
  window.RelatoriosSystem = {
    refresh: () => loadReportData().then(renderReports),
    getState: () => ({ ...relatoriosState }),
    version: "2.0.0"
  };

  console.log("📊 Relatórios V2.0 pronto");
});
