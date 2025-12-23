# 🏗️ ALSHAM 360° PRIMA - ARQUITETURA CANÔNICA

> Este documento define a arquitetura oficial do projeto. Qualquer alteração deve seguir estas convenções.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Sistema de Rotas](#sistema-de-rotas)
4. [Sistema de Temas](#sistema-de-temas)
5. [Componentes](#componentes)
6. [Padrões de Código](#padrões-de-código)
7. [Supabase](#supabase)
8. [Convenções de Nomenclatura](#convenções-de-nomenclatura)

---

## 🎯 Visão Geral

```
ALSHAM 360° PRIMA
├── Frontend: React + TypeScript + Vite
├── Styling: Tailwind CSS + CSS Variables
├── Components: shadcn/ui (OBRIGATÓRIO)
├── Backend: Supabase (PostgreSQL + Realtime + Auth)
├── Deploy: Vercel
└── Arquitetura: Multi-tenant (org_id isolation)
```

---

## 📁 Estrutura de Pastas

```
ALSHAM-360-PRIMA/
├── .github/
│   └── copilot-instructions.md   # Instruções GitHub Copilot
├── docs/
│   └── ROADMAP_TODAS_PAGINAS.md  # Inventário de páginas
├── public/
│   └── assets/                   # Imagens estáticas
├── src/
│   ├── components/
│   │   ├── ui/                   # ⚠️ shadcn/ui (NÃO MODIFICAR)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── HeaderSupremo.tsx     # Header principal
│   │   ├── SidebarSupremo.tsx    # Sidebar principal
│   │   ├── LoadingSpinner.tsx    # Spinner de loading
│   │   └── ...
│   ├── design-system/
│   │   └── iconography/          # Icon Design System
│   │       ├── IconInline.tsx
│   │       ├── IconButton.tsx
│   │       ├── IconMedallion.tsx
│   │       ├── constants.ts
│   │       ├── types.ts
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useTheme.ts           # Hook de temas
│   │   └── use-toast.ts          # Toast notifications
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── index.ts          # Client Supabase
│   │   │   ├── queries/          # Queries organizadas
│   │   │   ├── types.ts          # Types do banco
│   │   │   └── useAuthStore.ts   # Zustand auth store
│   │   ├── themes.ts             # 6 temas definidos
│   │   ├── theme-variables.ts    # Variáveis TS
│   │   └── utils.ts              # cn() helper
│   ├── pages/                    # 134 páginas
│   │   ├── Dashboard.tsx
│   │   ├── Leads.tsx
│   │   ├── Pipeline.tsx
│   │   └── ...
│   ├── routes/
│   │   ├── index.tsx             # Router principal
│   │   └── pagesList.ts          # Lista de páginas
│   ├── styles/
│   │   ├── globals.css           # Estilos globais
│   │   └── themes.css            # CSS variables
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
├── .cursorrules                  # Regras Cursor
├── CLAUDE.md                     # Regras Claude Code
├── README.md                     # Documentação
├── components.json               # Config shadcn/ui
├── tailwind.config.js            # Config Tailwind
├── tsconfig.json                 # Config TypeScript
└── vite.config.ts                # Config Vite
```

---

## 🛣️ Sistema de Rotas

### Estrutura de URLs

```
/                       → Redirect para /dashboard
/dashboard              → Dashboard principal
/app/:pageId            → Todas as outras páginas
```

### Registro de Rotas

```tsx
// src/routes/index.tsx
registerRoute('leads', () => import('../pages/Leads'), {
  aliases: ['leads-list', 'lead-management']
})

registerRoute('pipeline', () => import('../pages/Pipeline'))
registerRoute('contacts', () => import('../pages/Contacts'))
// ...
```

### Adicionar Nova Rota

1. Criar arquivo em `src/pages/NovaPagina.tsx`
2. Registrar em `src/routes/index.tsx`
3. Adicionar no menu em `src/components/SidebarSupremo.tsx`

---

## 🎨 Sistema de Temas

### 6 Temas Disponíveis

| ID | Nome | Cor Principal |
|----|------|---------------|
| `neon-energy` | Neon Energy | Cyan (#00FFFF) |
| `midnight-aurora` | Midnight Aurora | Roxo (#8B5CF6) |
| `solar-flare` | Solar Flare | Laranja (#F97316) |
| `emerald-matrix` | Emerald Matrix | Verde (#10B981) |
| `crimson-pulse` | Crimson Pulse | Vermelho (#EF4444) |
| `arctic-frost` | Arctic Frost | Azul (#3B82F6) |

### Arquivos do Sistema de Temas

```
src/lib/themes.ts           # Definições dos temas
src/lib/theme-variables.ts  # Variáveis TypeScript
src/hooks/useTheme.ts       # Hook de controle
src/styles/themes.css       # CSS variables
```

### Uso do Hook

```tsx
import { useTheme } from '@/hooks/useTheme'

function MyComponent() {
  const { theme, setTheme, themeColors } = useTheme()
  
  // Trocar tema
  setTheme('midnight-aurora')
  
  // Usar cores em charts
  const chartColor = themeColors.accentPrimary
}
```

### CSS Variables Disponíveis

```css
/* Backgrounds */
--bg                    /* Background principal */
--background            /* Alias de --bg */
--surface               /* Cards, panels */
--surface-strong        /* Hover, active states */

/* Texts */
--text                  /* Texto principal */
--text-primary          /* Alias */
--text-secondary        /* Texto secundário */
--text-2                /* Alias de secondary */
--text-muted            /* Texto muito claro */

/* Accents */
--accent-1              /* Primário */
--accent-2              /* Secundário */
--accent-3              /* Terciário */
--accent-emerald        /* Verde */
--accent-sky            /* Azul */
--accent-warning        /* Amarelo */
--accent-alert          /* Vermelho */
--accent-purple         /* Roxo */
--accent-pink           /* Rosa */
--accent-warm           /* Laranja/Âmbar */

/* Borders */
--border                /* Bordas padrão */
--border-strong         /* Bordas destacadas */

/* Glows */
--glow-1                /* Glow primário */
--glow-2                /* Glow secundário */
--glow-3                /* Glow terciário */

/* Gradients */
--grad-primary          /* Gradiente primário */
--grad-secondary        /* Gradiente secundário */
```

---

## 🧩 Componentes

### Hierarquia de Componentes

```
1. shadcn/ui (src/components/ui/)
   └── Componentes base - NÃO MODIFICAR
   
2. Design System (src/design-system/)
   └── IconInline, IconButton, IconMedallion
   
3. Componentes do App (src/components/)
   └── HeaderSupremo, SidebarSupremo, etc.
   
4. Páginas (src/pages/)
   └── Composição dos componentes acima
```

### shadcn/ui - Componentes Instalados

```tsx
// Todos disponíveis em @/components/ui/
Alert, AlertTitle, AlertDescription
Avatar, AvatarFallback, AvatarImage
Badge
Button
Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
Checkbox
Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
Input
Label
Progress
RadioGroup, RadioGroupItem
Select, SelectContent, SelectItem, SelectTrigger, SelectValue
Separator
Skeleton
Switch
Table, TableBody, TableCell, TableHead, TableHeader, TableRow
Tabs, TabsContent, TabsList, TabsTrigger
Textarea
Toast, Toaster
```

### Icon Design System

```tsx
import { IconInline, IconButton, IconMedallion } from '@/design-system/iconography'
import { ICON_SCALES, ICON_RARITY_TOKENS } from '@/design-system/iconography'

// Escalas: xs, sm, md, lg, xl, xxl
// Raridades: common, rare, epic, legendary, divine
// Containers: none, medallion, glass, ring

<IconInline icon={Users} scale="sm" />
<IconButton icon={Plus} variant="primary" onClick={...} />
<IconMedallion icon={Trophy} scale="lg" rarity="legendary" aura />
```

---

## 📝 Padrões de Código

### Estrutura de Página

```tsx
// src/pages/NomeDaPagina.tsx

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function NomeDaPagina() {
  const { currentOrg } = useAuthStore()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentOrg) return
    fetchData()
  }, [currentOrg])

  async function fetchData() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tabela')
        .select('*')
        .eq('org_id', currentOrg.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setData(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  // Error state
  if (error) {
    return (
      <Card className="border-[var(--accent-alert)]/30">
        <CardContent className="p-6">
          <p className="text-[var(--accent-alert)]">Erro: {error}</p>
          <Button variant="outline" onClick={fetchData}>Tentar novamente</Button>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <p className="text-[var(--text-secondary)]">Nenhum item encontrado</p>
          <Button className="mt-4">Criar Novo</Button>
        </CardContent>
      </Card>
    )
  }

  // Success state
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Título</h1>
      {/* Conteúdo */}
    </div>
  )
}
```

### Classes de Estilo

```tsx
// ✅ CORRETO
className="bg-[var(--surface)] text-[var(--text)] border-[var(--border)]"
className="hover:bg-[var(--surface-strong)] transition-colors"
className="text-[var(--accent-emerald)]"

// ❌ ERRADO
className="bg-white text-gray-900 border-gray-200"
className="hover:bg-gray-50"
className="text-emerald-500"
```

---

## 🗄️ Supabase

### Conexão

```tsx
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/supabase/useAuthStore'

const { user, currentOrg, currentOrgId } = useAuthStore()
```

### Queries Padrão

```tsx
// SELECT
const { data, error } = await supabase
  .from('tabela')
  .select('*')
  .eq('org_id', currentOrgId)  // ⚠️ SEMPRE filtrar
  .order('created_at', { ascending: false })

// INSERT
const { data, error } = await supabase
  .from('tabela')
  .insert({
    ...formData,
    org_id: currentOrgId,  // ⚠️ SEMPRE incluir
    created_by: user?.id
  })
  .select()
  .single()

// UPDATE
const { data, error } = await supabase
  .from('tabela')
  .update(formData)
  .eq('id', itemId)
  .eq('org_id', currentOrgId)  // ⚠️ Segurança extra
  .select()
  .single()

// DELETE
const { error } = await supabase
  .from('tabela')
  .delete()
  .eq('id', itemId)
  .eq('org_id', currentOrgId)  // ⚠️ Segurança extra
```

### Realtime Subscriptions

```tsx
useEffect(() => {
  const subscription = supabase
    .channel('tabela-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tabela' },
      (payload) => {
        console.log('Change:', payload)
        fetchData() // Refetch data
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

---

## 📛 Convenções de Nomenclatura

### Arquivos

```
Páginas:        PascalCase.tsx      (Dashboard.tsx, LeadsDetails.tsx)
Componentes:    PascalCase.tsx      (HeaderSupremo.tsx)
Hooks:          camelCase.ts        (useTheme.ts, use-toast.ts)
Utilitários:    camelCase.ts        (utils.ts, helpers.ts)
Types:          camelCase.ts        (types.ts)
```

### Variáveis e Funções

```tsx
// Componentes: PascalCase
function MyComponent() {}
const MyComponent = () => {}

// Funções: camelCase
function fetchData() {}
const handleSubmit = () => {}

// Variáveis: camelCase
const isLoading = true
const currentUser = null

// Constantes: SCREAMING_SNAKE_CASE
const API_URL = ''
const MAX_ITEMS = 100

// Types/Interfaces: PascalCase
interface User {}
type LeadStatus = 'new' | 'qualified'
```

### CSS Variables

```css
/* kebab-case com prefixo -- */
--bg
--surface
--text-primary
--accent-emerald
--border-strong
```

---

## ✅ Checklist de Qualidade

Antes de cada commit:

- [ ] Zero cores hardcoded (bg-gray, text-white, etc.)
- [ ] Usando shadcn/ui components
- [ ] Usando CSS variables
- [ ] Queries filtram por org_id
- [ ] Estados tratados (loading, error, empty, success)
- [ ] Build passa (`npm run build`)
- [ ] TypeScript sem erros

---

**Este documento é a fonte de verdade da arquitetura do projeto.**
