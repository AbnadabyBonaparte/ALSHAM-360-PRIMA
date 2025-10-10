/**
 * Pipeline Loader - Garante que dependências estejam disponíveis
 */
(function() {
  'use strict';
  
  console.log('🔄 Pipeline Loader iniciando...');
  
  let attempts = 0;
  const maxAttempts = 150;
  
  function checkDependencies() {
    attempts++;
    
    const hasSupabase = window.AlshamSupabase?.supabase;
    const hasNotification = window.showNotification;
    
    if (attempts % 10 === 0) {
      console.log(`[Loader] ${attempts}/${maxAttempts}`, {
        AlshamSupabase: !!hasSupabase,
        showNotification: !!hasNotification
      });
    }
    
    if (hasSupabase && hasNotification) {
      console.log('✅ Loader: OK! Carregando pipeline.js...');
      loadPipelineScript();
    } else if (attempts >= maxAttempts) {
      console.error('❌ Loader: TIMEOUT');
      showError();
    } else {
      setTimeout(checkDependencies, 100);
    }
  }
  
  function loadPipelineScript() {
    const script = document.createElement('script');
    script.src = '/src/js/pipeline.js';
    script.type = 'module';
    script.onload = () => console.log('✅ pipeline.js carregado');
    script.onerror = (e) => console.error('❌ Erro ao carregar pipeline.js:', e);
    document.head.appendChild(script);
  }
  
  function showError() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.innerHTML = `
        <div style="color: #EF4444; text-align: center; padding: 2rem;">
          <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">❌ Erro</h3>
          <p>Dependências não carregaram. Recarregue a página.</p>
          <button onclick="location.reload()" 
                  style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3B82F6; 
                         color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
            🔄 Recarregar
          </button>
        </div>
      `;
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkDependencies);
  } else {
    checkDependencies();
  }
})();
