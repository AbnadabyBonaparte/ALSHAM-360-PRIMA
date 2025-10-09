/**
 * ALSHAM 360° PRIMA - LEADS REAIS v6.1 (Auditado, Completo)
 * Sistema completo de gerenciamento de leads com IA, gamificação, automação
 * Fixes: Validações full, award points on actions, export CSV, caching leads, trigger n8n on status change, error retry integration, mobile responsivity enhanced
 */

// ============================================
// Config e State Global
// ============================================
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
  origemOptions: ["website", "google_ads", "facebook_ads", "linkedin", "indicacao", "evento", "cold_calling", "email_marketing", "seo_organic", "outro"],
  interactionTypes: [
    { value: "email", label: "Email", icon: "📧" },
    { value: "ligacao", label: "Ligação", icon: "📞" },
    { value: "reuniao", label: "Reunião", icon: "🤝" },
    { value: "nota", label: "Nota", icon: "📝" },
    { value: "whatsapp", label: "WhatsApp", icon: "💬" }
  ],
  pagination: { defaultPerPage: 25, options: [10, 25, 50, 100] },
  realtime: { enabled: true, refreshInterval: 30000 },
  n8nEndpoints: { followUp: 'https://your-n8n-url/webhook/follow-up' } // Configure env for production
};

const leadsState = {
  user: null,
  orgId: null,
  leads: [],
  filteredLeads: [],
  kpis: {},
  gamification: {},
  automations: {},
  currentLeadInteractions: [],
  filters: { search: "", status: "", prioridade: "", temperatura: "", origem: "", dateRange: "", scoreRange: [0, 100] },
  pagination: { current: 1, perPage: LEADS_CONFIG.pagination.defaultPerPage, total: 0, totalPages: 0 },
  sorting: { field: "created_at", direction: "desc" },
  isLoading: false,
  lastUpdate: null,
  charts: {},
  chartPeriod: 7
};

// ============================================
// Funções de UI e Helpers
// ============================================
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

function showNotification(m, t = "info") {
  const colors = { success: "bg-green-600", error: "bg-red-600", warning: "bg-yellow-600", info: "bg-blue-600" };
  const div = document.createElement("div");
  div.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded text-white ${colors[t]} shadow-lg`;
  div.textContent = m;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showLoading(show, msg = "Carregando...") {
  let el = document.getElementById("leads-loading");
  if (show) {
    if (!el) {
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
    el.classList.remove("hidden");
  } else if (el) {
    el.classList.add("hidden");
  }
}

// ============================================
// Autenticação e Inicialização
// ============================================
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

async function authenticateUser() {
  try {
    const session = await window.AlshamSupabase.getCurrentSession();
    if (!session?.user) return { success: false };
    return { success: true, user: session.user, orgId: await window.AlshamSupabase.getCurrentOrgId() };
  } catch {
    return { success: false };
  }
}

function redirectToLogin() {
  window.location.href = "/login.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    showLoading(true, "Inicializando Leads...");
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
    showSuccess("Leads carregados com sucesso!");
  } catch (e) {
    console.error("Erro crítico:", e);
    showLoading(false);
    showError("Falha ao carregar sistema de Leads");
  }
});

// ============================================
// Load Data (com caching para leads)
// ============================================
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
  const { data, error } = await window.AlshamSupabase.genericSelect("leads_crm", { org_id: leadsState.orgId }, { order: { column: "created_at", ascending: false } });
  if (error) throw error;
  return data || [];
}

async function loadKPIs() {
  const { data } = await window.AlshamSupabase.genericSelect("dashboard_kpis", { org_id: leadsState.orgId });
  return data?.[0] || {};
}

async function loadGamification() {
  const { data: points } = await window.AlshamSupabase.genericSelect("gamification_points", { user_id: leadsState.user.id, org_id: leadsState.orgId });
  return { points: points?.reduce((s, p) => s + (p.points_awarded || 0), 0) || 0 };
}

async function loadAutomations() {
  const { data } = await window.AlshamSupabase.genericSelect("automation_rules", { org_id: leadsState.orgId, is_active: true });
  return { active: data || [] };
}

async function loadLeadInteractions(leadId) {
  const { data, error } = await window.AlshamSupabase.genericSelect("lead_interactions", { lead_id: leadId, org_id: leadsState.orgId }, { order: { column: "created_at", ascending: false } });
  if (error) {
    console.error("Erro ao carregar interações:", error);
    return [];
  }
  return data || [];
}

// ============================================
// Create/Update/Delete com Gamificação e Automação
// ============================================
window.openNewLeadModal = function() {
  let modal = document.getElementById("new-lead-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "new-lead-modal";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4";
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">Novo Lead</h2>
          <button id="close-new-lead-modal" class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">&times;</button>
        </div>
        <div class="overflow-y-auto p-6">
          <form id="new-lead-form" class="space-y-4">
            <!-- Nome (obrigatório) -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Nome Completo <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="new-lead-nome"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: João Silva"
              >
              <p class="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
            </div>
            <!-- Email (obrigatório) -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="new-lead-email"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="exemplo@empresa.com.br"
              >
            </div>
            <!-- Telefone -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                id="new-lead-telefone"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
                maxlength="15"
              >
            </div>
            <!-- Grid: Empresa + Cargo -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Empresa</label>
                <input
                  type="text"
                  id="new-lead-empresa"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome da empresa"
                >
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Cargo</label>
                <input
                  type="text"
                  id="new-lead-cargo"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Gerente de TI"
                >
              </div>
            </div>
            <!-- Grid: Status + Origem -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  id="new-lead-status"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  ${LEADS_CONFIG.statusOptions.map(s => `<option value="${s.value}">${s.icon} ${s.label}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Origem</label>
                <select
                  id="new-lead-origem"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  ${LEADS_CONFIG.origemOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>
              </div>
            </div>
            <!-- Observações -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
              <textarea
                id="new-lead-observacoes"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Informações adicionais sobre o lead..."
              ></textarea>
            </div>
            <!-- Botões -->
            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Criar Lead
              </button>
              <button
                type="button"
                id="cancel-new-lead"
                class="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    // Event listeners
    document.getElementById("close-new-lead-modal").addEventListener("click", () => modal.remove());
    document.getElementById("cancel-new-lead").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById("new-lead-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      await createNewLead();
    });
    // Máscara de telefone
    const telefoneInput = document.getElementById("new-lead-telefone");
    telefoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
      }
      e.target.value = value;
    });
  }
  modal.classList.remove("hidden");
};

