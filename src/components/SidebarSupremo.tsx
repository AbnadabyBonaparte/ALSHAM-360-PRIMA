// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - SIDEBAR SUPREMO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 DOMINAÇÃO VISUAL TOTAL - Sidebar por Categoria com Responsividade Alienígena
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Target,
  GitBranch,
  FileText,
  FileSignature,
  Receipt,
  Wallet,
  Inbox,
  MessageCircle,
  Mail,
  MessageSquare,
  BarChart3,
  PieChart,
  Brain,
  CheckSquare,
  Calendar,
  Zap,
  Trophy,
  Settings,
  Shield,
  Globe,
  ChevronDown,
  ChevronRight,
  Sparkles,
  X,
  Menu,
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 ESTRUTURA DA SIDEBAR POR CATEGORIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SidebarLink {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SidebarCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  links: SidebarLink[];
}

// Categorias EXATAMENTE como solicitado
export const sidebarCategories: SidebarCategory[] = [
  {
    id: 'crm-core',
    label: 'CRM Core',
    icon: <Target className="h-5 w-5" />,
    accentColor: 'var(--accent-emerald)',
    links: [
      { id: 'dashboard-principal', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: 'leads-lista', label: 'Leads', icon: <Users className="h-4 w-4" /> },
      { id: 'contatos-lista', label: 'Contatos', icon: <UserCircle className="h-4 w-4" /> },
      { id: 'oportunidades-lista', label: 'Oportunidades', icon: <Target className="h-4 w-4" /> },
      { id: 'pipeline-de-vendas', label: 'Pipeline', icon: <GitBranch className="h-4 w-4" /> },
    ],
  },
  {
    id: 'vendas-financeiro',
    label: 'Vendas & Financeiro',
    icon: <Wallet className="h-5 w-5" />,
    accentColor: 'var(--accent-sky)',
    links: [
      { id: 'cotacoes', label: 'Cotações', icon: <FileText className="h-4 w-4" /> },
      { id: 'contratos-lista', label: 'Contratos', icon: <FileSignature className="h-4 w-4" /> },
      { id: 'faturas-lista', label: 'Faturas', icon: <Receipt className="h-4 w-4" /> },
      { id: 'financeiro', label: 'Financeiro', icon: <Wallet className="h-4 w-4" /> },
    ],
  },
  {
    id: 'comunicacao',
    label: 'Comunicação',
    icon: <MessageCircle className="h-5 w-5" />,
    accentColor: 'var(--accent-fuchsia)',
    links: [
      { id: 'inbox', label: 'Inbox', icon: <Inbox className="h-4 w-4" /> },
      { id: 'whatsapp-chat', label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" /> },
      { id: 'email-marketing-dashboard', label: 'E-mail Marketing', icon: <Mail className="h-4 w-4" /> },
      { id: 'sms-marketing', label: 'SMS', icon: <MessageSquare className="h-4 w-4" /> },
    ],
  },
  {
    id: 'inteligencia',
    label: 'Inteligência',
    icon: <Brain className="h-5 w-5" />,
    accentColor: 'var(--color-primary-from)',
    links: [
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
      { id: 'relatorios-dashboard', label: 'Relatórios', icon: <PieChart className="h-4 w-4" /> },
      { id: 'ai-assistant', label: 'AI Assistant', icon: <Brain className="h-4 w-4" /> },
    ],
  },
  {
    id: 'operacoes',
    label: 'Operações',
    icon: <Zap className="h-5 w-5" />,
    accentColor: 'var(--accent-amber)',
    links: [
      { id: 'atividades-tarefas', label: 'Tarefas', icon: <CheckSquare className="h-4 w-4" /> },
      { id: 'calendario', label: 'Calendário', icon: <Calendar className="h-4 w-4" /> },
      { id: 'automacoes', label: 'Automações', icon: <Zap className="h-4 w-4" /> },
      { id: 'gamificacao', label: 'Gamificação', icon: <Trophy className="h-4 w-4" /> },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: <Settings className="h-5 w-5" />,
    accentColor: 'var(--text-secondary)',
    links: [
      { id: 'configuracoes', label: 'Configurações', icon: <Settings className="h-4 w-4" /> },
      { id: 'seguranca', label: 'Segurança', icon: <Shield className="h-4 w-4" /> },
      { id: 'publicacao', label: 'Publicação', icon: <Globe className="h-4 w-4" /> },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 PROPS DO COMPONENTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SidebarSupremoProps {
  activePage: string;
  onNavigate: (pageId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖥️ SIDEBAR DESKTOP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function SidebarDesktop({ activePage, onNavigate, isCollapsed = false }: SidebarSupremoProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['crm-core']);
  const [isHovered, setIsHovered] = useState(false);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  // Auto-expand categoria da página ativa
  useEffect(() => {
    const activeCategory = sidebarCategories.find((cat) =>
      cat.links.some((link) => link.id === activePage)
    );
    if (activeCategory && !expandedCategories.includes(activeCategory.id)) {
      setExpandedCategories((prev) => [...prev, activeCategory.id]);
    }
  }, [activePage]);

  const showLabels = !isCollapsed || isHovered;

  return (
    <aside
      className={`hidden lg:flex flex-col min-h-screen border-r border-[var(--border)] bg-[var(--surface-strong)]/80 backdrop-blur-2xl transition-all duration-500 ease-out ${
        isCollapsed && !isHovered ? 'w-20' : 'w-72 xl:w-80'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Header */}
      <motion.div
        onClick={() => onNavigate('dashboard-principal')}
        className="sticky top-0 z-10 flex items-center gap-3 bg-[var(--surface-strong)]/95 px-4 py-5 backdrop-blur-xl cursor-pointer hover:bg-[var(--surface)]/95 transition-all duration-300 group border-b border-[var(--border)]/50"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="relative">
          <div className="grid h-11 w-11 place-content-center rounded-2xl bg-gradient-to-br from-[var(--color-primary-from)] via-[var(--accent-sky)] to-[var(--accent-fuchsia)] text-white font-bold text-lg shadow-lg group-hover:shadow-[var(--color-primary-from)]/30 transition-shadow duration-300">
            A∞
          </div>
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[var(--accent-emerald)] border-2 border-[var(--surface-strong)] animate-pulse" />
        </div>
        <AnimatePresence mode="wait">
          {showLabels && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-primary-from)] font-semibold">ALSHAM</p>
              <p className="text-base font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
                360° PRIMA
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
        <div className="space-y-2">
          {sidebarCategories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const hasActiveLink = category.links.some((link) => link.id === activePage);

            return (
              <div key={category.id} className="space-y-1">
                {/* Category Header */}
                <motion.button
                  onClick={() => toggleCategory(category.id)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300 ${
                    hasActiveLink
                      ? 'bg-[var(--color-primary-from)]/15 border border-[var(--color-primary-from)]/30'
                      : 'hover:bg-[var(--surface)]/80 border border-transparent hover:border-[var(--border)]'
                  }`}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ ['--cat-accent' as string]: category.accentColor }}
                >
                  <span
                    className={`grid h-9 w-9 place-content-center rounded-xl transition-all duration-300 ${
                      hasActiveLink
                        ? 'bg-[var(--color-primary-from)]/20 text-[var(--color-primary-from)] shadow-lg'
                        : 'bg-[var(--surface)] text-[var(--text-secondary)] group-hover:text-[var(--color-primary-from)] group-hover:bg-[var(--color-primary-from)]/10'
                    }`}
                    style={{
                      boxShadow: hasActiveLink ? `0 0 20px color-mix(in srgb, ${category.accentColor} 30%, transparent)` : 'none',
                    }}
                  >
                    {category.icon}
                  </span>
                  <AnimatePresence mode="wait">
                    {showLabels && (
                      <motion.div
                        className="flex flex-1 items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className={`text-sm font-semibold ${hasActiveLink ? 'text-[var(--color-primary-from)]' : 'text-[var(--text-primary)]'}`}>
                          {category.label}
                        </span>
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Category Links */}
                <AnimatePresence>
                  {isExpanded && showLabels && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="ml-3 space-y-1 overflow-hidden border-l-2 border-[var(--border)]/50 pl-3"
                    >
                      {category.links.map((link, index) => {
                        const isActive = activePage === link.id;

                        return (
                          <motion.li
                            key={link.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <motion.button
                              onClick={() => onNavigate(link.id)}
                              className={`group/link flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                                isActive
                                  ? 'bg-[var(--color-primary-from)]/20 text-[var(--color-primary-from)] shadow-md'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/60'
                              }`}
                              whileHover={{ x: 4, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              style={{
                                boxShadow: isActive
                                  ? `0 4px 20px color-mix(in srgb, ${category.accentColor} 25%, transparent)`
                                  : 'none',
                              }}
                            >
                              <span className={`transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover/link:scale-110'}`}>
                                {link.icon}
                              </span>
                              <span className="text-sm font-medium">{link.label}</span>
                              {isActive && (
                                <motion.span
                                  className="ml-auto h-2 w-2 rounded-full bg-[var(--color-primary-from)]"
                                  layoutId="activeIndicator"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  style={{
                                    boxShadow: `0 0 10px ${category.accentColor}`,
                                  }}
                                />
                              )}
                            </motion.button>
                          </motion.li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer - Copilot Card */}
      <AnimatePresence>
        {showLabels && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-t border-[var(--border)]/50 p-4"
          >
            <motion.div
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-primary-from)]/30 bg-gradient-to-br from-[var(--color-primary-from)]/10 to-[var(--accent-fuchsia)]/10 p-4 backdrop-blur-sm"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="grid h-10 w-10 place-content-center rounded-xl bg-[var(--color-primary-from)]/20 text-[var(--color-primary-from)]">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--accent-fuchsia)] bg-clip-text text-transparent">
                  Copilot 360°
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  IA Generativa Integrada
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 SIDEBAR MOBILE (DRAWER)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SidebarMobileProps extends SidebarSupremoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarMobile({ activePage, onNavigate, isOpen, onClose }: SidebarMobileProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['crm-core']);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigate = (pageId: string) => {
    onNavigate(pageId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed left-0 top-0 z-50 flex h-full w-[85vw] max-w-[360px] flex-col bg-[var(--surface)]/98 backdrop-blur-2xl shadow-2xl lg:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)]/50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-content-center rounded-xl bg-gradient-to-br from-[var(--color-primary-from)] via-[var(--accent-sky)] to-[var(--accent-fuchsia)] text-white font-bold shadow-lg">
                  A∞
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--color-primary-from)] font-semibold">ALSHAM</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">360° PRIMA</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="grid h-10 w-10 place-content-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-3">
                {sidebarCategories.map((category) => {
                  const isExpanded = expandedCategories.includes(category.id);
                  const hasActiveLink = category.links.some((link) => link.id === activePage);

                  return (
                    <div
                      key={category.id}
                      className="rounded-2xl border border-[var(--border)]/60 bg-[var(--surface-strong)]/50 overflow-hidden"
                    >
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className={`flex w-full items-center justify-between px-4 py-3.5 transition-colors ${
                          hasActiveLink ? 'bg-[var(--color-primary-from)]/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-9 w-9 place-content-center rounded-xl ${
                              hasActiveLink
                                ? 'bg-[var(--color-primary-from)]/20 text-[var(--color-primary-from)]'
                                : 'bg-[var(--surface)] text-[var(--text-secondary)]'
                            }`}
                          >
                            {category.icon}
                          </span>
                          <span className={`font-semibold ${hasActiveLink ? 'text-[var(--color-primary-from)]' : 'text-[var(--text-primary)]'}`}>
                            {category.label}
                          </span>
                        </div>
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-5 w-5 text-[var(--text-secondary)]" />
                        </motion.span>
                      </button>

                      {/* Links */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-[var(--border)]/30 px-3 py-2"
                          >
                            <div className="space-y-1">
                              {category.links.map((link) => {
                                const isActive = activePage === link.id;

                                return (
                                  <motion.button
                                    key={link.id}
                                    onClick={() => handleNavigate(link.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                                      isActive
                                        ? 'bg-[var(--color-primary-from)]/20 text-[var(--color-primary-from)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]/80 hover:text-[var(--text-primary)]'
                                    }`}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <span className={isActive ? 'text-[var(--color-primary-from)]' : ''}>
                                      {link.icon}
                                    </span>
                                    <span className="font-medium">{link.label}</span>
                                    {isActive && (
                                      <span className="ml-auto h-2 w-2 rounded-full bg-[var(--color-primary-from)] shadow-[0_0_10px_var(--color-primary-from)]" />
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-[var(--border)]/50 p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-primary-from)]/30 bg-gradient-to-r from-[var(--color-primary-from)]/10 to-[var(--accent-fuchsia)]/10 p-4">
                <div className="grid h-10 w-10 place-content-center rounded-xl bg-[var(--color-primary-from)]/20 text-[var(--color-primary-from)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-primary-from)]">Copilot 360°</p>
                  <p className="text-xs text-[var(--text-secondary)]">IA Generativa</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 MOBILE NAV BUTTON (FAB)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MobileNavButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MobileNavButton({ isOpen, onClick }: MobileNavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-primary-from)]/30 bg-[var(--surface)]/95 text-[var(--color-primary-from)] shadow-xl backdrop-blur-xl lg:hidden"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px color-mix(in srgb, var(--color-primary-from) 30%, transparent)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ rotate: isOpen ? 180 : 0 }}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.span
            key="close"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
          >
            <X className="h-6 w-6" />
          </motion.span>
        ) : (
          <motion.span
            key="menu"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
          >
            <Menu className="h-6 w-6" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 EXPORT DEFAULT - Componente Completo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function SidebarSupremo(props: SidebarSupremoProps) {
  return <SidebarDesktop {...props} />;
}
