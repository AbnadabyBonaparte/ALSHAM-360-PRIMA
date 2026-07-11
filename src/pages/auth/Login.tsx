import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { signIn } from '@/lib/supabase/auth'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const init = useAuthStore((s) => s.init)

  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname?: string } } }

  // Garante sessão carregada antes de decidir redirecionar
  useEffect(() => {
    init()
  }, [init])

  // Se já está logado, não fica preso no /login
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao entrar. Verifique suas credenciais.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <Card className="max-w-md w-full bg-[var(--surface)] border-[var(--border)] shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-[var(--text-primary)]">
            ALSHAM 360° PRIMA
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)] text-base">
            Entre com sua conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 bg-[var(--accent-alert)]/10 border-[var(--accent-alert)]/30 text-[var(--accent-alert)]"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--text-primary)]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--text-primary)]">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            <Link
              to="/forgot-password"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-4"
            >
              Esqueci minha senha
            </Link>
            <span className="text-[var(--text-secondary)]">
              Não tem conta?{' '}
              <Link to="/signup" className="text-[var(--accent-2)] hover:underline font-medium">
                Criar conta
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
