import type { ComponentType, ReactNode } from "react";
import { Suspense, lazy, type LazyExoticComponent } from "react";
import UnderConstruction from "../pages/UnderConstruction";
import { pagesList } from "./pagesList";

export type RouteLoader = () => Promise<{ default: ComponentType<any> }>;

interface RouteOptions {
  label?: string;
  aliases?: string[];
  placeholder?: boolean;
}

interface RegisteredRoute {
  id: string;
  loader: RouteLoader;
  label?: string;
  aliases: Set<string>;
  placeholder: boolean;
}

const routeRegistry = new Map<string, RegisteredRoute>();
const aliasRegistry = new Map<string, string>();
const lazyCache = new Map<string, LazyExoticComponent<ComponentType<any>>>();

const DEFAULT_ROUTE_ID = "dashboard";

function normaliseIdentifier(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function derivedAliases(id: string): string[] {
  const trimmed = id.trim();
  const withDashes = trimmed.replace(/\s+/g, "-");
  const slug = withDashes.replace(/[^a-zA-Z0-9/_-]+/g, "-");
  const variations = new Set<string>([
    normaliseIdentifier(trimmed),
    normaliseIdentifier(withDashes),
    normaliseIdentifier(slug),
    normaliseIdentifier(slug.replace(/-/g, "_")),
    normaliseIdentifier(slug.replace(/_/g, "-")),
    normaliseIdentifier(slug.replace(/[-_]/g, "")),
  ]);
  variations.delete("");
  return Array.from(variations);
}

/**
 * Registra um alias e também variações derivadas do alias.
 * Isso evita "travamento" quando a UI manda ids em formatos diferentes (hífen vs underscore).
 */
function registerAlias(canonicalId: string, alias: string) {
  const normalisedAlias = normaliseIdentifier(alias);
  if (!normalisedAlias) return;

  // alias direto
  aliasRegistry.set(normalisedAlias, canonicalId);

  // variações (ex: leads-lista, leads_lista, leadslita)
  for (const v of derivedAliases(normalisedAlias)) {
    if (v && v !== canonicalId) {
      aliasRegistry.set(v, canonicalId);
    }
  }
}

function clearAliasesFor(canonicalId: string) {
  for (const [alias, target] of aliasRegistry.entries()) {
    if (target === canonicalId && alias !== canonicalId) {
      aliasRegistry.delete(alias);
    }
  }
}

function createPlaceholderLoader(label: string): RouteLoader {
  const Placeholder = () => <UnderConstruction pageName={label} />;
  Placeholder.displayName = `UnderConstruction(${label})`;
  return () =>
    Promise.resolve({
      default: Placeholder,
    });
}

export function registerRoute(id: string, loader: RouteLoader, options?: RouteOptions): string {
  const canonicalId = normaliseIdentifier(id);
  if (!canonicalId) {
    throw new Error("[routes] registerRoute requer um id não vazio");
  }

  const previousEntry = routeRegistry.get(canonicalId);
  const entry: RegisteredRoute = {
    id: canonicalId,
    loader,
    label: options?.label ?? previousEntry?.label,
    aliases: new Set<string>(),
    placeholder: options?.placeholder ?? previousEntry?.placeholder ?? false,
  };

  routeRegistry.set(canonicalId, entry);
  lazyCache.delete(canonicalId);

  clearAliasesFor(canonicalId);
  registerAlias(canonicalId, canonicalId);

  const aliasCandidates = [...derivedAliases(id), ...(options?.aliases ?? [])];

  aliasCandidates.forEach((alias) => {
    const normalisedAlias = normaliseIdentifier(alias);
    if (!normalisedAlias || normalisedAlias === canonicalId) return;

    entry.aliases.add(normalisedAlias);
    registerAlias(canonicalId, normalisedAlias);
  });

  if (!entry.placeholder) {
    const baseSegment = canonicalId.split(/[-/]/)[0];
    if (baseSegment && baseSegment !== canonicalId) {
      const baseRoute = routeRegistry.get(baseSegment);
      if (baseRoute?.placeholder) {
        unregisterRoute(baseSegment);
        entry.aliases.add(baseSegment);
        registerAlias(canonicalId, baseSegment);
      } else if (!aliasRegistry.has(baseSegment)) {
        entry.aliases.add(baseSegment);
        registerAlias(canonicalId, baseSegment);
      }
    }
  }

  return canonicalId;
}

export function unregisterRoute(id: string) {
  const canonicalId = normaliseIdentifier(id);
  if (!canonicalId) return;

  routeRegistry.delete(canonicalId);
  lazyCache.delete(canonicalId);

  for (const [alias, target] of aliasRegistry.entries()) {
    if (target === canonicalId) {
      aliasRegistry.delete(alias);
    }
  }
}

export function isRouteRegistered(id: string | null | undefined): boolean {
  return resolveRouteId(id) !== null;
}

export function listRegisteredRoutes(): string[] {
  return Array.from(routeRegistry.keys());
}

/**
 * Resolve rota tentando:
 * 1) match direto
 * 2) alias direto
 * 3) variações do candidate (hífen/underscore/compact)
 */
export function resolveRouteId(candidate: string | null | undefined): string | null {
  const normalised = normaliseIdentifier(candidate);
  if (!normalised) {
    return routeRegistry.has(DEFAULT_ROUTE_ID) ? DEFAULT_ROUTE_ID : null;
  }

  if (routeRegistry.has(normalised)) {
    return normalised;
  }

  const directAlias = aliasRegistry.get(normalised);
  if (directAlias) {
    return directAlias;
  }

  // Variações para evitar "travamento" em ids emitidos pelo Sidebar
  const variations = derivedAliases(normalised);
  for (const v of variations) {
    if (routeRegistry.has(v)) return v;
    const aliased = aliasRegistry.get(v);
    if (aliased) return aliased;
  }

  return null;
}

export function resolveRouteOrDefault(candidate: string | null | undefined): string {
  const resolved = resolveRouteId(candidate);
  if (resolved) return resolved;

  if (candidate) {
    console.warn(
      `[routes] rota "${candidate}" não encontrada. Redirecionando para "${DEFAULT_ROUTE_ID}".`,
    );
  }

  return DEFAULT_ROUTE_ID;
}

export function getDefaultRouteId() {
  return DEFAULT_ROUTE_ID;
}

export async function prefetchRoute(id: string) {
  const canonical = resolveRouteId(id);
  if (!canonical) return;

  const entry = routeRegistry.get(canonical);
  if (!entry) return;

  try {
    ensureLazyComponent(canonical);
    await entry.loader();
  } catch (error) {
    console.warn(`[routes] falha ao pré-carregar rota "${canonical}":`, error);
  }
}

export function renderPage(activePage: string | null | undefined): ReactNode {
  const resolvedId = resolveRouteOrDefault(activePage);
  const LazyComponent = ensureLazyComponent(resolvedId);

  if (LazyComponent) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center text-sm text-[var(--text-secondary)]">
            Carregando página...
          </div>
        }
      >
        <LazyComponent />
      </Suspense>
    );
  }

  const fallbackLabel = getFallbackLabel(activePage);
  return <UnderConstruction pageName={fallbackLabel} />;
}

function ensureLazyComponent(id: string) {
  let cached = lazyCache.get(id);
  if (cached) return cached;

  const entry = routeRegistry.get(id);
  if (!entry) return null;

  const LazyComponent = lazy(entry.loader);
  lazyCache.set(id, LazyComponent);
  return LazyComponent;
}

function getFallbackLabel(identifier: string | null | undefined): string {
  const canonical = resolveRouteId(identifier);
  if (canonical) {
    const entry = routeRegistry.get(canonical);
    if (entry?.label) return entry.label;
  }

  const normalised = normaliseIdentifier(identifier);
  const fromPagesList = pagesList.find((page) => normaliseIdentifier(page.id) === normalised);
  if (fromPagesList) {
    return fromPagesList.label;
  }

  if (identifier && identifier.trim().length > 0) {
    return identifier;
  }

  return "Página";
}

function bootstrapPlaceholderRoutes() {
  pagesList.forEach((page) => {
    const canonicalId = normaliseIdentifier(page.id);
    if (!routeRegistry.has(canonicalId)) {
      registerRoute(page.id, createPlaceholderLoader(page.label), {
        label: page.label,
        placeholder: true,
      });
    }
  });
}

bootstrapPlaceholderRoutes();
