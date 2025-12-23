# 🎯 ALSHAM 360° PRIMA — MEGA PROMPT PARA CRIAÇÃO DE PÁGINAS

**Versão:** 1.0  
**Data:** 2025-12-19  
**Status:** CANÔNICO (SSOT)  
**Uso:** Cole este prompt no Claude Code para criar QUALQUER página do sistema

---

## 📋 INSTRUÇÕES DE USO

### Para criar uma nova página, cole:

```
Crie a página [NOME_DA_PÁGINA] seguindo a governança ALSHAM 360° PRIMA.

Consulte e siga RIGOROSAMENTE:
1. O checklist específico em: /mnt/project/__CHECKLIST_MASTER_DEFINITIVO_-_PAGINA_[CATEGORIA]__ATEMPORAL_.md
2. O sistema de rotas em: /mnt/project/__ALSHAM_360__PRIMA___CANONICAL_APP_ROUT.md
3. O sistema de temas em: /mnt/project/ALSHAM_THEME_SYSTEM_CANONICAL_v1.md

[INSTRUÇÕES ESPECÍFICAS DA PÁGINA - opcional]
```

---

## 🏗️ ARQUITETURA CANÔNICA DE PÁGINAS

### Estrutura de Arquivos

```
src/pages/[NomeDaPagina].tsx    ← Componente da página
src/routes/index.tsx            ← Registrar rota
src/components/SidebarSupremo.tsx ← Adicionar no menu (se necessário)
```

### Template Base de Página

```tsx
// src/pages/[NomeDaPagina].tsx
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

// ✅ SHADCN/UI - Componentes Base
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Badge,
  Skeleton
} from '@/components/ui'

// ✅ ICON DESIGN SYSTEM
import { IconInline, IconButton, IconMedallion } from '@/design-system/iconography'

// ✅ LUCIDE ICONS (padrão do projeto)
import { Plus, Search, Filter, MoreVertical, Edit, Trash2 } from 'lucide-react'

// ✅ TOAST NOTIFICATIONS
import { useToast } from '@/hooks/use-toast'

export default function NomeDaPagina() {
  // ========================================
  // 🔐 AUTH & ORG
  // ========================================
  const { user, currentOrgId } = useAuthStore()
  
  // ========================================
  // 📊 STATE
  // ========================================
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // ========================================
  // 🔔 TOAST
  // ========================================
  const { toast } = useToast()

  // ========================================
  // 📥 FETCH DATA
  // ========================================
  useEffect(() => {
    if (!currentOrgId) return
    
    async function fetchData() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('sua_tabela')
          .select('*')
          .eq('org_id', currentOrgId)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setData(data || [])
      } catch (err: any) {
        setError(err.message)
        toast({
          title: 'Erro ao carregar dados',
          description: err.message,
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [currentOrgId])

  // ========================================
  // 🎨 RENDER
  // ========================================
  
  // Loading State
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <Card className="m-6 border-[var(--accent-alert)]/30">
        <CardContent className="p-6">
          <p className="text-[var(--accent-alert)]">Erro: {error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Empty State
  if (data.length === 0) {
    return (
      <div className="p-6">
        <Card className="border-dashed border-2 border-[var(--border)]">
          <CardContent className="p-12 text-center">
            <IconMedallion 
              icon={Plus} 
              scale="xl" 
              rarity="common" 
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
              Nenhum registro encontrado
            </h3>
            <p className="text-[var(--text-2)] mb-4">
              Comece criando seu primeiro registro.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main Content
  return (
    <div className="p-6 space-y-6">
      {/* ========================================
          📌 HEADER DA PÁGINA
          ======================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            Título da Página
          </h1>
          <p className="text-[var(--text-2)]">
            Descrição breve do que esta página faz.
          </p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo
        </Button>
      </div>

      {/* ========================================
          🔍 FILTROS E BUSCA
          ======================================== */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ========================================
          📊 TABELA DE DADOS
          ======================================== */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data
              .filter(item => 
                item.name?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <IconButton
                        icon={Edit}
                        scale="sm"
                        variant="ghost"
                        aria-label="Editar"
                        onClick={() => {/* handleEdit */}}
                      />
                      <IconButton
                        icon={Trash2}
                        scale="sm"
                        variant="ghost"
                        aria-label="Excluir"
                        onClick={() => {/* handleDelete */}}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
```

---

## 🎨 REGRAS DE ESTILIZAÇÃO

### ✅ USAR (CSS Variables do Tema)

