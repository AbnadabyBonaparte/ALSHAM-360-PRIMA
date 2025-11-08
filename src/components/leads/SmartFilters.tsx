// src/components/leads/SmartFilters.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SmartFiltersProps {
  onFilterChange: (filters: any) => void;
  totalResults: number;
}

export default function SmartFilters({ onFilterChange, totalResults }: SmartFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    score: 'all',
    source: 'all',
    risk: 'all',
    conversion: 'all'
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFilterChange({ ...activeFilters, search: value });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange({ ...newFilters, search: searchTerm });
  };

  const clearFilters = () => {
    setActiveFilters({
      status: 'all',
      score: 'all',
      source: 'all',
      risk: 'all',
      conversion: 'all'
    });
    setSearchTerm('');
    onFilterChange({});
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v !== 'all').length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email, empresa..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          {searchTerm && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => handleSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </motion.button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`
            px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2
            ${showFilters 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
              : 'bg-neutral-900 border border-neutral-800 text-gray-300 hover:border-emerald-500'
            }
          `}
        >
          <Filter className="w-5 h-5" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </motion.button>

        {activeFilterCount > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
          >
            Limpar
          </motion.button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Filtros Inteligentes</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <select
                    value={activeFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="all">Todos</option>
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="qualified">Qualificado</option>
                    <option value="proposal">Proposta</option>
                    <option value="negotiation">Negociação</option>
                  </select>
                </div>

                {/* Score */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Score IA</label>
                  <select
                    value={activeFilters.score}
                    onChange={(e) => handleFilterChange('score', e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="all">Todos</option>
                    <option value="hot">🔥 Quente (80+)</option>
                    <option value="warm">👍 Bom (60-79)</option>
                    <option value="cold">😐 Morno (40-59)</option>
                    <option value="ice">🧊 Frio (&lt;40)</option>
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Origem</label>
                  <select
                    value={activeFilters.source}
                    onChange={(e) => handleFilterChange('source', e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="all">Todas</option>
                    <option value="organic">Orgânico</option>
                    <option value="referral">Indicação</option>
                    <option value="paid">Pago</option>
                    <option value="social">Social Media</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                {/* Risk */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Risco</label>
                  <select
                    value={activeFilters.risk}
                    onChange={(e) => handleFilterChange('risk', e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="all">Todos</option>
                    <option value="high">⚠️ Alto (60+)</option>
                    <option value="medium">😐 Médio (30-59)</option>
                    <option value="low">✅ Baixo (&lt;30)</option>
                  </select>
                </div>

                {/* Conversion Probability */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Conversão</label>
                  <select
                    value={activeFilters.conversion}
                    onChange={(e) => handleFilterChange('conversion', e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="all">Todos</option>
                    <option value="vhigh">🎯 Muito Alta (80+)</option>
                    <option value="high">📈 Alta (60-79)</option>
                    <option value="medium">📊 Média (40-59)</option>
                    <option value="low">📉 Baixa (&lt;40)</option>
                  </select>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-400">Sugestões IA</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs transition-colors">
                    Leads quentes sem follow-up
                  </button>
                  <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs transition-colors">
                    Alto risco de churn
                  </button>
                  <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs transition-colors">
                    Prontos para proposta
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{totalResults} leads encontrados</span>
        {activeFilterCount > 0 && (
          <span className="text-emerald-400">{activeFilterCount} filtros ativos</span>
        )}
      </div>
    </div>
  );
}
