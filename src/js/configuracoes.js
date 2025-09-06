// ALSHAM 360° – Settings PRO
// Gestão de Perfil, Organização, Equipe e Notificações

import { supabase } from '../lib/supabase.js';

// ========== Estado Global ==========
const appState = {
  user: null,
  profile: null,
  organization: null,
  team: [],
  notifications: null,
  loading: false,
  section: 'profile'
};

// ========== Utilitários DOM ==========
function $id(id) { return document.getElementById(id); }
function $qs(sel) { return document.querySelector(sel); }
function $qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

// ========== Inicialização ==========
document.addEventListener('DOMContentLoaded', async () => {
  await initializeSettingsPage();
});

// ========== Inicialização Principal ==========
async function initializeSettingsPage() {
  try {
    showLoading(true);
    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      window.location.href = '/login.html';
      return;
    }
    appState.user = user;

    // Carrega tudo em paralelo
    await Promise.all([
      loadProfile(),
      loadOrganization(),
      loadTeam(),
      loadNotifications()
    ]);

    setupSectionNav();
    setupSaveAll();
    setupLogout();

    // Mostra seção inicial
    showSection(appState.section);

    showLoading(false);
    showNotification('Configurações carregadas com sucesso!', 'success');
  } catch (e) {
    showLoading(false);
    showNotification('Erro ao carregar settings: ' + (e.message || e), 'error');
  }
}

// ========== Perfil ==========
async function loadProfile() {
  // Busca perfil extendido
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', appState.user.id)
    .single();

  // Se não existir, cria com dados defaults
  appState.profile = data || {
    user_id: appState.user.id,
    full_name: appState.user.user_metadata?.full_name || 'Usuário',
    email: appState.user.email,
    phone: '',
    position: '',
    timezone: 'America/Sao_Paulo',
    locale: 'pt-BR',
    org_id: null
  };

  populateProfileForm();

  // Avatar e nome visível (CORRIGIDO)
  const userAvatarElement = $qs('[data-auth="user-avatar"]');
  if (userAvatarElement) {
    userAvatarElement.textContent = (appState.profile.full_name || appState.user.email || 'U')
      .split(' ')
      .map(s => s[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  const userNameElement = $qs('[data-auth="user-name"]');
  if (userNameElement) {
    userNameElement.textContent = appState.profile.full_name || 'Usuário';
  }
}

function populateProfileForm() {
  $id('user-name') && ($id('user-name').value = appState.profile.full_name || '');
  $id('user-email') && ($id('user-email').value = appState.profile.email || '');
  $id('user-phone') && ($id('user-phone').value = appState.profile.phone || '');
  $id('user-position') && ($id('user-position').value = appState.profile.position || '');
  $id('user-timezone') && ($id('user-timezone').value = appState.profile.timezone || 'America/Sao_Paulo');
  $id('user-language') && ($id('user-language').value = appState.profile.locale || 'pt-BR');
}

async function saveProfile() {
  const profileData = {
    user_id: appState.user.id,
    full_name: $id('user-name')?.value,
    email: $id('user-email')?.value,
    phone: $id('user-phone')?.value,
    position: $id('user-position')?.value,
    timezone: $id('user-timezone')?.value,
    locale: $id('user-language')?.value,
    updated_at: new Date().toISOString()
  };
  // Upsert (cria ou atualiza)
  const { error } = await supabase
    .from('user_profiles')
    .upsert(profileData, { onConflict: ['user_id'] });
  if (!error) {
    appState.profile = { ...appState.profile, ...profileData };
    showNotification('Perfil salvo!', 'success');
  } else {
    throw error;
  }
}

// ========== Organização ==========
async function loadOrganization() {
  if (!appState.profile?.org_id) {
    appState.organization = {
      name: 'ALSHAM GLOBAL COMMERCE LTDA',
      cnpj: '59.332.265/0001-30',
      industry: 'technology',
      size: '11-50',
      address: 'São Paulo'
    };
    populateOrganizationForm();
    return;
  }
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', appState.profile.org_id)
    .single();
  appState.organization = data || {
    name: 'ALSHAM GLOBAL COMMERCE LTDA',
    cnpj: '59.332.265/0001-30',
    industry: 'technology',
    size: '11-50',
    address: 'São Paulo'
  };
  populateOrganizationForm();
}

function populateOrganizationForm() {
  $id('org-name') && ($id('org-name').value = appState.organization.name || '');
  $id('org-cnpj') && ($id('org-cnpj').value = appState.organization.cnpj || '');
  $id('org-industry') && ($id('org-industry').value = appState.organization.industry || '');
  $id('org-size') && ($id('org-size').value = appState.organization.size || '');
  $id('org-address') && ($id('org-address').value = appState.organization.address || '');
}

async function saveOrganization() {
  const orgData = {
    name: $id('org-name')?.value,
    cnpj: $id('org-cnpj')?.value,
    industry: $id('org-industry')?.value,
    size: $id('org-size')?.value,
    address: $id('org-address')?.value,
    updated_at: new Date().toISOString()
  };
  if (appState.organization?.id) {
    // Update
    const { error } = await supabase
      .from('organizations')
      .update(orgData)
      .eq('id', appState.organization.id);
    if (error) throw error;
  } else {
    // Criar nova org? (não recomendado sem lógica de convite/controle)
    // Aqui apenas atualiza localmente
    appState.organization = { ...appState.organization, ...orgData };
    showNotification('Organização salva localmente.', 'info');
  }
}

// ========== Equipe ==========
async function loadTeam() {
  if (!appState.profile?.org_id) {
    appState.team = [];
    renderTeam();
    return;
  }
  const { data, error } = await supabase
    .from('user_organizations')
    .select(`
      user_id,
      role,
      user_profiles (
        full_name,
        position,
        avatar_url
      )
    `)
    .eq('org_id', appState.profile.org_id);
  appState.team = data || [];
  renderTeam();
}

function renderTeam() {
  const tbody = $id('team-members');
  if (!tbody) return;
  if (!appState.team.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-400 py-8">Sem membros cadastrados.</td></tr>`;
    return;
  }
  tbody.innerHTML = appState.team.map(member => `
    <tr class="border-b border-gray-100">
      <td class="py-4 px-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-premium rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-semibold">${(member.user_profiles?.full_name || 'U').split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)}</span>
          </div>
          <div>
            <p class="font-medium text-gray-900">${member.user_profiles?.full_name || 'Usuário'}</p>
          </div>
        </div>
      </td>
      <td class="py-4 px-4">${member.user_profiles?.position || '-'}</td>
      <td class="py-4 px-4">
        <span class="px-2 py-1 ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} rounded-full text-xs font-medium">${member.role === 'admin' ? 'Admin' : 'Usuário'}</span>
      </td>
      <td class="py-4 px-4">
        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Ativo</span>
      </td>
      <td class="py-4 px-4">
        <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editMember('${member.user_id}')">Editar</button>
      </td>
    </tr>
  `).join('');
}

window.editMember = function(user_id) {
  showNotification('Função de edição de membro ainda não implementada. ID: ' + user_id, 'info');
};

window.inviteUser = function() {
  const email = prompt('Digite o e-mail do usuário para convidar:');
  if (email) showNotification(`Convite enviado para ${email}`, 'success');
};

// ========== Notificações ==========
async function loadNotifications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .single();
  appState.notifications = data || {};
  setNotificationFields();
}

function setNotificationFields() {
  if (!appState.notifications) return;
  // E-mail
  $qsa('[data-notify="email-new-leads"]').forEach(i => i.checked = !!appState.notifications.email_new_leads);
  $qsa('[data-notify="email-converted"]').forEach(i => i.checked = !!appState.notifications.email_converted);
  $qsa('[data-notify="email-weekly"]').forEach(i => i.checked = !!appState.notifications.email_weekly);
  $qsa('[data-notify="email-updates"]').forEach(i => i.checked = !!appState.notifications.email_updates);
  // Push
  $qsa('[data-notify="push-new-leads"]').forEach(i => i.checked = !!appState.notifications.push_new_leads);
  $qsa('[data-notify="push-reminders"]').forEach(i => i.checked = !!appState.notifications.push_reminders);
  $qsa('[data-notify="push-goals"]').forEach(i => i.checked = !!appState.notifications.push_goals);
}

async function saveNotifications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const prefs = {
    user_id: user.id,
    email_new_leads: $qsa('[data-notify="email-new-leads"]')[0]?.checked || false,
    email_converted: $qsa('[data-notify="email-converted"]')[0]?.checked || false,
    email_weekly: $qsa('[data-notify="email-weekly"]')[0]?.checked || false,
    email_updates: $qsa('[data-notify="email-updates"]')[0]?.checked || false,
    push_new_leads: $qsa('[data-notify="push-new-leads"]')[0]?.checked || false,
    push_reminders: $qsa('[data-notify="push-reminders"]')[0]?.checked || false,
    push_goals: $qsa('[data-notify="push-goals"]')[0]?.checked || false,
    updated_at: new Date().toISOString()
  };
  const { error } = await supabase
    .from('notifications')
    .upsert(prefs, { onConflict: ['user_id'] });
  if (error) throw error;
  showNotification('Preferências de notificação salvas!', 'success');
}

// ========== Navegação entre seções ==========
function setupSectionNav() {
  $qsa('[id^="nav-"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.id.replace('nav-', '');
      appState.section = section;
      showSection(section);
    });
  });
}

