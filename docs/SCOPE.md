# SCOPE.md — Inventário para Construção (real vs. a construir)

> Última atualização: 2026-07-11. **Direção: CONSTRUIR** as páginas que faltam como
> páginas reais de CRM (não esconder/cortar). Este documento é o mapa para
> paralelizar o trabalho. Padrão de implementação: `docs/PAGE-PATTERN.md`.
> SSOT de navegação: `src/config/sidebarStructure.tsx`. SSOT de rotas: `src/routes/index.tsx`.
> SSOT de schema: `src/lib/supabase/types.ts`.

## Estado atual

| | Contagem |
|---|---|
| Páginas reais registradas (rota + dados) | **65** (19 originais + 10 do LOTE 1 + 12 do LOTE 2 + 12 do LOTE 3 + 12 do LOTE 4) |
| Itens de menu ainda `placeholder` (a construir) | ~58 |
| Arquivos `createSupremePage` (4 linhas, **não conectados** ao router) | 68 |
| Migration SQL do schema core | `supabase/migrations/0001_core_schema.sql` |

## Tabelas que JÁ existem no schema (`types.ts`)

`organizations`, `user_organizations`, `user_profiles`, `user_roles`, `accounts`,
`contacts`, `leads_crm`, `opportunities`, `campaigns`, `notifications`,
`ai_predictions`, `gamification_points`, `gamification_badges`,
`gamification_rank_history`, `gamification_rewards`, `automations`, `nft_gallery`,
`audit_log`, `security_audit_log`.

> Páginas cujo dado mapeia para uma dessas tabelas são as de **menor risco** e
> devem ser priorizadas. Para as demais, será preciso criar a tabela (migration) e
> declarar o tipo em `types.ts` antes/junto da página.

## LOTE 1 — concluído neste trabalho (10 páginas reais)

| Rota (id sidebar) | Página | Tabela (filtrada por `org_id`) |
|---|---|---|
| `contatos-lista` | `ContactsList.tsx` | `contacts` |
| `contas-empresas-lista` | `AccountsList.tsx` | `accounts` |
| `oportunidades-lista` | `OpportunitiesList.tsx` | `opportunities` |
| `campanhas-lista` | `CampaignsList.tsx` | `campaigns` |
| `notificacoes` | `NotificationsCenter.tsx` | `notifications` |
| `leaderboards` | `Leaderboards.tsx` | `gamification_points` (agregado) |
| `badges-e-conquistas` | `BadgesCatalog.tsx` | `gamification_badges` |
| `usuarios-lista` | `UsersList.tsx` | `user_profiles` |
| `funcoes-e-permissoes` | `RolesPermissions.tsx` | `user_roles` |
| `ai-insights` | `AIInsights.tsx` | `ai_predictions` |

## LOTE 2 — concluído neste trabalho (12 páginas reais)

| Rota (id sidebar) | Página | Tabela (filtrada por `org_id`) |
|---|---|---|
| `oportunidades-kanban` | `OpportunitiesKanban.tsx` | `opportunities` (agrupado por `stage`) |
| `campanhas-criar-editar` | `CampaignForm.tsx` | `campaigns` (form insert/update) |
| `contatos-detalhes` | `ContactDetails.tsx` | `contacts` + `opportunities`/`ai_predictions` |
| `contas-detalhes` | `AccountDetails.tsx` | `accounts` + `contacts` (account_id) |
| `leads-importacao` | `LeadsImport.tsx` | `leads_crm` (CSV parse + insert) |
| `logs-de-auditoria` | `AuditLogs.tsx` | `audit_log` |
| `seguranca-avancada` | `SecurityAudit.tsx` | `security_audit_log` |
| `rewards-store` | `RewardsStore.tsx` | `gamification_rewards` |
| `pontuacao-e-niveis` | `PointsAndLevels.tsx` | `gamification_points` + `gamification_rank_history` |
| `workflows-lista` | `WorkflowsList.tsx` | `automations` |
| `sequences-de-vendas` | `SalesSequences.tsx` | `automations` (trigger_type=sequence) |
| `analytics-dashboard` | `AnalyticsDashboard.tsx` | `leads_crm`/`opportunities`/`campaigns` (agregação + recharts) |

## LOTE 3 — concluído neste trabalho (12 páginas reais)

Todas usam tabelas já existentes (nenhuma migration nova foi necessária).

