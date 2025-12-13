// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - LAYOUT SUPREMO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 DOMINAÇÃO VISUAL TOTAL - Layout com Responsividade Alienígena
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { ReactNode, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { SidebarDesktop, SidebarMobile, MobileNavButton } from './SidebarSupremo';
import HeaderSupremo from './HeaderSupremo';
import { type ThemeKey } from '../lib/themes';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 SKELETON LOADING CINEMATOGRÁFICO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--border)]/50 bg-[var(--surface)]/60 p-6 backdrop-blur-xl">
      <div className="absolute inset-0 skeleton-shimmer" />
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[var(--surface-strong)]/50 skeleton-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded-lg bg-[var(--surface-strong)]/50 skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded-lg bg-[var(--surface-strong)]/50 skeleton-shimmer" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded-lg bg-[var(--surface-strong)]/50 skeleton-shimmer" />
          <div className="h-3 w-4/5 rounded-lg bg-[var(--surface-strong)]/50 skeleton-shimmer" />
          <div className="h-3 w-3/5 rounded-lg bg-[var(--surface-strong)]/50 skeleton-shimmer" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-24 rounded-xl bg-[var(--surface-strong)]/50 skeleton-shimmer" />
          <div className="h-10 w-24 rounded-xl bg-[var(--surface-strong)]/50 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-xl bg-[var(--surface-strong)]/50 skeleton-shimmer" />
            <div className="h-4 w-32 rounded-lg bg-[var(--surface-strong)]/50 skeleton-shimmer" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 rounded-xl bg-[var(--surface-strong)]/50 skeleton-shimmer" />
            <div className="h-10 w-10 rounded-xl bg-[var(--surface-strong)]/50 skeleton-shimmer" />
          </div>
        </div>

        {/* Cards Grid Skeleton - Responsive */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 EMPTY STATE ÉPICO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyStateEpico({
  title = "Nada por aqui... ainda",
  message = "O universo está vazio, mas não por muito tempo. Algo incrível está prestes a acontecer.",
  action
}: EmptyStateProps) {
  return (
    <motion.div
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cosmic Illustration */}
      <motion.div
        className="relative mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-[var(--color-primary-from)]/20 via-[var(--accent-sky)]/20 to-[var(--accent-fuchsia)]/20 blur-3xl" />
        <div className="relative grid h-32 w-32 place-content-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
          <motion.div
            className="text-6xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌌
          </motion.div>
        </div>
      </motion.div>

      {/* Title with Gradient */}
      <motion.h2
        className="mb-3 text-2xl font-bold sm:text-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="bg-gradient-to-r from-[var(--color-primary-from)] via-[var(--accent-sky)] to-[var(--accent-fuchsia)] bg-clip-text text-transparent">
          {title}
        </span>
      </motion.h2>

      {/* Message */}
      <motion.p
        className="mb-6 max-w-md text-[var(--text-2)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>

      {/* Motivational Quote */}
      <motion.blockquote
        className="mb-8 max-w-lg rounded-2xl border border-[var(--color-primary-from)]/20 bg-[var(--color-primary-from)]/5 px-6 py-4 italic text-[var(--text-2)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        "O futuro pertence àqueles que acreditam na beleza de seus sonhos."
        <span className="mt-2 block text-sm font-medium text-[var(--color-primary-from)]">
          — ALSHAM 360°
        </span>
      </motion.blockquote>

      {/* Action Button */}
      {action && (
        <motion.button
          onClick={action.onClick}
          className="rounded-2xl bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--accent-fuchsia)] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-[0_0_30px_var(--color-primary-from)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ❌ ERROR STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorState({
  message = "Ops! Algo deu errado ao carregar a página.",
  onRetry
}: ErrorStateProps) {
  return (
    <motion.div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="grid h-20 w-20 place-content-center rounded-full bg-[var(--accent-alert)]/10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AlertCircle className="h-10 w-10 text-[var(--accent-alert)]" />
      </motion.div>
      <p className="text-lg text-[var(--text-2)]">{message}</p>
      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="rounded-xl bg-[var(--surface)] px-6 py-2 text-sm font-medium text-[var(--text)] border border-[var(--border)] hover:border-[var(--color-primary-from)]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Tentar novamente
        </motion.button>
      )}
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 PROPS DO LAYOUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface LayoutSupremoProps {
  children: ReactNode;
  title?: string;
  theme?: ThemeKey;
  onThemeChange?: (theme: ThemeKey) => void;
  activePage?: string;
  onNavigate?: (pageId: string) => void;
  currency?: 'BRL' | 'USD' | 'EUR';
  onCurrencyChange?: (currency: 'BRL' | 'USD' | 'EUR') => void;
  timeframe?: '7d' | '30d' | '90d';
  onTimeframeChange?: (timeframe: '7d' | '30d' | '90d') => void;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyStateProps?: EmptyStateProps;
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 MAIN LAYOUT COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function LayoutSupremo({
  children,
  title,
  theme = 'cyber-vivid',
  onThemeChange = () => {},
  activePage = 'dashboard-principal',
  onNavigate = () => {},
  currency = 'BRL',
  onCurrencyChange = () => {},
  timeframe = '30d',
  onTimeframeChange = () => {},
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyStateProps,
  userName = 'Victor Prado',
  userRole = 'Chief Growth Architect',
  userInitials = 'VP',
}: LayoutSupremoProps) {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close mobile nav on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((pageId: string) => {
    onNavigate(pageId);
    setMobileNavOpen(false);
  }, [onNavigate]);

  // Render content based on state
  const renderContent = () => {
    if (isLoading) {
      return <SkeletonLoading />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (isEmpty) {
      return <EmptyStateEpico {...emptyStateProps} />;
    }

    return children;
  };

  return (
    <div
      data-theme={theme}
      className="min-h-screen text-[var(--text)] transition-colors duration-300"
      style={{
        background: 'var(--bg)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Layout Grid */}
      <div className="min-h-screen md:grid md:grid-cols-1 lg:grid-cols-[auto_1fr]">
        {/* Desktop Sidebar */}
        <SidebarDesktop
          activePage={activePage}
          onNavigate={handleNavigate}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Mobile Sidebar */}
        <SidebarMobile
          activePage={activePage}
          onNavigate={handleNavigate}
          isOpen={isMobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* Mobile Nav Button (FAB) */}
        <MobileNavButton
          isOpen={isMobileNavOpen}
          onClick={() => setMobileNavOpen(!isMobileNavOpen)}
        />

        {/* Main Content Area */}
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <HeaderSupremo
            theme={theme}
            onThemeChange={onThemeChange}
            currency={currency}
            onCurrencyChange={onCurrencyChange}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            onMobileMenuToggle={() => setMobileNavOpen(!isMobileNavOpen)}
            isMobileMenuOpen={isMobileNavOpen}
            userName={userName}
            userRole={userRole}
            userInitials={userInitials}
          />

          {/* Main Content */}
          <main
            className="flex-1 overflow-y-auto"
            style={{
              backgroundImage: 'var(--gradient-veiled)',
              backgroundAttachment: 'fixed',
            }}
          >
            {/* Page Title */}
            {title && (
              <motion.div
                className="border-b border-[var(--border)]/50 px-4 py-4 sm:px-6 lg:px-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-[var(--color-primary-from)] via-[var(--accent-sky)] to-[var(--accent-fuchsia)] bg-clip-text text-transparent animate-gradient-x">
                    {title}
                  </span>
                </h1>
              </motion.div>
            )}

            {/* Page Content */}
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
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 EXPORTS ADICIONAIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { SkeletonLoading, SkeletonCard, EmptyStateEpico, ErrorState };
export type { LayoutSupremoProps, EmptyStateProps, ErrorStateProps };
