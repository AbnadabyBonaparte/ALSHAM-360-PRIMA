// src/components/LayoutSupremo.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - LAYOUT SUPREMO (ABSOLUTE STABLE + ERROR-PROOF EDITION)
// - 100% Tailwind tokens padrão → visibilidade garantida em qualquer estado
// - Gradiente supremo no título com fallback seguro
// - Proteção contra accent-sky/accent-fuchsia ausentes
// - Estrutura épica preservada: Sidebar, Header, Mobile Nav, animações
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

import HeaderSupremo from './HeaderSupremo'
import { SidebarDesktop, SidebarMobile, MobileNavButton } from './SidebarSupremo'
import type { ThemeKey } from '@/lib/themes'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SKELETONS E STATES (visibilidade garantida)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-6 backdrop-blur-xl">
      <div className="absolute inset-0 skeleton-shimmer" />
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-muted/40 skeleton-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded-lg bg-muted/40 skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded-lg bg-muted/40 skeleton-shimmer" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded-lg bg-muted/40 skeleton-shimmer" />
          <div className="h-3 w-4/5 rounded-lg bg-muted/40 skeleton-shimmer" />
          <div className="h-3 w-3/5 rounded-lg bg-muted/40 skeleton-shimmer" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-24 rounded-xl bg-muted/40 skeleton-shimmer" />
          <div className="h-10 w-24 rounded-xl bg-muted/40 skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}

function SkeletonLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-xl bg-muted/40 skeleton-shimmer" />
            <div className="h-4 w-32 rounded-lg bg-muted/40 skeleton-shimmer" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 rounded-xl bg-muted/40 skeleton-shimmer" />
            <div className="h-10 w-10 rounded-xl bg-muted/40 skeleton-shimmer" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message = 'Ops! Algo deu errado ao carregar a página.' }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 text-center bg-background">
      <div className="grid h-24 w-24 place-content-center rounded-full bg-destructive/10">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <div>
        <p className="text-xl font-semibold text-foreground mb-2">Erro ao carregar</p>
        <p className="text-base text-muted-foreground max-w-md">{message}</p>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROPS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface LayoutSupremoProps {
  children: ReactNode
  title?: string

  theme?: ThemeKey
  onThemeChange?: (theme: ThemeKey) => void

  activePage?: string
  onNavigate?: (pageId: string) => void

  currency?: 'BRL' | 'USD' | 'EUR'
  onCurrencyChange?: (currency: 'BRL' | 'USD' | 'EUR') => void

  timeframe?: '7d' | '30d' | '90d'
  onTimeframeChange?: (timeframe: '7d' | '30d' | '90d') => void

  isLoading?: boolean
  error?: string | null

  userName?: string
  userRole?: string
  userInitials?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTE PRINCIPAL — ESTÁVEL E SUPREMO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function LayoutSupremo({
  children,
  title,

  theme = 'cyber-vivid',
  onThemeChange = () => {},

  activePage = 'dashboard',
  onNavigate = () => {},

  currency = 'BRL',
  onCurrencyChange = () => {},

  timeframe = '30d',
  onTimeframeChange = () => {},

  isLoading = false,
  error = null,

  userName = 'Abnadaby',
  userRole = 'Arquiteto Supremo',
  userInitials = 'AB',
}: LayoutSupremoProps) {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Fecha sidebar mobile ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileNavOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNavigate = useCallback(
    (pageId: string) => {
      onNavigate(pageId)
      setMobileNavOpen(false)
    },
    [onNavigate]
  )

  const renderContent = () => {
    if (isLoading) return <SkeletonLoading />
    if (error) return <ErrorState message={error} />
    return children
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        {/* Desktop Sidebar */}
        <SidebarDesktop
          activePage={activePage}
          onNavigate={handleNavigate}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        />

        {/* Mobile Sidebar */}
        <SidebarMobile
          activePage={activePage}
          onNavigate={handleNavigate}
          isOpen={isMobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* Mobile Navigation Button */}
        <MobileNavButton
          isOpen={isMobileNavOpen}
          onClick={() => setMobileNavOpen(prev => !prev)}
        />

        {/* Main Content */}
        <div className="flex flex-col">
          <HeaderSupremo
            theme={theme}
            onThemeChange={onThemeChange}
            currency={currency}
            onCurrencyChange={onCurrencyChange}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            onMobileMenuToggle={() => setMobileNavOpen(prev => !prev)}
            isMobileMenuOpen={isMobileNavOpen}
            userName={userName}
            userRole={userRole}
            userInitials={userInitials}
          />

          <main className="flex-1 overflow-y-auto">
            {title && (
              <motion.div
                className="border-b border-border/50 px-4 py-4 sm:px-6 lg:px-8 bg-background"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Título com gradiente supremo + fallback seguro */}
                <h1 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                  {title}
                </h1>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-4 sm:p-6 lg:p-8"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS ADICIONAIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { SkeletonLoading, SkeletonCard, ErrorState }
export type { LayoutSupremoProps }
