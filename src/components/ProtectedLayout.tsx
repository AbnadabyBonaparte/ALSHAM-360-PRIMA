// src/components/ProtectedLayout.tsx
import React, { useCallback, useMemo } from 'react'
import { Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import LayoutSupremo from '@/components/LayoutSupremo'

function normalizePageId(value: string | undefined | null) {
  const v = (value ?? '').trim()
  if (!v) return 'dashboard'
  return v.replace(/^\//, '')
}

/**
 * Aliases canônicos para evitar que IDs “de label” virem rotas inválidas
 * e caiam em UnderConstruction indevidamente.
 *
 * SSOT de conversão: Sidebar IDs -> pagesListSupremo IDs (registry)
 *
 * Ex.: Sidebar chamando onNavigate('dashboard-principal') deve ir para /dashboard.
 */
const CANONICAL_ALIASES: Record<string, string> = {
  // ──────────────────────────────────────────────────────────────
  // Dashboard
  // ──────────────────────────────────────────────────────────────
  'dashboard-principal': 'dashboard',
  'dashboard_principal': 'dashboard',
  dashboardprincipal: 'dashboard',
  home: 'dashboard',
  inicio: 'dashboard',
  main: 'dashboard',

  // ──────────────────────────────────────────────────────────────
  // CRM Core
  // ──────────────────────────────────────────────────────────────
  'leads-lista': 'leads',
  'leads_lista': 'leads',
  leadslita: 'leads',

  'leads-detalhes': 'lead-details',
  'leads_detalhes': 'lead-details',
  leaddetails: 'lead-details',

  'leads-importacao': 'imports',
  'leads_importacao': 'imports',

  'contatos-lista': 'contacts',
  'contatos_lista': 'contacts',

  'contatos-detalhes': 'contact-details',
  'contatos_detalhes': 'contact-details',

  'contas-empresas-lista': 'accounts',
  'contas_empresas_lista': 'accounts',
  contas: 'accounts',

  'contas-detalhes': 'account-details',
  'contas_detalhes': 'account-details',

  'oportunidades-lista': 'opportunities',
  'oportunidades_lista': 'opportunities',

  'oportunidades-kanban': 'opportunities',
  'oportunidades_kanban': 'opportunities',

  'pipeline-vendas': 'pipeline',
  'pipeline_vendas': 'pipeline',

  financeiro: 'billing', // sidebar usa "financeiro" (pt), registry tem "billing"
  'atividades-tarefas': 'tasks',
  'atividades_tarefas': 'tasks',

  calendario: 'calendar',

  cotacoes: 'quotes',
  'propostas-comerciais': 'proposals',
  'propostas_comerciais': 'proposals',

  // ──────────────────────────────────────────────────────────────
  // Marketing
  // ──────────────────────────────────────────────────────────────
  'campanhas-lista': 'campaigns',
  'campanhas_lista': 'campaigns',

  'email-marketing-dashboard': 'email-marketing',
  'email_marketing_dashboard': 'email-marketing',

  'landing-pages-lista': 'landing-pages',
  'landing_pages_lista': 'landing-pages',

  'formularios-lista': 'forms',
  'formularios_lista': 'forms',

  'redes-sociais-dashboard': 'social',
  'redes_sociais_dashboard': 'social',

  'automacao-de-marketing': 'journeys',
  'automacao_de_marketing': 'journeys',

  // ──────────────────────────────────────────────────────────────
  // Suporte
  // ──────────────────────────────────────────────────────────────
  'tickets-lista': 'tickets',
  'tickets_lista': 'tickets',

  'tickets-detalhes': 'ticket-details',
  'tickets_detalhes': 'ticket-details',

  'base-de-conhecimento': 'knowledge-base',
  'base_de_conhecimento': 'knowledge-base',

  'portal-do-cliente': 'customer-portal',
  'portal_do_cliente': 'customer-portal',

  'slas-e-metricas': 'slas',
  'slas_e_metricas': 'slas',

  incident: 'incident',

  // ──────────────────────────────────────────────────────────────
  // Analytics
  // ──────────────────────────────────────────────────────────────
  'executive-dashboard': 'executive',
  'executive_dashboard': 'executive',

  'analytics-dashboard': 'analytics',
  'analytics_dashboard': 'analytics',

  'relatorios-personalizados': 'reports',
  'relatorios_personalizados': 'reports',

  'forecasting-de-vendas': 'forecasting',
  'forecasting_de_vendas': 'forecasting',

  'cohort-analysis': 'cohorts',
  cohortanalysis: 'cohorts',

  'a-b-testing': 'ab-testing',
  'a_b_testing': 'ab-testing',
  abtesting: 'ab-testing',

  // ──────────────────────────────────────────────────────────────
  // Automação & IA
  // ──────────────────────────────────────────────────────────────
  'workflows-lista': 'workflows',
  'workflows_lista': 'workflows',

  'automation-builder': 'automations',
  automationbuilder: 'automations',

  'ai-insights': 'labs-insights',
  aiinsights: 'labs-insights',

  // ──────────────────────────────────────────────────────────────
  // Omnichannel
  // ──────────────────────────────────────────────────────────────
  'omnichannel-inbox': 'inbox',
  omnichannelinbox: 'inbox',

  'whatsapp-business': 'whatsapp',
  whatsappbusiness: 'whatsapp',

  // ──────────────────────────────────────────────────────────────
  // Admin / Settings
  // ──────────────────────────────────────────────────────────────
  'cobranca-e-planos': 'billing',
  'cobranca_e_planos': 'billing',

  'branding-personalizado': 'themes',
  'branding_personalizado': 'themes',

  'logs-de-auditoria': 'audit-log',
  'logs_de_auditoria': 'audit-log',

  // ──────────────────────────────────────────────────────────────
  // Extras (já batem com pagesListSupremo, mas mantemos para robustez)
  // ──────────────────────────────────────────────────────────────
  metaverse: 'metaverse',
}

function canonicalizePageId(id: string) {
  const key = normalizePageId(id).toLowerCase()
  return CANONICAL_ALIASES[key] ?? key
}

export function ProtectedLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()

  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const loadingOrgs = useAuthStore((s) => s.loadingOrgs)
  const needsOrgSelection = useAuthStore((s) => s.needsOrgSelection)

  /**
   * activePage canônico baseado no seu App.tsx:
   * - /dashboard => dashboard
   * - /app/:pageId => pageId
   * - /select-organization => select-organization
   */
  const activePage = useMemo(() => {
    const paramPage = (params as any)?.pageId as string | undefined
    if (paramPage) return canonicalizePageId(paramPage)

    const path = location.pathname || ''
    if (path === '/dashboard') return 'dashboard'
    if (path === '/select-organization') return 'select-organization'

    // fallback: tenta derivar do último segmento
    const last = path.split('/').filter(Boolean).pop()
    return canonicalizePageId(last ?? 'dashboard')
  }, [location.pathname, params])

  /**
   * Navegação real alinhada ao Router canônico:
   * - dashboard => /dashboard
   * - select-organization => /select-organization
   * - demais => /app/<pageId>
   */
  const onNavigate = useCallback(
    (pageId: string) => {
      const raw = normalizePageId(pageId)
      const id = canonicalizePageId(raw)
      if (!id) return

      if (id === 'dashboard') {
        navigate('/dashboard', { replace: false })
        return
      }

      if (id === 'select-organization') {
        navigate('/select-organization', { replace: false })
        return
      }

      navigate(`/app/${id}`, { replace: false })
    },
    [navigate]
  )

  // Loading gate
  if (loading || loadingOrgs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Auth gate
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Org gate (evita loop se já estiver no selector)
  if (needsOrgSelection && location.pathname !== '/select-organization') {
    return <Navigate to="/select-organization" replace />
  }

  return (
    <LayoutSupremo activePage={activePage} onNavigate={onNavigate}>
      <Outlet />
    </LayoutSupremo>
  )
}
