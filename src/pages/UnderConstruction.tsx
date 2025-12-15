// src/pages/UnderConstruction.tsx
// ALSHAM 360° PRIMA — Feature Gate Page (Enterprise)
// Uso recomendado: SOMENTE se alguém digitar a rota manualmente.
// A navegação oficial (sidebar) NÃO deve levar para páginas não-implementadas.

import React from 'react'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type UnderConstructionProps = {
  pageName?: string
  message?: string
}

export default function UnderConstruction({
  pageName = 'Recurso',
  message = 'Este recurso ainda não está disponível nesta versão. Assim que estiver pronto, será liberado automaticamente.',
}: UnderConstructionProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-2xl p-3 bg-white/10 border border-white/10">
            <Lock className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl md:text-2xl font-semibold">
                {pageName} indisponível
              </h1>
              <Sparkles className="h-5 w-5 opacity-70" />
            </div>

            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              {message}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-white/15 bg-white/10 hover:bg-white/15 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center rounded-xl px-4 py-2 bg-white text-black hover:opacity-90 transition font-medium"
              >
                Ir para Dashboard
              </button>
            </div>

            <div className="mt-6 text-xs text-white/50">
              Política ALSHAM: a navegação oficial só expõe módulos realmente implementados.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
