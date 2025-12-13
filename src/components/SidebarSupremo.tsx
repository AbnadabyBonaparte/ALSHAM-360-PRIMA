// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - SIDEBAR SUPREMO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 DOMINAÇÃO VISUAL TOTAL - Sidebar por Categoria com Responsividade Alienígena
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useState, useCallback, useEffect, useMemo } from 'react';
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
  Search,
} from 'lucide-react';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 ESTRUTURA DA SIDEBAR - IMPORTADA DE CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import {
  SIDEBAR_STRUCTURE,
  type SidebarCategory,
  type SidebarLink,
} from '@/config/sidebarStructure';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 HOOK OFICIAL DE TEMA (SSOT)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useTheme } from '@/hooks/useTheme'; // ← Nova importação
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
  const { isTransitioning } = useTheme(); // ← Pegamos o estado de transição do tema oficial

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['crm-core']);
  const [expandedLinks, setExpandedLinks] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredStructure = useMemo(() => {
    if (!searchTerm.trim()) return SIDEBAR_STRUCTURE;
    const term = searchTerm.toLowerCase();
    return SIDEBAR_STRUCTURE.map((category) => ({
      ...category,
      links: category.links.filter(
        (link) =>
          link.label.toLowerCase().includes(term) ||
          link.id.toLowerCase().includes(term)
      ),
    })).filter((category) => category.links.length > 0);
  }, [searchTerm]);
  const toggleCategory = useCallback((categoryId: string) => {
    console.log(`[Sidebar] Toggling category: ${categoryId}`); // Debug log
    setExpandedCategories((prev) => {
      const newState = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      console.log(`[Sidebar] Expanded categories:`, newState); // Debug log
      return newState;
    });
  }, []);
  const toggleLink = useCallback((linkId: string) => {
    console.log(`[Sidebar] Toggling link: ${linkId}`); // Debug log
    setExpandedLinks((prev) => {
      const newState = prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId];
      console.log(`[Sidebar] Expanded links:`, newState); // Debug log
      return newState;
    });
  }, []);
  // Auto-expand categoria da página ativa
  useEffect(() => {
    const activeCategory = SIDEBAR_STRUCTURE.find((cat) =>
      cat.links.some((link) => link.id === activePage)
    );
    if (activeCategory && !expandedCategories.includes(activeCategory.id)) {
      setExpandedCategories((prev) => [...prev, activeCategory.id]);
    }
  }, [activePage]);
  const showLabels = !isCollapsed || isHovered;
  // Função recursiva para renderizar links (suporta hierarquia)
  const renderLink = useCallback(
    (link: SidebarLink, category: SidebarCategory, depth: number = 0, index: number = 0) => {
      const isActive = activePage === link.id;
      const hasChildren = link.children && link.children.length > 0;
      const isLinkExpanded = expandedLinks.includes(link.id);
      const paddingLeft = depth * 12; // 12px por nível de profundidade
      return (
        <motion.li
          key={link.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <motion.button
            onClick={() => {
              if (hasChildren) {
                toggleLink(link.id);
              } else {
                onNavigate(link.id);
              }
            }}
            className={`group/link flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
              isActive
                ? 'bg-[var(--color-primary-from)]/20 text-[var(--color-primary-from)] shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/60'
            }`}
            style={{
              paddingLeft: `${12 + paddingLeft}px`,
              boxShadow: isActive
                ? `0 4px 20px color-mix(in srgb, ${category.accentColor} 25%, transparent)`
                : 'none',
            }}
            whileHover={{ x: 4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {link.icon && (
              <span className={`transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover/link:scale-110'}`}>
                {link.icon}
              </span>
            )}
            <span className="text-sm font-medium flex-1">{link.label}</span>
            {/* Badge de status */}
            {link.status === 'placeholder' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] font-medium">
                Dev
              </span>
            )}
            {link.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-fuchsia)]/20 text-[var(--accent-fuchsia)] font-medium">
                {link.badge}
              </span>
            )}
            {/* Indicador de children */}
            {hasChildren && (
              <motion.span
                animate={{ rotate: isLinkExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-3 w-3" />
              </motion.span>
            )}
            {/* Indicador ativo */}
            {isActive && !hasChildren && (
              <motion.span
                className="h-2 w-2 rounded-full bg-[var(--color-primary-from)]"
                layoutId={`activeIndicator-${category.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  boxShadow: `0 0 10px ${category.accentColor}`,
                }}
              />
            )}
          </motion.button>
          {/* Renderizar children recursivamente */}
          {hasChildren && isLinkExpanded && (
            <AnimatePresence>
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 overflow-hidden"
              >
                {link.children!.map((childLink, childIndex) =>
                  renderLink(childLink, category, depth + 1, childIndex)
                )}
              </motion.ul>
            </AnimatePresence>
          )}
        </motion.li>
      );
    },
    [activePage, expandedLinks, toggleLink, onNavigate]
  );
  return (
    <aside
      className={`hidden lg:flex flex-col min-h-screen border-r border-[var(--border)] bg-[var(--surface-strong)]/80 backdrop-blur-2xl transition-all duration-500 ease-out ${
        isCollapsed && !isHovered ? 'w-16 lg:w-20' : 'w-64 md:w-72 lg:w-80 xl:w-[22rem]'
      } ${isTransitioning ? 'theme-switching' : ''}`} // ← Classe de transição oficial
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
              <p className="text-[0.625rem] sm:text-xs uppercase tracking-[0.4em] text-[var(--color-primary-from)] font-semibold">ALSHAM</p>
              <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
                360° PRIMA
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar página..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--color-primary-from)] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--surface-strong)] rounded"
              >
                <X className="h-3 w-3 text-[var(--text-secondary)]" />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {filteredStructure.map((category) => {
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
                {showLabels && (
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="ml-3 space-y-1 overflow-hidden border-l-2 border-[var(--border)]/50 pl-3"
                      >
                        {category.links.map((link, index) => renderLink(link, category, 0, index))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                )}
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
  const { isTransitioning } = useTheme(); // ← Também no mobile, para transição suave

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['crm-core']);
  const [expandedLinks, setExpandedLinks] = useState<string[]>([]);
  const toggleCategory = useCallback((categoryId: string) => {
    console.log(`[Sidebar] Toggling category: ${categoryId}`); // Debug log
    setExpandedCategories((prev) => {
      const newState = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      console.log(`[Sidebar] Expanded categories:`, newState); // Debug log
      return newState;
    });
  }, []);
  const toggleLink = useCallback((linkId: string) => {
    console.log(`[Sidebar] Toggling link: ${linkId}`); // Debug log
    setExpandedLinks((prev) => {
      const newState = prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId];
      console.log(`[Sidebar] Expanded links:`, newState); // Debug log
      return newState;
    });
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
  // Função recursiva para renderizar links no mobile
  const renderLinkMobile = useCallback(
    (link: SidebarLink, category: SidebarCategory, depth: number = 0) => {
      const isActive = activePage === link.id;
      const hasChildren = link.children && link.children.length > 0;
      const isLinkExpanded = expandedLinks.includes(link.id);
      const paddingLeft = depth * 16;
      return (
        <div key={link.id}>
          <motion.button
            onClick={() => {
              if (hasChildren) {
                toggleLink(link.id);
              } else {
                handleNavigate(link.id);
              }
            }}
            className={`flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left transition-all ${
              isActive
                ? 'bg-[var(--color-primary-from)]/20 text-[var(--color-primary-from)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]/80 hover:text-[var(--text-primary)]'
            }`}
            style={{ paddingLeft: `${16 + paddingLeft}px` }}
            whileTap={{ scale: 0.98 }}
          >
            {link.icon && (
              <span className={isActive ? 'text-[var(--color-primary-from)]' : ''}>
                {link.icon}
              </span>
            )}
            <span className="font-medium flex-1">{link.label}</span>
            {/* Badge de status */}
            {link.status === 'placeholder' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] font-medium">
                Dev
              </span>
            )}
            {link.badge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent-fuchsia)]/20 text-[var(--accent-fuchsia)] font-medium">
                {link.badge}
              </span>
            )}
            {/* Indicador de children */}
            {hasChildren && (
              <motion.span
                animate={{ rotate: isLinkExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-3 w-3" />
              </motion.span>
            )}
            {/* Indicador ativo */}
            {isActive && !hasChildren && (
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary-from)] shadow-[0_0_10px_var(--color-primary-from)]" />
            )}
          </motion.button>
          {/* Children */}
          {hasChildren && isLinkExpanded && (
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 overflow-hidden"
              >
                {link.children!.map((childLink) =>
                  renderLinkMobile(childLink, category, depth + 1)
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      );
    },
    [activePage, expandedLinks, toggleLink, handleNavigate]
  );
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
            className={`fixed left-0 top-0 z-50 flex h-full w-[85vw] sm:w-[75vw] md:w-[60vw] max-w-[min(400px,90vw)] flex-col bg-[var(--surface)]/98 backdrop-blur-2xl shadow-2xl lg:hidden ${isTransitioning ? 'theme-switching' : ''}`}
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
                  <p className="text-[0.625rem] sm:text-xs uppercase tracking-[0.35em] text-[var(--color-primary-from)] font-semibold">ALSHAM</p>
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">360° PRIMA</p>
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
                {SIDEBAR_STRUCTURE.map((category) => {
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
                              {category.links.map((link) => renderLinkMobile(link, category, 0))}
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
      className="fixed right-3 sm:right-4 z-40 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-[var(--color-primary-from)]/30 bg-[var(--surface)]/95 text-[var(--color-primary-from)] shadow-xl backdrop-blur-xl lg:hidden"
      style={{
        bottom: 'clamp(0.75rem, calc(env(safe-area-inset-bottom) + 1rem), 2rem)',
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
