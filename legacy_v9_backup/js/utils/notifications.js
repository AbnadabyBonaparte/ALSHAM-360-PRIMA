/**
 * ALSHAM 360° PRIMA - Sistema de Notificações Toast Enterprise
 * Versão: 2.6.1 — SUPREME SYNC EDITION (Padrão Window Export)
 * ✅ CORRIGIDO: Removido exports ES6, usa window exports
 * 🔊 Som totalmente sincronizado com pipeline.js (menu lateral)
 * 🌓 Dark mode, animações refinadas e sons dinâmicos
 * 💅 Toasts suaves, sem barra visual e CSP-safe
 */

class NotificationSystem {
  constructor(containerId = 'toast-container') {
    this.injectAnimationCSS();
    this.container = document.getElementById(containerId);
    if (!this.container) this.createContainer();
  }

  // ✅ CSS de animações (sempre injetado)
  injectAnimationCSS() {
    if (!document.getElementById('toast-animations-style')) {
      const style = document.createElement('style');
      style.id = 'toast-animations-style';
      style.textContent = `
        @keyframes toast-progress { from {width:100%;} to {width:0;} }
        @keyframes toast-fadeout { to {opacity:0; transform:translateX(120%);} }
        #toast-container svg {
          width:1.25rem !important;
          height:1.25rem !important;
          display:inline-block !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ✅ Cria container principal
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

  // ✅ Exibir toast
  show(message, type = 'info', duration = 4000, options = {}) {
    if (!this.container) this.createContainer();

    const toast = document.createElement('div');
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    toast.id = id;
    toast.className = this.getToastClasses(type);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    // 💅 Animação suave de entrada
    toast.style.cssText = `
      transform: translateX(120%);
      opacity: 0;
      transition: all 0.6s ease-in-out;
      pointer-events: auto;
    `;

    const icon = this.getIcon(type);
    const closeBtn = options.closable !== false;

    toast.innerHTML = `
      <div class="flex items-start gap-3 relative">
        <div class="flex-shrink-0 mt-[2px] w-5 h-5 flex items-center justify-center">${icon}</div>
        <div class="flex-1 min-w-0">
          ${options.title ? `<p class="font-semibold text-sm mb-1">${options.title}</p>` : ''}
          <p class="text-sm leading-snug break-words">${message}</p>
        </div>
        ${closeBtn ? `
          <button aria-label="Fechar" onclick="document.getElementById('${id}').remove()"
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            <svg class="w-4 h-4 block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        ` : ''}
      </div>
    `;

    this.container.appendChild(toast);

    // 🔄 Entrada suave
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });
    });

    // ⏳ Duração controlada
    if (duration > 0) setTimeout(() => this.remove(toast), duration);

    // 🔊 Som sincronizado (global)
    if (notifySoundEnabled) this.playSoundForType(type);

    return toast;
  }

  // ✅ Som por tipo de toast
  playSoundForType(type) {
    const sounds = {
      success: '/assets/sounds/success/success-start.mp3',
      error: '/assets/sounds/error/error.mp3',
      warning: '/assets/sounds/error/error-glitch.mp3',
      info: '/assets/sounds/success/success-rise.mp3'
    };
    this.playSound(sounds[type] || sounds.info);
  }

  playSound(src) {
    try {
      const audio = new Audio(src);
      audio.volume = 0.25;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('🎧 Falha ao tocar som:', e);
    }
  }

  // ✅ Remoção com fade suave
  remove(toast) {
    if (!toast) return;
    toast.style.animation = 'toast-fadeout 0.6s ease-in-out forwards';
    setTimeout(() => toast.remove(), 600);
  }

  // ✅ Classes visuais
  getToastClasses(type) {
    const base =
      'relative flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg overflow-hidden transition-colors border text-sm font-medium backdrop-blur-sm';
    const variants = {
      success:
        'bg-green-50 dark:bg-green-900/25 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100',
      error:
        'bg-red-50 dark:bg-red-900/25 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100',
      warning:
        'bg-yellow-50 dark:bg-yellow-900/25 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
      info:
        'bg-blue-50 dark:bg-blue-900/25 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100'
    };
    return `${base} ${variants[type] || variants.info}`;
  }

  // ✅ Ícones SVG
  getIcon(type) {
    const icons = {
      success: `<svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0
                    00-1.414-1.414L9 10.586 7.707 9.293a1 1 0
                    00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>`,
      error: `<svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707
                  7.293a1 1 0 00-1.414 1.414L8.586 10 7.293
                  11.293a1 1 0 101.414 1.414L10 11.414l1.293
                  1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1
                  0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"/>
              </svg>`,
      warning: `<svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M8.257 3.099a1.5 1.5 0 012.486 0l5.58
                    9.92A1.5 1.5 0 0115.58 16H4.42a1.5
                    1.5 0 01-1.743-2.981l5.58-9.92zM11
                    13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1
                    0 00-1 1v3a1 1 0 002 0V6a1 1 0
                    00-1-1z" clip-rule="evenodd"/>
                </svg>`,
      info: `<svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0
                  0116 0zm-7-4a1 1 0 11-2 0 1 1
                  0 012 0zM9 9a1 1 0 000 2v3a1 1
                  0 001 1h1a1 1 0 100-2v-3a1 1
                  0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>`
    };
    return icons[type] || icons.info;
  }

  // ✅ Métodos rápidos
  success(message, options = {}) { return this.show(message, 'success', options.duration || 4000, options); }
  error(message, options = {}) { return this.show(message, 'error', options.duration || 4000, options); }
  warning(message, options = {}) { return this.show(message, 'warning', options.duration || 4000, options); }
  info(message, options = {}) { return this.show(message, 'info', options.duration || 4000, options); }

  clearAll() { if (this.container) this.container.innerHTML = ''; }
}

// === Instância global ===
const notify = new NotificationSystem();

// === Controle de som global sincronizado ===
let notifySoundEnabled = localStorage.getItem('alsham_sound_enabled') === 'true';

// Permite sincronização via pipeline.js
notify.setSoundPreference = function (enabled) {
  notifySoundEnabled = enabled;
  localStorage.setItem('alsham_sound_enabled', enabled ? 'true' : 'false');
};

// Reproduz sons leves somente se habilitado
notify.playFeedbackSound = function (type) {
  if (!notifySoundEnabled) return;
  const base = '/assets/sounds/';
  const soundFile =
    type === 'success'
      ? `${base}success/success.mp3`
      : type === 'error'
      ? `${base}error/error.mp3`
      : `${base}info/notify.mp3`;
  const audio = new Audio(soundFile);
  audio.volume = 0.2;
  audio.play().catch(() => {});
};

// Intercepta show() para som leve e UX premium
const originalShow = notify.show.bind(notify);
notify.show = function (message, type = 'info', duration = 4000, options = {}) {
  if (notifySoundEnabled) notify.playFeedbackSound(type);
  return originalShow(message, type, duration, { showProgress: false, ...options });
};

// Compatibilidade com chamadas simples
function showNotification(message, type = 'info', duration = 4000, options = {}) {
  return notify.show(message, type, duration, options);
}

// ✅ EXPORTS VIA WINDOW (padrão correto do projeto)
window.NotificationSystem = NotificationSystem;
window.notify = notify;
window.showNotification = showNotification;

console.log('✅ Notifications System v2.6.1 carregado (window exports)');
