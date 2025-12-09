export interface PageDefinition {
  id: string;
  label: string;
  icon: string;
  module: string;
  premium?: boolean;
}

export const pagesListSupremo: PageDefinition[] = [
  // 8 Auth & Onboarding
  { id: "login", label: "Login", icon: "ArrowRightOnRectangleIcon", module: "Auth" },
  { id: "register", label: "Cadastro", icon: "UserPlusIcon", module: "Auth" },
  { id: "forgot-password", label: "Esqueci a Senha", icon: "KeyIcon", module: "Auth" },
  { id: "reset-password", label: "Reset de Senha", icon: "ArrowPathRoundedSquareIcon", module: "Auth" },
  { id: "verify-email", label: "Verificação de E-mail", icon: "EnvelopeOpenIcon", module: "Auth" },
  { id: "mfa-setup", label: "MFA / 2FA", icon: "LockClosedIcon", module: "Auth" },
  { id: "sso", label: "Login SSO", icon: "GlobeAltIcon", module: "Auth" },
  { id: "onboarding-wizard", label: "Onboarding", icon: "SparklesIcon", module: "Auth" },

  // 6 Dashboard & Executive
  { id: "dashboard", label: "Dashboard Principal", icon: "HomeIcon", module: "Dashboard" },
  { id: "executive", label: "Visão Executiva", icon: "PresentationChartLineIcon", module: "Dashboard" },
  { id: "revenue-cockpit", label: "Revenue Cockpit", icon: "BanknotesIcon", module: "Dashboard" },
  { id: "csat-control", label: "CSAT Control", icon: "HandThumbUpIcon", module: "Dashboard" },
  { id: "ops-control", label: "Ops Control", icon: "AdjustmentsHorizontalIcon", module: "Dashboard" },
  { id: "realtime-wallboard", label: "Wallboard em Tempo Real", icon: "BoltIcon", module: "Dashboard" },

  // 18 CRM Core
  { id: "leads", label: "Leads", icon: "UserCircleIcon", module: "CRM" },
  { id: "lead-details", label: "Detalhe do Lead", icon: "IdentificationIcon", module: "CRM" },
  { id: "contacts", label: "Contatos", icon: "UsersIcon", module: "CRM" },
  { id: "contact-details", label: "Detalhe do Contato", icon: "UserIcon", module: "CRM" },
  { id: "accounts", label: "Contas", icon: "BuildingOfficeIcon", module: "CRM" },
  { id: "account-details", label: "Detalhe da Conta", icon: "BuildingOffice2Icon", module: "CRM" },
  { id: "opportunities", label: "Oportunidades", icon: "BriefcaseIcon", module: "CRM" },
  { id: "pipeline", label: "Pipeline de Vendas", icon: "SwatchIcon", module: "CRM" },
  { id: "tasks", label: "Atividades/Tarefas", icon: "CheckCircleIcon", module: "CRM" },
  { id: "calendar", label: "Calendário", icon: "CalendarDaysIcon", module: "CRM" },
  { id: "notes", label: "Notas", icon: "PencilSquareIcon", module: "CRM" },
  { id: "deals", label: "Negociações", icon: "HandshakeIcon", module: "CRM" },
  { id: "territories", label: "Territórios", icon: "MapIcon", module: "CRM" },
  { id: "segments", label: "Segmentação", icon: "AdjustmentsVerticalIcon", module: "CRM" },
  { id: "scoring", label: "Lead Scoring", icon: "ChartBarIcon", module: "CRM" },
  { id: "assignments", label: "Roteamento/Ownership", icon: "ArrowPathIcon", module: "CRM" },
  { id: "personas", label: "Personas", icon: "UserGroupIcon", module: "CRM" },
  { id: "imports", label: "Importação de Dados", icon: "ArrowUpOnSquareStackIcon", module: "CRM" },

  // 14 Vendas
  { id: "quotes", label: "Cotações", icon: "DocumentTextIcon", module: "Vendas" },
  { id: "proposals", label: "Propostas", icon: "DocumentDuplicateIcon", module: "Vendas" },
  { id: "contracts", label: "Contratos", icon: "ClipboardDocumentCheckIcon", module: "Vendas" },
  { id: "products", label: "Produtos", icon: "CubeIcon", module: "Vendas" },
  { id: "pricing", label: "Pricing Tables", icon: "TableCellsIcon", module: "Vendas" },
  { id: "orders", label: "Pedidos", icon: "ClipboardDocumentListIcon", module: "Vendas" },
  { id: "invoices", label: "Faturas", icon: "ReceiptPercentIcon", module: "Vendas" },
  { id: "subscriptions", label: "Assinaturas", icon: "ArrowsRightLeftIcon", module: "Vendas" },
  { id: "renewals", label: "Renovações", icon: "ArrowPathRoundedSquareIcon", module: "Vendas" },
  { id: "upsell", label: "Upsell/Cross-sell", icon: "ArrowTrendingUpIcon", module: "Vendas" },
  { id: "revenue-forecast", label: "Forecast de Receita", icon: "ChartPieIcon", module: "Vendas" },
  { id: "commissions", label: "Comissões", icon: "BanknotesIcon", module: "Vendas" },
  { id: "discount-approvals", label: "Aprovação de Descontos", icon: "ShieldCheckIcon", module: "Vendas" },
  { id: "cpq", label: "CPQ", icon: "Cog8ToothIcon", module: "Vendas" },

  // 14 Marketing
  { id: "campaigns", label: "Campanhas", icon: "MegaphoneIcon", module: "Marketing" },
  { id: "email-marketing", label: "E-mail Marketing", icon: "EnvelopeIcon", module: "Marketing" },
  { id: "landing-pages", label: "Landing Pages", icon: "GlobeAltIcon", module: "Marketing" },
  { id: "forms", label: "Formulários", icon: "ClipboardIcon", module: "Marketing" },
  { id: "seo", label: "SEO", icon: "MagnifyingGlassIcon", module: "Marketing" },
  { id: "social", label: "Social Media", icon: "HashtagIcon", module: "Marketing" },
  { id: "ads", label: "Ads/Media", icon: "RectangleStackIcon", module: "Marketing" },
  { id: "ab-testing", label: "A/B Testing", icon: "SquaresPlusIcon", module: "Marketing" },
  { id: "content-hub", label: "Content Hub", icon: "NewspaperIcon", module: "Marketing" },
  { id: "webinars", label: "Webinars/Events", icon: "VideoCameraIcon", module: "Marketing" },
  { id: "referral", label: "Referral/Parcerias", icon: "UserGroupIcon", module: "Marketing" },
  { id: "journeys", label: "Customer Journeys", icon: "ArrowTrendingUpIcon", module: "Marketing" },
  { id: "audiences", label: "Audiências", icon: "AdjustmentsHorizontalIcon", module: "Marketing" },
  { id: "brand-assets", label: "Brand Assets", icon: "PhotoIcon", module: "Marketing" },

  // 12 Suporte & CS
  { id: "tickets", label: "Tickets", icon: "TicketIcon", module: "Suporte" },
  { id: "ticket-details", label: "Detalhe do Ticket", icon: "ClipboardDocumentIcon", module: "Suporte" },
  { id: "knowledge-base", label: "Base de Conhecimento", icon: "BookOpenIcon", module: "Suporte" },
  { id: "help-center", label: "Help Center", icon: "QuestionMarkCircleIcon", module: "Suporte" },
  { id: "customer-portal", label: "Portal do Cliente", icon: "UserCircleIcon", module: "Suporte" },
  { id: "slas", label: "SLAs", icon: "ClockIcon", module: "Suporte" },
  { id: "csat", label: "CSAT", icon: "HandThumbUpIcon", module: "Suporte" },
  { id: "nps", label: "NPS", icon: "HeartIcon", module: "Suporte" },
  { id: "playbooks", label: "Playbooks", icon: "DocumentCheckIcon", module: "Suporte" },
  { id: "incident", label: "Incidentes", icon: "ExclamationTriangleIcon", module: "Suporte" },
  { id: "status-page", label: "Status Page", icon: "SignalIcon", module: "Suporte" },
  { id: "success-plans", label: "Customer Success Plans", icon: "SparklesIcon", module: "Suporte" },

  // 10 Comunicação
  { id: "inbox", label: "Inbox Unificada", icon: "InboxIcon", module: "Comunicação" },
  { id: "whatsapp", label: "WhatsApp", icon: "ChatBubbleLeftRightIcon", module: "Comunicação" },
  { id: "calls", label: "Chamadas/VoIP", icon: "PhoneIcon", module: "Comunicação" },
  { id: "meetings", label: "Reuniões", icon: "CalendarIcon", module: "Comunicação" },
  { id: "sms", label: "SMS", icon: "ChatBubbleLeftEllipsisIcon", module: "Comunicação" },
  { id: "live-chat", label: "Chat ao Vivo", icon: "ChatBubbleOvalLeftIcon", module: "Comunicação" },
  { id: "notifications", label: "Notificações", icon: "BellAlertIcon", module: "Comunicação" },
  { id: "voice-mail", label: "Voicemail", icon: "SpeakerWaveIcon", module: "Comunicação" },
  { id: "recordings", label: "Gravações", icon: "FilmIcon", module: "Comunicação" },
  { id: "routing", label: "Roteamento", icon: "ArrowsRightLeftIcon", module: "Comunicação" },

  // 10 Automação & IA
  { id: "workflows", label: "Workflows", icon: "Squares2X2Icon", module: "Automação & IA" },
  { id: "automations", label: "Automations", icon: "BoltIcon", module: "Automação & IA" },
  { id: "triggers", label: "Event Triggers", icon: "BellSnoozeIcon", module: "Automação & IA" },
  { id: "bots", label: "Bots/Chatbots", icon: "CpuChipIcon", module: "Automação & IA" },
  { id: "ai-assistant", label: "AI Assistant", icon: "SparklesIcon", module: "Automação & IA" },
  { id: "next-best-action", label: "Next Best Action", icon: "LightBulbIcon", module: "Automação & IA" },
  { id: "predictions", label: "Previsões", icon: "ChartBarSquareIcon", module: "Automação & IA" },
  { id: "anomaly-detection", label: "Anomaly Detection", icon: "EyeIcon", module: "Automação & IA" },
  { id: "rules-engine", label: "Rules Engine", icon: "AdjustmentsVerticalIcon", module: "Automação & IA" },
  { id: "data-sync", label: "Data Sync", icon: "ArrowDownOnSquareStackIcon", module: "Automação & IA" },

  // 8 Analytics & Relatórios
  { id: "analytics", label: "Analytics", icon: "ChartBarIcon", module: "Analytics" },
  { id: "dashboards", label: "Dashboards", icon: "PresentationChartBarIcon", module: "Analytics" },
  { id: "reports", label: "Relatórios", icon: "DocumentChartBarIcon", module: "Analytics" },
  { id: "cohorts", label: "Cohorts", icon: "SquaresPlusIcon", module: "Analytics" },
  { id: "funnel", label: "Funil", icon: "BeakerIcon", module: "Analytics" },
  { id: "attribution", label: "Atribuição", icon: "ArrowTrendingUpIcon", module: "Analytics" },
  { id: "revenue-analytics", label: "Revenue Analytics", icon: "BanknotesIcon", module: "Analytics" },
  { id: "forecasting", label: "Forecasting", icon: "ChartPieIcon", module: "Analytics" },

  // 6 Gamificação
  { id: "gamification", label: "Gamificação", icon: "TrophyIcon", module: "Gamificação" },
  { id: "leaderboards", label: "Leaderboards", icon: "StarIcon", module: "Gamificação" },
  { id: "achievements", label: "Conquistas", icon: "CheckBadgeIcon", module: "Gamificação" },
  { id: "badges", label: "Badges", icon: "ShieldCheckIcon", module: "Gamificação" },
  { id: "challenges", label: "Desafios", icon: "FireIcon", module: "Gamificação" },
  { id: "rewards", label: "Recompensas", icon: "GiftIcon", module: "Gamificação" },

  // 8 Equipe & Configurações
  { id: "users", label: "Usuários", icon: "UserGroupIcon", module: "Admin" },
  { id: "roles", label: "Funções", icon: "KeyIcon", module: "Admin" },
  { id: "permissions", label: "Permissões", icon: "ShieldExclamationIcon", module: "Admin" },
  { id: "teams", label: "Equipes", icon: "UsersIcon", module: "Admin" },
  { id: "org-settings", label: "Configurações da Org", icon: "Cog6ToothIcon", module: "Admin" },
  { id: "billing", label: "Cobrança & Planos", icon: "CreditCardIcon", module: "Admin" },
  { id: "audit-log", label: "Audit Log", icon: "DocumentMagnifyingGlassIcon", module: "Admin" },
  { id: "themes", label: "Branding/Temas", icon: "SwatchIcon", module: "Admin" },

  // 12 Futuristas
  { id: "virtual-office", label: "Virtual Office", icon: "GlobeEuropeAfricaIcon", module: "Futuro", premium: true },
  { id: "voice-commands", label: "Voice Commands", icon: "MicrophoneIcon", module: "Futuro", premium: true },
  { id: "nft-rewards", label: "NFT Rewards", icon: "CurrencyDollarIcon", module: "Futuro", premium: true },
  { id: "metaverse", label: "Metaverse Hub", icon: "CubeTransparentIcon", module: "Futuro", premium: true },
  { id: "esg", label: "ESG Impact", icon: "LeafIcon", module: "Futuro" },
  { id: "ai-lab", label: "AI Lab", icon: "BeakerIcon", module: "Futuro", premium: true },
  { id: "digital-twin", label: "Digital Twin", icon: "ComputerDesktopIcon", module: "Futuro", premium: true },
  { id: "copilot", label: "Sales Copilot", icon: "AcademicCapIcon", module: "Futuro" },
  { id: "autonomous-agents", label: "Autonomous Agents", icon: "RocketLaunchIcon", module: "Futuro", premium: true },
  { id: "marketplace", label: "App Marketplace", icon: "ShoppingBagIcon", module: "Futuro" },
  { id: "sandbox", label: "Sandbox/Dev", icon: "CodeBracketSquareIcon", module: "Futuro" },
  { id: "labs-insights", label: "Labs Insights", icon: "ChartBarSquareIcon", module: "Futuro" },
];

