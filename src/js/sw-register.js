/**
 * 🧠 ALSHAM 360° PRIMA - Service Worker Registrar v2.0.1
 * Responsável por registrar e atualizar automaticamente o PWA
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('✅ Service Worker registrado com sucesso:', registration.scope);

      // 🔁 Atualização automática silenciosa
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showToast('⚡ Nova versão disponível! Atualizando...');
              setTimeout(() => window.location.reload(), 1500);
            }
          });
        }
      });
    } catch (err) {
      console.error('❌ Falha ao registrar Service Worker:', err);
    }
  });
}

/**
 * 🧱 Toast visual simples
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1E40AF;
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    font-size: 14px;
    z-index: 9999;
    animation: fadeIn 0.3s ease-out;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
