import React from 'react'
import { ICON_SCALES, STROKE_WIDTHS } from './constants'
import type { IconInlineProps } from './types'

export function IconInline({
  icon: Icon,
  scale = 'sm',
  strokeWidth = 'thin',
  className = '',
  title,
  'aria-label': ariaLabel,
}: IconInlineProps) {
  const size = ICON_SCALES[scale]
  const stroke = STROKE_WIDTHS[strokeWidth]

  return (
    <span
      className={`inline-flex items-center justify-center align-middle text-inherit ${className}`.trim()}
      aria-label={ariaLabel}
      title={title}
    >
      <Icon size={size} strokeWidth={stroke} />
    </span>
  )
}
