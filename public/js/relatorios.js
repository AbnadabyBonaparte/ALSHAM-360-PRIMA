/**
 * ALSHAM 360° PRIMA - Sistema de Relatórios V2.1.0
 * Relatórios com KPIs, gráficos e filtros de período
 */

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

function showError(msg) {
  const div = document.createElement("div");
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-red-600 shadow-lg";
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showSuccess(msg) {
  const div = document.createElement("div");
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-green-600 shadow-lg";
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

waitForSupabase(() => {
  const { getCurrentSession, getCurrentOrgId, genericSelect } = window.AlshamSupabase;

  const relatoriosState = {
    user: null,
    orgId: null,
    kpis: {},
    leadsData: [],
    opportunitiesData: [],
    charts: {},
    isLoading: false,
    periodFilter: 30
  };

  document.addEventListener("DOMContentLoaded", async () => {
    try {
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
      setupFilters();

      showLoading(false);
      showSuccess("Relatórios carregados!");
    } catch (error) {
      console.error("❌ Erro ao inicializar:", error);
      showLoading(false);
      showError("Erro ao carregar relatórios");
    }
  });

  async function authenticateUser() {
    try {
      const session = await getCurrentSession();
      if (!session?.user) return { success: false };
      const orgId = await getCurrentOrgId();
      return { success: true, user: session.user, orgId };
    } catch {
      return { success: false };
    }
  }

  function redirectToLogin() {
    window.location.href = "/login.html";
  }

  async function loadReportData() {
    try {
      relatoriosState.isLoading = true;

      const [kpis, leads, opportunities] = await Promise.allSettled([
        genericSelect("dashboard_kpis", { org_id: relatoriosState.orgId }),
        genericSelect("leads_crm", { org_id: relatoriosState.orgId }),
        genericSelect("sales_opportunities", { org_id: relatoriosState.orgId })
      ]);

      relatoriosState.kpis = kpis.status === "fulfilled" ? kpis.value.data?.[0] || {} : {};
      relatoriosState.leadsData = leads.status === "fulfilled" ? leads.value.data || [] : [];
      relatoriosState.opportunitiesData = opportunities.status === "fulfilled" ? opportunities.value.data || [] : [];

      console.log(`✅ ${relatoriosState.leadsData.length} leads carregados`);
    } catch (error) {
      console.error("❌ Erro ao carregar:", error);
      showError("Erro ao carregar dados");
    } finally {
      relatoriosState.isLoading = false;
    }
  }

  function renderReports() {
    renderKPIs();
    renderLeadsChart();
    renderStatusChart();
    renderRevenueChart();
  }

  function renderKPIs() {
    const container = document.getElementById("kpi-cards");
    if (!container) return;

    const totalLeads = relatoriosState.leadsData.length;
    const convertidos = relatoriosState.leadsData.filter(l => l.status === "convertido").length;
    const taxaConversao = totalLeads > 0 ? ((convertidos / totalLeads) * 100).toFixed(1) : 0;
    const receitaTotal = relatoriosState.opportunitiesData
      .filter(o => o.etapa === "fechado_ganho")
      .reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);

    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <p class="text-sm text-gray-600 mb-1">Total de Leads</p>
        <p class="text-3xl font-bold text-blue-600">${totalLeads}</p>
        <p class="text-xs text-gray-500 mt-1">Todos os leads cadastrados</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <p class="text-sm text-gray-600 mb-1">Convertidos</p>
        <p class="text-3xl font-bold text-green-600">${convertidos}</p>
        <p class="text-xs text-gray-500 mt-1">${taxaConversao}% de conversão</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <p class="text-sm text-gray-600 mb-1">Receita Total</p>
        <p class="text-3xl font-bold text-purple-600">R$ ${receitaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        <p class="text-xs text-gray-500 mt-1">Oportunidades fechadas</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <p class="text-sm text-gray-600 mb-1">Ticket Médio</p>
        <p class="text-3xl font-bold text-orange-600">R$ ${convertidos > 0 ? (receitaTotal / convertidos).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00'}</p>
        <p class="text-xs text-gray-500 mt-1">Por lead convertido</p>
      </div>
    `;
  }

  function renderLeadsChart() {
    const canvas = document.getElementById("leads-chart");
    if (!canvas || !window.Chart) return;

    if (relatoriosState.charts.leadsChart) {
      relatoriosState.charts.leadsChart.destroy();
    }

    const days = relatoriosState.periodFilter;
    const labels = [];
    const counts = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      labels.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
      counts.push(relatoriosState.leadsData.filter(l => l.created_at?.startsWith(dateStr)).length);
    }

    relatoriosState.charts.leadsChart = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: labels,
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
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  function renderStatusChart() {
    const canvas = document.getElementById("status-chart");
    if (!canvas || !window.Chart) return;

    if (relatoriosState.charts.statusChart) {
      relatoriosState.charts.statusChart.destroy();
    }

    const statusCount = {};
    relatoriosState.leadsData.forEach(lead => {
      const status = lead.status || "indefinido";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    relatoriosState.charts.statusChart = new Chart(canvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: Object.keys(statusCount),
        datasets: [{
          data: Object.values(statusCount),
          backgroundColor: ["#3B82F6", "#F59E0B", "#8B5CF6", "#10B981", "#EF4444", "#6B7280"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right" }
        }
      }
    });
  }

  function renderRevenueChart() {
    const canvas = document.getElementById("revenue-chart");
    if (!canvas || !window.Chart) return;

    if (relatoriosState.charts.revenueChart) {
      relatoriosState.charts.revenueChart.destroy();
    }

    const months = [];
    const revenues = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(d.toLocaleDateString("pt-BR", { month: "short" }));
      
      const monthRevenue = relatoriosState.opportunitiesData
        .filter(o => o.created_at?.startsWith(monthStr) && o.etapa === "fechado_ganho")
        .reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
      
      revenues.push(monthRevenue);
    }

    relatoriosState.charts.revenueChart = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: months,
        datasets: [{
          label: "Receita (R$)",
          data: revenues,
          backgroundColor: "#10B981"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  function setupFilters() {
    const buttons = document.querySelectorAll(".period-filter-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const period = parseInt(btn.dataset.period);
        relatoriosState.periodFilter = period;
        
        buttons.forEach(b => {
          if (parseInt(b.dataset.period) === period) {
            b.className = "period-filter-btn px-3 py-1 text-sm rounded bg-blue-600 text-white font-semibold";
          } else {
            b.className = "period-filter-btn px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200";
          }
        });
        
        renderLeadsChart();
      });
    });
  }

  function showLoading(show) {
    const loader = document.getElementById("relatorios-loader");
    if (loader) {
      loader.classList.toggle("hidden", !show);
    }
  }

  window.RelatoriosSystem = {
    refresh: () => loadReportData().then(renderReports),
    getState: () => ({ ...relatoriosState }),
    version: "2.1.0"
  };

  console.log("📊 Relatórios v2.1.0 carregados");
});
