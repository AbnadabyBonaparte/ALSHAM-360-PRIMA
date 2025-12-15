import React, { useState } from 'react'

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    setLoading(true)

    // TODO: Implement password reset
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
    }, 1000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alsham-primary/5 to-alsham-secondary/5 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-alsham-text-primary mb-4">
            Senha alterada com sucesso!
          </h1>
          <p className="text-alsham-text-secondary mb-6">
            Sua senha foi redefinida. Você pode fazer login agora.
          </p>
          <a
            href="/login"
            className="inline-block bg-alsham-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-alsham-primary-hover"
          >
            Ir para login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alsham-primary/5 to-alsham-secondary/5 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-alsham-text-primary mb-2">
            Redefinir senha
          </h1>
          <p className="text-alsham-text-secondary">
            Digite sua nova senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-alsham-text-primary mb-2">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-alsham-border-default rounded-lg focus:ring-2 focus:ring-alsham-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-alsham-text-primary mb-2">
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-alsham-border-default rounded-lg focus:ring-2 focus:ring-alsham-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-alsham-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-alsham-primary-hover focus:ring-2 focus:ring-alsham-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
