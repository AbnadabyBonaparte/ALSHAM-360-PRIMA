/**
 * 🚀 Módulo: Notifications Manager (Orquestrador Principal)
 * Sistema: ALSHAM 360° PRIMA
 * Versão: 1.0.0
 * Framework: CODEX X.1
 *
 * Descrição:
 * - Orquestra comunicação entre Supabase (core) e UI (toast)
 * - Gerencia ciclo de vida das notificações
 * - Integra real-time e interface visual
 */
// 🧩 Imports
import NotificationsCore from '/src/lib/notifications.js';
import toastSystem from '/src/js/utils/toast-system.js';
import { getCurrentUser } from '/src/lib/supabase.js';
/**
 * 🧠 Estado do Manager
 */
const ManagerState = {
  initialized: false,
  currentUser: null,
  isLoading: false
};
/**
 * 🎬 Inicialização do sistema
 */
export async function initNotificationsSystem() {
  try {
    if (ManagerState.initialized) {
      console.log('⚠️ [Notifications Manager] Já inicializado');
      return;
    }
    console.log('🔔 [Notifications Manager] Inicializando...');
    ManagerState.isLoading = true;
    // Obter usuário atual
    ManagerState.currentUser = await getCurrentUser();
   
    if (!ManagerState.currentUser) {
      console.warn('⚠️ [Notifications Manager] Usuário não autenticado');
      return;
    }
    // Carregar notificações iniciais
    await loadNotifications();
   
    // Atualizar badge
    await updateNotificationBadge();
   
    // Configurar UI
    renderNotificationsUI();
    bindNotificationEvents();
   
    // Subscrever real-time
    subscribeToRealtime();
    ManagerState.initialized = true;
    console.log('✅ [Notifications Manager] Sistema inicializado');
   
  } catch (error) {
    console.error('❌ [Notifications Manager] Erro na inicialização:', error);
    toastSystem.error('Erro ao carregar notificações');
  } finally {
    ManagerState.isLoading = false;
  }
}
/**
 * 📥 Carregar notificações
 */
async function loadNotifications() {
  const notifications = await NotificationsCore.getNotifications(
    ManagerState.currentUser.id,
    20
  );
 
  renderNotificationsList(notifications);
  return notifications;
}
/**
 * 🔔 Atualizar badge de não lidas
 */
async function updateNotificationBadge() {
  const count = await NotificationsCore.getUnreadCount(ManagerState.currentUser.id);
 
  const badge = document.getElementById('notification-badge');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
}
/**
 * 🎨 Renderizar lista de notificações
 */