| Rota (id sidebar) | Página | Tabela(s) (filtradas por `org_id`) |
|---|---|---|
| `relatorios-personalizados` | `CustomReports.tsx` | `leads_crm`/`opportunities`/`campaigns`/`accounts`/`contacts` (cortes por dimensão) |
| `forecasting-de-vendas` | `SalesForecasting.tsx` | `opportunities` (valor × probabilidade por mês de fechamento) |
| `analise-de-roi` | `RoiAnalysis.tsx` | `campaigns` + `opportunities` (receita ganha por `campaign_id`) |
| `atribuicao-de-marketing` | `MarketingAttribution.tsx` | `leads_crm` (por `source`/`campaign_id`) + `opportunities` + `campaigns` |
| `cohort-analysis` | `CohortAnalysis.tsx` | `leads_crm` (coortes por mês de `created_at` + conversão) |
| `executive-reports` | `ExecutiveReports.tsx` | `leads_crm`/`opportunities`/`campaigns`/`accounts` (snapshot executivo) |
| `analytics-de-gamificacao` | `GamificationAnalytics.tsx` | `gamification_points`/`gamification_badges`/`gamification_rewards` |
| `equipes-lista` | `TeamsList.tsx` | `user_profiles` (agrupado por `role`) |
| `calendario` | `CalendarView.tsx` | `opportunities` (`expected_close_date`) + `contacts` (`next_followup`) |
| `atividades-tarefas` | `ActivitiesTasks.tsx` | `contacts` (`next_followup`/`last_contact`) |
| `privacidade-de-dados` | `DataPrivacy.tsx` | `leads_crm` (`consent`/`consent_at`/`canal_captura`) |
| `data-export-import` | `DataExportImport.tsx` | `leads_crm`/`contacts`/`opportunities`/`accounts` (export CSV) |

## LOTE 4 — concluído neste trabalho (12 páginas reais)

Sete páginas usam tabelas já existentes; cinco usam três novas tabelas mínimas
(`support_tickets`, `kb_articles`, `goals`) criadas na migration
`supabase/migrations/0002_lote4_schema.sql` (org_id + RLS por `is_org_member`, tipos em `types.ts`).

| Rota (id sidebar) | Página | Tabela(s) (filtradas por `org_id`) |
|---|---|---|
| `tickets-lista` | `TicketsList.tsx` | `support_tickets` (nova) |
| `tickets-detalhes` | `TicketDetails.tsx` | `support_tickets` (nova, por id) |
| `base-de-conhecimento` | `KnowledgeBaseList.tsx` | `kb_articles` (nova) |
| `metas-e-desafios` | `GoalsChallenges.tsx` | `goals` (nova, `category` individual/challenge) |
| `metas-de-equipe` | `TeamGoals.tsx` | `goals` (nova, `category` team) |
| `comissoes` | `Commissions.tsx` | `opportunities` (ganhas) + `user_profiles` (comissão por owner) |
| `email-marketing-dashboard` | `EmailMarketingDashboard.tsx` | `campaigns` (type email) |
| `redes-sociais-dashboard` | `SocialMediaDashboard.tsx` | `campaigns` (type social) |
| `automacao-de-marketing` | `MarketingAutomation.tsx` | `automations` (trigger de marketing) |
| `performance-reviews` | `PerformanceOverview.tsx` | `gamification_points` + `opportunities` + `user_profiles` |
| `system-status` | `SystemStatus.tsx` | contagens multi-tabela (saúde de dados por módulo) |
| `configuracoes-gerais` | `GeneralSettings.tsx` | `organizations` (por id) + `user_profiles` |

## LOTE 2 sugerido (restante, baixo risco — tabela já existe)

| Rota (id sidebar) | Label | Fonte de dados proposta (`org_id`) | Observação |
|---|---|---|---|
| `oportunidades-kanban` | Oportunidades (Kanban) | `opportunities` agrupado por `stage` | reusa dados de Oportunidades |
| `campanhas-criar-editar` | Criar/Editar Campanha | `campaigns` (form insert/update) | precisa de mutation |
| `contatos-detalhes` | Detalhes do Contato | `contacts` por id + `opportunities`/`ai_predictions` do lead | rota com param |
| `contas-detalhes` | Detalhes da Conta | `accounts` por id + `contacts` (account_id) | rota com param |
| `leads-importacao` | Importação de Leads | insert em `leads_crm` (CSV) | mutation/upload |
| `logs-de-auditoria` | Logs de Auditoria | `audit_log` | somente leitura |
| `seguranca-avancada` | Segurança Avançada | `security_audit_log` | somente leitura |
| `rewards-store` | Rewards Store | `gamification_rewards` | catálogo |
| `pontuacao-e-niveis` | Pontuação e Níveis | `gamification_points` + `gamification_rank_history` | agregação |
| `workflows-lista` | Lista de Workflows | `automations` | somente leitura |
| `sequences-de-vendas` | Sequences de Vendas | `automations` (type=sequence) | filtro |
| `analytics-dashboard` | Analytics Dashboard | contagens de `leads_crm`/`opportunities`/`campaigns` | agregação multi-tabela |
| `relatorios-personalizados` | Relatórios Personalizados | contagens multi-tabela | agregação |
| `forecasting-de-vendas` | Forecasting de Vendas | `opportunities` (value × probability por período) | agregação |

