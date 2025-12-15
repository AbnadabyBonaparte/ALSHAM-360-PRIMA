// src/routes/index.tsx
import type { ComponentType, ReactNode } from 'react'
import React, { Suspense, lazy, type LazyExoticComponent } from 'react'
import UnderConstruction from '@/pages/UnderConstruction'
import { pagesList } from './pagesList'

export type RouteLoader = () => Promise<{ default: ComponentType<any> }>

interface RouteOptions {
  label?: string
  aliases?: string[]
  placeholder?: boolean
}

interface RegisteredRoute {
  id: string
  loader: RouteLoader
  label?: string
  aliases: Set<string>
  placeholder: boolean
}

const routeRegistry = new Map<string, RegisteredRoute>()
const aliasRegistry = new Map<string, string>()
const lazyCache = new Map<string, LazyExoticComponent<ComponentType<any>>>()

const DEFAULT_ROUTE_ID = 'dashboard'

/**
 * Normaliza ids vindos de:
 * - Sidebar (ids em pt-BR / underscores / espaços)
 * - URL params
 * - chamadas internas
 *
 * Regras:
 * - remove "/" inicial
 * - converte espaços/underscores em "-"
 * - lower-case
 */
export function normalizePageId(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return ''
  const withoutLeadingSlash = trimmed.replace(/^\/+/, '')
  const kebabed = withoutLeadingSlash.replace(/[_\s]+/g, '-')
  return kebabed.toLowerCase()
}

/**
 * Alias “compatibility layer” (Sidebar -> canonical registry id)
 * Aqui é onde você ganha estabilidade bilionária: SSOT único e explícito.
 */
const COMPATIBILITY_ALIASES: Record<string, string> = {
  // Dashboard
  'dashboard-principal': 'dashboard',
  'dashboard_principal': 'dashboard',
  dashboardprincipal: 'dashboard',
  home: 'dashboard',
  inicio: 'dashboard',
  main: 'dashboard',

  // CRM Core (ids da sidebar)
  'leads-lista': 'leads-lista',
  'leads_lista': 'leads-lista',
  leadslita: 'leads-lista',

  'leads-detalhes': 'leads-detalhes',
  'leads_detalhes': 'leads-detalhes',
  leaddetails: 'leads-detalhes',

  // branding / themes
  'branding-personalizado': 'themes',
  'branding_personalizado': 'themes',

  // extras
  metaverse: 'metaverse',
}

/**
 * Gera variações para tornar ids resilientes:
 * ex: "leads-lista" <-> "leads_lista" <-> "leadslita" etc.
 */
function derivedAliases(id: string): string[] {
  const base = normalizePageId(id)
  if (!base) return []
  const variations = new Set<string>([
    base,
    base.replace(/-/g, '_'),
    base.replace(/_/g, '-'),
    base.replace(/[-_]/g, ''),
  ])
  return Array.from(variations)
}

/**
 * Registra alias e suas variações para um id canônico.
 */
function registerAlias(canonicalId: string, alias: string) {
  const a = normalizePageId(alias)
  if (!a) return
  aliasRegistry.set(a, canonicalId)
  for (const v of derivedAliases(a)) {
    aliasRegistry.set(v, canonicalId)
  }
}

function clearAliasesFor(canonicalId: string) {
  for (const [alias, target] of aliasRegistry.entries()) {
    if (target === canonicalId && alias !== canonicalId) {
      aliasRegistry.delete(alias)
    }
  }
}

function createPlaceholderLoader(label: string): RouteLoader {
  const Placeholder = () => <UnderConstruction pageName={label} />
  Placeholder.displayName = `UnderConstruction(${label})`
  return () => Promise.resolve({ default: Placeholder })
}

export function registerRoute(id: string, loader: RouteLoader, options?: RouteOptions): string {
  const canonicalId = normalizePageId(id)
  if (!canonicalId) {
    throw new Error('[routes] registerRoute requer um id não vazio')
  }

  const previousEntry = routeRegistry.get(canonicalId)
  const entry: RegisteredRoute = {
    id: canonicalId,
    loader,
    label: options?.label ?? previousEntry?.label,
    aliases: new Set<string>(),
    placeholder: options?.placeholder ?? previousEntry?.placeholder ?? false,
  }

  routeRegistry.set(canonicalId, entry)
  lazyCache.delete(canonicalId)

  clearAliasesFor(canonicalId)
  registerAlias(canonicalId, canonicalId)

  const aliasCandidates = [...(options?.aliases ?? []), ...derivedAliases(id)]
  for (const alias of aliasCandidates) {
    const a = normalizePageId(alias)
    if (!a || a === canonicalId) continue
    entry.aliases.add(a)
    registerAlias(canonicalId, a)
  }

  return canonicalId
}

export function unregisterRoute(id: string) {
  const canonicalId = normalizePageId(id)
  if (!canonicalId) return
  routeRegistry.delete(canonicalId)
  lazyCache.delete(canonicalId)

  for (const [alias, target] of aliasRegistry.entries()) {
    if (target === canonicalId) aliasRegistry.delete(alias)
  }
}

