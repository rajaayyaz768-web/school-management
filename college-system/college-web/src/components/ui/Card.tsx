'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/store/themeStore'
import { CARD_STYLE_PROPS } from '@/lib/cardStyles'

export type CardAccent = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gold' | 'none'

export interface CardProps {
  title?: string
  subtitle?: string
  glass?: boolean
  /** Colored 3px left border accent */
  accent?: CardAccent
  hoverable?: boolean
  bordered?: boolean
  children: ReactNode
  headerAction?: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

const paddingStyles = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

const accentBorders: Record<CardAccent, string> = {
  none:   '',
  blue:   'border-l-[3px] border-l-[var(--primary)]',
  green:  'border-l-[3px] border-l-emerald-500',
  orange: 'border-l-[3px] border-l-orange-500',
  purple: 'border-l-[3px] border-l-violet-500',
  red:    'border-l-[3px] border-l-red-500',
  gold:   'border-l-[3px] border-l-[var(--gold)]',
}

export function Card({
  title,
  subtitle,
  glass = false,
  accent = 'none',
  hoverable = false,
  children,
  headerAction,
  padding = 'md',
  className,
}: CardProps) {
  const cardStyle = useThemeStore(s => s.cardStyle)
  const styleProps = CARD_STYLE_PROPS[cardStyle] ?? CARD_STYLE_PROPS.elevated

  return (
    <div
      className={cn(
        'relative',
        'transition-all duration-[var(--dur-base)] ease-[cubic-bezier(0.4,0,0.2,1)]',
        glass ? 'glass rounded-2xl' : accentBorders[accent],
        hoverable && [
          'cursor-pointer',
          'hover:-translate-y-[2px]',
        ],
        paddingStyles[padding],
        className
      )}
      style={glass ? undefined : styleProps}
    >
      {(title || subtitle || headerAction) && (
        <div
          className={cn(
            'mb-4',
            padding === 'none' && 'px-6 pt-6',
            (title || subtitle) && 'border-b border-[var(--border)] pb-4'
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {title && (
                <h3 className="font-semibold text-[var(--text)] text-base leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="shrink-0">{headerAction}</div>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
