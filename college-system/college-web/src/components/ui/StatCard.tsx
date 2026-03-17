'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * StatCard component for displaying statistics
 * @param title - Metric title
 * @param value - Main value to display
 * @param subtitle - Additional context
 * @param icon - Icon element
 * @param trend - Trend indicator with direction and value
 * @param variant - Visual style: default, gold, glass
 */
export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    direction: 'up' | 'down'
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
        'rounded-card p-6 relative transition-all duration-200',
        variant === 'default' &&
          'bg-[var(--surface)] border border-[var(--border)] border-l-4 border-l-gold-400 shadow-[var(--shadow-sm)]',
        isGold &&
          'bg-gradient-to-r from-gold-500 to-gold-400 text-charcoal-900 shadow-gold',
        isGlass && 'glass',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={cn(
              'font-body text-xs uppercase tracking-wider font-semibold mb-2',
              isGold ? 'text-charcoal-900/70' : isGlass ? 'text-white/70' : 'text-[var(--text-muted)]'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'font-display text-3xl font-bold',
              isGold ? 'text-charcoal-900' : isGlass ? 'text-white' : 'text-[var(--text)]'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={cn(
                'font-body text-sm mt-1',
                isGold ? 'text-charcoal-900/60' : isGlass ? 'text-white/60' : 'text-[var(--text-muted)]'
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-sm font-body font-medium',
                trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                isGold && (trend.direction === 'up' ? 'text-green-800' : 'text-red-800')
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {trend.value}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center',
              isGold
                ? 'bg-charcoal-900/10'
                : isGlass
                ? 'bg-white/10'
                : 'bg-teal-50 dark:bg-charcoal-600 text-teal-700 dark:text-gold-400'
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
