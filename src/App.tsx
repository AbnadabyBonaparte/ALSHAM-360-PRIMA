import { Fragment, useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Brain,
  ChevronDown,
  Command,
  Compass,
  Flame,
  Globe2,
  HeartPulse,
  Layers,
  LineChart,
  MonitorPlay,
  Menu,
  MessageCircle,
  Palette,
  PieChart as PieChartIcon,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import campaignOrion from "./assets/campaign-orion.png";
import { renderPage } from "./routes";
import { registerRoute } from "./routes";
import Leads from "./pages/Leads";
import LeadsDetails from "./pages/LeadsDetails";
import './styles/responsive.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA – INTEGRAÇÃO SUPABASE (Fase 1)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🜂 IMPORTAÇÃO: Funções do supabase.js master (17.389 linhas)
// 📅 DATA: 01 de Novembro de 2025
// 🎯 OBJETIVO: Conectar dashboard 10/10 com backend completo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  getSupabaseClient,
  getCurrentSession,
  getCurrentOrgId,
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getContacts,
  createContact,
  getAccounts,
  createAccount,
  getCampaigns,
  createCampaign,
  updateCampaign,
  createAuditLog,
  genericSelect,
  genericInsert,
  genericUpdate,
  subscribeContacts,
  subscribeCampaigns,
  subscribeLeads,
  getOpportunities,
  getTopLeadsByScore,
} from "./lib/supabase";

// Inicializar cliente Supabase
const supabase = getSupabaseClient();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔚 FIM DA INTEGRAÇÃO SUPABASE (Fase 1) - Imports
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Placeholder para páginas pendentes (em desenvolvimento)
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-[var(--bg-dark)] text-white p-8 flex items-center justify-center">
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-xl text-gray-400">Em desenvolvimento...</p>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
    </div>
  </div>
);