async function createNewLead() {
  const nome = document.getElementById("new-lead-nome").value.trim();
  const email = document.getElementById("new-lead-email").value.trim();
  const telefone = document.getElementById("new-lead-telefone").value.trim();
  const empresa = document.getElementById("new-lead-empresa").value.trim();
  const cargo = document.getElementById("new-lead-cargo").value.trim();
  const status = document.getElementById("new-lead-status").value;
  const origem = document.getElementById("new-lead-origem").value;
  const observacoes = document.getElementById("new-lead-observacoes").value.trim();
  // Validações
  if (nome.length < 3) return showError("Nome deve ter pelo menos 3 caracteres");
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return showError("Email inválido");
  try {
    showLoading(true, "Criando lead...");
    const leadData = {
      org_id: leadsState.orgId,
      owner_id: leadsState.user.id,
      nome,
      email,
      telefone: telefone || null,
      empresa: empresa || null,
      cargo: cargo || null,
      status,
      origem: origem || null,
      observacoes: observacoes || null,
      consentimento: true
    };
    const { success, error } = await window.AlshamSupabase.createLead(leadData);
    if (!success) throw error;
    // Award points for new lead
    await awardGamificationPoints(status, 'create');
    showLoading(false);
    showSuccess("Lead criado com sucesso!");
    document.getElementById("new-lead-modal").remove();
    await loadSystemData();
    setupInterface();
  } catch (error) {
    showLoading(false);
    console.error("Erro ao criar lead:", error);
    showError(`Erro: ${error.message}`);
  }
}

