import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  Crown,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react'

import { useAuthStore } from '../../lib/supabase/useAuthStore'
import type { Organization } from '../../lib/supabase/types'

export const OrganizationSelector: React.FC = () => {
  const navigate = useNavigate()

  const user = useAuthStore((s) => s.user)
  const organizations = useAuthStore((s) => (s as any).organizations ?? [])
  const orgLoading = useAuthStore((s) => (s as any).orgLoading ?? false)
  const error = useAuthStore((s) => (s as any).error ?? null)
  const clearError = useAuthStore((s) => (s as any).clearError?.())
  const switchOrganization = useAuthStore((s) => (s as any).switchOrganization)
  const fetchOrganizations = useAuthStore((s) => (s as any).fetchOrganizations)

  // Se não tiver user, manda pro login (apenas uma vez, estável)
  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  // Carrega orgs (se existir a action no store)
  useEffect(() => {
    if (user && typeof fetchOrganizations === 'function') {
      fetchOrganizations()
    }
  }, [user, fetchOrganizations])

  const safeOrgs: Organization[] = Array.isArray(organizations) ? organizations : []

  const handleOrgSelect = async (org: Organization) => {
    try {
      if (typeof clearError === 'function') clearError()
      if (typeof switchOrganization !== 'function') {
        throw new Error('switchOrganization não existe no store.')
      }
      await switchOrganization(org.id)
      navigate('/dashboard', { replace: true })
    } catch (e: any) {
      // erro já pode ser setado pelo store; aqui só evita crash
      console.error(e)
    }
  }

  // Loading state real
  if (orgLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Carregando organizações...</h2>
          <p className="text-slate-400">Aguarde enquanto buscamos suas organizações.</p>
        </motion.div>
      </div>
    )
  }

  // Lista vazia (não é “loading”)
  if (!safeOrgs.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h2 className="text-xl font-semibold text-white mb-2">Nenhuma organização encontrada</h2>
          <p className="text-slate-400 mb-6">
            Seu usuário autenticou, mas não retornou organizações. Verifique a consulta no store
            (fetchOrganizations) ou o vínculo do usuário na tabela de memberships.
          </p>
          <button
            onClick={() => typeof fetchOrganizations === 'function' && fetchOrganizations()}
            className="rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/15"
          >
            Tentar novamente
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg shadow-blue-500/25">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Selecionar Organização</h1>
            <p className="text-slate-400 text-lg">Escolha qual organização você deseja acessar</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safeOrgs.map((org: Organization, index) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                className="group relative"
              >
                <motion.button
                  onClick={() => handleOrgSelect(org)}
                  className="w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-left shadow-lg hover:shadow-xl"
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
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xl">
                            {org.name?.charAt(0)?.toUpperCase?.() ?? 'O'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                        {org.name}
                      </h3>
                      <p className="text-slate-400 text-sm mb-2">
                        {org.domain || 'Sem domínio configurado'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
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
                    <span className="text-slate-400 text-sm">Acessar organização</span>
                    <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
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
