/**
 * Inicialização de event listeners para Leads
 * Separado para compliance com CSP
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const sideNav = document.getElementById('side-nav');
  
  if (mobileToggle && sideNav) {
    mobileToggle.addEventListener('click', () => {
      sideNav.classList.toggle('open');
    });
  }
  
  // Novo Lead button
  const newLeadBtn = document.getElementById('new-lead-btn');
  if (newLeadBtn) {
    newLeadBtn.addEventListener('click', () => {
      if (window.openNewLeadModal) {
        window.openNewLeadModal();
      } else {
        console.error('openNewLeadModal não carregado ainda');
        setTimeout(() => {
          if (window.openNewLeadModal) {
            window.openNewLeadModal();
          }
        }, 500);
      }
    });
  }
  
  console.log('✅ Leads event listeners inicializados');
});
