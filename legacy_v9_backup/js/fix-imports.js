/**
 * fix-imports.js - Correção para problemas de imports/exports
 * Alinhado com auth.js v5.3, dashboard.js v7.2 e navigation.js v2.0
 *
 * @version 2.4.0 - PADRONIZADO COM WAIT_FOR_SUPABASE
 * @autor ALSHAM Development Team
 */

// Aguarda Supabase estar disponível (padrão unificado)
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && typeof window.AlshamSupabase === "object") {
    console.log("✅ AlshamSupabase carregado para fix-imports");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Timeout: AlshamSupabase não carregado - criando mock");
    createMockAlshamSupabase();
    callback();
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

function createMockAlshamSupabase() {
  console.warn("⚠️ Criando mock do AlshamSupabase (fallback)");

  const fallbackOrgId = localStorage.getItem("alsham_org_id") || "DEFAULT_ORG_ID";

  window.AlshamSupabase = {
    client: {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null })
      }
    },
    getCurrentSession: async () => ({ user: null }),
    getCurrentOrgId: async () => fallbackOrgId,
    getDefaultOrgId: () => "DEFAULT_ORG_ID",
    getLeads: async () => ({ data: [], error: null }),
    signOut: async () => ({ error: null })
  };

  localStorage.setItem("alsham_fiximports_log", JSON.stringify({
    createdAt: new Date().toISOString(),
    reason: "Mock criado por timeout no carregamento do AlshamSupabase",
    fallbackOrgId
  }));
}

waitForSupabase(() => {
  try {
    const alsham = window.AlshamSupabase;

    // ===== NOTIFICAÇÕES =====
    window.showAuthNotification =
      alsham.showAuthNotification ||
      function (msg, type = "info") {
        console.log(`[${type.toUpperCase()}] ${msg}`);
        const notification = document.createElement("div");
        notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
          type === "error"
            ? "bg-red-500"
            : type === "success"
            ? "bg-green-500"
            : type === "warning"
            ? "bg-yellow-500"
            : "bg-blue-500"
        }`;
        notification.textContent = msg;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      };

    // ===== FUNÇÕES CRUD =====
    window.genericSelect = alsham.genericSelect || (async () => ({ data: [], error: null }));
    window.genericInsert = alsham.genericInsert || (async () => ({ error: null }));
    window.genericUpdate = alsham.genericUpdate || (async () => ({ error: null }));
    window.genericDelete = alsham.genericDelete || (async () => ({ error: null }));

    // ===== LEADS =====
    window.getLeads = alsham.getLeads || (async () => ({ data: [], error: null }));

    // ===== Fallback checkRouteAccess =====
    window.checkRouteAccess = function (route) {
      if (window.AlshamAuth?.checkRouteAccess) {
        return window.AlshamAuth.checkRouteAccess(route);
      }
      console.warn("⚠️ Usando fallback de checkRouteAccess");
      return true;
    };

    // ===== Navegação Segura =====
    window.navigateTo = function (url) {
      if (window.checkRouteAccess(url)) {
        window.location.href = url;
      } else {
        window.showAuthNotification("Sessão expirada. Redirecionando...", "warning");
        setTimeout(() => (window.location.href = "/login.html"), 2000);
      }
    };

    // ===== Chart.js =====
    if (typeof Chart !== "undefined" && Chart) {
      window.ChartJS = Chart;
      console.log("✅ Chart.js disponível globalmente");
    } else {
      console.warn("⚠️ Chart.js não encontrado - mock ativado");
      window.Chart = function (ctx, config) {
        console.warn("Mock Chart.js:", config?.type || "chart");
        return {
          update: () => console.log("Chart mock update"),
          destroy: () => console.log("Chart mock destroy")
        };
      };
    }

    // ===== LOG =====
    console.log("🔧 Fix-imports V2.4 aplicado com sucesso!");
    window.dispatchEvent(
      new CustomEvent("fix-imports-ready", {
        detail: { version: "2.4.0", timestamp: new Date().toISOString() }
      })
    );
  } catch (error) {
    console.error("❌ Erro no fix-imports:", error);
    window.showAuthNotification?.("Erro ao inicializar sistema", "error");
  }
});

console.log("🔧 Fix-imports V2.4 carregado - aguardando AlshamSupabase...");
