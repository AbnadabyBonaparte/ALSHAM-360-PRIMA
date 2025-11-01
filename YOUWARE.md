# ALSHAM 360° PRIMA — YOUWARE Ops Guide

_Atualizado em 27/10/2025_

## Visão Geral do Projeto

- **Stack**: React 18 + TypeScript + Vite 7 + Tailwind 3
- **App**: Dashboard Executivo 360° com foco em CRM, IA, Automação, Comunidade e Gamificação
- **Entrada**: `src/main.tsx` → `<App />`
- **Estado Global**: Zustand (`useDashboardStore` em `App.tsx`)
- **Design Language**: Paleta neutra (sage, mist, clay, brass) + temas vibrantes (Neon Energy com roxo #b474ff otimizado para contraste, Cyber Vivid), materiais translúcidos e layout assimétrico com respiro generoso
- **Animações**: Framer Motion com `whileInView` e microinterações em cards (hero, KPIs, analytics, campanhas)

## Comandos Essenciais

```bash
npm install          # instalar dependências
npm run build        # build de produção (obrigatório após alterações)
```

(Dev server não é usado neste ambiente Youware.)

## Arquitetura do Código

- `src/App.tsx` concentra o layout completo do dashboard. Estrutura em colunas: 
  - **Sidebar** (10 domínios: Vendas, Marketing, Suporte, Comunicação, Analytics, Automação, Equipe, Integrações, IA & Inovação, Plataforma)
  - **Header** (busca global, seletor moeda/timeframe, notificações, usuário)
  - **Seções centrais**:
    - _Hero_ com ROI, visão estratégica e badges
    - _KPIs_ (cards com sparklines e indicadores)
    - _Analytics Hub_ (pipeline, funil, heatmap, mapa, coorte)
    - _IA Next-Best-Action_ + automations timeline
    - _Engagement Pulse_ (feed realtime, leaderboard, tasks)
    - _Comunidade & SLA Dashboard_

- Estado global mockado via `Zustand`: `useDashboardStore`
  - Campos: `kpis`, `analytics`, `aiInsights`, `automations`, `engagement`, `currency`, `timeframe`, `loading`
  - `fetchData()` simula carregamento assíncrono (800ms) com dados coerentes às tabelas auditadas do `supabase.js` (incluindo módulos novos: automações e comunidade)

- Componentes utilitários locais em `App.tsx`:
  - Gráficos principais renderizados com `react-chartjs-2` (Bar, Line, Doughnut) utilizando helpers `chartNeutrals`/`hexToRgba` para manter a paleta neutra
  - Heatmap de squads construído via grid CSS (`heatmapMeta`) calculado com `useMemo`
  - `Sparkline` → renderiza minigráfico por coluna
  - `CampaignSpotlight` → vitrine de campanhas com carrossel multimídia e timers automáticos

## Diretórios Relevantes

```
src/
├── App.tsx         # dashboard completo + store
├── main.tsx       # bootstrap React
└── index.css      # importa Tailwind base/components/utils
```

Diretórios vazios (`api/`, `components/`, etc.) estão reservados para futuras evoluções (conforme template).

## Dados Mockados / Integrações

Mocks alinhados ao inventário do `supabase.js` auditado:
- CRM: `mockKpis`, `mockAnalytics` (pipeline, conversion, cohort, geo)
- Automação: `mockAutomations`
- IA: `mockAiInsights`
- Engajamento: `mockEngagement` (feed realtime, leaderboard, tasks, community, SLA)

Se conectar ao backend real, substituir `fetchData()` por chamadas Supabase mantendo a mesma estrutura tipada.

## Boas Práticas & Observações

- **Build obrigatório** após qualquer mudança (`npm run build`).
- Tailwind já configurado; manter `@tailwind` imports no topo de `index.css`.
- `index.html` já traz o pacote completo de meta tags mobile (viewport-fit, Apple/Android web-app, theme-color, format-detection) + `apple-touch-icon`. Não remover sem substituição equivalente.
- Visualizações Chart.js estão centralizadas em `App.tsx`; ajustar datasets/opções nos hooks `pipelineBarData`, `conversionLineData`, `marketSplitData` e na matriz `heatmapMeta`.
- Navegação mobile usa o estado `isMobileNavOpen` com `AnimatePresence`: o overlay lateral aplica safe areas (`env(safe-area-inset-*)`) e bloqueia o scroll de fundo ao abrir.
- Lucide ícones usados diretamente; instalar novos ícones via `lucide-react` se necessário.
- Paleta e gradientes são controlados por variáveis CSS em `index.css` (tons neutros sage/mist/clay/brass). Ajuste as cores sempre pelas variáveis para manter coerência entre temas.
- Estado loading exibe spinner premium “Supabase ∞ ALSHAM”. Não remover sem substituir por UX equivalente.

## Próximos Passos Sugeridos

1. Extrair componentes do `App.tsx` para `src/components/` caso haja novas features (melhora legibilidade).
2. Integrar com Supabase real (usar padrões de tabelas mapeados na auditoria `AUDITORIA_COMPLETA_POS_DEPLOY_supabase.js.md`).
3. Adicionar testes visuais via Storybook ou Chromatic (não configurado ainda).
4. Expandir diretórios (`store/`, `pages/`, etc.) quando introduzir rotas ou estados adicionais.

---
**Responsável pela última atualização:** YOUWARE Agent · Sessão 27/10/2025
