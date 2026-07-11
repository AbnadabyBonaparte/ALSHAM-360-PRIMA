// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - ESTRUTURA CENTRALIZADA DA SIDEBAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 SINGLE SOURCE OF TRUTH - Estrutura completa de navegação
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import React from 'react';
import {
  Target,
  Users,
  UserCircle,
  GitBranch,
  FileText,
  FileSignature,
  Receipt,
  Wallet,
  Rocket,
  Mail,
  Send,
  FileSpreadsheet,
  Layout,
  ShieldCheck,
  Headphones,
  MessageCircle,
  BookOpen,
  MessageSquare,
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  Activity,
  FileBarChart,
  Brain,
  Zap,
  Workflow,
  Sparkles,
  BookMarked,
  CheckSquare,
  Flame,
  Trophy,
  Award,
  Target as TargetIcon,
  Gift,
  ThumbsUp,
  BarChart3,
  Globe2,
  Inbox,
  Phone,
  Video,
  MessageSquareText,
  Bot,
  Mic,
  Podcast,
  Bell,
  Share2,
  BarChart2,
  Users as UsersIcon,
  UserCheck,
  Shield,
  MapPin,
  DollarSign,
  GraduationCap,
  Star,
  Compass,
  ShoppingBag,
  Terminal,
  Webhook,
  Cloud,
  Building,
  CreditCard,
  ShoppingCart,
  Package,
  Plug,
  Settings,
  BellRing,
  MailCheck,
  Layers,
  Palette,
  Sliders,
  Lock,
  Database,
  Archive,
  FileSearch,
  Key,
  Smartphone,
  Server,
  HeartPulse,
  HelpCircle,
  Newspaper,
  Briefcase,
  MessageCircleHeart,
  Lightbulb,
  Calendar,
  LayoutDashboard,
} from 'lucide-react';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 TIPOS E INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Status de implementação de uma página
 */
export type PageStatus = 'implemented' | 'placeholder' | 'planned';
/**
 * Link individual da sidebar
 */
export interface SidebarLink {
  /** ID único da rota (deve corresponder ao registrado no App.tsx) */
  id: string;
  /** Label exibido na navegação */
  label: string;
  /** Ícone do link (opcional) */
  icon?: React.ReactNode;
  /** Status de implementação */
  status?: PageStatus;
  /** Badge opcional (ex: "Novo", "Beta", número de notificações) */
  badge?: string | number;
  /** Descrição curta para tooltips */
  description?: string;
  /** Sublinks (para menus hierárquicos) */
  children?: SidebarLink[];
  /** Roles/permissões necessárias para acessar */
  roles?: string[];
  /** Se true, o link não será exibido */
  hidden?: boolean;
}
/**
 * Categoria da sidebar
 */
