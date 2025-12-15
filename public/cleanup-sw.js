/* ============================================================
 🛡️ ALSHAM 360° PRIMA — Service Worker Cleanup v2.0 (SAFE)
 Objetivo:
 - Remover caches antigos que mantêm bundles velhos (tela preta)
 - Desregistrar APENAS SWs legados problemáticos (sem matar o SW atual)
 Data: 2025-12-15
 Autor: @AbnadabyBonaparte
============================================================ */

(function () {
  'use strict';

  console.log('🧹 [ALSHAM] Iniciando limpeza de Service Workers e caches...');

  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ [ALSHAM] Service Workers não suportados neste navegador.');
    return;
  }

  // Caches que queremos limpar (padrões)
  function isOldCacheName(name) {
    // legado que você já tinha
    if (name.includes('alsham360-v11.0')) return true;

    // novos padrões (SW v2.x)
    if (name.startsWith('alsham-cache-')) return true;
    if (name.startsWith('alsham-static-')) return true;

    // se existir algum cache anterior que você usou
    if (name.includes('alsham-cache-v')) return true;
    if (name.includes('alsham-static-v')) return true;

    return false;
  }

  // Decide se devemos desregistrar um SW (não matar o atual)
  function shouldUnregisterSW(scriptURL) {
    if (!scriptURL) return false;

    // Mantém workbox sempre
    if (scriptURL.includes('workbox')) return false;

    // Apenas SW manual (sw.js), mas com critérios de legado
    // Se você atualizar o SW e mudar versão/cache name, ele vai ficar OK.
    // Aqui removemos quando:
    // - for sw.js de origem antiga (sem query version)
    // - ou for sw.js com cache name v11 / histórico
    const isManualSW = scriptURL.includes('/sw.js');

    // Critérios de "antigo"
    const looksLegacy =
      scriptURL.includes('alsham360') ||
      scriptURL.includes('v11') ||
      (!scriptURL.includes('?v=') && !scriptURL.includes('v2.1') && !scriptURL.includes('v2.0'));

    return isManualSW && looksLegacy;
  }

  async function run() {
    let removedSW = 0;
    let removedCaches = 0;

    try {
      // 1) Limpa caches antigos
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (name) => {
          if (isOldCacheName(name)) {
            console.log('🗑️ [ALSHAM] Removendo cache:', name);
            const ok = await caches.delete(name);
            if (ok) removedCaches++;
          }
        })
      );

      // 2) Desregistra apenas SWs legados problemáticos
      const registrations = await navigator.serviceWorker.getRegistrations();

      await Promise.all(
        registrations.map(async (registration) => {
          const active = registration.active;
          const waiting = registration.waiting;
          const installing = registration.installing;

          const scriptURL =
            (active && active.scriptURL) ||
            (waiting && waiting.scriptURL) ||
            (installing && installing.scriptURL) ||
            '';

          if (shouldUnregisterSW(scriptURL)) {
            console.log('🗑️ [ALSHAM] Desregistrando SW legado:', scriptURL);
            const ok = await registration.unregister();
            if (ok) removedSW++;
          } else {
            console.log('✅ [ALSHAM] SW mantido:', scriptURL || '(sem scriptURL detectável)');
          }
        })
      );

      console.log('✅ [ALSHAM] Limpeza concluída.');
      console.log(`📦 [ALSHAM] Caches removidos: ${removedCaches}`);
      console.log(`🛠️ [ALSHAM] SWs desregistrados: ${removedSW}`);

      // 3) Recarrega para puxar bundle novo
      console.log('🔄 [ALSHAM] Recarregando página em 1 segundo...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('❌ [ALSHAM] Erro durante limpeza:', err);
    }
  }

  run();
})();
