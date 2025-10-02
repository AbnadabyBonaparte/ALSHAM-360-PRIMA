/**
 * ALSHAM 360° PRIMA - Sistema de Automações V2.4.0
 * Sistema completo de automações com regras, execuções e logs
 */

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
  const { getCurrentSession, getCurrentOrgId, genericSelect, genericUpdate } = window.AlshamSupabase;

  const automationState = {
    user: null,
    orgId: null,
    rules: [],
    executions: [],
    logs: [],
    isLoading: false
  };

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      showLoading(true);
      const authResult = await authenticateUser();
      if (!authResult.success) {
        redirectToLogin();
        return;
      }

      automationState.user = authResult.user;
      automationState.orgId = authResult.orgId;

      await loadData();
      renderInterface();
      setupRealtime();

      showLoading(false);
      showSuccess("Automações carregadas!");
    } catch (error) {
      console.error("❌ Erro:", error);
      showLoading(false);
      showError("Erro ao carregar automações");
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

  async function loadData() {
    try {
      automationState.isLoading = true;

      const [rules, executions, logs] = await Promise.allSettled([
        genericSelect("automation_rules", { org_id: automationState.orgId }),
        genericSelect("automation_executions", { org_id: automationState.orgId }, { order: { column: "started_at", ascending: false }, limit: 20 }),
        genericSelect("logs_automacao", { org_id: automationState.orgId }, { order: { column: "created_at", ascending: false }, limit: 50 })
      ]);

      automationState.rules = rules.status === "fulfilled" ? rules.value.data || [] : [];
      automationState.executions = executions.status === "fulfilled" ? executions.value.data || [] : [];
      automationState.logs = logs.status === "fulfilled" ? logs.value.data || [] : [];

      console.log(`✅ ${automationState.rules.length} regras carregadas`);
    } catch (error) {
      console.error("❌ Erro ao carregar:", error);
    } finally {
      automationState.isLoading = false;
    }
  }

  function renderInterface() {
    renderKPIs();
    renderRules();
    renderExecutions();
    renderLogs();
  }

  function renderKPIs() {
    const container = document.getElementById("automation-kpis");
    if (!container) return;

    const activeRules = automationState.rules.filter(r => r.is_active).length;
    const successRate = automationState.executions.length > 0
      ? ((automationState.executions.filter(e => e.status === "success").length / automationState.executions.length) * 100).toFixed(1)
      : 0;

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600 mb-1">Total de Regras</p>
          <p class="text-3xl font-bold text-blue-600">${automationState.rules.length}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600 mb-1">Regras Ativas</p>
          <p class="text-3xl font-bold text-green-600">${activeRules}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600 mb-1">Execuções (24h)</p>
          <p class="text-3xl font-bold text-purple-600">${automationState.executions.length}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600 mb-1">Taxa de Sucesso</p>
          <p class="text-3xl font-bold text-orange-600">${successRate}%</p>
        </div>
      </div>
    `;
  }

  function renderRules() {
    const container = document.getElementById("automation-rules");
    if (!container) return;

    if (!automationState.rules.length) {
      container.innerHTML = `<p class="text-gray-500 text-center py-8">Nenhuma regra cadastrada ainda.</p>`;
      return;
    }

    container.innerHTML = automationState.rules.map(rule => `
      <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 ${rule.is_active ? 'border-green-500' : 'border-gray-300'}">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 mb-1">${rule.name}</h3>
            <p class="text-sm text-gray-600 mb-2">
              <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">${rule.trigger_event || 'Trigger'}</span>
              <span class="mx-2">→</span>
              <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">${(rule.actions && rule.actions[0]) || 'Ação'}</span>
            </p>
            ${rule.conditions ? `<p class="text-xs text-gray-500">Condições: ${JSON.stringify(rule.conditions).substring(0, 50)}...</p>` : ''}
          </div>
          <div class="flex items-center gap-2">
            <button 
              onclick="window.toggleRule('${rule.id}')" 
              class="px-3 py-1 text-sm rounded transition-colors ${rule.is_active ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}"
            >
              ${rule.is_active ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderExecutions() {
    const container = document.getElementById("automation-executions");
    if (!container) return;

    if (!automationState.executions.length) {
      container.innerHTML = `<p class="text-gray-500 text-center py-4">Nenhuma execução recente.</p>`;
      return;
    }

    container.innerHTML = automationState.executions.map(exec => {
      const statusColors = {
        success: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        running: 'bg-blue-100 text-blue-800',
        pending: 'bg-yellow-100 text-yellow-800'
      };
      const statusColor = statusColors[exec.status] || 'bg-gray-100 text-gray-800';

      return `
        <div class="flex justify-between items-center p-3 border-b hover:bg-gray-50">
          <div class="flex-1">
            <span class="font-medium text-sm">Regra #${exec.rule_id}</span>
            <span class="text-xs text-gray-500 ml-2">${exec.trigger_event || 'N/A'}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="px-2 py-1 rounded text-xs font-medium ${statusColor}">${exec.status}</span>
            <span class="text-xs text-gray-500">${new Date(exec.started_at).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderLogs() {
    const container = document.getElementById("automation-logs");
    if (!container) return;

    if (!automationState.logs.length) {
      container.innerHTML = `<p class="text-gray-400">Nenhum log disponível.</p>`;
      return;
    }

    container.innerHTML = automationState.logs.slice(0, 30).map(log => {
      const timestamp = new Date(log.created_at).toLocaleTimeString('pt-BR');
      const category = log.categoria || 'INFO';
      return `<div class="text-xs mb-1"><span class="text-gray-500">[${timestamp}]</span> <span class="text-green-400">${category}</span>: ${log.mensagem || log.evento || 'N/A'}</div>`;
    }).join('');
  }

  window.toggleRule = async function(ruleId) {
    const rule = automationState.rules.find(r => r.id === ruleId);
    if (!rule) return;

    try {
      const newStatus = !rule.is_active;
      await genericUpdate("automation_rules", { is_active: newStatus }, { id: ruleId });
      rule.is_active = newStatus;
      renderRules();
      renderKPIs();
      showSuccess(`Regra ${newStatus ? 'ativada' : 'desativada'}`);
    } catch (error) {
      showError(`Erro ao atualizar regra: ${error.message}`);
    }
  };

  function setupRealtime() {
    setInterval(() => {
      if (!document.hidden && !automationState.isLoading) {
        loadData().then(renderInterface);
      }
    }, 30000);
  }

  function showLoading(show) {
    const loader = document.getElementById("automation-loading");
    if (show && !loader) {
      const div = document.createElement("div");
      div.id = "automation-loading";
      div.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center";
      div.innerHTML = `
        <div class="bg-white rounded-lg p-6">
          <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-gray-700">Carregando...</p>
        </div>
      `;
      document.body.appendChild(div);
    } else if (!show && loader) {
      loader.remove();
    }
  }

  window.AutomationSystem = {
    refresh: () => loadData().then(renderInterface),
    getState: () => ({ ...automationState }),
    version: "2.4.0"
  };

  console.log("🤖 Automações v2.4.0 carregadas");
});
