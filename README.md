# 🚀 ALSHAM 360° PRIMA

> O CRM Enterprise mais avançado do Brasil - 150+ módulos, design cyberpunk, 6 temas dinâmicos.

[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://app.alshamglobal.com.br)
[![React](https://img.shields.io/badge/react-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/tailwind-3-blue)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black)](https://ui.shadcn.com/)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tech Stack](#tech-stack)
- [Começando](#começando)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Sistema de Temas](#sistema-de-temas)
- [Componentes](#componentes)
- [Regras de Desenvolvimento](#regras-de-desenvolvimento)
- [Progresso da Migração](#progresso-da-migração)

---

## 🎯 Sobre o Projeto

ALSHAM 360° PRIMA é um superapp empresarial que substitui todos os softwares de uma empresa unicórnio:

- **CRM Completo:** Leads, Pipeline, Contacts, Opportunities
- **Marketing:** Campaigns, Email Marketing, Social Media, SEO
- **Suporte:** Tickets, Live Chat, Omnichannel Inbox
- **Financeiro:** Invoices, Orders, Contracts
- **RH:** Recruitment, Payroll, Performance Reviews
- **Gamificação:** Achievements, Leaderboards, XP System
- **E muito mais...**

### Características

- 🎨 **6 Temas Cyberpunk** - Neon Energy, Midnight Aurora, Solar Flare, etc.
- 🔒 **Multi-tenant** - Isolamento por org_id
- ⚡ **Realtime** - Supabase subscriptions
- 📱 **Responsivo** - Mobile-first design
- 🌐 **PWA Ready** - Offline support

---

## 🛠️ Tech Stack

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build** | Vite |
| **Styling** | Tailwind CSS + CSS Variables |
| **Components** | shadcn/ui |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Backend** | Supabase (PostgreSQL + Realtime) |
| **Auth** | Supabase Auth |
| **Deploy** | Vercel |

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase

### Instalação

```bash
# Clone o repositório
git clone https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA.git
cd ALSHAM-360-PRIMA

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Supabase

# Rode o projeto
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run preview  # Preview do build
npm run lint     # Lint do código
```

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (NÃO MODIFICAR)
│   ├── HeaderSupremo.tsx      # Header principal
│   ├── SidebarSupremo.tsx     # Sidebar principal
│   └── ...
├── design-system/
│   └── iconography/           # Icon Design System
├── hooks/
│   ├── useTheme.ts            # Hook de temas
│   └── use-toast.ts           # Toast notifications
├── lib/
│   ├── supabase/              # Supabase client e queries
│   ├── themes.ts              # Definições dos 6 temas
│   ├── theme-variables.ts     # Variáveis TypeScript
│   └── utils.ts               # Utilitários (cn helper)
├── pages/                     # Todas as páginas (134 arquivos)
├── routes/                    # Sistema de rotas
└── styles/
    ├── globals.css            # Estilos globais
    └── themes.css             # CSS variables dos temas
```

---

## 🎨 Sistema de Temas

### 6 Temas Disponíveis

1. **Neon Energy** - Cyan vibrante
2. **Midnight Aurora** - Roxo/violeta
3. **Solar Flare** - Laranja/amarelo
4. **Emerald Matrix** - Verde neon
5. **Crimson Pulse** - Vermelho intenso
6. **Arctic Frost** - Azul gelo

### CSS Variables

```css
/* Backgrounds */
--bg              /* Background principal */
--surface         /* Cards, panels */
--surface-strong  /* Hover states */

/* Texts */
--text            /* Texto principal */
--text-primary    /* Texto primário */
--text-secondary  /* Texto secundário */
--text-muted      /* Texto mutado */

/* Accents */
--accent-1        /* Primário (emerald) */
--accent-2        /* Secundário (blue) */
--accent-3        /* Terciário (purple) */
--accent-emerald  /* Verde */
--accent-sky      /* Azul */
--accent-warning  /* Amarelo */
--accent-alert    /* Vermelho */
--accent-purple   /* Roxo */
--accent-pink     /* Rosa */

/* Borders */
--border          /* Bordas padrão */
--border-strong   /* Bordas fortes */
```

### Uso

```tsx
// Em componentes
className="bg-[var(--surface)] text-[var(--text)] border-[var(--border)]"

// Em status badges
className="bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]"
```

---

## 🧩 Componentes

### shadcn/ui (Instalados)

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
// ... e mais 22 componentes
```

### Icon Design System

```tsx
import { IconInline, IconButton, IconMedallion } from '@/design-system/iconography'

// Inline com texto
<IconInline icon={Users} scale="sm" />

// Botão
<IconButton icon={Plus} variant="primary" onClick={...} />

// Badge premium
<IconMedallion icon={Trophy} rarity="legendary" aura />
```

---

## 📏 Regras de Desenvolvimento

### ❌ PROIBIDO

```tsx
// Cores hardcoded
className="bg-white"
className="bg-gray-900"
className="text-emerald-500"
style={{ color: '#10b981' }}

// Mock data
const mockData = [...]
const FAKE_USERS = [...]

// Componentes customizados desnecessários
<MeuBotaoCustomizado />
```

### ✅ OBRIGATÓRIO

```tsx
// CSS Variables
className="bg-[var(--surface)]"
className="text-[var(--accent-1)]"

// shadcn/ui
import { Button } from '@/components/ui/button'
<Button>Click me</Button>

// Dados reais do Supabase
const { data } = await supabase
  .from('tabela')
  .select('*')
  .eq('org_id', currentOrgId)
```

### Checklist Pré-Commit

```bash
# Zero cores hardcoded
grep -rn "bg-gray-\|bg-white\|text-gray-[0-9]" src/pages/
# Deve retornar vazio

# Build passa
npm run build
# Deve completar sem erros
```

---

## 📊 Progresso da Migração

### Status Atual

```
shadcn/ui: ████████████████░░░░ 43% (27/63 páginas)
```

### Páginas Migradas

- ✅ Dashboard, Leads, LeadsDetails, Pipeline, Contacts
- ✅ Tasks, Calendar, Inbox, Opportunities, Home
- ✅ Settings, Reports, Campaigns, Automacoes
- ✅ Customer360, Products, ExecutiveDashboard
- ✅ [+ páginas do Bloco 5]

### Ver Progresso Completo

```
docs/ROADMAP_TODAS_PAGINAS.md
```

---

## 📖 Documentação

| Documento | Descrição |
|-----------|-----------|
| `CLAUDE.md` | Regras para Claude Code |
| `.cursorrules` | Regras para Cursor |
| `docs/ROADMAP_TODAS_PAGINAS.md` | Inventário A-Z de páginas |
| `ALSHAM_REGRAS_INVIOLAVEIS.md` | Regras absolutas |
| `ALSHAM_MEGA_PROMPT.md` | Template para criar páginas |

---

## 🤝 Contribuindo

1. Leia `CLAUDE.md` ou `.cursorrules`
2. Siga as regras de desenvolvimento
3. Use shadcn/ui e CSS variables
4. Valide antes de commitar
5. Crie PR com descrição clara

---

## 📝 Licença

Proprietário - ALSHAM GLOBAL

---

## 🔗 Links

- **Produção:** https://app.alshamglobal.com.br
- **GitHub:** https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
- **Supabase:** [Dashboard privado]

---

**Construído com 💚 por ALSHAM Engineering**
