import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { updatePassword } from '@/lib/supabase/auth'

function useParamsAll() {
  const { search, hash } = useLocation()
  return useMemo(() => {
    const q = new URLSearchParams(search || '')
    const h = new URLSearchParams((hash || '').replace(/^#/, ''))
    const get = (k: string) => q.get(k) || h.get(k)
    return { get }
  }, [search, hash])
}

export default function ResetPassword() {
  const nav = useNavigate()
  const { get } = useParamsAll()

  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setMsg(null)
      setErr(null)
      setReady(false)

      const urlError = get('error')
      const urlCode = (get('error_code') || '').toLowerCase()
      const urlDesc = get('error_description')

      if (urlError) {
        if (urlCode.includes('otp') || urlCode.includes('expired') || urlError.includes('access_denied')) {
          setErr('Link de redefinição expirou, já foi usado, ou foi negado. Solicite um novo reset.')
        } else {
          setErr(`Falha no reset: ${urlError}${urlDesc ? ` — ${decodeURIComponent(urlDesc)}` : ''}`)
        }
        return
      }

      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setErr(error.message)
        return
      }
      if (!data.session) {
        setErr('Sessão de recuperação não encontrada. Solicite um novo email de recuperação.')
        return
      }

      setReady(true)
    })()
  }, [get])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)

    if (!ready) return
    if (p1.length < 8) return setErr('Senha precisa ter pelo menos 8 caracteres.')
    if (p1 !== p2) return setErr('As senhas não coincidem.')

    setLoading(true)
    try {
      await updatePassword(p1)
      setMsg('Senha atualizada. Redirecionando para o login...')
      setTimeout(() => nav('/login', { replace: true }), 800)
    } catch (e: any) {
      setErr(e?.message || 'Erro ao atualizar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-extrabold text-white">Redefinir senha</h1>
        <p className="mt-1 text-sm text-white/70">Defina uma nova senha para sua conta.</p>

        {err && (
          <div className="mt-4 rounded-xl border border-[var(--accent-alert)]/30 bg-[var(--accent-alert)]/10 p-3 text-sm text-[var(--accent-alert)]">
            <div className="font-semibold">Não foi possível concluir</div>
            <div className="mt-1">{err}</div>
            <div className="mt-3 flex gap-2">
              <Link to="/forgot-password" className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15">
                Reenviar email
              </Link>
              <Link to="/login" className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15">
                Login
              </Link>
            </div>
          </div>
        )}

        {msg && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-white/80">Nova senha</label>
            <input
              type="password"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              disabled={!ready || loading}
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none disabled:opacity-60"
              placeholder="mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80">Confirmar senha</label>
            <input
              type="password"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              disabled={!ready || loading}
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none disabled:opacity-60"
              placeholder="repita a senha"
            />
          </div>

          <button
            type="submit"
            disabled={!ready || loading}
            className="w-full rounded-xl bg-[var(--accent-2)] px-4 py-3 font-bold text-white hover:bg-[var(--accent-2)]/80 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-white/70 hover:text-white">
              Voltar ao login
            </Link>
          </div>

          {!ready && !err && <div className="text-center text-xs text-white/50">Validando link...</div>}
        </form>
      </div>
    </div>
  )
}
