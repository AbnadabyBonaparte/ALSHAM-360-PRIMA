import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { Building2, Users, Crown, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'

import { useAuthStore } from '../../lib/supabase/useAuthStore'
import type { Organization } from '../../lib/supabase/useAuthStore'

export const OrganizationSelector: React.FC = () => {
  const navigate = useNavigate()

  const user = useAuthStore((s) => s.user)
  const organizations = useAuthStore((s) => s.organizations)
  const loadingOrgs = useAuthStore((s) => s.loadingOrgs)
  const currentOrgId = useAuthStore((s) => s.currentOrgId)

  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)
  const switchOrganization = useAuthStore((s) => s.switchOrganization)

  // 1) Sem auth => login
  if (!user) return <Navigate to="/login" replace />

  // 2) Se já tem org selecionada (auto-select ou switch), sai do selector
  if (currentOrgId) return <Navigate to="/dashboard" replace />

  const safeOrgs: Organization[] = Array.isArray(organizations) ? organizations : []

  const handleOrgSelect = async (org: Organization) => {
    try {
      clearError()
      await switchOrganization(org.id)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      console.error(e)
    }
  }

  if (loadingOrgs) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--accent-sky)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Carregando organizações...</h2>
          <p className="text-[var(--text-secondary)]">Aguarde enquanto buscamos suas organizações.</p>
        </motion.div>
      </div>
    )
  }

  // 0 orgs: estado cravado (sem criar nada aqui)
  if (!safeOrgs.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Nenhuma organização encontrada</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Seu usuário autenticou, mas não retornou organizações. Verifique vínculos em
            <code className="mx-1">user_organizations</code> e políticas/RLS.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[var(--surface)]/10 px-4 py-2 text-[var(--text)] hover:bg-[var(--surface)]/15"
          >
            Recarregar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-subtle-grid opacity-40" />

      <div className="relative z-10 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-purple)] rounded-3xl mb-6 shadow-lg shadow-[var(--accent-sky)]/25">
              <Building2 className="w-10 h-10 text-[var(--text)]" />
            </div>
            <h1 className="text-4xl font-bold text-[var(--text)] mb-2">Selecionar Organização</h1>
            <p className="text-[var(--text-secondary)] text-lg">Escolha qual organização você deseja acessar</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-[var(--accent-alert)]/10 border border-[var(--accent-alert)]/20 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-[var(--accent-alert)] flex-shrink-0" />
                  <p className="text-[var(--accent-alert)] text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safeOrgs.map((org, index) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                className="group relative"
              >
                <motion.button
                  onClick={() => handleOrgSelect(org)}
                  className="w-full bg-[var(--surface)]/5 backdrop-blur-xl rounded-3xl border border-[var(--border)] p-6 hover:bg-[var(--surface)]/10 hover:border-[var(--border)] transition-all duration-300 text-left shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      {org.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-purple)] rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-[var(--text)] font-bold text-xl">
                            {org.name?.charAt(0)?.toUpperCase?.() ?? 'O'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-[var(--text)] mb-1 group-hover:text-[var(--accent-sky)] transition-colors">
                        {org.name}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-sm mb-2">
                        {org.domain || 'Sem domínio configurado'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-[var(--text-secondary)]">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>—</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Ativa</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)] text-sm">Acessar organização</span>
                    <ArrowRight className="w-5 h-5 text-[var(--accent-sky)] group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}






