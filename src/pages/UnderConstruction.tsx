// src/pages/UnderConstruction.tsx
// ALSHAM 360° PRIMA — Production Fallback Page (No Fake / No Placeholder Data)
// Objetivo: página REAL para rotas ainda não implementadas, com UX + telemetria básica.

import React, { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LayoutSupremo from '@/components/LayoutSupremo'
import { AlertTriangle, ArrowLeft, Home, Wrench, ExternalLink } from 'lucide-react'

// Opcional (recomendado): conecta com seu Single Source of Truth da Sidebar.
// Ajuste o path conforme seu projeto.
// Se você ainda não quiser importar, comente as 2 linhas abaixo e o bloco `routeMeta`.
import { findRouteById } from '@/lib/navigation/sidebarStructure' // <- ajuste se o arquivo estiver em outro lugar
import type { SidebarLink } from '@/lib/navigation/sidebarStructure'

function getQueryParam(search: string, key: string) {
  try {
    const sp = new URLSearchParams(search)
    const v = sp.get(key)
    return v && v.trim().length ? v.trim() : null
  } catch {
    return null
  }
}

export default function UnderConstruction() {
  const location = useLocation()
  const navigate = useNavigate()

  // Convenção: redirecione para esta página com:
  // navigate(`/wip?rid=${encodeURIComponent(routeId)}`, { replace: true })
  const routeId = useMemo(() => getQueryParam(location.search, 'rid') ?? '', [location.search])

  const routeMeta: SidebarLink | null = useMemo(() => {
    if (!routeId) return null
    const found = findRouteById(routeId)
    return found?.route ?? null
  }, [routeId])

  useEffect(() => {
    // Telemetria mínima (sem depender de libs externas).
    // Se você tiver Analytics interno, substitua aqui.
    // Importante: não dispara loop, apenas loga.
    // eslint-disable-next-line no-console
    console.warn('[WIP] rota ainda não implementada:', {
      routeId: routeId || '(missing)',
      pathname: location.pathname,
      search: location.search,
      from: document?.referrer || null,
      ts: new Date().toISOString(),
    })
  }, [routeId, location.pathname, location.search])

  const title = routeMeta?.label ?? (routeId ? `Rota: ${routeId}` : 'Página não disponível')
  const description =
    routeMeta?.description ??
    'Este recurso está no roadmap e será liberado assim que a implementação correspondente entrar em produção.'

  return (
    <LayoutSupremo>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                  <Wrench className="h-3.5 w-3.5" />
                  Em implementação
                </span>
              </div>

              <p className="mt-2 text-sm text-white/70">{description}</p>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-2 text-xs text-white/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-white/50">routeId</span>
                    <span className="font-mono text-white/80">{routeId || '(não informado)'}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-white/50">path atual</span>
                    <span className="font-mono text-white/80">{location.pathname}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-white/50">query</span>
                    <span className="font-mono text-white/80">{location.search || '(vazio)'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard', { replace: true })}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  <Home className="h-4 w-4" />
                  Ir para Dashboard
                </button>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    // Se você tiver um sistema interno de issues/tickets, acople aqui.
                    // Por padrão, só copia um payload para você colar no GitHub Issue.
                    const payload = {
                      type: 'WIP_PAGE_REQUEST',
                      routeId: routeId || null,
                      label: routeMeta?.label ?? null,
                      path: location.pathname,
                      search: location.search,
                      ts: new Date().toISOString(),
                    }
                    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2))
                    // eslint-disable-next-line no-console
                    console.info('[WIP] payload copiado para o clipboard:', payload)
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  <ExternalLink className="h-4 w-4" />
                  Copiar payload (Issue)
                </a>
              </div>

              <p className="mt-4 text-xs text-white/50">
                Nota: isto é um componente de produção para evitar redirecionamentos silenciosos e “tela preta” quando uma rota
                ainda não possui página registrada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayoutSupremo>
  )
}
