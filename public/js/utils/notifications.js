/**
 * ALSHAM 360° PRIMA - Sistema de Notificações Toast Enterprise
 * Versão: 2.5.3 – SOUND CONTROL WORKING EDITION
 * 🔊 Toggle de som 100% funcional e persistente
 * 🌓 Dark mode, animações refinadas e sons dinâmicos integrados
 * ✅ CSS das animações sempre injetado no head
 */

export class NotificationSystem {
  constructor(containerId = 'toast-container') {
    this.injectAnimationCSS();
    this.container = document.getElementById(containerId);
    if (!this.container) this.createContainer();

    this.soundEnabled = this.getSoundPreference();
    this.addSoundToggleUI();
  }

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

  getSoundPreference() {
    return localStorage.getItem('alsham_sound_enabled') === 'true';
  }

  setSoundPreference(enabled) {
    localStorage.setItem('alsham_sound_enabled', enabled ? 'true' : 'false');
    this.soundEnabled = enabled;
    this.updateSoundToggleIcon();
    console.log('Som está', enabled ? 'ATIVADO' : 'DESATIVADO');
  }

  addSoundToggleUI() {
    let btn = document.getElementById('sound-toggle-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'sound-toggle-btn';
      btn.className =
        'fixed bottom-4 right-4 z-[9999] bg-neutral-800/80 text-white dark:bg-neutral-200/80 dark:text-black rounded-full shadow-lg p-3 backdrop-blur-md border border-white/10 hover:scale-105 transition';
      document.body.appendChild(btn);
    }
    this.updateSoundToggleIcon();

    // Remover event listener antigo para evitar duplicidade
    btn.onclick = null;
    btn.onclick = () => {
      this.setSoundPreference(!this.soundEnabled);
      this.playToggleSound();
    };
  }

  getSoundIcon(enabled) {
    return enabled
      ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.5a1 1 0 00-1.707-.707L4.586 6.5H3a1 1 0 00-1 1v5a1 1 0 001 1h1.586l2.707 2.707A1 1 0 009 15.5V4.5zM15.707 14.707a1 1 0 01-1.414-1.414A5 5 0 0014 10a5 5 0 00.707-3.293 1 1 0 011.414-1.414A7 7 0 0116 10a7 7 0 01-.293 2.707z"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.5a1 1 0 00-1.707-.707L4.586 6.5H3a1 1 0 00-1 1v5a1 1 0 001 1h1.586l2.707 2.707A1 1 0 009 15.5V4.5zM15.707 14.707L5.293 4.293a1 1 0 00-1.414 1.414l10.414 10.414a1 1 0 001.414-1.414z"/></svg>`;
  }

  updateSoundToggleIcon() {
    const btn = document.getElementById('sound-toggle-btn');
    if (!btn) return;
    btn.innerHTML = this.getSoundIcon(this.soundEnabled);
    btn.title = this.soundEnabled
      ? 'Som ativado – clique para desativar'
      : 'Som desativado – clique para ativar';
    btn.setAttribute('aria-pressed', this.soundEnabled ? 'true' : 'false');
    btn.setAttribute('aria-label', btn.title);
  }

  playToggleSound() {
    if (this.soundEnabled)
      this.playSound('/assets/sounds/success/success-level.mp3');
    else
      this.playSound('/assets/sounds/error/error-glitch.mp3');
  }

  show(message, type = 'info', duration = 6500, options = {}) {
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
      transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>` : ''}
        ${duration > 0 ? `
          <div class="absolute bottom-0 left-0 h-1 bg-current/30 rounded-b"
               style="width:100%;animation:toast-progress ${duration}ms linear forwards;"></div>
        ` : ''}
      </div>
    `;

    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });
    });

    if (duration > 0) setTimeout(() => this.remove(toast), duration);

    if (this.soundEnabled) this.playSoundForType(type);

    return toast;
  }

  playSoundForType(type) {
    const sounds = {
      success: '/assets/sounds/success/success-start.mp3',
      error: '/assets/sounds/error/error.mp3',
      warning: '/assets/sounds/error/warning.mp3',
      info: '/assets/sounds/success/success-rise.mp3',
    };
    this.playSound(sounds[type] || sounds.info);
  }

  playSound(src) {
    try {
      const audio = new Audio(src);
      audio.volume = 0.25;
      audio.play().catch(() => {});
    } catch (e) {
      console.log("Erro ao tocar som:", e);
    }
  }

  remove(toast) {
    if (!toast) return;
    toast.style.animation = 'toast-fadeout 0.4s forwards';
    setTimeout(() => toast.remove(), 400);
  }

  getToastClasses(type) {
    const base =
      'relative flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg overflow-hidden backdrop-blur-sm transition-colors border text-sm font-medium';
    const variants = {
      success:
        'bg-green-50 dark:bg-green-900/25 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100',
      error:
        'bg-red-50 dark:bg-red-900/25 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100',
      warning:
        'bg-yellow-50 dark:bg-yellow-900/25 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
      info:
        'bg-blue-50 dark:bg-blue-900/25 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100',
    };
    return `${base} ${variants[type] || variants.info}`;
  }

  getIcon(type) {
    const icons = {
      success: `<svg class="w-5 h-5 text-green-600 dark:text-green-400 inline-block" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
      error: `<svg class="w-5 h-5 text-red-600 dark:text-red-400 inline-block" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10 7.293 11.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
      warning: `<svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 inline-block" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099a1.5 1.5 0 012.486 0l5.58 9.92A1.5 1.5 0 0115.58 16H4.42a1.5 1.5 0 01-1.743-2.981l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
      info: `<svg class="w-5 h-5 text-blue-600 dark:text-blue-400 inline-block" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
    };
    return icons[type] || icons.info;
  }

  success(message, options = {}) {
    return this.show(message, 'success', options.duration || 6500, options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', options.duration || 7000, options);
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', options.duration || 6500, options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options.duration || 6500, options);
  }

  clearAll() {
    if (this.container) this.container.innerHTML = '';
  }
}

export const notify = new NotificationSystem();
export default NotificationSystem;

export function showNotification(message, type = 'info', duration = 6500, options = {}) {
  return notify.show(message, type, duration, options);
}
