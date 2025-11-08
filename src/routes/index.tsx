// src/routes/index.tsx
import { lazy, Suspense } from 'react';
import { allPages } from './pagesList';
import UnderConstruction from '../pages/UnderConstruction';

// Páginas que já existem
const Home = lazy(() => import('../pages/Home'));
const Leads = lazy(() => import('../pages/Leads'));

// Função para carregar página com fallback
const loadPage = (pagePath: string) => {
  try {
    return lazy(() => 
      import(`../pages/${pagePath}.tsx`)
        .catch(() => ({ default: () => <UnderConstruction pageName={pagePath} /> }))
    );
  } catch {
    return () => <UnderConstruction pageName={pagePath} />;
  }
};

// Mapa de rotas
export const pageComponents: Record<string, any> = {
  dashboard: Home,
  leads: Leads,
  // As outras 108 páginas carregam automaticamente
  ...Object.fromEntries(
    allPages
      .filter(p => !['leads'].includes(p.id)) // Excluir as que já importamos
      .map(p => [p.id, loadPage(p.path)])
  )
};

// Componente de loading
export function PageLoader() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );
}

// Renderizar página com Suspense
export function renderPage(pageId: string) {
  const PageComponent = pageComponents[pageId] || UnderConstruction;
  
  return (
    <Suspense fallback={<PageLoader />}>
      <PageComponent />
    </Suspense>
  );
}
