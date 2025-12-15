import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { updatePassword } from '@/lib/supabase/auth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

function useSupabaseParams() {
  const { search, hash } = useLocation()
  return useMemo(() => {
    const q = new URLSearchParams(search || '')
    const h = new URLSearchParams((hash || '').replace(/^#/, ''))
    return { q, h }
  }, [search, hash])
}

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { q, h } = useSupabaseParams()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const urlError = q.get('error') || h.get('error')
  const urlErrorCode = q.get('error_code') || h.get('error_code')
  const urlErrorDesc = q.get('error_description') || h.get('error_description')

  useEffect(() => {
    ;(async () => {
      setError(null)
      setSuccess(null)
      setReady(false)

      // 1) Se o Supabase devolveu erro no redirect
      if (urlError) {
        const code = (urlErrorCode || '').toLowerCase()
        if (code.includes('otp') || code.includes('expired')) {
          setError('Este link de redefinição expirou ou já foi usado. Solicite um novo email de recuperação.')
        } else {
          setError(
            `Falha no reset: ${urlError}${urlErrorDesc ? ` — ${decodeURIComponent(urlErrorDesc)}` : ''}`
          )
        }
        return
      }

      // 2) Precisa existir sessão de recovery
      const { data, error: sessionErr } = await supabase.auth.getSession()
      if (sessionErr) {
        setError(sessionErr.message)
        return
      }
      if (!data.session) {
        setError('Sessão de recuperação não encontrada. Solicite um novo email de recuperação.')
        return
      }

      setReady(true)
    })()
    // re-roda a cada navegação (novo link)
  }, [location.key, urlError, urlErrorCode, urlErrorDesc])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!ready) return

    if (!password || password.length < 8) {
      setError('Use uma senha com pelo menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      setSuccess('Senha atualizada com sucesso. Redirecionando para o login…')
      setTimeout(() => navigate('/login', { replace: true }), 900)
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Redefinir senha</h1>
          <p className="mt-2 text-sm text-white/70">Defina uma nova senha para sua conta.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-200">{error}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/forgot-password"
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Reenviar email
              </Link>
              <Link
                to="/login"
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Voltar ao login
              </Link>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm text-emerald-200">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
