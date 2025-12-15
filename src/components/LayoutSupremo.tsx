// src/components/LayoutSupremo.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - LAYOUT SUPREMO (STABLE)
// - Força visibilidade via Tailwind tokens (bg-background / text-foreground)
// - Mantém Sidebar + Header sempre presentes
// - Evita depender de CSS vars opcionais que podem não existir no theme system
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

import HeaderSupremo from './HeaderSupremo'
import { SidebarDesktop, SidebarMobile, MobileNavButton } from './SidebarSupremo'
import type { ThemeKey } from '@/lib/themes'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helpers (states)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-6 backdrop-blur-xl">
      <div className="absolute inset-0 skeleton-shimmer" />
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-muted/40" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded-lg bg-muted/40" />
            <div className="h-3 w-1/2 rounded-lg bg-muted/40" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded-lg bg-muted/40" />
          <div className="h-3 w-4/5 rounded-lg bg-muted/40" />
          <div className="h-3 w-3/5 rounded-lg bg-muted/40" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-24 rounded-xl bg-muted/40" />
          <div className="h-10 w-24 rounded-xl bg-muted/40" />
        </div>
      </div>
    </div>
  )
}

function SkeletonLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-xl bg-muted/40" />
            <div className="h-4 w-32 rounded-lg bg-muted/40" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 rounded-xl bg-muted/40" />
            <div className="h-10 w-10 rounded-xl bg-muted/40" />
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="grid h-20 w-20 place-content-center rounded-full bg-destructive/10">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <p className="text-base text-muted-foreground">{message}</p>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props
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
  isEmpty?: boolean

  userName?: string
  userRole?: string
  userInitials?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main
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
  userRole = 'Founder',
  userInitials = 'AB',
}: LayoutSupremoProps) {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileNavOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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
    <div
      data-theme={theme}
      className="min-h-screen bg-background text-foreground"
    >
      <div className="min-h-screen md:grid md:grid-cols-1 lg:grid-cols-[auto_1fr]">
        {/* Desktop Sidebar */}
        <SidebarDesktop
          activePage={activePage}
          onNavigate={handleNavigate}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        />

        {/* Mobile Sidebar */}
        <SidebarMobile
          activePage={activePage}
          onNavigate={handleNavigate}
          isOpen={isMobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* Mobile FAB */}
        <MobileNavButton
          isOpen={isMobileNavOpen}
          onClick={() => setMobileNavOpen(v => !v)}
        />

        {/* Main */}
        <div className="flex min-h-screen flex-col">
          <HeaderSupremo
            theme={theme}
            onThemeChange={onThemeChange}
            currency={currency}
            onCurrencyChange={onCurrencyChange}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            onMobileMenuToggle={() => setMobileNavOpen(v => !v)}
            isMobileMenuOpen={isMobileNavOpen}
            userName={userName}
            userRole={userRole}
            userInitials={userInitials}
          />

          <main className="flex-1 overflow-y-auto">
            {title && (
              <motion.div
                className="border-b border-border/50 px-4 py-4 sm:px-6 lg:px-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl">
                  {title}
                </h1>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
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

export { SkeletonLoading, SkeletonCard, ErrorState }
