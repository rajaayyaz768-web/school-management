'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * StatCard component for displaying statistics
 * Live metric tile with trend indicators and hover lift
 */
export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
  }
  variant?: 'default' | 'gold' | 'glass'
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const isGold = variant === 'gold'
  const isGlass = variant === 'glass'

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] p-6 relative',
        'transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        'hover:-translate-y-[2px] hover:shadow-[var(--shadow-md)]',
        variant === 'default' &&
          'bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)]',
        isGold &&
          'bg-gradient-to-br from-[var(--gold-light)] via-[var(--gold)] to-[var(--gold-dark)] text-[#1a1a1a] shadow-[0_4px_20px_rgba(212,168,67,0.3)]',
        isGlass && 'glass',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'font-body text-xs uppercase tracking-wider font-semibold mb-2',
              isGold ? 'text-[#1a1a1a]/60' : isGlass ? 'text-white/70' : 'text-[var(--text-muted)]'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'font-display text-3xl font-bold tracking-tight',
              isGold ? 'text-[#1a1a1a]' : isGlass ? 'text-white' : 'text-[var(--text)]'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={cn(
                'font-body text-sm mt-1',
                isGold ? 'text-[#1a1a1a]/50' : isGlass ? 'text-white/60' : 'text-[var(--text-muted)]'
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 mt-3 text-sm font-body font-semibold',
                trend.direction === 'up' && 'text-[#059669]',
                trend.direction === 'down' && 'text-[#DC2626]',
                trend.direction === 'neutral' && 'text-[var(--text-muted)]',
                isGold && trend.direction === 'up' && 'text-[#065F46]',
                isGold && trend.direction === 'down' && 'text-[#991B1B]',
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ml-4',
              isGold
                ? 'bg-[#1a1a1a]/10'
                : isGlass
                ? 'bg-white/10'
                : 'bg-[var(--primary)]/8 text-[var(--primary)]'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
