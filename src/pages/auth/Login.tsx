import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { signIn } from '@/lib/supabase/auth'
import { useAuthStore } from '@/lib/supabase/useAuthStore'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('alsham.admin@alshamglobal.com.br') // teste rápido
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  const init = useAuthStore(s => s.init)

  const navigate = useNavigate()
  const location = useLocation() as any

  // garante sessão carregada antes de decidir redirecionar
  useEffect(() => {
    init()
  }, [init])

  // se já está logado, não fica preso no /login
  useEffect(() => {
    if (!loading && user) {
      const from = location?.state?.from?.pathname
      navigate(from || '/dashboard', { replace: true })
    }
  }, [loading, user, navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await signIn(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Falha ao entrar. Verifique suas credenciais.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="max-w-md w-full bg-[var(--surface)] rounded-2xl shadow-2xl p-10 border border-[var(--border)]">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">ALSHAM 360° PRIMA</h1>
          <p className="text-[var(--text-2)] text-lg">Entre com sua conta admin</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--accent-alert)]/10 border border-[var(--accent-alert)]/30 rounded-lg">
            <p className="text-[var(--accent-alert)] text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-white placeholder-[var(--text-2)] focus:outline-none focus:border-[var(--accent-2)]"
            placeholder="Email"
            required
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-white placeholder-[var(--text-2)] focus:outline-none focus:border-[var(--accent-2)]"
            placeholder="Senha"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--accent-2)] hover:bg-[var(--accent-2)]/80 text-white font-bold py-3 rounded-lg transition disabled:opacity-70"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/forgot-password" className="text-[var(--text-2)] hover:text-white text-sm underline">
            Esqueci minha senha
          </a>
        </div>
      </div>
    </div>
  )
}
