/**
 * ALSHAM 360° PRIMA - LEADS REAIS V5.5.0
 * CORRIGIDO: Modal de lead expandido (responsivo e maior)
 * PREPARADO: Estrutura para integração com timeline real
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
    charts: {},
    chartPeriod: 7
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
      if (leadsState.filters.search && !l.nome?.toLowerCase().includes(leadsState.filters.search.toLowerCase())) return false;
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
        <div class="bg-white p-4 rounded shadow"><p class="text-gray-600 text-sm">Total Leads</p><h2 class="text-2xl font-bold">${kpis.total_leads || 0}</h2></div>
        <div class="bg-white p-4 rounded shadow"><p class="text-gray-600 text-sm">Convertidos</p><h2 class="text-2xl font-bold">${kpis.convertidos || 0}</h2></div>
        <div class="bg-white p-4 rounded shadow"><p class="text-gray-600 text-sm">Taxa Conversão</p><h2 class="text-2xl font-bold">${kpis.conversao || 0}%</h2></div>
        <div class="bg-white p-4 rounded shadow"><p class="text-gray-600 text-sm">Pontos Gamificação</p><h2 class="text-2xl font-bold">${leadsState.gamification.points || 0}</h2></div>
      </div>
    `;
  }

  function renderFilters() {
    const container = document.getElementById("leads-filters");
    if (!container) return;
    container.innerHTML = `
      <div class="flex gap-2">
        <input type="text" id="filter-search" placeholder="🔍 Buscar por nome..." class="border p-2 rounded flex-1">
        <select id="filter-status" class="border p-2 rounded">
          <option value="">Todos Status</option>
          ${LEADS_CONFIG.statusOptions.map(s => `<option value="${s.value}">${s.icon} ${s.label}</option>`).join("")}
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
            b.className = "period-btn px-2 py-1 text-xs rounded bg-blue-600 text-white font-semibold";
          } else {
            b.className = "period-btn px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200";
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
              <th class="p-3 text-left font-semibold">Nome</th>
              <th class="p-3 text-left font-semibold">Email</th>
              <th class="p-3 text-left font-semibold">Telefone</th>
              <th class="p-3 text-left font-semibold">Empresa</th>
              <th class="p-3 text-left font-semibold">Status</th>
              <th class="p-3 text-left font-semibold">Origem</th>
              <th class="p-3 text-left font-semibold">Score IA</th>
              <th class="p-3 text-left font-semibold">Data</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(l => `
              <tr class="border-b hover:bg-blue-50 cursor-pointer transition-colors" onclick="window.openLeadModal('${l.id}')">
                <td class="p-3 font-medium">${l.nome || "-"}</td>
                <td class="p-3 text-sm text-gray-600">${l.email || "-"}</td>
                <td class="p-3 text-sm text-gray-600">${l.telefone || "-"}</td>
                <td class="p-3 text-sm text-gray-600">${l.empresa || "-"}</td>
                <td class="p-3"><span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">${l.status || "-"}</span></td>
                <td class="p-3 text-sm">${l.origem || "-"}</td>
                <td class="p-3 text-sm font-semibold">${l.score_ia || 0}</td>
                <td class="p-3 text-sm text-gray-600">${new Date(l.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <p class="text-sm text-gray-500 mt-3">Página ${leadsState.pagination.current} de ${leadsState.pagination.totalPages} (${leadsState.pagination.total} leads)</p>
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

  // ✅ MODAL EXPANDIDO E MELHORADO
  window.openLeadModal = function(leadId) {
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
          <button id="close-lead-modal" class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors font-bold text-lg">&times;</button>
          <div id="lead-modal-content" class="overflow-y-auto p-6"></div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById("close-lead-modal").onclick = () => modal.remove();
      
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
      });
    }
    
    const statusConfig = LEADS_CONFIG.statusOptions.find(s => s.value === lead.status) || {};
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
        
        <!-- COLUNA ESQUERDA: Informações do Lead -->
        <div class="space-y-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-1">${lead.nome || "Sem nome"}</h2>
            <div class="flex gap-2 items-center">
              <span class="px-3 py-1 rounded-full text-sm font-medium ${statusColor}">
                ${statusConfig.icon || ""} ${statusConfig.label || lead.status || "Indefinido"}
              </span>
              <span class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                ${lead.origem || "Origem desconhecida"}
              </span>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 class="font-semibold text-gray-700 text-sm uppercase tracking-wide">Informações de Contato</h3>
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
            <h3 class="font-semibold text-gray-700 text-sm uppercase tracking-wide">Qualificação</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-600">Score IA:</span>
                <span class="text-2xl font-bold text-blue-600">${lead.score_ia || 0}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${lead.score_ia || 0}%"></div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="font-medium text-gray-600">Criado em:</span>
              <span class="text-gray-900">${new Date(lead.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium text-gray-600">Última atualização:</span>
              <span class="text-gray-900">${lead.updated_at ? new Date(lead.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</span>
            </div>
          </div>
        </div>
        
        <!-- COLUNA DIREITA: Timeline (Preparado para próxima feature) -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-gray-700 text-sm uppercase tracking-wide">Timeline de Interações</h3>
            <button class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors font-medium" onclick="alert('Feature em desenvolvimento: Adicionar Interação')">
              + Nova Interação
            </button>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-6 text-center">
            <div class="text-gray-400 text-4xl mb-2">📋</div>
            <p class="text-gray-600 font-medium mb-1">Timeline em Desenvolvimento</p>
            <p class="text-sm text-gray-500">Em breve você poderá visualizar e adicionar interações com este lead diretamente aqui.</p>
          </div>
          
          <!-- Placeholder para timeline real -->
          <div id="lead-timeline-container" class="hidden space-y-3"></div>
        </div>
      </div>
    `;
    
    modal.classList.remove("hidden");
    console.log(`📋 Modal aberto para lead: ${lead.nome} (ID: ${leadId})`);
  };

  window.LeadsSystem = {
    init: () => loadSystemData().then(setupInterface),
    refresh: () => loadSystemData().then(setupInterface),
    state: leadsState
  };

  console.log("📋 Leads-Real.js v5.5.0 carregado e pronto");
});
