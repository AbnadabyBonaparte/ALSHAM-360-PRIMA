// src/components/leads/AIInsightsPanel.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Zap, ThumbsUp, Award, ArrowRight } from 'lucide-react';
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'action': return <Target className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div
        className="bg-[var(--surface-strong)] p-2 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[var(--text-primary)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Insights IA</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)] hidden sm:inline">Análise em tempo real</span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ArrowRight className="w-4 h-4 text-[var(--text-secondary)]" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-2 p-2">
              <div className="p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between mb-1">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Conversão</span>
                </div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{conversionProb}%</div>
                {conversionProb > 70 && (
                  <div className="flex items-center gap-1 mt-1">
                    <ThumbsUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Quente</span>
                  </div>
                )}
              </div>

              <div className="p-2 rounded-lg border border-sky-500/20 bg-sky-500/5">
                <div className="flex items-center justify-between mb-1">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Saúde</span>
                </div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{healthScore}%</div>
                {healthScore > 80 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Award className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Ótimo</span>
                  </div>
                )}
              </div>

              <div className="p-2 rounded-lg border border-orange-500/20 bg-orange-500/5">
                <div className="flex items-center justify-between mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Risco</span>
                </div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{riskScore}%</div>
                {riskScore > 60 && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">Alto</span>
                  </div>
                )}
              </div>
            </div>

            {nextAction && (
              <div className="border-t border-[var(--border)] p-2 bg-[var(--surface)]">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/10">
                    {nextAction.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Próxima Melhor Ação</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{nextAction.reason}</p>
                    {nextAction.script && (
                      <div className="mt-2 p-2 bg-[var(--surface-strong)] rounded text-xs text-[var(--text-secondary)]">
                        {nextAction.script}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-[var(--border)] p-2 bg-[var(--surface)]">
              {insights.length === 0 ? (
                <p className="text-center text-[var(--text-secondary)] text-sm py-4">Nenhum insight disponível no momento</p>
              ) : (
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-2 rounded-lg border border-[var(--border)] bg-emerald-500/5"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-[var(--text-primary)]">{insight.title}</h4>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{insight.message}</p>
                          {insight.action && (
                            <button className="mt-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                              {insight.action}
                              <ArrowRight className="w-3 h-3" />
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
