// src/hooks/useOrgData.ts
// ALSHAM 360° PRIMA — Hook padrão de leitura multi-tenant.
// Toda página real de dados deve buscar via este hook para garantir:
//  - React Query (cache, retry, refetch)
//  - Filtro obrigatório por org_id (CLAUDE.md REGRA 3)
//  - enabled apenas quando há organização selecionada
//
// Uso:
//   const { data, isLoading, error, refetch } = useOrgData<Contact>('contacts', {
//     columns: 'id, name, email',
//     orderBy: { column: 'created_at', ascending: false },
//     limit: 100,
//   })

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/supabase/useAuthStore'

export interface UseOrgDataOptions {
  /** Colunas a selecionar (default '*'). */
  columns?: string
  /** Ordenação. */
  orderBy?: { column: string; ascending?: boolean }
  /** Limite de linhas. */
  limit?: number
  /** Filtros de igualdade adicionais (aplicados com .eq). */
  filters?: Record<string, string | number | boolean>
}

export function useOrgData<T = Record<string, unknown>>(
  table: string,
  options: UseOrgDataOptions = {},
) {
  const orgId = useAuthStore((s) => s.currentOrgId)
  const { columns = '*', orderBy, limit, filters } = options

  return useQuery<T[]>({
    queryKey: ['org-data', table, orgId, columns, orderBy, limit, filters],
    enabled: !!orgId,
    queryFn: async () => {
      // 🔒 org_id sempre presente — isolamento de tenant.
      let query = supabase.from(table).select(columns).eq('org_id', orgId!)

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value)
        }
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as T[]
    },
  })
}
