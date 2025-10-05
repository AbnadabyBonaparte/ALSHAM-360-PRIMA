/**
 * ALSHAM 360° PRIMA - Sistema de Notificações Toast Enterprise
 * Baseado em: HubSpot Canvas, Slack, Linear
 * Acessibilidade: WCAG 2.2 AA compliant
 * ✅ DARK MODE COMPATIBLE
 */

export class NotificationSystem {
  constructor(containerId = 'toast-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('⚠️ Container de notificações não encontrado. Criando...');
      this.createContainer();
    }
  }

  createContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-md';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * Exibe notificação toast
   * @param {string} message - Mensagem a exibir
   * @param {('success'|'error'|'warning'|'info')} type - Tipo de notificação
   * @param {number} duration - Duração em ms (0 = permanente)
   * @param {Object} options - Opções adicionais
   * @returns {HTMLElement} Elemento do toast
   */
  show(message, type = 'info', duration = 4000, options = {}) {
    if (!this.container) return null;

    const toast = document.createElement('div');
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    toast.id = id;
    toast.className = this.getToastClasses(type);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    
    const icon = this.getIcon(type);
    const closeButton = options.closable !== false;
    
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-0.5">
          ${icon}
        </div>
        <div class="flex-1 min-w-0">
          ${options.title ? `<p class="font-semibold text-sm mb-1">${options.title}</p>` : ''}
          <p class="text-sm leading-relaxed">${message}</p>
          ${options.action ? `
            <button onclick="${options.action.onClick}" 
                    class="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded">
              ${options.action.label}
            </button>
          ` : ''}
        </div>
        ${closeButton ? `
          <button onclick="document.getElementById('${id}').remove()" 
                  class="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2"
                  aria-label="Fechar notificação">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        ` : ''}
      </div>
      ${duration > 0 ? `
        <div class="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all rounded-b" 
             style="width: 100%; animation: toast-progress ${duration}ms linear;"></div>
      ` : ''}
    `;

    // Animação de entrada
    toast.style.cssText = `
      transform: translateX(calc(100% + 1rem));
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    this.container.appendChild(toast);
    
    // Trigger animation (RAF for smooth animation)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });
    });

    // Auto-remover
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }
    
    // Adicionar estilo de progresso (apenas uma vez)
    if (!document.getElementById('toast-progress-style')) {
      const style = document.createElement('style');
      style.id = 'toast-progress-style';
      style.textContent = `
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `;
      document.head.appendChild(style);
    }
    
    return toast;
  }

  /**
   * Remove toast com animação
   */
  remove(toast) {
    if (!toast || !toast.parentElement) return;
    
    toast.style.transform = 'translateX(calc(100% + 1rem))';
    toast.style.opacity = '0';
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }

  /**
   * Classes do toast baseadas no tipo (DARK MODE READY)
   */
  getToastClasses(type) {
    const base = 'relative flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg mb-2 overflow-hidden backdrop-blur-sm transition-colors duration-300';
    
    const variants = {
      success: 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-700',
      error: 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-700',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-700',
      info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-700'
    };
    
    return `${base} ${variants[type] || variants.info}`;
  }

  /**
   * Ícones para cada tipo de notificação
   */
  getIcon(type) {
    const icons = {
      success: `
        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
      `,
      error: `
        <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
      `,
      warning: `
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
      `,
      info: `
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
      `
    };
    
    return icons[type] || icons.info;
  }

  /**
   * Métodos de atalho
   */
  success(message, options = {}) {
    return this.show(message, 'success', options.duration || 4000, options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', options.duration || 5000, options);
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', options.duration || 4000, options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options.duration || 4000, options);
  }

  /**
   * Limpa todas as notificações
   */
  clearAll() {
    if (this.container) {
      const toasts = this.container.querySelectorAll('[role="alert"]');
      toasts.forEach(toast => this.remove(toast));
    }
  }
}

// Instância global
export const notify = new NotificationSystem();

// Exportação para uso direto
export default NotificationSystem;
