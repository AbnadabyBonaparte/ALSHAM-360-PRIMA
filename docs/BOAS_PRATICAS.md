# 📚 BOAS PRÁTICAS - ALSHAM 360° PRIMA

> Guia completo de boas práticas para desenvolvimento no projeto.

---

## 🎨 ESTILIZAÇÃO

### ✅ Correto

```tsx
// CSS Variables para cores
className="bg-[var(--surface)]"
className="text-[var(--text-primary)]"
className="border-[var(--border)]"

// Hover states
className="hover:bg-[var(--surface-strong)]"

// Status colors com opacidade
className="bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]"
```

### ❌ Errado

```tsx
// Cores hardcoded
className="bg-white"
className="bg-gray-900"
className="text-emerald-500"

// Hex colors inline
style={{ color: '#10b981' }}
style={{ backgroundColor: '#fff' }}
```

---

## 🧩 COMPONENTES

### ✅ Correto

```tsx
// Usar shadcn/ui
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

<Card>
  <CardContent>
    <Button>Click</Button>
  </CardContent>
</Card>
```

### ❌ Errado

```tsx
// Componentes customizados desnecessários
<div className="card custom-card">
<button className="btn-primary">
<span className="badge">
```

---

## 🗄️ SUPABASE

### ✅ Correto

```tsx
// SEMPRE filtrar por org_id
const { data } = await supabase
  .from('tabela')
  .select('*')
  .eq('org_id', currentOrgId)  // ⚠️ OBRIGATÓRIO
  .order('created_at', { ascending: false })

// Insert com org_id
await supabase.from('tabela').insert({
  ...formData,
  org_id: currentOrgId,  // ⚠️ OBRIGATÓRIO
  created_by: user?.id
})

// Update com dupla verificação
await supabase
  .from('tabela')
  .update(data)
  .eq('id', itemId)
  .eq('org_id', currentOrgId)  // Segurança extra
```

### ❌ Errado

```tsx
// Sem filtro de org_id
const { data } = await supabase.from('tabela').select('*')

// Insert sem org_id
await supabase.from('tabela').insert(formData)
```

---

## 📊 ESTADOS DA UI

### ✅ Correto (todos os estados)

```tsx
function MyPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Loading
  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  // Error
  if (error) {
    return (
      <Card className="border-[var(--accent-alert)]/30">
        <CardContent className="p-6">
          <p className="text-[var(--accent-alert)]">Erro: {error}</p>
          <Button onClick={refetch}>Tentar novamente</Button>
        </CardContent>
      </Card>
    )
  }

  // Empty
  if (data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Nenhum item</p>
        </CardContent>
      </Card>
    )
  }

  // Success
  return <div>{/* conteúdo */}</div>
}
```

### ❌ Errado

```tsx
// Sem tratamento de estados
function MyPage() {
  const [data, setData] = useState([])
  
  return <div>{data.map(...)}</div>  // Pode quebrar!
}
```

---

## 🔄 REALTIME

### ✅ Correto

```tsx
useEffect(() => {
  const subscription = supabase
    .channel('changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tabela' },
      (payload) => fetchData()
    )
    .subscribe()

  return () => subscription.unsubscribe()  // Cleanup!
}, [])
```

### ❌ Errado

```tsx
// Sem cleanup
useEffect(() => {
  supabase.channel('changes').on(...).subscribe()
  // Memory leak!
}, [])
```

---

## 📱 RESPONSIVIDADE

### ✅ Correto

```tsx
// Mobile-first
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// Texto responsivo
className="text-sm md:text-base lg:text-lg"

// Padding responsivo
className="p-4 md:p-6 lg:p-8"
```

### ❌ Errado

```tsx
// Tamanhos fixos
className="grid grid-cols-4"
className="w-[500px]"
```

---

## 🎬 ANIMAÇÕES

### ✅ Correto (manter existentes)

```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* conteúdo */}
</motion.div>
```

### ❌ Errado

```tsx
// Remover animações existentes
// Substituir motion por div simples
// Desabilitar transições
```

---

## 📝 NOMENCLATURA

### Arquivos

```
Páginas:     PascalCase.tsx   (Dashboard.tsx)
Componentes: PascalCase.tsx   (HeaderSupremo.tsx)
Hooks:       camelCase.ts     (useTheme.ts)
Utils:       camelCase.ts     (utils.ts)
```

### Variáveis

```tsx
// Componentes: PascalCase
function MyComponent() {}

// Funções: camelCase
function fetchData() {}
const handleSubmit = () => {}

// Constantes: SCREAMING_SNAKE_CASE
const API_URL = ''
const MAX_ITEMS = 100
```

---

## 📦 IMPORTS

### ✅ Correto (ordem)

```tsx
// 1. React
import { useState, useEffect } from 'react'

// 2. Bibliotecas externas
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// 3. shadcn/ui
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// 4. Componentes internos
import { HeaderSupremo } from '@/components/HeaderSupremo'

// 5. Hooks
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore } from '@/lib/supabase/useAuthStore'

// 6. Lib/Utils
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// 7. Types
import type { Lead } from '@/lib/supabase/types'
```

---

## 🔒 SEGURANÇA

### ✅ Correto

```tsx
// Sempre verificar autenticação
const { user, currentOrg } = useAuthStore()
if (!user || !currentOrg) return <Navigate to="/login" />

// Sanitizar inputs
const sanitizedInput = input.trim().slice(0, 255)

// Queries com org_id
.eq('org_id', currentOrgId)
```

### ❌ Errado

```tsx
// Confiar em dados do cliente
// Queries sem filtro de org
// Expor dados sensíveis no console
console.log(user.password)  // NUNCA!
```

---

## ✅ CHECKLIST

Antes de cada commit:

- [ ] Zero cores hardcoded
- [ ] Usando shadcn/ui
- [ ] Queries com org_id
- [ ] Estados tratados (loading, error, empty)
- [ ] Build passa
- [ ] Testado responsivo
- [ ] Cleanup de subscriptions

---

**Siga estas práticas em TODO o código.**
