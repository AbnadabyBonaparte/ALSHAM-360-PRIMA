// src/components/leads/LeadScoreGauge.tsx
import { motion } from 'framer-motion';

interface LeadScoreGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export default function LeadScoreGauge({ score, size = 80, showLabel = true }: LeadScoreGaugeProps) {
  // Garantir que score está entre 0 e 100
  const normalizedScore = Math.min(Math.max(score || 0, 0), 100);
  
  // Calcular cor baseada no score
  const getColor = (value: number) => {
    if (value >= 80) return { from: '#10b981', to: '#14b8a6' }; // Verde (emerald-teal)
    if (value >= 60) return { from: '#3b82f6', to: '#06b6d4' }; // Azul (blue-cyan)
    if (value >= 40) return { from: '#f59e0b', to: '#f97316' }; // Laranja (amber-orange)
    return { from: '#ef4444', to: '#ec4899' }; // Vermelho (red-pink)
  };

  const colors = getColor(normalizedScore);
  
  // Calcular ângulo para o arco (0-360 graus)
  const angle = (normalizedScore / 100) * 360;
  
  // Criar gradiente único
  const gradientId = `scoreGradient-${Math.random().toString(36).substr(2, 9)}`;
  
  // Tamanhos
  const strokeWidth = size * 0.15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Definir gradiente */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        
        {/* Círculo de fundo (cinza) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Círculo animado (score) */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          initial={{ strokeDashoffset: circumference }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {/* Score no centro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="text-center"
        >
          <div 
            className="font-bold leading-none"
            style={{ 
              fontSize: size * 0.3,
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {Math.round(normalizedScore)}
          </div>
          {showLabel && size > 60 && (
            <div 
              className="text-gray-400 font-medium mt-0.5"
              style={{ fontSize: size * 0.12 }}
            >
              Score
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl opacity-0"
        style={{
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}
