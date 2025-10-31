/**
 * 🚀 ALSHAM 360° PRIMA - Main Application Script v3.1.1
 * ✅ Estável | Auto-inicialização | Melhorias de Resiliência, Sync e Logs
 * 🔧 FIX: Agora se auto-inicializa corretamente
 */

if (window.AlshamMainInitialized) {
  console.warn('⚠️ Main.js já foi inicializado. Ignorando segunda execução.');
} else {
  window.AlshamMainInitialized = true;

  // 🔁 Aguardando Supabase (até 20s)
  function waitForSupabase(callback, maxAttempts = 200, attempt = 0) {
    if (window.AlshamSupabase?.getCurrentSession) {
      console.log('✅ [MAIN] Supabase carregado para Main');
      callback();
    } else if (attempt >= maxAttempts) {
      console.error('❌ [MAIN] Supabase não carregou após 20 segundos — ativando modo demo');
      callback(); // continua em modo demo
    } else {
      setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
    }
  }

  waitForSupabase(() => {
    const {
      getCurrentSession,
      getCurrentOrgId,
      genericSelect,
      createAuditLog,
      subscribeToTable,
    } = window.AlshamSupabase || {};

    // ===== CONFIG GLOBAL =====
    const APP_CONFIG = {
      version: '3.1.1',
      environment: 'production',
      features: {
        realTimeUpdates: true,
        animations: true,
        gamification: true,
        notifications: true,
        analytics: true,
      },
      performance: {
        kpiUpdateInterval: 30000,
        leadsUpdateInterval: 45000,
        chartAnimationDuration: 1000,
        retryAttempts: 3,
        retryDelay: 2000,
      },
    };

    const AppState = {
      isInitialized: false,
      isDemoMode: false,
      timers: { kpi: null, leads: null },
      cache: new Map(),
      retryCount: 0,
      lastUpdate: null,
      user: null,
    };

    // ===== CACHE MANAGER =====
    class CacheManager {
      constructor(maxSize = 50, ttl = 300000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
      }
      set(key, value) {
        if (this.cache.size >= this.maxSize) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }
        this.cache.set(key, { value, expires: Date.now() + this.ttl });
      }
      get(key) {
        const item = this.cache.get(key);
        if (!item || Date.now() > item.expires) {
          this.cache.delete(key);
          return null;
        }
        return item.value;
      }
      clear() {
        this.cache.clear();
      }
    }
    const cacheManager = new CacheManager();

    // ===== ERROR HANDLER =====
    class ErrorHandler {
      static async track(error, context = {}) {
        const errorInfo = {
          message: error.message || error,
          stack: error.stack || null,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          context,
        };
        console.error('🚨 [MAIN] Application Error:', errorInfo);

        if (createAuditLog) {
          try {
            await createAuditLog('APP_ERROR', errorInfo);
          } catch (e) {
            console.warn('⚠️ [MAIN] Falha ao registrar erro no audit log:', e);
          }
        }
        this.showUserNotification(context.userMessage || 'Erro inesperado');
      }

      static showUserNotification(msg) {
        const toast = document.createElement('div');
        toast.textContent = msg;
        toast.style = `
          position:fixed;bottom:20px;right:20px;background:#1E40AF;
          color:white;padding:12px 20px;border-radius:8px;
          box-shadow:0 4px 8px rgba(0,0,0,0.3);z-index:9999;
          font-size:14px;animation:fadeIn 0.3s ease-out;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
      }
    }

    // ===== INIT =====
    async function initializeMain() {
      if (AppState.isInitialized) {
        console.warn('⚠️ [MAIN] Main já inicializado.');
        return;
      }

      try {
        console.info('🚀 [MAIN] ALSHAM 360° PRIMA - Main Script v3.1.1 iniciando...');
        await checkSupabaseAvailability();
        await initializeApplication();
        console.info('✅ [MAIN] Main inicializado com sucesso');
      } catch (error) {
        console.error('❌ [MAIN] Erro durante inicialização:', error);
        ErrorHandler.track(error, { phase: 'init', userMessage: 'Erro ao inicializar' });
        initializeDemoMode();
      }
    }

    // ===== SUPABASE CHECK =====
    async function checkSupabaseAvailability() {
      if (typeof genericSelect === 'function' && typeof getCurrentSession === 'function') {
        console.info('✅ [MAIN] Supabase disponível');
      } else {
        console.warn('⚠️ [MAIN] Supabase não disponível → modo demo');
        AppState.isDemoMode = true;
      }
    }

    // ===== APPLICATION =====
    async function initializeApplication() {
      try {
        AppState.user = (await getCurrentSession?.())?.user || null;
        
        if (AppState.user) {
          console.info(`👤 [MAIN] Usuário autenticado: ${AppState.user.email || AppState.user.id}`);
        }
        
        initializeAnimations();
        initializeGamification();

        if (APP_CONFIG.features.realTimeUpdates && !AppState.isDemoMode) {
          startRealTimeUpdates();
        }

        // 🔁 Tenta sincronizar com SW
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(reg => {
            reg.sync?.register('sync-dashboard').catch(() => {});
          });
        }

        AppState.isInitialized = true;
        AppState.lastUpdate = new Date();
        
        console.info('✅ [MAIN] Application inicializado:', {
          isDemoMode: AppState.isDemoMode,
          hasUser: !!AppState.user,
          timestamp: AppState.lastUpdate
        });
      } catch (error) {
        console.error('❌ [MAIN] Erro em initializeApplication:', error);
        throw error;
      }
    }

    // ===== DEMO MODE =====
    function initializeDemoMode() {
      console.info('🎭 [MAIN] Ativando Demo Mode');
      AppState.isDemoMode = true;
      AppState.isInitialized = true;
      
      window.demoData = {
        kpis: generateDemoKPIs(),
        leads: generateDemoLeads(),
        chartData: [12000, 15000, 18000, 20000, 17000, 21000, 25000],
      };
      
      console.info('✅ [MAIN] Demo mode ativado com dados de exemplo');
    }

    // ===== REALTIME =====
    function startRealTimeUpdates() {
      getCurrentOrgId?.().then(orgId => {
        if (orgId && subscribeToTable) {
          const tables = ['dashboard_kpis', 'leads_crm'];
          tables.forEach(table => {
            subscribeToTable(table, orgId, () => {
              console.log(`🔁 [MAIN] ${table} atualizado em tempo real`);
              cacheManager.clear();
            });
          });
          console.info('✅ [MAIN] Real-time updates ativados');
        }
      }).catch(err => {
        console.error('❌ [MAIN] Erro ao iniciar real-time:', err);
        ErrorHandler.track(err, { phase: 'realtime' });
      });
    }

    // ===== HELPERS =====
    function initializeAnimations() {
      if (APP_CONFIG.environment === 'production') return; // silencia animações no build
      console.log('✨ [MAIN] Animations initialized');
    }

    function initializeGamification() {
      if (APP_CONFIG.environment === 'production') return;
      console.log('🎮 [MAIN] Gamification initialized');
    }

    function generateDemoKPIs() {
      return {
        totalLeads: 123,
        qualifiedLeads: 45,
        conversionRate: 38,
        totalRevenue: 95000,
      };
    }

    function generateDemoLeads() {
      return Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        nome: ['Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Lima', 'Carla Souza'][i],
        empresa: ['Tech Corp', 'Inovação LTDA', 'Digital Plus', 'StartupX', 'Future Tech'][i],
        status: ['novo', 'qualificado', 'em_contato', 'convertido', 'perdido'][i],
        score_ia: Math.floor(Math.random() * 100),
        created_at: new Date().toISOString(),
      }));
    }

    // ===== EXPORT GLOBAL =====
    window.AlshamMain = {
      APP_CONFIG,
      AppState,
      initializeMain,
      cacheManager,
      ErrorHandler,
    };

    console.info('📦 [MAIN] ALSHAM 360° PRIMA Main Script v3.1.1 exportado para window.AlshamMain');
    
    // 🔧 FIX: AUTO-INICIALIZAÇÃO
    // Verifica se deve auto-inicializar (não inicializa na página index.html)
    const shouldAutoInit = window.location.pathname !== '/' && window.location.pathname !== '/index.html';
    
    if (shouldAutoInit) {
      console.info('🚀 [MAIN] Auto-inicializando (página: ' + window.location.pathname + ')...');
      // Aguarda um momento para garantir que tudo está pronto
      setTimeout(() => {
        initializeMain().catch(err => {
          console.error('❌ [MAIN] Erro na auto-inicialização:', err);
        });
      }, 100);
    } else {
      console.info('⏸️ [MAIN] Auto-inicialização desabilitada para index.html (será chamado manualmente se necessário)');
    }
  });
}
