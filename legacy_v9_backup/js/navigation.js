/**
 * ALSHAM 360° PRIMA - Sistema de Navegação Enterprise V2.3
 * CORRIGIDO: Estrutura alinhada com repositório + Pipeline adicionado
 * Data: 01/10/2025
 */

// Aguarda Supabase e Auth estarem disponíveis
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamAuth) {
    console.log("✅ Supabase e Auth carregados para Navigation");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase/Auth não carregaram após", maxAttempts * 100, "ms");
    callback();
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

// Aguarda antes de executar
waitForSupabase(() => {
  const AlshamAuth = window.AlshamAuth || {};
  const checkRouteAccess = window.checkRouteAccess || (() => true);
  const initializeAuth = AlshamAuth.initializeAuth || (async () => {});
  const showAuthNotification = window.showAuthNotification || ((msg) => console.log(msg));

  // ===== CONFIGURAÇÃO DE ROTAS =====
  const ROUTES = Object.freeze({
    dashboard: "/index.html",
    leads: "/leads-real.html",
    pipeline: "/pipeline.html",
    automacoes: "/automacoes.html",
    relatorios: "/relatorios.html",
    gamificacao: "/gamificacao.html",
    configuracoes: "/configuracoes.html",
    login: "/login.html",
    register: "/register.html",
  });

  // ===== ESTADO =====
  const navigationState = {
    currentPage: null,
    isAuthenticated: false,
    isInitialized: false,
    mobileMenuOpen: false,
  };

  // ===== INIT =====
  async function initNavigation() {
    try {
      await initializeAuth();
      initializeNavigation();
      console.log("✅ Navigation System v2.3 inicializado");
    } catch (err) {
      console.error("❌ Erro na inicialização da navegação:", err);
    }
  }

  function initializeNavigation() {
    detectCurrentPage();
    if (!checkAuthentication()) return;

    setupMobileMenu();
    setupEventListeners();
    updateNavigationState();

    navigationState.isInitialized = true;
    window.dispatchEvent(new CustomEvent("navigation-ready", {
      detail: { currentPage: navigationState.currentPage },
    }));
  }

  // ===== DETECTA PÁGINA =====
  function detectCurrentPage() {
    const currentPath = window.location.pathname;
    navigationState.currentPage =
      Object.keys(ROUTES).find((key) =>
        currentPath.includes(key.replace("dashboard", "index"))
      ) || "dashboard";

    console.log("📍 Página atual:", navigationState.currentPage);
    updatePageTitle();
  }

  // ===== AUTH =====
  function checkAuthentication() {
    navigationState.isAuthenticated = AlshamAuth.isAuthenticated;

    if (
      !navigationState.isAuthenticated &&
      !["login", "register"].includes(navigationState.currentPage)
    ) {
      console.warn("⚠️ Usuário não autenticado, redirecionando para login");
      window.location.href = ROUTES.login;
      return false;
    }

    if (!checkRouteAccess(navigationState.currentPage)) {
      console.warn("🚫 Acesso negado à rota:", navigationState.currentPage);
      showAuthNotification("Acesso negado a esta página", "error");
      window.location.href = ROUTES.dashboard;
      return false;
    }

    console.log("✅ Acesso liberado:", navigationState.currentPage);
    return true;
  }

  // ===== MENU MOBILE =====
  function setupMobileMenu() {
    const menuBtn = document.querySelector("#menu-toggle");
    const menu = document.querySelector("#mobile-menu");
    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", () => toggleMobileMenu(menu, menuBtn));
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navigationState.mobileMenuOpen) {
        toggleMobileMenu(menu, menuBtn, false);
      }
    });
    
    document.addEventListener("click", (e) => {
      if (
        navigationState.mobileMenuOpen &&
        !menu.contains(e.target) &&
        !menuBtn.contains(e.target)
      ) {
        toggleMobileMenu(menu, menuBtn, false);
      }
    });
  }

  function toggleMobileMenu(menu, btn, force) {
    navigationState.mobileMenuOpen = force ?? !navigationState.mobileMenuOpen;
    menu.classList.toggle("hidden", !navigationState.mobileMenuOpen);
    btn.setAttribute("aria-expanded", navigationState.mobileMenuOpen);
  }

  // ===== EVENTOS =====
  function setupEventListeners() {
    const navLinks = document.querySelectorAll("[data-route]");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const route = link.getAttribute("data-route");
        if (ROUTES[route]) {
          window.location.href = ROUTES[route];
          window.dispatchEvent(new CustomEvent("navigation-change", {
            detail: { from: navigationState.currentPage, to: route },
          }));
        }
      });
    });
  }

  // ===== UI =====
  function updateNavigationState() {
    const userName = document.getElementById("user-name");
    if (userName && AlshamAuth.currentUser) {
      userName.textContent = AlshamAuth.currentUser.email || AlshamAuth.currentUser.id;
    }
  }

  function updatePageTitle() {
    const pageNames = {
      dashboard: "Dashboard",
      leads: "Leads",
      pipeline: "Pipeline de Vendas",
      automacoes: "Automações",
      relatorios: "Relatórios",
      gamificacao: "Gamificação",
      configuracoes: "Configurações",
    };
    
    const pageName = pageNames[navigationState.currentPage] || "Dashboard";
    document.title = `ALSHAM 360° PRIMA - ${pageName}`;
  }

  // ===== EXPORT GLOBAL =====
  window.navigationSystem = {
    initializeNavigation,
    navigationState,
    ROUTES,
  };

  // ===== AUTO-INIT =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigation);
  } else {
    initNavigation();
  }

  console.log("🧭 Navigation System v2.3 carregado com Pipeline");
});
