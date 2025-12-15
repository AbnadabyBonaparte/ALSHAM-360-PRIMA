import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement forgot password
    setTimeout(() => {
      setSent(true)
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alsham-primary/5 to-alsham-secondary/5 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-alsham-text-primary mb-2">
            Esqueceu sua senha?
          </h1>
          <p className="text-alsham-text-secondary">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">
                Email enviado! Verifique sua caixa de entrada.
              </p>
            </div>
            <Link
              to="/login"
              className="text-alsham-primary hover:text-alsham-primary-hover font-medium"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-alsham-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-alsham-primary-hover focus:ring-2 focus:ring-alsham-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-alsham-primary hover:text-alsham-primary-hover text-sm"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}
