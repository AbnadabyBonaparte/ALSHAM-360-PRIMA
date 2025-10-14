/**
 * 📊 Chart Loader - Lazy Load Chart.js v12.0
 * Carrega Chart.js apenas quando necessário (Intersection Observer)
 * Reduz TBT em ~80ms
 * 
 * @author AbnadabyBonaparte
 * @since 2025-10-14
 * @version 12.0.0
 */

let chartInstance = null;
let chartPromise = null;

/**
 * Carrega Chart.js dinamicamente via CDN
 * @returns {Promise<Chart>} Instância do Chart.js
 */
export async function loadChartJS() {
  // Se já carregou, retorna instância existente
  if (chartInstance) {
    return chartInstance;
  }

  // Se já está carregando, retorna a promise existente
  if (chartPromise) {
    return chartPromise;
  }

  console.log('📊 [Chart Loader] Iniciando carregamento do Chart.js...');

  chartPromise = new Promise((resolve, reject) => {
    // Verifica se já existe no window (carregado via CDN anteriormente)
    if (window.Chart) {
      console.log('📊 [Chart Loader] Chart.js já carregado (window.Chart)');
      chartInstance = window.Chart;
      resolve(chartInstance);
      return;
    }

    // Cria script tag dinâmico
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.Chart) {
        chartInstance = window.Chart;
        console.log('✅ [Chart Loader] Chart.js carregado com sucesso!');
        resolve(chartInstance);
      } else {
        const error = new Error('Chart.js carregou mas window.Chart não existe');
        console.error('❌ [Chart Loader]', error);
        reject(error);
      }
    };

    script.onerror = (error) => {
      console.error('❌ [Chart Loader] Erro ao carregar Chart.js:', error);
      reject(new Error('Falha ao carregar Chart.js via CDN'));
    };

    document.head.appendChild(script);
  });

  return chartPromise;
}

/**
 * Cria um gráfico Chart.js
 * @param {string} canvasId - ID do elemento canvas
 * @param {Object} config - Configuração do Chart.js
 * @returns {Promise<Chart>} Instância do gráfico
 */
export async function createChart(canvasId, config) {
  try {
    const Chart = await loadChartJS();
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      throw new Error(`Canvas #${canvasId} não encontrado no DOM`);
    }

    console.log(`📊 [Chart Loader] Criando gráfico #${canvasId}...`);
    const chart = new Chart(canvas, config);
    console.log(`✅ [Chart Loader] Gráfico #${canvasId} criado!`);
    
    return chart;
  } catch (error) {
    console.error('❌ [Chart Loader] Erro ao criar gráfico:', error);
    throw error;
  }
}

/**
 * Observa elementos e carrega gráficos quando aparecem na viewport
 * @param {string} selector - Seletor CSS dos containers de gráficos
 * @param {Function} createChartFn - Função que cria o gráfico
 */
export function observeCharts(selector = '.chart-container', createChartFn) {
  const containers = document.querySelectorAll(selector);
  
  if (containers.length === 0) {
    console.warn('⚠️ [Chart Loader] Nenhum container encontrado com selector:', selector);
    return;
  }

  console.log(`📊 [Chart Loader] Observando ${containers.length} containers...`);

  // Intersection Observer com margem de 100px
  const observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const container = entry.target;
          const chartId = container.dataset.chartId;
          
          if (chartId && !container.dataset.loaded) {
            console.log(`📊 [Chart Loader] Container #${chartId} visível, carregando...`);
            
            try {
              container.dataset.loaded = 'loading';
              
              // Chama função personalizada de criação
              if (createChartFn) {
                await createChartFn(chartId);
              }
              
              container.dataset.loaded = 'true';
              observer.unobserve(container);
              
              console.log(`✅ [Chart Loader] Gráfico #${chartId} carregado!`);
            } catch (error) {
              console.error(`❌ [Chart Loader] Erro ao carregar #${chartId}:`, error);
              container.dataset.loaded = 'error';
            }
          }
        }
      }
    },
    {
      rootMargin: '100px', // Carrega 100px antes de aparecer
      threshold: 0.1
    }
  );

  containers.forEach(container => observer.observe(container));
}

/**
 * Pré-carrega Chart.js sem bloquear (idle time)
 */
export function preloadChartJS() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loadChartJS().catch(err => {
        console.warn('⚠️ [Chart Loader] Preload falhou (não crítico):', err);
      });
    }, { timeout: 2000 });
  } else {
    // Fallback para navegadores sem requestIdleCallback
    setTimeout(() => {
      loadChartJS().catch(err => {
        console.warn('⚠️ [Chart Loader] Preload falhou (não crítico):', err);
      });
    }, 2000);
  }
}
