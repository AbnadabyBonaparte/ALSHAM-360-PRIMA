# CLAUDE.md - ALSHAM 360° PRIMA

> ⚠️ **LEIA ESTE ARQUIVO INTEIRO ANTES DE FAZER QUALQUER ALTERAÇÃO NO CÓDIGO**

---

## 🎯 SOBRE O PROJETO

**ALSHAM 360° PRIMA** é um CRM enterprise com 150+ módulos, visual cyberpunk, 6 temas dinâmicos, e arquitetura multi-tenant.

- **Stack:** React + TypeScript + Vite + Tailwind CSS + Supabase
- **Components:** shadcn/ui (instalado em `src/components/ui/`)
- **Themes:** 6 temas cyberpunk com CSS variables
- **Deploy:** Vercel (https://app.alshamglobal.com.br)

---

## 🔴 REGRAS ABSOLUTAS (NUNCA VIOLAR)

### REGRA 1: ZERO CORES HARDCODED

```tsx
// ❌ PROIBIDO - NUNCA USAR
className="bg-white"
className="bg-gray-900"
className="text-emerald-500"
className="border-blue-500"
style={{ color: '#10b981' }}

// ✅ CORRETO - SEMPRE USAR
className="bg-[var(--surface)]"
className="bg-[var(--bg)]"
className="text-[var(--accent-1)]"
className="border-[var(--border)]"
```

### REGRA 2: USAR SHADCN/UI

```tsx
// ❌ PROIBIDO - Não criar componentes customizados
<div className="card custom-card">
<button className="btn">

// ✅ CORRETO - Usar shadcn/ui
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
<Card><CardContent>...</CardContent></Card>
<Button>...</Button>
```

### REGRA 3: DADOS 100% REAIS

```tsx
// ❌ PROIBIDO - Mock data
const mockData = [{ id: 1, name: 'Fake' }]
const DUMMY_DATA = [...]

// ✅ CORRETO - Supabase real
const { data } = await supabase
  .from('tabela')
  .select('*')
  .eq('org_id', currentOrgId)  // SEMPRE filtrar por org_id
```

### REGRA 4: MANTER FUNCIONALIDADES

- ✅ MANTER animações (framer-motion)
- ✅ MANTER realtime (Supabase subscriptions)
- ✅ MANTER gráficos (Recharts/Chart.js)
- ✅ MANTER lógica de negócio
- ❌ NUNCA remover features existentes

---

## 🎨 MAPEAMENTO DE CORES

```
HARDCODED              → CSS VARIABLE
─────────────────────────────────────────────────
bg-white               → bg-[var(--surface)]
bg-gray-50/100         → bg-[var(--surface-strong)]
bg-gray-800/900        → bg-[var(--bg)]
text-white             → text-[var(--text)]
text-gray-400/500/600  → text-[var(--text-secondary)]
text-gray-900          → text-[var(--text-primary)]
border-gray-*          → border-[var(--border)]

# Status Colors
bg-green-* text-green-*    → bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]
bg-blue-* text-blue-*      → bg-[var(--accent-sky)]/10 text-[var(--accent-sky)]
bg-yellow-* text-yellow-*  → bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]
bg-red-* text-red-*        → bg-[var(--accent-alert)]/10 text-[var(--accent-alert)]
bg-purple-* text-purple-*  → bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]
```

---

## 📦 IMPORTS PADRÃO

```tsx
// shadcn/ui (usar conforme necessidade)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

// Supabase
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/supabase/useAuthStore'

// Theme
import { useTheme } from '@/hooks/useTheme'
```

---

## 📊 PROGRESSO ATUAL

```
Migração shadcn/ui: 27/63 páginas (43%)
Cores hardcoded: 0 nas páginas migradas
```

### Páginas JÁ Migradas (não alterar estrutura):
- Dashboard, Leads, LeadsDetails, Pipeline, Contacts, Tasks, Calendar
- Inbox, Opportunities, Home, Settings, Reports
- Campaigns, Automacoes, Customer360, Products, ExecutiveDashboard
- [+ páginas do Bloco 5 se foram feitas]

### Páginas FALTANDO migrar:
Ver `docs/ROADMAP_TODAS_PAGINAS.md` para lista completa.

---

## ✅ CHECKLIST PRÉ-COMMIT

Antes de QUALQUER commit, verificar:

```bash
# 1. Zero cores hardcoded
grep -rn "bg-gray-\|bg-white\|text-gray-[0-9]\|border-gray-" src/pages/[ARQUIVO].tsx
# DEVE retornar VAZIO

# 2. Tem shadcn/ui
grep -c "@/components/ui" src/pages/[ARQUIVO].tsx
# DEVE ser > 0

# 3. Build passa
npm run build
# DEVE completar sem erros
```

---

## 📁 ESTRUTURA DO PROJETO

```
src/
├── components/
│   └── ui/                 # shadcn/ui components (NÃO MODIFICAR)
├── design-system/
│   └── iconography/        # Icon Design System
├── hooks/
│   ├── useTheme.ts         # Theme hook
│   └── use-toast.ts        # Toast notifications
├── lib/
│   ├── supabase/           # Supabase client e queries
│   ├── themes.ts           # 6 temas definidos
│   └── utils.ts            # cn() helper
├── pages/                  # Todas as páginas (134 arquivos)
├── routes/                 # Sistema de rotas
└── styles/
    └── themes.css          # CSS variables
```

---

## 🚨 PALAVRAS PROIBIDAS NO CÓDIGO

Se encontrar estas palavras, o código está ERRADO:

- `mock`, `fake`, `dummy`, `sample`
- `placeholder`, `TODO`, `FIXME`
- `coming soon`, `em construção`
- `bg-gray-`, `bg-white`, `text-gray-` (cores hardcoded)

---

## 📖 DOCUMENTAÇÃO ADICIONAL

- `docs/ROADMAP_TODAS_PAGINAS.md` - Inventário completo de páginas
- `ALSHAM_REGRAS_INVIOLAVEIS_100_REAL.md` - Regras detalhadas
- `ALSHAM_MEGA_PROMPT_CRIACAO_PAGINAS.md` - Template para criar páginas

---

**LEMBRE-SE: Qualidade > Velocidade. Zero cores hardcoded. Sempre shadcn/ui.**
