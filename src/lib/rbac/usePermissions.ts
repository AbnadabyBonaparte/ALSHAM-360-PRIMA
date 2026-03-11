import { useCallback } from 'react'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { hasPermission, type Permission } from './permissions'

export function usePermissions() {
  const role = useAuthStore((s) => s.roleInOrg)

  const can = useCallback(
    (permission: Permission) => hasPermission(role, permission),
    [role]
  )

  const canAny = useCallback(
    (...permissions: Permission[]) => permissions.some((p) => hasPermission(role, p)),
    [role]
  )

  const canAll = useCallback(
    (...permissions: Permission[]) => permissions.every((p) => hasPermission(role, p)),
    [role]
  )

  return { can, canAny, canAll, role }
}
