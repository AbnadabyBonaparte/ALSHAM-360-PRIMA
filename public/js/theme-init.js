/**
 * ⚡ ALSHAM 360° PRIMA - Theme Initializer v2.0 (CORREÇÃO CRÍTICA)
 * Garante que o site sempre carregue em modo claro
 * 
 * MUDANÇAS v2.0:
 * - Aplica !important nos estilos inline
 * - Força background antes do CSS carregar
 * - Corrige fontSize para 16px
 * - Remove estilos inline APENAS após confirmar CSS
 * 
 * Autor: ALSHAM Design Core Team | 2025
 */

(function initTheme() {
  'use strict';
  
  console.log('⚡ Theme Initializer v2.0 carregando...');
  
  // ========================================
  // 🎨 FORÇAR MODO CLARO (CRÍTICO)
  // ========================================
  
  const htmlElement = document.documentElement;
  const bodyElement = document.body;
  
  // Remove dark mode
  htmlElement.classList.remove('dark');
  if (bodyElement) {
    bodyElement.classList.remove('dark');
  }
  
  // Adiciona light mode explicitamente
  htmlElement.classList.add('light');
  if (bodyElement) {
    bodyElement.classList.add('light');
  }
  
  // Remove atributos
  htmlElement.removeAttribute('data-theme');
  
  // ========================================
  // 💾 SALVAR PREFERÊNCIA
  // ========================================
  
  try {
    localStorage.setItem('theme', 'light');
    localStorage.setItem('alsham-theme', 'light');
    localStorage.removeItem('dark-mode');
    localStorage.removeItem('darkMode');
  } catch (error) {
    console.warn('⚠️ Não foi possível salvar tema:', error);
  }
  
  // ========================================
  // 🎯 APLICAR ESTILOS INLINE (FORÇADO)
  // ========================================
  
  // CRÍTICO: Usar setAttribute para aplicar com !important via style
  const criticalStyles = `
    background-color: #F9FAFB !important;
    color: #111827 !important;
    font-size: 16px !important;
  `;
  
  htmlElement.setAttribute('style', criticalStyles);
  if (bodyElement) {
    bodyElement.setAttribute('style', criticalStyles);
  }
  
  // ========================================
  // 📊 LOG E VERIFICAÇÃO
  // ========================================
  
  console.log('✅ Theme Initializer carregado');
  console.log('📊 Status do tema:');
  console.log('  - Dark mode ativo:', htmlElement.classList.contains('dark'));
  console.log('  - Tema no storage:', localStorage.getItem('alsham-theme'));
  console.log('  - Classes HTML:', htmlElement.className);
  console.log('✅ Modo claro ativo com sucesso');
  
  // ========================================
  // 🔄 OBSERVADOR DE MUDANÇAS
  // ========================================
  
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (htmlElement.classList.contains('dark')) {
          console.warn('⚠️ Tentativa de ativar dark mode BLOQUEADA');
          htmlElement.classList.remove('dark');
          htmlElement.classList.add('light');
          localStorage.setItem('alsham-theme', 'light');
        }
      }
    });
  });
  
  observer.observe(htmlElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // ========================================
  // ✅ VERIFICAR APÓS CSS CARREGAR
  // ========================================
  
  window.addEventListener('load', function() {
    setTimeout(function() {
      const bgColor = window.getComputedStyle(document.body).backgroundColor;
      console.log('🎨 Background após CSS:', bgColor);
      
      // Se o background ainda estiver errado, manter os estilos inline
      if (bgColor === 'rgb(0, 0, 0)' || bgColor === 'rgba(0, 0, 0, 0)') {
        console.warn('⚠️ CSS não aplicou corretamente, mantendo estilos inline');
      } else {
        // Remover estilos inline apenas se o CSS funcionou
        console.log('✅ CSS carregado corretamente, removendo estilos inline');
        htmlElement.removeAttribute('style');
        if (bodyElement) {
          bodyElement.removeAttribute('style');
        }
      }
    }, 500);
  });
  
})();

// ========================================
// 🌐 API GLOBAL
// ========================================

window.AlshamTheme = {
  setLight: function() {
    const html = document.documentElement;
    const body = document.body;
    
    html.classList.remove('dark');
    html.classList.add('light');
    
    if (body) {
      body.classList.remove('dark');
      body.classList.add('light');
    }
    
    localStorage.setItem('alsham-theme', 'light');
    console.log('✅ Modo claro ativado manualmente');
  },
  
  setDark: function() {
    console.warn('⚠️ Dark mode ainda não implementado completamente');
    // Quando implementar, descomentar:
    // document.documentElement.classList.add('dark');
    // localStorage.setItem('alsham-theme', 'dark');
  },
  
  toggle: function() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      this.setLight();
    } else {
      console.warn('⚠️ Dark mode ainda não disponível');
    }
  },
  
  getCurrent: function() {
    return localStorage.getItem('alsham-theme') || 'light';
  },
  
  // NOVA: Forçar correção manual
  forceLight: function() {
    const html = document.documentElement;
    const body = document.body;
    
    html.setAttribute('style', 'background-color: #F9FAFB !important; color: #111827 !important; font-size: 16px !important;');
    if (body) {
      body.setAttribute('style', 'background-color: #F9FAFB !important; color: #111827 !important; font-size: 16px !important;');
    }
    
    console.log('✅ Light mode forçado com !important');
  }
};

console.log('✅ window.AlshamTheme disponível:', Object.keys(window.AlshamTheme));
