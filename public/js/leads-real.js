/**
 * ALSHAM 360° PRIMA - LEADS REAIS V5.2
 * ADICIONADO: Click handler para abrir modal de lead
 */

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
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-red-600";
  div.textContent = m;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showSuccess(m) {
  const div = document.createElement("div");
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-green-600";
  div.textContent = m;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showNotification(m, t = "info") {
  const colors = { success: "bg-green-600", error: "bg-red-600", warning: "bg-yellow-600", info: "bg-blue-600" };
  const div = document.createElement("div");
  div.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded text-white ${colors[t]}`;
  div.textContent = m;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

waitForSupabase(() => {
  const {
    getCurrentSession,
    getCurrentOrgId,
    genericSelect,
    subscribeToTable
  } = window.AlshamSupabase;

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
    pagination: { defaultPerPage: 25, options: [10, 25, 50, 100] },
    realtime: { enabled: true, refreshInterval: 30000 }
  };

  const leadsState = {
    user: null,
    orgId: null,
    leads: [],
    filteredLeads: [],
    kpis: {},
    gamification: {},
    automations: {},
    filters: {
      search: "", status: "", prioridade: "", temperatura: "",
      origem: "", dateRange: "", scoreRange: [0, 100]
    },
    pagination: { current: 1, perPage: LEADS_CONFIG.pagination.defaultPerPage, total: 0, totalPages: 0 },
    sorting: { field: "created_at", direction: "desc" },
    isLoading: false,
    lastUpdate: null,
    charts: {}
  };

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

      showLoading(false);
      showSuccess("🎉 Leads carregados com sucesso!");
    } catch (e) {
      console.error("❌ Erro crítico:", e);
      showLoading(false);
      showError("Falha ao carregar sistema de Leads");
    }
  });

  async function authenticateUser() {
    try {
      if (window.AlshamAuth?.isAuthenticated) {
        return { success: true, user: window.AlshamAuth.currentUser, orgId: await getCurrentOrgId() };
      }
      const session = await getCurrentSession();
      if (!session?.user) return { success: false };
      return { success: true, user: session.user, orgId: await getCurrentOrgId() };
    } catch {
      return { success: false };
    }
  }

  function redirectToLogin() {
    window.location.href = "/login.html";
  }

  async function loadSystemData() {
    leadsState.isLoading = true;
    try {
      const [leads, kpis, gamification, automations] = await Promise.allSettled([
        loadLeads(), loadKPIs(), loadGamification(), loadAutomations()
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
    const { data, error } = await genericSelect("leads_crm", { org_id: leadsState.orgId }, {
      order: { column: "created_at", ascending: false }
    });
    if (error) throw error;
    return data || [];
  }

  async function loadKPIs() {
    const { data } = await genericSelect("dashboard_kpis", { org_id: leadsState.orgId });
    return data?.[0] || {};
  }

  async function loadGamification() {
    const { data: points } = await genericSelect("gamification_points", {
      user_id: leadsState.user.id, org_id: leadsState.orgId
    });
    return { points: points?.reduce((s, p) => s + (p.points_awarded || 0), 0) || 0 };
  }

  async function loadAutomations() {
    const { data } = await genericSelect("automation_rules", {
      org_id: leadsState.orgId, is_active: true
    });
    return { active: data || [] };
  }

  function applyFilters() {
    leadsState.filteredLeads = leadsState.leads.filter(l => {
      if (leadsState.filters.search && !l.name?.toLowerCase().includes(leadsState.filters.search.toLowerCase())) return false;
      if (leadsState.filters.status && l.status !== leadsState.filters.status) return false;
      if (leadsState.filters.prioridade && l.prioridade !== leadsState.filters.prioridade) return false;
      if (leadsState.filters.temperatura && l.temperatura !== leadsState.filters.temperatura) return false;
      if (leadsState.filters.origem && l.origem !== leadsState.filters.origem) return false;
      return true;
    });

    leadsState.pagination.total = leadsState.filteredLeads.length;
    leadsState.pagination.totalPages = Math.ceil(leadsState.pagination.total / leadsState.pagination.perPage);
  }

  function setupInterface() {
    renderKPIs();
    renderFilters();
    renderTable();
    renderCharts();
  }

  function renderKPIs() {
    const container = document.getElementById("leads-kpis");
    if (!container) return;
    const kpis = leadsState.kpis;
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded shadow"><p>Total Leads</p><h2 class="text-xl font-bold">${kpis.total_leads || 0}</h2></div>
        <div class="bg-white p-4 rounded shadow"><p>Convertidos</p><h2 class="text-xl font-bold">${kpis.convertidos || 0}</h2></div>
        <div class="bg-white p-4 rounded shadow"><p>Taxa Conversão</p><h2 class="text-xl font-bold">${kpis.conversao || 0}%</h2></div>
        <div class="bg-white p-4 rounded shadow"><p>Pontos Gamificação</p><h2 class="text-xl font-bold">${leadsState.gamification.points || 0}</h2></div>
      </div>
    `;
  }

  function renderFilters() {
    const container = document.getElementById("leads-filters");
    if (!container) return;
    container.innerHTML = `
      <input type="text" id="filter-search" placeholder="🔍 Buscar..." class="border p-2 rounded w-full mb-2">
      <select id="filter-status" class="border p-2 rounded w-full mb-2">
        <option value="">Todos Status</option>
        ${LEADS_CONFIG.statusOptions.map(s => `<option value="${s.value}">${s.icon} ${s.label}</option>`).join("")}
      </select>
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

  function renderTable() {
    const container = document.getElementById("leads-table");
    if (!container) return;
    const start = (leadsState.pagination.current - 1) * leadsState.pagination.perPage;
    const end = start + leadsState.pagination.perPage;
    const rows = leadsState.filteredLeads.slice(start, end);
    container.innerHTML = `
      <table class="w-full border">
        <thead><tr class="bg-gray-100">
          <th class="p-2 text-left">Nome</th>
          <th class="p-2 text-left">Status</th>
          <th class="p-2 text-left">Prioridade</th>
          <th class="p-2 text-left">Origem</th>
          <th class="p-2 text-left">Data</th>
        </tr></thead>
        <tbody>
          ${rows.map(l => `
            <tr class="border-b hover:bg-blue-50 cursor-pointer transition-colors" data-lead-id="${l.id}" onclick="window.openLeadModal('${l.id}')">
              <td class="p-2">${l.name || "-"}</td>
              <td class="p-2"><span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">${l.status || "-"}</span></td>
              <td class="p-2">${l.prioridade || "-"}</td>
              <td class="p-2">${l.origem || "-"}</td>
              <td class="p-2">${new Date(l.created_at).toLocaleDateString("pt-BR")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <p class="text-sm text-gray-500 mt-2">Página ${leadsState.pagination.current} de ${leadsState.pagination.totalPages} (${leadsState.pagination.total} leads)</p>
    `;
  }

  function renderCharts() {
    const statusCanvas = document.getElementById("leads-status-chart");
    const dailyCanvas = document.getElementById("leads-daily-chart");
    if (!statusCanvas || !dailyCanvas || !window.Chart) return;

    if (leadsState.charts.statusChart) leadsState.charts.statusChart.destroy();
    const statusCounts = LEADS_CONFIG.statusOptions.map(s => leadsState.filteredLeads.filter(l => l.status === s.value).length);
    leadsState.charts.statusChart = new Chart(statusCanvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: LEADS_CONFIG.statusOptions.map(s => s.label),
        datasets: [{ data: statusCounts, backgroundColor: ["#3B82F6", "#F59E0B", "#8B5CF6", "#F97316", "#22C55E", "#EF4444"] }]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });

    if (leadsState.charts.dailyChart) leadsState.charts.dailyChart.destroy();
    const days = [], counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
      counts.push(leadsState.filteredLeads.filter(l => l.created_at?.startsWith(d.toISOString().split("T")[0])).length);
    }
    leadsState.charts.dailyChart = new Chart(dailyCanvas.getContext("2d"), {
      type: "line",
      data: { labels: days, datasets: [{ label: "Novos Leads", data: counts, borderColor: "#3B82F6", fill: true }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  function setupRealtime() {
    if (!LEADS_CONFIG.realtime.enabled || !subscribeToTable) return;
    const subscription = subscribeToTable("leads_crm", leadsState.orgId, () => {
      console.log("🔄 Atualização realtime recebida");
      loadSystemData().then(setupInterface);
    });
    window.addEventListener("beforeunload", () => subscription?.unsubscribe?.());
  }

  function showLoading(show, msg = "Carregando...") {
    let el = document.getElementById("leads-loading");
    if (show) {
      if (el) {
        el.classList.remove("hidden");
      } else {
        el = document.createElement("div");
        el.id = "leads-loading";
        el.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
        el.innerHTML = `
          <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span class="text-gray-700">${msg}</span>
          </div>`;
        document.body.appendChild(el);
      }
    } else {
      if (el) el.classList.add("hidden");
    }
  }

  // NOVO: Função para abrir modal do lead
  window.openLeadModal = function(leadId) {
    const lead = leadsState.leads.find(l => l.id === leadId);
    if (!lead) {
      showError("Lead não encontrado");
      return;
    }
    
    alert(`Modal do lead: ${lead.name || "Sem nome"}\n\nEm desenvolvimento: Timeline de Interações`);
    console.log("Lead selecionado:", lead);
  };

  window.LeadsSystem = {
    init: () => loadSystemData().then(setupInterface),
    refresh: () => loadSystemData().then(setupInterface),
    state: leadsState
  };

  console.log("📋 Leads-Real.js v5.2 carregado e pronto");
});
