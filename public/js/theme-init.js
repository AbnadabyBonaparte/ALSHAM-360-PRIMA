/**
 * ⚡ ALSHAM 360° PRIMA - Theme Initializer v1.0
 * Garante que o site sempre carregue em modo claro por padrão
 * 
 * Funcionalidades:
 * - Remove classe 'dark' do HTML
 * - Define tema 'light' no localStorage
 * - Previne flash de conteúdo não estilizado (FOUC)
 * - Log de inicialização
 * 
 * Autor: ALSHAM Design Core Team | 2025
 */

(function initTheme() {
  'use strict';
  
  // ========================================
  // 🎨 FORÇAR MODO CLARO
  // ========================================
  
  // Remove dark mode do elemento HTML
  const htmlElement = document.documentElement;
  htmlElement.classList.remove('dark');
  
  // Remove também do body (caso exista)
  if (document.body) {
    document.body.classList.remove('dark');
  }
  
  // Remove o atributo data-theme
  htmlElement.removeAttribute('data-theme');
  
  // ========================================
  // 💾 SALVAR PREFERÊNCIA
  // ========================================
  
  try {
    // Define tema claro no localStorage
    localStorage.setItem('theme', 'light');
    localStorage.setItem('alsham-theme', 'light');
    
    // Remove qualquer preferência de dark mode
    localStorage.removeItem('dark-mode');
    localStorage.removeItem('darkMode');
  } catch (error) {
    console.warn('⚠️ Não foi possível salvar tema no localStorage:', error);
  }
  
  // ========================================
  // 🎯 PREVENIR DETECÇÃO AUTOMÁTICA
  // ========================================
  
  // Adiciona meta tag para forçar color-scheme light
  const metaColorScheme = document.createElement('meta');
  metaColorScheme.name = 'color-scheme';
  metaColorScheme.content = 'light';
  
  // Insere no head se ainda não existir
  if (!document.querySelector('meta[name="color-scheme"]')) {
    document.head.appendChild(metaColorScheme);
  }
  
  // ========================================
  // 📊 LOG E VERIFICAÇÃO
  // ========================================
  
  const isDark = htmlElement.classList.contains('dark');
  const storedTheme = localStorage.getItem('theme');
  
  console.log('✅ Theme Initializer carregado');
  console.log('📊 Status do tema:');
  console.log('  - Dark mode ativo:', isDark);
  console.log('  - Tema no storage:', storedTheme);
  console.log('  - Classes HTML:', htmlElement.className || 'nenhuma');
  
  if (isDark) {
    console.warn('⚠️ AVISO: Dark mode ainda está ativo!');
  } else {
    console.log('✅ Modo claro ativo com sucesso');
  }
  
  // ========================================
  // 🔄 OBSERVADOR DE MUDANÇAS
  // ========================================
  
  // Observa se alguém tenta adicionar dark mode novamente
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (htmlElement.classList.contains('dark')) {
          console.warn('⚠️ Tentativa de ativar dark mode bloqueada');
          htmlElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }
    });
  });
  
  // Inicia observação
  observer.observe(htmlElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // ========================================
  // 🎨 APLICAR ESTILOS INLINE (fallback)
  // ========================================
  
  // Garante background claro mesmo antes do CSS carregar
  htmlElement.style.backgroundColor = '#F9FAFB';
  htmlElement.style.color = '#111827';
  
  // Remove estilos inline após CSS carregar
  window.addEventListener('load', function() {
    setTimeout(function() {
      htmlElement.style.backgroundColor = '';
      htmlElement.style.color = '';
    }, 100);
  });
  
})();

// ========================================
// 🌐 EXPORTAR FUNÇÕES (opcional)
// ========================================

window.AlshamTheme = {
  /**
   * Força modo claro
   */
  setLight: function() {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    console.log('✅ Modo claro ativado manualmente');
  },
  
  /**
   * Força modo escuro (se necessário no futuro)
   */
  setDark: function() {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    console.log('🌙 Modo escuro ativado manualmente');
  },
  
  /**
   * Alterna entre modos
   */
  toggle: function() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      this.setLight();
    } else {
      this.setDark();
    }
  },
  
  /**
   * Obtém tema atual
   */
  getCurrent: function() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
};

console.log('✅ window.AlshamTheme disponível:', Object.keys(window.AlshamTheme));