```tsx
// Backgrounds
className="bg-[var(--bg)]"
className="bg-[var(--surface)]"
className="bg-[var(--surface-strong)]"

// Textos
className="text-[var(--text)]"
className="text-[var(--text-2)]"
className="text-[var(--text-muted)]"

// Acentos
className="text-[var(--accent-1)]"  // Primário (emerald)
className="text-[var(--accent-2)]"  // Secundário (blue)
className="text-[var(--accent-3)]"  // Terciário (purple)
className="text-[var(--accent-warm)]"  // Quente (amber)
className="text-[var(--accent-alert)]" // Alerta (red)

// Bordas
className="border-[var(--border)]"
className="border-[var(--border-strong)]"

// Gradientes
className="bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)]"

// Glows
className="shadow-[0_0_20px_var(--glow-1)]"
```

### ❌ NÃO USAR (Cores Hardcoded)

```tsx
// ❌ PROIBIDO
className="bg-gray-900"
className="text-emerald-500"
className="border-blue-500"
style={{ color: '#10b981' }}
```

---

## 🧩 COMPONENTES SHADCN/UI DISPONÍVEIS

### Importação Correta

```tsx
import { 
  // Botões
  Button,
  
  // Cards
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  
  // Formulários
  Input, Textarea, Label, Checkbox, Switch,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  RadioGroup, RadioGroupItem,
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  
  // Tabelas
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
  
  // Modais
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  
  // Menus
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  
  // Feedback
  Alert, AlertTitle, AlertDescription,
  Badge,
  Progress,
  Skeleton,
  
  // Navegação
  Tabs, TabsList, TabsTrigger, TabsContent,
  
  // Layout
  Separator,
  Avatar, AvatarImage, AvatarFallback,
  
} from '@/components/ui'
```

---

## 🎖️ ICON DESIGN SYSTEM

### Componentes Disponíveis

```tsx
import { 
  IconInline,    // Ícone inline com texto
  IconButton,    // Botão com ícone
  IconMedallion, // Badge premium com raridade
  
  // Constantes
  ICON_SCALES,        // xs, sm, md, lg, xl, xxl
  ICON_RARITY_TOKENS, // common, rare, epic, legendary, divine
  ICON_CONTAINERS,    // none, medallion, glass, ring
} from '@/design-system/iconography'
```

### Uso Correto

```tsx
// Ícone inline com texto
<IconInline icon={Users} scale="sm" />

// Botão com ícone
<IconButton 
  icon={Plus} 
  label="Criar" 
  variant="primary" 
  onClick={handleCreate}
/>

// Badge de conquista
<IconMedallion 
  icon={Trophy}
  scale="lg"
  rarity="legendary"
  container="glass"
  aura={true}
/>
```

---

## 🛣️ REGISTRO DE ROTAS

### 1. Registrar no Router

```tsx
// src/routes/index.tsx
registerRoute('minha-pagina', () => import('../pages/MinhaPagina'), {
  aliases: ['minha-pagina-alias']
})
```

### 2. Adicionar no Menu (se necessário)

```tsx
// src/components/SidebarSupremo.tsx
// Adicionar na estrutura do menu
{
  id: 'minha-pagina',
  label: 'Minha Página',
  icon: IconComponent,
  // children: [...] se tiver submenus
}
```

### 3. URL Final

```
/app/minha-pagina
```

---

## 📊 PADRÕES DE DADOS SUPABASE

### Fetch Padrão

```tsx
const { data, error } = await supabase
  .from('tabela')
  .select('*')
  .eq('org_id', currentOrgId)  // ⚠️ SEMPRE FILTRAR POR ORG_ID
  .order('created_at', { ascending: false })
```

### Insert Padrão

```tsx
const { data, error } = await supabase
  .from('tabela')
  .insert({
    org_id: currentOrgId,  // ⚠️ SEMPRE INCLUIR ORG_ID
    ...formData,
    created_by: user?.id,
  })
  .select()
  .single()
```

### Update Padrão

```tsx
const { data, error } = await supabase
  .from('tabela')
  .update(formData)
  .eq('id', itemId)
  .eq('org_id', currentOrgId)  // ⚠️ SEGURANÇA EXTRA
  .select()
  .single()
```

### Delete Padrão

```tsx
const { error } = await supabase
  .from('tabela')
  .delete()
  .eq('id', itemId)
  .eq('org_id', currentOrgId)  // ⚠️ SEGURANÇA EXTRA
```

---

## 📝 TIPOS DE PÁGINAS

