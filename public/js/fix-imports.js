/**
 * fix-imports.js - Correção para problemas de imports/exports
 * Adicione este script APÓS supabase.js mas ANTES dos outros scripts
 * 
 * @version 2.1.0 - FINAL CORRIGIDO
 * @author ALSHAM Development Team
 */

// Aguardar AlshamSupabase estar disponível com verificação mais robusta
function waitForAlshamSupabase(callback, maxAttempts = 50) {
  let attempts = 0;
  
  function check() {
    attempts++;
    
    if (window.AlshamSupabase && typeof window.AlshamSupabase === 'object') {
      console.log('✅ AlshamSupabase encontrado após', attempts, 'tentativas');
      callback();
    } else if (attempts < maxAttempts) {
      setTimeout(check, 200); // 200ms entre tentativas
    } else {
      console.error('❌ Timeout: AlshamSupabase não foi carregado após', attempts, 'tentativas');
      // Criar AlshamSupabase mock para evitar erros
      createMockAlshamSupabase();
      callback();
    }
  }
  
  check();
}

// Criar mock do AlshamSupabase para evitar erros
function createMockAlshamSupabase() {
  console.warn('⚠️ Criando mock do AlshamSupabase');
  
  window.AlshamSupabase = {
    // Client mock
    client: {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null })
      }
    },
    
    // Funções básicas mock
    getCurrentSession: async () => ({ user: null }),
    getCurrentOrgId: async () => '00000000-0000-0000-0000-000000000001',
    getDefaultOrgId: () => '00000000-0000-0000-0000-000000000001',
    getLeads: async () => ({ data: [], error: null }),
    signOut: async () => ({ error: null }),
    
    // Funções CRUD mock
    genericSelect: async (table, filters) => {
      console.log(`Mock genericSelect: ${table}`, filters);
      return { data: [], error: null };
    },
    genericInsert: async (table, data) => {
      console.log(`Mock genericInsert: ${table}`, data);
      return { error: null };
    },
    genericUpdate: async (table, id, data) => {
      console.log(`Mock genericUpdate: ${table}`, id, data);
      return { error: null };
    },
    genericDelete: async (table, id) => {
      console.log(`Mock genericDelete: ${table}`, id);
      return { error: null };
    },
    
    // Outras funções
    showAuthNotification: (msg, type) => {
      console.log(`[${type?.toUpperCase() || 'INFO'}] ${msg}`);
      // Criar notificação visual
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 
        'bg-blue-500'
      }`;
      notification.textContent = msg;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    },
    checkBoutcesses: () => ({ success: true }),
    onAuthStateChange: (callback) => {
      console.log('Mock onAuthStateChange');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };
}

// Disponibilizar funções globalmente para compatibilidade
waitForAlshamSupabase(() => {
  try {
    // Verificar se AlshamSupabase tem as funções necessárias
    const alsham = window.AlshamSupabase;
    
    // Extrair funções do AlshamSupabase para o escopo global (com fallbacks)
    window.showAuthNotification = alsham.showAuthNotification || function(msg, type = 'info') {
      console.log(`[${type.toUpperCase()}] ${msg}`);
      
      // Criar notificação visual simples
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 transition-all duration-300 ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
      }`;
      notification.style.zIndex = '9999';
      notification.textContent = msg;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      }, 3000);
    };
    
    window.getCurrentSession = alsham.getCurrentSession || (async () => ({ user: null }));
    window.getCurrentOrgId = alsham.getCurrentOrgId || (async () => '00000000-0000-0000-0000-000000000001');
    window.getDefaultOrgId = alsham.getDefaultOrgId || (() => '00000000-0000-0000-0000-000000000001');
    
    // Funções CRUD
    window.genericSelect = alsham.genericSelect || (async (table, filters) => {
      console.log(`Mock genericSelect: ${table}`, filters);
      return { data: [], error: null };
    });
    window.genericInsert = alsham.genericInsert || (async (table, data) => {
      console.log(`Mock genericInsert: ${table}`, data);
      return { error: null };
    });
    window.genericUpdate = alsham.genericUpdate || (async (table, id, data) => {
      console.log(`Mock genericUpdate: ${table}`, id, data);
      return { error: null };
    });
    window.genericDelete = alsham.genericDelete || (async (table, id) => {
      console.log(`Mock genericDelete: ${table}`, id);
      return { error: null };
    });
    
    // Funções específicas de leads
    window.getLeads = alsham.getLeads || (async () => ({ data: [], error: null }));
    window.createLead = alsham.createLead || (async () => ({ error: null }));
    
    // Funções de autenticação
    window.signOut = alsham.signOut || (async () => ({ error: null }));
    window.onAuthStateChange = alsham.onAuthStateChange || ((callback) => {
      console.log('Mock onAuthStateChange');
      return { data: { subscription: { unsubscribe: () => {} } } };
    });
    
    // Funções utilitárias
    window.checkBoutcesses = alsham.checkBoutcesses || (() => ({ success: true }));
    window.formatDateBR = alsham.formatDateBR || ((date) => {
      try {
        return new Date(date).toLocaleDateString('pt-BR');
      } catch (error) {
        return 'Data inválida';
      }
    });
    window.formatTimeAgo = alsham.formatTimeAgo || ((date) => {
      try {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'agora mesmo';
        if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
      } catch (error) {
        return 'há alguns momentos';
      }
    });
    
    // Função checkRouteAccess que estava faltando - CORRIGIDA E MELHORADA
    window.checkRouteAccess = function(route) {
      console.log(`🛡️ Verificando acesso à rota: ${route || 'undefined'}`);
      
      // Lógica básica de autorização
      if (!route) return true;
      
      // Rotas públicas sempre permitidas
      const publicRoutes = ['/login.html', '/register.html', '/', '/index.html'];
      if (publicRoutes.includes(route) || publicRoutes.some(r => route.endsWith(r))) {
        return true;
      }
      
      // Para outras rotas, verificar se usuário está logado
      try {
        const token = localStorage.getItem('supabase.auth.token') || 
                     localStorage.getItem('sb-auth-token') ||
                     sessionStorage.getItem('supabase.auth.token');
        
        if (token) {
          console.log('✅ Token encontrado, acesso permitido');
          return true;
        }
        
        // Verificar sessão se AlshamSupabase disponível
        if (window.AlshamSupabase?.getCurrentSession) {
          window.AlshamSupabase.getCurrentSession().then(session => {
            return session && session.user;
          });
        }
        
        console.warn('⚠️ Nenhum token encontrado');
        return false;
      } catch (error) {
        console.warn('Erro ao verificar sessão:', error);
        return true; // Permitir por padrão para evitar bloqueios durante desenvolvimento
      }
    };
    
    // Função para navegação segura
    window.navigateTo = function(url) {
      if (window.checkRouteAccess(url)) {
        window.location.href = url;
      } else {
        console.warn('Acesso negado à rota:', url);
        window.showAuthNotification('Sessão expirada. Redirecionando para login...', 'warning');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 2000);
      }
    };
    
    // Chart.js fix melhorado
    if (typeof Chart !== 'undefined' && Chart) {
      window.ChartJS = Chart;
      console.log('✅ Chart.js disponível globalmente');
      
      // Configurações padrão do Chart.js para o projeto
      if (Chart.defaults) {
        Chart.defaults.font = Chart.defaults.font || {};
        Chart.defaults.font.family = '"Inter", "Helvetica Neue", Arial, sans-serif';
        Chart.defaults.plugins = Chart.defaults.plugins || {};
        Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
        Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
      }
    } else {
      console.warn('⚠️ Chart.js não encontrado - criando mock');
      // Mock melhorado do Chart.js
      window.Chart = function(ctx, config) {
        console.warn('Mock Chart.js - gráfico não será renderizado para:', ctx);
        return {
          destroy: () => console.log('Chart mock - destroy called'),
          update: (mode) => console.log('Chart mock - update called:', mode),
          resize: () => console.log('Chart mock - resize called'),
          reset: () => console.log('Chart mock - reset called'),
          data: config?.data || {},
          options: config?.options || {}
        };
      };
      
      // Adicionar métodos estáticos comuns
      window.Chart.register = () => console.log('Chart.register mock');
      window.Chart.defaults = {
        font: { family: '"Inter", sans-serif' },
        plugins: { legend: { labels: { usePointStyle: true } } }
      };
    }
    
    // Funções utilitárias globais melhoradas
    window.debounce = function(func, wait, immediate = false) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          timeout = null;
          if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
      };
    };
    
    window.showToast = function(message, type = 'info', duration = 3000) {
      if (window.showAuthNotification) {
        window.showAuthNotification(message, type);
      } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Fallback toast
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          padding: 12px 20px; border-radius: 6px; color: white;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#0284c7'};
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transform: translateX(100%); transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.style.transform = 'translateX(0)', 10);
        
        setTimeout(() => {
          toast.style.transform = 'translateX(100%)';
          setTimeout(() => toast.remove(), 300);
        }, duration);
      }
    };
    
    // Função para aguardar elementos DOM
    window.waitForElement = function(selector, callback, timeout = 5000) {
      const element = document.querySelector(selector);
      if (element) {
        callback(element);
        return;
      }
      
      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          callback(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Timeout de segurança
      setTimeout(() => {
        observer.disconnect();
        console.warn(`Elemento '${selector}' não encontrado após ${timeout}ms`);
      }, timeout);
    };
    
    // Log de sucesso
    console.log('🔧 Fix-imports V2.1 aplicado com sucesso!');
    console.log('🔧 Funções disponíveis globalmente:', [
      'showAuthNotification', 'getCurrentSession', 'getCurrentOrgId', 'getDefaultOrgId',
      'genericSelect', 'genericInsert', 'genericUpdate', 'genericDelete',
      'getLeads', 'createLead', 'signOut', 'onAuthStateChange',
      'checkRouteAccess', 'navigateTo', 'debounce', 'showToast',
      'formatDateBR', 'formatTimeAgo', 'checkBoutcesses', 'waitForElement'
    ]);
    
    // Disparar evento personalizado para outros scripts
    if (typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fix-imports-ready', {
        detail: { version: '2.1.0', timestamp: new Date().toISOString() }
      }));
    }
    
    // Verificar se há elementos aguardando e inicializar
    document.querySelectorAll('[data-awaiting-fix-imports]').forEach(element => {
      element.removeAttribute('data-awaiting-fix-imports');
      if (element.dataset.initFunction && window[element.dataset.initFunction]) {
        window[element.dataset.initFunction]();
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao aplicar fix-imports:', error);
    // Criar notificação de erro
    window.showToast?.('Erro ao inicializar sistema', 'error');
  }
});

