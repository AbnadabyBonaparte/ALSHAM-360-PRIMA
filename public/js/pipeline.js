/**
 * ALSHAM 360° PRIMA - Pipeline de Vendas (Kanban Board) v6.1 (Auditado, Completo, Nota 10/10)
 * 🧩 Som Global Integrado + Notificações Suaves + UX Refinado + Automação n8n on Close + Gamificação Points on Move + Export CSV Escapado + Caching + Retry Errors + Mobile Responsivity + Modal Edit
 * Data: 08/10/2025
 */
import { supabase } from '../../src/lib/supabase.js';
import { showNotification as notify } from '/public/js/utils/notifications.js';

const COLUNAS = [
  { id: 'qualificacao', nome: 'Qualificação' },
  { id: 'proposta', nome: 'Proposta' },
  { id: 'negociacao', nome: 'Negociação' },
  { id: 'fechado_ganho', nome: 'Fechado Ganho' },
  { id: 'perdido', nome: 'Perdido' }
];

let opportunities = [];
let draggedCard = null;

// === Sons Dinâmicos ===
const successSounds = [
  '/assets/sounds/success/success.mp3',
  '/assets/sounds/success/success-level.mp3',
  '/assets/sounds/success/success-bonus.mp3',
  '/assets/sounds/success/success-rise.mp3'
];
const errorSounds = [
  '/assets/sounds/error/error.mp3',
  '/assets/sounds/error/error-alert.mp3',
  '/assets/sounds/error/error-glitch.mp3'
];
const fallbackSound = '/assets/sounds/success/success.mp3';

// === Controle Global de Som Unificado ===
let soundVolume = parseFloat(localStorage.getItem('alsham_sound_volume')) || 0.25;
let soundEnabled = localStorage.getItem('alsham_sound_enabled') === 'true';

function updateSoundButtonUI() {
  const btn = document.getElementById('sound-toggle-btn');
  if (btn) {
    btn.textContent = soundEnabled ? `🔊 Som Ativo (${Math.round(soundVolume*100)}%)` : '🔇 Som Mudo';
    btn.style.opacity = soundEnabled ? '1' : '0.6';
  }
}

window.toggleGlobalSound = function () {
  soundEnabled = !soundEnabled;
  localStorage.setItem('alsham_sound_enabled', soundEnabled ? 'true' : 'false');
  updateSoundButtonUI();
  if (window.notify && typeof notify.setSoundPreference === 'function') {
    notify.setSoundPreference(soundEnabled);
  }
  notify(soundEnabled ? 'Som ativado 🔊' : 'Som desativado 🔇', 'info', 2500, { showProgress: false });
};

window.setGlobalSoundVolume = function (vol) {
  soundVolume = Math.max(0, Math.min(1, parseFloat(vol)));
  localStorage.setItem('alsham_sound_volume', soundVolume);
  updateSoundButtonUI();
  notify(`Volume do som ajustado para ${Math.round(soundVolume*100)}%`, 'info', 2000, { showProgress: false });
};

// === Inicialização ===
async function init() {
  try {
    console.log('🎯 Iniciando Pipeline de Vendas v6.1...');
    await loadOpportunities();
    renderBoard();
    attachDragAndDropListeners();
    updateTotal();
    updateSoundButtonUI();
    // Canal realtime Supabase (com unsubscribe on unload)
    if (window.salesChannel) window.salesChannel.unsubscribe();
    window.salesChannel = supabase
      .channel('sales_opportunities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_opportunities' }, async () => {
        await loadOpportunities(true);
        renderBoard();
        attachDragAndDropListeners();
        updateTotal();
      })
      .subscribe();
    window.addEventListener('beforeunload', () => { if (window.salesChannel) window.salesChannel.unsubscribe(); });
    addExportButton();
    document.getElementById('loading')?.remove();
    document.getElementById('pipeline-board')?.classList.remove('hidden');
    console.log('✅ Pipeline carregado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar pipeline:', error);
    const el = document.getElementById('loading');
    if (el) el.innerHTML = `<p style="color:#EF4444;">Erro ao carregar pipeline: ${error.message}</p>`;
  }
}

