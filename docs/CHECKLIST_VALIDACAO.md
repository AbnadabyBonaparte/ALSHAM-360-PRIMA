# ✅ CHECKLIST DE VALIDAÇÃO - ALSHAM 360° PRIMA

> Use este checklist ANTES de cada commit para garantir qualidade.

---

## 🔍 VALIDAÇÃO RÁPIDA (30 segundos)

```bash
# Executar no terminal - TODOS devem passar

# 1. Zero cores hardcoded (deve retornar VAZIO)
grep -rn "bg-white\|bg-gray-\|text-gray-[0-9]\|text-white\|border-gray-" src/pages/[ARQUIVO].tsx

# 2. Tem imports shadcn/ui (deve ser > 0)
grep -c "@/components/ui" src/pages/[ARQUIVO].tsx

# 3. Tem CSS variables (deve ser > 0)
grep -c "var(--" src/pages/[ARQUIVO].tsx

# 4. Build passa
npm run build
```

---

## 📋 CHECKLIST DETALHADO

### Cores e Estilo
- [ ] Zero `bg-white` ou `bg-black`
- [ ] Zero `bg-gray-*` (50, 100, 200... 900)
- [ ] Zero `text-white` ou `text-black`
- [ ] Zero `text-gray-*`
- [ ] Zero `border-gray-*`
- [ ] Zero `text-emerald-*`, `text-blue-*`, etc.
- [ ] Zero hex colors (`#fff`, `#10b981`)
- [ ] Usando `bg-[var(--surface)]` para backgrounds
- [ ] Usando `text-[var(--text)]` para textos
- [ ] Usando `border-[var(--border)]` para bordas

### Componentes
- [ ] Imports de `@/components/ui/` presentes
- [ ] Usando `<Card>` em vez de `<div className="card">`
- [ ] Usando `<Button>` em vez de `<button>`
- [ ] Usando `<Badge>` para status
- [ ] Usando `<Table>` para tabelas
- [ ] Usando `<Input>` para inputs
- [ ] Usando `<Skeleton>` para loading

### Supabase
- [ ] Queries filtram por `org_id`
- [ ] Insert inclui `org_id`
- [ ] Update inclui verificação de `org_id`
- [ ] Delete inclui verificação de `org_id`
- [ ] Error handling em todas as queries

### Estados da UI
- [ ] Estado de loading tratado
- [ ] Estado de error tratado
- [ ] Estado de empty tratado
- [ ] Estado de success funciona

### Funcionalidades
- [ ] Animações preservadas (framer-motion)
- [ ] Realtime preservado (subscriptions)
- [ ] Charts preservados (Recharts)
- [ ] Event handlers funcionando
- [ ] Lógica de negócio intacta

### Build
- [ ] `npm run build` passa sem erros
- [ ] Zero warnings de TypeScript
- [ ] Console sem erros no browser

---

## 🎨 VERIFICAÇÃO DE TEMA

Testar a página em TODOS os 6 temas:

- [ ] Neon Energy (cyan)
- [ ] Midnight Aurora (roxo)
- [ ] Solar Flare (laranja)
- [ ] Emerald Matrix (verde)
- [ ] Crimson Pulse (vermelho)
- [ ] Arctic Frost (azul)

---

## 📝 FORMATO DO COMMIT

```bash
# Formato
git commit -m "tipo(escopo): descrição

- Detalhe 1
- Detalhe 2"

# Exemplo
git commit -m "refactor(Leads): migrar para shadcn/ui

- Substituir cores hardcoded por CSS variables
- Adicionar Card, Button, Badge, Table
- Preservar funcionalidades e animações
- Zero cores hardcoded"
```

### Tipos de Commit
- `feat` - Nova feature
- `fix` - Bug fix
- `refactor` - Refatoração/migração
- `docs` - Documentação
- `style` - Formatação
- `test` - Testes
- `chore` - Manutenção

---

## 🚨 SE ENCONTRAR PROBLEMAS

### Cores Hardcoded
```bash
# Encontrar todas as ocorrências
grep -rn "bg-gray-" src/pages/[ARQUIVO].tsx

# Substituir por CSS variable
bg-gray-900 → bg-[var(--bg)]
bg-gray-50 → bg-[var(--surface-strong)]
bg-white → bg-[var(--surface)]
```

### Falta shadcn/ui
```tsx
// Adicionar imports no topo
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
```

### Build Falha
```bash
# Ver erros detalhados
npm run build 2>&1 | head -50

# Verificar tipos
npx tsc --noEmit
```

---

## ✅ APROVAÇÃO FINAL

Só fazer commit se TODOS os itens passarem:

```
[✓] Zero cores hardcoded
[✓] Usando shadcn/ui
[✓] Usando CSS variables
[✓] Queries com org_id
[✓] Estados tratados
[✓] Build passa
[✓] Testado nos 6 temas
[✓] Funcionalidades preservadas
```

---

**NÃO PULE ESTA VALIDAÇÃO!**
