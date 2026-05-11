'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { CARD_STYLE_PROPS } from '@/lib/cardStyles'
import { FONT_SCALE_SIZES } from '@/lib/fontScales'

export type StatCardAccent = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gold'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { direction: 'up' | 'down' | 'neutral'; value: string }
  accent?: StatCardAccent
  /** @deprecated use accent */
  variant?: 'default' | 'gold' | 'glass'
  className?: string
}

const accentConfig: Record<StatCardAccent, { iconBg: string; iconText: string; valText: string }> = {
  blue:   { iconBg: 'bg-[var(--primary)]/10',  iconText: 'text-[var(--primary)]',      valText: 'text-[var(--primary)]'      },
  green:  { iconBg: 'bg-emerald-500/10',        iconText: 'text-emerald-600',            valText: 'text-emerald-600'            },
  orange: { iconBg: 'bg-[var(--gold)]/10',      iconText: 'text-[var(--gold-dark)]',     valText: 'text-[var(--gold-dark)]'     },
  purple: { iconBg: 'bg-violet-500/10',         iconText: 'text-violet-600',             valText: 'text-violet-600'             },
  red:    { iconBg: 'bg-red-500/10',            iconText: 'text-red-600',                valText: 'text-red-600'                },
  gold:   { iconBg: 'bg-[var(--gold)]/10',      iconText: 'text-[var(--gold-dark)]',     valText: 'text-[var(--gold-dark)]'     },
}

export function StatCard({
  title, value, subtitle, icon, trend,
  accent, variant = 'default', className,
}: StatCardProps) {
  const cardStyle  = useThemeStore(s => s.cardStyle)
  const fontScale  = useThemeStore(s => s.fontScale)
  const styleProps = CARD_STYLE_PROPS[cardStyle] ?? CARD_STYLE_PROPS.elevated
  const sizes      = FONT_SCALE_SIZES[fontScale]  ?? FONT_SCALE_SIZES.comfortable

  const resolvedAccent: StatCardAccent = accent ?? (variant === 'gold' ? 'gold' : 'blue')
  const isGlass = variant === 'glass'
  const cfg = accentConfig[resolvedAccent]

  return (
    <div
      className={cn(
        'relative p-[var(--space-5)] transition-all duration-[var(--dur-base)] ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        'hover:-translate-y-[2px]',
        isGlass && 'glass rounded-2xl',
        className
      )}
      style={isGlass ? undefined : styleProps}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className={cn('font-bold uppercase tracking-[0.10em] mb-2.5', isGlass ? 'text-white/70' : 'text-[var(--text-muted)]')}
            style={{ fontSize: sizes.xs }}
          >
            {title}
          </p>

          <p className={cn('font-display font-800 leading-none tracking-[-0.025em] text-[38px]', isGlass ? 'text-white' : cfg.valText)}>
            {value}
          </p>

          {subtitle && (
            <p
              className={cn('font-500 mt-2', isGlass ? 'text-white/60' : 'text-[var(--text-muted)]')}
              style={{ fontSize: sizes.sm }}
            >
              {subtitle}
            </p>
          )}

          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 mt-2.5 px-2 py-[3px] rounded-full font-700',
                trend.direction === 'up'      && 'bg-[var(--green-50)] text-[var(--green-700)]',
                trend.direction === 'down'    && 'bg-[var(--red-50)] text-[var(--red-700)]',
                trend.direction === 'neutral' && 'bg-[var(--bg-secondary)] text-[var(--text-muted)]',
              )}
              style={{ fontSize: sizes.xs }}
            >
              {trend.direction === 'up' ? <TrendingUp className="w-3 h-3" />
                : trend.direction === 'down' ? <TrendingDown className="w-3 h-3" />
                : <Minus className="w-3 h-3" />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        {icon && (
          <div className={cn('w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0', isGlass ? 'bg-white/15 text-white' : cn(cfg.iconBg, cfg.iconText))}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