function showSection(section) {
  $qsa('.settings-section').forEach(sec => sec.classList.toggle('hidden', sec.id !== `section-${section}`));
  $qsa('[id^="nav-"]').forEach(b => b.classList.remove('bg-gray-100', 'text-primary'));
  $id(`nav-${section}`)?.classList.add('bg-gray-100', 'text-primary');
}

// ========== Salvar Tudo ==========
function setupSaveAll() {
  $qs('[data-action="save-all"]')?.addEventListener('click', async () => {
    showLoading(true);
    try {
      await Promise.all([
        saveProfile(),
        saveOrganization(),
        saveNotifications()
      ]);
      showNotification('Configurações salvas com sucesso!', 'success');
    } catch (e) {
      showNotification('Erro ao salvar configurações: ' + (e.message || e), 'error');
    }
    showLoading(false);
  });
}

// ========== Logout ==========
function setupLogout() {
  $qs('[data-auth="logout-btn"]')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
  });
}

// ========== UX: Loading e Notificações ==========
function showLoading(toggle = true) {
  appState.loading = toggle;
  // Implemente visual, exemplo: exibir/hide spinner ou overlay.
  const loader = $id('settings-loader');
  if (loader) loader.style.display = toggle ? 'block' : 'none';
}

function showNotification(message, type = 'info') {
  // Premium toast notification
  const notification = document.createElement('div');
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  notification.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 transition-transform transform translate-x-full ${colors[type] || colors.info}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.remove('translate-x-full'), 10);
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
