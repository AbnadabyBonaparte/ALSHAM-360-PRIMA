/**
 * ALSHAM 360° PRIMA - LEADS REAIS V5.9.0
 * Sistema completo de gerenciamento de leads com IA e gamificação
 * CORRIGIDO: CSP compliance + Supabase config com fallback
 *
 * @author AbnadabyBonaparte
 * @date 2025-10-02
 */

/* =============================================================================
   FUNÇÕES AUXILIARES - CARREGAMENTO E NOTIFICAÇÕES
   ============================================================================= */

function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.getCurrentSession) {
    console.log("✅ Supabase carregado para Leads");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou");
    showError("Erro ao carregar sistema");
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

function showError(m) {
  const div = document.createElement("div");
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-red-600 shadow-lg toast";
  div.textContent = m;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showSuccess(m) {
  const div = document.createElement("div");
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-green-600 shadow-lg toast";
  div.textContent = m;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showNotification(m, t = "info") {
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-600",
    info: "bg-blue-600"
  };
  const div = document.createElement("div");
  div.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded text-white ${colors[t]} shadow-lg toast`;
  div.textContent = m;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showLoading(show, msg = "Carregando...") {
  let el = document.getElementById("leads-loading");
  if (show) {
    if (el) {
      el.classList.remove("hidden");
      const textEl = el.querySelector("span");
      if (textEl) textEl.textContent = msg;
    } else {
      el = document.createElement("div");
      el.id = "leads-loading";
      el.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      el.innerHTML = `
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-2xl">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span class="text-gray-700 font-medium">${msg}</span>
        </div>`;
      document.body.appendChild(el);
    }
  } else {
    if (el) el.classList.add("hidden");
  }
}

/* =============================================================================
   INICIALIZAÇÃO PRINCIPAL
   ============================================================================= */

waitForSupabase(() => {
  const {
    getCurrentSession,
    getCurrentOrgId,
    genericSelect,
    genericInsert,
    subscribeToTable
  } = window.AlshamSupabase;

  /* ===========================================================================
     CONFIGURAÇÕES DO SISTEMA
     =========================================================================== */

  const LEADS_CONFIG = {
    statusOptions: [
      { value: "novo", label: "Novo", color: "blue", icon: "🆕", points: 5 },
      { value: "contatado", label: "Contatado", color: "yellow", icon: "📞", points: 10 },
      { value: "qualificado", label: "Qualificado", color: "purple", icon: "✅", points: 20 },
      { value: "proposta", label: "Proposta", color: "orange", icon: "📋", points: 30 },
      { value: "convertido", label: "Convertido", color: "green", icon: "💰", points: 50 },
      { value: "perdido", label: "Perdido", color: "red", icon: "❌", points: 0 }
    ],
    prioridadeOptions: [
      { value: "baixa", label: "Baixa", color: "gray" },
      { value: "media", label: "Média", color: "yellow" },
      { value: "alta", label: "Alta", color: "orange" },
      { value: "urgente", label: "Urgente", color: "red" }
    ],
    temperaturaOptions: [
      { value: "frio", label: "Frio", color: "gray", multiplier: 0.5 },
      { value: "morno", label: "Morno", color: "yellow", multiplier: 0.75 },
      { value: "quente", label: "Quente", color: "orange", multiplier: 1.0 },
      { value: "muito_quente", label: "Muito Quente", color: "red", multiplier: 1.5 }
    ],
    origemOptions: [
      "website", "google_ads", "facebook_ads", "linkedin",
      "indicacao", "evento", "cold_calling", "email_marketing",
      "seo_organic", "outro"
    ],
    interactionTypes: [
      { value: "email", label: "Email", icon: "📧" },
      { value: "ligacao", label: "Ligação", icon: "📞" },
      { value: "reuniao", label: "Reunião", icon: "🤝" },
      { value: "nota", label: "Nota", icon: "📝" },
      { value: "whatsapp", label: "WhatsApp", icon: "💬" }
    ],
    pagination: {
      defaultPerPage: 25,
      options: [10, 25, 50, 100]
    },
    realtime: {
      enabled: true,
      refreshInterval: 30000
    }
  };

  /* ===========================================================================
     ESTADO GLOBAL DA APLICAÇÃO
     =========================================================================== */

  const leadsState = {
    user: null,
    orgId: null,
    leads: [],
    filteredLeads: [],
    kpis: {},
    gamification: {},
    automations: {},
    currentLeadInteractions: [],
    filters: {
      search: "",
      status: "",
      prioridade: "",
      temperatura: "",
      origem: "",
      dateRange: "",
      scoreRange: [0, 100]
    },
    pagination: {
      current: 1,
      perPage: LEADS_CONFIG.pagination.defaultPerPage,
      total: 0,
      totalPages: 0
    },
    sorting: {
      field: "created_at",
      direction: "desc"
    },
    isLoading: false,
    lastUpdate: null,
    charts: {},
    chartPeriod: 7
  };

  /* ===========================================================================
     AUTENTICAÇÃO E INICIALIZAÇÃO
     =========================================================================== */

  async function authenticateUser() {
    try {
      if (window.AlshamAuth?.isAuthenticated) {
        return {
          success: true,
          user: window.AlshamAuth.currentUser,
          orgId: await getCurrentOrgId()
        };
      }
      const session = await getCurrentSession();
      if (!session?.user) return { success: false };
      return {
        success: true,
        user: session.user,
        orgId: await getCurrentOrgId()
      };
    } catch (error) {
      console.error("❌ Erro na autenticação:", error);
      return { success: false };
    }
  }

  function redirectToLogin() {
    window.location.href = "/login.html";
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      showLoading(true, "🚀 Inicializando Leads...");

      const authResult = await authenticateUser();
      if (!authResult.success) {
        redirectToLogin();
        return;
      }

      leadsState.user = authResult.user;
      leadsState.orgId = authResult.orgId;

      await loadSystemData();
      setupInterface();
      setupRealtime();
      setupUIEventListeners();

      showLoading(false);
      showSuccess("🎉 Leads carregados com sucesso!");
    } catch (e) {
      console.error("❌ Erro crítico:", e);
      showLoading(false);
      showError("Falha ao carregar sistema de Leads");
    }
  });

  /* ===========================================================================
     CARREGAMENTO DE DADOS
     =========================================================================== */

  async function loadSystemData() {
    leadsState.isLoading = true;
    try {
      const [leads, kpis, gamification, automations] = await Promise.allSettled([
        loadLeads(),
        loadKPIs(),
        loadGamification(),
        loadAutomations()
      ]);

      if (leads.status === "fulfilled") leadsState.leads = leads.value;
      if (kpis.status === "fulfilled") leadsState.kpis = kpis.value;
      if (gamification.status === "fulfilled") leadsState.gamification = gamification.value;
      if (automations.status === "fulfilled") leadsState.automations = automations.value;

      applyFilters();
      leadsState.lastUpdate = new Date();
    } finally {
      leadsState.isLoading = false;
    }
  }

  async function loadLeads() {
    const { data, error } = await genericSelect("leads_crm",
      { org_id: leadsState.orgId },
      { order: { column: "created_at", ascending: false } }
    );
    if (error) throw error;
    return data || [];
  }

  async function loadKPIs() {
    const { data } = await genericSelect("dashboard_kpis",
      { org_id: leadsState.orgId }
    );
    return data?.[0] || {};
  }

  async function loadGamification() {
    const { data: points } = await genericSelect("gamification_points", {
      user_id: leadsState.user.id,
      org_id: leadsState.orgId
    });
    return {
      points: points?.reduce((s, p) => s + (p.points_awarded || 0), 0) || 0
    };
  }

  async function loadAutomations() {
    const { data } = await genericSelect("automation_rules", {
      org_id: leadsState.orgId,
      is_active: true
    });
    return { active: data || [] };
  }

  async function loadLeadInteractions(leadId) {
    const { data, error } = await genericSelect("lead_interactions",
      { lead_id: leadId, org_id: leadsState.orgId },
      { order: { column: "created_at", ascending: false } }
    );
    if (error) {
      console.error("❌ Erro ao carregar interações:", error);
      return [];
    }
    return data || [];
  }

  async function createInteraction(leadId, interactionData) {
    const { data, error } = await genericInsert("lead_interactions", {
      lead_id: leadId,
      org_id: leadsState.orgId,
      user_id: leadsState.user.id,
      ...interactionData
    });
    if (error) throw error;
    return data;
  }

  /* ===========================================================================
     FILTROS E PAGINAÇÃO
     =========================================================================== */

  function applyFilters() {
    leadsState.filteredLeads = leadsState.leads.filter(l => {
      if (leadsState.filters.search &&
        !l.nome?.toLowerCase().includes(leadsState.filters.search.toLowerCase())) {
        return false;
      }
      if (leadsState.filters.status && l.status !== leadsState.filters.status) {
        return false;
      }
      if (leadsState.filters.prioridade && l.prioridade !== leadsState.filters.prioridade) {
        return false;
      }
      if (leadsState.filters.temperatura && l.temperatura !== leadsState.filters.temperatura) {
        return false;
      }
      if (leadsState.filters.origem && l.origem !== leadsState.filters.origem) {
        return false;
      }
      return true;
    });

    leadsState.pagination.total = leadsState.filteredLeads.length;
    leadsState.pagination.totalPages = Math.ceil(
      leadsState.pagination.total / leadsState.pagination.perPage
    );
  }

  /* ===========================================================================
     INTERFACE - RENDERIZAÇÃO
     =========================================================================== */

  function setupInterface() {
    renderKPIs();
    renderFilters();
    setupPeriodButtons();
    renderTable();
    renderCharts();
  }

  function renderKPIs() {
    const container = document.getElementById("leads-kpis");
    if (!container) return;

    const kpis = leadsState.kpis;
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <p class="text-gray-600 text-sm font-medium mb-1">Total Leads</p>
          <h2 class="text-3xl font-bold text-gray-900">${kpis.total_leads || 0}</h2>
        </div>
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <p class="text-gray-600 text-sm font-medium mb-1">Convertidos</p>
          <h2 class="text-3xl font-bold text-green-600">${kpis.convertidos || 0}</h2>
        </div>
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <p class="text-gray-600 text-sm font-medium mb-1">Taxa Conversão</p>
          <h2 class="text-3xl font-bold text-blue-600">${kpis.conversao || 0}%</h2>
        </div>
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <p class="text-gray-600 text-sm font-medium mb-1">Pontos Gamificação</p>
          <h2 class="text-3xl font-bold text-purple-600">${leadsState.gamification.points || 0}</h2>
        </div>
      </div>
    `;
  }

  function renderFilters() {
    const container = document.getElementById("leads-filters");
    if (!container) return;

    container.innerHTML = `
      <div class="flex gap-2 flex-wrap">
        <input 
          type="text" 
          id="filter-search" 
          placeholder="🔍 Buscar por nome..." 
          class="border border-gray-300 px-3 py-2 rounded-lg flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <select id="filter-status" class="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos Status</option>
          ${LEADS_CONFIG.statusOptions.map(s =>
            `<option value="${s.value}">${s.icon} ${s.label}</option>`
          ).join("")}
        </select>
      </div>
    `;

    document.getElementById("filter-search").addEventListener("input", e => {
      leadsState.filters.search = e.target.value;
      applyFilters();
      renderTable();
      renderCharts();
    });

    document.getElementById("filter-status").addEventListener("change", e => {
      leadsState.filters.status = e.target.value;
      applyFilters();
      renderTable();
      renderCharts();
    });
  }

  function setupPeriodButtons() {
    const container = document.getElementById("period-buttons-container");
    if (!container) return;

    const buttons = container.querySelectorAll(".period-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const period = parseInt(btn.dataset.period, 10);
        leadsState.chartPeriod = period;

        buttons.forEach(b => {
          if (parseInt(b.dataset.period, 10) === period) {
            b.className = "period-btn px-3 py-1 text-xs rounded bg-blue-600 text-white font-semibold transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500";
            b.setAttribute("aria-pressed", "true");
          } else {
            b.className = "period-btn px-3 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
            b.setAttribute("aria-pressed", "false");
          }
        });

        renderCharts();
        console.log(`📊 Período alterado para ${period} dias`);
      });
    });

    console.log("✅ Botões de período configurados");
  }

  function renderTable() {
    const container = document.getElementById("leads-table");
    if (!container) return;

    const start = (leadsState.pagination.current - 1) * leadsState.pagination.perPage;
    const end = start + leadsState.pagination.perPage;
    const rows = leadsState.filteredLeads.slice(start, end);

    container.innerHTML = `
      <div class="overflow-x-auto w-full">
        <table class="w-full border-collapse min-w-[900px]">
          <thead>
            <tr class="bg-gray-100 border-b-2 border-gray-300">
              <th class="p-3 text-left font-semibold text-gray-700">Nome</th>
              <th class="p-3 text-left font-semibold text-gray-700">Email</th>
              <th class="p-3 text-left font-semibold text-gray-700">Telefone</th>
              <th class="p-3 text-left font-semibold text-gray-700">Empresa</th>
              <th class="p-3 text-left font-semibold text-gray-700">Status</th>
              <th class="p-3 text-left font-semibold text-gray-700">Origem</th>
              <th class="p-3 text-left font-semibold text-gray-700">Score IA</th>
              <th class="p-3 text-left font-semibold text-gray-700">Data</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length === 0 ? `
              <tr>
                <td colspan="8" class="p-8 text-center text-gray-500">
                  <div class="flex flex-col items-center gap-3">
                    <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="font-medium">Nenhum lead encontrado</p>
                    <p class="text-sm">Tente ajustar os filtros ou adicione um novo lead</p>
                  </div>
                </td>
              </tr>
            ` : rows.map(l => `
              <tr class="border-b hover:bg-blue-50 cursor-pointer transition-colors lead-row" data-lead-id="${l.id}">
                <td class="p-3 font-medium text-gray-900">${l.nome || "-"}</td>
                <td class="p-3 text-sm text-gray-600">${l.email || "-"}</td>
                <td class="p-3 text-sm text-gray-600">${l.telefone || "-"}</td>
                <td class="p-3 text-sm text-gray-600">${l.empresa || "-"}</td>
                <td class="p-3">
                  <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    ${l.status || "-"}
                  </span>
                </td>
                <td class="p-3 text-sm text-gray-600">${l.origem || "-"}</td>
                <td class="p-3 text-sm font-semibold text-blue-600">${l.score_ia || 0}</td>
                <td class="p-3 text-sm text-gray-600">
                  ${new Date(l.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <p class="text-sm text-gray-500 mt-3">
        Página ${leadsState.pagination.current} de ${leadsState.pagination.totalPages || 1} 
        (${leadsState.pagination.total} leads)
      </p>
    `;

    // ✅ Event listener nas linhas da tabela
    document.querySelectorAll(".lead-row").forEach(row => {
      row.addEventListener("click", () => {
        const leadId = row.dataset.leadId;
        window.openLeadModal(leadId);
      });
    });
  }

  function renderCharts() {
    const statusCanvas = document.getElementById("leads-status-chart");
    const dailyCanvas = document.getElementById("leads-daily-chart");
    if (!statusCanvas || !dailyCanvas || !window.Chart) return;

    // Gráfico de Status (Doughnut)
    if (leadsState.charts.statusChart) leadsState.charts.statusChart.destroy();
    const statusCounts = LEADS_CONFIG.statusOptions.map(s =>
      leadsState.filteredLeads.filter(l => l.status === s.value).length
    );

    leadsState.charts.statusChart = new Chart(statusCanvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: LEADS_CONFIG.statusOptions.map(s => s.label),
        datasets: [{
          data: statusCounts,
          backgroundColor: ["#3B82F6", "#F59E0B", "#8B5CF6", "#F97316", "#22C55E", "#EF4444"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: { boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    });

    // Gráfico Diário (Line)
    if (leadsState.charts.dailyChart) leadsState.charts.dailyChart.destroy();
    const days = [], counts = [];
    const period = leadsState.chartPeriod;

    const leadsByDate = {};
    leadsState.filteredLeads.forEach(lead => {
      const date = new Date(lead.created_at);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      leadsByDate[dateKey] = (leadsByDate[dateKey] || 0) + 1;
    });

    for (let i = period - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
      counts.push(leadsByDate[dateKey] || 0);
    }

    leadsState.charts.dailyChart = new Chart(dailyCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: days,
        datasets: [{
          label: "Novos Leads",
          data: counts,
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  /* ===========================================================================
     MODAL DE DETALHES DO LEAD
     =========================================================================== */

  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
      { label: 'ano', seconds: 31536000 },
      { label: 'mês', seconds: 2592000 },
      { label: 'dia', seconds: 86400 },
      { label: 'hora', seconds: 3600 },
      { label: 'minuto', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `há ${count} ${interval.label}${count > 1 ? 's' : ''}`;
      }
    }
    return 'agora';
  }

  function renderInteractionItem(interaction) {
    const typeConfig = LEADS_CONFIG.interactionTypes.find(
      t => t.value === interaction.interaction_type
    ) || { icon: "📌", label: "Outro" };

    const date = new Date(interaction.created_at);
    const timeAgo = getTimeAgo(date);

    return `
      <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start gap-3">
          <div class="text-2xl flex-shrink-0">${typeConfig.icon}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <span class="font-semibold text-gray-900">${typeConfig.label}</span>
              <span class="text-xs text-gray-500">${timeAgo}</span>
            </div>
            ${interaction.notes ? `
              <p class="text-sm text-gray-700 mb-2">${interaction.notes}</p>
            ` : ''}
            ${interaction.outcome ? `
              <div class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded inline-block">
                Resultado: ${interaction.outcome}
              </div>
            ` : ''}
            ${interaction.duration_minutes ? `
              <div class="text-xs text-gray-500 mt-1">
                Duração: ${interaction.duration_minutes} min
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  window.openLeadModal = async function(leadId) {
    const lead = leadsState.leads.find(l => l.id === leadId);
    if (!lead) {
      showError("Lead não encontrado");
      return;
    }

    let modal = document.getElementById("lead-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "lead-modal";
      modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4";
      modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
          <button id="close-lead-modal" 
                  class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors font-bold text-lg shadow-lg">
            &times;
          </button>
          <div id="lead-modal-content" class="overflow-y-auto p-6"></div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById("close-lead-modal").addEventListener("click", () => modal.remove());
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
      });
    }

    showLoading(true, "Carregando interações...");
    const interactions = await loadLeadInteractions(leadId);
    leadsState.currentLeadInteractions = interactions;
    showLoading(false);

    const statusConfig = LEADS_CONFIG.statusOptions.find(
      s => s.value === lead.status
    ) || {};

    const statusColor = {
      novo: "bg-blue-100 text-blue-800",
      contatado: "bg-yellow-100 text-yellow-800",
      qualificado: "bg-purple-100 text-purple-800",
      proposta: "bg-orange-100 text-orange-800",
      convertido: "bg-green-100 text-green-800",
      perdido: "bg-red-100 text-red-800"
    }[lead.status] || "bg-gray-100 text-gray-800";

    document.getElementById("lead-modal-content").innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div class="space-y-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-1">${lead.nome || "Sem nome"}</h2>
            <div class="flex gap-2 items-center flex-wrap">
              <span class="px-3 py-1 rounded-full text-sm font-medium ${statusColor}">
                ${statusConfig.icon || ""} ${statusConfig.label || lead.status || "Indefinido"}
              </span>
              <span class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                ${lead.origem || "Origem desconhecida"}
              </span>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 class="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              Informações de Contato
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-start">
                <span class="font-medium text-gray-600 w-24">Email:</span>
                <span class="text-gray-900">${lead.email || "-"}</span>
              </div>
              <div class="flex items-start">
                <span class="font-medium text-gray-600 w-24">Telefone:</span>
                <span class="text-gray-900">${lead.telefone || "-"}</span>
              </div>
              <div class="flex items-start">
                <span class="font-medium text-gray-600 w-24">Empresa:</span>
                <span class="text-gray-900">${lead.empresa || "-"}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4 space-y-3">
            <h3 class="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              Qualificação
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-600">Score IA:</span>
                <div class="flex items-center gap-2">
                  <span class="text-2xl font-bold text-blue-600">${lead.score_ia || 0}</span>
                  <button 
                    id="recalculate-score-btn" 
                    data-lead-id="${lead.id}"
                    class="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  >
                    🔄 Recalcular
                  </button>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all" 
                     style="width: ${lead.score_ia || 0}%"></div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="font-medium text-gray-600">Criado em:</span>
              <span class="text-gray-900">
                ${new Date(lead.created_at).toLocaleDateString("pt-BR", { 
                  day: "2-digit", month: "long", year: "numeric" 
                })}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium text-gray-600">Última atualização:</span>
              <span class="text-gray-900">
                ${lead.updated_at ? new Date(lead.updated_at).toLocaleDateString("pt-BR", { 
                  day: "2-digit", month: "long", year: "numeric" 
                }) : "-"}
              </span>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              Timeline de Interações
            </h3>
            <button 
              id="add-interaction-btn"
              data-lead-id="${leadId}"
              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors font-medium" 
            >
              + Nova Interação
            </button>
          </div>
          
          <div id="lead-timeline-container" class="space-y-3 max-h-[500px] overflow-y-auto">
            ${interactions.length === 0 ? `
              <div class="bg-gray-50 rounded-lg p-6 text-center">
                <div class="text-gray-400 text-4xl mb-2">📋</div>
                <p class="text-gray-600 font-medium mb-1">Nenhuma interação registrada</p>
                <p class="text-sm text-gray-500">
                  Clique em "Nova Interação" para adicionar a primeira.
                </p>
              </div>
            ` : interactions.map(int => renderInteractionItem(int)).join('')}
          </div>
        </div>
      </div>
      
      <div id="interaction-form-container" class="hidden mt-6 border-t pt-6"></div>
    `;

    // ✅ Event listeners do modal
    document.getElementById("recalculate-score-btn")?.addEventListener("click", function() {
      window.recalculateLeadScore(this.dataset.leadId);
    });

    document.getElementById("add-interaction-btn")?.addEventListener("click", function() {
      window.showAddInteractionForm(this.dataset.leadId);
    });

    modal.classList.remove("hidden");
    console.log(`📋 Modal aberto para lead: ${lead.nome} (${interactions.length} interações)`);
  };

  /* ===========================================================================
     FORMULÁRIO DE NOVA INTERAÇÃO
     =========================================================================== */

  window.showAddInteractionForm = function(leadId) {
    const container = document.getElementById("interaction-form-container");
    if (!container) return;

    container.classList.remove("hidden");
    container.innerHTML = `
      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-4">Adicionar Nova Interação</h4>
        <form id="new-interaction-form" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Interação
            </label>
            <select id="interaction-type" 
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              ${LEADS_CONFIG.interactionTypes.map(t =>
                `<option value="${t.value}">${t.icon} ${t.label}</option>`
              ).join('')}
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Notas *
            </label>
            <textarea 
              id="interaction-notes" 
              rows="3" 
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Descreva o que foi discutido..." 
              required
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Duração (min)
              </label>
              <input 
                type="number" 
                id="interaction-duration" 
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Ex: 30"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Resultado
              </label>
              <select id="interaction-outcome" 
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione...</option>
                <option value="positivo">Positivo</option>
                <option value="neutro">Neutro</option>
                <option value="negativo">Negativo</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Próxima Ação
            </label>
            <input 
              type="text" 
              id="interaction-next-action" 
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Ex: Enviar proposta até sexta-feira"
            >
          </div>
          
          <div class="flex gap-2 pt-2">
            <button 
              type="submit" 
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm transition-colors"
            >
              Salvar Interação
            </button>
            <button 
              type="button" 
              id="cancel-interaction-btn"
              class="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById("new-interaction-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        interaction_type: document.getElementById("interaction-type").value,
        notes: document.getElementById("interaction-notes").value,
        duration_minutes: parseInt(document.getElementById("interaction-duration").value) || null,
        outcome: document.getElementById("interaction-outcome").value || null,
        next_action: document.getElementById("interaction-next-action").value || null
      };

      try {
        showLoading(true, "Salvando interação...");
        await createInteraction(leadId, formData);
        showLoading(false);
        showSuccess("✅ Interação adicionada com sucesso!");
        window.openLeadModal(leadId);
      } catch (error) {
        showLoading(false);
        showError(`❌ Erro ao salvar: ${error.message}`);
        console.error(error);
      }
    });

    document.getElementById("cancel-interaction-btn").addEventListener("click", () => {
      container.classList.add("hidden");
    });

    container.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  window.cancelAddInteraction = function() {
    const container = document.getElementById("interaction-form-container");
    if (container) container.classList.add("hidden");
  };

  /* ===========================================================================
     RECÁLCULO DE SCORE COM IA - ✅ CORRIGIDO
     =========================================================================== */
  // Função auxiliar para pegar a chave de forma segura
  async function getAnonKeyFromEnv() {
    try {
      // Tenta pegar de variável de ambiente ou configuração
      const response = await fetch('/api/config');
      if (response.ok) {
        const config = await response.json();
        return config.supabaseAnonKey;
      }
      return null;
    } catch (error) {
      console.warn("⚠️ Não foi possível carregar config de API");
      return null;
    }
  }

  window.recalculateLeadScore = async function(leadId) {
    try {
      showLoading(true, "🤖 Recalculando score...");

      const session = await getCurrentSession();
      if (!session || !session.access_token) {
        throw new Error("Sessão inválida");
      }

      // ✅ Tentar pegar configurações de múltiplas fontes
      let supabaseUrl, supabaseAnonKey;

      if (window.AlshamSupabase?.supabase) {
        supabaseUrl = window.AlshamSupabase.supabase.supabaseUrl;
        supabaseAnonKey = window.AlshamSupabase.supabase.supabaseAnonKey;
      } else if (window.AlshamSupabase?.client) {
        // Fallback: pegar do cliente Supabase diretamente
        supabaseUrl = window.AlshamSupabase.client.supabaseUrl;
        supabaseAnonKey = window.AlshamSupabase.client.supabaseKey;
      }

      // ✅ Fallback final para a chave anônima
      if (!supabaseAnonKey) {
        console.warn("⚠️ Usando fallback para buscar a chave anônima.");
        supabaseAnonKey = await getAnonKeyFromEnv();
      }

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("❌ Configurações do Supabase não disponíveis");
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/calculate-lead-score`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey
          },
          body: JSON.stringify({ leadId })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        showSuccess(`✅ Score atualizado: ${result.score}`);
        await loadSystemData();
        renderTable();
        window.openLeadModal(leadId);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      showError(`❌ Erro ao calcular score: ${error.message}`);
      console.error('❌ Erro completo:', error);
    } finally {
      showLoading(false);
    }
  };

  /* ===========================================================================
     REALTIME E ATUALIZAÇÃO AUTOMÁTICA
     =========================================================================== */

  function setupRealtime() {
    if (!LEADS_CONFIG.realtime.enabled || !subscribeToTable) return;

    const subscription = subscribeToTable("leads_crm", leadsState.orgId, () => {
      console.log("🔄 Atualização realtime recebida");
      loadSystemData().then(setupInterface);
    });

    window.addEventListener("beforeunload", () => subscription?.unsubscribe?.());
  }

  /* ===========================================================================
     MENU MOBILE E INTERAÇÕES UI
     =========================================================================== */

  function setupUIEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sideNav = document.getElementById('side-nav');

    if (mobileMenuToggle && sideNav) {
      mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sideNav.classList.toggle('open');
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (sideNav && mobileMenuToggle &&
        !sideNav.contains(e.target) &&
        !mobileMenuToggle.contains(e.target) &&
        sideNav.classList.contains('open')) {
        sideNav.classList.remove('open');
      }
    });

    // Botão "Novo Lead"
    const newLeadBtn = document.getElementById('new-lead-btn');
    if (newLeadBtn) {
      newLeadBtn.addEventListener('click', () => {
        showNotification("🚧 Funcionalidade em desenvolvimento", "info");
        // TODO: Implementar modal de criação de lead
      });
    }

    // Botões de notificação e usuário
    const notificationsBtn = document.getElementById('notifications-btn');
    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', () => {
        showNotification("📬 Nenhuma notificação nova", "info");
      });
    }

    const userMenuBtn = document.getElementById('user-menu-btn');
    if (userMenuBtn) {
      userMenuBtn.addEventListener('click', () => {
        showNotification("👤 Menu de usuário em desenvolvimento", "info");
      });
    }

    console.log("✅ Event listeners de UI configurados");
  }

  /* ===========================================================================
     API PÚBLICA DO SISTEMA
     =========================================================================== */

  window.LeadsSystem = {
    init: () => loadSystemData().then(setupInterface),
    refresh: () => loadSystemData().then(setupInterface),
    state: leadsState,
    config: LEADS_CONFIG,
    version: "5.9.0"
  };

  console.log("✅ 📋 Leads-Real.js v5.9.0 CORRIGIDO - Carregado e pronto!");
});
