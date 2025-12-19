import React from 'react'
import { ICON_CONTAINERS, ICON_RARITY_TOKENS, ICON_SCALES, MEDALLION_SIZE_MULTIPLIER, STROKE_WIDTHS } from './constants'
import type { IconMedallionProps } from './types'

export function IconMedallion({
  icon: Icon,
  scale = 'lg',
  strokeWidth = 'normal',
  rarity = 'common',
  container = 'glass',
  locked = false,
  state = 'default',
  aura = true,
  className = '',
  'aria-label': ariaLabel,
}: IconMedallionProps) {
  const iconSize = ICON_SCALES[scale]
  const stroke = STROKE_WIDTHS[strokeWidth]
  const containerSize = Math.round(iconSize * MEDALLION_SIZE_MULTIPLIER)
  const rarityTokens = ICON_RARITY_TOKENS[rarity]

  const resolvedState = locked ? 'locked' : state
  const isInteractive = resolvedState === 'hover' || resolvedState === 'active'

  return (
    <div
      aria-label={ariaLabel}
      data-state={resolvedState}
      data-locked={locked}
      className={[
        ICON_CONTAINERS[container],
        'transition-all duration-200 ease-out',
        locked ? 'opacity-70 grayscale' : 'opacity-100',
        isInteractive ? 'ring-1 ring-[var(--accent-1)]/25' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: `${containerSize}px`, height: `${containerSize}px` }}
    >
      {aura && (
        <div
          className={`pointer-events-none absolute -inset-8 rounded-[32px] blur-2xl opacity-75 bg-gradient-to-br ${rarityTokens.aura}`}
        />
      )}

      <div
        className={`absolute inset-0 rounded-[inherit] bg-gradient-to-br ${rarityTokens.container}`}
        aria-hidden
      />

      <div className={`absolute inset-0 rounded-[inherit] ring-2 ${rarityTokens.ring}`} aria-hidden />

      {locked && <div className="absolute inset-0 rounded-[inherit] bg-black/30 backdrop-blur-[1px]" aria-hidden />}

      <Icon size={iconSize} strokeWidth={stroke} className={['relative z-10', rarityTokens.text].join(' ')} />
    </div>
  )
}
