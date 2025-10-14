/* ============================================================
 🛡️ ALSHAM 360° PRIMA — SERVICE WORKER SUPREMO v11.0
 Enterprise PWA Cache + Auto Update + Offline Fallback
============================================================ */

const CACHE_NAME = "alsham360-v11.0.0";
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
  console.log("📦 Instalando SW v11.0...");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      console.log("✅ Cache inicial criado:", CACHE_NAME);
    })()
  );
  self.skipWaiting(); // força ativação imediata
});

/* ---------------------------
 🔹 3. Ativação e limpeza de versões antigas
---------------------------- */
self.addEventListener("activate", (event) => {
  console.log("⚙️ Ativando SW...");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🗑️ Limpando cache antigo:", key);
            return caches.delete(key);
          }
        })
      );
      self.clients.claim(); // assume controle das páginas
    })()
  );
});

/* ---------------------------
 🔹 4. Estratégia de cache (Network First + Fallback)
---------------------------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignora chamadas do GA, Posthog e Sentry
  if (
    request.url.includes("googletagmanager") ||
    request.url.includes("posthog") ||
    request.url.includes("sentry.io")
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        // Cacheia cópia para uso offline
        if (request.method === "GET" && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        console.warn("⚠️ Offline ou erro:", error);
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }
        // Fallback offline
        if (request.mode === "navigate") {
          const offlinePage = await cache.match(OFFLINE_URL);
          return offlinePage || new Response("Offline", { status: 503 });
        }
        return new Response("Sem conexão", { status: 503 });
      }
    })()
  );
});

/* ---------------------------
 🔹 5. Comunicação com o app (atualização instantânea)
---------------------------- */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("♻️ Atualizando SW sob comando...");
    self.skipWaiting();
  }
});

/* ---------------------------
 🔹 6. Notificação de atualização
---------------------------- */
self.addEventListener("updatefound", () => {
  self.registration.addEventListener("statechange", () => {
    if (self.state === "installed" && navigator.serviceWorker.controller) {
      console.log("🔔 Nova versão disponível!");
    }
  });
});

/* ---------------------------
 🔹 7. Fallback opcional para página offline
---------------------------- */
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(event.request);
        } catch {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })()
    );
  }
});