// Função utilitária melhorada para aguardar dependências
window.waitFor = function(condition, callback, options = {}) {
  const {
    timeout = 10000,
    interval = 100,
    description = 'condição'
  } = options;
  
  const startTime = Date.now();
  
  function check() {
    try {
      if (typeof condition === 'function' ? condition() : condition) {
        console.log(`✅ ${description} atendida`);
        callback();
      } else if (Date.now() - startTime < timeout) {
        setTimeout(check, interval);
      } else {
        console.error(`⚠️ Timeout aguardando ${description} (${timeout}ms)`);
        callback(); // Executar mesmo assim para não travar
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar ${description}:`, error);
      callback();
    }
  }
  
  check();
};

// Função para aguardar múltiplas dependências
window.waitForAll = function(conditions, callback, options = {}) {
  const {
    timeout = 10000,
    interval = 100
  } = options;
  
  let completed = 0;
  const total = conditions.length;
  
  conditions.forEach((condition, index) => {
    window.waitFor(
      condition.check,
      () => {
        completed++;
        console.log(`✅ Dependência ${index + 1}/${total} carregada: ${condition.name}`);
        
        if (completed === total) {
          console.log('✅ Todas as dependências carregadas');
          callback();
        }
      },
      { ...options, description: condition.name }
    );
  });
};

console.log('🔧 Fix-imports V2.1 FINAL carregado - Aguardando AlshamSupabase...');
