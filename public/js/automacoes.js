/**
 * ALSHAM 360° PRIMA - Sistema de Automações V2.3
 * CORRIGIDO: Aguarda Supabase e sem ES6 imports
 */

// Aguarda Supabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.getCurrentSession) {
    console.log("✅ Supabase carregado para Automações");
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
    genericSelect,
    subscribeToTable
  } = window.AlshamSupabase;

  // ===== CONFIGURAÇÃO GLOBAL =====
  const ALSHAM_AUTOMATION_CONFIG = {
    version: "2.3.0",
    triggerTypes: [
      { value: "lead_created", label: "👤 Lead Criado", icon: "🆕", category: "leads" },
      { value: "lead_status_changed", label: "📊 Status do Lead Alterado", icon: "🔄", category: "leads" },
      { value: "lead_temperature_changed", label: "🌡️ Temperatura Alterada", icon: "🔥", category: "leads" },
      { value: "opportunity_created", label: "💰 Oportunidade Criada", icon: "✨", category: "sales" },
      { value: "interaction_logged", label: "💬 Interação Registrada", icon: "📝", category: "interactions" },
      { value: "score_threshold", label: "🤖 Score IA Atingido", icon: "⚡", category: "ai" },
      { value: "time_based", label: "⏰ Baseado em Tempo", icon: "🕐", category: "schedule" },
      { value: "webhook_received", label: "🔗 Webhook Recebido", icon: "📡", category: "integrations" }
    ],
    actionTypes: [
      { value: "send_email", label: "📧 Enviar Email", icon: "✉️", category: "communication" },
      { value: "send_sms", label: "📱 Enviar SMS", icon: "💬", category: "communication" },
      { value: "update_lead", label: "✏️ Atualizar Lead", icon: "📝", category: "data" },
      { value: "create_task", label: "✅ Criar Tarefa", icon: "📋", category: "tasks" },
      { value: "assign_owner", label: "👤 Designar Responsável", icon: "🎯", category: "assignment" },
      { value: "add_to_sequence", label: "🔄 Adicionar à Sequência", icon: "⚙️", category: "sequences" },
      { value: "call_webhook", label: "🌐 Chamar Webhook", icon: "🔗", category: "integrations" },
      { value: "n8n_workflow", label: "🔧 N8N Workflow", icon: "⚡", category: "integrations" },
      { value: "make_scenario", label: "🎛️ Make Scenario", icon: "🤖", category: "integrations" },
      { value: "zapier_zap", label: "⚡ Zapier Zap", icon: "🔥", category: "integrations" }
    ],
    executionStatus: [
      { value: "pending", label: "Pendente", color: "yellow", icon: "⏳" },
      { value: "running", label: "Executando", color: "blue", icon: "🔄" },
      { value: "success", label: "Sucesso", color: "green", icon: "✅" },
      { value: "failed", label: "Falhou", color: "red", icon: "❌" },
      { value: "cancelled", label: "Cancelado", color: "gray", icon: "⏹️" }
    ],
    integrations: {
      n8n: { name: "N8N", icon: "🔧", description: "Workflows avançados com N8N", webhookUrl: "/api/webhooks/n8n" },
      make: { name: "Make.com", icon: "🎛️", description: "Automação visual com Make", webhookUrl: "/api/webhooks/make" },
      zapier: { name: "Zapier", icon: "⚡", description: "Conecte 5000+ apps", webhookUrl: "/api/webhooks/zapier" }
    },
    realtime: { enabled: true, refreshInterval: 10000 }
  };

  // ===== ESTADO GLOBAL =====
  const alshamAutomationState = {
    user: null,
    orgId: null,
    automationRules: [],
    executionHistory: [],
    logs: [],
    lastUpdate: null,
    isLoading: false
  };

  // ===== INICIALIZAÇÃO =====
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      showLoading(true, "🤖 Carregando Sistema de Automações...");
      const authResult = await authenticateUser();
      if (!authResult.success) {
        redirectToLogin();
        return;
      }

      alshamAutomationState.user = authResult.user;
      alshamAutomationState.orgId = authResult.orgId;

      await loadAutomationData();
      setupAutomationInterface();
      setupRealtimeSubscriptions();

      showLoading(false);
      showSuccess("🎉 Sistema de Automações carregado!");
    } catch (error) {
      console.error("❌ Erro na inicialização:", error);
      showLoading(false);
      showError("Erro ao carregar sistema de automações");
    }
  });

  // ===== AUTENTICAÇÃO =====
  async function authenticateUser() {
    try {
      const session = await getCurrentSession();
      if (!session?.user) return { success: false };

      let orgId = await getCurrentOrgId();
      if (!orgId) {
        orgId = localStorage.getItem("alsham_org_id") || "DEFAULT_ORG_ID";
      }
      localStorage.setItem("alsham_org_id", orgId);

      return { success: true, user: session.user, orgId };
    } catch (e) {
      console.error("Erro na autenticação:", e);
      return { success: false, error: e };
    }
  }

  function redirectToLogin() {
    window.location.href = "/login.html";
  }

  // ===== CARREGAR DADOS =====
  async function loadAutomationData() {
    try {
      alshamAutomationState.isLoading = true;

      const [rules, executions, logs] = await Promise.allSettled([
        genericSelect("automation_rules", { org_id: alshamAutomationState.orgId }),
        genericSelect("automation_executions", { org_id: alshamAutomationState.orgId }),
        genericSelect("logs_automacao", { org_id: alshamAutomationState.orgId })
      ]);

      alshamAutomationState.automationRules = rules.value?.data || [];
      alshamAutomationState.executionHistory = executions.value?.data || [];
      alshamAutomationState.logs = logs.value?.data || [];
      alshamAutomationState.lastUpdate = new Date();

      console.log("✅ Dados de automações carregados do Supabase | Org:", alshamAutomationState.orgId);
    } catch (e) {
      console.error("❌ Erro ao carregar automações:", e);
      loadDemoData();
    } finally {
      alshamAutomationState.isLoading = false;
    }
  }

  // ===== DEMO =====
  function loadDemoData() {
    console.log("📋 Carregando dados demo automações...");
    alshamAutomationState.automationRules = [
      { id: 1, name: "Regra Demo", trigger: "lead_created", action: "send_email", is_active: true }
    ];
    alshamAutomationState.executionHistory = [
      { id: 1, rule_id: 1, status: "success", executed_at: new Date().toISOString() }
    ];
    alshamAutomationState.logs = [
      { id: 1, message: "Execução simulada", created_at: new Date().toISOString() }
    ];
    showSuccess("Usando dados demo automações");
  }

  // ===== REALTIME =====
  function setupRealtimeSubscriptions() {
    if (!ALSHAM_AUTOMATION_CONFIG.realtime.enabled) return;

    const orgId = alshamAutomationState.orgId || "DEFAULT_ORG_ID";

    if (typeof subscribeToTable === "function") {
      subscribeToTable("automation_rules", orgId, () => loadAutomationData());
      subscribeToTable("automation_executions", orgId, () => loadAutomationData());
    } else {
      setInterval(() => {
        if (!document.hidden && !alshamAutomationState.isLoading) loadAutomationData();
      }, ALSHAM_AUTOMATION_CONFIG.realtime.refreshInterval);
    }
  }

  // ===== INTERFACE =====
  function setupAutomationInterface() {
    renderRulesTable();
    renderExecutions();
    renderLogs();
    console.log("🎨 Interface automações renderizada");
  }

  function renderRulesTable() {
    const container = document.getElementById("automation-rules");
    if (!container) return;
    container.innerHTML = alshamAutomationState.automationRules.map(rule => `
      <div class="p-4 border rounded-lg mb-2 ${rule.is_active ? "bg-green-50" : "bg-gray-50"}">
        <div class="flex justify-between items-center">
          <div>
            <div class="font-semibold">${rule.name}</div>
            <div class="text-sm text-gray-600">${rule.trigger} → ${rule.action}</div>
          </div>
          <button onclick="window.toggleRule(${rule.id})" class="px-3 py-1 rounded text-sm ${rule.is_active ? "bg-red-500 text-white" : "bg-green-500 text-white"}">
            ${rule.is_active ? "Desativar" : "Ativar"}
          </button>
        </div>
      </div>
    `).join("") || `<p class="text-gray-500">Nenhuma regra cadastrada</p>`;
  }

  function renderExecutions() {
    const container = document.getElementById("automation-executions");
    if (!container) return;
    container.innerHTML = alshamAutomationState.executionHistory.map(exec => `
      <div class="p-2 border-b text-sm">
        Execução #${exec.id} - ${exec.status} - ${new Date(exec.executed_at).toLocaleString("pt-BR")}
      </div>
    `).join("") || `<p class="text-gray-500">Nenhuma execução registrada</p>`;
  }

  function renderLogs() {
    const container = document.getElementById("automation-logs");
    if (!container) return;
    container.innerHTML = alshamAutomationState.logs.map(log => `
      <div class="p-2 border-b text-xs text-gray-600">
        ${new Date(log.created_at).toLocaleString("pt-BR")} - ${log.message}
      </div>
    `).join("") || `<p class="text-gray-500">Nenhum log encontrado</p>`;
  }

  // ===== OPERAÇÕES =====
  function toggleRule(ruleId) {
    const rule = alshamAutomationState.automationRules.find(r => r.id === ruleId);
    if (!rule) return;
    rule.is_active = !rule.is_active;
    renderRulesTable();
    showSuccess(`Regra ${rule.is_active ? "ativada" : "desativada"}`);
  }

  function refreshData() {
    loadAutomationData().then(setupAutomationInterface);
  }

  // ===== LOADING =====
  function showLoading(show, message = "Carregando...") {
    let el = document.getElementById("automation-loading");
    if (show) {
      if (!el) {
        el = document.createElement("div");
        el.id = "automation-loading";
        el.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
        el.innerHTML = `
          <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span class="text-gray-700">${message}</span>
          </div>`;
        document.body.appendChild(el);
      } else {
        el.querySelector("span").textContent = message;
        el.classList.remove("hidden");
      }
    } else {
      el?.remove();
    }
  }

  // ===== EXPORT GLOBAL =====
  window.AutomationSystem = {
    getState: () => ({ ...alshamAutomationState }),
    refresh: refreshData,
    integrations: ALSHAM_AUTOMATION_CONFIG.integrations,
    version: ALSHAM_AUTOMATION_CONFIG.version
  };

  window.toggleRule = toggleRule;
  window.refreshData = refreshData;

  console.log("🤖 Automações V2.3 carregado");
});
