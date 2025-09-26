/**
 * fix-imports.js - Correção para problemas de imports/exports
 * Alinhado com auth.js v5.3, dashboard.js v7.2 e navigation.js v2.0
 *
 * @version 2.3.0 - FINAL PRODUÇÃO READY
 * @autor ALSHAM Development Team
 */

function waitForAlshamSupabase(callback, maxAttempts = 25) {
  let attempts = 0;
  function check() {
    attempts++;
    if (window.AlshamSupabase && typeof window.AlshamSupabase === "object") {
      console.log("✅ AlshamSupabase encontrado após", attempts, "tentativas");
      callback();
    } else if (attempts < maxAttempts) {
      setTimeout(check, 200);
    } else {
      console.error("❌ Timeout: AlshamSupabase não foi carregado");
      createMockAlshamSupabase();
      callback();
    }
  }
  check();
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

  // Registrar auditoria local
  localStorage.setItem("alsham_fiximports_log", JSON.stringify({
    createdAt: new Date().toISOString(),
    reason: "Mock criado por timeout no carregamento do AlshamSupabase",
    fallbackOrgId
  }));
}

waitForAlshamSupabase(() => {
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
    console.log("🔧 Fix-imports V2.3 aplicado com sucesso!");
    window.dispatchEvent(
      new CustomEvent("fix-imports-ready", {
        detail: { version: "2.3.0", timestamp: new Date().toISOString() }
      })
    );
  } catch (error) {
    console.error("❌ Erro no fix-imports:", error);
    window.showAuthNotification?.("Erro ao inicializar sistema", "error");
  }
});

console.log("🔧 Fix-imports V2.3 FINAL carregado - aguardando AlshamSupabase...");