export function listRegisteredRoutes(): string[] {
  return Array.from(routeRegistry.keys())
}

/**
 * Resolve candidate -> canonical route id
 * Ordem:
 * 1) normalização
 * 2) COMPATIBILITY_ALIASES
 * 3) match direto no registry
 * 4) aliasRegistry
 * 5) variações
 */
export function resolveRouteId(candidate: string | null | undefined): string | null {
  const normalized = normalizePageId(candidate)
  if (!normalized) {
    return routeRegistry.has(DEFAULT_ROUTE_ID) ? DEFAULT_ROUTE_ID : null
  }

  const compatibilityTarget = COMPATIBILITY_ALIASES[normalized]
  const candidateId = compatibilityTarget ? normalizePageId(compatibilityTarget) : normalized

  if (routeRegistry.has(candidateId)) return candidateId

  const directAlias = aliasRegistry.get(candidateId)
  if (directAlias) return directAlias

  for (const v of derivedAliases(candidateId)) {
    if (routeRegistry.has(v)) return v
    const aliased = aliasRegistry.get(v)
    if (aliased) return aliased
  }

  return null
}

export function resolveRouteOrDefault(candidate: string | null | undefined): string {
  const resolved = resolveRouteId(candidate)
  if (resolved) return resolved

  if (candidate) {
    console.warn(`[routes] rota "${candidate}" não encontrada. Redirecionando para "${DEFAULT_ROUTE_ID}".`)
  }

  return DEFAULT_ROUTE_ID
}

/**
 * Canonicaliza sem “inventar” id novo:
 * - se resolver, retorna canônico
 * - se não resolver, retorna o normalized (ou DEFAULT)
 */
export function canonicalizeRouteId(candidate: string | null | undefined): string {
  const normalized = normalizePageId(candidate)
  if (!normalized) return DEFAULT_ROUTE_ID
  return resolveRouteId(normalized) ?? normalized
}

export function getDefaultRouteId() {
  return DEFAULT_ROUTE_ID
}

export async function prefetchRoute(id: string) {
  const canonical = resolveRouteId(id)
  if (!canonical) return
  const entry = routeRegistry.get(canonical)
  if (!entry) return

  try {
    ensureLazyComponent(canonical)
    await entry.loader()
  } catch (error) {
    console.warn(`[routes] falha ao pré-carregar rota "${canonical}":`, error)
  }
}

export function renderPage(activePage: string | null | undefined): ReactNode {
  const resolvedId = resolveRouteOrDefault(activePage)
  const LazyComponent = ensureLazyComponent(resolvedId)

  if (LazyComponent) {
    return (
      <Suspense fallback={<div className="p-6 text-[var(--text-secondary)]">Carregando…</div>}>
        <LazyComponent />
      </Suspense>
    )
  }

  const fallbackLabel = getFallbackLabel(activePage)
  return <UnderConstruction pageName={fallbackLabel} />
}

function ensureLazyComponent(id: string) {
  const cached = lazyCache.get(id)
  if (cached) return cached

  const entry = routeRegistry.get(id)
  if (!entry) return null

  const LazyComponent = lazy(entry.loader)
  lazyCache.set(id, LazyComponent)
  return LazyComponent
}

function getFallbackLabel(identifier: string | null | undefined): string {
  const canonical = resolveRouteId(identifier)
  if (canonical) {
    const entry = routeRegistry.get(canonical)
    if (entry?.label) return entry.label
  }

  const normalized = normalizePageId(identifier)
  const fromPagesList = pagesList.find((page) => normalizePageId(page.id) === normalized)
  if (fromPagesList) return fromPagesList.label

  if (identifier && identifier.trim().length > 0) return identifier
  return 'Página'
}

/**
 * Real routes MUST be registered first (before placeholders).
 */
function bootstrapRealRoutes() {
  registerRoute('dashboard', () => import('@/pages/Dashboard'), {
    label: 'Dashboard',
    aliases: ['dashboard-principal', 'home', 'inicio'],
  })

  registerRoute('customer-360', () => import('@/pages/Customer360'), {
    label: 'Customer 360',
    aliases: ['customer360', 'customer_360'],
  })

  registerRoute('leads-lista', () => import('@/pages/Leads').then((m: any) => ({ default: m.default ?? m.Leads })), {
    label: 'Leads',
    aliases: ['leads'],
  })

  registerRoute('leads-detalhes', () => import('@/pages/LeadsDetails'), {
    label: 'Detalhe do Lead',
    aliases: ['lead-details', 'lead_details'],
  })
}

function bootstrapPlaceholderRoutes() {
  for (const page of pagesList) {
    const canonicalId = normalizePageId(page.id)
    if (!canonicalId) continue
    if (!routeRegistry.has(canonicalId)) {
      registerRoute(page.id, createPlaceholderLoader(page.label), {
        label: page.label,
        placeholder: true,
      })
    }
  }
}

bootstrapRealRoutes()
bootstrapPlaceholderRoutes()
