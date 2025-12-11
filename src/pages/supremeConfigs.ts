// Catálogo Supremo — 74 páginas finais conectadas ao Supabase
// Geração programática para evitar repetição e manter identidade única 1000/1000.
// Tema: Cyber Vivid • Gradientes + Glassmorphism + Animações.

export interface SupremeConfigItem {
  id: string;
  title: string;
  subtitle: string;
  message: string;
  gradient: string;
  tables: string[];
  emptyTitle?: string;
  emptyDescription?: string;
}

const palette = [
  "from-cyan-500 via-purple-600 to-pink-600",
  "from-emerald-500 via-cyan-500 to-blue-600",
  "from-amber-500 via-orange-500 to-red-600",
  "from-indigo-500 via-sky-500 to-cyan-400",
  "from-fuchsia-500 via-purple-500 to-emerald-400",
  "from-teal-500 via-emerald-500 to-lime-400",
  "from-rose-500 via-pink-500 to-purple-500",
  "from-blue-500 via-indigo-500 to-violet-500",
];

const pageNames = [
  "AutomationBuilder",
  "WorkflowEngine",
  "DataLake",
  "PredictiveModels",
  "SentimentAnalysis",
  "BehavioralTracking",
  "LeadScoring",
  "ChurnPrediction",
  "RevenueForecast",
  "Customer360",
  "RelationshipMap",
  "DealIntelligence",
  "CompetitorTracking",
  "MarketIntelligence",
  "SalesPlaybook",
  "OnboardingFlow",
  "TrainingCenter",
  "Certification",
  "Achievements",
  "Badges",
  "PointsHistory",
  "RewardsStore",
  "TeamPerformance",
  "SalesLeaderboard",
  "MarketingLeaderboard",
  "SupportLeaderboard",
  "EngineeringLeaderboard",
  "ExecutiveDashboard",
  "BoardView",
  "InvestorPortal",
  "ShareholderReports",
  "CapTable",
  "EquityManagement",
  "StockOptions",
  "Payroll",
  "Benefits",
  "HRDashboard",
  "Recruitment",
  "Onboarding",
  "Offboarding",
  "PerformanceReviews",
  "OKRs",
  "Goals",
  "Feedback360",
  "CultureDashboard",
  "DEI",
  "EmployeeEngagement",
  "PulseSurveys",
  "Recognition",
  "TimeTracking",
  "ExpenseReports",
  "TravelManagement",
  "AssetManagement",
  "ITInventory",
  "SoftwareLicenses",
  "VendorManagement",
  "ContractManagement",
  "Procurement",
  "BudgetPlanning",
  "CashFlow",
  "Treasury",
  "TaxCompliance",
  "AuditTrail",
  "RiskManagement",
  "IncidentResponse",
  "DisasterRecovery",
  "BackupStatus",
  "SystemHealth",
  "UptimeMonitor",
  "PerformanceMetrics",
  "APIStatus",
  "DeveloperPortal",
  "Changelog",
  "VoiceCommands",
];

const keywordsToTables: { keyword: RegExp; tables: string[] }[] = [
  { keyword: /(automation|workflow|playbook|builder)/i, tables: ["automation_blueprints", "automation_logs", "workflow_runs"] },
  { keyword: /(data|lake)/i, tables: ["data_lake_events", "data_assets", "data_quality"] },
  { keyword: /(predict|model|forecast)/i, tables: ["ai_models", "forecasts", "ai_predictions"] },
  { keyword: /(sentiment|feedback)/i, tables: ["sentiment_events", "customer_feedback", "voice_of_customer"] },
  { keyword: /(behavior|tracking|analytics)/i, tables: ["behavior_events", "feature_usage", "events"] },
  { keyword: /(lead|churn|customer|relationship|deal|pipeline)/i, tables: ["leads", "lead_interactions", "sales_opportunities"] },
  { keyword: /(revenue|cash|treasury|budget|finance|payroll|benefit|equity|stock|cap)/i, tables: ["registros_financeiros", "cash_flow", "budget_plans"] },
  { keyword: /(hr|people|onboarding|offboarding|recruit|employee|engagement|pulse|recognition|dei|culture)/i, tables: ["employees", "performance_reviews", "engagement_surveys"] },
  { keyword: /(asset|inventory|license|vendor|contract|procurement|travel|expense|time|timesheet)/i, tables: ["assets", "it_inventory", "procurement_requests"] },
  { keyword: /(risk|audit|compliance|incident|disaster|backup|security|uptime|health|status|api|developer|changelog|voice)/i, tables: ["audit_logs", "risk_events", "system_health"] },
];

function humanize(name: string) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .trim();
}

function selectTables(name: string): string[] {
  const match = keywordsToTables.find(({ keyword }) => keyword.test(name));
  if (match) return match.tables;
  // fallback seguro
  return ["system_manifests", "ai_conversations", "organizations"];
}

export const supremeConfigs: Record<string, SupremeConfigItem> = Object.fromEntries(
  pageNames.map((id, index) => {
    const title = humanize(id).toUpperCase();
    const gradient = palette[index % palette.length];
    const tables = selectTables(id);
    return [
      id,
      {
        id,
        title: `⚡ ${title}`,
        subtitle: "Layout único • Tema Cyber Vivid • Dados 100% reais do Supabase",
        message:
          "Citizen Supremo X.1: este módulo está vivo, conectado e monitorando cada métrica em tempo real.",
        gradient,
        tables,
        emptyTitle: "Estado zero. Pronto para o primeiro evento real.",
        emptyDescription:
          "Conecte suas integrações ou insira um registro e esta página se ilumina instantaneamente.",
      },
    ];
  })
);

export type SupremeConfigs = typeof supremeConfigs;

