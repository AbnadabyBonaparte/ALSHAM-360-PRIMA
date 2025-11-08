// src/routes/pagesList.ts
export const allPages = [
  // ━━━ VENDAS (15 páginas) ━━━
  { id: "leads", path: "Leads", label: "Leads", group: "sales" },
  { id: "contacts", path: "Contacts", label: "Contatos", group: "sales" },
  { id: "accounts", path: "Accounts", label: "Contas", group: "sales" },
  { id: "opportunities", path: "Opportunities", label: "Oportunidades", group: "sales" },
  { id: "deals", path: "Deals", label: "Negócios", group: "sales" },
  { id: "forecasts", path: "Forecasts", label: "Previsões", group: "sales" },
  { id: "proposals", path: "Proposals", label: "Propostas", group: "sales" },
  { id: "contracts", path: "Contracts", label: "Contratos", group: "sales" },
  { id: "billing", path: "Billing", label: "Faturamento", group: "sales" },
  { id: "products", path: "Products", label: "Produtos", group: "sales" },
  { id: "pricelists", path: "PriceLists", label: "Tabelas de preço", group: "sales" },
  
  // ━━━ MARKETING (12 páginas) ━━━
  { id: "campaigns", path: "Campaigns", label: "Campanhas", group: "marketing" },
  { id: "email-marketing", path: "EmailMarketing", label: "E-mail", group: "marketing" },
  { id: "landing-pages", path: "LandingPages", label: "Landing pages", group: "marketing" },
  { id: "forms", path: "Forms", label: "Formulários", group: "marketing" },
  { id: "social", path: "Social", label: "Social", group: "marketing" },
  { id: "seo", path: "SEO", label: "SEO", group: "marketing" },
  { id: "ads", path: "Ads", label: "Ads", group: "marketing" },
  { id: "library", path: "Library", label: "Biblioteca", group: "marketing" },
  
  // ━━━ SUPORTE (7 páginas) ━━━
  { id: "tickets", path: "Tickets", label: "Tickets", group: "support" },
  { id: "knowledge-base", path: "KnowledgeBase", label: "Base de conhecimento", group: "support" },
  { id: "chat", path: "Chat", label: "Chat", group: "support" },
  { id: "slas", path: "SLAs", label: "SLAs", group: "support" },
  { id: "cases", path: "Cases", label: "Casos", group: "support" },
  { id: "portal", path: "Portal", label: "Portal", group: "support" },
  { id: "feedback", path: "Feedback", label: "Feedback", group: "support" },
  
  // ━━━ COMUNICAÇÃO (6 páginas) ━━━
  { id: "inbox", path: "Inbox", label: "Inbox", group: "communication" },
  { id: "emails", path: "Emails", label: "E-mails", group: "communication" },
  { id: "calls", path: "Calls", label: "Chamadas", group: "communication" },
  { id: "meetings", path: "Meetings", label: "Reuniões", group: "communication" },
  { id: "sms", path: "SMS", label: "SMS", group: "communication" },
  { id: "whatsapp", path: "WhatsApp", label: "WhatsApp", group: "communication" },
  
  // ━━━ ANALYTICS (6 páginas) ━━━
  { id: "dashboard-executive", path: "DashboardExecutive", label: "Dashboard executivo", group: "analytics" },
  { id: "cohorts", path: "Cohorts", label: "Cohorts", group: "analytics" },
  { id: "pipeline", path: "Pipeline", label: "Pipeline", group: "analytics" },
  { id: "roi", path: "ROI", label: "ROI", group: "analytics" },
  { id: "maps", path: "Maps", label: "Mapas", group: "analytics" },
  { id: "predictions", path: "Predictions", label: "Previsões", group: "analytics" },
  
  // ━━━ AUTOMAÇÃO (6 páginas) ━━━
  { id: "workflows", path: "Workflows", label: "Workflows", group: "automation" },
  { id: "sequences", path: "Sequences", label: "Sequências", group: "automation" },
  { id: "playbooks", path: "Playbooks", label: "Playbooks", group: "automation" },
  { id: "triggers", path: "Triggers", label: "Triggers", group: "automation" },
  { id: "logs", path: "Logs", label: "Logs", group: "automation" },
  { id: "connectors", path: "Connectors", label: "Conectores", group: "automation" },
  
  // ━━━ EQUIPE (8 páginas) ━━━
  { id: "members", path: "Members", label: "Membros", group: "team" },
  { id: "permissions", path: "Permissions", label: "Permissões", group: "team" },
  { id: "roles", path: "Roles", label: "Cargos", group: "team" },
  { id: "departments", path: "Departments", label: "Departamentos", group: "team" },
  { id: "hierarchy", path: "Hierarchy", label: "Hierarquia", group: "team" },
  { id: "boards", path: "Boards", label: "Quadros", group: "team" },
  { id: "goals", path: "Goals", label: "Metas", group: "team" },
  { id: "evaluations", path: "Evaluations", label: "Avaliações", group: "team" },
  
  // ━━━ CONFIGURAÇÕES (8 páginas) ━━━
  { id: "general", path: "General", label: "Geral", group: "settings" },
  { id: "users", path: "Users", label: "Usuários", group: "settings" },
  { id: "integrations", path: "Integrations", label: "Integrações", group: "settings" },
  { id: "security", path: "Security", label: "Segurança", group: "settings" },
  { id: "billing-settings", path: "BillingSettings", label: "Billing", group: "settings" },
  { id: "api", path: "API", label: "API", group: "settings" },
  { id: "webhooks", path: "Webhooks", label: "Webhooks", group: "settings" },
  { id: "logs-settings", path: "LogsSettings", label: "Logs", group: "settings" },
];
