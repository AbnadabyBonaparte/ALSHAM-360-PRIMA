import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  prefix?: string;
  suffix?: string;
  trend?: number;
  glow?: boolean;
};

export default function KpiCard({
  title,
  value,
  subtitle,
  prefix = '',
  suffix = '',
  trend,
  glow,
}: Props) {
  const trendIcon = trend !== undefined && trend < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />;
  const trendColor = trend !== undefined && trend < 0 ? 'text-red-400' : 'text-emerald-400';

  return (
    <div
      className={`p-8 rounded-3xl bg-[var(--surface)]/80 border border-[var(--border)] relative overflow-hidden ${
        glow ? 'shadow-[0_0_40px_rgba(16,185,129,0.35)]' : ''
      }`}
    >
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text)]/60 mb-3">{title}</p>
      <div className="text-5xl font-black text-[var(--text)] tracking-tight">
        {prefix}
        {value}
        {suffix}
      </div>
      {subtitle && <p className="text-[var(--text-2)] mt-2">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`mt-4 inline-flex items-center gap-2 ${trendColor}`}>
          {trendIcon}
          <span className="font-bold">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
}