// Componente simples para Dashboard Principal (wrapper do conteúdo existente)
const Dashboard = () => (
  <div className="min-h-screen bg-[var(--bg-dark)] text-white p-8">
    {/* Aqui vai o conteúdo do dashboard principal existente, ex.: KPIs, gráficos, etc. */}
    <h1 className="text-3xl font-bold">Dashboard Principal</h1>
    {/* Copie o <main> do código original aqui se necessário */}
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 CHART.JS - Paleta de cores neutras e helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const chartNeutrals = {
  sage: "#7a8f80",
  mist: "#8794a4",
  clay: "#c5a47c",
  brass: "#b89a6c",
  soot: "#41464a",
};

const hexToRgba = (hex: string, alpha: number) => {
  const value = hex.replace("#", "");
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Sidebar expandida com todas as 110+ páginas do checklist, agrupadas por módulo
const sidebarGroups = [
  {
    id: "crm-core",
    label: "CRM CORE",
    icon: <Target className="h-4 w-4" />,
    links: [
      { id: "dashboard-principal", label: "Dashboard Principal" },
      { id: "leads-lista", label: "Leads - Lista" },
      { id: "leads-detalhes", label: "Leads - Detalhes" },
      { id: "leads-importacao", label: "Leads - Importação" },
      { id: "contatos-lista", label: "Contatos - Lista" },
      { id: "contatos-detalhes", label: "Contatos - Detalhes" },
      { id: "contas-empresas-lista", label: "Contas/Empresas - Lista" },
      { id: "contas-detalhes", label: "Contas - Detalhes" },
      { id: "oportunidades-lista", label: "Oportunidades - Lista" },
      { id: "oportunidades-kanban", label: "Oportunidades - Kanban" },
      { id: "pipeline-de-vendas", label: "Pipeline de Vendas" },
      { id: "atividades-tarefas", label: "Atividades/Tarefas" },
      { id: "calendario", label: "Calendário" },
      { id: "cotacoes", label: "Cotações" },
      { id: "propostas-comerciais", label: "Propostas Comerciais" },
    ],
  },
  {
    id: "marketing",
    label: "MARKETING",
    icon: <Rocket className="h-4 w-4" />,
    links: [
      { id: "campanhas-lista", label: "Campanhas - Lista" },
      { id: "campanhas-criar-editar", label: "Campanhas - Criar/Editar" },
      { id: "email-marketing-dashboard", label: "Email Marketing - Dashboard" },
      { id: "email-marketing-templates", label: "Email Marketing - Templates" },
      { id: "email-marketing-envios", label: "Email Marketing - Envios" },
      { id: "landing-pages-lista", label: "Landing Pages - Lista" },
      { id: "landing-pages-builder", label: "Landing Pages - Builder" },
      { id: "formularios-lista", label: "Formulários - Lista" },
      { id: "formularios-builder", label: "Formulários - Builder" },
      { id: "redes-sociais-dashboard", label: "Redes Sociais - Dashboard" },
      { id: "redes-sociais-agendamento", label: "Redes Sociais - Agendamento" },
      { id: "automacao-de-marketing", label: "Automação de Marketing" },
    ],
  },
  {
    id: "suporte-ao-cliente",
    label: "SUPORTE AO CLIENTE",
    icon: <ShieldCheck className="h-4 w-4" />,
    links: [
      { id: "tickets-lista", label: "Tickets - Lista" },
      { id: "tickets-detalhes", label: "Tickets - Detalhes" },
      { id: "chat-ao-vivo", label: "Chat Ao Vivo" },
      { id: "base-de-conhecimento", label: "Base de Conhecimento" },
      { id: "feedback-de-clientes", label: "Feedback de Clientes" },
      { id: "portal-do-cliente", label: "Portal do Cliente" },
      { id: "slas-e-metricas", label: "SLAs e Métricas" },
      { id: "integracoes-de-suporte", label: "Integrações de Suporte" },
    ],
  },
  {
    id: "analytics-relatorios",
    label: "ANALYTICS & RELATÓRIOS",
    icon: <LineChart className="h-4 w-4" />,
    links: [
      { id: "analytics-dashboard", label: "Analytics - Dashboard" },
      { id: "relatorios-personalizados", label: "Relatórios Personalizados" },
      { id: "forecasting-de-vendas", label: "Forecasting de Vendas" },
      { id: "analise-de-roi", label: "Análise de ROI" },
      { id: "cohort-analysis", label: "Cohort Analysis" },
      { id: "atribuicao-de-marketing", label: "Atribuição de Marketing" },
      { id: "heatmaps-e-sessoes", label: "Heatmaps e Sessões" },
      { id: "a-b-testing", label: "A/B Testing" },
      { id: "executive-reports", label: "Executive Reports" },
      { id: "data-export-import", label: "Data Export/Import" },
    ],
  },
  {
    id: "automacao-ia",
    label: "AUTOMAÇÃO & IA",
    icon: <Brain className="h-4 w-4" />,
    links: [
      { id: "workflows-lista", label: "Workflows - Lista" },
      { id: "workflows-builder", label: "Workflows - Builder" },
      { id: "sequences-de-vendas", label: "Sequences de Vendas" },
      { id: "ai-insights", label: "AI Insights" },
      { id: "ai-assistant", label: "AI Assistant" },
      { id: "playbooks-de-vendas", label: "Playbooks de Vendas" },
      { id: "automacao-de-tarefas", label: "Automação de Tarefas" },
    ],
  },
  {
    id: "gamificacao",
    label: "GAMIFICAÇÃO",
    icon: <Flame className="h-4 w-4" />,
    links: [
      { id: "leaderboards", label: "Leaderboards" },
      { id: "badges-e-conquistas", label: "Badges e Conquistas" },
      { id: "metas-e-desafios", label: "Metas e Desafios" },
      { id: "pontuacao-e-niveis", label: "Pontuação e Níveis" },
      { id: "competitions", label: "Competitions" },
      { id: "rewards-store", label: "Rewards Store" },
      { id: "feedback-gamificado", label: "Feedback Gamificado" },
      { id: "analytics-de-gamificacao", label: "Analytics de Gamificação" },
    ],
  },
  {
    id: "omnichannel",
    label: "OMNICHANNEL",
    icon: <Globe2 className="h-4 w-4" />,
    links: [
      { id: "inbox-unificada", label: "Inbox Unificada" },
      { id: "email-inbox", label: "Email Inbox" },
      { id: "chamadas-e-voip", label: "Chamadas e VoIP" },
      { id: "reunioes-virtuais", label: "Reuniões Virtuais" },
      { id: "sms-marketing", label: "SMS Marketing" },
      { id: "whatsapp-business", label: "WhatsApp Business" },
      { id: "chatbots-config", label: "Chatbots Config" },
      { id: "voice-analytics", label: "Voice Analytics" },
      { id: "social-listening", label: "Social Listening" },
      { id: "push-notifications", label: "Push Notifications" },
      { id: "api-de-comunicacao", label: "API de Comunicação" },
      { id: "omnichannel-analytics", label: "Omnichannel Analytics" },
    ],
  },
  {
    id: "gestao-de-equipes",
    label: "GESTÃO DE EQUIPES",
    icon: <Users className="h-4 w-4" />,
    links: [
      { id: "equipes-lista", label: "Equipes - Lista" },
      { id: "usuarios-lista", label: "Usuários - Lista" },
      { id: "funcoes-e-permissoes", label: "Funções e Permissões" },
      { id: "territorios-e-cotas", label: "Territórios e Cotas" },
      { id: "comissoes", label: "Comissões" },
      { id: "metas-de-equipe", label: "Metas de Equipe" },
      { id: "treinamentos", label: "Treinamentos" },
      { id: "performance-reviews", label: "Performance Reviews" },
    ],
  },
  {
    id: "integracoes",
    label: "INTEGRAÇÕES",
    icon: <Compass className="h-4 w-4" />,
    links: [
      { id: "marketplace-de-apps", label: "Marketplace de Apps" },
      { id: "api-console", label: "API Console" },
      { id: "webhooks", label: "Webhooks" },
      { id: "integracao-google-workspace", label: "Integração Google Workspace" },
      { id: "integracao-microsoft-365", label: "Integração Microsoft 365" },
      { id: "integracao-com-erps", label: "Integração com ERPs" },
      { id: "pagamentos-integrados", label: "Pagamentos Integrados" },
      { id: "e-commerce-integrations", label: "E-commerce Integrations" },
      { id: "bi-tools-integration", label: "BI Tools Integration" },
      { id: "custom-integrations", label: "Custom Integrations" },
    ],
  },
  {
    id: "configuracoes-admin",
    label: "CONFIGURAÇÕES & ADMIN",
    icon: <Settings className="h-4 w-4" />,
    links: [
      { id: "configuracoes-gerais", label: "Configurações Gerais" },
      { id: "notificacoes", label: "Notificações" },
      { id: "email-config", label: "Email Config" },
      { id: "cobranca-e-planos", label: "Cobrança e Planos" },
      { id: "branding-personalizado", label: "Branding Personalizado" },
      { id: "campos-customizados", label: "Campos Customizados" },
      { id: "privacidade-de-dados", label: "Privacidade de Dados" },
      { id: "backups-e-restore", label: "Backups e Restore" },
      { id: "logs-de-auditoria", label: "Logs de Auditoria" },
      { id: "seguranca-avancada", label: "Segurança Avançada" },
      { id: "onboarding-wizard", label: "Onboarding Wizard" },
      { id: "migracao-de-dados", label: "Migração de Dados" },
      { id: "api-keys-management", label: "API Keys Management" },
      { id: "mobile-app-config", label: "Mobile App Config" },
      { id: "system-status", label: "System Status" },
    ],
  },
  {
    id: "comunidade-suporte",
    label: "COMUNIDADE & SUPORTE",
    icon: <HeartPulse className="h-4 w-4" />,
    links: [
      { id: "centro-de-ajuda", label: "Centro de Ajuda" },
      { id: "novidades", label: "Novidades" },
      { id: "recursos-e-templates", label: "Recursos e Templates" },
      { id: "comunidade", label: "Comunidade" },
      { id: "historias-de-sucesso", label: "Histórias de Sucesso" },
    ],
  },
];

// Registre todas as rotas de uma vez (com placeholders para pendentes)
registerRoute("dashboard-principal", async () => ({ default: Dashboard }));
registerRoute("leads-lista", async () => ({ default: Leads }));
registerRoute("leads-detalhes", async () => ({ default: LeadsDetails }));
registerRoute("leads-importacao", async () => ({ default: () => <PlaceholderPage title="Leads - Importação" /> }));
registerRoute("contatos-lista", async () => ({ default: () => <PlaceholderPage title="Contatos - Lista" /> }));
registerRoute("contatos-detalhes", async () => ({ default: () => <PlaceholderPage title="Contatos - Detalhes" /> }));
registerRoute("contas-empresas-lista", async () => ({ default: () => <PlaceholderPage title="Contas/Empresas - Lista" /> }));
registerRoute("contas-detalhes", async () => ({ default: () => <PlaceholderPage title="Contas - Detalhes" /> }));
registerRoute("oportunidades-lista", async () => ({ default: () => <PlaceholderPage title="Oportunidades - Lista" /> }));
registerRoute("oportunidades-kanban", async () => ({ default: () => <PlaceholderPage title="Oportunidades - Kanban" /> }));
registerRoute("pipeline-de-vendas", async () => ({ default: () => <PlaceholderPage title="Pipeline de Vendas" /> }));
registerRoute("atividades-tarefas", async () => ({ default: () => <PlaceholderPage title="Atividades/Tarefas" /> }));
registerRoute("calendario", async () => ({ default: () => <PlaceholderPage title="Calendário" /> }));
registerRoute("cotacoes", async () => ({ default: () => <PlaceholderPage title="Cotações" /> }));
registerRoute("propostas-comerciais", async () => ({ default: () => <PlaceholderPage title="Propostas Comerciais" /> }));
registerRoute("campanhas-lista", async () => ({ default: () => <PlaceholderPage title="Campanhas - Lista" /> }));
registerRoute("campanhas-criar-editar", async () => ({ default: () => <PlaceholderPage title="Campanhas - Criar/Editar" /> }));
registerRoute("email-marketing-dashboard", async () => ({ default: () => <PlaceholderPage title="Email Marketing - Dashboard" /> }));
registerRoute("email-marketing-templates", async () => ({ default: () => <PlaceholderPage title="Email Marketing - Templates" /> }));
registerRoute("email-marketing-envios", async () => ({ default: () => <PlaceholderPage title="Email Marketing - Envios" /> }));
registerRoute("landing-pages-lista", async () => ({ default: () => <PlaceholderPage title="Landing Pages - Lista" /> }));
registerRoute("landing-pages-builder", async () => ({ default: () => <PlaceholderPage title="Landing Pages - Builder" /> }));
registerRoute("formularios-lista", async () => ({ default: () => <PlaceholderPage title="Formulários - Lista" /> }));
registerRoute("formularios-builder", async () => ({ default: () => <PlaceholderPage title="Formulários - Builder" /> }));
registerRoute("redes-sociais-dashboard", async () => ({ default: () => <PlaceholderPage title="Redes Sociais - Dashboard" /> }));
registerRoute("redes-sociais-agendamento", async () => ({ default: () => <PlaceholderPage title="Redes Sociais - Agendamento" /> }));
registerRoute("automacao-de-marketing", async () => ({ default: () => <PlaceholderPage title="Automação de Marketing" /> }));
registerRoute("tickets-lista", async () => ({ default: () => <PlaceholderPage title="Tickets - Lista" /> }));
registerRoute("tickets-detalhes", async () => ({ default: () => <PlaceholderPage title="Tickets - Detalhes" /> }));
registerRoute("chat-ao-vivo", async () => ({ default: () => <PlaceholderPage title="Chat Ao Vivo" /> }));
registerRoute("base-de-conhecimento", async () => ({ default: () => <PlaceholderPage title="Base de Conhecimento" /> }));
registerRoute("feedback-de-clientes", async () => ({ default: () => <PlaceholderPage title="Feedback de Clientes" /> }));
registerRoute("portal-do-cliente", async () => ({ default: () => <PlaceholderPage title="Portal do Cliente" /> }));
registerRoute("slas-e-metricas", async () => ({ default: () => <PlaceholderPage title="SLAs e Métricas" /> }));
registerRoute("integracoes-de-suporte", async () => ({ default: () => <PlaceholderPage title="Integrações de Suporte" /> }));
registerRoute("analytics-dashboard", async () => ({ default: () => <PlaceholderPage title="Analytics - Dashboard" /> }));
registerRoute("relatorios-personalizados", async () => ({ default: () => <PlaceholderPage title="Relatórios Personalizados" /> }));
registerRoute("forecasting-de-vendas", async () => ({ default: () => <PlaceholderPage title="Forecasting de Vendas" /> }));
registerRoute("analise-de-roi", async () => ({ default: () => <PlaceholderPage title="Análise de ROI" /> }));
registerRoute("cohort-analysis", async () => ({ default: () => <PlaceholderPage title="Cohort Analysis" /> }));
registerRoute("atribuicao-de-marketing", async () => ({ default: () => <PlaceholderPage title="Atribuição de Marketing" /> }));
registerRoute("heatmaps-e-sessoes", async () => ({ default: () => <PlaceholderPage title="Heatmaps e Sessões" /> }));
registerRoute("a-b-testing", async () => ({ default: () => <PlaceholderPage title="A/B Testing" /> }));
registerRoute("executive-reports", async () => ({ default: () => <PlaceholderPage title="Executive Reports" /> }));
registerRoute("data-export-import", async () => ({ default: () => <PlaceholderPage title="Data Export/Import" /> }));
registerRoute("workflows-lista", async () => ({ default: () => <PlaceholderPage title="Workflows - Lista" /> }));
registerRoute("workflows-builder", async () => ({ default: () => <PlaceholderPage title="Workflows - Builder" /> }));
registerRoute("sequences-de-vendas", async () => ({ default: () => <PlaceholderPage title="Sequences de Vendas" /> }));
registerRoute("ai-insights", async () => ({ default: () => <PlaceholderPage title="AI Insights" /> }));
registerRoute("ai-assistant", async () => ({ default: () => <PlaceholderPage title="AI Assistant" /> }));
registerRoute("playbooks-de-vendas", async () => ({ default: () => <PlaceholderPage title="Playbooks de Vendas" /> }));
registerRoute("automacao-de-tarefas", async () => ({ default: () => <PlaceholderPage title="Automação de Tarefas" /> }));
registerRoute("leaderboards", async () => ({ default: () => <PlaceholderPage title="Leaderboards" /> }));
registerRoute("badges-e-conquistas", async () => ({ default: () => <PlaceholderPage title="Badges e Conquistas" /> }));
registerRoute("metas-e-desafios", async () => ({ default: () => <PlaceholderPage title="Metas e Desafios" /> }));
registerRoute("pontuacao-e-niveis", async () => ({ default: () => <PlaceholderPage title="Pontuação e Níveis" /> }));
registerRoute("competitions", async () => ({ default: () => <PlaceholderPage title="Competitions" /> }));
registerRoute("rewards-store", async () => ({ default: () => <PlaceholderPage title="Rewards Store" /> }));
registerRoute("feedback-gamificado", async () => ({ default: () => <PlaceholderPage title="Feedback Gamificado" /> }));
registerRoute("analytics-de-gamificacao", async () => ({ default: () => <PlaceholderPage title="Analytics de Gamificação" /> }));
registerRoute("inbox-unificada", async () => ({ default: () => <PlaceholderPage title="Inbox Unificada" /> }));
registerRoute("email-inbox", async () => ({ default: () => <PlaceholderPage title="Email Inbox" /> }));
registerRoute("chamadas-e-voip", async () => ({ default: () => <PlaceholderPage title="Chamadas e VoIP" /> }));
registerRoute("reunioes-virtuais", async () => ({ default: () => <PlaceholderPage title="Reuniões Virtuais" /> }));
registerRoute("sms-marketing", async () => ({ default: () => <PlaceholderPage title="SMS Marketing" /> }));
registerRoute("whatsapp-business", async () => ({ default: () => <PlaceholderPage title="WhatsApp Business" /> }));
registerRoute("chatbots-config", async () => ({ default: () => <PlaceholderPage title="Chatbots Config" /> }));
registerRoute("voice-analytics", async () => ({ default: () => <PlaceholderPage title="Voice Analytics" /> }));
registerRoute("social-listening", async () => ({ default: () => <PlaceholderPage title="Social Listening" /> }));
registerRoute("push-notifications", async () => ({ default: () => <PlaceholderPage title="Push Notifications" /> }));
registerRoute("api-de-comunicacao", async () => ({ default: () => <PlaceholderPage title="API de Comunicação" /> }));
registerRoute("omnichannel-analytics", async () => ({ default: () => <PlaceholderPage title="Omnichannel Analytics" /> }));
registerRoute("equipes-lista", async () => ({ default: () => <PlaceholderPage title="Equipes - Lista" /> }));
registerRoute("usuarios-lista", async () => ({ default: () => <PlaceholderPage title="Usuários - Lista" /> }));
registerRoute("funcoes-e-permissoes", async () => ({ default: () => <PlaceholderPage title="Funções e Permissões" /> }));
registerRoute("territorios-e-cotas", async () => ({ default: () => <PlaceholderPage title="Territórios e Cotas" /> }));
registerRoute("comissoes", async () => ({ default: () => <PlaceholderPage title="Comissões" /> }));
registerRoute("metas-de-equipe", async () => ({ default: () => <PlaceholderPage title="Metas de Equipe" /> }));
registerRoute("treinamentos", async () => ({ default: () => <PlaceholderPage title="Treinamentos" /> }));
registerRoute("performance-reviews", async () => ({ default: () => <PlaceholderPage title="Performance Reviews" /> }));
registerRoute("marketplace-de-apps", async () => ({ default: () => <PlaceholderPage title="Marketplace de Apps" /> }));
registerRoute("api-console", async () => ({ default: () => <PlaceholderPage title="API Console" /> }));
registerRoute("webhooks", async () => ({ default: () => <PlaceholderPage title="Webhooks" /> }));
registerRoute("integracao-google-workspace", async () => ({ default: () => <PlaceholderPage title="Integração Google Workspace" /> }));
registerRoute("integracao-microsoft-365", async () => ({ default: () => <PlaceholderPage title="Integração Microsoft 365" /> }));
registerRoute("integracao-com-erps", async () => ({ default: () => <PlaceholderPage title="Integração com ERPs" /> }));
registerRoute("pagamentos-integrados", async () => ({ default: () => <PlaceholderPage title="Pagamentos Integrados" /> }));
registerRoute("e-commerce-integrations", async () => ({ default: () => <PlaceholderPage title="E-commerce Integrations" /> }));
registerRoute("bi-tools-integration", async () => ({ default: () => <PlaceholderPage title="BI Tools Integration" /> }));
registerRoute("custom-integrations", async () => ({ default: () => <PlaceholderPage title="Custom Integrations" /> }));
registerRoute("configuracoes-gerais", async () => ({ default: () => <PlaceholderPage title="Configurações Gerais" /> }));
registerRoute("notificacoes", async () => ({ default: () => <PlaceholderPage title="Notificações" /> }));
registerRoute("email-config", async () => ({ default: () => <PlaceholderPage title="Email Config" /> }));
registerRoute("cobranca-e-planos", async () => ({ default: () => <PlaceholderPage title="Cobrança e Planos" /> }));
registerRoute("branding-personalizado", async () => ({ default: () => <PlaceholderPage title="Branding Personalizado" /> }));
registerRoute("campos-customizados", async () => ({ default: () => <PlaceholderPage title="Campos Customizados" /> }));
registerRoute("privacidade-de-dados", async () => ({ default: () => <PlaceholderPage title="Privacidade de Dados" /> }));
registerRoute("backups-e-restore", async () => ({ default: () => <PlaceholderPage title="Backups e Restore" /> }));
registerRoute("logs-de-auditoria", async () => ({ default: () => <PlaceholderPage title="Logs de Auditoria" /> }));
registerRoute("seguranca-avancada", async () => ({ default: () => <PlaceholderPage title="Segurança Avançada" /> }));
registerRoute("onboarding-wizard", async () => ({ default: () => <PlaceholderPage title="Onboarding Wizard" /> }));
registerRoute("migracao-de-dados", async () => ({ default: () => <PlaceholderPage title="Migração de Dados" /> }));
registerRoute("api-keys-management", async () => ({ default: () => <PlaceholderPage title="API Keys Management" /> }));
registerRoute("mobile-app-config", async () => ({ default: () => <PlaceholderPage title="Mobile App Config" /> }));
registerRoute("system-status", async () => ({ default: () => <PlaceholderPage title="System Status" /> }));
registerRoute("centro-de-ajuda", async () => ({ default: () => <PlaceholderPage title="Centro de Ajuda" /> }));
registerRoute("novidades", async () => ({ default: () => <PlaceholderPage title="Novidades" /> }));
registerRoute("recursos-e-templates", async () => ({ default: () => <PlaceholderPage title="Recursos e Templates" /> }));
registerRoute("comunidade", async () => ({ default: () => <PlaceholderPage title="Comunidade" /> }));
registerRoute("historias-de-sucesso", async () => ({ default: () => <PlaceholderPage title="Histórias de Sucesso" /> }));

const themeOptions: { key: string; label: string; description: string }[] = [
  { key: "glass-dark", label: "Glass Dark", description: "Night ops" },
  { key: "platinum-glass", label: "Platinum Glass", description: "Boardroom" },
  { key: "midnight-aurora", label: "Midnight Aurora", description: "Innovation" },
  { key: "desert-quartz", label: "Desert Quartz", description: "Hospitality" },
  { key: "neon-energy", label: "Neon Energy", description: "Vibrant" },
  { key: "cyber-vivid", label: "Cyber Vivid", description: "Electric" },
];

const themeSwatches: Record<string, string> = {
  "glass-dark": "linear-gradient(140deg, #7a8f80 0%, #8794a4 52%, #c5a47c 100%)",
  "platinum-glass": "linear-gradient(140deg, #f7f7f4 0%, #d9dde2 55%, #c0b3a2 100%)",
  "midnight-aurora": "linear-gradient(140deg, #45505f 0%, #7a8c9f 60%, #b8976d 100%)",
  "desert-quartz": "linear-gradient(140deg, #f5efe6 0%, #d9c3a9 58%, #b88958 100%)",
  "neon-energy": "linear-gradient(140deg, #34d399 0%, #38bdf8 50%, #a855f7 100%)",
  "cyber-vivid": "linear-gradient(140deg, #fb923c 0%, #f472b6 50%, #8b5cf6 100%)",
};

const currencyOptions = [
  { label: "BRL", value: "BRL" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
];

const timeframeOptions = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
];

const badgePalette: Record<string, string> = {
  emerald: "text-[var(--accent-emerald)] border-[var(--accent-emerald)]/35 bg-[var(--accent-emerald)]/14",
  sky: "text-[var(--accent-sky)] border-[var(--accent-sky)]/32 bg-[var(--accent-sky)]/14",
  fuchsia: "text-[var(--accent-fuchsia)] border-[var(--accent-fuchsia)]/32 bg-[var(--accent-fuchsia)]/14",
  amber: "text-[var(--accent-amber)] border-[var(--accent-amber)]/30 bg-[var(--accent-amber)]/14",
};

const useDashboardStore = create<DashboardState>((set) => ({
  loading: true,
  kpis: [],
  analytics: {
    pipeline: [],
    conversion: [],
    heatmap: [],
    cohort: [],
    geo: [],
    marketSplit: [],
  },
  aiInsights: [],
  automations: [],
  engagement: {
    feed: [],
    leaderboard: [],
    tasks: [],
    community: [],
    sla: [],
  },
  campaigns: [],
  currency: "BRL",
  timeframe: "30d",
  theme: "glass-dark",
  fetchData: async () => {
    try {
      set({ loading: true });

      const results = await Promise.all([
        getLeads(),
        getOpportunities(),
        getCampaigns(),
        getTopLeadsByScore(5)
      ]);
      
      const leads = results[0]?.data?.data || [];
      const opportunities = results[1]?.data?.data || [];
      const campaigns = results[2]?.data || [];
      const leaderboard = results[3]?.data || [];

      const kpis: KPI[] = [
        {
          id: "leads",
          title: "Leads Ativos",
          value: leads.length.toString(),
          trend: 0,
          trendLabel: "Base Supabase",
          series: [0, 0, 0, leads.length],
          target: "—",
          description: "Total de leads ativos em leads_crm",
          icon: <Target className="h-5 w-5 text-[var(--accent-emerald)]" />,
        },
        {
          id: "deals",
          title: "Negócios em Andamento",
          value: opportunities.length.toString(),
          trend: 0,
          trendLabel: "Base Supabase",
          series: [0, 0, 0, opportunities.length],
          target: "—",
          description: "Registros atuais em sales_pipeline",
          icon: <Rocket className="h-5 w-5 text-[var(--accent-sky)]" />,
        },
        {
          id: "campanhas",
          title: "Campanhas Ativas",
          value: campaigns.length.toString(),
          trend: 0,
          trendLabel: "Base Supabase",
          series: [0, 0, 0, campaigns.length],
          target: "—",
          description: "Campanhas registradas em marketing_campaigns",
          icon: <LineChart className="h-5 w-5 text-[var(--accent-fuchsia)]" />,
        },
      ];

      const engagement = {
        feed: [],
        leaderboard: leaderboard.map((p: any, i: number) => ({
          user: p.user_name ?? `User ${i + 1}`,
          avatar: p.avatar_url ?? "https://api.dicebear.com/7.x/identicon/svg",
          score: p.score ?? 0,
          delta: 0,
          rank: i + 1,
        })),
        tasks: [],
        community: [],
        sla: [],
      };

      set({
        loading: false,
        kpis,
        analytics: {
          pipeline: [],
          conversion: [],
          heatmap: [],
          cohort: [],
          geo: [],
          marketSplit: [],
        },
        aiInsights: [],
        automations: [],
        engagement,
        campaigns,
      });

      console.info("✅ Dashboard populado com dados reais do Supabase.");
    } catch (err) {
      console.error("❌ Erro ao buscar dados Supabase:", err);
      set({ loading: false });
    }
  },
  setCurrency: (currency) => set({ currency }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setTheme: (theme) => set({ theme }),
}));

type DashboardState = {
  loading: boolean;
  kpis: KPI[];
  analytics: AnalyticsData;
  aiInsights: AIInsight[];
  automations: Automation[];
  engagement: EngagementData;
  currency: "USD" | "EUR" | "BRL";
  timeframe: "7d" | "30d" | "90d";
  theme: ThemeKey;
  campaigns: Campaign[];
  fetchData: () => void;
  setCurrency: (currency: "USD" | "EUR" | "BRL") => void;
  setTimeframe: (timeframe: "7d" | "30d" | "90d") => void;
  setTheme: (theme: ThemeKey) => void;
};

type ThemeKey =
  | "glass-dark"
  | "platinum-glass"
  | "midnight-aurora"
  | "desert-quartz"
  | "neon-energy"
  | "cyber-vivid";

type KPI = {
  id: string;
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  series: number[];
  target: string;
  highlight?: boolean;
  description: string;
  icon: JSX.Element;
};

type AnalyticsData = {
  pipeline: PipelineStage[];
  conversion: ConversionStage[];
  heatmap: HeatmapCell[];
  cohort: CohortRow[];
  geo: GeoPoint[];
  marketSplit: MarketSlice[];
};

type MarketSlice = {
  label: string;
  value: number;
  accent: string;
};

type Campaign = {
  id: string;
  name: string;
  headline: string;
  subheadline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  badge: string;
  badgeTone: "emerald" | "sky" | "fuchsia" | "amber";
  mediaType: "image" | "video" | "iframe";
  mediaSrc: string;
  metrics: Array<{ label: string; value: string }>;
};

type PipelineStage = {
  stage: string;
  value: number;
  delta: number;
};

type ConversionStage = {
  stage: string;
  value: number;
  benchmark: number;
};

type HeatmapCell = {
  squad: string;
  day: string;
  score: number;
};

type CohortRow = {
  cohort: string;
  retention: number[];
};

type GeoPoint = {
  region: string;
  value: number;
  latitude: number;
  longitude: number;
  trend: number;
};

type AIInsight = {
  id: string;
  title: string;
  impact: string;
  confidence: "Alta" | "Média" | "Baixa";
  action: string;
  score: number;
};

type Automation = {
  id: string;
  name: string;
  status: "Executando" | "Agendado" | "Concluído";
  efficiency: number;
  savedHours: number;
  lastRun: string;
};

type EngagementData = {
  feed: ActivityEvent[];
  leaderboard: LeaderboardEntry[];
  tasks: Task[];
  community: CommunityHighlight[];
  sla: SLARecord[];
};

type ActivityEvent = {
  id: string;
  type: "Deal" | "Lead" | "Automation" | "Gamification" | "AI";
  title: string;
  description: string;
  timestamp: string;
  icon: JSX.Element;
};

type LeaderboardEntry = {
  user: string;
  avatar: string;
  score: number;
  delta: number;
  rank: number;
};

type Task = {
  id: string;
  title: string;
  owner: string;
  dueIn: string;
  progress: number;
};

type CommunityHighlight = {
  id: string;
  title: string;
  author: string;
  likes: number;
  comments: number;
  trend: number;
};

type SLARecord = {
  metric: string;
  value: string;
  target: string;
  status: "OK" | "Alerta" | "Crítico";
};

const mockKpis: KPI[] = [
  {
    id: "revenue",
    title: "Receita reconhecida",
    value: "R$ 3,1M",
    trend: 12,
    trendLabel: "+12% vs último mês",
    series: [2.4, 2.6, 2.8, 3.1],
    target: "Meta: R$ 3,5M",
    highlight: true,
    description: "Soma dos deals marcados como ganhos no período",
    icon: <PieChartIcon className="h-5 w-5 text-[var(--accent-emerald)]" />,
  },
  {
    id: "nps",
    title: "NPS Global",
    value: "76",
    trend: 6,
    trendLabel: "+6 pts vs último trimestre",
    series: [68, 71, 74, 76],
    target: "Meta: 80",
    description: "Pontuação líquida de promotores em todos os canais",
    icon: <HeartPulse className="h-5 w-5" />,
  },
  {
    id: "automation",
    title: "Horas economizadas",
    value: "428h",
    trend: 18,
    trendLabel: "+18% vs média trimestral",
    series: [280, 320, 364, 428],
    target: "Meta: 450h",
    description: "Tempo poupado com automações aprovadas",
    icon: <Flame className="h-5 w-5" />,
  },
  {
    id: "forecast",
    title: "Precisão do forecast",
    value: "92%",
    trend: 4,
    trendLabel: "+4pp vs benchmark",
    series: [76, 81, 88, 92],
    target: "Meta: 94%",
    description: "Desvio médio entre previsão e realizado",
    icon: <Sparkles className="h-5 w-5" />,
  },
];

const mockAnalytics: AnalyticsData = {
  pipeline: [
    { stage: "Prospects", value: 423, delta: 8 },
    { stage: "Qualificados", value: 276, delta: 12 },
    { stage: "Propostas", value: 148, delta: 6 },
    { stage: "Negociação", value: 94, delta: 9 },
    { stage: "Ganhos", value: 62, delta: 11 },
  ],
  conversion: [
    { stage: "MQL → SQL", value: 42, benchmark: 38 },
    { stage: "SQL → Oportunidade", value: 37, benchmark: 31 },
    { stage: "Oportunidade → Fechado", value: 24, benchmark: 21 },
  ],
  heatmap: [
    { squad: "Orion", day: "Seg", score: 96 },
    { squad: "Orion", day: "Ter", score: 88 },
    { squad: "Orion", day: "Qua", score: 92 },
    { squad: "Lyra", day: "Seg", score: 84 },
    { squad: "Lyra", day: "Ter", score: 91 },
    { squad: "Lyra", day: "Qua", score: 88 },
    { squad: "Vega", day: "Seg", score: 78 },
    { squad: "Vega", day: "Ter", score: 83 },
    { squad: "Vega", day: "Qua", score: 86 },
  ],
  cohort: [
    { cohort: "Jul/24", retention: [100, 91, 83, 76, 71] },
    { cohort: "Ago/24", retention: [100, 89, 82, 74, 70] },
    { cohort: "Set/24", retention: [100, 92, 85, 79, 74] },
  ],
  geo: [
    { region: "São Paulo", value: 42, latitude: -23.55, longitude: -46.63, trend: 14 },
    { region: "Rio de Janeiro", value: 24, latitude: -22.9, longitude: -43.17, trend: 9 },
    { region: "Curitiba", value: 18, latitude: -25.43, longitude: -49.27, trend: 6 },
    { region: "Porto Alegre", value: 15, latitude: -30.03, longitude: -51.23, trend: 7 },
  ],
  marketSplit: [
    { label: "SaaS Enterprise", value: 38, accent: "#7a8f80" },
    { label: "Mid-market", value: 27, accent: "#8794a4" },
    { label: "SMB Digital", value: 21, accent: "#c5a47c" },
    { label: "Channel Partners", value: 14, accent: "#b89a6c" },
  ],
};

const mockAiInsights: AIInsight[] = [
  {
    id: "ai-1",
    title: "Segmento SaaS Enterprise queimou 78% do objetivo anual",
    impact: "Potencial de +R$ 720K no trimestre",
    confidence: "Alta",
    action: "Implantar nova sequência de abordagem consultiva para leads >R$ 50K",
    score: 94,
  },
  {
    id: "ai-2",
    title: "Processos com risco de churn nas últimas 72h",
    impact: "18 contas com sentimento negativo consistente",
    confidence: "Média",
    action: "Acionar playbook 'Resgate Premium' com call executiva",
    score: 88,
  },
  {
    id: "ai-3",
    title: "Marketing Ops com ROI abaixo do benchmark",
    impact: "Campanhas de webinar -17% de conversão",
    confidence: "Alta",
    action: "Redirecionar verba para Paid Search e personalizar landing",
    score: 81,
  },
];

const mockAutomations: Automation[] = [
  {
    id: "auto-1",
    name: "Requalificação automática de leads com IA",
    status: "Executando",
    efficiency: 96,
    savedHours: 112,
    lastRun: "há 8 min",
  },
  {
    id: "auto-2",
    name: "Distribuição inteligente de deals high-touch",
    status: "Concluído",
    efficiency: 88,
    savedHours: 64,
    lastRun: "há 52 min",
  },
  {
    id: "auto-3",
    name: "Nurturing avançado pós-evento",
    status: "Agendado",
    efficiency: 79,
    savedHours: 43,
    lastRun: "prev. 20h",
  },
];

const mockEngagement: EngagementData = {
  feed: [
    {
      id: "event-1",
      type: "Deal",
      title: "Fechado ganhou • R$ 280K",
      description: "Conta: Nubra AgroTech • Squad Orion",
      timestamp: "há 12 min",
      icon: <ArrowUpRight className="h-4 w-4 text-[var(--accent-emerald)]" />,
    },
    {
      id: "event-2",
      type: "AI",
      title: "Copilot gerou 24 propostas",
      description: "Eficiência +34% vs média",
      timestamp: "há 27 min",
      icon: <Sparkles className="h-4 w-4 text-[var(--accent-fuchsia)]" />,
    },
    {
      id: "event-3",
      type: "Gamification",
      title: "Badge Diamante desbloqueado",
      description: "Maria P. atingiu 98% de metas consecutivas",
      timestamp: "há 41 min",
      icon: <Flame className="h-4 w-4 text-[var(--accent-amber)]" />,
    },
  ],
  leaderboard: [
    { user: "Maria Pereira", avatar: "MP", score: 982, delta: 34, rank: 1 },
    { user: "João Carvalho", avatar: "JC", score: 941, delta: 22, rank: 2 },
    { user: "Ana Souza", avatar: "AS", score: 918, delta: 18, rank: 3 },
  ],
  tasks: [
    {
      id: "task-1",
      title: "Revisar proposta Fortune + Copilot",
      owner: "Você",
      dueIn: "4h",
      progress: 72,
    },
    {
      id: "task-2",
      title: "Kick-off Aliança Phobos",
      owner: "Squad Vega",
      dueIn: "AMANHÃ",
      progress: 28,
    },
    {
      id: "task-3",
      title: "Auditar SLA Premium",
      owner: "Time Suporte",
      dueIn: "2 dias",
      progress: 54,
    },
  ],
  community: [
    {
      id: "post-1",
      title: "Playbook de abordagem híbrida com IA",
      author: "Lorena Campos",
      likes: 284,
      comments: 47,
      trend: 26,
    },
    {
      id: "post-2",
      title: "Integração Supabase × Data Warehouse",
      author: "Rafael A.",
      likes: 198,
      comments: 22,
      trend: 14,
    },
  ],
  sla: [
    {
      metric: "First Response Time",
      value: "07m",
      target: "Meta: 10m",
      status: "OK",
    },
    {
      metric: "Resolução Prioridade A",
      value: "2h18",
      target: "Meta: 2h",
      status: "Alerta",
    },
    {
      metric: "Backlog crítico",
      value: "12 casos",
      target: "Meta: ≤ 8",
      status: "Crítico",
    },
  ],
};

const mockCampaigns: Campaign[] = [
  {
    id: "campaign-orion",
    name: "Orion Prime Experience",
    headline: "Suite de IA com onboarding em 48h",
    subheadline: "Nova geração de playbooks orientados por copilots",
    description:
      "Implante jornadas de aquisição com recomendação cognitiva e sprints assistidos por IA. Tudo calibrado para squads enterprise e velocity teams.",
    ctaLabel: "Ver blueprint",
    ctaHref: "https://alshamprima.com/blueprint/orion",
    badge: "Lançamento Q4",
    badgeTone: "emerald",
    mediaType: "image",
    mediaSrc: campaignOrion,
    metrics: [
      { label: "Ativação", value: "+63%" },
      { label: "Payback", value: "3.2m" },
      { label: "Upsell", value: "+28%" },
    ],
  },
  {
    id: "campaign-video",
    name: "Motion Studio GTM",
    headline: "Campanhas com vídeo inteligente",
    subheadline: "Stories e webinars com insights em tempo real",
    description:
      "Automatize conteúdos dinâmicos com roteiros otimizados por IA, geração de cortes automáticos e analytics preditivo direto no painel executivo.",
    ctaLabel: "Assistir demo",
    ctaHref: "https://alshamprima.com/demo/motion",
    badge: "Preview exclusivo",
    badgeTone: "sky",
    mediaType: "video",
    mediaSrc: "https://cdn.coverr.co/videos/coverr-business-team-meeting-9950/1080p.mp4",
    metrics: [
      { label: "Conversão", value: "+21%" },
      { label: "Tempo médio", value: "7m14s" },
      { label: "CSAT", value: "96" },
    ],
  },
  {
    id: "campaign-labs",
    name: "CX Labs Copilot",
    headline: "Assistente cognitivo para squads de suporte",
    subheadline: "Contexto unificado, scripts dinâmicos e SLA premium",
    description:
      "Habilite agentes com copilotos especializados, monitoramento de sentimento e priorização automática das interações mais valiosas.",
    ctaLabel: "Ver laboratório",
    ctaHref: "https://alshamprima.com/labs/cx",
    badge: "Beta fechado",
    badgeTone: "fuchsia",
    mediaType: "iframe",
    mediaSrc: "https://www.youtube.com/embed/iYe07ZcHqh4?rel=0&modestbranding=1",
    metrics: [
      { label: "SLA 1ª resposta", value: "-42%" },
      { label: "Adoção IA", value: "94%" },
      { label: "FCR", value: "+18pp" },
    ],
  },
];

function App() {
  const {
    loading,
    kpis,
    analytics,
    aiInsights,
    automations,
    engagement,
    campaigns,
    currency,
    timeframe,
    theme,
    fetchData,
    setCurrency,
    setTimeframe,
    setTheme,
  } = useDashboardStore();
  const [campaignIndex, setCampaignIndex] = useState(0);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard-principal");

  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ FASE 3 – REAL-TIME SUBSCRIPTIONS (ALSHAM 360° PRIMA) - FIXED v3
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useEffect(() => {
  let mounted = true;
  const channels: any[] = [];

  const setupSubscriptions = async () => {
    console.log('🔴 Iniciando subscriptions Real-time...');

    // Subscribe para mudanças em leads
    const leadsChannel = supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads_crm'
        },
        (payload) => {
          if (mounted) {
            console.log('📊 Lead atualizado:', payload);
            fetchData();
          }
        }
      )
      .subscribe();

    channels.push(leadsChannel);

    // Subscribe para mudanças em campanhas
    const campaignsChannel = supabase
      .channel('campaigns_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketing_campaigns'
        },
        (payload) => {
          if (mounted) {
            console.log('🚀 Campanha atualizada:', payload);
            fetchData();
          }
        }
      )
      .subscribe();

    channels.push(campaignsChannel);

    // Subscribe para mudanças em gamificação
    const gamificationChannel = supabase
      .channel('gamification_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gamification_points'
        },
        (payload) => {
          if (mounted) {
            console.log('🏆 Pontuação atualizada:', payload);
            fetchData();
          }
        }
      )
      .subscribe();

    channels.push(gamificationChannel);

    console.log('✅ Subscriptions Real-time iniciadas');
  };

  setupSubscriptions();

  // Cleanup ao desmontar
  return () => {
    mounted = false;
    console.log('🔴 Desconectando subscriptions...');
    channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
  };
}, []); // ⚠️ IMPORTANTE: array vazio - executar só uma vez
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔚 FIM DA INTEGRAÇÃO REAL-TIME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
    useEffect(() => {
    if (!campaigns.length) return;
    setCampaignIndex((prev) => (prev >= campaigns.length ? 0 : prev));
  }, [campaigns.length]);

  useEffect(() => {
    if (campaigns.length <= 1) return;
    const timer = setInterval(() => {
      setCampaignIndex((prev) => (prev + 1) % campaigns.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [campaigns.length]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event: MediaQueryList | MediaQueryListEvent) => {
      if (event.matches) {
        setMobileNavOpen(false);
      }
    };

    handleChange(mediaQuery);

    const listener = (event: MediaQueryListEvent) => handleChange(event);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, []);

  const pipelineBarData = useMemo(() => {
    const labels = analytics.pipeline.map((stage) => stage.stage);
    const values = analytics.pipeline.map((stage) => stage.value ?? 0);
    const palette = [chartNeutrals.sage, chartNeutrals.mist, chartNeutrals.clay, chartNeutrals.brass];

    return {
      labels: labels.length ? labels : ["Sem dados"],
      datasets: [
        {
          label: "Volume",
          data: values.length ? values : [0],
          backgroundColor: values.map((_, idx) => hexToRgba(palette[idx % palette.length], 0.75)),
          borderRadius: 18,
          hoverBackgroundColor: values.map((_, idx) => hexToRgba(palette[idx % palette.length], 0.95)),
        },
      ],
    };
  }, [analytics.pipeline]);

  const pipelineBarOptions = useMemo(() => {
    const axisColor = hexToRgba(chartNeutrals.soot, 0.45);
    const gridColor = hexToRgba(chartNeutrals.soot, 0.15);
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      layout: { padding: { top: 8, bottom: 8 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: hexToRgba(chartNeutrals.soot, 0.92),
          borderColor: hexToRgba(chartNeutrals.soot, 0.25),
          borderWidth: 1,
          titleColor: "#f8f8f6",
          bodyColor: "#f8f8f6",
          padding: 12,
        },
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: {
            color: axisColor,
            precision: 0,
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: axisColor,
            font: { size: 12 },
          },
        },
      },
    };
  }, [analytics.pipeline.length]);

  const conversionLineData = useMemo(() => {
    const labels = analytics.conversion.map((stage) => stage.stage);
    const values = analytics.conversion.map((stage) => stage.value ?? 0);

    return {
      labels: labels.length ? labels : ["Sem dados"],
      datasets: [
        {
          label: "Taxa de Conversão",
          data: values.length ? values : [0],
          borderColor: chartNeutrals.sage,
          backgroundColor: hexToRgba(chartNeutrals.sage, 0.18),
          fill: true,
          tension: 0.38,
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: chartNeutrals.clay,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 1.5,
        },
      ],
    };
  }, [analytics.conversion]);

  const conversionLineOptions = useMemo(() => {
    const axisColor = hexToRgba(chartNeutrals.soot, 0.45);
    const gridColor = hexToRgba(chartNeutrals.soot, 0.12);
    const maxValue = analytics.conversion.length
      ? Math.max(...analytics.conversion.map((stage) => stage.value ?? 0))
      : 100;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: hexToRgba(chartNeutrals.soot, 0.92),
          borderColor: hexToRgba(chartNeutrals.soot, 0.25),
          borderWidth: 1,
          titleColor: "#f8f8f6",
          bodyColor: "#f8f8f6",
          padding: 12,
          callbacks: {
            label: (context: any) => `${context.parsed.y ?? 0}% de conversão`,
          },
        },
      },
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: axisColor },
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: axisColor,
            callback: (value: number) => `${value}%`,
          },
          suggestedMin: 0,
          suggestedMax: Math.min(Math.ceil(maxValue / 10) * 10 + 10, 100),
        },
      },
    };
  }, [analytics.conversion]);

  const marketSplitData = useMemo(() => {
    const labels = analytics.marketSplit.map((slice) => slice.label);
    const values = analytics.marketSplit.map((slice) => slice.value ?? 0);
    const colors = analytics.marketSplit.map((slice) => hexToRgba(slice.accent, 0.85));

    return {
      labels: labels.length ? labels : ["Sem dados"],
      datasets: [
        {
          label: "Participação",
          data: values.length ? values : [1],
          backgroundColor: colors.length ? colors : [hexToRgba(chartNeutrals.sage, 0.6)],
          borderColor: hexToRgba(chartNeutrals.soot, 0.08),
          borderWidth: 2,
          hoverOffset: 6,
          spacing: 3,
        },
      ],
    };
  }, [analytics.marketSplit]);

  const marketSplitOptions = useMemo(() => {
    const legendColor = hexToRgba(chartNeutrals.soot, 0.55);
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: "right" as const,
          labels: {
            color: legendColor,
            usePointStyle: true,
            padding: 16,
            boxWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: hexToRgba(chartNeutrals.soot, 0.92),
          borderColor: hexToRgba(chartNeutrals.soot, 0.25),
          borderWidth: 1,
          titleColor: "#f8f8f6",
          bodyColor: "#f8f8f6",
          padding: 12,
          callbacks: {
            label: (context: any) => `${context.label}: ${context.parsed}%`,
          },
        },
      },
    };
  }, [analytics.marketSplit]);

  const heatmapMeta = useMemo(() => {
    if (!analytics.heatmap.length) {
      return {
        days: [] as string[],
        squads: [] as string[],
        matrix: [] as number[][],
        maxScore: 0,
      };
    }

    const days = Array.from(new Set(analytics.heatmap.map((cell) => cell.day)));
    const squads = Array.from(new Set(analytics.heatmap.map((cell) => cell.squad)));
    const matrix = squads.map((squad) =>
      days.map((day) => {
        const match = analytics.heatmap.find((cell) => cell.squad === squad && cell.day === day);
        return match?.score ?? 0;
      })
    );
    const maxScore = matrix.flat().reduce((max, score) => Math.max(max, score), 0);

    return { days, squads, matrix, maxScore };
  }, [analytics.heatmap]);

  const heatmapSafeMax = heatmapMeta.maxScore > 0 ? heatmapMeta.maxScore : 100;

  if (loading) {
    return <LoadingSkeletonLayout theme={theme} />;
  }

  registerRoute(
    "dashboard",
    async () => ({
      default: () => (
                  <section className="px-4 pb-14 pt-10 sm:px-6 md:pb-16 md:pt-12 lg:px-10"
                    style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 3.5rem)" }}
                  >
                    <div className="flex flex-col gap-6">
                      {campaigns.length > 0 && (
                        <CampaignSpotlight
                          campaigns={campaigns}
                          activeIndex={campaignIndex}
                          onSelect={setCampaignIndex}
                        />
                      )}

                      <motion.section
                        className="relative overflow-hidden rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/90 p-6 shadow-lifted sm:p-8 lg:p-10"
                        initial={{ opacity: 0, y: 36 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true, amount: 0.4 }}
                      >
                        <div className="pointer-events-none absolute inset-0 opacity-90" style={{ background: "var(--gradient-wash)" }} />
                        <div className="absolute -left-32 top-0 hidden h-full w-32 bg-gradient-to-r from-black/10 to-transparent blur-3xl lg:block" />
                        <div className="absolute -right-24 bottom-0 hidden h-56 w-48 rounded-full bg-[var(--accent-emerald)]/12 blur-3xl lg:block" />

                        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-12">
                          <div className="flex flex-col gap-8">
                            <div className="space-y-4">
                              <span className="inline-flex items-center gap-3 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/60 px-4 py-2 text-[11px] uppercase tracking-[0.5em] text-[var(--accent-sky)]">
                                <span className="h-1.5 w-6 rounded-full bg-[var(--accent-emerald)]/70" /> You are in control
                              </span>
                              <h1 className="text-4xl font-light leading-tight text-[var(--text-primary)] sm:text-[46px]">
                                Dashboard Executivo 360° — Obsessão em Resultados Visíveis.
                              </h1>
                              <p className="max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                                Uma visão holística que combina CRM, Inteligência Artificial, Automação, Comunidade e Gamificação em tempo real. Cada interação mapeada em valor, cada decisão orientada por dados, cada resultado amplificado por IA.
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-emerald)]/40 bg-wash-sage px-5 py-2.5 text-[var(--accent-emerald)]">
                                <Sparkles className="h-4 w-4" /> Copilot 360° integrado
                              </span>
                              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-sky)]/40 bg-wash-mist px-5 py-2.5 text-[var(--accent-sky)]">
                                <HeartPulse className="h-4 w-4" /> ROI em tempo real
                              </span>
                              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-fuchsia)]/40 bg-wash-clay px-5 py-2.5 text-[var(--accent-fuchsia)]">
                                <Flame className="h-4 w-4" /> Automação proativa
                              </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="group relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6 transition duration-500 hover:border-[var(--accent-emerald)]/45 hover:shadow-lifted">
                                <div className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-[var(--accent-emerald)]/12 blur-3xl transition duration-500 group-hover:scale-110" />
                                <p className="text-sm text-[var(--accent-emerald)]">Valor agregado</p>
                                <p className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">R$ 18,7M</p>
                                <p className="mt-4 text-xs text-[var(--text-secondary)]">+328% vs baseline pré-ALSHAM</p>
                              </div>

                              <div className="group relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6 transition duration-500 hover:border-[var(--accent-sky)]/45 hover:shadow-lifted">
                                <div className="absolute -left-20 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-[var(--accent-sky)]/14 blur-3xl transition duration-500 group-hover:translate-x-4" />
                                <p className="text-sm text-[var(--accent-sky)]">IA & Automação</p>
                                <p className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">6.320h</p>
                                <p className="mt-4 text-xs text-[var(--text-secondary)]">Horas poupadas no período</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-5 rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/75 p-6">
                            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                              <span>ROI acumulado nos últimos 12 meses</span>
                              <span>Moeda: {currency}</span>
                            </div>

                            <div className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/80 p-5">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.34em] text-[var(--accent-sky)]">Momento aha</p>
                                  <p className="mt-2 text-lg font-medium text-[var(--text-primary)]">Onboarding concierge completado</p>
                                </div>
                                <span className="rounded-full border border-[var(--accent-emerald)]/40 px-3 py-1 text-[11px] font-medium text-[var(--accent-emerald)]">92%</span>
                              </div>
                              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                                <span className="font-medium text-[var(--accent-emerald)]">Momento Aha em 3m42s</span> • NPS mensal 76 • Taxa de adoção de IA 94%.
                              </p>
                            </div>

                            <div className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/80 p-5">
                              <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                                <span>Blueprint executivo</span>
                                <span className="inline-flex items-center gap-1 text-[var(--accent-emerald)]">
                                  <ArrowUpRight className="h-4 w-4" /> Ver playbook
                                </span>
                              </div>
                              <div className="grid gap-3 text-sm text-[var(--text-secondary)]">
                                <div className="flex justify-between">
                                  <span>Valor incremental</span>
                                  <span className="text-[var(--text-primary)]">+R$ 720K</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Precisão de forecast</span>
                                  <span className="text-[var(--text-primary)]">92%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Eficiência IA</span>
                                  <span className="text-[var(--text-primary)]">+34pp</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.section>

                      <section>
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-emerald)]">Radar de Performance</p>
                            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">KPIs estratégicos para decisões exponenciais</h2>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)]">Atualizado • timeframe: {timeframe}</p>
                        </div>

                        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                          {kpis.map((kpi, index) => (
                            <motion.div
                              key={kpi.id}
                              role="article"
                              aria-label={`KPI: ${kpi.title} — Valor ${kpi.value}`}
                              className="relative overflow-hidden rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface)]/85 p-6 sm:p-7"
                              style={
                                kpi.highlight
                                  ? {
                                      backgroundImage:
                                        "linear-gradient(140deg, rgba(122,143,128,0.22) 0%, rgba(197,164,124,0.18) 48%, rgba(135,148,164,0.16) 100%)",
                                    }
                                  : undefined
                              }
                              initial={{ opacity: 0, y: 40 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              whileHover={{ y: -10, rotateX: 0.5 }}
                              transition={{ duration: 0.6, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                              viewport={{ once: true, amount: 0.35 }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="grid h-12 w-12 place-content-center rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)]/70 text-[var(--accent-emerald)]">
                                  {kpi.icon}
                                </span>
                                <span className={`text-xs font-medium ${kpi.trend >= 0 ? "text-[var(--accent-emerald)]" : "text-[var(--accent-alert)]"}`}>
                                  {kpi.trend >= 0 ? "+" : ""}
                                  {kpi.trend}%
                                </span>
                              </div>
                              <h3 className="mt-5 text-lg font-medium tracking-tight text-[var(--text-primary)]">{kpi.title}</h3>
                              <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">{kpi.value}</p>
                              <p className="mt-3 text-xs text-[var(--accent-emerald)]/80">{kpi.trendLabel}</p>
                              <div className="mt-5 flex items-start justify-between text-xs text-[var(--text-secondary)]">
                                <span className="max-w-[45%] leading-relaxed">{kpi.target}</span>
                                <span className="max-w-[50%] text-right leading-relaxed">{kpi.description}</span>
                              </div>
                              <div className="mt-6 h-16 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)]/55 p-3">
                                <Sparkline series={kpi.series} highlight={kpi.highlight} />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </section>

                      <section className="grid gap-8 xl:grid-cols-[1.45fr_0.85fr]">
                        <motion.div
                          className="space-y-8 overflow-hidden rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted sm:p-8"
                          initial={{ opacity: 0, y: 48 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                          viewport={{ once: true, amount: 0.35 }}
                        >
                          <header className="space-y-3">
                            <p className="text-[11px] uppercase tracking-[0.45em] text-[var(--accent-sky)]">Analytics & Performance</p>
                            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Indicadores executivos em tempo real</h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                              Visualize os pontos críticos do pipeline, evolução das conversões e composição de receita em um painel único.
                            </p>
                          </header>

                          <div className="grid gap-5 lg:grid-cols-2">
                            <div className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Pipeline por estágio</h4>
                                <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-secondary)]">volume</span>
                              </div>
                              <div className="mt-5 h-56 sm:h-60 md:h-72" role="img" aria-label="Gráfico de Pipeline por Estágio">
                                <Bar data={pipelineBarData} options={pipelineBarOptions} />
                              </div>
                            </div>

                            <div className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Funil de conversão</h4>
                                <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-secondary)]">taxa %</span>
                              </div>
                              <div className="mt-5 h-56 sm:h-60 md:h-72" role="img" aria-label="Gráfico de Funil de Conversão">
                                <Line data={conversionLineData} options={conversionLineOptions} />
                              </div>
                            </div>

                            <div className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6 lg:col-span-2">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Divisão de receita por mercado</h4>
                                <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-secondary)]">{timeframe}</span>
                              </div>
                              <div className="mt-5 flex flex-col gap-6 lg:flex-row">
                                <div className="mx-auto h-52 w-52 sm:h-56 sm:w-56" role="img" aria-label="Gráfico de Participação por Mercado">
                                  <Doughnut data={marketSplitData} options={marketSplitOptions} />
                                </div>
                                <div className="flex-1 space-y-3 text-sm text-[var(--text-secondary)]">
                                  {analytics.marketSplit.length ? (
                                    analytics.marketSplit.map((slice) => (
                                      <div
                                        key={slice.label}
                                        className="flex items-center justify-between rounded-2xl border border-[var(--border)]/70 bg-[var(--surface)]/75 px-4 py-3"
                                      >
                                        <span className="flex items-center gap-2 text-[var(--text-primary)]">
                                          <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{ backgroundColor: hexToRgba(slice.accent, 0.85) }}
                                          />
                                          {slice.label}
                                        </span>
                                        <span className="font-medium">{slice.value}%</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-[var(--text-secondary)]">Sem dados de segmentação disponíveis.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Heatmap de energia por squad</h4>
                              <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-secondary)]">score 0-100</span>
                            </div>
                            {heatmapMeta.days.length === 0 || heatmapMeta.squads.length === 0 ? (
                              <p className="mt-6 text-sm text-[var(--text-secondary)]">Sem registros de atividade para o período selecionado.</p>
                            ) : (
                              <div
                                className="mt-6 grid gap-3 text-sm"
                                style={{ gridTemplateColumns: `repeat(${heatmapMeta.days.length + 1}, minmax(0, 1fr))` }}
                              >
                                <div />
                                {heatmapMeta.days.map((day) => (
                                  <div
                                    key={day}
                                    className="text-center text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]"
                                  >
                                    {day}
                                  </div>
                                ))}
                                {heatmapMeta.squads.map((squad, squadIndex) => (
                                  <Fragment key={squad}>
                                    <div className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                                      {squad}
                                    </div>
                                    {heatmapMeta.matrix[squadIndex].map((score, dayIndex) => {
                                      const alpha = score > 0 ? Math.min(0.18 + (score / heatmapSafeMax) * 0.55, 0.78) : 0.12;
                                      const highlight = score > heatmapSafeMax * 0.6;
                                      const dayLabel = heatmapMeta.days[dayIndex];
                                      return (
                                        <div
                                          key={`${squad}-${dayLabel}`}
                                          className="grid h-14 place-content-center rounded-2xl border border-[var(--border)]/70 md:h-16"
                                          style={{
                                            backgroundColor: hexToRgba(chartNeutrals.sage, alpha),
                                            color: highlight ? "var(--text-primary)" : "var(--text-secondary)",
                                          }}
                                          title={`${squad} em ${dayLabel}: ${score} pontos`}
                                        >
                                          <span className="text-sm font-semibold">{score}</span>
                                        </div>
                                      );
                                    })}
                                  </Fragment>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>

                        <motion.div
                          className="grid gap-8 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted sm:p-8"
                          initial={{ opacity: 0, x: 48 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                          viewport={{ once: true, amount: 0.35 }}
                        >
                          <header className="flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-2">
                              <p className="text-[11px] uppercase tracking-[0.45em] text-[var(--accent-sky)]">IA Next-Best-Action</p>
                              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Planos de ação sugeridos pela inteligência preditiva</h3>
                            </div>
                            <button
                              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 px-4 py-2 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-fuchsia)]/45 hover:text-[var(--accent-fuchsia)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                              aria-label="Ver modelo completo de IA"
                            >
                              <Brain className="h-3.5 w-3.5" /> Ver modelo completo
                            </button>
                          </header>

                          <div className="space-y-4">
                            {aiInsights.map((insight) => (
                              <div
                                key={insight.id}
                                className="group relative overflow-hidden rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6 transition duration-500 hover:border-[var(--accent-emerald)]/45"
                              >
                                <div className="absolute inset-y-0 left-0 w-1 rounded-full bg-[var(--accent-emerald)]/65" />
                                <div className="absolute inset-0 opacity-[0.32]" style={{ background: "var(--gradient-wash)" }} />
                                <div className="relative flex flex-wrap items-start justify-between gap-4">
                                  <div className="max-w-2xl space-y-2">
                                    <p className="text-[11px] uppercase tracking-[0.42em] text-[var(--accent-emerald)]">Confiança {insight.confidence}</p>
                                    <h4 className="text-lg font-medium text-[var(--text-primary)]">{insight.title}</h4>
                                    <p className="text-sm text-[var(--text-secondary)]">{insight.impact}</p>
                                  </div>
                                  <span className="rounded-full border border-[var(--border)]/75 bg-[var(--surface)]/75 px-4 py-1.5 text-[11px] font-medium tracking-[0.28em] text-[var(--accent-sky)]">
                                    Score IA • {insight.score}
                                  </span>
                                </div>
                                <p className="relative mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                                  Próxima ação sugerida: <span className="text-[var(--accent-fuchsia)]">{insight.action}</span>
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
                              <span>Automação estratégica ativa</span>
                              <button
                                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/80 px-4 py-2 text-xs text-[var(--accent-sky)] transition hover:border-[var(--accent-emerald)]/45 hover:text-[var(--accent-emerald)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                                aria-label="Abrir catálogo de automações"
                              >
                                <Flame className="h-3.5 w-3.5" /> Catálogo de automações
                              </button>
                            </div>
                            <div className="mt-5 space-y-4 text-sm text-[var(--text-secondary)]">
                              {automations.map((automation) => (
                                <div key={automation.id} className="grid gap-4 rounded-2xl border border-[var(--border)]/80 bg-[var(--surface)]/75 px-5 py-4">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                      <p className="font-medium text-[var(--text-primary)]">{automation.name}</p>
                                      <p className="text-xs text-[var(--text-secondary)]">Última execução: {automation.lastRun}</p>
                                    </div>
                                    <span
                                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                        automation.status === "Executando"
                                          ? "border-[var(--accent-emerald)]/40 text-[var(--accent-emerald)]"
                                          : automation.status === "Agendado"
                                          ? "border-[var(--accent-sky)]/40 text-[var(--accent-sky)]"
                                          : "border-[var(--accent-fuchsia)]/40 text-[var(--accent-fuchsia)]"
                                      }`}
                                    >
                                      {automation.status}
                                    </span>
                                  </div>
                                  <div className="grid gap-3 text-xs">
                                    <div className="flex justify-between">
                                      <span>Eficiência</span>
                                      <span className="text-[var(--text-primary)]">{automation.efficiency}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-[var(--surface-strong)]/60">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${automation.efficiency}%`,
                                          background: "linear-gradient(90deg, rgba(122,143,128,0.6), rgba(197,164,124,0.58))",
                                        }}
                                      />
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Horas economizadas</span>
                                      <span className="text-[var(--text-primary)]">{automation.savedHours}h</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-[var(--surface-strong)]/60">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${Math.min((automation.savedHours / 150) * 100, 100)}%`,
                                          background: "linear-gradient(90deg, rgba(135,148,164,0.58), rgba(197,164,124,0.55))",
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </section>

                      <section className="grid gap-8 2xl:grid-cols-[1.15fr_0.85fr]">
                        <motion.div
                          className="grid gap-5 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted sm:gap-6 sm:p-8"
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                          viewport={{ once: true, amount: 0.4 }}
                        >
                          <header className="flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-2">
                              <p className="text-[11px] uppercase tracking-[0.42em] text-[var(--accent-sky)]">Engajamento vivo</p>
                              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Ritmo operacional, comunidade e experiência</h3>
                            </div>
                            <button
                              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 px-4 py-2 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-emerald)]/45 hover:text-[var(--accent-emerald)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                              aria-label="Abrir pulse realtime"
                            >
                              <Activity className="h-3.5 w-3.5" /> Pulse realtime
                            </button>
                          </header>

                          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                            <div className="space-y-4">
                              {engagement.feed.map((event) => (
                                <div
                                  key={event.id}
                                  className="flex items-start gap-3 rounded-[24px] border border-[var(--border)]/80 bg-[var(--surface)]/75 p-4 transition duration-300 hover:border-[var(--accent-emerald)]/40"
                                >
                                  <span className="grid h-10 w-10 place-content-center rounded-xl bg-wash-sage text-[var(--accent-emerald)]">
                                    {event.icon}
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">{event.title}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">{event.description}</p>
                                    <p className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[var(--text-secondary)]">{event.timestamp}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="grid gap-5">
                              <div className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6">
                                <p className="text-[11px] uppercase tracking-[0.42em] text-[var(--accent-sky)]">Leaderboard</p>
                                <div className="mt-5 space-y-3">
                                  {engagement.leaderboard.map((entry) => (
                                    <div key={entry.rank} className="flex items-center gap-3 rounded-2xl border border-[var(--border)]/80 bg-[var(--surface)]/75 px-4 py-3 transition hover:border-[var(--accent-emerald)]/40">
                                      <span className="text-lg text-[var(--accent-emerald)]">#{entry.rank}</span>
                                      <div className="grid h-9 w-9 place-content-center rounded-full border border-[var(--border)]/60 bg-[var(--surface-strong)]/70 text-sm font-semibold text-[var(--accent-sky)]">
                                        {entry.avatar}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm text-[var(--text-primary)]">{entry.user}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">Score {entry.score}</p>
                                      </div>
                                      <span className={`text-xs font-medium ${entry.delta >= 0 ? "text-[var(--accent-emerald)]" : "text-[var(--accent-alert)]"}`}>
                                        {entry.delta >= 0 ? "+" : ""}
                                        {entry.delta}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6">
                                <p className="text-[11px] uppercase tracking-[0.42em] text-[var(--accent-fuchsia)]">Missões & tarefas</p>
                                <div className="mt-5 space-y-3">
                                  {engagement.tasks.map((task) => (
                                    <div key={task.id} className="rounded-2xl border border-[var(--border)]/80 bg-[var(--surface)]/75 p-4">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-[var(--text-primary)]">{task.title}</p>
                                        <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/80 px-3 py-1 text-xs text-[var(--text-secondary)]">
                                          {task.dueIn}
                                        </span>
                                      </div>
                                      <p className="mt-2 text-xs text-[var(--text-secondary)]">Owner: {task.owner}</p>
                                      <div className="mt-3 h-2 w-full rounded-full bg-[var(--surface-strong)]/55">
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${task.progress}%`,
                                            background: "linear-gradient(90deg, rgba(122,143,128,0.6), rgba(197,164,124,0.58))",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          className="grid gap-5 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted sm:gap-6 sm:p-8"
                          initial={{ opacity: 0, x: 40 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                          viewport={{ once: true, amount: 0.4 }}
                        >
                          <div className="space-y-2">
                            <p className="text-[11px] uppercase tracking-[0.42em] text-[var(--accent-sky)]">Comunidade & SLA</p>
                            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Inteligência coletiva + excelência operacional</h3>
                          </div>
                          <div className="space-y-4">
                            {engagement.community.map((post) => (
                              <div
                                key={post.id}
                                className="relative overflow-hidden rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6"
                              >
                                <div className="absolute inset-0 opacity-[0.28]" style={{ background: "var(--gradient-wash)" }} />
                                <div className="relative space-y-3">
                                  <p className="text-sm font-medium text-[var(--text-primary)]">{post.title}</p>
                                  <p className="text-xs text-[var(--text-secondary)]">por {post.author}</p>
                                  <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                                    <span>{post.likes} likes</span>
                                    <span>{post.comments} comentários</span>
                                    <span className="text-[var(--accent-emerald)]/85">+{post.trend}% adoção</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/70 p-6">
                            <p className="text-[11px] uppercase tracking-[0.42em] text-[var(--accent-sky)]">Status SLA Premium</p>
                            <div className="mt-5 grid gap-3">
                              {engagement.sla.map((record) => (
                                <div key={record.metric} className="flex items-center justify-between rounded-2xl border border-[var(--border)]/80 bg-[var(--surface)]/75 px-4 py-3">
                                  <div>
                                    <p className="text-sm text-[var(--text-primary)]">{record.metric}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">{record.target}</p>
                                  </div>
                                  <span
                                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                      record.status === "OK"
                                        ? "border-[var(--accent-emerald)]/40 bg-[var(--accent-emerald)]/12 text-[var(--accent-emerald)]"
                                        : record.status === "Alerta"
                                        ? "border-[var(--accent-amber)]/45 bg-[var(--accent-amber)]/14 text-[var(--accent-amber)]"
                                        : "border-[var(--accent-alert)]/45 bg-[var(--accent-alert)]/14 text-[var(--accent-alert)]"
                                    }`}
                                  >
                                    {record.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </section>
                    </div>
                  </section>
                ),
    })
  );

  registerRoute("leads", async () => ({ default: () => <Leads /> }));

  return (
    <div
      data-theme={theme}
      className="min-h-screen text-[var(--text-primary)] transition-colors"
      style={{ background: "var(--background)", backgroundAttachment: "fixed" }}
    >
      <div className="min-h-screen lg:grid lg:grid-cols-[320px_1fr]">
        <button
          className="fixed right-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-xl shadow-[color-mix(in_srgb,var(--accent-emerald)_25%,transparent)] backdrop-blur md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
          onClick={() => setMobileNavOpen((prev) => !prev)}
          aria-expanded={isMobileNavOpen}
          aria-controls="mobile-command-center"
          aria-label={isMobileNavOpen ? "Fechar navegação" : "Abrir navegação"}
        >
          {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              className="fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--background)_75%,transparent)] backdrop-blur-xl md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileNav}
            >
              <motion.div
                id="mobile-command-center"
                className="absolute left-0 top-0 flex h-full w-[min(88vw,360px)] flex-col border-r border-[var(--border-strong)] bg-[var(--surface)]/92 shadow-2xl"
                style={{
                  paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)",
                  paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)",
                }}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 32 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-content-center rounded-2xl bg-gradient-to-br from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-fuchsia)] text-slate-950 font-semibold">
                      A∞
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.38em] text-[var(--accent-emerald)]">ALSHAM</p>
                      <p className="text-base font-medium text-[var(--text-primary)]">360° PRIMA</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeMobileNav}
                    className="grid h-10 w-10 place-content-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                    aria-label="Fechar menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="h-[1px] w-full bg-[var(--border)]/60" />

                <div className="flex-1 overflow-y-auto px-6">
                  <div className="space-y-4 pt-4">
                    {sidebarGroups.map((group) => (
                      <div key={`mobile-${group.id}`} className="rounded-2xl border border-[var(--border)]/80 bg-[var(--surface)]/80 p-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-content-center rounded-xl bg-[var(--surface-strong)]/70 text-[var(--accent-emerald)]">
                            {group.icon}
                          </span>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{group.label}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {group.links.map((link) => {
                            const isActive = activePage === link.id;

                            return (
                              <button
                                key={link.id}
                                type="button"
                                onClick={() => {
                                  setActivePage(link.id);
                                  closeMobileNav();
                                }}
                                aria-current={isActive ? "page" : undefined}
                                className={`rounded-full border px-3 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                                  isActive
                                    ? "border-[var(--accent-emerald)]/60 bg-[var(--accent-emerald)]/15 text-[var(--accent-emerald)]"
                                    : "border-[var(--border)]/70 text-[var(--text-secondary)] hover:border-[var(--accent-emerald)]/60 hover:text-[var(--accent-emerald)]"
                                }`}
                              >
                                {link.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-5 rounded-2xl border border-[var(--border)]/80 bg-[var(--surface)]/85 p-4">
                    <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--accent-sky)]">Controles rápidos</p>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Moeda</p>
                        <div className="mt-2 flex gap-2">
                          {currencyOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setCurrency(option.value)}
                              aria-label={`Selecionar moeda ${option.label}`}
                              aria-pressed={currency === option.value}
                              className={`min-h-[44px] flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                                currency === option.value
                                  ? "border-[var(--accent-emerald)]/40 bg-[var(--accent-emerald)]/15 text-[var(--accent-emerald)]"
                                  : "border-[var(--border)] bg-[var(--surface-strong)]/60 text-[var(--text-secondary)]"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Timeframe</p>
                        <div className="mt-2 flex gap-2">
                          {timeframeOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setTimeframe(option.value)}
                              aria-label={`Selecionar período ${option.label}`}
                              aria-pressed={timeframe === option.value}
                              className={`min-h-[44px] flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                                timeframe === option.value
                                  ? "border-[var(--accent-sky)]/40 bg-[var(--accent-sky)]/15 text-[var(--accent-sky)]"
                                  : "border-[var(--border)] bg-[var(--surface-strong)]/60 text-[var(--text-secondary)]"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Tema</p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {themeOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => setTheme(option.key)}
                              aria-label={`Mudar para tema ${option.label}`}
                              aria-current={theme === option.key ? "true" : "false"}
                              className={`min-h-[48px] rounded-xl border px-3 py-2 text-left text-xs uppercase tracking-[0.2em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                                theme === option.key
                                  ? "border-[var(--accent-fuchsia)]/40 bg-[var(--accent-fuchsia)]/10 text-[var(--accent-fuchsia)]"
                                  : "border-[var(--border)] bg-[var(--surface-strong)]/55 text-[var(--text-secondary)]"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-4 w-4 rounded-full"
                                  style={{ background: themeSwatches[option.key], boxShadow: "0 0 10px rgba(135, 148, 164, 0.28)" }}
                                />
                                {option.label}
                              </span>
                              <span className="mt-1 block text-[10px] capitalize text-[var(--text-secondary)]/80">{option.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <aside className="hidden min-h-screen lg:flex lg:w-80 xl:w-[22rem] flex-col border-r border-[var(--border)] bg-[var(--surface-strong)]/80 backdrop-blur-xl">
          <div 
            onClick={() => setActivePage('dashboard')}
            className="sticky top-0 flex items-center gap-3 bg-[var(--surface-strong)]/90 px-6 py-6 backdrop-blur cursor-pointer hover:bg-[var(--surface)]/95 transition-colors group"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setActivePage('dashboard')}
            aria-label="Voltar ao Dashboard"
          >
            <div className="grid h-10 w-10 place-content-center rounded-2xl bg-gradient-to-br from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-fuchsia)] text-slate-950 font-semibold group-hover:scale-105 transition-transform">
              A∞
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-emerald)] group-hover:text-[var(--accent-sky)] transition-colors">ALSHAM</p>
              <p className="text-lg font-medium group-hover:text-[var(--accent-emerald)] transition-colors">360° PRIMA</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 pb-6">
            <div className="space-y-5">
              {sidebarGroups.map((group) => (
                <div key={group.id} className="space-y-3">
                  <button
                    className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-emerald)] hover:bg-[var(--accent-emerald)]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                    aria-label={`Abrir categoria ${group.label}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-content-center rounded-full bg-[var(--surface)] text-[var(--accent-emerald)]">
                        {group.icon}
                      </span>
                      {group.label}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                  </button>
                  <ul className="ml-4 space-y-2 border-l border-[var(--border)] pl-4 text-sm">
                    {group.links.map((link) => {
                      const isActive = activePage === link.id;

                      return (
                        <li key={link.id} className="flex items-center gap-2">
                          <span
                            className={`h-[1px] w-2 transition ${
                              isActive
                                ? "bg-[var(--accent-emerald)]"
                                : "bg-[var(--accent-emerald)]/60"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setActivePage(link.id)}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex-1 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                              isActive
                                ? "text-[var(--accent-emerald)]"
                                : "text-[var(--text-secondary)] hover:text-[var(--accent-emerald)]"
                            }`}
                          >
                            {link.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          <div className="border-t border-[var(--border)] px-6 py-6">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="grid h-10 w-10 place-content-center rounded-full bg-[var(--accent-emerald)]/15 text-[var(--accent-emerald)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Copilot 360°</p>
                <p className="text-xs text-[var(--text-secondary)]">Integração profunda com IA generativa e preditiva.</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex flex-col">
          <header
            className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface-strong)]/70 backdrop-blur-xl"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="flex flex-wrap items-center gap-4 px-6 py-4 sm:py-5">
              <button
                type="button"
                className="grid h-10 w-10 place-content-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                onClick={() => setMobileNavOpen((prev) => !prev)}
                aria-expanded={isMobileNavOpen}
                aria-controls="mobile-command-center"
                aria-label={isMobileNavOpen ? "Fechar navegação" : "Abrir navegação"}
              >
                {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] py-3 pl-12 pr-16 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-emerald)] focus:outline-none focus:ring-0"
                  placeholder="Pesquisar qualquer interação, deal, automação ou insight"
                />
                <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  <Command className="h-3.5 w-3.5" /> K
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  <Globe2 className="h-4 w-4 text-[var(--accent-emerald)]" />
                  <button
                    onClick={() => setCurrency("BRL")}
                    aria-label="Selecionar moeda Real Brasileiro"
                    aria-pressed={currency === "BRL"}
                    className={`${
                      currency === "BRL"
                        ? "text-[var(--accent-emerald)]"
                        : "text-[var(--text-secondary)]"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]`}
                  >
                    BRL
                  </button>
                  <button
                    onClick={() => setCurrency("USD")}
                    aria-label="Selecionar moeda Dólar Americano"
                    aria-pressed={currency === "USD"}
                    className={`${
                      currency === "USD"
                        ? "text-[var(--accent-sky)]"
                        : "text-[var(--text-secondary)]"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setCurrency("EUR")}
                    aria-label="Selecionar moeda Euro"
                    aria-pressed={currency === "EUR"}
                    className={`${
                      currency === "EUR"
                        ? "text-[var(--accent-fuchsia)]"
                        : "text-[var(--text-secondary)]"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]`}
                  >
                    EUR
                  </button>
                  <span className="mx-1 h-4 w-[1px] bg-[var(--surface-strong)]" />
                  <button
                    onClick={() => setTimeframe("7d")}
                    aria-label="Selecionar período de 7 dias"
                    aria-pressed={timeframe === "7d"}
                    className={`${
                      timeframe === "7d"
                        ? "text-[var(--accent-emerald)]"
                        : "text-[var(--text-secondary)]"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]`}
                  >
                    7D
                  </button>
                  <button
                    onClick={() => setTimeframe("30d")}
                    aria-label="Selecionar período de 30 dias"
                    aria-pressed={timeframe === "30d"}
                    className={`${
                      timeframe === "30d"
                        ? "text-[var(--accent-sky)]"
                        : "text-[var(--text-secondary)]"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]`}
                  >
                    30D
                  </button>
                  <button
                    onClick={() => setTimeframe("90d")}
                    aria-label="Selecionar período de 90 dias"
                    aria-pressed={timeframe === "90d"}
                    className={`${
                      timeframe === "90d"
                        ? "text-[var(--accent-fuchsia)]"
                        : "text-[var(--text-secondary)]"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]`}
                  >
                    90D
                  </button>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                  <Palette className="h-4 w-4 text-[var(--accent-sky)]" />
                  <div className="flex items-center gap-2">
                    {themeOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => setTheme(option.key)}
                        aria-label={`Mudar para tema ${option.label}`}
                        aria-current={theme === option.key ? "true" : "false"}
                        className={`flex items-center gap-2 rounded-xl border px-2 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                          theme === option.key
                            ? "border-[var(--accent-emerald)] bg-[var(--surface-strong)] text-[var(--text-primary)]"
                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-sky)]"
                        }`}
                        title={`${option.label} • ${option.description}`}
                      >
                        <span
                          className="h-4 w-4 rounded-full"
                          style={{ background: themeSwatches[option.key], boxShadow: "0 0 10px rgba(135, 148, 164, 0.28)" }}
                        />
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="grid h-11 w-11 place-content-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:text-[var(--accent-emerald)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                  aria-label="Abrir notificações"
                >
                  <Bell className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2">
                  <div className="grid h-9 w-9 place-content-center rounded-full bg-gradient-to-br from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-fuchsia)] text-sm font-semibold text-slate-950">
                    VP
                  </div>
                  <div className="hidden text-sm leading-tight lg:block">
                    <p className="font-medium">Victor Prado</p>
                    <p className="text-xs text-[var(--accent-emerald)]">Chief Growth Architect</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
              </div>
            </div>
          </header>

          <main
            className="flex-1 overflow-y-auto bg-[var(--background)]"
            style={{ backgroundImage: "var(--gradient-veiled)", backgroundAttachment: "fixed" }}
          >
            {renderPage(activePage)}
          </main>
        </div>
      </div>
    </div>
  );
}

function CampaignSpotlight({
  campaigns,
  activeIndex,
  onSelect,
}: {
  campaigns: Campaign[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const activeCampaign = campaigns[activeIndex];
  const isSingle = campaigns.length <= 1;

  if (!activeCampaign) {
    return null;
  }

  const renderMedia = (campaign: Campaign) => {
    switch (campaign.mediaType) {
      case "video":
        return (
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-black/40">
            <video
              key={campaign.id}
              src={campaign.mediaSrc}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              controls
            >
              <track kind="captions" label="Sem legendas" />
            </video>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/45 via-transparent to-black/10" />
          </div>
        );
      case "iframe":
        return (
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-black/50">
            <iframe
              key={campaign.id}
              src={campaign.mediaSrc}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video h-full w-full"
            />
          </div>
        );
      default:
        return (
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <img
              src={campaign.mediaSrc}
              alt={campaign.name}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-black/5" />
          </div>
        );
    }
  };

  return (
    <motion.section
      className="relative overflow-hidden rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted sm:p-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.45 }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.28]" style={{ background: "var(--gradient-wash)" }} />
      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.32em] ${badgePalette[activeCampaign.badgeTone]}`}>
              {activeCampaign.badge}
            </span>
            <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/80 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)]">
              {activeCampaign.name}
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
              {activeCampaign.headline}
            </h2>
            <p className="text-base text-[var(--text-secondary)] sm:text-lg">{activeCampaign.subheadline}</p>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
              {activeCampaign.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeCampaign.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-[var(--border)]/80 bg-[var(--surface)]/75 px-4 py-3"
              >
                <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--text-secondary)]">
                  {metric.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={activeCampaign.ctaHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-emerald)]/45 bg-[var(--surface-strong)]/70 px-5 py-2 text-sm font-medium text-[var(--accent-emerald)] transition hover:border-[var(--accent-emerald)]/60 hover:text-[var(--accent-emerald)]"
            >
              {activeCampaign.mediaType === "video" ? <MonitorPlay className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              {activeCampaign.ctaLabel}
            </a>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              {campaigns.map((campaign, index) => (
                <button
                  key={campaign.id}
                  onClick={() => onSelect(index)}
                  className={`h-1.5 w-10 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                    index === activeIndex ? "bg-[var(--accent-emerald)]" : "bg-[var(--border)] hover:bg-[var(--accent-emerald)]/40"
                  }`}
                  aria-label={`Selecionar campanha ${campaign.name}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-[260px] space-y-4">
          {renderMedia(activeCampaign)}
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border)]/80 bg-[var(--surface)]/75 px-4 py-3 text-sm text-[var(--text-secondary)]">
            <span>
              {activeIndex + 1}/{campaigns.length} • {activeCampaign.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                className={`grid h-9 w-9 place-content-center rounded-full border border-[var(--border)]/80 bg-[var(--surface-strong)]/70 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                  isSingle ? "cursor-not-allowed opacity-40" : "hover:border-[var(--accent-emerald)]/45"
                }`}
                onClick={() => !isSingle && onSelect((activeIndex - 1 + campaigns.length) % campaigns.length)}
                aria-label="Campanha anterior"
                disabled={isSingle}
              >
                ‹
              </button>
              <button
                className={`grid h-9 w-9 place-content-center rounded-full border border-[var(--border)]/80 bg-[var(--surface-strong)]/70 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                  isSingle ? "cursor-not-allowed opacity-40" : "hover:border-[var(--accent-emerald)]/45"
                }`}
                onClick={() => !isSingle && onSelect((activeIndex + 1) % campaigns.length)}
                aria-label="Próxima campanha"
                disabled={isSingle}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Sparkline({ series, highlight }: { series: number[]; highlight?: boolean }) {
  const max = Math.max(...series);
  const normalized = series.map((value) => value / max);

  return (
    <div className="flex h-full items-end gap-1.5">
      {normalized.map((value, index) => (
        <div
          key={index}
          className="flex-1 rounded-lg"
          style={{
            height: `${Math.max(value * 100, 12)}%`,
            opacity: highlight ? 1 : 0.7,
            background: "linear-gradient(180deg, rgba(122,143,128,0.72) 0%, rgba(197,164,124,0.45) 100%)",
          }}
        />
      ))}
    </div>
  );
}

function LoadingSkeletonLayout({ theme }: { theme: ThemeKey }) {
  return (
    <div
      data-theme={theme}
      className="min-h-screen text-[var(--text-primary)]"
      style={{ background: "var(--background)", backgroundAttachment: "fixed" }}
    >
      <div className="min-h-screen lg:grid lg:grid-cols-[320px_1fr]">
        <aside className="hidden min-h-screen flex-col border-r border-[var(--border)] bg-[var(--surface-strong)]/80 backdrop-blur-xl lg:flex lg:w-80 xl:w-[22rem]">
          <div className="sticky top-0 space-y-6 bg-[var(--surface-strong)]/90 px-6 py-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="skeleton-shimmer h-10 w-10 rounded-2xl" />
              <div className="space-y-2">
                <div className="skeleton-shimmer h-3 w-24 rounded-full" />
                <div className="skeleton-shimmer h-4 w-36 rounded-full" />
              </div>
            </div>
            <div className="skeleton-shimmer h-10 w-full rounded-2xl" />
          </div>
          <div className="flex-1 space-y-4 px-4 pb-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="skeleton-shimmer h-12 w-full rounded-xl" />
                <div className="space-y-2 border-l border-[var(--border)] pl-4">
                  {Array.from({ length: 4 }).map((_, linkIndex) => (
                    <div key={linkIndex} className="skeleton-shimmer h-3 w-[70%] rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border)] px-6 py-6">
            <div className="skeleton-shimmer h-16 w-full rounded-2xl" />
          </div>
        </aside>

        <div className="flex flex-col">
          <header
            className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface-strong)]/70 backdrop-blur-xl"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="flex flex-wrap items-center gap-4 px-6 py-4 sm:py-5">
              <div className="skeleton-shimmer h-10 w-10 rounded-2xl lg:hidden" />
              <div className="skeleton-shimmer h-12 flex-1 rounded-2xl" />
              <div className="flex flex-wrap items-center gap-3">
                <div className="skeleton-shimmer h-11 w-48 rounded-2xl" />
                <div className="skeleton-shimmer h-11 w-48 rounded-2xl" />
                <div className="skeleton-shimmer h-11 w-11 rounded-2xl" />
                <div className="skeleton-shimmer h-11 w-36 rounded-2xl" />
              </div>
            </div>
          </header>

          <main
            className="flex-1 overflow-y-auto bg-[var(--background)]"
            style={{ backgroundImage: "var(--gradient-veiled)", backgroundAttachment: "fixed" }}
          >
            <section
              className="px-4 pb-14 pt-10 sm:px-6 md:pb-16 md:pt-12 lg:px-10"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 3.5rem)" }}
            >
              <div className="flex flex-col gap-6">
                <motion.section
                  className="relative overflow-hidden rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/90 p-6 shadow-lifted sm:p-8 lg:p-10"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 opacity-70" style={{ background: "var(--gradient-wash)" }} />
                  <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-12">
                    <div className="flex flex-col gap-6">
                      <div className="space-y-4">
                        <div className="skeleton-shimmer h-8 w-40 rounded-full" />
                        <div className="skeleton-shimmer h-14 w-[90%] rounded-3xl" />
                        <div className="skeleton-shimmer h-4 w-[70%] rounded-full" />
                        <div className="skeleton-shimmer h-4 w-[60%] rounded-full" />
                        <div className="skeleton-shimmer h-4 w-[80%] rounded-full" />
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="skeleton-shimmer h-9 w-40 rounded-full" />
                        ))}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {Array.from({ length: 2 }).map((_, index) => (
                          <div key={index} className="skeleton-shimmer h-28 rounded-3xl" />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-strong)]/75 p-6">
                      <div className="skeleton-shimmer h-3 w-40 rounded-full" />
                      <div className="skeleton-shimmer h-28 rounded-3xl" />
                      <div className="grid gap-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="skeleton-shimmer h-4 w-full rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>

                <section>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="space-y-2">
                      <div className="skeleton-shimmer h-3 w-52 rounded-full" />
                      <div className="skeleton-shimmer h-5 w-72 rounded-full" />
                    </div>
                    <div className="skeleton-shimmer h-3 w-32 rounded-full" />
                  </div>
                  <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="skeleton-shimmer h-72 rounded-[28px]" />
                    ))}
                  </div>
                </section>

                <section className="grid gap-8 xl:grid-cols-[1.45fr_0.85fr]">
                  <div className="space-y-5 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted sm:p-8">
                    <div className="space-y-2">
                      <div className="skeleton-shimmer h-3 w-40 rounded-full" />
                      <div className="skeleton-shimmer h-5 w-64 rounded-full" />
                      <div className="skeleton-shimmer h-4 w-72 rounded-full" />
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-72 rounded-[28px]" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-5 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted">
                    <div className="skeleton-shimmer h-4 w-48 rounded-full" />
                    <div className="skeleton-shimmer h-64 rounded-[28px]" />
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-3 w-full rounded-full" />
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                  <div className="space-y-5 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted">
                    <div className="skeleton-shimmer h-4 w-44 rounded-full" />
                    <div className="grid gap-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-16 rounded-2xl" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-5 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted">
                    <div className="skeleton-shimmer h-4 w-56 rounded-full" />
                    <div className="skeleton-shimmer h-56 rounded-2xl" />
                  </div>
                </section>

                <section className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.7fr)]">
                  <div className="space-y-4 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted">
                    <div className="skeleton-shimmer h-4 w-48 rounded-full" />
                    <div className="space-y-3 border-l border-[var(--border)] pl-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-14 rounded-2xl" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted">
                    <div className="skeleton-shimmer h-4 w-40 rounded-full" />
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-20 rounded-2xl" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted">
                    <div className="skeleton-shimmer h-4 w-32 rounded-full" />
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-16 rounded-2xl" />
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                  <div className="space-y-4 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted">
                    <div className="skeleton-shimmer h-4 w-52 rounded-full" />
                    <div className="skeleton-shimmer h-64 rounded-2xl" />
                  </div>
                  <div className="space-y-4 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface)]/88 p-6 shadow-lifted">
                    <div className="skeleton-shimmer h-4 w-48 rounded-full" />
                    <div className="grid gap-3">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-14 rounded-2xl" />
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
