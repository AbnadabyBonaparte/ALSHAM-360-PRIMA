// src/utils/exportLeads.ts

/**
 * Exporta leads para arquivo CSV
 */
export function exportLeadsToCSV(leads: any[], filename: string = 'leads') {
  if (!leads || leads.length === 0) {
    alert('Nenhum lead para exportar');
    return;
  }

  // Cabeçalhos
  const headers = [
    'Nome',
    'Email',
    'Telefone',
    'Empresa',
    'Status',
    'Score IA',
    'Origem',
    'Data Criação',
    'Conversão Prevista (%)',
    'Health Score',
    'Risk Score'
  ];

  // Converter leads para linhas CSV
  const rows = leads.map(lead => [
    lead.nome || '',
    lead.email || '',
    lead.telefone || lead.phone || '',
    lead.empresa || lead.company || '',
    lead.status || 'novo',
    lead.score_ia || 0,
    lead.origem || lead.source || '',
    new Date(lead.created_at).toLocaleDateString('pt-BR'),
    lead.ai_conversion_probability || 0,
    lead.ai_health_score || 0,
    lead.ai_risk_score || 0
  ]);

  // Montar CSV
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n');

  // Adicionar BOM para UTF-8 (Excel reconhecer acentos)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log(`✅ ${leads.length} leads exportados para CSV`);
}

/**
 * Exporta leads para arquivo JSON
 */
export function exportLeadsToJSON(leads: any[], filename: string = 'leads') {
  if (!leads || leads.length === 0) {
    alert('Nenhum lead para exportar');
    return;
  }

  const jsonContent = JSON.stringify(leads, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log(`✅ ${leads.length} leads exportados para JSON`);
}

/**
 * Copia leads para clipboard (útil para colar no Excel)
 */
export async function copyLeadsToClipboard(leads: any[]) {
  if (!leads || leads.length === 0) {
    alert('Nenhum lead para copiar');
    return;
  }

  const headers = ['Nome', 'Email', 'Telefone', 'Empresa', 'Status', 'Score'];
  const rows = leads.map(lead => [
    lead.nome || '',
    lead.email || '',
    lead.telefone || '',
    lead.empresa || '',
    lead.status || 'novo',
    lead.score_ia || 0
  ]);

  const text = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    alert(`✅ ${leads.length} leads copiados! Cole no Excel com Ctrl+V`);
  } catch (err) {
    console.error('Erro ao copiar:', err);
    alert('❌ Erro ao copiar para clipboard');
  }
}