## LOTE 3+ — precisam de tabela nova (migration + types.ts antes)

Estas são itens de menu `placeholder` cujo dado **ainda não tem tabela** no schema.
Cada uma exige: (1) migration criando a tabela com `org_id` + RLS, (2) tipo em
`types.ts`, (3) página no padrão. Agrupadas por área:

- **Suporte**: `tickets-lista`, `tickets-detalhes`, `chat-ao-vivo`, `base-de-conhecimento`, `feedback-de-clientes`, `portal-do-cliente`, `slas-e-metricas`, `integracoes-de-suporte` → tabelas `tickets`, `ticket_messages`, `kb_articles`, `slas`.
- **Vendas/Comercial**: `cotacoes`, `propostas-comerciais`, `atividades-tarefas`, `calendario` → `quotes`, `proposals`, `tasks`, `calendar_events`.
- **Marketing**: `email-marketing-*`, `landing-pages-lista`, `formularios-*`, `redes-sociais-*`, `automacao-de-marketing` → `email_campaigns`, `email_templates`, `landing_pages`, `forms`, `form_submissions`, `social_posts`.
- **Analytics**: `analise-de-roi`, `cohort-analysis`, `atribuicao-de-marketing`, `heatmaps-e-sessoes`, `a-b-testing`, `executive-reports`, `data-export-import`.
- **Gamificação**: `metas-e-desafios`, `competitions`, `feedback-gamificado`, `analytics-de-gamificacao`.
- **Omnichannel**: `email-inbox`, `chamadas-e-voip`, `reunioes-virtuais`, `sms-marketing`, `whatsapp-business`, `chatbots-config`, `voice-analytics`, `social-listening`, `push-notifications`, `api-de-comunicacao`, `omnichannel-analytics`.
- **Equipes**: `equipes-lista`, `territorios-e-cotas`, `comissoes`, `metas-de-equipe`, `treinamentos`, `performance-reviews`.
- **Integrações**: `marketplace-de-apps`, `api-console`, `webhooks`, `integracao-*`, `pagamentos-integrados`, `e-commerce-integrations`, `bi-tools-integration`, `custom-integrations`.
- **Admin**: `configuracoes-gerais`, `email-config`, `cobranca-e-planos`, `branding-personalizado`, `campos-customizados`, `privacidade-de-dados`, `backups-e-restore`, `onboarding-wizard`, `migracao-de-dados`, `api-keys-management`, `mobile-app-config`, `system-status`.
- **Comunidade**: `centro-de-ajuda`, `novidades`, `recursos-e-templates`, `comunidade`, `historias-de-sucesso`.

## Os 68 arquivos `createSupremePage` (código morto a substituir)

Estes arquivos em `src/pages/*.tsx` têm 4 linhas (`createSupremePage(supremeConfigs[...])`),
**não são importados por nenhuma rota** e consultam tabelas especulativas **sem `org_id`**
(via `SupremePageFactory.tsx`). Ao construir a página real correspondente, **substitua** o
conteúdo do arquivo pelo padrão de `docs/PAGE-PATTERN.md` (ou crie um arquivo novo e apague o stub).

```
AssetManagement, AuditTrail, BackupStatus, Badges, BehavioralTracking, Benefits,
BoardView, BudgetPlanning, CapTable, CashFlow, Certification, Changelog,
ChurnPrediction, CompetitorTracking, ContractManagement, CultureDashboard, DEI,
DataLake, DealIntelligence, DeveloperPortal, DisasterRecovery, EmployeeEngagement,
EngineeringLeaderboard, EquityManagement, ExpenseReports, Feedback360, Goals,
HRDashboard, ITInventory, IncidentResponse, InvestorPortal, MarketIntelligence,
MarketingLeaderboard, OKRs, Offboarding, Onboarding, OnboardingFlow, Payroll,
PerformanceMetrics, PerformanceReviews, PointsHistory, PredictiveModels, Procurement,
PulseSurveys, Recognition, Recruitment, RelationshipMap, RevenueForecast, RewardsStore,
RiskManagement, SalesLeaderboard, SalesPlaybook, SentimentAnalysis, ShareholderReports,
SoftwareLicenses, StockOptions, SupportLeaderboard, SystemHealth, TaxCompliance,
TeamPerformance, TimeTracking, TrainingCenter, TravelManagement, Treasury, UptimeMonitor,
VendorManagement, VoiceCommands, WorkflowEngine
```

> ⚠️ `SupremePageFactory.tsx` viola a REGRA 3 do CLAUDE.md (query sem `org_id`).
> Não conecte nenhum desses stubs ao router como estão — reescreva no padrão real.