function renderNotificationsList(notifications) {
  const container = document.getElementById('notifications-list');
  if (!container) return;
  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="p-4 text-center text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <p class="text-sm">Nenhuma notificação</p>
      </div>
    `;
    return;
  }
  container.innerHTML = notifications.map(n => `
    <div
      class="notification-item ${n.is_read ? '' : 'unread'} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition p-3 border-b border-gray-200 dark:border-gray-700"
      data-id="${n.id}"
      onclick="window.NotificationsManager.handleNotificationClick(${n.id})">
      <div class="flex items-start gap-2">
        ${getNotificationIcon(n.type)}
        <div class="flex-1 min-w-0">
          ${n.title ? `<p class="font-semibold text-sm">${n.title}</p>` : ''}
          <p class="text-sm text-gray-600 dark:text-gray-300">${n.message}</p>
          <p class="text-xs text-gray-400 mt-1">${formatRelativeTime(n.created_at)}</p>
        </div>
        ${!n.is_read ? '<span class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>' : ''}
      </div>
    </div>
  `).join('');
}
/**
 * 🎨 Renderizar UI de notificações
 */
function renderNotificationsUI() {
  // Verificar se o dropdown já existe
  const dropdown = document.getElementById('notifications-dropdown');
  if (dropdown) return;
  // Criar estrutura se não existir
  const notificationBell = document.querySelector('.notification-bell button');
  if (!notificationBell) return;
  const dropdownHTML = `
    <div class="notifications-dropdown" id="notifications-dropdown" style="display:none;">
      <div class="notifications-header p-3 border-b flex justify-between items-center">
        <h3 class="font-semibold">Notificações</h3>
        <button
          class="text-sm text-blue-600 hover:underline"
          onclick="window.NotificationsManager.markAllAsRead()">
          Marcar todas como lidas
        </button>
      </div>
      <div class="notifications-list overflow-y-auto max-h-96" id="notifications-list">
        <!-- Notificações carregadas dinamicamente -->
      </div>
    </div>
  `;
  notificationBell.insertAdjacentHTML('afterend', dropdownHTML);
}
/**
 * 🔗 Vincular eventos
 */
function bindNotificationEvents() {
  // Toggle dropdown
  const bellButton = document.querySelector('.notification-bell button');
  const dropdown = document.getElementById('notifications-dropdown');
 
  if (bellButton && dropdown) {
    bellButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = dropdown.style.display !== 'none';
      dropdown.style.display = isVisible ? 'none' : 'block';
     
      if (!isVisible) {
        dropdown.classList.add('active');
      } else {
        dropdown.classList.remove('active');
      }
    });
    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!bellButton.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
        dropdown.classList.remove('active');
      }
    });
  }
}
/**
 * 🔄 Subscrever real-time
 */
function subscribeToRealtime() {
  NotificationsCore.subscribeToNotifications(
    ManagerState.currentUser.id,
    async (payload) => {
      console.log('🔔 [Notifications Manager] Evento real-time:', payload);
      // Atualizar UI
      await loadNotifications();
      await updateNotificationBadge();
      // Mostrar toast para novas notificações
      if (payload.eventType === 'INSERT') {
        const notification = payload.new;
        showNotificationToast(notification);
      }
      // Analytics
      NotificationsCore.trackNotificationEvent('notification_received', {
        type: payload.new?.type,
        event: payload.eventType
      });
    }
  );
}
/**
 * 🔔 Mostrar toast de notificação
 */
function showNotificationToast(notification) {
  const typeMap = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error'
  };
  toastSystem.show(
    notification.message,
    typeMap[notification.type] || 'info',
    5000,
    {
      title: notification.title,
      closable: true
    }
  );
}
/**
 * 🖱️ Manipular clique em notificação
 */
export async function handleNotificationClick(notificationId) {
  try {
    // Marcar como lida
    await NotificationsCore.markAsRead(notificationId);
   
    // Atualizar UI
    await updateNotificationBadge();
   
    // Recarregar lista
    await loadNotifications();
    // Analytics
    NotificationsCore.trackNotificationEvent('notification_clicked', {
      notification_id: notificationId
    });
   
  } catch (error) {
    console.error('❌ [Notifications Manager] Erro ao processar clique:', error);
  }
}
/**
 * ✅ Marcar todas como lidas
 */
export async function markAllAsRead() {
  try {
    const success = await NotificationsCore.markAllAsRead(ManagerState.currentUser.id);
   
    if (success) {
      toastSystem.success('Todas as notificações foram marcadas como lidas');
      await updateNotificationBadge();
      await loadNotifications();
     
      // Analytics
      NotificationsCore.trackNotificationEvent('mark_all_as_read');
    }
  } catch (error) {
    console.error('❌ [Notifications Manager] Erro ao marcar todas como lidas:', error);
    toastSystem.error('Erro ao marcar notificações');
  }
}
/**
 * 🎨 Obter ícone por tipo
 */
function getNotificationIcon(type) {
  const icons = {
    success: '<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
    error: '<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
    warning: '<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
    info: '<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
  };
 
  return icons[type] || icons.info;
}
/**
 * 🕒 Formatar tempo relativo
 */
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
 
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
 
  if (days > 0) return `${days}d atrás`;
  if (hours > 0) return `${hours}h atrás`;
  if (minutes > 0) return `${minutes}min atrás`;
  return 'agora';
}
/**
 * 🔄 Recarregar notificações manualmente
 */
export async function refreshNotifications() {
  try {
    toastSystem.info('Atualizando notificações...', { duration: 1500 });
    await loadNotifications();
    await updateNotificationBadge();
   
    // Analytics
    NotificationsCore.trackNotificationEvent('manual_refresh');
   
  } catch (error) {
    console.error('❌ [Notifications Manager] Erro ao atualizar:', error);
    toastSystem.error('Erro ao atualizar notificações');
  }
}
/**
 * 🧹 Cleanup (ao sair da página)
 */
export function cleanup() {
  NotificationsCore.unsubscribeFromNotifications();
  ManagerState.initialized = false;
  console.log('🧹 [Notifications Manager] Cleanup concluído');
}
/**
 * 📤 Exportações para window (compatibilidade)
 */
window.NotificationsManager = {
  init: initNotificationsSystem,
  handleNotificationClick,
  markAllAsRead,
  refreshNotifications,
  cleanup,
  state: ManagerState
};
/**
 * 🎬 Auto-inicialização
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNotificationsSystem);
} else {
  initNotificationsSystem();
}
// Cleanup ao sair da página
window.addEventListener('beforeunload', cleanup);
console.log('✅ [Notifications Manager] v1.0.0 carregado');
/**
 * 📤 Exportações ES6
 */
export default {
  init: initNotificationsSystem,
  handleNotificationClick,
  markAllAsRead,
  refreshNotifications,
  cleanup
};
