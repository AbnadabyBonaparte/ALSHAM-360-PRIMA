import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../lib/supabase/useAuthStore'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  Crown,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import type { Organization } from '../../lib/supabase/types'

export const OrganizationSelector: React.FC = () => {
  const { organizations, switchOrganization, currentOrg, error, clearError, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Redirect if organization is already selected
  useEffect(() => {
    if (currentOrg) {
      navigate('/dashboard')
    }
  }, [currentOrg, navigate])

  const handleOrgSelect = async (org: Organization) => {
    clearError()
    await switchOrganization(org.id)
  }

  if (!organizations.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Carregando organizações...</h2>
          <p className="text-slate-400">Aguarde enquanto buscamos suas organizações.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-8"
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Building2 className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
              Selecionar Organização
            </h1>
            <p className="text-slate-400 text-lg">
              Escolha qual organização você deseja acessar
            </p>
          </motion.div>

          {/* Error Message */}
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

          {/* Organizations Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {organizations.map((org: Organization, index) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="group relative"
              >
                <motion.button
                  onClick={() => handleOrgSelect(org)}
                  className="w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-left shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Organization Avatar */}
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
                            {org.name.charAt(0).toUpperCase()}
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

                      {/* Organization Stats (placeholder for now) */}
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>12 membros</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Ativa</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Acessar organização</span>
                    <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <p className="text-slate-500 text-sm mb-4">
              Não consegue acessar sua organização?
            </p>
            <button
              onClick={() => navigate('/support')}
              className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
            >
              Entre em contato com o suporte
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
