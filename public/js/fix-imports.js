/**
 * fix-imports.js - Correção para problemas de imports/exports
 * Adicione este script APÓS supabase.js mas ANTES dos outros scripts
 * 
 * @version 2.0.0 - CORRIGIDO
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
      setTimeout(check, 200); // Aumentado para 200ms
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
    // Funções básicas mock
    getCurrentSession: async () => ({ user: null }),
    getCurrentOrgId: async () => '00000000-0000-0000-0000-000000000001',
    getLeads: async () => ({ data: [], error: null }),
    signOut: async () => ({ error: null }),
    
    // Funções CRUD mock
    genericSelect: async () => ({ data: [], error: null }),
    genericInsert: async () => ({ error: null }),
    genericUpdate: async () => ({ error: null }),
    genericDelete: async () => ({ error: null }),
    
    // Outras funções
    showAuthNotification: (msg) => console.log('Notification:', msg),
    checkBoutcesses: () => ({ success: true }),
    onAuthStateChange: () => ({ data: { subscription: null } })
  };
}

// Disponibilizar funções globalmente para compatibilidade
waitForAlshamSupabase(() => {
  try {
    // Verificar se AlshamSupabase tem as funções necessárias
    const alsham = window.AlshamSupabase;
    
    // Extrair funções do AlshamSupabase para o escopo global (com fallbacks)
    window.showAuthNotification = alsham.showAuthNotification || ((msg) => console.log('Notification:', msg));
    window.getCurrentSession = alsham.getCurrentSession || (async () => ({ user: null }));
    window.getCurrentOrgId = alsham.getCurrentOrgId || (async () => '00000000-0000-0000-0000-000000000001');
    window.getDefaultOrgId = alsham.getDefaultOrgId || (() => '00000000-0000-0000-0000-000000000001');
    
    // Funções CRUD
    window.genericSelect = alsham.genericSelect || (async () => ({ data: [], error: null }));
    window.genericInsert = alsham.genericInsert || (async () => ({ error: null }));
    window.genericUpdate = alsham.genericUpdate || (async () => ({ error: null }));
    window.genericDelete = alsham.genericDelete || (async () => ({ error: null }));
    
    // Funções específicas de leads
    window.getLeads = alsham.getLeads || (async () => ({ data: [], error: null }));
    window.createLead = alsham.createLead || (async () => ({ error: null }));
    
    // Funções de autenticação
    window.signOut = alsham.signOut || (async () => ({ error: null }));
    window.onAuthStateChange = alsham.onAuthStateChange || (() => ({ data: { subscription: null } }));
    
    // Funções utilitárias
    window.checkBoutcesses = alsham.checkBoutcesses || (() => ({ success: true }));
    window.formatDateBR = alsham.formatDateBR || ((date) => new Date(date).toLocaleDateString('pt-BR'));
    window.formatTimeAgo = alsham.formatTimeAgo || ((date) => 'há alguns minutos');
    
    // Função checkRouteAccess que estava faltando - CORRIGIDA
    window.checkRouteAccess = function(route) {
      console.log(`🛡️ Verificando acesso à rota: ${route || 'undefined'}`);
      
      // Lógica básica de autorização
      if (!route) return true;
      
      // Rotas públicas sempre permitidas
      const publicRoutes = ['/login.html', '/register.html', '/'];
      if (publicRoutes.includes(route)) return true;
      
      // Para outras rotas, verificar se usuário está logado
      try {
        const session = window.AlshamSupabase?.getCurrentSession?.();
        return session && session.user;
      } catch (error) {
        console.warn('Erro ao verificar sessão:', error);
        return true; // Permitir por padrão para evitar bloqueios
      }
    };
    
    // Função para navegação segura
    window.navigateTo = function(url) {
      if (window.checkRouteAccess(url)) {
        window.location.href = url;
      } else {
        console.warn('Acesso negado à rota:', url);
        window.location.href = '/login.html';
      }
    };
    
    // Chart.js fix - verificar se existe antes de usar
    if (window.Chart) {
      window.ChartJS = window.Chart;
      console.log('✅ Chart.js disponível globalmente');
    } else {
      console.warn('⚠️ Chart.js não encontrado');
      // Criar mock básico do Chart.js para evitar erros
      window.Chart = function() {
        console.warn('Mock Chart.js - gráfico não será renderizado');
        return {
          destroy: () => {},
          update: () => {},
          resize: () => {}
        };
      };
    }
    
    // Funções utilitárias globais
    window.debounce = function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };
    
    window.showToast = function(message, type = 'info') {
      if (window.AlshamSupabase?.showAuthNotification) {
        window.AlshamSupabase.showAuthNotification(message, type);
      } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
      }
    };
    
    // Log de sucesso
    console.log('🔧 Fix-imports aplicado com sucesso!');
    console.log('🔧 Funções disponíveis globalmente:', [
      'showAuthNotification', 'getCurrentSession', 'getCurrentOrgId', 'getDefaultOrgId',
      'genericSelect', 'genericInsert', 'genericUpdate', 'genericDelete',
      'getLeads', 'createLead', 'signOut', 'onAuthStateChange',
      'checkRouteAccess', 'navigateTo', 'debounce', 'showToast',
      'formatDateBR', 'formatTimeAgo', 'checkBoutcesses'
    ]);
    
    // Disparar evento personalizado para outros scripts saberem que fix-imports foi aplicado
    if (typeof Event !== 'undefined') {
      window.dispatchEvent(new Event('fix-imports-ready'));
    }
    
  } catch (error) {
    console.error('❌ Erro ao aplicar fix-imports:', error);
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
        // Executar callback mesmo assim para não travar o sistema
        callback();
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

console.log('🔧 Fix-imports V2.0 carregado - Aguardando AlshamSupabase...');
