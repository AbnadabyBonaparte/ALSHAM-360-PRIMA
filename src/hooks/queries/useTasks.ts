import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/supabase/useAuthStore'

const KEY = 'tasks'

export function useTasks() {
  const orgId = useAuthStore((s) => s.currentOrgId)

  return useQuery({
    queryKey: [KEY, orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('org_id', orgId!)
        .order('due_date', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!orgId,
  })
}

export function useToggleTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}
