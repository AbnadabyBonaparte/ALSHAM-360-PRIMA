# PAGE-PATTERN.md — Como construir uma página real (padrão canônico)

> Objetivo: qualquer agente/dev cria uma nova página **igual às outras**, sem divergir.
> Este é o padrão usado no LOTE 1 (Contatos, Contas, Oportunidades, Campanhas,
> Notificações, Leaderboards, Badges, Usuários, Funções/Permissões, AI Insights).
> Referência viva: `src/pages/ContactsList.tsx`.

## Regras não-negociáveis (CLAUDE.md)

1. **Dados 100% reais do Supabase**, sempre filtrados por `org_id`. Sem mock/fake/placeholder.
2. **Zero cores hardcoded** — use CSS variables (`bg-[var(--surface)]`, `text-[var(--text-primary)]`, `border-[var(--border)]`, `text-[var(--accent-1)]`, `text-[var(--accent-alert)]`...). Nada de `bg-white`, `text-gray-*`, hex.
3. **shadcn/ui** para toda UI (`@/components/ui/*`). Não crie inputs/botões nativos.
4. **3 estados obrigatórios**: loading (`PageSkeleton`), erro (`ErrorState`), vazio (`EmptyState`).

## Passo 1 — Buscar dados com o hook padrão

Use **`useOrgData`** (`src/hooks/useOrgData.ts`). Ele já injeta `.eq('org_id', currentOrgId)`,
usa React Query e só dispara quando há organização selecionada (`enabled: !!orgId`).

```tsx
import { useOrgData } from '@/hooks/useOrgData'

interface Contact { id: string; name: string; email: string | null; /* ... */ }

const { data = [], isLoading, error, refetch } = useOrgData<Contact>('contacts', {
  columns: '*',                                   // opcional
  orderBy: { column: 'created_at', ascending: false },
  limit: 200,
  filters: { status: 'active' },                  // opcional, vira .eq(key, value)
})
```

> Precisa de agregação/derivação? Faça no cliente com `useMemo` sobre `data`
> (ex.: ranking em `Leaderboards.tsx`). Precisa de lógica de query mais complexa
> (joins, `.or`, RPC)? Crie uma função em `src/lib/supabase/queries/<entidade>.ts`
> e chame-a dentro de um `useQuery` próprio — **mas nunca esqueça o `org_id`**.

## Passo 2 — Estrutura da página

```tsx
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'

export default function ContactsList() {
  const { data = [], isLoading, error, refetch } = useOrgData<Contact>('contacts', { /* ... */ })

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Contatos" description="..." />
      {/* Stat cards (KPIs derivados de data) */}
      {data.length === 0 ? (
        <EmptyState title="Nenhum contato ainda" description="..." />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4">{/* Table shadcn */}</CardContent>
        </Card>
      )}
    </div>
  )
}
```

- **Export default** obrigatório (o router faz `import('../pages/X')` e usa `.default`).
- Componentes de estado ficam em `@/components/PageStates`:
  `PageSkeleton`, `ErrorState({message,onRetry})`, `EmptyState({title,description,icon,action})`, `PageHeader({title,description,actions})`.
- Tabelas: `Table/TableHeader/TableBody/TableRow/TableHead/TableCell` de `@/components/ui/table`,
  sempre dentro de `<div className="overflow-x-auto">`.

## Passo 3 — Registrar no router (`src/routes/index.tsx`)

Dentro de `bootstrapRealRoutes()`, adicione (o `id` **deve** bater com o id do link na sidebar):

```tsx
registerRoute('contatos-lista', () => import('../pages/ContactsList'), {
  label: 'Contatos',
  aliases: ['contatos', 'contacts'],
})
```

## Passo 4 — Marcar como implementada na sidebar (`src/config/sidebarStructure.tsx`)

Localize o link pelo `id` e troque o status:

```tsx
{ id: 'contatos-lista', label: 'Lista de Contatos', status: 'implemented' },
```

Isso remove o badge "Dev" e passa a rota a renderizar a página real (em vez de `UnderConstruction`).

## Evitando conflitos entre agentes em paralelo

- **Um arquivo de página por PR/rota.** Nomeie o arquivo pelo componente (`ContactsList.tsx`), não sobrescreva os stubs `createSupremePage` existentes.
- As duas edições compartilhadas — `src/routes/index.tsx` (bloco "LOTE 1") e `src/config/sidebarStructure.tsx` (uma linha `status`) — são **pontuais**. Edite apenas a(s) sua(s) linha(s) para minimizar conflitos de merge.
- Não altere `src/hooks/useOrgData.ts`, `src/components/PageStates.tsx` nem componentes `@/components/ui/*` (base).
- Consulte `src/lib/supabase/types.ts` (SSOT do schema) para os nomes/colunas reais das tabelas antes de escrever a query.

## Checklist antes do commit

- [ ] `npm run build` passa.
- [ ] `grep -n "bg-gray-\|bg-white\|text-gray-[0-9]\|#[0-9a-fA-F]\{3,6\}" src/pages/SuaPagina.tsx` vazio.
- [ ] Query tem `org_id` (via `useOrgData` ou `.eq('org_id', ...)`).
- [ ] Tem loading, erro e vazio.
- [ ] Registrada no router e marcada `implemented` na sidebar.
