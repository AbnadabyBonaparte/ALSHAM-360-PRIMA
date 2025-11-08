// src/components/leads/AIInsightsPanel.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, TrendingUp, AlertTriangle, Target, Lightbulb,
  Zap, ThumbsUp, Clock, Award, ArrowRight
} from 'lucide-react';
import { useState } from 'react';

interface AIInsight {
  type: 'opportunity' | 'warning' | 'action' | 'info';
  icon: string;
  title: string;
  message: string;
  action?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low';
}

interface AIInsightsPanelProps {
  insights: AIInsight[];
  conversionProb: number;
  healthScore: number;
  riskScore: number;
  nextAction: any;
}

export default function AIInsightsPanel({
  insights = [],
  conversionProb = 0,
  healthScore = 0,
  riskScore = 0,
  nextAction
}: AIInsightsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'from-emerald-500 to-teal-500';
      case 'warning': return 'from-orange-500 to-red-500';
      case 'action': return 'from-blue-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'action': return <Zap className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div 
        className="p-6 border-b border-neutral-800 cursor-pointer hover:bg-neutral-900/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Insights IA</h3>
              <p className="text-sm text-gray-400">Análise inteligente em tempo real</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            className="text-gray-400"
          >
            <ArrowRight className="w-5 h-5 rotate-90" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-neutral-800">
              {/* Conversion Probability */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-gray-400">Conversão</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-400">
                    {conversionProb}%
                  </span>
                  {conversionProb > 70 && (
                    <span className="text-xs text-emerald-400">🔥 Quente</span>
                  )}
                </div>
                <div className="mt-2 h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${conversionProb}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  />
                </div>
              </motion.div>

              {/* Health Score */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Saúde</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-400">
                    {healthScore}%
                  </span>
                  {healthScore > 80 && (
                    <span className="text-xs text-blue-400">💚 Ótimo</span>
                  )}
                </div>
                <div className="mt-2 h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${healthScore}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  />
                </div>
              </motion.div>

              {/* Risk Score */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-400">Risco</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-orange-400">
                    {riskScore}%
                  </span>
                  {riskScore > 60 && (
                    <span className="text-xs text-orange-400">⚠️ Alto</span>
                  )}
                </div>
                <div className="mt-2 h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskScore}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  />
                </div>
              </motion.div>
            </div>

            {/* Next Best Action */}
            {nextAction && (
              <div className="p-6 border-b border-neutral-800 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{nextAction.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white">Próxima Melhor Ação</h4>
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-semibold
                        ${nextAction.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : ''}
                        ${nextAction.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : ''}
                        ${nextAction.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                        ${nextAction.priority === 'low' ? 'bg-green-500/20 text-green-400' : ''}
                      `}>
                        {nextAction.priority?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{nextAction.reason}</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      {nextAction.script}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Insights List */}
            <div className="p-6 space-y-3">
              {insights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum insight disponível no momento</p>
                </div>
              ) : (
                insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className={`
                      p-4 rounded-xl border backdrop-blur-sm
                      bg-gradient-to-r ${getInsightColor(insight.type)}/10
                      border-${insight.type === 'opportunity' ? 'emerald' : insight.type === 'warning' ? 'orange' : 'blue'}-500/20
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        bg-gradient-to-br ${getInsightColor(insight.type)}
                      `}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-white mb-1">{insight.title}</h5>
                        <p className="text-sm text-gray-300 mb-2">{insight.message}</p>
                        {insight.action && (
                          <button className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                            {insight.action}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
