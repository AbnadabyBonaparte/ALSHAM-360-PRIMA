/**
 * ALSHAM 360° PRIMA - Pipeline v6.2 (CORRIGIDO)
 * ✅ FIX: gamification_points com user_id e org_id corretos
 * ✅ FIX: waitForDependencies melhorado
 */

// ✅ Aguarda window globals
function waitForDependencies(callback, maxAttempts = 150, attempt = 0) {
  const hasSupabase = window.AlshamSupabase?.supabase;
  const hasNotification = window.showNotification;
  
  if (attempt % 10 === 0) {
    console.log(`[Pipeline] Tentativa ${attempt}/${maxAttempts}`, {
      hasSupabase: !!hasSupabase,
      hasNotification: !!hasNotification
    });
  }
  
  if (hasSupabase && hasNotification) {
    console.log('✅ Pipeline: Dependências OK!');
    callback();
  } else if (attempt >= maxAttempts) {
    console.error('❌ Pipeline: TIMEOUT após 15s');
    showError();
  } else {
    setTimeout(() => waitForDependencies(callback, maxAttempts, attempt + 1), 100);
  }
}

function showError() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.innerHTML = `
      <div style="color: #EF4444; text-align: center; padding: 2rem;">
        <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">
          ❌ Erro ao carregar Pipeline
        </h3>
        <p>Dependências não disponíveis. Recarregue a página.</p>
        <button onclick="location.reload()" 
                style="margin-top: 1rem; padding: 0.5rem 1rem; 
                       background: #3B82F6; color: white; 
                       border: none; border-radius: 0.5rem; cursor: pointer;">
          🔄 Recarregar
        </button>
      </div>
    `;
  }
}

