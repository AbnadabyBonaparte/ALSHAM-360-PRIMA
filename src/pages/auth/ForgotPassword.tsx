import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '@/lib/supabase/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao enviar instruções. Tente novamente.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <Card className="max-w-md w-full bg-[var(--surface)] border-[var(--border)] shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
            Esqueceu sua senha?
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Digite seu email para receber instruções de recuperação
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <Alert className="bg-[var(--accent-1)]/10 border-[var(--accent-1)]/30 text-[var(--accent-1)]">
                <AlertDescription>
                  Email enviado! Verifique sua caixa de entrada e abra o link para definir uma nova senha.
                </AlertDescription>
              </Alert>
              <Link to="/login" className="text-[var(--accent-2)] hover:underline font-medium text-sm">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-[var(--accent-alert)]/10 border-[var(--accent-alert)]/30 text-[var(--accent-alert)]"
                >
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Enviando...' : 'Enviar instruções'}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm underline underline-offset-4"
                >
                  Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
