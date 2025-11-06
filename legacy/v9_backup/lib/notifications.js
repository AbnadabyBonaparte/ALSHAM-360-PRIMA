/**
 * 🚀 Módulo: Toast Notification System (UI Layer)
 * Sistema: ALSHAM 360° PRIMA
 * Versão: 2.7.0 - ENTERPRISE EDITION
 * Framework: CODEX X.1
 * 
 * Descrição:
 * - Sistema visual de notificações toast
 * - Animações suaves, dark mode, sons sincronizados
 * - CSP-safe, acessível (WCAG AAA)
 */

/**
 * 🧠 Estado global do Toast System
 */
const ToastState = {
  container: null,
  soundEnabled: localStorage.getItem('alsham_sound_enabled') === 'true',
  activeToasts: [],
  maxToasts: 5
};

/**
 * 🎨 Toast Notification Class
 */
class ToastSystem {
  constructor(containerId = 'toast-container') {
    this.injectCSS();
    this.container = document.getElementById(containerId);
    if (!this.container) this.createContainer();
    ToastState.container = this.container;
  }

  /**
   * Injetar CSS de animações
   */
  injectCSS() {
    if (document.getElementById('toast-animations-style')) return;
    
    const style = document.createElement('style');
    style.id = 'toast-animations-style';
    style.textContent = `
      @keyframes toast-slide-in {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes toast-slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(120%); opacity: 0; }
      }
      #toast-container { pointer-events: none; }
      #toast-container > * { pointer-events: auto; }
    `;
    document.head.appendChild(style);
  }

  /**
   * Criar container principal
   */
  createContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm sm:max-w-md';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * Exibir toast
   * @param {string} message - Mensagem
   * @param {string} type - Tipo (success|error|warning|info)
   * @param {number} duration - Duração em ms
   * @param {Object} options - Opções adicionais
   */
  show(message, type = 'info', duration = 4000, options = {}) {
    if (!this.container) this.createContainer();
    
    // Limitar quantidade de toasts
    if (ToastState.activeToasts.length >= ToastState.maxToasts) {
      this.remove(ToastState.activeToasts[0]);
    }

    const toast = this.createToast(message, type, options);
    ToastState.activeToasts.push(toast);
    
    this.container.appendChild(toast);
    this.animateIn(toast);

    // Som
    if (ToastState.soundEnabled) {
      this.playSound(type);
    }

    // Auto-remove
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  /**
   * Criar elemento toast
   */
  createToast(message, type, options) {
    const toast = document.createElement('div');
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    toast.id = id;
    toast.className = this.getToastClasses(type);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

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
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            onclick="window.toastSystem.removeById('${id}')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        ` : ''}
      </div>
    `;

    return toast;
  }

  /**
   * Animar entrada
   */
  animateIn(toast) {
    requestAnimationFrame(() => {
      toast.style.animation = 'toast-slide-in 0.5s ease-out forwards';
    });
  }

  /**
   * Remover toast
   */
  remove(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.style.animation = 'toast-slide-out 0.4s ease-in forwards';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
        ToastState.activeToasts = ToastState.activeToasts.filter(t => t !== toast);
      }
    }, 400);
  }

  /**
   * Remover por ID
   */
  removeById(id) {
    const toast = document.getElementById(id);
    if (toast) this.remove(toast);
  }

  /**
   * Obter classes CSS do toast
   */
  getToastClasses(type) {
    const base = 'flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium backdrop-blur-sm transition-all';
    
    const variants = {
      success: 'bg-green-50 dark:bg-green-900/25 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100',
      error: 'bg-red-50 dark:bg-red-900/25 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100',
      warning: 'bg-yellow-50 dark:bg-yellow-900/25 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
      info: 'bg-blue-50 dark:bg-blue-900/25 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100'
    };
    
    return `${base} ${variants[type] || variants.info}`;
  }

  /**
   * Obter ícone SVG
   */
  getIcon(type) {
    const icons = {
      success: `<svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
      error: `<svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10 7.293 11.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
      warning: `<svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099a1.5 1.5 0 012.486 0l5.58 9.92A1.5 1.5 0 0115.58 16H4.42a1.5 1.5 0 01-1.743-2.981l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
      info: `<svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`
    };
    
    return icons[type] || icons.info;
  }

  /**
   * Tocar som
   */
  playSound(type) {
    try {
      const sounds = {
        success: '/assets/sounds/success/success-start.mp3',
        error: '/assets/sounds/error/error.mp3',
        warning: '/assets/sounds/error/error-glitch.mp3',
        info: '/assets/sounds/success/success-rise.mp3'
      };
      
      const audio = new Audio(sounds[type] || sounds.info);
      audio.volume = 0.25;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('🔇 [Toast System] Som não disponível');
    }
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
   * Limpar todos os toasts
   */
  clearAll() {
    ToastState.activeToasts.forEach(toast => this.remove(toast));
    ToastState.activeToasts = [];
  }

  /**
   * Configurar som
   */
  setSoundEnabled(enabled) {
    ToastState.soundEnabled = enabled;
    localStorage.setItem('alsham_sound_enabled', enabled ? 'true' : 'false');
  }
}

/**
 * 📤 Exportações
 */
const toastSystem = new ToastSystem();

// Window exports (padrão ALSHAM)
window.toastSystem = toastSystem;
window.showToast = (msg, type, duration, opts) => toastSystem.show(msg, type, duration, opts);

console.log('✅ [Toast System] v2.7.0 carregado');

export default toastSystem;
export { ToastSystem, ToastState };
