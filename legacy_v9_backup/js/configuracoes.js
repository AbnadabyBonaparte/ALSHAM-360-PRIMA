/**
 * ALSHAM 360° PRIMA - Enterprise Configuration System V6.0
 * Corrigido: Botões clicáveis e navegação funcional
 */

function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.getCurrentSession) {
    console.log("✅ Supabase carregado para configurações");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou");
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

function showNotification(message, type = "info") {
  const div = document.createElement("div");
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-600",
    info: "bg-blue-600"
  };
  div.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded text-white shadow-lg ${colors[type] || colors.info}`;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

waitForSupabase(async () => {
  const {
    getCurrentSession,
    getCurrentOrgId,
    genericSelect,
    genericUpdate,
    createAuditLog
  } = window.AlshamSupabase;

  const SECTIONS = [
    { id: "profile", label: "👤 Perfil", icon: "👤" },
    { id: "organization", label: "🏢 Organização", icon: "🏢" },
    { id: "team", label: "👥 Equipe", icon: "👥" },
    { id: "notifications", label: "🔔 Notificações", icon: "🔔" },
    { id: "integrations", label: "🔌 Integrações", icon: "🔌" },
    { id: "security", label: "🔒 Segurança", icon: "🔒" },
    { id: "billing", label: "💳 Faturamento", icon: "💳" },
    { id: "analytics", label: "📊 Analytics", icon: "📊" }
  ];

  const state = {
    user: null,
    orgId: null,
    data: {},
    currentSection: "profile"
  };

  async function init() {
    try {
      const session = await getCurrentSession();
      if (!session?.user) {
        window.location.href = "/login.html";
        return;
      }

      state.user = session.user;
      state.orgId = await getCurrentOrgId();

      await loadData();
      renderSidebar();
      renderContent(state.currentSection);

      showNotification("Configurações carregadas", "success");
    } catch (e) {
      console.error("Erro init:", e);
      showNotification("Erro ao carregar", "error");
    }
  }

  async function loadData() {
    try {
      const [profile, org, team] = await Promise.all([
        genericSelect("user_profiles", { user_id: state.user.id, org_id: state.orgId }),
        genericSelect("organizations", { id: state.orgId }),
        genericSelect("teams", { org_id: state.orgId })
      ]);

      state.data = {
        profile: profile?.data?.[0] || {},
        organization: org?.data?.[0] || {},
        team: team?.data || []
      };
    } catch (err) {
      console.error("Erro carregar dados:", err);
    }
  }

  function renderSidebar() {
    const sidebar = document.getElementById("config-sidebar");
    if (!sidebar) return;

    sidebar.innerHTML = SECTIONS.map(sec => `
      <button 
        class="config-section-btn ${sec.id === state.currentSection ? 'active' : ''}" 
        data-section="${sec.id}">
        ${sec.label}
      </button>
    `).join("");

    sidebar.querySelectorAll(".config-section-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const section = btn.dataset.section;
        state.currentSection = section;
        renderSidebar();
        renderContent(section);
      });
    });
  }

  function renderContent(section) {
    const content = document.getElementById("config-content");
    if (!content) return;

    const templates = {
      profile: renderProfileSection,
      organization: renderOrganizationSection,
      team: renderTeamSection,
      notifications: renderNotificationsSection,
      integrations: renderIntegrationsSection,
      security: renderSecuritySection,
      billing: renderBillingSection,
      analytics: renderAnalyticsSection
    };

    const renderer = templates[section] || renderDefaultSection;
    content.innerHTML = renderer();

    if (section === "profile") {
      setupProfileHandlers();
    }
  }

  function renderProfileSection() {
    return `
      <div class="space-y-6">
        <h2 class="text-xl font-bold">👤 Perfil</h2>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
          <input 
            id="profile-name" 
            type="text"
            value="${state.data.profile?.full_name || ''}"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Seu nome completo">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input 
            type="email"
            value="${state.user?.email || ''}"
            disabled
            class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            placeholder="email@exemplo.com">
          <p class="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
          <input 
            id="profile-role" 
            type="text"
            value="${state.data.profile?.role || ''}"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Seu cargo">
        </div>

        <button 
          id="save-profile-btn"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
          Salvar Alterações
        </button>
      </div>
    `;
  }

  function renderOrganizationSection() {
    return `
      <div class="space-y-6">
        <h2 class="text-xl font-bold">🏢 Organização</h2>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="font-medium">${state.data.organization?.name || 'ALSHAM Global'}</p>
          <p class="text-sm text-gray-600 mt-2">ID: ${state.orgId}</p>
        </div>
        <p class="text-gray-600">Configurações de organização em desenvolvimento.</p>
      </div>
    `;
  }

  function renderTeamSection() {
    return `
      <div class="space-y-6">
        <h2 class="text-xl font-bold">👥 Equipe</h2>
        <p class="text-gray-600">Membros da equipe: ${state.data.team?.length || 0}</p>
        <p class="text-gray-600">Gerenciamento de equipe em desenvolvimento.</p>
      </div>
    `;
  }

  function renderNotificationsSection() {
    return `
      <div class="space-y-6">
        <h2 class="text-xl font-bold">🔔 Notificações</h2>
        <p class="text-gray-600">Configure suas preferências de notificação.</p>
      </div>
    `;
  }

  function renderIntegrationsSection() {
    return `
      <div class="space-y-6">
        <h2 class="text-xl font-bold">🔌 Integrações</h2>
        <p class="text-gray-600">Gerencie integrações com outros sistemas.</p>
      </div>
    `;
  }

  function renderSecuritySection() {
    return `
      <div class="space-y-6">
        <h2 class="text-xl font-bold">🔒 Segurança</h2>
        <p class="text-gray-600">Configurações de segurança e autenticação.</p>
      </div>
    `;
  }

  function renderBillingSection() {
    return `
      <div class="space-y-6">
        <h2 class="text-xl font-bold">💳 Faturamento</h2>
        <p class="text-gray-600">Gerencie planos e pagamentos.</p>
      </div>
    `;
  }

  function renderAnalyticsSection() {
    return `
      <div class="space-y-6">
        <h2 class="text-xl font-bold">📊 Analytics</h2>
        <p class="text-gray-600">Configurações de rastreamento e análise.</p>
      </div>
    `;
  }

  function renderDefaultSection() {
    return `
      <div class="text-center py-12">
        <p class="text-gray-500">Seção em desenvolvimento</p>
      </div>
    `;
  }

  function setupProfileHandlers() {
    const saveBtn = document.getElementById("save-profile-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", saveProfile);
    }
  }

  async function saveProfile() {
    try {
      const name = document.getElementById("profile-name")?.value;
      const role = document.getElementById("profile-role")?.value;

      if (!name) {
        showNotification("Nome é obrigatório", "warning");
        return;
      }

      await genericUpdate("user_profiles", state.data.profile.id, 
        { full_name: name, role }, 
        state.orgId);

      await createAuditLog("PROFILE_UPDATED", 
        { user_id: state.user.id, changes: { full_name: name, role } }, 
        state.user.id, 
        state.orgId);

      showNotification("Perfil atualizado com sucesso!", "success");
      await loadData();
    } catch (e) {
      console.error("Erro salvar:", e);
      showNotification("Erro ao salvar perfil", "error");
    }
  }

  document.addEventListener("DOMContentLoaded", init);

  console.log("⚙️ Enterprise Configuration System v6.0 pronto - ALSHAM 360° PRIMA");
});
