// src/components/leads/AIInsightsPanel.tsx
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  Zap,
  ThumbsUp,
  Clock,
  Award,
  ArrowRight,
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
  nextAction,
}: AIInsightsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'from-[var(--accent-emerald)] to-[var(--accent-teal)]';
      case 'warning':
        return 'from-[var(--accent-orange)] to-[var(--accent-red)]';
      case 'action':
        return 'from-[var(--accent-blue)] to-[var(--accent-indigo)]';
      default:
        return 'from-[var(--neutral-gray)] to-[var(--neutral-gray-dark)]';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'action':
        return <Target className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-[var(--neutral-900)] border border-[var(--neutral-800)] rounded-2xl overflow-hidden"> // AJUSTE: Vars para bg/border (painel muda com tema)
      {/* Header */}
      <div
        className="bg-gradient-to-r from-[var(--neutral-800)] to-[var(--neutral-900)] p-4 cursor-pointer flex items-center justify-between" // AJUSTE: Vars
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-[var(--text-white)]" /> // AJUSTE: Var
          <h2 className="text-xl font-semibold text-[var(--text-white)]">Insights IA</h2> // AJUSTE: Var
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-gray-300)]">Análise inteligente em tempo real</span> // AJUSTE: Var
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowRight className="w-5 h-5 text-[var(--text-gray-400)]" /> // AJUSTE: Var
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
            className="overflow-hidden bg-[var(--neutral-50)] border-x border-b border-[var(--neutral-200)]" // AJUSTE: Vars
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 p-4">
              {/* Conversion Probability */}
              <div className="bg-gradient-to-br from-[var(--accent-emerald-50)] to-[var(--accent-teal-50)] p-4 rounded-lg border border-[var(--accent-emerald-200)]"> // AJUSTE: Vars
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-[var(--accent-emerald-600)]" /> // AJUSTE: Var
                  <span className="text-xs font-medium text-[var(--accent-emerald-700)]">Conversão</span> // AJUSTE: Var
                </div>
                <div className="text-2xl font-bold text-[var(--accent-emerald-900)]">{conversionProb}%</div> // AJUSTE: Var
                {conversionProb > 70 && (
                  <div className="flex items-center gap-1 mt-1">
                    <ThumbsUp className="w-4 h-4 text-[var(--accent-emerald-600)]" /> // AJUSTE: Var
                    <span className="text-xs text-[var(--accent-emerald-700)]">Quente</span> // AJUSTE: Var
                  </div>
                )}
              </div>

              {/* Health Score */}
              <div className="bg-gradient-to-br from-[var(--accent-blue-50)] to-[var(--accent-indigo-50)] p-4 rounded-lg border border-[var(--accent-blue-200)]"> // AJUSTE: Vars
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-5 h-5 text-[var(--accent-blue-600)]" /> // AJUSTE: Var
                  <span className="text-xs font-medium text-[var(--accent-blue-700)]">Saúde</span> // AJUSTE: Var
                </div>
                <div className="text-2xl font-bold text-[var(--accent-blue-900)]">{healthScore}%</div> // AJUSTE: Var
                {healthScore > 80 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Award className="w-4 h-4 text-[var(--accent-green-600)]" /> // AJUSTE: Var
                    <span className="text-xs text-[var(--accent-green-700)]">Ótimo</span> // AJUSTE: Var
                  </div>
                )}
              </div>

              {/* Risk Score */}
              <div className="bg-gradient-to-br from-[var(--accent-orange-50)] to-[var(--accent-red-50)] p-4 rounded-lg border border-[var(--accent-orange-200)]"> // AJUSTE: Vars
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-[var(--accent-orange-600)]" /> // AJUSTE: Var
                  <span className="text-xs font-medium text-[var(--accent-orange-700)]">Risco</span> // AJUSTE: Var
                </div>
                <div className="text-2xl font-bold text-[var(--accent-orange-900)]">{riskScore}%</div> // AJUSTE: Var
                {riskScore > 60 && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-4 h-4 text-[var(--accent-red-600)]" /> // AJUSTE: Var
                    <span className="text-xs text-[var(--accent-red-700)]">Alto</span> // AJUSTE: Var
                  </div>
                )}
              </div>
            </div>

            {/* Next Best Action */}
            {nextAction && (
              <div className="border-t border-[var(--neutral-200)] p-4 bg-[var(--text-white)]"> // AJUSTE: Vars
                <div className="flex items-start gap-3">
                  <div className="bg-[var(--accent-blue-100)] p-2 rounded-lg"> // AJUSTE: Var
                    {nextAction.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--neutral-900)]">Próxima Melhor Ação</h3> // AJUSTE: Var
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-[var(--neutral-600)]">
                        {nextAction.priority?.toUpperCase()}
                      </span> // AJUSTE: Var
                    </div>
                    <p className="text-sm text-[var(--neutral-600)] mt-2">{nextAction.reason}</p> // AJUSTE: Var
                    {nextAction.script && (
                      <div className="mt-3 p-3 bg-[var(--neutral-50)] rounded-lg border border-[var(--neutral-200)]"> // AJUSTE: Vars
                        <p className="text-sm text-[var(--neutral-700)] font-mono">{nextAction.script}</p> // AJUSTE: Var
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Insights List */}
            <div className="border-t border-[var(--neutral-200)] p-4 bg-[var(--text-white)]"> // AJUSTE: Vars
              {insights.length === 0 ? (
                <p className="text-center text-[var(--neutral-500)] py-8">Nenhum insight disponível no momento</p> // AJUSTE: Var
              ) : (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg bg-gradient-to-r ${getInsightColor(
                        insight.type
                      )} bg-opacity-10 border border-opacity-20`} // AJUSTE: getInsightColor usa vars
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[var(--neutral-900)]">{insight.title}</h4> // AJUSTE: Var
                          <p className="text-sm text-[var(--neutral-700)] mt-1">{insight.message}</p> // AJUSTE: Var
                          {insight.action && (
                            <button className="mt-2 text-sm font-medium text-[var(--neutral-900)] hover:text-[var(--neutral-700)] flex items-center gap-1"> // AJUSTE: Vars
                              {insight.action}
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
