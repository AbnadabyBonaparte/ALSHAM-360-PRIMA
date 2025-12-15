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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-10 border border-gray-700">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">ALSHAM 360° PRIMA</h1>
          <p className="text-gray-400 text-lg">Entre com sua conta admin</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-lg">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            placeholder="Email"
            required
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            placeholder="Senha"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-70"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/forgot-password" className="text-gray-400 hover:text-white text-sm underline">
            Esqueci minha senha
          </a>
        </div>
      </div>
    </div>
  )
}
