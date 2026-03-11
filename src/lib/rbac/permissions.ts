export type Role = 'owner' | 'admin' | 'manager' | 'member' | 'viewer'

export type Permission =
  | 'dashboard:view'
  | 'leads:view' | 'leads:create' | 'leads:edit' | 'leads:delete'
  | 'contacts:view' | 'contacts:create' | 'contacts:edit' | 'contacts:delete'
  | 'pipeline:view' | 'pipeline:edit'
  | 'campaigns:view' | 'campaigns:create' | 'campaigns:edit'
  | 'reports:view' | 'reports:export'
  | 'settings:view' | 'settings:edit'
  | 'financeiro:view' | 'financeiro:edit'
  | 'users:view' | 'users:invite' | 'users:manage'
  | 'admin:full'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['admin:full'],
  admin: [
    'dashboard:view', 'leads:view', 'leads:create', 'leads:edit', 'leads:delete',
    'contacts:view', 'contacts:create', 'contacts:edit', 'contacts:delete',
    'pipeline:view', 'pipeline:edit',
    'campaigns:view', 'campaigns:create', 'campaigns:edit',
    'reports:view', 'reports:export',
    'settings:view', 'settings:edit',
    'financeiro:view', 'financeiro:edit',
    'users:view', 'users:invite', 'users:manage',
  ],
  manager: [
    'dashboard:view', 'leads:view', 'leads:create', 'leads:edit',
    'contacts:view', 'contacts:create', 'contacts:edit',
    'pipeline:view', 'pipeline:edit',
    'campaigns:view', 'campaigns:create', 'campaigns:edit',
    'reports:view', 'reports:export',
    'settings:view',
    'financeiro:view',
    'users:view', 'users:invite',
  ],
  member: [
    'dashboard:view', 'leads:view', 'leads:create', 'leads:edit',
    'contacts:view', 'contacts:create', 'contacts:edit',
    'pipeline:view', 'pipeline:edit',
    'campaigns:view',
    'reports:view',
  ],
  viewer: [
    'dashboard:view', 'leads:view', 'contacts:view',
    'pipeline:view', 'campaigns:view', 'reports:view',
  ],
}

export function hasPermission(role: Role | string | null | undefined, permission: Permission): boolean {
  if (!role) return false
  const r = role as Role
  if (!ROLE_PERMISSIONS[r]) return false
  if (ROLE_PERMISSIONS[r].includes('admin:full' as Permission)) return true
  return ROLE_PERMISSIONS[r].includes(permission)
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}
