/**
 * 🛡 ALSHAM 360° PRIMA — Service Worker v2.1 (ANTI-STale-Bundle)
 *
 * 🔧 CORREÇÕES IMPORTANTES:
 * - NUNCA cachear rotas de autenticação / precondition
 * - NUNCA cachear requests do Supabase / API
 * - HTML: Network-First com cache: 'no-store' (sempre buscar versão mais recente)
 * - JS: Network-Only com cache: 'no-store' (mata bundle velho / tela preta)
 * - Assets (css/img/font): Cache-First com atualização em background
 * - /index.html precacheado para fallback offline real
 */

const CACHE_NAME = 'alsham-cache-v2.1';
const STATIC_CACHE_NAME = 'alsham-static-v2.1';

// ✅ Assets básicos (fallback offline)
const STATIC_ASSETS = [
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
];

// 🔧 URLs/domínios que NUNCA devem ser cacheados pelo SW
const NEVER_CACHE = [
  '/login',
  '/signup',
  '/forgot-password',
  '/auth',
  '/dashboard',
  '/precondition',
  '/api/',
  'supabase.co',
  'supabase.com',
];

// Verificar se URL deve ser ignorada (no-cache)
function shouldNeverCache(url) {
  return NEVER_CACHE.some((pattern) => url.includes(pattern));
}

self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Instalando Service Worker v2.1...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('🔧 [SW] Ativando e limpando caches antigos...');

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE_NAME)
            .map((key) => {
              console.log('🗑️ [SW] Deletando cache antigo:', key);
              return caches.delete(key);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Ignorar métodos não-GET
  if (request.method !== 'GET') return;

  // ✅ 1) Nunca cachear auth/supabase/api — força rede SEM cache HTTP
  if (shouldNeverCache(url)) {
    event.respondWith(fetch(new Request(request, { cache: 'no-store' })));
    return;
  }

  // ✅ 2) JS = network-only + no-store (evita bundle velho)
  if (request.destination === 'script') {
    event.respondWith(fetch(new Request(request, { cache: 'no-store' })));
    return;
  }

  // ✅ 3) HTML = network-first + no-store
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' }))
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // ✅ 4) Outros assets = cache-first com update em background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Atualizar cache em background
        fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, response.clone());
              });
            }
          })
          .catch(() => {});

        return cachedResponse;
      }

      // Não está no cache, buscar da rede e salvar
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

console.log('✅ [SW] Service Worker v2.1 carregado');
