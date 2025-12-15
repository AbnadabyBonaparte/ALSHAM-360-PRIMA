/**
 * 🛡 ALSHAM 360° PRIMA — Service Worker v2.1 (ANTI-STale-Bundle)
 *
 * - Não cacheia auth / Supabase / API
 * - Navigation (HTML): network-first com cache: 'no-store'
 * - Scripts (JS): network-only com cache: 'no-store' (evita bundle velho)
 * - Assets estáticos (img/css/font): cache-first com update em background
 */

const CACHE_NAME = 'alsham-cache-v2.1';
const STATIC_CACHE_NAME = 'alsham-static-v2.1';

const STATIC_ASSETS = [
  '/index.html',          // ✅ garante fallback real
  '/favicon.ico',
  '/manifest.json',
];

// Rotas/domínios que NUNCA devem ser cacheados pelo SW
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

function shouldNeverCache(url) {
  return NEVER_CACHE.some((pattern) => url.includes(pattern));
}

self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Instalando Service Worker v2.1...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('🔧 [SW] Ativando e limpando caches antigos...');
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  if (request.method !== 'GET') return;

  // ✅ 1) Nunca cachear auth/supabase/api — e força rede SEM cache HTTP
  if (shouldNeverCache(url)) {
    event.respondWith(fetch(new Request(request, { cache: 'no-store' })));
    return;
  }

  // ✅ 2) Scripts (JS) = network-only NO-STORE (mata bundle velho)
  if (request.destination === 'script') {
    event.respondWith(fetch(new Request(request, { cache: 'no-store' })));
    return;
  }

  // ✅ 3) HTML (navegação) = network-first NO-STORE
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' }))
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // ✅ 4) Assets = cache-first + update em background
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        fetch(request)
          .then((resp) => {
            if (resp && resp.status === 200) {
              caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, resp));
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(request).then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return resp;
      });
    })
  );
});

console.log('✅ [SW] Service Worker v2.1 carregado');
