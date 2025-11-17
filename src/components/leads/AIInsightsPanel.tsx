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
      case 'opportunity': return <TrendingUp className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'action': return <Target className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div
        className="bg-[var(--surface-strong)] p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-[var(--text-primary)]" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Insights IA</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-secondary)]">Análise inteligente em tempo real</span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ArrowRight className="w-5 h-5 text-[var(--text-secondary)]" />
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
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-4 p-4">
              <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Conversão</span>
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{conversionProb}%</div>
                {conversionProb > 70 && (
                  <div className="flex items-center gap-1 mt-1">
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Quente</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg border border-sky-500/20 bg-sky-500/5">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-5 h-5 text-sky-400" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Saúde</span>
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{healthScore}%</div>
                {healthScore > 80 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Ótimo</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Risco</span>
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{riskScore}%</div>
                {riskScore > 60 && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">Alto</span>
                  </div>
                )}
              </div>
            </div>

            {nextAction && (
              <div className="border-t border-[var(--border)] p-4 bg-[var(--surface)]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10">
                    {nextAction.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)]">Próxima Melhor Ação</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {nextAction.priority?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">{nextAction.reason}</p>
                    {nextAction.script && (
                      <div className="mt-3 p-3 bg-[var(--surface-strong)] rounded-lg border border-[var(--border)]">
                        <p className="text-sm text-[var(--text-secondary)] font-mono">{nextAction.script}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-[var(--border)] p-4 bg-[var(--surface)]">
              {insights.length === 0 ? (
                <p className="text-center text-[var(--text-secondary)] py-8">Nenhum insight disponível no momento</p>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border border-[var(--border)] bg-emerald-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[var(--text-primary)]">{insight.title}</h4>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">{insight.message}</p>
                          {insight.action && (
                            <button className="mt-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
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
