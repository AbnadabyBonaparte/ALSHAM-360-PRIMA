// src/components/leads/LeadScoreGauge.tsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LeadScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export default function LeadScoreGauge({ 
  score = 0, 
  size = 'md',
  showLabel = true,
  animated = true 
}: LeadScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (animated) {
      let start = 0;
      const increment = score / 50;
      const timer = setInterval(() => {
        start += increment;
        if (start >= score) {
          setDisplayScore(score);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(start));
        }
      }, 20);
      return () => clearInterval(timer);
    } else {
      setDisplayScore(score);
    }
  }, [score, animated]);

  const sizes = {
    sm: { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-lg' },
    md: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { width: 160, height: 160, strokeWidth: 10, fontSize: 'text-4xl' }
  };

  const { width, height, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 60) return '#3b82f6'; // Blue
    if (score >= 40) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getGradient = () => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-blue-500 to-indigo-500';
    if (score >= 40) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-pink-500';
  };

  const getLabel = () => {
    if (score >= 80) return '🔥 Quente';
    if (score >= 60) return '👍 Bom';
    if (score >= 40) return '😐 Morno';
    return '🧊 Frio';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 ${strokeWidth}px ${getColor()}40)`
            }}
          />
        </svg>
        
        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className={`${fontSize} font-bold bg-gradient-to-br ${getGradient()} bg-clip-text text-transparent`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {displayScore}
          </motion.span>
          <span className="text-xs text-gray-400">score</span>
        </div>
      </div>

      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`
            px-3 py-1 rounded-full text-xs font-semibold
            bg-gradient-to-r ${getGradient()} bg-opacity-20
          `}
        >
          {getLabel()}
        </motion.div>
      )}
    </div>
  );
}