### 1. ListPage (Tabela + CRUD)
- Usado para: Leads, Contacts, Orders, Invoices
- Componentes: Table, Dialog, Form, Search, Filters

### 2. DashboardPage (Métricas + Gráficos)
- Usado para: Dashboard, Analytics, Executive Dashboard
- Componentes: Card, Charts (recharts/chart.js), KPIs

### 3. DetailPage (Visualização de Registro)
- Usado para: Lead Detail, Customer 360, Deal Detail
- Componentes: Tabs, Timeline, Cards, Actions

### 4. FormPage (Criação/Edição)
- Usado para: Create Lead, Edit Customer, Settings
- Componentes: Form, Input, Select, Button

### 5. KanbanPage (Drag & Drop)
- Usado para: Pipeline, Tasks, Projects
- Componentes: react-beautiful-dnd, Card, Badge

### 6. GamificationPage (XP, Badges, Ranking)
- Usado para: Achievements, Leaderboards
- Componentes: IconMedallion, Progress, Badge

---

## ✅ CHECKLIST PRÉ-COMMIT

Antes de fazer commit de uma nova página, verificar:

- [ ] Usa componentes shadcn/ui (não criar componentes customizados)
- [ ] Usa CSS variables do tema (não cores hardcoded)
- [ ] Usa Icon Design System para ícones especiais
- [ ] Filtra por `org_id` em todas as queries
- [ ] Tem estados: loading, error, empty, success
- [ ] Tem toast notifications para feedback
- [ ] Está registrada no router (`/app/page-id`)
- [ ] TypeScript sem erros
- [ ] Build passa (`npm run build`)

---

## 📁 DOCUMENTOS DE REFERÊNCIA

| Documento | Caminho |
|-----------|---------|
| Sistema de Temas | `/mnt/project/ALSHAM_THEME_SYSTEM_CANONICAL_v1.md` |
| Rotas Canônicas | `/mnt/project/__ALSHAM_360__PRIMA___CANONICAL_APP_ROUT.md` |
| Checklist Dashboard | `/mnt/project/__CHECKLIST_MASTER_DEFINITIVO_-_PAGINA_DASHBOARD__ATEMPORAL_.md` |
| Checklist Leads | `/mnt/project/__CHECKLIST_MASTER_DEFINITIVO_-_PAGINA_LEADS__ATEMPORAL_.md` |
| Checklist Pipeline | `/mnt/project/__CHECKLIST_MASTER_DEFINITIVO_-_PAGINA_PIPELINE__ATEMPORAL_.md` |
| Checklist Automações | `/mnt/project/__CHECKLIST_MASTER_DEFINITIVO_-_PAGINA_AUTOMAÇOES__ATEMPORAL_.md` |
| Checklist Gamificação | `/mnt/project/__CHECKLIST_MASTER_DEFINITIVO_-_PAGINA_GAMIFICAÇAO__ATEMPORAL_.md` |
| Checklist Relatórios | `/mnt/project/__CHECKLIST_MASTER_DEFINITIVO_-_PAGINA_RELATORIO__ATEMPORAL_.md` |
| Visual Governance | `/mnt/project/ALSHAM_VISUAL_GOVERNANCE_BRIEF.md` |
| Requisitos Completos | `/mnt/project/Documento_Completo_de_Requisitos_Tudo_que_o_ALSHAM_360__PRIMA_Deve_Ter.md` |

---

## 🚀 EXEMPLO DE USO

### Criar página de Contacts:

```
Crie a página Contacts (Gestão de Contatos) seguindo a governança ALSHAM 360° PRIMA.

Consulte e siga RIGOROSAMENTE:
1. O checklist em: /mnt/project/__CHECKLIST_MASTER_DEFINITIVO_-_PAGINA_LEADS__ATEMPORAL_.md (usar como referência, adaptar para Contacts)
2. O sistema de rotas em: /mnt/project/__ALSHAM_360__PRIMA___CANONICAL_APP_ROUT.md
3. O sistema de temas em: /mnt/project/ALSHAM_THEME_SYSTEM_CANONICAL_v1.md

Requisitos específicos:
- Tabela contacts do Supabase
- Campos: name, email, phone, company, position, tags
- CRUD completo com Dialog para criar/editar
- Filtros por empresa e tags
- Busca por nome/email
- Registrar em /app/contacts
```

---

**Este é o MEGA PROMPT DEFINITIVO para criação de páginas governadas!**

**Autor:** ALSHAM Engineering  
**Última atualização:** 2025-12-19
