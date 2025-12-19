import React from 'react'
import { ICON_SCALES, STROKE_WIDTHS } from './constants'
import type { IconButtonProps } from './types'

export function IconButton({
  icon: Icon,
  label,
  scale = 'md',
  strokeWidth = 'normal',
  variant = 'primary',
  disabled = false,
  active = false,
  className = '',
  onClick,
  'aria-label': ariaLabel,
}: IconButtonProps) {
  const size = ICON_SCALES[scale]
  const stroke = STROKE_WIDTHS[strokeWidth]

  const variantClasses =
    variant === 'ghost'
      ? 'bg-[var(--surface)]/40 border border-[var(--border)] text-[var(--text)]/80 hover:text-[var(--text)]'
      : 'bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-[var(--background)] shadow-[0_12px_30px_-14px_rgba(0,0,0,0.7)]'

  const stateClasses = [
    disabled ? 'opacity-60 cursor-not-allowed' : 'hover:translate-y-[-1px]',
    active ? 'ring-2 ring-[var(--accent-1)]/40' : '',
  ]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      data-state={disabled ? 'disabled' : active ? 'active' : 'default'}
      className={[
        'group inline-flex items-center gap-3 rounded-xl px-4 py-2 transition-all duration-150 ease-out',
        variantClasses,
        ...stateClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon size={size} strokeWidth={stroke} className={variant === 'ghost' ? 'text-current' : 'text-[inherit]'} />
      {label && <span className="text-sm font-semibold tracking-wide">{label}</span>}
    </button>
  )
}
