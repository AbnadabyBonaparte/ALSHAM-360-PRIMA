// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - ROTAS CENTRALIZADAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗺️ SINGLE SOURCE OF TRUTH - Constantes de rotas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Constantes de rotas do ALSHAM 360° PRIMA
 *
 * Todas as rotas devem corresponder aos IDs registrados em App.tsx
 * e aos links definidos em sidebarStructure.ts
 *
 * @example
 * ```tsx
 * import { ROUTES } from '@/config/routes';
 *
 * // Navegação
 * navigate(ROUTES.CRM.LEADS.LIST);
 *
 * // Rotas dinâmicas
 * navigate(ROUTES.CRM.LEADS.DETAILS('123'));
 * ```
 */
export const ROUTES = {
  // ────────────────────────────────────────────────────────────────────
  // CRM CORE
  // ────────────────────────────────────────────────────────────────────
  CRM: {
    DASHBOARD: 'dashboard-principal',

    LEADS: {
      LIST: 'leads-lista',
      DETAILS: 'leads-detalhes',
      IMPORT: 'leads-importacao',
    },

    CONTACTS: {
      LIST: 'contatos-lista',
      DETAILS: 'contatos-detalhes',
    },

    ACCOUNTS: {
      LIST: 'contas-empresas-lista',
      DETAILS: 'contas-detalhes',
    },

    OPPORTUNITIES: {
      LIST: 'oportunidades-lista',
      KANBAN: 'oportunidades-kanban',
    },

    PIPELINE: 'pipeline-de-vendas',
    ACTIVITIES: 'atividades-tarefas',
    CALENDAR: 'calendario',
    QUOTES: 'cotacoes',
    PROPOSALS: 'propostas-comerciais',
  },

  // ────────────────────────────────────────────────────────────────────
  // MARKETING
  // ────────────────────────────────────────────────────────────────────
  MARKETING: {
    CAMPAIGNS: {
      LIST: 'campanhas-lista',
      CREATE_EDIT: 'campanhas-criar-editar',
    },

    EMAIL: {
      DASHBOARD: 'email-marketing-dashboard',
      TEMPLATES: 'email-marketing-templates',
      SENDS: 'email-marketing-envios',
    },

    LANDING_PAGES: {
      LIST: 'landing-pages-lista',
      BUILDER: 'landing-pages-builder',
    },

    FORMS: {
      LIST: 'formularios-lista',
      BUILDER: 'formularios-builder',
    },

    SOCIAL: {
      DASHBOARD: 'redes-sociais-dashboard',
      SCHEDULING: 'redes-sociais-agendamento',
    },

    AUTOMATION: 'automacao-de-marketing',
  },

  // ────────────────────────────────────────────────────────────────────
  // SUPORTE AO CLIENTE
  // ────────────────────────────────────────────────────────────────────
  SUPPORT: {
    TICKETS: {
      LIST: 'tickets-lista',
      DETAILS: 'tickets-detalhes',
    },

    LIVE_CHAT: 'chat-ao-vivo',
    KNOWLEDGE_BASE: 'base-de-conhecimento',
    FEEDBACK: 'feedback-de-clientes',
    PORTAL: 'portal-do-cliente',
    SLA_METRICS: 'slas-e-metricas',
    INTEGRATIONS: 'integracoes-de-suporte',
  },

  // ────────────────────────────────────────────────────────────────────
  // ANALYTICS & RELATÓRIOS
  // ────────────────────────────────────────────────────────────────────
  ANALYTICS: {
    DASHBOARD: 'analytics-dashboard',
    CUSTOM_REPORTS: 'relatorios-personalizados',
    SALES_FORECAST: 'forecasting-de-vendas',
    ROI_ANALYSIS: 'analise-de-roi',
    COHORT_ANALYSIS: 'cohort-analysis',
    MARKETING_ATTRIBUTION: 'atribuicao-de-marketing',
    HEATMAPS: 'heatmaps-e-sessoes',
    AB_TESTING: 'a-b-testing',
    EXECUTIVE_REPORTS: 'executive-reports',
    DATA_EXPORT_IMPORT: 'data-export-import',
  },

  // ────────────────────────────────────────────────────────────────────
  // AUTOMAÇÃO & IA
  // ────────────────────────────────────────────────────────────────────
  AUTOMATION: {
    WORKFLOWS: {
      LIST: 'workflows-lista',
      BUILDER: 'workflows-builder',
    },

    SALES_SEQUENCES: 'sequences-de-vendas',
    AI_INSIGHTS: 'ai-insights',
    AI_ASSISTANT: 'ai-assistant',
    PLAYBOOKS: 'playbooks-de-vendas',
    TASK_AUTOMATION: 'automacao-de-tarefas',
  },

  // ────────────────────────────────────────────────────────────────────
  // GAMIFICAÇÃO
  // ────────────────────────────────────────────────────────────────────
  GAMIFICATION: {
    LEADERBOARDS: 'leaderboards',
    BADGES: 'badges-e-conquistas',
    GOALS: 'metas-e-desafios',
    POINTS: 'pontuacao-e-niveis',
    COMPETITIONS: 'competitions',
    REWARDS: 'rewards-store',
    FEEDBACK: 'feedback-gamificado',
    ANALYTICS: 'analytics-de-gamificacao',
  },

  // ────────────────────────────────────────────────────────────────────
  // OMNICHANNEL
  // ────────────────────────────────────────────────────────────────────
  OMNICHANNEL: {
    UNIFIED_INBOX: 'inbox-unificada',
    EMAIL_INBOX: 'email-inbox',
    CALLS_VOIP: 'chamadas-e-voip',
    VIRTUAL_MEETINGS: 'reunioes-virtuais',
    SMS: 'sms-marketing',
    WHATSAPP: 'whatsapp-business',
    CHATBOTS: 'chatbots-config',
    VOICE_ANALYTICS: 'voice-analytics',
    SOCIAL_LISTENING: 'social-listening',
    PUSH_NOTIFICATIONS: 'push-notifications',
    API: 'api-de-comunicacao',
    ANALYTICS: 'omnichannel-analytics',
  },

  // ────────────────────────────────────────────────────────────────────
  // GESTÃO DE EQUIPES
  // ────────────────────────────────────────────────────────────────────
  TEAMS: {
    LIST: 'equipes-lista',
    USERS: 'usuarios-lista',
    ROLES_PERMISSIONS: 'funcoes-e-permissoes',
    TERRITORIES: 'territorios-e-cotas',
    COMMISSIONS: 'comissoes',
    GOALS: 'metas-de-equipe',
    TRAINING: 'treinamentos',
    PERFORMANCE: 'performance-reviews',
  },

  // ────────────────────────────────────────────────────────────────────
  // INTEGRAÇÕES
  // ────────────────────────────────────────────────────────────────────
  INTEGRATIONS: {
    MARKETPLACE: 'marketplace-de-apps',
    API_CONSOLE: 'api-console',
    WEBHOOKS: 'webhooks',
    GOOGLE_WORKSPACE: 'integracao-google-workspace',
    MICROSOFT_365: 'integracao-microsoft-365',
    ERPS: 'integracao-com-erps',
    PAYMENTS: 'pagamentos-integrados',
    ECOMMERCE: 'e-commerce-integrations',
    BI_TOOLS: 'bi-tools-integration',
    CUSTOM: 'custom-integrations',
  },

  // ────────────────────────────────────────────────────────────────────
  // CONFIGURAÇÕES & ADMIN
  // ────────────────────────────────────────────────────────────────────
  SETTINGS: {
    GENERAL: 'configuracoes-gerais',
    NOTIFICATIONS: 'notificacoes',
    EMAIL_CONFIG: 'email-config',
    BILLING: 'cobranca-e-planos',
    BRANDING: 'branding-personalizado',
    CUSTOM_FIELDS: 'campos-customizados',
    PRIVACY: 'privacidade-de-dados',
    BACKUPS: 'backups-e-restore',
    AUDIT_LOGS: 'logs-de-auditoria',
    SECURITY: 'seguranca-avancada',
    ONBOARDING: 'onboarding-wizard',
    MIGRATION: 'migracao-de-dados',
    API_KEYS: 'api-keys-management',
    MOBILE_APP: 'mobile-app-config',
    SYSTEM_STATUS: 'system-status',
  },

  // ────────────────────────────────────────────────────────────────────
  // COMUNIDADE & SUPORTE
  // ────────────────────────────────────────────────────────────────────
  COMMUNITY: {
    HELP_CENTER: 'centro-de-ajuda',
    NEWS: 'novidades',
    RESOURCES: 'recursos-e-templates',
    COMMUNITY: 'comunidade',
    SUCCESS_STORIES: 'historias-de-sucesso',
  },

  // ────────────────────────────────────────────────────────────────────
  // PÁGINAS IMPLEMENTADAS (LEGACY - compatibilidade)
  // ────────────────────────────────────────────────────────────────────
  ANALYTICS_OLD: 'analytics', // Mapeado para ANALYTICS.DASHBOARD
  AUTOMACOES: 'automacoes', // Mapeado para AUTOMATION.WORKFLOWS.LIST
  FINANCEIRO: 'financeiro', // Página custom
  GAMIFICACAO: 'gamificacao', // Mapeado para GAMIFICATION.LEADERBOARDS
  PUBLICACAO: 'publicacao', // Página custom de publicação
  SEGURANCA: 'seguranca', // Mapeado para SETTINGS.SECURITY
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 TYPE HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extrai todos os valores de rota recursivamente
 */
type ExtractRouteValues<T> = T extends string
  ? T
  : T extends object
  ? { [K in keyof T]: ExtractRouteValues<T[K]> }[keyof T]
  : never;

/**
 * Tipo union de todas as rotas possíveis
 */
export type AppRoute = ExtractRouteValues<typeof ROUTES>;

/**
 * Helper para verificar se uma string é uma rota válida
 */
export function isValidRoute(route: string): route is AppRoute {
  const allRoutes = getAllRoutesFlat();
  return allRoutes.includes(route);
}

/**
 * Obtém todas as rotas como array flat
 */
export function getAllRoutesFlat(): string[] {
  const routes: string[] = [];

  function extract(obj: any) {
    if (typeof obj === 'string') {
      routes.push(obj);
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        extract(obj[key]);
      }
    }
  }

  extract(ROUTES);
  return [...new Set(routes)]; // Remove duplicatas
}

