/**
 * 🛡 ALSHAM 360° PRIMA — Service Worker Enterprise v6.0.7
 * Autor: ALSHAM Development Team | 2025
 * Funções:
 *  - Cache dinâmico com atualização automática
 *  - Fallback offline inteligente
 *  - Sincronização de dashboard e assets críticos
 *  - Mensagens de atualização em tempo real
 */

const CACHE_NAME = 'alsham-prima-cache-v6.0.7';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/public/css/style.css',
  '/public/css/tokens.css',
  '/public/css/dark-theme.css',
  '/public/js/main.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// =====================================================
// INSTALL — pré-carrega assets essenciais
// =====================================================
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  console.log('⚡ [SW] Instalado e cache inicial preparado.');
});

// =====================================================
// ACTIVATE — remove caches antigos e ativa imediatamente
// =====================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
  console.log('✅ [SW] Ativado e cache atualizado.');
});

// =====================================================
// FETCH — responde com cache primeiro (offline-first)
// =====================================================
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // ignora chamadas não-GET ou externas (ex: Supabase)
  if (req.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(req).then(cachedRes => {
      const fetchPromise = fetch(req)
        .then(networkRes => {
          // atualiza cache com nova resposta
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(req, networkRes.clone()));
          }
          return networkRes;
        })
        .catch(() => cachedRes || caches.match('/index.html')); // fallback
      return cachedRes || fetchPromise;
    })
  );
});

// =====================================================
// SYNC — tentativa de sincronizar dados quando online
// =====================================================
self.addEventListener('sync', event => {
  if (event.tag === 'sync-dashboard') {
    event.waitUntil(syncDashboard());
  }
});

async function syncDashboard() {
  console.log('🔄 [SW] Sincronizando dados do dashboard...');
  // Aqui você pode implementar sincronização de leads, vendas, etc.
  return true;
}

// =====================================================
// MESSAGE — comunicação com o app (exibir banner de update)
// =====================================================
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
