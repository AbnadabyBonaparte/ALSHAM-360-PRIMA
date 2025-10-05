/**
 * ALSHAM 360° - DARK MODE SYSTEM
 * Sistema completo e reutilizável para todas as páginas
 */

class DarkModeManager {
  constructor() {
    this.storageKey = 'alsham-theme';
    this.htmlElement = document.documentElement;
    this.init();
  }

  init() {
    // Aplicar tema antes da renderização para evitar flash
    const savedTheme = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.applyTheme(isDark, false);
    
    // Listener para mudanças no sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.applyTheme(e.matches, false);
      }
    });
    
    // Setup toggle button quando DOM carregar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupToggle());
    } else {
      this.setupToggle();
    }
  }

  applyTheme(isDark, notify = true) {
    if (isDark) {
      this.htmlElement.classList.add('dark');
      this.htmlElement.setAttribute('data-theme', 'dark');
    } else {
      this.htmlElement.classList.remove('dark');
      this.htmlElement.setAttribute('data-theme', 'light');
    }
    
    // Recarregar gráficos Chart.js se existirem
    if (window.dashboardCharts?.reload) {
      window.dashboardCharts.reload();
    }
    
    // Notificar mudança
    if (notify && window.notify) {
      window.notify.success(
        isDark ? '🌙 Tema escuro ativado' : '☀️ Tema claro ativado',
        { duration: 2000 }
      );
    }
    
    // Dispatch evento customizado
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { isDark } 
    }));
  }

  toggle() {
    const isDark = !this.htmlElement.classList.contains('dark');
    localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  setupToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  isDark() {
    return this.htmlElement.classList.contains('dark');
  }

  setDark() {
    localStorage.setItem(this.storageKey, 'dark');
    this.applyTheme(true);
  }

  setLight() {
    localStorage.setItem(this.storageKey, 'light');
    this.applyTheme(false);
  }
}

// Instância global
window.DarkMode = new DarkModeManager();

export default DarkModeManager;
