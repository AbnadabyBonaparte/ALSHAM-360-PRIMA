/**
 * ALSHAM 360° PRIMA - LEADS REAIS V5.8.3
 * Sistema completo de gerenciamento de leads com IA e gamificação
 * ✅ CORRIGIDO: URL da Edge Function + apikey + Event listeners CSP
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
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-red-600 shadow-lg";
  div.textContent = m;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showSuccess(m) {
  const div = document.createElement("div");
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-green-600 shadow-lg";
  div.textContent = m;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
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

waitForSupabase(() => {
  const { getCurrentSession, getCurrentOrgId, genericSelect, genericInsert, subscribeToTable } = window.AlshamSupabase;

  const LEADS_CONFIG = {
    statusOptions: [
      { value: "novo", label: "Novo", color: "blue", icon: "🆕", points: 5 },
      { value: "contatado", label: "Contatado", color: "yellow", icon: "📞", points: 10 },
      { value: "qualificado", label: "Qualificado", color: "purple", icon: "✅", points: 20 },
      { value: "proposta", label: "Proposta", color: "orange", icon: "📋", points: 30 },
      { value: "convertido", label: "Convertido", color: "green", icon: "💰", points: 50 },
      { value: "perdido", label: "Perdido", color: "red", icon: "❌", points: 0 }
    ],
    interactionTypes: [
      { value: "email", label: "Email", icon: "📧" },
      { value: "ligacao", label: "Ligação", icon: "📞" },
      { value: "reuniao", label: "Reunião", icon: "🤝" },
      { value: "nota", label: "Nota", icon: "📝" },
      { value: "whatsapp", label: "WhatsApp", icon: "💬" }
    ]
  };

  const leadsState = {
    user: null,
    orgId: null,
    leads: [],
    filteredLeads: [],
    kpis: {},
    gamification: {},
    filters: { search: "", status: "" },
    pagination: { current: 1, perPage: 25, total: 0, totalPages: 0 },
    charts: {},
    chartPeriod: 7
  };

  async function authenticateUser() {
    try {
      const session = await getCurrentSession();
      if (!session?.user) return { success: false };
      return { success: true, user: session.user, orgId: await getCurrentOrgId() };
    } catch {
      return { success: false };
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      showLoading(true);
      const authResult = await authenticateUser();
      if (!authResult.success) {
        window.location.href = "/login.html";
        return;
      }
      leadsState.user = authResult.user;
      leadsState.orgId = authResult.orgId;
      await loadSystemData();
      setupInterface();
      showLoading(false);
      showSuccess("Leads carregados!");
    } catch (e) {
      console.error(e);
      showLoading(false);
      showError("Erro ao carregar");
    }
  });

  async function loadSystemData() {
    const [leads, kpis, gamification] = await Promise.allSettled([
      genericSelect("leads_crm", { org_id: leadsState.orgId }, { order: { column: "created_at", ascending: false } }),
      genericSelect("dashboard_kpis", { org_id: leadsState.orgId }),
      genericSelect("gamification_points", { user_id: leadsState.user.id, org_id: leadsState.orgId })
    ]);
    if (leads.status === "fulfilled") leadsState.leads = leads.value.data || [];
    if (kpis.status === "fulfilled") leadsState.kpis = kpis.value.data?.[0] || {};
    if (gamification.status === "fulfilled") {
      const points = gamification.value.data || [];
      leadsState.gamification = { points: points.reduce((s, p) => s + (p.points_awarded || 0), 0) };
    }
    applyFilters();
  }

  function applyFilters() {
    leadsState.filteredLeads = leadsState.leads.filter(l => {
      if (leadsState.filters.search && !l.nome?.toLowerCase().includes(leadsState.filters.search.toLowerCase())) return false;
      if (leadsState.filters.status && l.status !== leadsState.filters.status) return false;
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
        <input type="text" id="filter-search" placeholder="Buscar..." class="border p-2 rounded flex-1">
        <select id="filter-status" class="border p-2 rounded">
          <option value="">Todos</option>
          ${LEADS_CONFIG.statusOptions.map(s => `<option value="${s.value}">${s.icon} ${s.label}</option>`).join("")}
        </select>
      </div>
    `;
    document.getElementById("filter-search").addEventListener("input", e => {
      leadsState.filters.search = e.target.value;
      applyFilters();
      renderTable();
    });
    document.getElementById("filter-status").addEventListener("change", e => {
      leadsState.filters.status = e.target.value;
      applyFilters();
      renderTable();
    });
  }

  function renderTable() {
    const container = document.getElementById("leads-table");
    if (!container) return;
    const start = (leadsState.pagination.current - 1) * leadsState.pagination.perPage;
    const rows = leadsState.filteredLeads.slice(start, start + leadsState.pagination.perPage);
    container.innerHTML = `
      <table class="w-full">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-3 text-left">Nome</th>
            <th class="p-3 text-left">Email</th>
            <th class="p-3 text-left">Empresa</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-left">Score IA</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(l => `
            <tr class="border-b hover:bg-blue-50 cursor-pointer" data-lead-id="${l.id}">
              <td class="p-3">${l.nome || "-"}</td>
              <td class="p-3 text-sm">${l.email || "-"}</td>
              <td class="p-3 text-sm">${l.empresa || "-"}</td>
              <td class="p-3"><span class="px-2 py-1 rounded text-xs bg-blue-100">${l.status || "-"}</span></td>
              <td class="p-3 font-bold">${l.score_ia || 0}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    container.querySelectorAll('tr[data-lead-id]').forEach(row => {
      row.addEventListener('click', () => window.openLeadModal(row.getAttribute('data-lead-id')));
    });
  }

  function renderCharts() {
    const statusCanvas = document.getElementById("leads-status-chart");
    const dailyCanvas = document.getElementById("leads-daily-chart");
    if (!statusCanvas || !dailyCanvas || !window.Chart) return;
    if (leadsState.charts.statusChart) leadsState.charts.statusChart.destroy();
    const statusCounts = LEADS_CONFIG.statusOptions.map(s => leadsState.filteredLeads.filter(l => l.status === s.value).length);
    leadsState.charts.statusChart = new Chart(statusCanvas.getContext("2d"), {
      type: "doughnut",
      data: { labels: LEADS_CONFIG.statusOptions.map(s => s.label), datasets: [{ data: statusCounts, backgroundColor: ["#3B82F6", "#F59E0B", "#8B5CF6", "#F97316", "#22C55E", "#EF4444"] }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
    if (leadsState.charts.dailyChart) leadsState.charts.dailyChart.destroy();
    const days = [], counts = [];
    const leadsByDate = {};
    leadsState.filteredLeads.forEach(lead => {
      const dateKey = new Date(lead.created_at).toISOString().split('T')[0];
      leadsByDate[dateKey] = (leadsByDate[dateKey] || 0) + 1;
    });
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      days.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
      counts.push(leadsByDate[dateKey] || 0);
    }
    leadsState.charts.dailyChart = new Chart(dailyCanvas.getContext("2d"), {
      type: "line",
      data: { labels: days, datasets: [{ label: "Leads", data: counts, borderColor: "#3B82F6", backgroundColor: "rgba(59, 130, 246, 0.1)", fill: true }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  window.openLeadModal = async function(leadId) {
    const lead = leadsState.leads.find(l => l.id === leadId);
    if (!lead) return showError("Lead não encontrado");
    let modal = document.getElementById("lead-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "lead-modal";
      modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4";
      modal.innerHTML = `
        <div class="bg-white rounded-lg w-full max-w-2xl p-6 relative">
          <button id="close-lead-modal" class="absolute top-4 right-4 text-2xl">&times;</button>
          <div id="lead-modal-content"></div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById("close-lead-modal").onclick = () => modal.remove();
    }
    showLoading(true);
    const interactions = await genericSelect("lead_interactions", { lead_id: leadId }, { order: { column: "created_at", ascending: false } });
    showLoading(false);
    document.getElementById("lead-modal-content").innerHTML = `
      <h2 class="text-2xl font-bold mb-4">${lead.nome}</h2>
      <p><b>Email:</b> ${lead.email || "-"}</p>
      <p><b>Empresa:</b> ${lead.empresa || "-"}</p>
      <p><b>Status:</b> ${lead.status || "-"}</p>
      <div class="mt-4">
        <p><b>Score IA:</b> <span class="text-2xl font-bold">${lead.score_ia || 0}</span></p>
        <button data-recalc="${leadId}" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Recalcular Score</button>
      </div>
      <h3 class="mt-6 font-bold">Interações (${interactions.data?.length || 0})</h3>
    `;
    const btn = modal.querySelector('[data-recalc]');
    if (btn) {
      btn.addEventListener('click', () => window.recalculateLeadScore(btn.dataset.recalc));
    }
    modal.classList.remove("hidden");
  };

  window.recalculateLeadScore = async function(leadId) {
    try {
      showLoading(true);
      const session = await getCurrentSession();
      const response = await fetch('https://rgvnbtuqtxvfxhrdnkjg.supabase.co/functions/v1/calculate-lead-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4OTU2ODQsImV4cCI6MjA0MzQ3MTY4NH0.sb_publishable_4GXjFzIqbEtaLwAu-ZNFA_BxkNHSIGp'
        },
        body: JSON.stringify({ leadId })
      });
      const result = await response.json();
      if (result.success) {
        showSuccess(`Score: ${result.score}`);
        await loadSystemData();
        renderTable();
        window.openLeadModal(leadId);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showError(`Erro: ${error.message}`);
    } finally {
      showLoading(false);
    }
  };

  window.LeadsSystem = {
    refresh: () => loadSystemData().then(setupInterface),
    state: leadsState
  };

  console.log("Leads v5.8.3");
});
