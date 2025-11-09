// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 CORREÇÃO: BOTÃO NOVO LEAD + CORES DINÂMICAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. DETECTAR TEMA ATUAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const getCurrentTheme = () => {
  const themeButtons = document.querySelectorAll('[class*="GLASS_DARK"], [class*="PLATINUM"], [class*="MIDNIGHT"], [class*="DESERT"], [class*="NEON"], [class*="CYBER"]');
  
  for (const btn of themeButtons) {
    const classes = btn.className;
    if (classes.includes('active') || classes.includes('selected')) {
      if (classes.includes('GLASS')) return 'glass_dark';
      if (classes.includes('PLATINUM')) return 'platinum_glass';
      if (classes.includes('MIDNIGHT')) return 'midnight_aurora';
      if (classes.includes('DESERT')) return 'desert_quartz';
      if (classes.includes('NEON')) return 'neon_energy';
      if (classes.includes('CYBER')) return 'cyber_vivid';
    }
  }
  
  return 'glass_dark'; // default
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. CORES POR TEMA E STATUS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const themeColors = {
  glass_dark: {
    novo: { bg: '#1e3a5f', text: '#60a5fa' },
    contacted: { bg: '#3d2e5c', text: '#a78bfa' },
    qualified: { bg: '#1e5f3a', text: '#4ade80' },
    qualificado: { bg: '#1e5f3a', text: '#4ade80' },
    proposal: { bg: '#5f3a1e', text: '#fb923c' },
    negotiation: { bg: '#5f1e3a', text: '#f472b6' },
    em_negociacao: { bg: '#5f1e3a', text: '#f472b6' },
    won: { bg: '#0f5f2e', text: '#22c55e' },
    convertido: { bg: '#0f5f2e', text: '#22c55e' },
    perdido: { bg: '#5f1e1e', text: '#ef4444' },
    em_contato: { bg: '#3d2e5c', text: '#a78bfa' }
  },
  platinum_glass: {
    novo: { bg: '#e0e7ff', text: '#4f46e5' },
    contacted: { bg: '#f3e8ff', text: '#9333ea' },
    qualified: { bg: '#d1fae5', text: '#059669' },
    qualificado: { bg: '#d1fae5', text: '#059669' },
    proposal: { bg: '#fed7aa', text: '#ea580c' },
    negotiation: { bg: '#fce7f3', text: '#db2777' },
    em_negociacao: { bg: '#fce7f3', text: '#db2777' },
    won: { bg: '#bbf7d0', text: '#16a34a' },
    convertido: { bg: '#bbf7d0', text: '#16a34a' },
    perdido: { bg: '#fecaca', text: '#dc2626' },
    em_contato: { bg: '#f3e8ff', text: '#9333ea' }
  },
  midnight_aurora: {
    novo: { bg: '#1e40af', text: '#93c5fd' },
    contacted: { bg: '#7e22ce', text: '#d8b4fe' },
    qualified: { bg: '#047857', text: '#6ee7b7' },
    qualificado: { bg: '#047857', text: '#6ee7b7' },
    proposal: { bg: '#c2410c', text: '#fdba74' },
    negotiation: { bg: '#be185d', text: '#f9a8d4' },
    em_negociacao: { bg: '#be185d', text: '#f9a8d4' },
    won: { bg: '#15803d', text: '#86efac' },
    convertido: { bg: '#15803d', text: '#86efac' },
    perdido: { bg: '#b91c1c', text: '#fca5a5' },
    em_contato: { bg: '#7e22ce', text: '#d8b4fe' }
  },
  desert_quartz: {
    novo: { bg: '#d4a574', text: '#78350f' },
    contacted: { bg: '#c4b5a0', text: '#57534e' },
    qualified: { bg: '#a7c4a0', text: '#14532d' },
    qualificado: { bg: '#a7c4a0', text: '#14532d' },
    proposal: { bg: '#e9b888', text: '#9a3412' },
    negotiation: { bg: '#d4a5c0', text: '#831843' },
    em_negociacao: { bg: '#d4a5c0', text: '#831843' },
    won: { bg: '#93c5a0', text: '#166534' },
    convertido: { bg: '#93c5a0', text: '#166534' },
    perdido: { bg: '#d4a5a5', text: '#991b1b' },
    em_contato: { bg: '#c4b5a0', text: '#57534e' }
  },
  neon_energy: {
    novo: { bg: '#0ea5e9', text: '#ffffff' },
    contacted: { bg: '#8b5cf6', text: '#ffffff' },
    qualified: { bg: '#10b981', text: '#ffffff' },
    qualificado: { bg: '#10b981', text: '#ffffff' },
    proposal: { bg: '#f59e0b', text: '#ffffff' },
    negotiation: { bg: '#ec4899', text: '#ffffff' },
    em_negociacao: { bg: '#ec4899', text: '#ffffff' },
    won: { bg: '#22c55e', text: '#ffffff' },
    convertido: { bg: '#22c55e', text: '#ffffff' },
    perdido: { bg: '#ef4444', text: '#ffffff' },
    em_contato: { bg: '#8b5cf6', text: '#ffffff' }
  },
  cyber_vivid: {
    novo: { bg: '#00ffff', text: '#000000' },
    contacted: { bg: '#ff00ff', text: '#000000' },
    qualified: { bg: '#00ff00', text: '#000000' },
    qualificado: { bg: '#00ff00', text: '#000000' },
    proposal: { bg: '#ffff00', text: '#000000' },
    negotiation: { bg: '#ff0080', text: '#000000' },
    em_negociacao: { bg: '#ff0080', text: '#000000' },
    won: { bg: '#00ff80', text: '#000000' },
    convertido: { bg: '#00ff80', text: '#000000' },
    perdido: { bg: '#ff0000', text: '#ffffff' },
    em_contato: { bg: '#ff00ff', text: '#000000' }
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. ATUALIZAR CORES DOS LEADS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const updateLeadsColors = () => {
  const theme = getCurrentTheme();
  const colors = themeColors[theme];
  
  console.log('🎨 Aplicando tema:', theme);
  
  // Atualizar todos os badges de status
  document.querySelectorAll('[data-status]').forEach(badge => {
    const status = badge.getAttribute('data-status');
    const statusColors = colors[status] || colors.novo;
    
    badge.style.background = statusColors.bg;
    badge.style.color = statusColors.text;
  });
  
  console.log('✅ Cores atualizadas para tema:', theme);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. MODAL DE NOVO LEAD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const openNewLeadModal = () => {
  const modal = document.createElement('div');
  modal.id = 'new-lead-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 30px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
        ➕ Novo Lead
      </h2>
      
      <form id="new-lead-form" style="display: flex; flex-direction: column; gap: 15px;">
        <input type="text" name="nome" placeholder="Nome completo *" required 
               style="padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
        
        <input type="email" name="email" placeholder="Email *" required
               style="padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
        
        <input type="tel" name="telefone" placeholder="Telefone"
               style="padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
        
        <input type="text" name="empresa" placeholder="Empresa"
               style="padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
        
        <input type="text" name="cargo" placeholder="Cargo"
               style="padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
        
        <select name="origem" style="padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
          <option value="">Selecione a origem</option>
          <option value="Website">Website</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Indicação">Indicação</option>
          <option value="Evento">Evento</option>
          <option value="Google Ads">Google Ads</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
          <option value="Email Marketing">Email Marketing</option>
          <option value="Outro">Outro</option>
        </select>
        
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button type="submit" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
            Criar Lead
          </button>
          <button type="button" onclick="document.getElementById('new-lead-modal').remove()" 
                  style="flex: 1; padding: 12px; background: #f3f4f6; color: #6b7280; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handler do formulário
  document.getElementById('new-lead-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const leadData = {
      org_id: 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe',
      nome: formData.get('nome'),
      email: formData.get('email'),
      telefone: formData.get('telefone'),
      empresa: formData.get('empresa'),
      cargo: formData.get('cargo'),
      origem: formData.get('origem') || 'Website',
      status: 'novo',
      score_ia: Math.floor(Math.random() * 40) + 30 // 30-70
    };
    
    try {
      const { data, error } = await window.ALSHAM.supabase
        .from('leads_crm')
        .insert([leadData])
        .select();
      
      if (error) throw error;
      
      console.log('✅ Lead criado:', data[0]);
      alert('✅ Lead criado com sucesso!');
      modal.remove();
      
      // Recarregar leads
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Erro ao criar lead:', error);
      alert('❌ Erro ao criar lead: ' + error.message);
    }
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. CONECTAR BOTÃO "NOVO LEAD"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const connectNewLeadButton = () => {
  const buttons = document.querySelectorAll('button');
  
  for (const btn of buttons) {
    if (btn.textContent.includes('Novo Lead')) {
      btn.onclick = openNewLeadModal;
      console.log('✅ Botão "Novo Lead" conectado!');
      return;
    }
  }
  
  console.warn('⚠️ Botão "Novo Lead" não encontrado');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. OBSERVAR MUDANÇAS DE TEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const observeThemeChanges = () => {
  const themeButtons = document.querySelectorAll('button');
  
  themeButtons.forEach(btn => {
    if (btn.textContent.includes('GLASS') || 
        btn.textContent.includes('PLATINUM') ||
        btn.textContent.includes('MIDNIGHT') ||
        btn.textContent.includes('DESERT') ||
        btn.textContent.includes('NEON') ||
        btn.textContent.includes('CYBER')) {
      
      btn.addEventListener('click', () => {
        setTimeout(updateLeadsColors, 100);
      });
    }
  });
  
  console.log('✅ Observer de tema configurado');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. INICIALIZAR CORREÇÕES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setTimeout(() => {
  connectNewLeadButton();
  updateLeadsColors();
  observeThemeChanges();
  
  console.log('🎉 Correções aplicadas com sucesso!');
}, 1000);

console.log('🔧 Script de correção carregado!');
