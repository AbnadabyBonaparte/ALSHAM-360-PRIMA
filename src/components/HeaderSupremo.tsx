// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - HEADER SUPREMO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 DOMINAÇÃO VISUAL TOTAL - Header com Seletor de Tema Neon Insano
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Command,
  Bell,
  ChevronDown,
  Menu,
  X,
  Palette,
  Globe2,
  Sparkles,
  Check,
} from 'lucide-react';
import { themeList, type ThemeKey } from '../lib/themes';
import { useTheme } from '@/hooks/useTheme';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 PROPS DO COMPONENTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface HeaderSupremoProps {
  currency: 'BRL' | 'USD' | 'EUR';
  onCurrencyChange: (currency: 'BRL' | 'USD' | 'EUR') => void;
  timeframe: '7d' | '30d' | '90d';
  onTimeframeChange: (timeframe: '7d' | '30d' | '90d') => void;
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 THEME SELECTOR COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<ThemeKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeData = themeList.find((t) => t.key === currentTheme) || themeList[0];

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all duration-300 ${
          isOpen
            ? 'border-[var(--color-primary-from)]/50 bg-[var(--color-primary-from)]/10 shadow-lg'
            : 'border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--color-primary-from)]/30'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          boxShadow: isOpen
            ? '0 0 20px color-mix(in srgb, var(--color-primary-from) 20%, transparent)'
            : 'none',
        }}
      >
        <Palette className={`h-4 w-4 ${isOpen ? 'text-[var(--color-primary-from)]' : 'text-[var(--accent-sky)]'}`} />
        <span
          className="h-5 w-5 rounded-full border border-white/20 shadow-md"
          style={{ background: currentThemeData.swatch }}
        />
        <span className="hidden text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] sm:block">
          {currentThemeData.emoji}
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3 w-3 text-[var(--text-secondary)]" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] sm:w-72 origin-top-right rounded-3xl border border-[var(--border-strong)] bg-[var(--surface)]/98 p-3 shadow-2xl backdrop-blur-2xl"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 30px color-mix(in srgb, var(--color-primary-from) 15%, transparent)',
            }}
          >
            <div className="mb-2 px-2">
              <p className="text-[0.625rem] sm:text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-from)]">
                Temas Neon
              </p>
              <p className="text-[0.625rem] sm:text-xs text-[var(--text-secondary)]">
                Escolha sua vibe cósmica
              </p>
            </div>

            <div className="space-y-1">
              {themeList.map((theme) => {
                const isSelected = theme.key === currentTheme;
                const isHovered = theme.key === hoveredTheme;

                return (
                  <motion.button
                    key={theme.key}
                    onClick={() => {
                      setTheme(theme.key);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHoveredTheme(theme.key)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-[var(--color-primary-from)]/15 ring-1 ring-[var(--color-primary-from)]/50'
                        : 'hover:bg-[var(--surface-strong)]/80'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Theme Swatch Preview */}
                    <div className="relative">
                      <motion.span
                        className="block h-10 w-10 rounded-xl border border-white/10 shadow-lg"
                        style={{ background: theme.swatch }}
                        animate={{
                          scale: isHovered || isSelected ? 1.1 : 1,
                          boxShadow:
                            isHovered || isSelected
                              ? `0 0 20px color-mix(in srgb, ${theme.colors.accentPrimary} 50%, transparent)`
                              : '0 4px 12px rgba(0,0,0,0.3)',
                        }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      />
                      {isSelected && (
                        <motion.span
                          className="absolute -bottom-1 -right-1 grid h-5 w-5 place-content-center rounded-full bg-[var(--color-primary-from)] text-white shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <Check className="h-3 w-3" />
                        </motion.span>
                      )}
                    </div>

                    {/* Theme Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{theme.emoji}</span>
                        <span
                          className={`text-sm font-bold ${
                            isSelected ? 'text-[var(--color-primary-from)]' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {theme.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[0.625rem] sm:text-xs text-[var(--text-secondary)]">
                        {theme.description}
                      </p>
                    </div>

                    {/* Hover Glow Effect */}
                    {(isHovered || isSelected) && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        style={{ background: theme.swatch }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-[var(--surface-strong)]/50 px-3 py-2">
              <Sparkles className="h-3 w-3 text-[var(--color-primary-from)]" />
              <span className="text-[0.625rem] sm:text-xs text-[var(--text-secondary)]">
                Tema atual: <strong className="text-[var(--color-primary-from)]">{currentThemeData.name}</strong>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 CURRENCY & TIMEFRAME CONTROLS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ControlGroupProps {
  currency: 'BRL' | 'USD' | 'EUR';
  onCurrencyChange: (currency: 'BRL' | 'USD' | 'EUR') => void;
  timeframe: '7d' | '30d' | '90d';
  onTimeframeChange: (timeframe: '7d' | '30d' | '90d') => void;
}

function ControlGroup({ currency, onCurrencyChange, timeframe, onTimeframeChange }: ControlGroupProps) {
  const currencies: Array<{ value: 'BRL' | 'USD' | 'EUR'; label: string; color: string }> = [
    { value: 'BRL', label: 'BRL', color: 'var(--accent-emerald)' },
    { value: 'USD', label: 'USD', color: 'var(--accent-sky)' },
    { value: 'EUR', label: 'EUR', color: 'var(--accent-fuchsia)' },
  ];

  const timeframes: Array<{ value: '7d' | '30d' | '90d'; label: string; color: string }> = [
    { value: '7d', label: '7D', color: 'var(--accent-emerald)' },
    { value: '30d', label: '30D', color: 'var(--accent-sky)' },
    { value: '90d', label: '90D', color: 'var(--accent-fuchsia)' },
  ];

  return (
    <div className="hidden items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 md:flex">
      <Globe2 className="h-4 w-4 text-[var(--color-primary-from)]" />

      {/* Currency Selector */}
      <div className="flex items-center gap-1">
        {currencies.map((c) => (
          <motion.button
            key={c.value}
            onClick={() => onCurrencyChange(c.value)}
            className={`rounded-lg px-2 py-1 text-[0.625rem] sm:text-xs font-bold uppercase tracking-wider transition-all ${
              currency === c.value
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            style={{
              color: currency === c.value ? c.color : undefined,
              textShadow: currency === c.value ? `0 0 10px ${c.color}` : 'none',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {c.label}
          </motion.button>
        ))}
      </div>

      <span className="h-4 w-px bg-[var(--border)]" />

      {/* Timeframe Selector */}
      <div className="flex items-center gap-1">
        {timeframes.map((t) => (
          <motion.button
            key={t.value}
            onClick={() => onTimeframeChange(t.value)}
            className={`rounded-lg px-2 py-1 text-[0.625rem] sm:text-xs font-bold uppercase tracking-wider transition-all ${
              timeframe === t.value
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            style={{
              color: timeframe === t.value ? t.color : undefined,
              textShadow: timeframe === t.value ? `0 0 10px ${t.color}` : 'none',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {t.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔔 NOTIFICATION BUTTON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function NotificationButton() {
  const [hasNotifications] = useState(true);

  return (
    <motion.button
      className="relative grid h-9 w-9 sm:h-11 sm:w-11 place-content-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors hover:text-[var(--color-primary-from)] hover:border-[var(--color-primary-from)]/30"
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 20px color-mix(in srgb, var(--color-primary-from) 20%, transparent)',
      }}
      whileTap={{ scale: 0.95 }}
    >
      <Bell className="h-5 w-5" />
      {hasNotifications && (
        <motion.span
          className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[var(--accent-alert)] ring-2 ring-[var(--surface)]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
          style={{
            boxShadow: '0 0 10px var(--accent-alert)',
          }}
        />
      )}
    </motion.button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 USER PROFILE CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UserProfileProps {
  name: string;
  role: string;
  initials: string;
}

function UserProfile({ name, role, initials }: UserProfileProps) {
  return (
    <motion.button
      className="flex items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 transition-all hover:border-[var(--color-primary-from)]/30"
      whileHover={{
        scale: 1.02,
        boxShadow: '0 0 20px color-mix(in srgb, var(--color-primary-from) 15%, transparent)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <div className="grid h-9 w-9 place-content-center rounded-xl bg-gradient-to-br from-[var(--color-primary-from)] via-[var(--accent-sky)] to-[var(--accent-fuchsia)] text-sm font-bold text-white shadow-lg">
          {initials}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[var(--accent-emerald)] ring-2 ring-[var(--surface)]" />
      </div>
      <div className="hidden text-left lg:block">
        <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">{name}</p>
        <p className="text-[0.625rem] sm:text-xs font-medium text-[var(--color-primary-from)]">{role}</p>
      </div>
      <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
    </motion.button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 SEARCH BAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className="relative flex-1"
      animate={{
        scale: isFocused ? 1.01 : 1,
      }}
    >
      <Search
        className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
          isFocused ? 'text-[var(--color-primary-from)]' : 'text-[var(--text-secondary)]'
        }`}
      />
      <input
        type="text"
        placeholder="Pesquisar leads, deals, automações, insights..."
        className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] py-3 pl-12 pr-16 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-all duration-300 focus:border-[var(--color-primary-from)]/50 focus:outline-none focus:ring-0"
        style={{
          boxShadow: isFocused
            ? '0 0 20px color-mix(in srgb, var(--color-primary-from) 15%, transparent), inset 0 0 20px color-mix(in srgb, var(--color-primary-from) 5%, transparent)'
            : 'none',
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <motion.span
        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-strong)] px-2 py-1"
        animate={{
          borderColor: isFocused ? 'var(--color-primary-from)' : 'var(--border-strong)',
        }}
      >
        <Command className="h-3 w-3 text-[var(--text-secondary)]" />
        <span className="text-[0.625rem] sm:text-xs font-bold tracking-wider text-[var(--text-secondary)]">K</span>
      </motion.span>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 MAIN HEADER COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function HeaderSupremo({
  currency,
  onCurrencyChange,
  timeframe,
  onTimeframeChange,
  onMobileMenuToggle,
  isMobileMenuOpen,
  userName = 'Victor Prado',
  userRole = 'Chief Growth Architect',
  userInitials = 'VP',
}: HeaderSupremoProps) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface-strong)]/80 backdrop-blur-2xl"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        {/* Mobile Menu Toggle */}
        <motion.button
          onClick={onMobileMenuToggle}
          className="grid h-10 w-10 place-content-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--color-primary-from)] lg:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
              >
                <X className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
              >
                <Menu className="h-5 w-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Search Bar */}
        <SearchBar />

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Currency & Timeframe */}
          <ControlGroup
            currency={currency}
            onCurrencyChange={onCurrencyChange}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
          />

          {/* Theme Selector */}
          <ThemeSelector />

          {/* Notifications */}
          <NotificationButton />

          {/* User Profile */}
          <UserProfile name={userName} role={userRole} initials={userInitials} />
        </div>
      </div>
    </header>
  );
}
