// src/components/leads/LeadScoreGauge.tsx
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface LeadScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function LeadScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  className = ''
}: LeadScoreGaugeProps) {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 FIX: MAPEAR SIZE PARA PIXELS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const dimensions = useMemo(() => {
    const sizeMap = {
      sm: { size: 80, stroke: 6, fontSize: 'text-xl' },
      md: { size: 120, stroke: 8, fontSize: 'text-3xl' },
      lg: { size: 160, stroke: 10, fontSize: 'text-4xl' }
    };
    return sizeMap[size] || sizeMap.md;
  }, [size]);

  const { size: svgSize, stroke, fontSize } = dimensions;
  const radius = (svgSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = svgSize / 2;

  // Normalizar score entre 0-100
  const normalizedScore = Math.max(0, Math.min(100, score || 0));

  // Calcular progresso (0 = topo, sentido horário)
  const progress = (normalizedScore / 100) * circumference;
  const dashOffset = circumference - progress;

  // Cor baseada no score - usa cores do tema
  const getScoreColor = (score: number) => {
    if (score >= 80) return { from: themeColors.accentPrimary, to: themeColors.accentSecondary }; // Hot
    if (score >= 60) return { from: themeColors.accentSecondary, to: themeColors.accentTertiary }; // Warm
    if (score >= 40) return { from: themeColors.accentWarm, to: themeColors.accentTertiary }; // Cool
    return { from: themeColors.accentAlert, to: themeColors.accentWarm }; // Cold
  };

  const colors = getScoreColor(normalizedScore);

  // Label do score
  const getScoreLabel = (score: number) => {
    if (score >= 80) return '🔥 Quente';
    if (score >= 60) return '✨ Morno';
    if (score >= 40) return '❄️ Frio';
    return '🧊 Gelado';
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={themeColors.border}
            strokeWidth={stroke}
          />

          {/* Progress circle with gradient */}
          <defs>
            <linearGradient
              id={`gradient-${score}-${size}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>

          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#gradient-${score}-${size})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>

        {/* Score number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold ${fontSize}`} style={{ color: colors.from }}>
              {Math.round(normalizedScore)}
            </div>
            {showLabel && size !== 'sm' && (
              <div className="text-xs text-[var(--text-2)] mt-1">score</div>
            )}
          </div>
        </div>
      </div>

      {/* Label below */}
      {showLabel && (
        <div className="text-center">
          <div className="text-sm font-semibold" style={{ color: colors.from }}>
            {getScoreLabel(normalizedScore)}
          </div>
        </div>
      )}
    </div>
  );
}
