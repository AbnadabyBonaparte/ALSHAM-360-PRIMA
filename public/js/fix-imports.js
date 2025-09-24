// fix-imports.js - Correção para problemas de imports
// Adicione este script ANTES dos outros scripts nas suas páginas HTML

// Aguardar AlshamSupabase estar disponível
function waitForAlshamSupabase(callback) {
  if (window.AlshamSupabase && window.AlshamSupabase.supabase) {
    callback();
  } else {
    setTimeout(() => waitForAlshamSupabase(callback), 100);
  }
}

// Disponibilizar funções globalmente para compatibilidade
waitForAlshamSupabase(() => {
  // Extrair funções do AlshamSupabase para o escopo global
  const {
    showAuthNotification,
    getCurrentSession,
    getCurrentOrgId,
    genericSelect,
    genericInsert,
    genericUpdate,
    genericDelete,
    getLeads,
    createLead,
    checkBoutcesses,
    signOut,
    onAuthStateChange
  } = window.AlshamSupabase;

  // Disponibilizar globalmente para arquivos que precisam
  window.showAuthNotification = showAuthNotification;
  window.getCurrentSession = getCurrentSession;
  window.getCurrentOrgId = getCurrentOrgId;
  window.genericSelect = genericSelect;
  window.genericInsert = genericInsert;
  window.genericUpdate = genericUpdate;
  window.genericDelete = genericDelete;
  window.getLeads = getLeads;
  window.createLead = createLead;
  window.checkBoutcesses = checkBoutcesses;
  window.signOut = signOut;
  window.onAuthStateChange = onAuthStateChange;

  // Função checkRouteAccess que estava faltando
  window.checkRouteAccess = function(route) {
    console.log(`🛡️ Verificando acesso à rota: ${route}`);
    // Por enquanto, permitir acesso a todas as rotas
    // Implementar lógica de autorização conforme necessário
    return true;
  };

  // Chart.js fix
  if (window.Chart) {
    window.ChartJS = window.Chart;
  }

  console.log('🔧 Fix-imports aplicado com sucesso!');
  console.log('🔧 Funções disponíveis globalmente:', [
    'showAuthNotification', 'getCurrentSession', 'getCurrentOrgId',
    'genericSelect', 'genericInsert', 'genericUpdate', 'genericDelete',
    'getLeads', 'createLead', 'checkBoutcesses', 'signOut', 'onAuthStateChange',
    'checkRouteAccess'
  ]);
});

// Função utilitária para aguardar dependências
window.waitFor = function(condition, callback, timeout = 5000) {
  const startTime = Date.now();
  
  function check() {
    if (condition()) {
      callback();
    } else if (Date.now() - startTime < timeout) {
      setTimeout(check, 100);
    } else {
      console.error('⚠️ Timeout aguardando condição:', condition.toString());
    }
  }
  
  check();
};
