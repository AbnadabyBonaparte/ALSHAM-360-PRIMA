/**
 * 🎨 Chart Loader - Lazy load Chart.js sob demanda
 * Carrega apenas quando usuário interage com gráficos
 */

let chartInstance = null;

export async function loadChartJS() {
  if (chartInstance) return chartInstance;
  
  try {
    const { default: Chart } = await import('chart.js/auto');
    chartInstance = Chart;
    console.log('✅ Chart.js carregado dinamicamente');
    return Chart;
  } catch (error) {
    console.error('❌ Erro ao carregar Chart.js:', error);
    throw error;
  }
}

export async function createChart(canvasId, config) {
  const Chart = await loadChartJS();
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    throw new Error(`Canvas ${canvasId} não encontrado`);
  }
  return new Chart(ctx, config);
}
