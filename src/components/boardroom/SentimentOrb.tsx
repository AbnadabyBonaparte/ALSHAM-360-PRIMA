import React from 'react';

type Props = {
  score: number;
  size?: 'small' | 'large';
  era?: string;
};

export default function SentimentOrb({ score, size = 'small', era }: Props) {
  const color = score > 75 ? 'from-emerald-400 to-cyan-400' : score > 50 ? 'from-amber-400 to-orange-500' : 'from-red-500 to-pink-500';
  const dimension = size === 'large' ? 'w-64 h-64' : 'w-40 h-40';

  return (
    <div className="relative flex items-center justify-center">
      <div className={`absolute ${dimension} rounded-full bg-gradient-to-br ${color} blur-3xl opacity-40`} />
      <div className={`relative ${dimension} rounded-full bg-[var(--surface)] border border-[var(--border)] flex flex-col items-center justify-center gap-2`}>
        <span className="text-5xl font-black text-[var(--text-primary)]">{score}</span>
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Sentimento</span>
        {era && <span className="text-sm font-bold text-[var(--text-primary)]/80">{era}</span>}
      </div>
    </div>
  );
}