/**
 * Mapeia rotas legadas para novas rotas
 */
export const ROUTE_ALIASES: Record<string, AppRoute> = {
  // Aliases antigos → novos
  analytics: 'analytics-dashboard',
  automacoes: 'workflows-lista',
  gamificacao: 'leaderboards',
  seguranca: 'seguranca-avancada',

  // Correções de inconsistências (da sidebar antiga)
  'contratos-lista': 'propostas-comerciais', // Não existe rota de contratos
  'faturas-lista': 'cobranca-e-planos', // Não existe rota de faturas
  inbox: 'inbox-unificada',
  'whatsapp-chat': 'whatsapp-business',
  'relatorios-dashboard': 'relatorios-personalizados',
  configuracoes: 'configuracoes-gerais',
};

/**
 * Normaliza uma rota, aplicando aliases se necessário
 */
export function normalizeRoute(route: string): AppRoute {
  // Se existe um alias, retorna o mapeamento
  if (route in ROUTE_ALIASES) {
    return ROUTE_ALIASES[route];
  }

  // Se é uma rota válida, retorna ela mesma
  if (isValidRoute(route)) {
    return route;
  }

  // Fallback: retorna dashboard
  console.warn(`[ROUTES] Rota desconhecida: "${route}". Redirecionando para dashboard.`);
  return 'dashboard-principal';
}

