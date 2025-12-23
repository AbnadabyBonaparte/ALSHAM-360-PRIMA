// src/routes/index.tsx
// ALSHAM 360° PRIMA — ROUTE REGISTRY (SSOT)
// Canonicalização + aliases + renderPage centralizados aqui.

import React, { Suspense, lazy, type LazyExoticComponent, type ReactNode, type ComponentType } from 'react'
import UnderConstruction from '../pages/UnderConstruction'
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
 * Mapa de compatibilidade (Sidebar IDs / legados -> IDs canônicos do registry)
 * Regra: tudo em kebab-case (SSOT).
 */
const COMPATIBILITY_ALIASES: Record<string, string> = {
  // Dashboard
  'dashboard-principal': 'dashboard',
  dashboard_principal: 'dashboard',
  dashboardprincipal: 'dashboard',
  home: 'dashboard',
  inicio: 'dashboard',
  main: 'dashboard',

  // CRM core (IDs atuais do sidebar)
  'leads-lista': 'leads-lista',
  leads_lista: 'leads-lista',
  leadslita: 'leads-lista',

  'leads-detalhes': 'leads-detalhes',
  leads_detalhes: 'leads-detalhes',
  leaddetails: 'leads-detalhes',

  // Customer
  'customer-360': 'customer-360',
  customer360: 'customer-360',

  // Marketing
  ads: 'ads-manager',
  'ads-manager': 'ads-manager',
}

/**
 * Normalização oficial:
 * - remove "/" inicial
 * - converte "_" e espaços para "-"
 * - lowercase
 */
export function normalizePageId(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return ''
  const withoutLeadingSlash = trimmed.replace(/^\/+/, '')
  const kebabed = withoutLeadingSlash.replace(/[_\s]+/g, '-')
  return kebabed.toLowerCase()
}

/**
 * Deriva variações seguras para absorver diferenças de emissão (hífen/underscore/compact).
 */
function derivedAliases(id: string): string[] {
  const n = normalizePageId(id)
  if (!n) return []
  const variations = new Set<string>([
    n,
    n.replace(/-/g, '_'),
    n.replace(/_/g, '-'),
    n.replace(/[-_]/g, ''),
  ])
  return Array.from(variations).filter(Boolean)
}

function registerAlias(canonicalId: string, alias: string) {
  const a = normalizePageId(alias)
  if (!a) return

  aliasRegistry.set(a, canonicalId)

  for (const v of derivedAliases(a)) {
    if (v && v !== canonicalId) aliasRegistry.set(v, canonicalId)
  }
}

function clearAliasesFor(canonicalId: string) {
  for (const [alias, target] of aliasRegistry.entries()) {
    if (target === canonicalId && alias !== canonicalId) aliasRegistry.delete(alias)
  }
}

function createPlaceholderLoader(label: string): RouteLoader {
  const Placeholder = () => <UnderConstruction pageName={label} />
  Placeholder.displayName = `UnderConstruction(${label})`
  return () => Promise.resolve({ default: Placeholder })
}

