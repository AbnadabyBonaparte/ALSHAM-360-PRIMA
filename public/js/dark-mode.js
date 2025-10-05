/**
 * ALSHAM 360° - DARK MODE SYSTEM
 * Sistema completo de modo escuro com persistência
 */

class DarkModeSystem {
  constructor() {
    this.storageKey = 'alsham-dark-mode';
    this.init();
  }

  init() {
    // Carregar preferência salva
    const savedMode = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Aplicar modo (prioriza salvo, depois preferência do sistema)
    const isDark = savedMode ? savedMode === 'dark' : prefersDark;
    this.setMode(isDark, false);
    
    // Listener para mudanças do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.setMode(e.matches, false);
      }
    });
  }

  setMode(isDark, save = true) {
    if (isDark) {
      document.
