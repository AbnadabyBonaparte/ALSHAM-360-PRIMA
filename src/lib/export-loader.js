/**
 * 📄 Export Loader - Lazy load jsPDF e XLSX sob demanda
 * Carrega apenas quando usuário clica em exportar
 */

let jsPDFInstance = null;
let XLSXInstance = null;

export async function loadJsPDF() {
  if (jsPDFInstance) return jsPDFInstance;
  
  try {
    const { jsPDF } = await import('jspdf');
    jsPDFInstance = jsPDF;
    console.log('✅ jsPDF carregado dinamicamente');
    return jsPDF;
  } catch (error) {
    console.error('❌ Erro ao carregar jsPDF:', error);
    throw error;
  }
}

export async function loadXLSX() {
  if (XLSXInstance) return XLSXInstance;
  
  try {
    const XLSX = await import('xlsx');
    XLSXInstance = XLSX;
    console.log('✅ XLSX carregado dinamicamente');
    return XLSX;
  } catch (error) {
    console.error('❌ Erro ao carregar XLSX:', error);
    throw error;
  }
}

export async function exportToPDF(data, filename = 'relatorio.pdf') {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF();
  // Sua lógica de export PDF aqui
  doc.save(filename);
}

export async function exportToExcel(data, filename = 'relatorio.xlsx') {
  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename);
}
