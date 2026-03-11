import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/supabase/useAuthStore'

const KEY = 'contacts'

export function useContacts() {
  const orgId = useAuthStore((s) => s.currentOrgId)

  return useQuery({
    queryKey: [KEY, orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('org_id', orgId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!orgId,
  })
}
