# AUDITORIA FORENSE ALSHAM — ALSHAM 360° PRIMA

**Data:** 11 de Março de 2026  
**Auditor:** Claude Code — Protocolo Forense ALSHAM v1.0  
**Repositório:** https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA.git  
**Branch auditada:** `main` (commit `1d6f7c1`)

---

## 1. IDENTIDADE DO PROJETO

| Campo | Valor |
|-------|-------|
| Nome | ALSHAM 360° PRIMA |
| Descrição | CRM Enterprise com 150+ módulos, visual cyberpunk, 6 temas dinâmicos, arquitetura multi-tenant |
| Stack principal | React + TypeScript + Vite + Tailwind CSS + Supabase |
| Framework | React 18.3.1 (SPA) |
| Linguagem | TypeScript 5.8.3 |
| Build tool | Vite 7.0.0 |
| Deploy | Vercel (https://app.alshamglobal.com.br) |
| Total de arquivos | 370 (excl. node_modules/.git) |
| Total de pastas | 44 |
| Total de linhas de código | **53.978** linhas (ts/tsx/js/jsx/css) |
| Páginas | 145 arquivos em `src/pages/` |
| Componentes shadcn/ui | 23 componentes |

---

## 2. COMPARATIVO COM PADRÃO ALSHAM (6 LEIS)

### LEI 1: ZERO CORES HARDCODED

- **Status:** ❌ NÃO CONFORME
- **Ocorrências de hex hardcoded em style/atributos:** ~100 (em 5 arquivos críticos)
- **Ocorrências de classes Tailwind hardcoded de cor:** ~470+

| Tipo | Ocorrências | Arquivos afetados |
|------|-------------|-------------------|
| `bg-white` / `bg-black` | ~40 | ~20 |
| `bg-gray-*` / `text-gray-*` / `border-gray-*` | ~130 | ~25 |
| `text-emerald-*` / `bg-emerald-*` | ~55 | ~20 |
| `text-red-*` / `bg-red-*` | ~43 | ~15 |
| `text-green-*` / `bg-green-*` | ~24 | ~8 |
| `text-yellow-*` / `bg-yellow-*` | ~20 | ~7 |
| `text-blue-*` / `bg-blue-*` | ~16 | ~10 |
| `text-purple-*` / `bg-purple-*` | ~13 | ~7 |
| `bg-slate-*` / `text-slate-*` | ~7 | 1 |
| `neutral-*` / `teal-*` / `orange-*` / `pink-*` / `cyan-*` | ~120 | ~25 |
| Hex hardcoded (`#xxxxxx` em style) | ~100 | 5 |

- **SSOT de cores:** `src/lib/themes.ts` → `src/lib/theme-variables.ts` → `src/styles/themes.css`
- **Detalhes:** Aproximadamente 47 páginas (as migradas para shadcn/ui) seguem o padrão de CSS variables. As ~97 páginas restantes possuem cores hardcoded em volume significativo. Os piores ofensores são: `ESG.tsx`, `Compliance.tsx`, `Sustainability.tsx`, `VirtualOffice.tsx`, `Investors.tsx`, `CarbonFootprint.tsx`, `Leaderboard.tsx`, `Metaverse.tsx`, `AIAssistant.tsx`, `APIStatus.tsx`, `Achievements.tsx`, `WarArena.tsx`.

---

### LEI 2: COMPONENTES UI PADRONIZADOS (shadcn/ui)

- **Status:** ⚠️ PARCIAL
- **Biblioteca de componentes:** shadcn/ui (23 componentes em `src/components/ui/`)
- **Componentes modificados diretamente:** Não (correto, shadcn mantido íntegro)
- **Pasta ui/ separada:** Sim (`src/components/ui/`)
- **Páginas usando shadcn/ui:** 47 de 145 (**32%**)
- **Páginas SEM shadcn/ui:** 97 (**67%**)

**Componentes shadcn disponíveis (23):**
alert, avatar, badge, button, card, checkbox, dialog, dropdown-menu, form, input, label, progress, radio-group, select, separator, skeleton, slider, switch, table, tabs, textarea, toast, toaster

**Detalhes:** A migração para shadcn/ui está em ~32% (47 de 145 páginas). As páginas migradas seguem o padrão corretamente. As 97 restantes usam componentes customizados com `<div>` e classes Tailwind diretas. A meta documentada era 43% (27/63), o que indica que o denominador mudou conforme novas páginas foram adicionadas.

---

### LEI 3: DADOS 100% REAIS

- **Status:** ⚠️ PARCIAL
- **Ocorrências de mock/fake/placeholder (dados):** 9
- **Fonte de dados principal:** Supabase (Postgres + Auth + Realtime)
- **Cliente de dados único (SSOT):** Sim — `src/lib/supabase/client.ts`

| Violação | Arquivo | Detalhe |
|----------|---------|---------|
| Mock hook | `src/hooks/useAnalytics.ts` | "Hook mockado para rastrear eventos" |
| Mock toggle | `src/pages/APIStatus.tsx` | Toast "Fonte: Mock" |
| Mock simulação | `src/pages/Financeiro.tsx` | `cashReserve = totalIncome * 10; // Mock` |
| Mock fallback | `src/lib/supabase-full.js` | "Mock implementations" |
| Mock citado | `src/services/leads.service.ts` | "Mock - em produção, buscar do Supabase" |
| Placeholder visual | `src/components/visualizations/NeuralGraph.tsx` | "Placeholder visual" |
| Placeholder page | `src/pages/realms/TheThrone.tsx` | "substituir este placeholder" |
| Placeholder debug | `src/components/dev/ReplayDebugger.tsx` | "Placeholder: aqui você pode..." |
| Placeholder data | `src/pages/Metaverse.tsx` | `Array.from({ length: 8 }).map(...)` |
| TODO | `src/pages/Automations.tsx` | "TODO: Load automations data" |
| TODO | `src/config/routes.ts` | "TODO: Implementar lógica" |

**Detalhes:** A grande maioria das páginas migradas usa Supabase real com queries em `src/lib/supabase/queries/`. Porém existem 9 violações espalhadas, incluindo dados fabricados em `Metaverse.tsx` e hooks mockados. O sistema de queries Supabase é bem estruturado com 7 módulos: leads, campaigns, notifications, opportunities, organizations, users, dashboard, gamification.

---

### LEI 4: TEMAS DINÂMICOS

- **Status:** ✅ CONFORME
- **Suporte dark/light:** Sim (4 temas dark + 2 light)
- **Mecanismo de toggle:** `data-theme` + injeção de CSS variables via JS
- **Persistência:** `localStorage` (chave `alsham-theme`)

**6 Temas definidos:**

| # | Key | Nome | Modo |
|---|-----|------|------|
| 1 | `cyber-vivid` | Cyber Vivid | Dark |
| 2 | `neon-energy` | Neon Energy | Dark |
| 3 | `midnight-aurora` | Midnight Aurora | Dark |
| 4 | `platinum-glass` | Platinum Glass | Light |
| 5 | `desert-quartz` | Desert Quartz | Light |
| 6 | `glass-dark` | Glass Dark | Dark |

**Arquitetura de temas:**
- **Definição:** `src/lib/themes.ts` (objetos Theme com 40+ variáveis cada)
- **Injeção:** `src/lib/theme-variables.ts` → `injectThemeVariables()` aplica em `document.documentElement.style`
- **CSS:** `src/styles/themes.css` (70+ variáveis CSS: bg, text, surface, accent, glow, gradient, shadcn bridge)
- **Hook:** `src/hooks/useTheme.ts` (`setTheme`, `toggleDarkMode`, `cycleTheme`)
- **Transição:** classe `theme-switching` com 320ms de animação

**Variáveis CSS (70+):**
- Background: `--bg`, `--bg-g1`, `--bg-g2`, `--bg-gradient`
- Text: `--text`, `--text-2`, `--text-muted`, `--text-primary`, `--text-secondary`
- Surfaces: `--surface`, `--surface-strong`, `--surface-elev`, `--glass-hi`, `--surface-glass`
- Borders: `--border`, `--border-strong`, `--border-shad`
- Accents: `--accent-1` até `--accent-3`, `--accent-warm`, `--accent-alert`
- Gradients: `--grad-primary`, `--grad-secondary`, `--grad-accent`, `--grad-wash`
- Glows: `--glow-1`, `--glow-2`, `--glow-3`
- Bridge shadcn: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--destructive`, etc.

**Lacunas no tema:** `--accent-purple`, `--accent-pink` e `--accent-warning` são usados em páginas mas não estão definidos em `theme-variables.ts` (possíveis aliases faltantes).

---

### LEI 5: ESTADOS UI COMPLETOS

- **Status:** ⚠️ PARCIAL
- **Páginas com loading state:** ~50 de 145 (34%)
- **Páginas com error state + retry:** ~25 de 145 (17%)
- **Páginas com empty state:** ~35 de 145 (24%)
- **Páginas com os 3 estados:** ~5-8 (Leads, LeadScoring, Pipeline, Opportunities, Campaigns)

| Página (amostra) | Loading | Error + Retry | Empty |
|-------------------|---------|---------------|-------|
| Leads | ✅ Spinner | ✅ "Tentar novamente" | ✅ "Nenhum lead" |
| LeadScoring | ✅ Skeleton | ✅ Retry button | ✅ "Nenhum lead pontuado" |
| Pipeline | ✅ Spinner | ✅ "Tentar Novamente" | ⚠️ Implícito |
| Contacts | ✅ Loading | ❌ Sem error | ✅ "Nenhum contato" |
| Dashboard | ✅ Skeleton | ❌ console.error only | ❌ Sem empty |
| Calendar | ✅ Loading | ❌ Sem error | ✅ "Nenhum evento" |

**Detalhes:** A documentação (`ARQUITETURA_CANONICA.md`) define o padrão obrigatório (loading + error + empty + success) mas a maioria das páginas não implementa todos os 4 estados. O uso de `Skeleton` (shadcn/ui) é limitado a ~5 páginas. A maioria usa um spinner genérico ou `useState(true)`.

---

### LEI 6: ESTRUTURA CANÔNICA

- **Status:** ⚠️ PARCIAL
- **Padrão de pastas:** Layer-based (components, pages, hooks, lib, services, routes)
- **Duplicações encontradas:** Sim

**Estrutura atual:**
```
src/
├── assets/               # Assets estáticos
├── components/
│   ├── ui/               # shadcn/ui (23 componentes) ✅
│   ├── boardroom/        # Componentes específicos
│   ├── dev/              # Debug/dev tools
│   ├── effects/          # Efeitos visuais
│   ├── leads/            # Componentes de leads
│   └── visualizations/   # Visualizações
├── config/               # Configs (sidebar, routes)
├── design-system/
│   └── iconography/      # Icon Design System
├── fixes/                # Hotfixes
├── hooks/                # 9 custom hooks
├── lib/
│   ├── supabase/         # Cliente + auth + queries (SSOT) ✅
│   ├── themes.ts         # 6 temas definidos
│   └── utils.ts          # cn() helper
├── pages/                # 145 páginas
│   ├── auth/             # Login, SignUp, etc.
│   ├── precondition/     # PreconditionGate
│   └── realms/           # Páginas especiais
├── routes/               # 7 arquivos de roteamento
├── services/             # 1 arquivo (leads.service.ts)
├── styles/               # themes.css, theme-tokens.css
├── utils/                # Utilitários
└── _backup_css_old/      # Backup legado
```

**Duplicações encontradas:**
1. **Sistema de rotas duplicado:** `App.tsx` (roteador principal) vs `routes/router.tsx` (alternativo) vs `routes/manifest.ts` — três sistemas coexistindo
2. **Listas de páginas duplicadas:** `pagesList.ts` vs `pagesList-old.ts` vs `pagesList-supremo.ts`
3. **Supabase clients:** `supabase.ts` (bridge) + `supabase-full.js` (~17k linhas) + `supabase/client.ts` (singleton) — três pontos de entrada
4. **Backup na source:** `supabase-full.js.backup` e `_backup_css_old/` dentro de `src/`
5. **Configs na raiz:** `vite.config.ts` + `vite.config.debug.ts`

**Detalhes:** A estrutura segue o padrão layer-based esperado, mas acumula artefatos legados (listas duplicadas, backups, sistema de rotas triplo). A pasta `src/fixes/` não deveria existir em produção. O `supabase-full.js` com ~17k linhas é um monólito que deveria ser modularizado.

---

## 3. SCORECARD GERAL

| Dimensão | Nota (0-10) | Comentário |
|----------|-------------|------------|
| Arquitetura | **6.5** | Layer-based correto, mas duplicações de rotas e supabase clients |
| Estilização | **5.0** | Sistema de temas excelente (6 temas, 70+ CSS vars), mas ~470+ cores hardcoded em 97 páginas |
| Dados & Backend | **7.5** | Supabase bem integrado, queries modularizadas, realtime, mas 9 violações de mock |
| Autenticação | **7.0** | Supabase Auth + Zustand + PKCE + multi-org, sem social login/MFA |
| Segurança | **8.0** | CSP completo, HSTS, X-Frame-Options, ESLint security plugin, PKCE auth |
| Performance | **6.0** | Manual chunks (Vite), mas lazy loading mínimo (~3 arquivos), sem image optimization |
| Testes | **2.0** | Config existe (Vitest + Cypress), mas testes desatualizados, sem script npm, ~9 arquivos |
| Documentação | **9.0** | CLAUDE.md, .cursorrules, copilot-instructions, 15+ docs, roadmaps, checklists |
| Governança AI | **9.5** | Instruções para Claude, Cursor, e Copilot alinhadas às 6 leis |
| Qualidade de código | **5.5** | ESLint enterprise rigoroso, mas 67% das páginas sem shadcn, 470+ cores hardcoded |
| **MÉDIA GERAL** | **6.6** | Fundação sólida, migração incompleta |

---

## 4. STACK COMPLETA DETECTADA

| Categoria | Tecnologia | Versão | Equivalente ALSHAM | Match? |
|-----------|-----------|--------|-------------------|--------|
| Framework | React | 18.3.1 | React 19 | ⚠️ v18 (não v19) |
| Meta-framework | — (SPA puro) | — | — (Vite puro) | ✅ |
| Linguagem | TypeScript | 5.8.3 | TypeScript 5.8 | ✅ |
| Build | Vite | 7.0.0 | Vite 6 | ✅ (acima) |
| Estilização | Tailwind CSS | 3.4.17 | Tailwind CSS | ✅ |
| Componentes | shadcn/ui (Radix) | latest | shadcn/ui | ✅ |
| State | Zustand 4.4 + Context | 4.4.7 | Context API | ✅ |
| Auth | Supabase Auth | 2.39.0 | Supabase Auth | ✅ |
| Database | Supabase (Postgres) | 2.39.0 | Supabase (Postgres) | ✅ |
| IA | — (apenas citado) | — | Google Gemini 2.5 Pro | ❌ Não integrado |
| Pagamentos | — (Stripe apenas citado) | — | Stripe | ❌ Não integrado |
| Animações | Framer Motion | 11.0.8 | Framer Motion | ✅ |
| Deploy | Vercel | — | Vercel | ✅ |
| Roteamento | React Router DOM | 6.30.1 | React Router DOM | ✅ |
| Gráficos | Chart.js + Recharts | 4.5.1 / 3.5.1 | Recharts/Chart.js | ✅ |
| Forms | React Hook Form + Zod | 7.68 / 4.2.1 | React Hook Form | ✅ |
| 3D | Three.js + R3F | 0.181.2 | — | ➕ Extra |
| DnD | react-beautiful-dnd | 13.1.1 | — | ➕ Extra |
| Flow | ReactFlow | 11.11.4 | — | ➕ Extra |
| Icons | Lucide React + Heroicons | latest | Lucide React | ✅ |
| Testes | Vitest + Cypress | — | Vitest | ⚠️ Desatualizado |
| Linting | ESLint | — | ESLint | ✅ |
| Formatting | Prettier (via ESLint) | — | Prettier | ✅ |

---

## 5. GAPS CRÍTICOS (O QUE FALTA PARA ALCANÇAR PADRÃO ALSHAM)

### 🔴 CRÍTICO (bloqueia conformidade)

1. **~470+ cores Tailwind hardcoded em ~97 páginas** — Viola a Lei 1 (Zero Cores Hardcoded). Cada `bg-gray-*`, `text-emerald-*`, `bg-white` precisa migrar para `var(--variavel)`.
2. **~100 cores hex hardcoded em style attributes** — `Metaverse.tsx`, `AIAssistant.tsx`, `APIStatus.tsx`, `Achievements.tsx`, `WarArena.tsx` têm cores `#xxxxxx` diretamente.
3. **97 páginas (67%) sem shadcn/ui** — Viola a Lei 2. Usam `<div>` e `<button>` customizados.
4. **9 violações de mock/placeholder data** — Viola a Lei 3. Dados fabricados em hooks e páginas.
5. **Sistema de rotas triplicado** — `App.tsx`, `routes/router.tsx`, `routes/manifest.ts` coexistindo.
6. **3 entradas Supabase** — `supabase.ts` (bridge), `supabase-full.js` (17k linhas monólito), `supabase/client.ts` (singleton).

### 🟡 IMPORTANTE (degrada qualidade)

1. **~115 páginas sem os 3 estados UI** (loading + error + empty) — Viola a Lei 5.
2. **Variáveis CSS faltantes:** `--accent-purple`, `--accent-pink`, `--accent-warning` usados mas não definidos.
3. **Testes desatualizados/quebrados** — E2E testa HTML estático (não React), sem script `test` no `package.json`.
4. **Lazy loading mínimo** — Apenas 3 arquivos usam `React.lazy()`. 145 páginas carregadas sem code splitting explícito.
5. **React 18 vs padrão React 19** — Versão abaixo da referência.
6. **Sem fontes customizadas** — Preconnect para Google Fonts sem importar nenhuma fonte.
7. **Backups dentro do src/** — `_backup_css_old/`, `supabase-full.js.backup`.
8. **Listas de páginas duplicadas** — `pagesList.ts`, `pagesList-old.ts`, `pagesList-supremo.ts`.

### 🟢 DESEJÁVEL (melhoria incremental)

1. **IA não integrada** — Gemini 2.5 Pro citado na referência mas não implementado.
2. **Stripe não integrado** — Apenas citado em mock de webhook.
3. **Social login / MFA ausentes** — Apenas email/password.
4. **Validação de env vars com Zod** — Zod está no `package.json` mas não valida env.
5. **SEO mínimo** — Meta tags básicas em `index.html`, sem Open Graph, sem sitemap, sem robots.txt.
6. **Sem Husky / lint-staged** — ESLint configurado mas sem pre-commit hooks.
7. **Sem CI/CD workflows** — Pasta `.github/workflows/` existe mas sem workflows ativos verificados.
8. **Image optimization** — Sem `next/image` equivalente, sem sharp, sem lazy loading de imagens.
9. **PWA incompleto** — Manifest e meta tags presentes, mas service worker referência HTML legado.

---

## 6. PLANO DE MIGRAÇÃO SUGERIDO

### FASE 1 — Limpeza Estrutural (4-6 horas)

- [ ] Remover `_backup_css_old/` de `src/`
- [ ] Remover `supabase-full.js.backup`
- [ ] Remover `pagesList-old.ts` (manter apenas `pagesList-supremo.ts`)
- [ ] Consolidar sistema de rotas: unificar `App.tsx` + `router.tsx` + `manifest.ts` em um único fluxo
- [ ] Consolidar Supabase clients: remover `supabase-full.js`, usar apenas `supabase/client.ts` como SSOT
- [ ] Definir variáveis faltantes: `--accent-purple`, `--accent-pink`, `--accent-warning` em `theme-variables.ts`
- [ ] Remover TODOs e comentários de mock

### FASE 2 — Conformidade Visual: Migração de 97 páginas (40-60 horas)

- [ ] **Bloco A (20 páginas):** ESG, Compliance, Sustainability, VirtualOffice, Investors, CarbonFootprint, Leaderboard, Publicacao, Seguranca, WarArena, Gamification, TheBoardroomOmega, NFTGallery, AlshamOS, Metaverse, UnderConstruction, Badges, Achievements, Onboarding, Changelog
- [ ] **Bloco B (20 páginas):** Auth pages (Login, SignUp, ForgotPassword, ResetPassword, OrganizationSelector), HRDashboard, Recruitment, Payroll, Benefits, PerformanceReviews, TrainingCenter, Feedback360, Recognition, OnboardingFlow, Offboarding, EmployeeEngagement, Goals, OKRs, DEI, PulseSurveys
- [ ] **Bloco C (20 páginas):** Treasury, CashFlow, BudgetPlanning, TaxCompliance, ExpenseReports, StockOptions, EquityManagement, CapTable, InvestorPortal, ShareholderReports, RevenueForecast, BoardView, Procurement, AssetManagement, VendorManagement, TravelManagement, SoftwareLicenses, IncidentResponse, DisasterRecovery, BackupStatus
- [ ] **Bloco D (20 páginas):** DeveloperPortal, DataLake, APIStatus, SystemHealth, UptimeMonitor, AutomationBuilder, Automations, WorkflowEngine, CompetitorTracking, MarketIntelligence, SalesPlaybook, DealIntelligence, ChurnPrediction, SentimentAnalysis, BehavioralTracking, PredictiveModels, ContractManagement, TimeTracking, PerformanceMetrics, ITInventory
- [ ] **Bloco E (17 páginas):** TeamPerformance, SalesLeaderboard, SupportLeaderboard, MarketingLeaderboard, EngineeringLeaderboard, CultureDashboard, VoiceCommands, CitizenOrb, OraculumArkanus, Realms (PrismChamber, TheThrone, NexusField, GenesisVault), RewardsStore, PointsHistory, Certification, AuditTrail

Para cada página:
1. Substituir cores hardcoded → CSS variables
2. Substituir `<div>`/`<button>` → shadcn/ui (Card, Button, Badge, Table, etc.)
3. Garantir 3 estados: loading (Skeleton), error (retry button), empty (mensagem + ação)

### FASE 3 — Dados Reais (8-12 horas)

- [ ] Substituir mock em `useAnalytics.ts` por analytics real (GA4 ou similar)
- [ ] Remover mock toggle de `APIStatus.tsx`
- [ ] Implementar dados reais em `Financeiro.tsx` (remover simulação de cashReserve)
- [ ] Substituir placeholder data em `Metaverse.tsx` por dados do Supabase
- [ ] Implementar `NeuralGraph.tsx` e `ReplayDebugger.tsx` (ou remover)
- [ ] Implementar `TheThrone.tsx` (ou marcar como "planned" no nav)
- [ ] Resolver "TODO: Load automations data" em `Automations.tsx`
- [ ] Migrar funções de `supabase-full.js` para módulos em `supabase/queries/`

### FASE 4 — Governança & Qualidade (6-8 horas)

- [ ] Adicionar `"test": "vitest"` e `"test:e2e": "cypress run"` ao `package.json`
- [ ] Atualizar testes E2E do Cypress para testar o SPA React (não HTML legado)
- [ ] Adicionar testes unitários para hooks críticos (useAuthStore, useTheme, useLeadsAI)
- [ ] Configurar Husky + lint-staged para pre-commit hooks
- [ ] Implementar validação de env vars com Zod (`src/lib/env.ts`)
- [ ] Adicionar lazy loading (`React.lazy()`) para todas as páginas no registry
- [ ] Upgrade React 18 → React 19
- [ ] Implementar Google Fonts (importar fonte cyberpunk para headings)
- [ ] Adicionar robots.txt e sitemap.xml

### Estimativa total: **58-86 horas** (~7-11 dias de trabalho focado)

---

## 7. MAPA DE ARQUIVOS ANALISADOS

### Configuração (raiz)
- `package.json`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `vite.config.ts`, `vite.config.debug.ts`
- `tailwind.config.js`
- `postcss.config.js`
- `vercel.json`
- `.eslintrc.js`
- `.env.example`
- `.cursorrules`
- `.gitignore`, `.vercelignore`, `.nixpacks.toml`, `railway.toml`
- `components.json`
- `n8n-guardian.json`, `yw_manifest.json`
- `cypress.config.js`, `vitest.config.js`

### Documentação
- `CLAUDE.md`
- `README.md`
- `.cursorrules`
- `.github/copilot-instructions.md`
- `AUDITORIA-PAGINAS.md`
- `COMMIT_INSTRUCTIONS.md`
- `FORENSIC_REPORT.md`
- `THEME_COMPONENTS_AUDIT.md`
- `THEME_HIERARCHY_AUDIT.md`
- `YOUWARE.md`
- `docs/ARQUITETURA_CANONICA.md`
- `docs/ROADMAP_TODAS_PAGINAS.md`
- `docs/ROADMAP_MIGRACAO_SHADCN.md`
- `docs/ALSHAM_REGRAS_INVIOLAVEIS_100_REAL.md`
- `docs/ALSHAM_MEGA_PROMPT_CRIACAO_PAGINAS.md`
- `docs/ALSHAM_PROMPT_DESTRUIDOR_REFINADO.md`
- `docs/ALSHAM_PROMPTS_PRONTOS_PARA_OUTRAS_IAS.md`
- `docs/ALSHAM_HANDOFF_COMPLETO_PARA_OUTRAS_IAS.md`
- `docs/CHECKLIST_VALIDACAO.md`
- `docs/BOAS_PRATICAS.md`

### Core (src/)
- `src/App.tsx`
- `src/main.tsx`
- `src/index.html`
- `src/index.css`

### Rotas
- `src/routes/index.tsx`
- `src/routes/router.tsx`
- `src/routes/manifest.ts`
- `src/routes/pagesList.ts`
- `src/routes/pagesList-supremo.ts`
- `src/routes/pagesList-old.ts`
- `src/routes/nav.ts`

### Hooks
- `src/hooks/useTheme.ts`
- `src/hooks/useLeadsAI.ts`
- `src/hooks/useDebounce.ts`
- `src/hooks/useExecutiveMetrics.ts`
- `src/hooks/useSupabaseRealtime.ts`
- `src/hooks/useAnalytics.ts`
- `src/hooks/use-toast.ts`
- `src/hooks/useUrlSync.ts`

### Lib / Supabase
- `src/lib/supabase.ts`
- `src/lib/supabase-full.js`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/auth.ts`
- `src/lib/supabase/useAuthStore.ts`
- `src/lib/supabase/types.ts`
- `src/lib/supabase/queries/leads.ts`
- `src/lib/supabase/queries/campaigns.ts`
- `src/lib/supabase/queries/notifications.ts`
- `src/lib/supabase/queries/opportunities.ts`
- `src/lib/supabase/queries/organizations.ts`
- `src/lib/supabase/queries/users.ts`
- `src/lib/supabase/queries/dashboard.ts`
- `src/lib/supabase/queries/gamification.ts`
- `src/lib/themes.ts`
- `src/lib/theme-variables.ts`
- `src/lib/utils.ts`
- `src/lib/ritualReport.ts`

### Estilos
- `src/styles/themes.css`
- `src/styles/theme-tokens.css`

### Componentes UI (shadcn)
- `src/components/ui/` (23 componentes + barrel)

### Componentes customizados
- `src/components/ProtectedLayout.tsx`
- `src/components/LayoutSupremo.tsx`
- `src/components/SidebarSupremo.tsx`
- `src/components/SupremePageFactory.tsx`
- `src/components/RealmSelector.tsx`
- `src/components/leads/CreateLeadModal.tsx`
- `src/components/leads/SmartFilters.tsx`
- `src/components/leads/RelationshipNetwork.tsx`
- `src/components/leads/LeadsPipeline.tsx`
- `src/components/visualizations/NeuralGraph.tsx`
- `src/components/dev/ReplayDebugger.tsx`

### Páginas (145 arquivos em `src/pages/`)
Todas as 145 páginas foram varredidas para cores hardcoded, mock data, e uso de shadcn/ui.

### Testes
- `tests/e2e/auth.cy.js`
- `tests/e2e/leads.cy.js`
- `tests/e2e/pipeline.cy.js`
- `tests/unit/supabase.spec.js`
- `tests/dashboard.test.js`
- `cypress/e2e/dashboard.cy.js`

### Config
- `src/config/sidebarStructure.tsx`
- `src/config/routes.ts`

### Services
- `src/services/leads.service.ts`

---

## 8. RESUMO EXECUTIVO

O **ALSHAM 360° PRIMA** é um projeto ambicioso e bem-arquitetado com uma **fundação sólida**: sistema de temas excepcional (6 temas cyberpunk com 70+ CSS variables), Supabase bem integrado (Auth + Realtime + queries modularizadas), documentação exemplar (CLAUDE.md + .cursorrules + 15+ docs), e uma configuração ESLint enterprise-grade.

O principal desafio é a **migração incompleta**: 67% das páginas ainda usam cores hardcoded e componentes customizados em vez de shadcn/ui. O sistema de rotas é triplicado, existem artefatos legados no source, e os testes estão desatualizados.

**Nota geral: 6.6/10** — com potencial para **9.0+** após completar a migração das 97 páginas restantes e resolver as duplicações estruturais.

---

**FIM DA AUDITORIA FORENSE ALSHAM**  
**Protocolo versão:** 1.0  
**Padrão de referência:** SUPREMA BELEZA 5.0 — Matriz Gênesis  
**Total de arquivos varredidos:** 370  
**Total de linhas analisadas:** 53.978
