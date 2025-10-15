/* ============================================================
 🛡️ ALSHAM 360° PRIMA — SERVICE WORKER SUPREMO v11.0.1
 Enterprise PWA Cache + Auto Update + Offline Fallback
 
 HOTFIX: Removido fetch duplicado (FetchEvent error corrigido)
 Data: 2025-10-15 01:09 UTC
 Autor: @AbnadabyBonaparte
============================================================ */

const CACHE_NAME = "alsham360-v11.0.1";
const OFFLINE_URL = "/offline.html";

/* ---------------------------
 🔹 1. Assets principais a serem cacheados
---------------------------- */
const CORE_ASSETS = [
  "/",
  "/dashboard.html",
  "/leads-real.html",
  "/pipeline.html",
  "/automacoes.html",
  "/relatorios.html",
  "/css/style.css",
  "/css/tokens.css",
  "/css/tailwind.min.css",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/apple-touch-icon.png"
];

/* ---------------------------
 🔹 2. Instalação do Service Worker
---------------------------- */
self.addEventListener("install", (event) => {
  console.log("📦 [SW v11.0.1] Instalando Service Worker...");
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(CORE_ASSETS);
        console.log("✅ [SW v11.0.1] Cache inicial criado:", CACHE_NAME);
      } catch (error) {
        console.error("❌ [SW v11.0.1] Erro ao criar cache:", error);
      }
    })()
  );
  self.skipWaiting(); // força ativação imediata
});

/* ---------------------------
 🔹 3. Ativação e limpeza de versões antigas
---------------------------- */
self.addEventListener("activate", (event) => {
  console.log("⚙️ [SW v11.0.1] Ativando Service Worker...");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🗑️ [SW v11.0.1] Limpando cache antigo:", key);
            return caches.delete(key);
          }
        })
      );
      console.log("✅ [SW v11.0.1] Service Worker ativado e pronto!");
      await self.clients.claim(); // assume controle das páginas
    })()
  );
});

/* ---------------------------
 🔹 4. Estratégia de cache (Network First + Fallback)
 ✅ CORRIGIDO: Removido fetch duplicado
---------------------------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignora requisições não-GET (POST, PUT, DELETE, etc)
  if (request.method !== "GET") {
    return;
  }

  // Ignora chamadas de analytics e trackers externos
  if (
    request.url.includes("googletagmanager") ||
    request.url.includes("google-analytics") ||
    request.url.includes("posthog") ||
    request.url.includes("sentry.io") ||
    request.url.includes("analytics")
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Tenta buscar da rede primeiro (Network First)
        const response = await fetch(request);
        
        // Se sucesso, cacheia para uso offline
        if (response && response.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        
        return response;
      } catch (error) {
        // Se falhar (offline), busca do cache
        console.warn("⚠️ [SW v11.0.1] Offline ou erro de rede, buscando do cache...");
        
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        
        if (cached) {
          console.log("✅ [SW v11.0.1] Servindo do cache:", request.url);
          return cached;
        }
        
        // Fallback para navegação (páginas HTML)
        if (request.mode === "navigate") {
          const offlinePage = await cache.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }
          
          // Fallback HTML inline se não houver página offline
          return new Response(
            `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>ALSHAM 360° - Offline</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  text-align: center;
                  padding: 20px;
                }
                .container {
                  max-width: 500px;
                }
                h1 { font-size: 3rem; margin: 0 0 1rem 0; }
                p { font-size: 1.2rem; margin: 0 0 2rem 0; opacity: 0.9; }
                button {
                  background: white;
                  color: #667eea;
                  border: none;
                  padding: 12px 32px;
                  font-size: 1rem;
                  font-weight: 600;
                  border-radius: 8px;
                  cursor: pointer;
                  transition: transform 0.2s;
                }
                button:hover { transform: scale(1.05); }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>📡 Você está offline</h1>
                <p>Não foi possível conectar ao ALSHAM 360° PRIMA. Verifique sua conexão com a internet.</p>
                <button onclick="location.reload()">🔄 Tentar Novamente</button>
              </div>
            </body>
            </html>
            `,
            {
              status: 503,
              statusText: "Service Unavailable",
              headers: { "Content-Type": "text/html; charset=utf-8" }
            }
          );
        }
        
        // Fallback para outros recursos
        return new Response("Sem conexão com a internet", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    })()
  );
});

/* ---------------------------
 🔹 5. Comunicação com o app (atualização instantânea)
---------------------------- */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("♻️ [SW v11.0.1] Atualizando Service Worker sob comando...");
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === "CLEAR_CACHE") {
    console.log("🗑️ [SW v11.0.1] Limpando cache sob comando...");
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }
});

/* ---------------------------
 🔹 6. Notificação de atualização
---------------------------- */
self.addEventListener("updatefound", () => {
  console.log("🔔 [SW v11.0.1] Nova versão detectada!");
  if (self.registration && self.registration.installing) {
    self.registration.installing.addEventListener("statechange", (event) => {
      if (event.target.state === "installed" && navigator.serviceWorker.controller) {
        console.log("✨ [SW v11.0.1] Nova versão instalada e pronta!");
      }
    });
  }
});

console.log("🚀 [SW v11.0.1] Service Worker carregado com sucesso!");
