/**
 * 🧠 ALSHAM 360° PRIMA - Service Worker Registration v3.0
 * Data: 2025-10-15
 * Autor: @AbnadabyBonaparte
 * 
 * ✅ CORRIGIDO: Agora usa o Workbox gerado automaticamente pelo Vite PWA
 * ❌ REMOVIDO: Registro manual de /service-worker.js (não existe)
 */

console.log('🚀 [ALSHAM] Inicializando Service Worker...');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // ✅ O Vite PWA já injeta automaticamente o registro do Workbox via registerSW.js
      // Vamos apenas verificar se está ativo
      
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length > 0) {
        console.log('✅ [ALSHAM] Service Worker(s) detectado(s):', registrations.length);
        
        registrations.forEach((registration, index) => {
          const scriptURL = registration.active ? registration.active.scriptURL : 'N/A';
          console.log(`   ${index + 1}. ${scriptURL}`);
          
          // 🔁 Atualização automática silenciosa
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              console.log('🔄 [ALSHAM] Nova versão do SW detectada!');
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('✨ [ALSHAM] Nova versão instalada!');
                  showToast('⚡ Nova versão disponível! Atualizando...', 'info');
                  
                  // Aguarda 2 segundos e recarrega
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                }
              });
            }
          });
          
          // 🔄 Verifica atualizações a cada 60 segundos
          setInterval(() => {
            registration.update().catch(err => {
              console.warn('⚠️ [ALSHAM] Erro ao verificar atualização:', err);
            });
          }, 60000);
        });
        
      } else {
        console.log('ℹ️ [ALSHAM] Nenhum Service Worker ativo ainda.');
        console.log('ℹ️ [ALSHAM] O Vite PWA registrará automaticamente via /registerSW.js');
      }
      
    } catch (err) {
      console.error('❌ [ALSHAM] Erro ao verificar Service Workers:', err);
    }
  });
} else {
  console.warn('⚠️ [ALSHAM] Service Workers não suportados neste navegador.');
}

/**
 * 🧱 Toast visual empresarial
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.textContent = message;
  
  const colors = {
    info: '#1E40AF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  };
  
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;
  
  // Adiciona animação CSS
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // Remove após 4 segundos com animação
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.4s ease-in forwards';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

console.log('✅ [ALSHAM] SW Registrar v3.0 carregado!');
