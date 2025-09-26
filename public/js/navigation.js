/**
 * ALSHAM 360° PRIMA - Sistema de Navegação Otimizado V2.0
 * Navegação integrada com auth.js (v5.2) e fix-imports.js
 *
 * @version 2.0.1 - NASA 10/10 FINAL BUILD
 * @author ALSHAM
 *
 * ✅ FUNCIONALIDADES:
 * - Navegação entre páginas
 * - Verificação de acesso via AlshamAuth
 * - Exceção para rotas públicas (login/register)
 * - Menu mobile responsivo
 * - Eventos globais: navigation-ready
 */

import { AlshamAuth, checkRouteAccess } from "/js/auth.js";

// ===== CONFIGURAÇÃO DE ROTAS =====
const ROUTES = {
  dashboard: "/index.html",
  leads: "/leads-real.html",
  automacoes: "/automacoes.html",
  relatorios: "/relatorios.html",
  gamificacao: "/gamificacao.html",
  configuracoes: "/configuracoes.html",
  login: "/login.html",
  register: "/register.html"
};

// ===== ESTADO DA NAVEGAÇÃO =====
const navigationState = {
  currentPage: null,
  isAuthenticated: false,
  isInitialized: false,
  mobileMenuOpen: false
};

// ===== AGUARDAR DEPENDÊNCIAS =====
function waitForFixImports(callback) {
  if (window.AlshamAuth?.checkRouteAccess) {
    console.log("✅ Fix-imports + Auth já carregados, inicializando navegação");
    callback();
  } else {
    console.log("⏳ Aguardando fix-imports/auth...");
    window.addEventListener("fix-imports-ready", () => {
      console.log("✅ Fix-imports pronto, inicializando navegação");
      callback();
    });
    setTimeout(() => {
      console.log("⚠️ Timeout aguardando fix-imports, inicializando mesmo assim");
      callback();
    }, 3000);
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  waitForFixImports(() => {
    try {
      initializeNavigation();
      console.log("✅ Sistema de navegação inicializado");
    } catch (error) {
      console.error("❌ Erro ao inicializar navegação:", error);
    }
  });
});

function initializeNavigation() {
  detectCurrentPage();
  checkAuthentication();
  setupMobileMenu();
  setupEventListeners();
  updateNavigationState();
  navigationState.isInitialized = true;

  window.dispatchEvent(
    new CustomEvent("navigation-ready", {
      detail: { currentPage: navigationState.currentPage }
    })
  );
}

// ===== DETECÇÃO DE PÁGINA =====
function detectCurrentPage() {
  const currentPath = window.location.pathname;
  if (currentPath.includes("leads-real")) {
    navigationState.currentPage = "leads";
  } else if (currentPath.includes("automacoes")) {
    navigationState.currentPage = "automacoes";
  } else if (currentPath.includes("relatorios")) {
    navigationState.currentPage = "relatorios";
  } else if (currentPath.includes("gamificacao")) {
    navigationState.currentPage = "gamificacao";
  } else if (currentPath.includes("configuracoes")) {
    navigationState.currentPage = "configuracoes";
  } else if (currentPath.includes("login")) {
    navigationState.currentPage = "login";
  } else if (currentPath.includes("register")) {
    navigationState.currentPage = "register";
  } else {
    navigationState.currentPage = "dashboard";
  }
  console.log("📍 Página atual detectada:", navigationState.currentPage);
  updatePageTitle();
}

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
function checkAuthentication() {
  navigationState.isAuthenticated = AlshamAuth.isAuthenticated;

  // Exceção: login e registro são públicos
  if (!navigationState.isAuthenticated && !["login", "register"].includes(navigationState.currentPage)) {
    console.warn("⚠️ Usuário não autenticado. Redirecionando para login...");
    window.location.href = ROUTES.login;
    return false;
  }

  // Verifica acesso da rota atual
  if (!checkRouteAccess(navigationState.currentPage)) {
    console.warn("🚫 Acesso negado à rota:", navigationState.currentPage);
    window.location.href = ROUTES.dashboard;
    return false;
  }

  console.log("✅ Acesso liberado à rota:", navigationState.currentPage);
  return true;
}

// ===== MENU MOBILE =====
function setupMobileMenu() {
  const menuBtn = document.querySelector("#menu-toggle");
  const menu = document.querySelector("#mobile-menu");
  if (!menuBtn || !menu) return;

  menuBtn.addEventListener("click", () => {
    navigationState.mobileMenuOpen = !navigationState.mobileMenuOpen;
    menu.classList.toggle("hidden", !navigationState.mobileMenuOpen);
    menuBtn.setAttribute("aria-expanded", navigationState.mobileMenuOpen);
  });
}

// ===== LISTENERS =====
function setupEventListeners() {
  const navLinks = document.querySelectorAll("[data-route]");
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const route = link.getAttribute("data-route");
      if (ROUTES[route]) {
        window.location.href = ROUTES[route];
      }
    });
  });
}

// ===== UI =====
function updateNavigationState() {
  const userName = document.getElementById("user-name");
  if (userName && AlshamAuth.currentUser) {
    userName.textContent = AlshamAuth.currentUser.email;
  }
}

function updatePageTitle() {
  document.title = `ALSHAM 360° PRIMA - ${navigationState.currentPage}`;
}

// ===== EXPORT =====
export { initializeNavigation, navigationState };
