/**
 * ALSHAM 360° PRIMA - Sistema de Navegação Enterprise V2.1
 * Integração com auth.js (v5.2) + fix-imports.js (v2.2)
 *
 * @version 2.1.0 - NASA 10/10 FINAL PRODUCTION
 * @author
 *   ALSHAM Development Team
 *
 * ✅ FUNCIONALIDADES:
 * - Navegação entre páginas com verificação de rota
 * - Integração com AlshamAuth.initializeAuth()
 * - Redirecionamento seguro (login/register públicos)
 * - Menu mobile responsivo (Esc + clique fora)
 * - Eventos globais: navigation-ready + navigation-change
 */

import { AlshamAuth, checkRouteAccess, initializeAuth } from "/js/auth.js";

// ===== CONFIGURAÇÃO DE ROTAS =====
const ROUTES = Object.freeze({
  dashboard: "/index.html",
  leads: "/leads-real.html",
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

// ===== AGUARDAR DEPENDÊNCIAS =====
function waitForDependencies(callback) {
  if (window.AlshamAuth?.checkRouteAccess) {
    console.log("✅ Auth + Fix-imports carregados, iniciando navegação");
    callback();
  } else {
    console.log("⏳ Aguardando auth/fix-imports...");
    window.addEventListener("fix-imports-ready", () => callback());
    setTimeout(() => {
      console.warn("⚠️ Timeout aguardando auth, inicializando mesmo assim");
      callback();
    }, 5000);
  }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  waitForDependencies(async () => {
    try {
      await initializeAuth();
      initializeNavigation();
      console.log("✅ Navigation System v2.1 inicializado");
    } catch (err) {
      console.error("❌ Erro na inicialização da navegação:", err);
    }
  });
});

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

  // Login e registro são públicos
  if (
    !navigationState.isAuthenticated &&
    !["login", "register"].includes(navigationState.currentPage)
  ) {
    console.warn("⚠️ Usuário não autenticado → login");
    window.location.href = ROUTES.login;
    return false;
  }

  // Verificar acesso
  if (!checkRouteAccess(navigationState.currentPage)) {
    console.warn("🚫 Acesso negado à rota:", navigationState.currentPage);
    showAuthNotification?.("Acesso negado", "error");
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
  navigationState.mobileMenuOpen =
    force ?? !navigationState.mobileMenuOpen;
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
    userName.textContent =
      AlshamAuth.currentUser.email || AlshamAuth.currentUser.id;
  }
}
function updatePageTitle() {
  document.title = `ALSHAM 360° PRIMA - ${navigationState.currentPage}`;
}

// ===== EXPORT =====
export { initializeNavigation, navigationState, ROUTES };