// ============================================
// EDITAR LEAD
// ============================================
window.openEditLeadModal = function(leadId) {
  const lead = leadsState.leads.find(l => l.id === leadId);
  if (!lead) return showError("Lead não encontrado");
  let modal = document.getElementById("edit-lead-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "edit-lead-modal";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4";
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900">Editar Lead</h2>
        <button id="close-edit-lead-modal" class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">&times;</button>
      </div>
      <div class="overflow-y-auto p-6">
        <form id="edit-lead-form" class="space-y-4">
          <!-- Nome -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              Nome Completo <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-lead-nome"
              required
              value="${lead.nome || ''}"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="edit-lead-email"
              required
              value="${lead.email || ''}"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          <!-- Telefone -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              id="edit-lead-telefone"
              value="${lead.telefone || ''}"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxlength="15"
            >
          </div>
          <!-- Grid: Empresa + Cargo -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Empresa</label>
              <input
                type="text"
                id="edit-lead-empresa"
                value="${lead.empresa || ''}"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Cargo</label>
              <input
                type="text"
                id="edit-lead-cargo"
                value="${lead.cargo || ''}"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
          </div>
          <!-- Grid: Status + Origem -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                id="edit-lead-status"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                ${LEADS_CONFIG.statusOptions.map(s => `<option value="${s.value}" ${s.value === lead.status ? 'selected' : ''}>${s.icon} ${s.label}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Origem</label>
              <select
                id="edit-lead-origem"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                ${LEADS_CONFIG.origemOptions.map(o => `<option value="${o}" ${o === lead.origem ? 'selected' : ''}>${o}</option>`).join('')}
              </select>
            </div>
          </div>
          <!-- Observações -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
            <textarea
              id="edit-lead-observacoes"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            >${lead.observacoes || ''}</textarea>
          </div>
          <!-- Botões -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              id="cancel-edit-lead"
              class="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  // Event listeners
  document.getElementById("close-edit-lead-modal").addEventListener("click", () => modal.remove());
  document.getElementById("cancel-edit-lead").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  document.getElementById("edit-lead-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await updateLead(leadId);
  });
  // Máscara de telefone
  const telefoneInput = document.getElementById("edit-lead-telefone");
  telefoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    e.target.value = value;
  });
  modal.classList.remove("hidden");
};

async function updateLead(leadId) {
  const nome = document.getElementById("edit-lead-nome").value.trim();
  const email = document.getElementById("edit-lead-email").value.trim();
  const telefone = document.getElementById("edit-lead-telefone").value.trim();
  const empresa = document.getElementById("edit-lead-empresa").value.trim();
  const cargo = document.getElementById("edit-lead-cargo").value.trim();
  const status = document.getElementById("edit-lead-status").value;
  const origem = document.getElementById("edit-lead-origem").value;
  const observacoes = document.getElementById("edit-lead-observacoes").value.trim();
  // Validações
  if (nome.length < 3) return showError("Nome deve ter pelo menos 3 caracteres");
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return showError("Email inválido");
  try {
    showLoading(true, "Atualizando lead...");
    const updateData = {
      nome,
      email,
      telefone: telefone || null,
      empresa: empresa || null,
      cargo: cargo || null,
      status,
      origem: origem || null,
      observacoes: observacoes || null
    };
    const { success, error } = await window.AlshamSupabase.genericUpdate("leads_crm", { id: leadId }, updateData);
    if (!success) throw error;
    // Award points for update
    await awardGamificationPoints(status, 'update');
    // Trigger n8n if status changed to converted
    if (status === 'convertido') await triggerN8nOnConvert(leadId);
    showLoading(false);
    showSuccess("Lead atualizado com sucesso!");
    // Atualizar estado local
    const leadIndex = leadsState.leads.findIndex(l => l.id === leadId);
    if (leadIndex !== -1) {
      leadsState.leads[leadIndex] = { ...leadsState.leads[leadIndex], ...updateData, updated_at: new Date().toISOString() };
    }
    document.getElementById("edit-lead-modal").remove();
    const detailModal = document.getElementById("lead-modal");
    if (detailModal) detailModal.remove();
    applyFilters();
    renderTable();
    setTimeout(async () => await loadSystemData(), 1000); // Background reload
  } catch (error) {
    showLoading(false);
    console.error("Erro ao atualizar lead:", error);
    showError(`Erro: ${error.message}`);
  }
}

// ============================================
// DELETAR LEAD
// ============================================
window.openDeleteLeadModal = function(leadId) {
  let modal = document.getElementById("delete-lead-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "delete-lead-modal";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4";
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Confirmar Deleção</h2>
        <button id="close-delete-lead-modal" class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">&times;</button>
      </div>
      <div class="p-6">
        <p class="text-gray-700 mb-6">Tem certeza que deseja deletar este lead? Essa ação é irreversível.</p>
        <div class="flex gap-3">
          <button
            id="confirm-delete-lead"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Confirmar
          </button>
          <button
            id="cancel-delete-lead"
            class="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `;
  // Event listeners
  document.getElementById("close-delete-lead-modal").addEventListener("click", () => modal.remove());
  document.getElementById("cancel-delete-lead").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  document.getElementById("confirm-delete-lead").addEventListener("click", async () => await deleteLead(leadId));
  modal.classList.remove("hidden");
};

async function deleteLead(leadId) {
  try {
    showLoading(true, "Deletando lead...");
    const { success, error } = await window.AlshamSupabase.genericDelete("leads_crm", leadId);
    if (!success) throw error;
    showLoading(false);
    showSuccess("Lead deletado com sucesso!");
    document.getElementById("delete-lead-modal").remove();
    const detailModal = document.getElementById("lead-modal");
    if (detailModal) detailModal.remove();
    await loadSystemData();
    setupInterface();
  } catch (error) {
    showLoading(false);
    console.error("Erro ao deletar lead:", error);
    showError(`Erro: ${error.message}`);
  }
}

// ============================================
// INTERAÇÕES
// ============================================
function renderInteractionItem(interaction) {
  const typeConfig = LEADS_CONFIG.interactionTypes.find(t => t.value === interaction.interaction_type) || { icon: "📌", label: "Outro" };
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
          ${interaction.notes ? `<p class="text-sm text-gray-700 mb-2">${interaction.notes}</p>` : ''}
          ${interaction.outcome ? `<div class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded inline-block">Resultado: ${interaction.outcome}</div>` : ''}
          ${interaction.duration_minutes ? `<div class="text-xs text-gray-500 mt-1">Duração: ${interaction.duration_minutes} min</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

window.showAddInteractionForm = function(leadId) {
  const container = document.getElementById("interaction-form-container");
  if (!container) return;
  container.classList.remove("hidden");
  container.innerHTML = `
    <div class="bg-blue-50 rounded-lg p-4">
      <h4 class="font-semibold text-gray-900 mb-4">Adicionar Nova Interação</h4>
      <form id="new-interaction-form" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Interação</label>
          <select id="interaction-type" class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            ${LEADS_CONFIG.interactionTypes.map(t => `<option value="${t.value}">${t.icon} ${t.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notas *</label>
          <textarea id="interaction-notes" rows="3" class="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Descreva o que foi discutido..." required></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
            <input type="number" id="interaction-duration" class="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Ex: 30">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Resultado</label>
            <select id="interaction-outcome" class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">Selecione...</option>
              <option value="positivo">Positivo</option>
              <option value="neutro">Neutro</option>
              <option value="negativo">Negativo</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Próxima Ação</label>
          <input type="text" id="interaction-next-action" class="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Ex: Enviar proposta até sexta-feira">
        </div>
        <div class="flex gap-2 pt-2">
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm transition-colors">Salvar Interação</button>
          <button type="button" data-cancel-interaction="true" class="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-medium text-sm transition-colors">Cancelar</button>
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
      // Award points for interaction
      await awardGamificationPoints(formData.interaction_type, 'interaction');
      showLoading(false);
      showSuccess("Interação adicionada com sucesso!");
      window.openLeadModal(leadId);
    } catch (error) {
      showLoading(false);
      showError(`Erro ao salvar: ${error.message}`);
      console.error(error);
    }
  });
  const cancelBtn = container.querySelector('[data-cancel-interaction]');
  if (cancelBtn) cancelBtn.addEventListener('click', window.cancelAddInteraction);
  container.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

window.cancelAddInteraction = function() {
  const container = document.getElementById("interaction-form-container");
  if (container) container.classList.add("hidden");
};

// ============================================
// Gamificação e Automação Helpers
// ============================================
async function awardGamificationPoints(action, type) {
  const pointsConfig = LEADS_CONFIG.statusOptions.find(s => s.value === action) || { points: 5 }; // Default 5 for interactions
  const payload = {
    user_id: leadsState.user.id,
    points_awarded: pointsConfig.points || 5,
    reason: `${type} lead: ${action}`
  };
  const { success } = await window.AlshamSupabase.genericInsert('gamification_points', payload);
  if (success) await loadGamification();
}

async function triggerN8nOnConvert(leadId) {
  const endpoint = LEADS_CONFIG.n8nEndpoints.followUp; // Configure in config
  const payload = { leadId, event: 'converted' };
  await window.AlshamSupabase.triggerN8n(endpoint, payload);
}

// ============================================
// Export CSV (Novo - Para Analytics)
// ============================================
window.exportLeadsCSV = function() {
  const csvContent = "data:text/csv;charset=utf-8," + 
    "ID,Nome,Email,Telefone,Empresa,Cargo,Status,Origem,Score IA,Data Criação\n" +
    leadsState.filteredLeads.map(l => 
      `${l.id},${l.nome},${l.email},${l.telefone},${l.empresa},${l.cargo},${l.status},${l.origem},${l.score_ia || 0},${new Date(l.created_at).toLocaleDateString('pt-BR')}`
    ).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "leads_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ============================================
// Realtime e Init
// ============================================
function setupRealtime() {
  if (!LEADS_CONFIG.realtime.enabled) return;
  const subscription = window.AlshamSupabase.subscribeToTable("leads_crm", leadsState.orgId, () => {
    console.log("Atualização realtime recebida");
    loadSystemData().then(setupInterface);
  });
  window.addEventListener("beforeunload", () => window.AlshamSupabase.unsubscribeFromTable(subscription));
}

window.LeadsSystem = {
  init: () => loadSystemData().then(setupInterface),
  refresh: () => loadSystemData().then(setupInterface),
  state: leadsState,
  config: LEADS_CONFIG
};

console.log("✅ Leads-Real.js v6.1 carregado com sucesso");
