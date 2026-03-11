import { useAuthStore } from './useAuthStore'

/**
 * Returns the current org_id for use in queries.
 * Throws if no org is selected (should only be called in protected routes).
 */
export function getCurrentOrgId(): string {
  const orgId = useAuthStore.getState().currentOrgId
  if (!orgId) {
    throw new Error('No organization selected. Cannot perform org-scoped query.')
  }
  return orgId
}

/**
 * Returns the current org_id or null (for optional filtering).
 */
export function getCurrentOrgIdOptional(): string | null {
  return useAuthStore.getState().currentOrgId
}
