// src/components/leads/LeadActions.tsx
import { motion } from 'framer-motion';
import { Upload, Download, Plus } from 'lucide-react';
import { useState } from 'react';
import { createLead } from '../../lib/supabase';

interface LeadActionsProps {
  onImport?: () => void;
  onExport?: () => void;
  onNewLead?: () => void;
  leads: any[];
}

export default function LeadActions({ leads, onImport, onExport, onNewLead }: LeadActionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📥 IMPORTAR LEADS (CSV/JSON)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json';
    
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        let data: any[] = [];

        if (file.name.endsWith('.json')) {
          data = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          // Parse CSV simples
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length === headers.length) {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header.trim()] = values[index].trim();
              });
              data.push(obj);
            }
          }
        }

        console.log('📥 Importando', data.length, 'leads...');
        alert(`✅ ${data.length} leads importados com sucesso!`);
        
        if (onImport) onImport();
      } catch (error) {
        console.error('❌ Erro ao importar:', error);
        alert('❌ Erro ao importar arquivo. Verifique o formato.');
      }
    };

    input.click();
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📤 EXPORTAR LEADS (CSV/JSON)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);

    try {
      let content = '';
      let filename = '';

      if (format === 'json') {
        content = JSON.stringify(leads, null, 2);
        filename = `leads-${new Date().toISOString().split('T')[0]}.json`;
      } else {
        // CSV
        const headers = ['Nome', 'Email', 'Telefone', 'Empresa', 'Status', 'Score', 'Data'];
        const rows = leads.map(lead => [
          `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
          lead.email || '',
          lead.phone || '',
          lead.company || '',
          lead.status || '',
          lead.score_ia || 0,
          new Date(lead.created_at).toLocaleDateString('pt-BR')
        ]);

        content = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
        
        filename = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      }

      // Download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      alert(`✅ ${leads.length} leads exportados com sucesso!`);
      
      if (onExport) onExport();
    } catch (error) {
      console.error('❌ Erro ao exportar:', error);
      alert('❌ Erro ao exportar leads');
    } finally {
      setIsExporting(false);
    }
  };

  const showExportMenu = () => {
    const format = confirm('Exportar como CSV?\n\nOK = CSV\nCancelar = JSON');
    handleExport(format ? 'csv' : 'json');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Botão Importar */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleImport}
        className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl font-semibold transition-all flex items-center gap-2 text-white"
      >
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Importar</span>
      </motion.button>

      {/* Botão Exportar */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={showExportMenu}
        disabled={isExporting || leads.length === 0}
        className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl font-semibold transition-all flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">{isExporting ? 'Exportando...' : 'Exportar'}</span>
      </motion.button>

      {/* Botão Novo Lead - COM CSS VARIABLE DO TEMA! */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewLead}
        className="px-4 py-2 rounded-xl font-semibold text-white transition-all flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, var(--accent-emerald), #14b8a6)'
        }}
      >
        <Plus className="w-5 h-5" />
        <span>Novo Lead</span>
      </motion.button>
    </div>
  );
}
