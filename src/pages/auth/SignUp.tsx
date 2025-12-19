import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { signUp } from '@/lib/supabase/auth'
import { useAuthStore } from '@/lib/supabase/useAuthStore'

export const SignUp: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  const init = useAuthStore(s => s.init)

  const navigate = useNavigate()
  const location = useLocation() as any

  useEffect(() => {
    init()
  }, [init])

  // se já está logado, não deixa criar conta de novo
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
      await signUp(email, password, { fullName })
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Falha ao criar conta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alsham-primary/5 to-alsham-secondary/5 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-alsham-text-primary mb-2">
            Criar conta no ALSHAM 360° PRIMA
          </h1>
          <p className="text-alsham-text-secondary">
            Comece sua jornada com o melhor CRM do mercado
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--accent-alert)]/10 border border-[var(--accent-alert)]/30 rounded-lg">
            <p className="text-[var(--accent-alert)] text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-alsham-text-primary mb-2">
              Nome completo
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-alsham-border-default rounded-lg focus:ring-2 focus:ring-alsham-primary focus:border-transparent"
              placeholder="Seu nome completo"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-alsham-text-primary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-alsham-border-default rounded-lg focus:ring-2 focus:ring-alsham-primary focus:border-transparent"
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-alsham-text-primary mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-alsham-border-default rounded-lg focus:ring-2 focus:ring-alsham-primary focus:border-transparent"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-alsham-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-alsham-primary-hover focus:ring-2 focus:ring-alsham-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? <LoadingSpinner size="sm" /> : 'Criar conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-alsham-text-secondary">
            Já tem conta?{' '}
            <Link to="/login" className="text-alsham-primary hover:text-alsham-primary-hover font-medium">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
