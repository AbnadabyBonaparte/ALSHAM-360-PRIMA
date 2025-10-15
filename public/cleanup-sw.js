/* ============================================================
 🛡️ ALSHAM 360° PRIMA — Service Worker Cleanup v1.0
 Remove registros antigos do SW manual para evitar conflitos
 Data: 2025-10-15
 Autor: @AbnadabyBonaparte
============================================================ */

(function() {
  'use strict';

  console.log('🧹 [ALSHAM] Iniciando limpeza de Service Workers...');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      let cleanedCount = 0;
      
      registrations.forEach(function(registration) {
        const scriptURL = registration.active ? registration.active.scriptURL : '';
        
        // Remove apenas o SW manual antigo (/sw.js)
        if (scriptURL.includes('/sw.js') && !scriptURL.includes('workbox')) {
          console.log('🗑️ [ALSHAM] Removendo SW manual antigo:', scriptURL);
          registration.unregister().then(function(success) {
            if (success) {
              console.log('✅ [ALSHAM] SW manual removido com sucesso!');
              cleanedCount++;
              
              // Limpa caches antigos
              caches.keys().then(function(cacheNames) {
                return Promise.all(
                  cacheNames.map(function(cacheName) {
                    if (cacheName.includes('alsham360-v11.0')) {
                      console.log('🗑️ [ALSHAM] Removendo cache antigo:', cacheName);
                      return caches.delete(cacheName);
                    }
                  })
                );
              }).then(function() {
                console.log('✅ [ALSHAM] Caches antigos limpos!');
              });
            }
          });
        } else {
          console.log('✅ [ALSHAM] SW Workbox mantido:', scriptURL);
        }
      });

      setTimeout(function() {
        if (cleanedCount === 0) {
          console.log('✅ [ALSHAM] Nenhum SW antigo encontrado. Sistema limpo!');
        } else {
          console.log('🎉 [ALSHAM] Cleanup concluído! ' + cleanedCount + ' SW(s) removido(s).');
          console.log('🔄 [ALSHAM] Recarregando página em 2 segundos...');
          setTimeout(function() {
            window.location.reload();
          }, 2000);
        }
      }, 1000);
    }).catch(function(error) {
      console.error('❌ [ALSHAM] Erro ao limpar SWs:', error);
    });
  } else {
    console.warn('⚠️ [ALSHAM] Service Workers não suportados neste navegador.');
  }
})();
