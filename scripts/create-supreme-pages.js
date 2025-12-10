import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pagesDir = path.join(__dirname, "..", "src", "pages");

const names = [
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

const content = (name) =>
  [
    'import { createSupremePage } from "@/components/SupremePageFactory";',
    'import { supremeConfigs } from "./supremeConfigs";',
    "",
    `export default createSupremePage(supremeConfigs["${name}"]);`,
    "",
  ].join("\n");

names.forEach((name) => {
  const filePath = path.join(pagesDir, `${name}.tsx`);
  fs.writeFileSync(filePath, content(name), "utf8");
});

console.log(`✅ Páginas escritas: ${names.length}`);

