'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Card component for content containers
 * Layered surfaces with glass, hoverable lift, and refined borders
 */
export interface CardProps {
  title?: string
  subtitle?: string
  glass?: boolean
  bordered?: boolean
  hoverable?: boolean
  children: ReactNode
  headerAction?: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({
  title,
  subtitle,
  glass = false,
  bordered = false,
  hoverable = false,
  children,
  headerAction,
  padding = 'md',
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] relative',
        'transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        glass
          ? 'glass'
          : 'bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)]',
        bordered && 'border-l-[3px] border-l-[var(--gold)]',
        hoverable && [
          'hover:-translate-y-[2px] hover:shadow-[var(--shadow-md)]',
          'hover:border-[var(--border-strong)]',
          'cursor-pointer',
        ],
        paddingStyles[padding],
        className
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className={cn(
          'mb-4',
          padding === 'none' && 'px-6 pt-6',
          (title || subtitle) && 'border-b border-[var(--border)]/50 pb-4'
        )}>
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="font-display font-semibold text-[var(--text)] text-lg leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="font-body text-sm text-[var(--text-muted)] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && <div className="shrink-0 ml-4">{headerAction}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