waitForDependencies(() => {
  const supabase = window.AlshamSupabase.supabase;
  const notify = window.showNotification;

  const COLUNAS = [
    { id: 'qualificacao', nome: 'Qualificação' },
    { id: 'proposta', nome: 'Proposta' },
    { id: 'negociacao', nome: 'Negociação' },
    { id: 'fechado_ganho', nome: 'Fechado Ganho' },
    { id: 'perdido', nome: 'Perdido' }
  ];

  let opportunities = [];
  let draggedCard = null;

  // Sons
  const successSounds = ['/assets/sounds/success/success.mp3'];
  const errorSounds = ['/assets/sounds/error/error.mp3'];
  let soundVolume = parseFloat(localStorage.getItem('alsham_sound_volume')) || 0.25;
  let soundEnabled = localStorage.getItem('alsham_sound_enabled') === 'true';

  function updateSoundButtonUI() {
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) {
      btn.textContent = soundEnabled ? `🔊 ${Math.round(soundVolume*100)}%` : '🔇';
      btn.style.opacity = soundEnabled ? '1' : '0.6';
    }
  }

  window.toggleGlobalSound = function() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('alsham_sound_enabled', soundEnabled ? 'true' : 'false');
    updateSoundButtonUI();
    notify(soundEnabled ? 'Som ativo 🔊' : 'Som mudo 🔇', 'info', 2000);
  };

  async function init() {
    try {
      console.log('🎯 Pipeline v6.2 iniciando...');
      await loadOpportunities();
      renderBoard();
      attachDragAndDropListeners();
      updateTotal();
      updateSoundButtonUI();
      
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
      
      window.addEventListener('beforeunload', () => {
        if (window.salesChannel) window.salesChannel.unsubscribe();
      });
      
      addExportButton();
      document.getElementById('loading')?.remove();
      document.getElementById('pipeline-board')?.classList.remove('hidden');
      console.log('✅ Pipeline carregado');
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
      showError();
    }
  }

  async function loadOpportunities(force = false) {
    const cacheKey = 'pipeline_cache';
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        opportunities = JSON.parse(cached);
        return;
      }
    }
    const { data, error } = await supabase
      .from('sales_opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    opportunities = data || [];
    localStorage.setItem(cacheKey, JSON.stringify(opportunities));
    console.log(`📊 ${opportunities.length} oportunidades`);
  }

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
                  '<div class="p-4 text-center text-sm text-gray-500">Vazio</div>'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function createCardHTML(opp) {
    return `
      <div class="opportunity-card p-4 mb-4 bg-white rounded-lg shadow hover:scale-[1.02] transition-transform"
           draggable="true" data-opportunity-id="${opp.id}">
        <h4 class="text-base font-semibold mb-2">${sanitize(opp.titulo) || 'N/A'}</h4>
        <p class="text-lg font-bold text-blue-600 mb-2">
          R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <div class="flex justify-between items-center text-sm text-gray-600">
          <span>${opp.probabilidade || 0}%</span>
          <div class="flex gap-2">
            <button onclick="window.editOpportunity('${opp.id}')" class="text-blue-600">Editar</button>
            <button onclick="window.deleteOpportunity('${opp.id}')" class="text-red-600">Deletar</button>
          </div>
        </div>
      </div>
    `;
  }

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
          
          await awardGamificationPoints(targetColumn);
          if (targetColumn === 'fechado_ganho') await triggerN8nOnWin(oppId);
          
          notify('Movido com sucesso!', 'success', 2000);
          playSound('success');
          await loadOpportunities(true);
          renderBoard();
          attachDragAndDropListeners();
          updateTotal();
        } catch (err) {
          console.error('❌ Erro ao mover:', err);
          notify(`Erro: ${err.message}`, 'error', 3000);
          playSound('error');
        }
      });
    });
  }

  function updateTotal() {
    let totalEl = document.getElementById('pipeline-total');
    if (!totalEl) {
      const header = document.querySelector('header');
      if (header) {
        totalEl = document.createElement('span');
        totalEl.id = 'pipeline-total';
        totalEl.className = 'text-lg font-semibold text-gray-600 ml-4';
        header.appendChild(totalEl);
      }
    }
    if (totalEl) {
      const total = opportunities.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
      totalEl.innerText = `Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
  }

  function playSound(type) {
    if (!soundEnabled) return;
    const src = type === 'success' ? successSounds[0] : errorSounds[0];
    const audio = new Audio(src);
    audio.volume = soundVolume;
    audio.play().catch(() => {});
  }

  function sanitize(str) {
    if (!str) return '';
    return String(str).replace(/[<>]/g, '').trim();
  }

  // ✅ FIX CRÍTICO: Gamificação com user_id e org_id corretos
  async function awardGamificationPoints(action) {
    try {
      // Pega user autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn('⚠️ Sem usuário logado, pontos não registrados');
        return;
      }
      
      // Pega org_id
      const orgId = await window.AlshamSupabase.getCurrentOrgId() || 
                    window.AlshamSupabase.DEFAULT_ORG_ID;
      
      const payload = {
        user_id: user.id,           // ✅ UUID válido
        org_id: orgId,              // ✅ org_id correto
        activity_type: 'pipeline_move', // ✅ activity_type
        points_awarded: 20,
        related_entity_id: null,
        metadata: { action, timestamp: new Date().toISOString() }
      };
      
      const { error } = await supabase
        .from('gamification_points')
        .insert(payload);
      
      if (error) throw error;
      console.log('✅ Pontos registrados:', payload);
    } catch (err) {
      console.error('❌ Erro ao registrar pontos:', err);
    }
  }

  async function triggerN8nOnWin(oppId) {
    const endpoint = window.LEADS_CONFIG?.n8nEndpoints?.followUp || 
                     'https://your-n8n-url/webhook/follow-up';
    await window.AlshamSupabase.triggerN8n(endpoint, { oppId, event: 'won' });
  }

  function addExportButton() {
    const header = document.querySelector('header');
    if (header && !document.getElementById('export-pipeline-btn')) {
      const btn = document.createElement('button');
      btn.id = 'export-pipeline-btn';
      btn.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm';
      btn.textContent = 'Exportar CSV';
      btn.onclick = window.exportPipelineCSV;
      header.appendChild(btn);
    }
  }

  window.exportPipelineCSV = function() {
    const esc = val => val == null ? '' : `"${String(val).replace(/"/g, '""')}"`;
    const csv = "data:text/csv;charset=utf-8," +
      "ID,Título,Valor,Probabilidade,Status,Criado\n" +
      opportunities.map(o =>
        `${esc(o.id)},${esc(o.titulo)},${esc(o.valor)},${esc(o.probabilidade)},${esc(o.status)},${esc(o.created_at)}`
      ).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "pipeline.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  window.editOpportunity = function(id) {
    notify('Modal de edição em desenvolvimento', 'info', 2000);
  };

  window.deleteOpportunity = async function(id) {
    if (!confirm('Deletar?')) return;
    try {
      const { error } = await supabase.from('sales_opportunities').delete().eq('id', id);
      if (error) throw error;
      notify('Deletado!', 'success', 2000);
      await loadOpportunities(true);
      renderBoard();
      attachDragAndDropListeners();
      updateTotal();
    } catch (err) {
      notify(`Erro: ${err.message}`, 'error', 3000);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('🚀 Pipeline v6.2 carregado');
});
