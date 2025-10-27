/**
 * 🛡 ALSHAM 360° PRIMA — Service Worker v2.0 (CORRIGIDO)
 * 
 * 🔧 CORREÇÕES APLICADAS:
 * - NUNCA cachear rotas de autenticação
 * - NUNCA cachear requests do Supabase
 * - Network-First para HTML (sempre buscar versão mais recente)
 * - Cache-First apenas para assets estáticos (CSS, JS, imagens)
 */

const CACHE_NAME = 'alsham-cache-v2.0-fixed';
const STATIC_CACHE_NAME = 'alsham-static-v2.0';

// Assets estáticos que PODEM ser cacheados
const STATIC_ASSETS = [
  '/css/tailwind.min.css',
  '/css/tokens.css',
  '/css/style.css',
  '/favicon.ico',
  '/manifest.json'
];

// 🔧 FIX: URLs que NUNCA devem ser cacheadas
const NEVER_CACHE = [
  '/login',
  '/dashboard',
  '/auth',
  'supabase.co',
  'supabase.com',
  '/api/',
  '.js' // JavaScript sempre buscar da rede
];

// Verificar se URL deve ser ignorada
function shouldNeverCache(url) {
  return NEVER_CACHE.some(pattern => url.includes(pattern));
}

self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Instalando Service Worker corrigido...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('🔧 [SW] Ativando e limpando caches antigos...');
  
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE_NAME)
          .map((key) => {
            console.log('🗑️ [SW] Deletando cache antigo:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // 🔧 FIX: Ignorar métodos não-GET
  if (request.method !== 'GET') {
    return;
  }

  // 🔧 FIX: NUNCA cachear rotas de autenticação ou Supabase
  if (shouldNeverCache(url)) {
    console.log('🚫 [SW] Ignorando cache para:', url);
    return; // Deixa o navegador buscar normalmente
  }

  // 🔧 FIX: HTML sempre usa Network-First (busca da rede primeiro)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Opcional: cachear HTML apenas se necessário
          // Mas SEMPRE serve da rede primeiro
          return response;
        })
        .catch(() => {
          // Fallback offline
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 🔧 FIX: CSS/Imagens usam Cache-First (pode vir do cache)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Atualizar cache em background
        fetch(request).then((response) => {
          if (response && response.status === 200) {
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          }
        }).catch(() => {});
        
        return cachedResponse;
      }

      // Não está no cache, buscar da rede
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

console.log('✅ [SW] Service Worker corrigido carregado');
