import type { LucideIcon } from 'lucide-react'
import { ICON_CONTAINERS, ICON_RARITY_TOKENS, ICON_SCALES, ICON_STATES, STROKE_WIDTHS } from './constants'

export type IconScale = keyof typeof ICON_SCALES
export type IconStroke = keyof typeof STROKE_WIDTHS
export type IconContainer = keyof typeof ICON_CONTAINERS
export type IconRarity = keyof typeof ICON_RARITY_TOKENS
export type IconState = (typeof ICON_STATES)[number]

export interface IconComponentBaseProps {
  icon: LucideIcon
  scale?: IconScale
  strokeWidth?: IconStroke
  className?: string
  'aria-label'?: string
}

export interface IconInlineProps extends IconComponentBaseProps {
  title?: string
}

export type IconButtonVariant = 'primary' | 'ghost'

export interface IconButtonProps extends IconComponentBaseProps {
  label?: string
  variant?: IconButtonVariant
  disabled?: boolean
  active?: boolean
  onClick?: () => void
}

export interface IconMedallionProps extends IconComponentBaseProps {
  rarity?: IconRarity
  container?: IconContainer
  locked?: boolean
  state?: Exclude<IconState, 'locked'>
  aura?: boolean
}
