# 🗺️ Guia de Navegação - ALSHAM 360° PRIMA

**Versão:** 7.1
**Data:** 2025-12-10
**Status:** ✅ Estrutura Reorganizada

---

## 📚 Índice

1. [Arquitetura da Sidebar](#arquitetura-da-sidebar)
2. [Como Adicionar Nova Página](#como-adicionar-nova-página)
3. [Como Adicionar Nova Categoria](#como-adicionar-nova-categoria)
4. [Estrutura de Rotas](#estrutura-de-rotas)
5. [Sistema de Hierarquia](#sistema-de-hierarquia)
6. [Badges e Status](#badges-e-status)
7. [Troubleshooting](#troubleshooting)
8. [Referências de API](#referências-de-api)

---

## 🏗️ Arquitetura da Sidebar

### Arquivos Principais

```
src/
├── config/
│   ├── sidebarStructure.tsx    # ✅ SINGLE SOURCE OF TRUTH - Estrutura da sidebar
│   └── routes.ts                # ✅ Constantes de rotas
├── components/
│   └── SidebarSupremo.tsx       # Componente visual da sidebar
└── App.tsx                      # Registro de rotas
```

### Fluxo de Dados

```mermaid
sidebarStructure.tsx
    ↓
SidebarSupremo.tsx (renderiza UI)
    ↓
onNavigate(routeId)
    ↓
App.tsx (route registry)
    ↓
Componente da Página
```

---

## ➕ Como Adicionar Nova Página

### Passo 1: Criar o Componente da Página

```tsx
// src/pages/MinhaNovaPage.tsx
export default function MinhaNovaPage() {
  return (
    <div className="p-6">
      <h1>Minha Nova Página</h1>
      {/* Conteúdo aqui */}
    </div>
  );
}
```

### Passo 2: Registrar a Rota em App.tsx

```tsx
// src/App.tsx

import MinhaNovaPage from './pages/MinhaNovaPage';

// Adicione a rota no bloco de registerRoute:
registerRoute("minha-nova-page", async () => ({ default: MinhaNovaPage }));
```

### Passo 3: Adicionar Constante em routes.ts

```ts
// src/config/routes.ts

export const ROUTES = {
  // ... outras rotas

  MINHA_SECAO: {
    NOVA_PAGE: 'minha-nova-page',
  },
} as const;
```

### Passo 4: Adicionar à Sidebar em sidebarStructure.tsx

```tsx
// src/config/sidebarStructure.tsx

import { MinhaIcon } from 'lucide-react';

export const SIDEBAR_STRUCTURE: SidebarCategory[] = [
  // ... outras categorias

  {
    id: 'minha-categoria',
    label: 'Minha Categoria',
    icon: <MinhaIcon className="h-5 w-5" />,
    accentColor: 'var(--accent-blue)',
    links: [
      {
        id: 'minha-nova-page',
        label: 'Minha Nova Página',
        icon: <MinhaIcon className="h-4 w-4" />,
        status: 'implemented', // ou 'placeholder'
        description: 'Descrição da página',
      },
    ],
  },
];
```

### Passo 5: Verificar

```bash
npm run build
```

Se tudo estiver correto, a nova página aparecerá na sidebar! ✅

---

## 📂 Como Adicionar Nova Categoria

### Template de Categoria

```tsx
// src/config/sidebarStructure.tsx

{
  id: 'minha-categoria-id',
  label: 'Nome da Categoria',
  icon: <IconeCategoria className="h-5 w-5" />,
  accentColor: 'var(--accent-cor)', // var(--accent-emerald), var(--accent-sky), etc.
  description: 'Descrição breve da categoria',
  defaultCollapsed: false, // true para começar colapsada
  badge: 'Novo', // opcional
  links: [
    {
      id: 'rota-id',
      label: 'Label do Link',
      icon: <IconeLink className="h-4 w-4" />,
      status: 'implemented', // 'implemented' | 'placeholder' | 'planned'
      description: 'Descrição do link',
      badge: 'Beta', // opcional
    },
  ],
}
```

### Cores Disponíveis

```ts
// Cores pré-definidas no CSS
var(--accent-emerald)   // Verde
var(--accent-sky)       // Azul claro
var(--accent-fuchsia)   // Rosa/Roxo
var(--accent-amber)     // Âmbar/Laranja
var(--accent-purple)    // Roxo
var(--accent-teal)      // Verde-azulado
var(--accent-indigo)    // Índigo
var(--accent-cyan)      // Ciano
var(--accent-rose)      // Rosa
var(--color-primary-from) // Cor primária do gradiente
var(--text-secondary)   // Cinza (para Sistema)
```

---

## 🧭 Estrutura de Rotas

### Convenções de Nomenclatura

```
{modulo}-{funcionalidade}-{acao}
```

**Exemplos:**
- `leads-lista` ✅
- `leads-detalhes` ✅
- `campanhas-criar-editar` ✅
- `email-marketing-dashboard` ✅

**NÃO use:**
- `leadsList` ❌ (evite camelCase)
- `lista_leads` ❌ (evite snake_case)
- `leads` ❌ (muito genérico)

### Uso de Constantes

**SEMPRE use constantes de ROUTES ao invés de strings:**

```tsx
// ❌ ERRADO
navigate('leads-lista');

// ✅ CORRETO
import { ROUTES } from '@/config/routes';
navigate(ROUTES.CRM.LEADS.LIST);
```

**Benefícios:**
- Autocompletion no IDE
- Type safety
- Refatoração fácil
- Detecção de erros em tempo de compilação

### Rotas Dinâmicas

```tsx
// Para rotas com parâmetros
navigate(`${ROUTES.CRM.LEADS.DETAILS}-${leadId}`);

// Ou criar helper
function getLeadDetailsRoute(leadId: string) {
  return `${ROUTES.CRM.LEADS.DETAILS}/${leadId}`;
}
```

---

## 🌳 Sistema de Hierarquia

### Links com Sublinks (Children)

```tsx
{
  id: 'leads-lista',
  label: 'Leads',
  icon: <Users className="h-4 w-4" />,
  status: 'implemented',
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
}
```

### Comportamento

- **Link com children:** Ao clicar, expande/colapsa os filhos (não navega)
- **Link sem children:** Ao clicar, navega para a página
- **Indicador visual:** Chevron (▼/▶) aparece em links com children
- **Indentação:** Cada nível de profundidade adiciona 12px de padding (desktop) ou 16px (mobile)

### Limite de Profundidade

**Recomendado:** Máximo 2 níveis de hierarquia

```
Categoria
└── Link Pai
    └── Link Filho
```

**Evite:** Hierarquias muito profundas (dificulta UX)

---

## 🏷️ Badges e Status

### Status de Implementação

```tsx
status: 'implemented'  // ✅ Página totalmente funcional
status: 'placeholder'  // ⏸️ Mostra PlaceholderPage ("Em Desenvolvimento")
status: 'planned'      // 📅 Planejado para futuro
```

### Badges Personalizados

```tsx
badge: 'Novo'       // Badge rosa/fuchsia
badge: 'Beta'       // Badge rosa/fuchsia
badge: '5'          // Badge numérico (ex: notificações)
```

### Badge "Em Desenvolvimento"

Automaticamente exibido para links com `status: 'placeholder'`:

```tsx
// Renderiza badge "Dev" em âmbar
{link.status === 'placeholder' && (
  <span className="badge-dev">Dev</span>
)}
```

---

## 🔧 Troubleshooting

### Problema: Link não aparece na sidebar

**Checklist:**
1. ✅ ID adicionado em `sidebarStructure.tsx`?
2. ✅ Rota registrada em `App.tsx`?
3. ✅ Link não está com `hidden: true`?
4. ✅ Categoria pai não está colapsada por padrão?

### Problema: Link aparece mas não navega

**Checklist:**
1. ✅ ID do link corresponde exatamente ao ID da rota?
2. ✅ Função `onNavigate` está sendo chamada corretamente?
3. ✅ Link não tem `children` (links com children não navegam)?

### Problema: Erro de build

```bash
# Limpe cache e rebuilde
rm -rf node_modules dist
npm install
npm run build
```

### Problema: Rota não funciona

**Verifique aliases em routes.ts:**

```ts
// Rotas antigas podem ter aliases
export const ROUTE_ALIASES: Record<string, AppRoute> = {
  'analytics': 'analytics-dashboard',
  'whatsapp-chat': 'whatsapp-business',
  // ...
};
```

**Use a função `normalizeRoute`:**

```ts
import { normalizeRoute } from '@/config/routes';

const correctRoute = normalizeRoute('analytics'); // retorna 'analytics-dashboard'
```

---

## 📖 Referências de API

### `sidebarStructure.tsx`

#### `SidebarCategory`

```ts
interface SidebarCategory {
  id: string;                      // ID único da categoria
  label: string;                   // Texto exibido
  icon: React.ReactNode;           // Ícone da categoria
  accentColor: string;             // Cor CSS
  links: SidebarLink[];            // Links da categoria
  defaultCollapsed?: boolean;      // Inicia colapsada? (padrão: false)
  description?: string;            // Descrição (tooltips)
  badge?: string | number;         // Badge da categoria
}
```

#### `SidebarLink`

```ts
interface SidebarLink {
  id: string;                      // ID da rota (DEVE corresponder ao App.tsx)
  label: string;                   // Texto exibido
  icon?: React.ReactNode;          // Ícone do link
  status?: PageStatus;             // 'implemented' | 'placeholder' | 'planned'
  badge?: string | number;         // Badge personalizado
  description?: string;            // Descrição (tooltips)
  children?: SidebarLink[];        // Sublinks (hierarquia)
  roles?: string[];                // Permissões (futuro)
  hidden?: boolean;                // Se true, não exibe
}
```

### Funções Utilitárias

```ts
// Encontrar categoria por ID
const category = findCategoryById('crm-core');

// Encontrar link por ID
const result = findLinkById('leads-lista');
// result = { category: SidebarCategory, link: SidebarLink }

// Obter todas as rotas (flat)
const allRoutes = getAllRoutes();
// ['dashboard-principal', 'leads-lista', ...]

// Contar links
const totalLinks = getTotalLinksCount();

// Estatísticas
const stats = getSidebarStats();
// {
//   totalCategories: 11,
//   totalLinks: 120,
//   implementedLinks: 9,
//   placeholderLinks: 111,
//   implementationRate: '7.5%'
// }
```

---

## 🎯 Melhores Práticas

### 1. Organize Logicamente

Agrupe páginas relacionadas na mesma categoria.

**Exemplo:**
```
CRM Core
├── Dashboard
├── Leads
├── Contatos
└── Oportunidades

Marketing
├── Campanhas
├── Email Marketing
└── Redes Sociais
```

### 2. Use Hierarquia com Moderação

Evite mais de 2 níveis de profundidade:

```
✅ BOM
Leads
├── Lista
├── Detalhes
└── Importação

❌ RUIM (muito profundo)
Leads
└── Gestão
    └── Operações
        └── Lista
            └── Visualização
```

### 3. Badges Informativos

Use badges para destacar informações importantes:

```tsx
badge: 'Novo'      // Feature recente
badge: 'Beta'      // Em teste
badge: '12'        // Notificações pendentes
badge: '🔥'        // Destaque especial
```

### 4. Descrições Claras

```tsx
{
  id: 'analytics-dashboard',
  label: 'Analytics',
  description: 'Métricas e KPIs em tempo real', // Exibido em tooltips
}
```

### 5. Ícones Consistentes

Use ícones do **lucide-react** para consistência:

```tsx
import { Users, Mail, Calendar } from 'lucide-react';

icon: <Users className="h-4 w-4" />
```

---

## 📊 Estatísticas Atuais (v7.1)

```
Categorias: 11
Total de Links: 120+
Páginas Implementadas: 9 (7.5%)
Páginas em Placeholder: 111 (92.5%)
```

### Categorias

1. ✅ CRM Core (15 links)
2. ✅ Marketing (12 links)
3. ✅ Suporte ao Cliente (8 links)
4. ✅ Analytics & Relatórios (10 links)
5. ✅ Automação & IA (7 links)
6. ✅ Gamificação (8 links)
7. ✅ Omnichannel (12 links)
8. ✅ Gestão de Equipes (8 links)
9. ✅ Integrações (10 links)
10. ✅ Configurações & Admin (15 links)
11. ✅ Comunidade & Suporte (5 links)

---

## 🚀 Roadmap de Implementação

### Fase 1: Core (Prioridade Alta)
- [ ] Contatos - Lista e Detalhes
- [ ] Oportunidades - Lista e Kanban
- [ ] Pipeline de Vendas
- [ ] Calendário

### Fase 2: Marketing & Vendas
- [ ] Campanhas
- [ ] Email Marketing
- [ ] Landing Pages
- [ ] Formulários

### Fase 3: Suporte & Analytics
- [ ] Tickets
- [ ] Knowledge Base
- [ ] Analytics Dashboard
- [ ] Relatórios Personalizados

### Fase 4: Automação & IA
- [ ] Workflows Builder
- [ ] AI Insights
- [ ] Sequences de Vendas

---

## 📞 Suporte

**Problemas ou dúvidas?**

1. Verifique este guia
2. Consulte `SIDEBAR_AUDIT.md` para detalhes técnicos
3. Revise `CHANGELOG_SIDEBAR.md` para mudanças recentes
4. Abra uma issue no repositório

---

**Última atualização:** 2025-12-10
**Mantido por:** Equipe de Desenvolvimento ALSHAM 360° PRIMA
