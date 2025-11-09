// src/components/leads/SmartFilters.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Sparkles } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface SmartFiltersProps {
  onFilterChange: (filters: any) => void;
  totalResults: number;
}

export default function SmartFilters({ onFilterChange, totalResults }: SmartFiltersProps) {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    score: 'all',
    source: 'all',
    risk: 'all',
    conversion: 'all'
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 FIX: BUSCA EM TEMPO REAL COM DEBOUNCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const debouncedSearch = useDebounce(searchText, 300); // Aguarda 300ms após parar de digitar

  useEffect(() => {
    const newFilters = {
      ...filters,
      search: debouncedSearch || undefined
    };

    // Remover campos 'all'
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] === 'all' || newFilters[key] === undefined) {
        delete newFilters[key];
      }
    });

    console.log('🔍 Aplicando filtros:', newFilters);
    onFilterChange(newFilters);
  }, [debouncedSearch, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearSearch = () => {
    setSearchText('');
  };

  const clearAllFilters = () => {
    setSearchText('');
    setFilters({
      status: 'all',
      score: 'all',
      source: 'all',
      risk: 'all',
      conversion: 'all'
    });
  };

  const hasActiveFilters = 
    searchText || 
    filters.status !== 'all' || 
    filters.score !== 'all' || 
    filters.source !== 'all' || 
    filters.risk !== 'all' || 
    filters.conversion !== 'all';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar por nome, email, empresa..."
            className="w-full pl-12 pr-12 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searchText && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {/* Indicador de digitação */}
          {searchText && searchText !== debouncedSearch && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${showFilters ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-white'}`}
        >
          <Filter className="w-5 h-5" />
          Filtros
        </motion.button>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {totalResults} {totalResults === 1 ? 'lead encontrado' : 'leads encontrados'}
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Filtros Inteligentes</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="all">Todos</option>
                  <option value="novo">Novo</option>
                  <option value="contacted">Contatado</option>
                  <option value="qualified">Qualificado</option>
                  <option value="qualificado">Qualificado</option>
                  <option value="proposal">Proposta</option>
                  <option value="negotiation">Negociação</option>
                  <option value="won">Ganho</option>
                  <option value="convertido">Convertido</option>
                </select>
              </div>

              {/* Score IA */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Score IA</label>
                <select
                  value={filters.score}
                  onChange={(e) => handleFilterChange('score', e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="all">Todos</option>
                  <option value="hot">🔥 Quente (80+)</option>
                  <option value="warm">🌡️ Morno (60-79)</option>
                  <option value="cold">❄️ Frio (40-59)</option>
                  <option value="ice">🧊 Congelado (&lt;40)</option>
                </select>
              </div>

              {/* Origem */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Origem</label>
                <select
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="all">Todas</option>
                  <option value="website">Website</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="email">Email</option>
                  <option value="referral">Indicação</option>
                  <option value="campaign">Campanha</option>
                </select>
              </div>

              {/* Risco */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Risco</label>
                <select
                  value={filters.risk}
                  onChange={(e) => handleFilterChange('risk', e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="all">Todos</option>
                  <option value="low">✅ Baixo</option>
                  <option value="medium">⚠️ Médio</option>
                  <option value="high">🚨 Alto</option>
                </select>
              </div>

              {/* Conversão */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Conversão</label>
                <select
                  value={filters.conversion}
                  onChange={(e) => handleFilterChange('conversion', e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="all">Todos</option>
                  <option value="vhigh">🎯 Muito Alta (80+)</option>
                  <option value="high">✨ Alta (60-79)</option>
                  <option value="medium">⭐ Média (40-59)</option>
                  <option value="low">💤 Baixa (&lt;40)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