export function registerRoute(id: string, loader: RouteLoader, options?: RouteOptions): string {
  const canonicalId = normalizePageId(id)
  if (!canonicalId) throw new Error('[routes] registerRoute requer um id não vazio')

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
  for (const candidate of aliasCandidates) {
    const a = normalizePageId(candidate)
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

export function resolveRouteId(candidate: string | null | undefined): string | null {
  const raw = normalizePageId(candidate)
  if (!raw) return routeRegistry.has(DEFAULT_ROUTE_ID) ? DEFAULT_ROUTE_ID : null

  // Compatibilidade primeiro (SSOT)
  const compat = COMPATIBILITY_ALIASES[raw]
  const base = compat ? normalizePageId(compat) : raw

  if (routeRegistry.has(base)) return base

  const direct = aliasRegistry.get(base)
  if (direct) return direct

  for (const v of derivedAliases(base)) {
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

export function canonicalizeRouteId(candidate: string | null | undefined): string {
  const n = normalizePageId(candidate)
  if (!n) return DEFAULT_ROUTE_ID
  return resolveRouteId(n) ?? n
}

export function getDefaultRouteId() {
  return DEFAULT_ROUTE_ID
}

export function listRegisteredRoutes(): string[] {
  return Array.from(routeRegistry.keys())
}

export function isRouteRegistered(id: string | null | undefined): boolean {
  return resolveRouteId(id) !== null
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
      <Suspense fallback={<div className="p-10 text-[var(--text-secondary)]">Carregando…</div>}>
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

  const n = normalizePageId(identifier)
  const fromPagesList = pagesList.find((p) => normalizePageId(p.id) === n)
  if (fromPagesList) return fromPagesList.label

  if (identifier && identifier.trim().length > 0) return identifier
  return 'Página'
}

/**
 * Real routes FIRST, placeholders AFTER (para nunca sobrescrever real).
 */
function bootstrapRealRoutes() {
  registerRoute('dashboard', () => import('../pages/Dashboard'), {
    label: 'Dashboard',
    aliases: ['dashboard-principal'],
  })

  registerRoute('customer-360', () => import('../pages/Customer360'), {
    label: 'Customer 360',
    aliases: ['customer360'],
  })

  // Leads lista
  registerRoute(
    'leads-lista',
    () =>
      import('../pages/Leads').then((m) => {
        const Component = (m as any).default ?? (m as any).Leads
        if (!Component) return createPlaceholderLoader('Leads')()
        return { default: Component }
      }),
    {
      label: 'Leads',
      aliases: ['leads'],
    },
  )

  // Leads detalhes (se o seu arquivo for outro nome, ajuste aqui)
  registerRoute('leads-detalhes', () => import('../pages/LeadsDetails'), {
    label: 'Detalhe do Lead',
    aliases: ['lead-details'],
  })

  // Theme Switcher
  registerRoute('theme-switcher', () => import('../components/ThemeSwitcher').then(m => ({ default: m.ThemeSwitcher })), {
    label: 'Temas',
    aliases: ['temas', 'themes'],
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 PÁGINAS IMPLEMENTADAS - Registradas em 2025-12-19
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Automação & IA
  registerRoute('automation-builder', () => import('../pages/AutomationBuilder'), {
    label: 'Automation Builder',
    aliases: ['automations'],
  })

  registerRoute('ai-assistant', () => import('../pages/AIAssistant'), {
    label: 'AI Assistant',
    aliases: ['assistant'],
  })

  // CRM & Vendas
  registerRoute('pipeline-vendas', () => import('../pages/Pipeline'), {
    label: 'Pipeline de Vendas',
    aliases: ['pipeline'],
  })

  registerRoute('financeiro', () => import('../pages/Financeiro'), {
    label: 'Financeiro',
    aliases: ['finance'],
  })

  // Comunicação
  registerRoute('omnichannel-inbox', () => import('../pages/OmnichannelInbox'), {
    label: 'Inbox Omnichannel',
    aliases: ['inbox'],
  })

  // Marketing
  registerRoute('ads-manager', () => import('../pages/AdsManager'), {
    label: 'Ads Manager',
    aliases: ['ads'],
  })

  registerRoute('landing-builder', () => import('../pages/LandingPageBuilder'), {
    label: 'Landing Page Builder',
    aliases: ['landing-pages-builder'],
  })

  // Gamificação
  registerRoute('nft-gallery', () => import('../pages/NFTGallery'), {
    label: 'NFT Gallery',
    aliases: ['nfts'],
  })

  registerRoute('war-arena', () => import('../pages/WarArena'), {
    label: 'War Arena',
    aliases: ['arena'],
  })

  registerRoute('achievements', () => import('../pages/Achievements'), {
    label: 'Achievements',
    aliases: ['conquistas'],
  })

  // Analytics & Relatórios
  registerRoute('executive-dashboard', () => import('../pages/ExecutiveDashboard'), {
    label: 'Executive Dashboard',
    aliases: ['executive'],
  })

  // Experiências Imersivas
  registerRoute('metaverse', () => import('../pages/Metaverse'), {
    label: 'Metaverse',
    aliases: ['metaverso'],
  })

  registerRoute('alsham-os', () => import('../pages/AlshamOS'), {
    label: 'Alsham OS',
    aliases: ['os'],
  })

  registerRoute('boardroom-omega', () => import('../pages/TheBoardroomOmega'), {
    label: 'The Boardroom Ω',
    aliases: ['boardroom'],
  })

  // Sistema & Admin
  registerRoute('api-status', () => import('../pages/APIStatus'), {
    label: 'API Status',
    aliases: ['status'],
  })
}

function bootstrapPlaceholderRoutes() {
  pagesList.forEach((page) => {
    const id = normalizePageId(page.id)
    if (!id) return
    if (!routeRegistry.has(id)) {
      registerRoute(page.id, createPlaceholderLoader(page.label), { label: page.label, placeholder: true })
    }
  })
}

bootstrapRealRoutes()
bootstrapPlaceholderRoutes()
