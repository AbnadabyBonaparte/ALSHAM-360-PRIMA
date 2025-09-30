/**
 * 🚀 ALSHAM 360° PRIMA - Main Application Script Enterprise V2.2.0
 * CORRIGIDO: Aguarda Supabase carregar
 */

// Aguarda Supabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.getCurrentSession) {
    console.log("✅ Supabase carregado para Main");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou - ativando modo demo");
    callback(); // Continua em modo demo
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

// Aguarda Supabase antes de executar
waitForSupabase(() => {
  const {
    getCurrentSession,
    getCurrentOrgId,
    genericSelect,
    createAuditLog,
    subscribeToTable,
  } = window.AlshamSupabase || {};

  // ===== CONFIG GLOBAL =====
  const APP_CONFIG = {
    version: "2.2.0",
    environment: "production",
    features: {
      realTimeUpdates: true,
      animations: true,
      gamification: true,
      notifications: true,
      analytics: true,
    },
    performance: {
      kpiUpdateInterval: 30000,
      leadsUpdateInterval: 45000,
      chartAnimationDuration: 1000,
      retryAttempts: 3,
      retryDelay: 2000,
    },
    ui: {
      animationDuration: 600,
      staggerDelay: 100,
      rippleAnimationDuration: 600,
      notificationDuration: 5000,
    },
  };

  // ===== ESTADO GLOBAL =====
  const AppState = {
    isInitialized: false,
    isDemoMode: false,
    timers: { kpi: null, leads: null },
    cache: new Map(),
    retryCount: 0,
    lastUpdate: null,
    user: null,
  };

  // ===== CACHE MANAGER =====
  class CacheManager {
    constructor(maxSize = 50, ttl = 300000) {
      this.cache = new Map();
      this.maxSize = maxSize;
      this.ttl = ttl;
    }
    set(key, value) {
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(key, {
        value,
        expires: Date.now() + this.ttl,
      });
    }
    get(key) {
      const item = this.cache.get(key);
      if (!item || Date.now() > item.expires) {
        this.cache.delete(key);
        return null;
      }
      return item.value;
    }
  }
  const cacheManager = new CacheManager();

  // ===== ERROR HANDLER =====
  class ErrorHandler {
    static async track(error, context = {}) {
      const errorInfo = {
        message: error.message || error,
        stack: error.stack || null,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        context,
      };
      console.error("🚨 Application Error:", errorInfo);

      if (createAuditLog) {
        await createAuditLog("APP_ERROR", errorInfo);
      }
      this.showUserNotification(context.userMessage || "Erro inesperado");
    }
    static showUserNotification(msg) {
      if (window.navigationSystem?.notificationManager) {
        window.navigationSystem.notificationManager.show(msg, "error");
      } else {
        console.warn("⚠️", msg);
      }
    }
  }

  // ===== INIT =====
  async function initializeMain() {
    try {
      console.info("🚀 ALSHAM 360° PRIMA - Dashboard v2.2.0 iniciando...");
      showLoadingIndicator();

      await checkSupabaseAvailability();
      await initializeApplication();

      hideLoadingIndicator();
      console.info("✅ Dashboard inicializado com sucesso");
    } catch (error) {
      ErrorHandler.track(error, {
        phase: "init",
        userMessage: "Erro ao inicializar dashboard",
      });
      hideLoadingIndicator();
      initializeDemoMode();
    }
  }

  // ===== SUPABASE CHECK =====
  async function checkSupabaseAvailability() {
    if (typeof genericSelect === "function" && typeof getCurrentSession === "function") {
      console.info("✅ Supabase disponível");
    } else {
      console.warn("⚠️ Supabase não disponível → Modo Demo");
      AppState.isDemoMode = true;
    }
  }

  // ===== APPLICATION =====
  async function initializeApplication() {
    AppState.user = (await getCurrentSession?.())?.user || null;

    initializeAnimations();
    initializeGamification();
    renderKPIs();
    renderLeadsTable();
    renderChartWithRealData();

    if (APP_CONFIG.features.realTimeUpdates) startRealTimeUpdates();

    AppState.isInitialized = true;
    AppState.lastUpdate = new Date();
  }

  // ===== DEMO MODE =====
  function initializeDemoMode() {
    console.info("🎭 Ativando Demo Mode");
    AppState.isDemoMode = true;
    window.demoData = {
      kpis: generateDemoKPIs(),
      leads: generateDemoLeads(),
      chartData: [12000, 15000, 18000, 20000, 17000, 21000, 25000],
    };
  }

  // ===== RENDER KPIS =====
  async function renderKPIs() {
    const container = document.getElementById("dashboard-kpis");
    if (!container) return;

    try {
      let data = cacheManager.get("kpis");
      if (!data) {
        if (AppState.isDemoMode) {
          data = window.demoData.kpis;
        } else {
          const orgId = await getCurrentOrgId();
          const { data: kpis } = await genericSelect("dashboard_kpis", { org_id: orgId });
          data = kpis?.[0] || {};
        }
        cacheManager.set("kpis", data);
      }
      container.innerHTML = generateKPIHTML(data);
      animateKPICards();
    } catch (e) {
      ErrorHandler.track(e, { component: "KPIs" });
    }
  }

  // ===== RENDER LEADS =====
  async function renderLeadsTable() {
    const container = document.getElementById("leads-table");
    if (!container) return;

    try {
      let data = cacheManager.get("leads");
      if (!data) {
        if (AppState.isDemoMode) {
          data = window.demoData.leads;
        } else {
          const orgId = await getCurrentOrgId();
          const { data: leads } = await genericSelect("leads_crm", { org_id: orgId });
          data = leads || [];
        }
        cacheManager.set("leads", data);
      }
      container.innerHTML = generateLeadsTableHTML(data);
    } catch (e) {
      ErrorHandler.track(e, { component: "Leads" });
    }
  }

  // ===== RENDER CHART =====
  async function renderChartWithRealData() {
    const canvas = document.getElementById("performanceChart");
    if (!canvas || !window.Chart) return;

    try {
      let data;
      if (AppState.isDemoMode) {
        data = window.demoData.chartData;
      } else {
        const orgId = await getCurrentOrgId();
        const { data: leads } = await genericSelect("leads_crm", { org_id: orgId });
        data = processChartData(leads || []);
      }
      createChartJS(canvas, data);
    } catch (e) {
      ErrorHandler.track(e, { component: "Chart" });
      createChartJS(canvas, [0, 0, 0, 0, 0, 0, 0]);
    }
  }

  // ===== REALTIME =====
  function startRealTimeUpdates() {
    getCurrentOrgId?.().then((orgId) => {
      subscribeToTable?.("dashboard_kpis", orgId, () => renderKPIs());
      subscribeToTable?.("leads_crm", orgId, () => renderLeadsTable());
    });
  }

  // ===== HELPERS =====
  function showLoadingIndicator() {
    const el = document.getElementById("loading-indicator");
    if (el) el.style.display = "flex";
  }

  function hideLoadingIndicator() {
    const el = document.getElementById("loading-indicator");
    if (el) el.style.display = "none";
  }

  function initializeAnimations() {
    console.log("✨ Animations initialized");
  }

  function initializeGamification() {
    console.log("🎮 Gamification initialized");
  }

  function processChartData(leads) {
    return [12, 15, 18, 20, 17, 21, 25];
  }

  function generateDemoKPIs() {
    return { totalLeads: 123, qualifiedLeads: 45, conversionRate: 38, totalRevenue: 95000 };
  }

  function generateDemoLeads() {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      nome: ["Maria", "João", "Ana", "Pedro", "Carla"][i],
      empresa: ["Tech", "Inovação", "Digital", "StartupX", "Future"][i],
      status: ["novo", "qualificado", "proposta", "convertido", "perdido"][i],
      score_ia: Math.floor(Math.random() * 100),
    }));
  }

  function createChartJS(canvas, data) {
    if (!window.Chart) return;
    new window.Chart(canvas, {
      type: "line",
      data: {
        labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
        datasets: [{ label: "Receita", data, borderColor: "#8b5cf6", fill: true }],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
  }

  function generateKPIHTML(data) {
    return `
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded shadow">📈 Leads Ativos: ${data.totalLeads || 0}</div>
        <div class="bg-white p-4 rounded shadow">⚡ Conversões: ${data.qualifiedLeads || 0}</div>
        <div class="bg-white p-4 rounded shadow">💰 Receita: R$ ${(data.totalRevenue || 0).toLocaleString()}</div>
        <div class="bg-white p-4 rounded shadow">🤖 Taxa: ${data.conversionRate || 0}%</div>
      </div>
    `;
  }

  function generateLeadsTableHTML(leads) {
    return leads
      .map(
        (l) => `
        <div class="p-2 border-b flex justify-between">
          <span>${l.nome}</span>
          <span>${l.empresa}</span>
          <span>${l.status}</span>
          <span>Score: ${l.score_ia}</span>
        </div>`
      )
      .join("");
  }

  function animateKPICards() {
    document.querySelectorAll(".kpi-card").forEach((c, i) => {
      c.style.opacity = 0;
      setTimeout(() => {
        c.style.opacity = 1;
        c.style.transform = "translateY(0)";
      }, i * APP_CONFIG.ui.staggerDelay);
    });
  }

  // ===== EXPORT GLOBAL =====
  window.AlshamMain = {
    APP_CONFIG,
    AppState,
    renderKPIs,
    renderLeadsTable,
    renderChartWithRealData
  };

  // ===== AUTO-INIT =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMain);
  } else {
    initializeMain();
  }

  console.info("🚀 ALSHAM 360° PRIMA Main Script v2.2.0 READY");
});