export interface SidebarCategory {
  /** ID único da categoria */
  id: string;
  /** Label da categoria */
  label: string;
  /** Ícone da categoria */
  icon: React.ReactNode;
  /** Cor de destaque (CSS variable ou hex) */
  accentColor: string;
  /** Links da categoria */
  links: SidebarLink[];
  /** Se true, a categoria começa colapsada */
  defaultCollapsed?: boolean;
  /** Descrição da categoria */
  description?: string;
  /** Badge da categoria */
  badge?: string | number;
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗂️ ESTRUTURA COMPLETA DA SIDEBAR (12 CATEGORIAS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const SIDEBAR_STRUCTURE: SidebarCategory[] = [
  // ────────────────────────────────────────────────────────────────────
  // 1. CRM CORE
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'crm-core',
    label: 'CRM Core',
    icon: <Target className="h-5 w-5" />,
    accentColor: 'var(--accent-emerald)',
    description: 'Gestão de clientes, leads e oportunidades',
    links: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        status: 'implemented',
        description: 'Visão geral do CRM',
      },
      {
        id: 'customer-360',
        label: 'Customer 360',
        icon: <Users className="h-4 w-4" />,
        status: 'implemented',
        description: 'Visão 360° do cliente',
      },
      {
        id: 'leads-group',
        label: 'Leads',
        icon: <Users className="h-4 w-4" />,
        description: 'Gestão de leads',
        children: [
          {
            id: 'leads-lista',
            label: 'Lista de Leads',
            status: 'implemented',
          },
          {
            id: 'leads-detalhes',
            label: 'Detalhes do Lead',
            status: 'implemented',
          },
          {
            id: 'leads-importacao',
            label: 'Importação',
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'contatos-group',
        label: 'Contatos',
        icon: <UserCircle className="h-4 w-4" />,
        children: [
          {
            id: 'contatos-lista',
            label: 'Lista de Contatos',
            status: 'implemented',
          },
          {
            id: 'contatos-detalhes',
            label: 'Detalhes do Contato',
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'contas-empresas-group',
        label: 'Contas/Empresas',
        icon: <Building className="h-4 w-4" />,
        children: [
          {
            id: 'contas-empresas-lista',
            label: 'Lista de Contas',
            status: 'implemented',
          },
          {
            id: 'contas-detalhes',
            label: 'Detalhes da Conta',
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'oportunidades-group',
        label: 'Oportunidades',
        icon: <Target className="h-4 w-4" />,
        children: [
          {
            id: 'oportunidades-lista',
            label: 'Lista',
            status: 'implemented',
          },
          {
            id: 'oportunidades-kanban',
            label: 'Kanban',
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'pipeline-vendas',
        label: 'Pipeline de Vendas',
        icon: <GitBranch className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'financeiro',
        label: 'Financeiro',
        icon: <Wallet className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'atividades-tarefas',
        label: 'Atividades/Tarefas',
        icon: <CheckSquare className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'calendario',
        label: 'Calendário',
        icon: <Calendar className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'cotacoes',
        label: 'Cotações',
        icon: <FileText className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'propostas-comerciais',
        label: 'Propostas Comerciais',
        icon: <FileSignature className="h-4 w-4" />,
        status: 'placeholder',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 2. MARKETING
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'marketing',
    label: 'Marketing',
    icon: <Rocket className="h-5 w-5" />,
    accentColor: 'var(--accent-purple)',
    description: 'Campanhas, email marketing e redes sociais',
    links: [
      {
        id: 'campanhas-group',
        label: 'Campanhas',
        icon: <Rocket className="h-4 w-4" />,
        children: [
          {
            id: 'campanhas-lista',
            label: 'Lista de Campanhas',
            status: 'implemented',
          },
          {
            id: 'campanhas-criar-editar',
            label: 'Criar/Editar',
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'ads-manager',
        label: 'Ads Manager',
        icon: <BarChart3 className="h-4 w-4" />,
        status: 'implemented',
        description: 'Gestão unificada de mídia paga e desempenho',
      },
      {
        id: 'email-marketing-group',
        label: 'Email Marketing',
        icon: <Mail className="h-4 w-4" />,
        children: [
          {
            id: 'email-marketing-dashboard',
            label: 'Dashboard',
            status: 'placeholder',
          },
          {
            id: 'email-marketing-templates',
            label: 'Templates',
            status: 'placeholder',
          },
          {
            id: 'email-marketing-envios',
            label: 'Envios',
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'landing-pages-group',
        label: 'Landing Pages',
        icon: <Layout className="h-4 w-4" />,
        children: [
          {
            id: 'landing-pages-lista',
            label: 'Lista',
            status: 'placeholder',
          },
          {
            id: 'landing-builder',
            label: 'Builder',
            status: 'implemented',
          },
        ],
      },
      {
        id: 'formularios-group',
        label: 'Formulários',
        icon: <FileSpreadsheet className="h-4 w-4" />,
        children: [
          {
            id: 'formularios-lista',
            label: 'Lista',
            status: 'placeholder',
          },
          {
            id: 'formularios-builder',
            label: 'Builder',
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'redes-sociais-group',
        label: 'Redes Sociais',
        icon: <Share2 className="h-4 w-4" />,
        children: [
          {
            id: 'redes-sociais-dashboard',
            label: 'Dashboard',
            status: 'placeholder',
          },
          {
            id: 'redes-sociais-agendamento',
            label: 'Agendamento',
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'automacao-de-marketing',
        label: 'Automação de Marketing',
        icon: <Zap className="h-4 w-4" />,
        status: 'placeholder',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 3. SUPORTE AO CLIENTE
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'suporte-ao-cliente',
    label: 'Suporte ao Cliente',
    icon: <ShieldCheck className="h-5 w-5" />,
    accentColor: 'var(--accent-sky)',
    description: 'Atendimento, tickets e base de conhecimento',
    links: [
      {
        id: 'tickets-group',
        label: 'Tickets',
        icon: <Headphones className="h-4 w-4" />,
        children: [
          {
            id: 'tickets-lista',
            label: 'Lista de Tickets',
            status: 'placeholder',
          },
          {
            id: 'tickets-detalhes',
            label: 'Detalhes',
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'chat-ao-vivo',
        label: 'Chat Ao Vivo',
        icon: <MessageCircle className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'base-de-conhecimento',
        label: 'Base de Conhecimento',
        icon: <BookOpen className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'feedback-de-clientes',
        label: 'Feedback de Clientes',
        icon: <MessageSquare className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'portal-do-cliente',
        label: 'Portal do Cliente',
        icon: <Globe2 className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'slas-e-metricas',
        label: 'SLAs e Métricas',
        icon: <Activity className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'integracoes-de-suporte',
        label: 'Integrações de Suporte',
        icon: <Plug className="h-4 w-4" />,
        status: 'placeholder',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 4. ANALYTICS & RELATÓRIOS
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'analytics-relatorios',
    label: 'Analytics & Relatórios',
    icon: <LineChart className="h-5 w-5" />,
    accentColor: 'var(--color-primary-from)',
    description: 'Análises, métricas e relatórios',
    links: [
      {
        id: 'executive-dashboard',
        label: 'Executive Dashboard',
        icon: <BarChart className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'analytics-dashboard',
        label: 'Analytics Dashboard',
        icon: <BarChart className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'relatorios-personalizados',
        label: 'Relatórios Personalizados',
        icon: <FileBarChart className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'forecasting-de-vendas',
        label: 'Forecasting de Vendas',
        icon: <TrendingUp className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'analise-de-roi',
        label: 'Análise de ROI',
        icon: <DollarSign className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'cohort-analysis',
        label: 'Cohort Analysis',
        icon: <Users className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'atribuicao-de-marketing',
        label: 'Atribuição de Marketing',
        icon: <Target className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'heatmaps-e-sessoes',
        label: 'Heatmaps e Sessões',
        icon: <Activity className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'a-b-testing',
        label: 'A/B Testing',
        icon: <Layers className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'executive-reports',
        label: 'Executive Reports',
        icon: <Briefcase className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'data-export-import',
        label: 'Data Export/Import',
        icon: <Database className="h-4 w-4" />,
        status: 'placeholder',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 5. AUTOMAÇÃO & IA
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'automacao-ia',
    label: 'Automação & IA',
    icon: <Brain className="h-5 w-5" />,
    accentColor: 'var(--accent-fuchsia)',
    description: 'Workflows, IA e automações',
    links: [
      {
        id: 'workflows-group',
        label: 'Workflows',
        icon: <Workflow className="h-4 w-4" />,
        children: [
          {
            id: 'workflows-lista',
            label: 'Lista de Workflows',
            status: 'placeholder',
          },
          {
            id: 'workflows-builder',
            label: 'Builder',
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'automation-builder',
        label: 'Automation Builder',
        icon: <Zap className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'sequences-de-vendas',
        label: 'Sequences de Vendas',
        icon: <Send className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'ai-insights',
        label: 'AI Insights',
        icon: <Lightbulb className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'ai-assistant',
        label: 'AI Assistant',
        icon: <Sparkles className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'playbooks-de-vendas',
        label: 'Playbooks de Vendas',
        icon: <BookMarked className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'automacao-de-tarefas',
        label: 'Automação de Tarefas',
        icon: <Zap className="h-4 w-4" />,
        status: 'placeholder',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 6. GAMIFICAÇÃO
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'gamificacao',
    label: 'Gamificação',
    icon: <Flame className="h-5 w-5" />,
    accentColor: 'var(--accent-amber)',
    description: 'Rankings, badges e recompensas',
    links: [
      {
        id: 'leaderboards',
        label: 'Leaderboards',
        icon: <Trophy className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'achievements',
        label: 'Achievements',
        icon: <Award className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'badges-e-conquistas',
        label: 'Badges e Conquistas',
        icon: <Award className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'metas-e-desafios',
        label: 'Metas e Desafios',
        icon: <TargetIcon className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'pontuacao-e-niveis',
        label: 'Pontuação e Níveis',
        icon: <Star className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'nft-gallery',
        label: 'NFT Gallery',
        icon: <Sparkles className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'competitions',
        label: 'Competitions',
        icon: <Flame className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'war-arena',
        label: 'War Arena',
        icon: <Flame className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'rewards-store',
        label: 'Rewards Store',
        icon: <Gift className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'feedback-gamificado',
        label: 'Feedback Gamificado',
        icon: <ThumbsUp className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'analytics-de-gamificacao',
        label: 'Analytics de Gamificação',
        icon: <BarChart3 className="h-4 w-4" />,
        status: 'placeholder',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 7. OMNICHANNEL
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'omnichannel',
    label: 'Omnichannel',
    icon: <Globe2 className="h-5 w-5" />,
    accentColor: 'var(--accent-teal)',
    description: 'Comunicação unificada multicanal',
    links: [
      {
        id: 'omnichannel-inbox',
        label: 'Inbox Omnichannel',
        icon: <Inbox className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'email-inbox',
        label: 'Email Inbox',
        icon: <MailCheck className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'chamadas-e-voip',
        label: 'Chamadas e VoIP',
        icon: <Phone className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'reunioes-virtuais',
        label: 'Reuniões Virtuais',
        icon: <Video className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'sms-marketing',
        label: 'SMS Marketing',
        icon: <MessageSquareText className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'whatsapp-business',
        label: 'WhatsApp Business',
        icon: <MessageCircle className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'chatbots-config',
        label: 'Chatbots Config',
        icon: <Bot className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'voice-analytics',
        label: 'Voice Analytics',
        icon: <Mic className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'social-listening',
        label: 'Social Listening',
        icon: <Podcast className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'push-notifications',
        label: 'Push Notifications',
        icon: <Bell className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'api-de-comunicacao',
        label: 'API de Comunicação',
        icon: <Terminal className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'omnichannel-analytics',
        label: 'Omnichannel Analytics',
        icon: <BarChart2 className="h-4 w-4" />,
        status: 'placeholder',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 8. GESTÃO DE EQUIPES
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'gestao-de-equipes',
    label: 'Gestão de Equipes',
    icon: <UsersIcon className="h-5 w-5" />,
    accentColor: 'var(--accent-indigo)',
    description: 'Usuários, permissões e performance',
    links: [
      {
        id: 'equipes-lista',
        label: 'Equipes - Lista',
        icon: <UsersIcon className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'usuarios-lista',
        label: 'Usuários - Lista',
        icon: <UserCheck className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'funcoes-e-permissoes',
        label: 'Funções e Permissões',
        icon: <Shield className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'territorios-e-cotas',
        label: 'Territórios e Cotas',
        icon: <MapPin className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'comissoes',
        label: 'Comissões',
        icon: <DollarSign className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'metas-de-equipe',
        label: 'Metas de Equipe',
        icon: <Target className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'treinamentos',
        label: 'Treinamentos',
        icon: <GraduationCap className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'performance-reviews',
        label: 'Performance Reviews',
        icon: <Star className="h-4 w-4" />,
        status: 'placeholder',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 9. INTEGRAÇÕES
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'integracoes',
    label: 'Integrações',
    icon: <Compass className="h-5 w-5" />,
    accentColor: 'var(--accent-cyan)',
    description: 'Conectores e APIs',
    links: [
      {
        id: 'marketplace-de-apps',
        label: 'Marketplace de Apps',
        icon: <ShoppingBag className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'api-console',
        label: 'API Console',
        icon: <Terminal className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'webhooks',
        label: 'Webhooks',
        icon: <Webhook className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'integracao-google-workspace',
        label: 'Integração Google Workspace',
        icon: <Cloud className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'integracao-microsoft-365',
        label: 'Integração Microsoft 365',
        icon: <Cloud className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'integracao-com-erps',
        label: 'Integração com ERPs',
        icon: <Building className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'pagamentos-integrados',
        label: 'Pagamentos Integrados',
        icon: <CreditCard className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'e-commerce-integrations',
        label: 'E-commerce Integrations',
        icon: <ShoppingCart className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'bi-tools-integration',
        label: 'BI Tools Integration',
        icon: <PieChart className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'custom-integrations',
        label: 'Custom Integrations',
        icon: <Plug className="h-4 w-4" />,
        status: 'placeholder',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 10. EXPERIÊNCIAS IMERSIVAS
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'experiencias-imersivas',
    label: 'Experiências Imersivas',
    icon: <Globe2 className="h-5 w-5" />,
    accentColor: 'var(--accent-teal)',
    description: 'Metaverso, OS e boardrooms avançadas',
    links: [
      {
        id: 'metaverse',
        label: 'Metaverse',
        icon: <Globe2 className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'alsham-os',
        label: 'Alsham OS',
        icon: <Layout className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'boardroom-omega',
        label: 'The Boardroom Ω',
        icon: <Briefcase className="h-4 w-4" />,
        status: 'implemented',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 11. CONFIGURAÇÕES & ADMIN
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'configuracoes-admin',
    label: 'Configurações & Admin',
    icon: <Settings className="h-5 w-5" />,
    accentColor: 'var(--text-secondary)',
    description: 'Configurações do sistema',
    links: [
      {
        id: 'configuracoes-gerais',
        label: 'Configurações Gerais',
        icon: <Settings className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'notificacoes',
        label: 'Notificações',
        icon: <BellRing className="h-4 w-4" />,
        status: 'implemented',
      },
      {
        id: 'email-config',
        label: 'Email Config',
        icon: <MailCheck className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'cobranca-e-planos',
        label: 'Cobrança e Planos',
        icon: <CreditCard className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'branding-personalizado',
        label: 'Branding Personalizado',
        icon: <Palette className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'campos-customizados',
        label: 'Campos Customizados',
        icon: <Sliders className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'privacidade-de-dados',
        label: 'Privacidade de Dados',
        icon: <Lock className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'backups-e-restore',
        label: 'Backups e Restore',
        icon: <Database className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'logs-de-auditoria',
        label: 'Logs de Auditoria',
        icon: <FileSearch className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'seguranca-avancada',
        label: 'Segurança Avançada',
        icon: <Shield className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'onboarding-wizard',
        label: 'Onboarding Wizard',
        icon: <Sparkles className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'migracao-de-dados',
        label: 'Migração de Dados',
        icon: <Archive className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'api-keys-management',
        label: 'API Keys Management',
        icon: <Key className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'mobile-app-config',
        label: 'Mobile App Config',
        icon: <Smartphone className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'system-status',
        label: 'System Status',
        icon: <Server className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'api-status',
        label: 'API Status',
        icon: <Server className="h-4 w-4" />,
        status: 'implemented',
        description: 'Status e monitoramento de APIs',
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────
  // 12. COMUNIDADE & SUPORTE
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'comunidade-suporte',
    label: 'Comunidade & Suporte',
    icon: <HeartPulse className="h-5 w-5" />,
    accentColor: 'var(--accent-rose)',
    description: 'Ajuda e recursos',
    defaultCollapsed: true,
    links: [
      {
        id: 'centro-de-ajuda',
        label: 'Centro de Ajuda',
        icon: <HelpCircle className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'novidades',
        label: 'Novidades',
        icon: <Newspaper className="h-4 w-4" />,
        status: 'placeholder',
        badge: 'Novo',
      },
      {
        id: 'recursos-e-templates',
        label: 'Recursos e Templates',
        icon: <Package className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'comunidade',
        label: 'Comunidade',
        icon: <MessageCircleHeart className="h-4 w-4" />,
        status: 'placeholder',
      },
      {
        id: 'historias-de-sucesso',
        label: 'Histórias de Sucesso',
        icon: <Star className="h-4 w-4" />,
        status: 'placeholder',
      },
    ],
  },
];
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 UTILITÁRIOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Encontra uma categoria pelo ID
 */
export function findCategoryById(id: string): SidebarCategory | undefined {
  return SIDEBAR_STRUCTURE.find((cat) => cat.id === id);
}

/**
 * Encontra qualquer item da sidebar (incluindo groups) pelo ID
 * Útil para navegação hierárquica, expansão de menus, tooltips, etc.
 */
export function findItemById(itemId: string): { category: SidebarCategory; item: SidebarLink } | undefined {
  for (const category of SIDEBAR_STRUCTURE) {
    const findInLinks = (links: SidebarLink[]): SidebarLink | undefined => {
      for (const link of links) {
        if (link.id === itemId) return link;
        if (link.children) {
          const found = findInLinks(link.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    const item = findInLinks(category.links);
    if (item) {
      return { category, item };
    }
  }
  return undefined;
}

/**
 * Encontra apenas uma ROTA válida (folha – sem children) pelo ID
 * Usar este em qualquer lógica de routing, active state, validação de página
 */
export function findRouteById(routeId: string): { category: SidebarCategory; route: SidebarLink } | undefined {
  const result = findItemById(routeId);
  if (result && !result.item.children?.length) {
    return { category: result.category, route: result.item };
  }
  return undefined;
}

/**
 * Obtém todas as rotas reais (apenas folhas – itens sem children)
 */
export function getAllRoutes(): string[] {
  const routes: string[] = [];
  const extractRoutes = (links: SidebarLink[]) => {
    for (const link of links) {
      const isGroup = !!link.children?.length;

      // group: não é rota (apenas organiza)
      if (!isGroup) routes.push(link.id);

      if (isGroup) extractRoutes(link.children ?? []);
    }
  };
  for (const category of SIDEBAR_STRUCTURE) {
    extractRoutes(category.links);
  }
  return [...new Set(routes)]; // Remove possíveis duplicatas (não deve haver)
}

/**
 * Conta total de links (rotas reais)
 */
export function getTotalLinksCount(): number {
  return getAllRoutes().length;
}

/**
 * Obtém estatísticas da sidebar (apenas sobre rotas reais)
 */
export function getSidebarStats() {
  const allRoutes = getAllRoutes();
  const implemented = allRoutes.filter((id) => {
    const result = findRouteById(id);
    return result?.route.status === 'implemented';
  });
  return {
    totalCategories: SIDEBAR_STRUCTURE.length,
    totalLinks: allRoutes.length,
    implementedLinks: implemented.length,
    placeholderLinks: allRoutes.length - implemented.length,
    implementationRate: ((implemented.length / allRoutes.length) * 100).toFixed(1) + '%',
  };
}
