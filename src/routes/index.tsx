import type { ComponentType, ReactNode } from "react";
import { Suspense, lazy, type LazyExoticComponent } from "react";
import UnderConstruction from "../pages/UnderConstruction";
import { pagesList } from "./pagesList";

type RouteLoader = () => Promise<{ default: ComponentType<any> }>;

const routeRegistry = new Map<string, RouteLoader>();
const lazyCache = new Map<string, LazyExoticComponent<ComponentType<any>>>();

export function registerRoute(id: string, loader: RouteLoader) {
  routeRegistry.set(id, loader);
  lazyCache.delete(id);
}

export function renderPage(activePage: string): ReactNode {
  const LazyComponent = ensureLazyComponent(activePage);

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

  const fallbackLabel = pagesList.find((page) => page.id === activePage)?.label ?? activePage;
  return <UnderConstruction pageName={fallbackLabel} />;
}

function ensureLazyComponent(id: string) {
  let cached = lazyCache.get(id);
  if (cached) {
    return cached;
  }

  const loader = routeRegistry.get(id);
  if (!loader) {
    return null;
  }

  const LazyComponent = lazy(loader);
  lazyCache.set(id, LazyComponent);
  return LazyComponent;
}