/**
 * Constrói breadcrumbs para uma rota
 */
export function getBreadcrumbs(route: AppRoute): { label: string; route: AppRoute }[] {
  // TODO: Implementar lógica de breadcrumbs baseada na estrutura da sidebar
  return [
    { label: 'Dashboard', route: 'dashboard-principal' },
    { label: 'Página Atual', route },
  ];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 ESTATÍSTICAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Retorna estatísticas sobre as rotas
 */
export function getRoutesStats() {
  const allRoutes = getAllRoutesFlat();
  const uniqueRoutes = new Set(allRoutes);

  return {
    total: uniqueRoutes.size,
    aliases: Object.keys(ROUTE_ALIASES).length,
    duplicates: allRoutes.length - uniqueRoutes.size,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧪 VALIDAÇÃO (DESENVOLVIMENTO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (import.meta.env.DEV) {
  // Verifica duplicatas
  const allRoutes = getAllRoutesFlat();
  const duplicates = allRoutes.filter((route, index) => allRoutes.indexOf(route) !== index);

  if (duplicates.length > 0) {
    console.warn('[ROUTES] Rotas duplicadas encontradas:', duplicates);
  }

  // Verifica aliases inválidos
  for (const [alias, target] of Object.entries(ROUTE_ALIASES)) {
    if (!isValidRoute(target)) {
      console.error(`[ROUTES] Alias "${alias}" aponta para rota inválida: "${target}"`);
    }
  }

  // Log estatísticas
  console.log('[ROUTES] Estatísticas:', getRoutesStats());
}
