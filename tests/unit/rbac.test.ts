import { describe, it, expect } from 'vitest'
import { hasPermission, getPermissionsForRole } from '@/lib/rbac/permissions'

describe('RBAC permissions', () => {
  it('owner has all permissions via admin:full', () => {
    expect(hasPermission('owner', 'leads:view')).toBe(true)
    expect(hasPermission('owner', 'admin:full')).toBe(true)
    expect(hasPermission('owner', 'settings:edit')).toBe(true)
    expect(hasPermission('owner', 'financeiro:edit')).toBe(true)
  })

  it('admin has granular permissions but not admin:full', () => {
    expect(hasPermission('admin', 'leads:view')).toBe(true)
    expect(hasPermission('admin', 'leads:delete')).toBe(true)
    expect(hasPermission('admin', 'settings:edit')).toBe(true)
    expect(hasPermission('admin', 'users:manage')).toBe(true)
  })

  it('viewer has read-only permissions', () => {
    expect(hasPermission('viewer', 'leads:view')).toBe(true)
    expect(hasPermission('viewer', 'leads:create')).toBe(false)
    expect(hasPermission('viewer', 'leads:edit')).toBe(false)
    expect(hasPermission('viewer', 'leads:delete')).toBe(false)
    expect(hasPermission('viewer', 'settings:edit')).toBe(false)
  })

  it('member can create and edit but not delete or manage', () => {
    expect(hasPermission('member', 'leads:create')).toBe(true)
    expect(hasPermission('member', 'leads:edit')).toBe(true)
    expect(hasPermission('member', 'leads:delete')).toBe(false)
    expect(hasPermission('member', 'users:manage')).toBe(false)
  })

  it('null/undefined role has no permissions', () => {
    expect(hasPermission(null, 'leads:view')).toBe(false)
    expect(hasPermission(undefined, 'leads:view')).toBe(false)
    expect(hasPermission('', 'leads:view')).toBe(false)
  })

  it('getPermissionsForRole returns correct array', () => {
    const viewerPerms = getPermissionsForRole('viewer')
    expect(viewerPerms).toContain('dashboard:view')
    expect(viewerPerms).toContain('leads:view')
    expect(viewerPerms).not.toContain('leads:create')
  })
})
