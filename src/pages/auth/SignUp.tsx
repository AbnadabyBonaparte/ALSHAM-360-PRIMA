import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signUp } from '@/lib/supabase/auth'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const SignUp: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const init = useAuthStore((s) => s.init)

  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname?: string } } }

  useEffect(() => {
    init()
  }, [init])

  // Se já está logado, não deixa criar conta de novo
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
      const data = await signUp(email, password, { full_name: fullName })
      // Se a confirmação de email estiver ativa, não há sessão imediata.
      if (data?.session) {
        navigate('/dashboard', { replace: true })
      } else {
        setSent(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar conta.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <Card className="max-w-md w-full bg-[var(--surface)] border-[var(--border)] shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
            Criar conta no ALSHAM 360° PRIMA
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Comece sua jornada com o CRM
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <Alert className="bg-[var(--accent-1)]/10 border-[var(--accent-1)]/30 text-[var(--accent-1)]">
                <AlertDescription>
                  Conta criada! Verifique seu email para confirmar o cadastro antes de entrar.
                </AlertDescription>
              </Alert>
              <Link to="/login" className="text-[var(--accent-2)] hover:underline font-medium text-sm">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
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
                  <Label htmlFor="fullName" className="text-[var(--text-primary)]">
                    Nome completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[var(--text-primary)]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[var(--text-primary)]">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                Já tem conta?{' '}
                <Link to="/login" className="text-[var(--accent-2)] hover:underline font-medium">
                  Entrar
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
