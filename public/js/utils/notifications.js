/**
 * ALSHAM 360° PRIMA - Sistema de Notificações Toast Enterprise
 * Versão: 2.3.0 — FIX: Tamanho, Posição, Overflow e Acessibilidade
 * Inspirado em: HubSpot Canvas + Linear + Notion
 * Compatível com: DARK MODE + PWA + CSP
 */

export class NotificationSystem {
  constructor(containerId = 'toast-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) this.createContainer();
  }

  createContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className =
      'fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm sm:max-w-md pointer-events-none';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * Exibe um toast moderno
   * @param {string} message - Texto da mensagem
   * @param {'success'|'error'|'warning'|'info'} type - Tipo da notificação
   * @param {number} duration - Tempo em ms (0 = permanente)
   * @param {object} options - Configurações extras
   */
  show(message, type = 'info', duration = 4000, options = {}) {
    if (!this.container) this.createContainer();

    const toast = document.createElement('div');
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    toast.id = id;
    toast.className = this.getToastClasses(type);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    toast.style.cssText = `
      transform: translateX(120%);
      opacity: 0;
      transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
      pointer-events: auto;
    `;

    const icon = this.getIcon(type);
    const closeBtn = options.closable !== false;

    toast.innerHTML = `
      <div class="flex items-start gap-3 relative">
        <div class="flex-shrink-0 mt-[2px]">${icon}</div>
        <div class="flex-1 min-w-0">
          ${options.title ? `<p class="font-semibold text-sm mb-1">${options.title}</p>` : ''}
          <p class="text-sm leading-snug break-words">${message}</p>
        </div>
        ${closeBtn ? `
          <button
            aria-label="Fechar"
            onclick="document.getElementById('${id}').remove()"
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        ` : ''}
        ${duration > 0 ? `
          <div class="absolute bottom-0 left-0 h-1 bg-current/30 rounded-b"
               style="width:100%;animation:toast-progress ${duration}ms linear forwards;"></div>
        ` : ''}
      </div>
    `;

    this.container.appendChild(toast);

    // Animação de entrada
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });
    });

    // Remoção automática
    if (duration > 0) setTimeout(() => this.remove(toast), duration);

    // Estilo global do progresso (se ainda não existir)
    if (!document.getElementById('toast-progress-style')) {
      const style = document.createElement('style');
      style.id = 'toast-progress-style';
      style.textContent = `
        @keyframes toast-progress { from {width:100%;} to {width:0;} }
        @keyframes toast-fadeout { to {opacity:0; transform:translateX(120%);} }
      `;
      document.head.appendChild(style);
    }

    return toast;
  }

  /**
   * Remove com animação
   */
  remove(toast) {
    if (!toast) return;
    toast.style.animation = 'toast-fadeout 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }

  /**
   * Retorna classes de estilo baseadas no tipo
   */
  getToastClasses(type) {
    const base =
      'relative flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg overflow-hidden backdrop-blur-sm transition-colors border text-sm font-medium';
    const variants = {
      success: 'bg-green-50 dark:bg-green-900/25 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100',
      error: 'bg-red-50 dark:bg-red-900/25 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100',
      warning: 'bg-yellow-50 dark:bg-yellow-900/25 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
      info: 'bg-blue-50 dark:bg-blue-900/25 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100',
    };
    return `${base} ${variants[type] || variants.info}`;
  }

  /**
   * Ícones simples e consistentes
   */
  getIcon(type) {
    const icons = {
      success: `
        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 
               7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"/>
        </svg>`,
      error: `
        <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10
               7.293 11.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0
               001.414-1.414L11.414 10l1.293-1.293a1 1 0
               00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"/>
        </svg>`,
      warning: `
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M8.257 3.099a1.5 1.5 0 012.486 0l5.58 9.92A1.5 1.5 0 0115.58 16H4.42a1.5
               1.5 0 01-1.743-2.981l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0
               012 0zm-1-8a1 1 0 00-1 1v3a1 1 0
               002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"/>
        </svg>`,
      info: `
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0
               0116 0zm-7-4a1 1 0 11-2 0 1 1 0
               012 0zM9 9a1 1 0 000 2v3a1 1 0
               001 1h1a1 1 0 100-2v-3a1 1 0
               00-1-1H9z"
            clip-rule="evenodd"/>
        </svg>`,
    };
    return icons[type] || icons.info;
  }

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

  clearAll() {
    if (this.container) this.container.innerHTML = '';
  }
}

// Instância global
export const notify = new NotificationSystem();
export default NotificationSystem;

// Função auxiliar direta
export function showNotification(message, type = 'info', duration = 4000, options = {}) {
  return notify.show(message, type, duration, options);
}
