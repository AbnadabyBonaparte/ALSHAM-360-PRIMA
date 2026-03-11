import { describe, it, expect } from 'vitest'
import { normalizePageId, resolveRouteId, isRouteRegistered, bootstrapRoutes } from '@/routes'

describe('Route registry', () => {
  it('normalizePageId converts to kebab-case lowercase', () => {
    expect(normalizePageId('Dashboard')).toBe('dashboard')
    expect(normalizePageId('leads_lista')).toBe('leads-lista')
    expect(normalizePageId('/some-page')).toBe('some-page')
    expect(normalizePageId('  SOME PAGE  ')).toBe('some-page')
    expect(normalizePageId(null)).toBe('')
    expect(normalizePageId(undefined)).toBe('')
  })

  it('bootstrapRoutes registers known routes', () => {
    bootstrapRoutes()
    expect(isRouteRegistered('dashboard')).toBe(true)
    expect(isRouteRegistered('leads-lista')).toBe(true)
    expect(isRouteRegistered('pipeline-vendas')).toBe(true)
  })

  it('resolveRouteId handles aliases', () => {
    bootstrapRoutes()
    expect(resolveRouteId('home')).toBe('dashboard')
    expect(resolveRouteId('leads')).toBe('leads-lista')
    expect(resolveRouteId('pipeline')).toBe('pipeline-vendas')
  })

  it('resolveRouteId returns null for unknown routes', () => {
    expect(resolveRouteId('nonexistent-xyz-999')).toBeNull()
  })
})