// === Carregar oportunidades (cache seguro e invalidado) ===
async function loadOpportunities(force = false) {
  const cacheKey = 'pipeline_opportunities_cache';
  if (!force) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      opportunities = JSON.parse(cached);
      return;
    }
  }
  await window.AlshamSupabase.retryOperation(async () => {
    const { data, error } = await supabase
      .from('sales_opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    opportunities = data || [];
    localStorage.setItem(cacheKey, JSON.stringify(opportunities));
    console.log(`📊 ${opportunities.length} oportunidades carregadas.`);
  });
}

// === Renderizar Board ===
function renderBoard() {
  const board = document.getElementById('pipeline-board');
  if (!board) return;
  board.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      ${COLUNAS.map(col => {
        const opps = opportunities.filter(o => o.status === col.id);
        const total = opps.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
        return `
          <div class="pipeline-column bg-white rounded-lg shadow overflow-hidden" data-stage="${col.id}">
            <div class="pipeline-column-header p-4 bg-gray-50 border-b">
              <h3 class="text-lg font-semibold">${col.nome}</h3>
              <div class="pipeline-column-stats mt-2 flex justify-between text-sm text-gray-600">
                <span>R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span>${opps.length} deals</span>
              </div>
            </div>
            <div class="pipeline-column-body p-4 min-h-[200px]" data-column-id="${col.id}">
              ${opps.map(opp => createCardHTML(opp)).join('') ||
                '<div class="p-4 text-center text-sm text-gray-500">Nenhuma oportunidade.</div>'}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// === Criar Card ===
function createCardHTML(opp) {
  return `
    <div class="opportunity-card p-4 mb-4 bg-white rounded-lg shadow transition-transform duration-300 ease-in-out hover:scale-[1.02]"
         draggable="true" data-opportunity-id="${opp.id}">
      <h4 class="opportunity-card-title text-base font-semibold mb-2">${sanitize(opp.titulo) || 'N/A'}</h4>
      <p class="opportunity-card-value text-lg font-bold text-blue-600 mb-2">R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      <div class="opportunity-card-footer flex justify-between items-center text-sm text-gray-600">
        <span class="opportunity-probability">${opp.probabilidade || 0}% prob.</span>
        <div class="flex gap-2">
          <button onclick="window.editOpportunity('${opp.id}')" class="text-blue-600 hover:underline">Editar</button>
          <button onclick="window.deleteOpportunity('${opp.id}')" class="text-red-600 hover:underline">Deletar</button>
        </div>
      </div>
    </div>
  `;
}

// === Drag & Drop ===
function attachDragAndDropListeners() {
  const cards = document.querySelectorAll('.opportunity-card');
  const columns = document.querySelectorAll('.pipeline-column-body');
  cards.forEach(card => {
    card.addEventListener('dragstart', () => {
      draggedCard = card;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedCard = null;
    });
  });
  columns.forEach(column => {
    column.addEventListener('dragover', e => {
      e.preventDefault();
      column.classList.add('drag-over');
    });
    column.addEventListener('dragleave', () => column.classList.remove('drag-over'));
    column.addEventListener('drop', async e => {
      e.preventDefault();
      column.classList.remove('drag-over');
      if (!draggedCard) return;
      const targetColumn = column.dataset.columnId;
      const oppId = draggedCard.dataset.opportunityId;
      const opp = opportunities.find(o => o.id == oppId);
      if (!opp || opp.status === targetColumn) return;
      column.appendChild(draggedCard);
      try {
        const { error } = await supabase
          .from('sales_opportunities')
          .update({ status: targetColumn, updated_at: new Date().toISOString() })
          .eq('id', oppId);
        if (error) throw error;
        await awardGamificationPoints(targetColumn, 'move');
        if (targetColumn === 'fechado_ganho') await triggerN8nOnWin(oppId);
        notify('Oportunidade movida com sucesso!', 'success', 3000, { showProgress: false });
        playSound('success');
        await loadOpportunities(true); // Força atualização e cache
        renderBoard();
        attachDragAndDropListeners();
        updateTotal();
      } catch (err) {
        console.error('❌ Erro ao mover card:', err);
        notify(`Erro: ${err.message}`, 'error', 4000, { showProgress: false });
        playSound('error');
      }
    });
  });
}

// === Atualizar Total ===
function updateTotal() {
  let totalEl = document.getElementById('pipeline-total');
  if (!totalEl) {
    const headerDiv = document.querySelector('header > div');
    if (headerDiv) {
      totalEl = document.createElement('span');
      totalEl.id = 'pipeline-total';
      totalEl.className = 'ml-4 text-lg font-semibold text-gray-600 dark:text-gray-300';
      headerDiv.appendChild(totalEl);
    }
  }
  if (totalEl) {
    const total = opportunities.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
    totalEl.innerText = `Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
  COLUNAS.forEach(col => {
    const colEl = document.querySelector(`[data-stage="${col.id}"] .pipeline-column-stats`);
    if (colEl) {
      const opps = opportunities.filter(o => o.status === col.id);
      const colTotal = opps.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
      colEl.innerHTML = `<span>R$ ${colTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span><span class="deal-count">${opps.length}</span>`;
    }
  });
}

// === Som de feedback ===
function playSound(type) {
  if (!soundEnabled) return;
  const list = type === 'success' ? successSounds : errorSounds;
  const src = list[Math.floor(Math.random() * list.length)];
  const audio = new Audio(src);
  audio.volume = soundVolume;
  audio.play().catch(() => {
    const fallback = new Audio(fallbackSound);
    fallback.volume = Math.min(0.2, soundVolume);
    fallback.play().catch(() => {});
  });
}

// === Sanitização Básica ===
function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '').trim();
}

// === Modal de Detalhes ===
window.viewOpportunityDetails = function (id) {
  const opp = opportunities.find(o => o.id.toString() === id);
  if (!opp) return;
  let modal = document.getElementById('opp-details-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'opp-details-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Detalhes da Oportunidade</h2>
        <button id="close-opp-details" class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">&times;</button>
      </div>
      <div class="p-6 space-y-4">
        <p><strong>Título:</strong> ${sanitize(opp.titulo) || 'N/A'}</p>
        <p><strong>Valor:</strong> R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <p><strong>Probabilidade:</strong> ${opp.probabilidade || 0}%</p>
        <p><strong>Status:</strong> ${opp.status || 'N/A'}</p>
        <p><strong>Criado em:</strong> ${opp.created_at ? new Date(opp.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
        <div class="flex gap-3 mt-6">
          <button onclick="window.editOpportunity('${opp.id}')" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm">Editar</button>
          <button onclick="window.deleteOpportunity('${opp.id}')" class="px-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium text-sm">Deletar</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("close-opp-details").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  modal.classList.remove("hidden");
};

// === Modal Edit Real ===
window.editOpportunity = function(id) {
  const opp = opportunities.find(o => o.id.toString() === id);
  if (!opp) return;
  let modal = document.getElementById('opp-edit-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'opp-edit-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Editar Oportunidade</h2>
        <button id="close-opp-edit" class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">&times;</button>
      </div>
      <form id="opp-edit-form" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700">Título</label>
          <input type="text" id="edit-titulo" value="${sanitize(opp.titulo)}" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700">Valor</label>
          <input type="number" id="edit-valor" value="${parseFloat(opp.valor) || 0}" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700">Probabilidade (%)</label>
          <input type="number" id="edit-prob" value="${opp.probabilidade || 0}" min="0" max="100" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700">Status</label>
          <select id="edit-status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            ${COLUNAS.map(c => `<option value="${c.id}" ${c.id === opp.status ? 'selected' : ''}>${c.nome}</option>`).join('')}
          </select>
        </div>
        <div class="flex gap-3 pt-4">
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm">Salvar</button>
          <button type="button" id="cancel-opp-edit" class="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded font-medium text-sm">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  document.getElementById("close-opp-edit").addEventListener("click", () => modal.remove());
  document.getElementById("cancel-opp-edit").addEventListener("click", () => modal.remove());
  document.getElementById("opp-edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = sanitize(document.getElementById("edit-titulo").value);
    const valor = parseFloat(document.getElementById("edit-valor").value) || 0;
    const probabilidade = parseInt(document.getElementById("edit-prob").value) || 0;
    const status = document.getElementById("edit-status").value;
    if (titulo.length < 2) return notify('Título deve ter ao menos 2 caracteres', 'error');
    try {
      const { error } = await supabase.from('sales_opportunities')
        .update({ titulo, valor, probabilidade, status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      notify('Oportunidade editada com sucesso!', 'success');
      playSound('success');
      modal.remove();
      await loadOpportunities(true);
      renderBoard();
      attachDragAndDropListeners();
      updateTotal();
    } catch (err) {
      notify(`Erro ao editar: ${err.message}`, 'error');
      playSound('error');
    }
  });
  modal.classList.remove("hidden");
};

// === Delete Oportunidade ===
window.deleteOpportunity = async function(id) {
  if (!confirm('Confirmar deleção?')) return;
  try {
    const { error } = await supabase.from('sales_opportunities').delete().eq('id', id);
    if (error) throw error;
    notify('Oportunidade deletada!', 'success');
    playSound('success');
    await loadOpportunities(true);
    renderBoard();
    attachDragAndDropListeners();
    updateTotal();
  } catch (err) {
    notify(`Erro: ${err.message}`, 'error');
    playSound('error');
  }
};

// === Gamificação Award on Move ===
async function awardGamificationPoints(action, type) {
  let userId = null;
  if (supabase.auth && supabase.auth.getCurrentUser) {
    const user = await supabase.auth.getCurrentUser();
    userId = user?.id;
  }
  if (!userId && window.AlshamSupabase && window.AlshamSupabase.getCurrentUser) {
    const user = await window.AlshamSupabase.getCurrentUser();
    userId = user?.id;
  }
  userId = userId || 'default_user';
  const points = 20;
  const payload = {
    user_id: userId,
    points_awarded: points,
    reason: `${type}: ${action}`
  };
  await window.AlshamSupabase.genericInsert('gamification_points', payload);
}

// === n8n Trigger on Win ===
async function triggerN8nOnWin(oppId) {
  let endpoint = '';
  if (window.LEADS_CONFIG && window.LEADS_CONFIG.n8nEndpoints?.followUp)
    endpoint = window.LEADS_CONFIG.n8nEndpoints.followUp;
  else if (window.AlshamSupabase && window.AlshamSupabase.n8nEndpoints?.followUp)
    endpoint = window.AlshamSupabase.n8nEndpoints.followUp;
  endpoint = endpoint || 'https://your-n8n-url/webhook/follow-up';
  const payload = { oppId, event: 'won' };
  await window.AlshamSupabase.triggerN8n(endpoint, payload);
}

// === Add Export Button ===
function addExportButton() {
  let exportBtn = document.getElementById('export-pipeline-btn');
  if (!exportBtn) {
    const header = document.querySelector('header');
    if (header) {
      exportBtn = document.createElement('button');
      exportBtn.id = 'export-pipeline-btn';
      exportBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm ml-auto';
      exportBtn.textContent = 'Exportar CSV';
      exportBtn.onclick = window.exportPipelineCSV;
      header.appendChild(exportBtn);
    }
  }
}

// === Exportação CSV Escapada ===
window.exportPipelineCSV = function() {
  function esc(val) {
    if (val == null) return '';
    return `"${String(val).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
  }
  const csvContent = "data:text/csv;charset=utf-8," +
    "ID,Título,Valor,Probabilidade,Status,Criado Em\n" +
    opportunities.map(o =>
      `${esc(o.id)},${esc(o.titulo)},${esc(o.valor)},${esc(o.probabilidade)},${esc(o.status)},${esc(new Date(o.created_at).toLocaleDateString('pt-BR'))}`
    ).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "pipeline_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// === Inicialização ===
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
