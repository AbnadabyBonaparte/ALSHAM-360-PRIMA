// src/components/effects/GlitchText.tsx
// Componente de texto com efeito glitch

import React from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className = '' }: GlitchTextProps) {
  return (
    <span className={`font-bold ${className}`}>
      {text}
    </span>
  );
}
