import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { updatePassword } from '@/lib/supabase/auth'

function useQuery() {
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
  const { q, h } = useQuery()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Supabase retorna erros em querystring em alguns cenários
  const urlError = q.get('error') || h.get('error')
  const urlErrorCode = q.get('error_code') || h.get('error_code')
  const urlErrorDesc = q.get('error_description') || h.get('error_description')

  useEffect(() => {
    ;(async () => {
      setError(null)
      setSuccess(null)

      // 1) Se veio erro no redirect (ex: otp_expired)
      if (urlError) {
        const code = (urlErrorCode || '').toLowerCase()
        if (code.includes('otp') || code.includes('expired')) {
          setError(
            'Este link de redefinição expirou ou já foi usado. Solicite um novo email de recuperação.'
          )
        } else {
          setError(
            `Falha no reset: ${urlError}${urlErrorDesc ? ` — ${decodeURIComponent(urlErrorDesc)}` : ''}`
          )
        }
        setReady(false)
        return
      }

      // 2) Caso não tenha erro, verificamos se existe sessão (recovery session)
      // Se não houver sessão, não adianta tentar updatePassword
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        setError('Sessão de recuperação não encontrada. Solicite um novo email de recuperação.')
        setReady(false)
        return
      }

      setReady(true)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const onSubmit = async (e: React.FormEvent) => {
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
      setSuccess('Senha atualizada com sucesso. Você já pode entrar.')
      // opcional: desloga qualquer sessão residual e manda pro login
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Redefinir senha
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Defina uma nova senha para sua conta.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-200">{error}</p>
            <div className="mt-3 flex gap-2">
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Reenviar email de recuperação
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Nova senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!ready || loading}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10 disabled:opacity-60"
              placeholder="mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={!ready || loading}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10 disabled:opacity-60"
              placeholder="repita a senha"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={!ready || loading}
            className="w-
