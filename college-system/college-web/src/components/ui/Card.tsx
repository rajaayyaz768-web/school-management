'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Card component for content containers
 * @param title - Card header title
 * @param subtitle - Card header subtitle
 * @param glass - Enable glassmorphism effect (use on dark backgrounds)
 * @param bordered - Add gold left border accent
 * @param hoverable - Enable hover elevation effect
 * @param headerAction - Element to render in header right side
 * @param padding - Padding size: none, sm, md, lg
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
        'rounded-card relative',
        glass
          ? 'glass'
          : 'bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)]',
        bordered && 'border-l-4 border-l-gold-400',
        hoverable &&
          'hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] transition-all duration-200 cursor-pointer',
        paddingStyles[padding],
        className
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className={cn('mb-4', padding === 'none' && 'px-6 pt-6')}>
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="font-display font-semibold text-[var(--text)] text-lg">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="font-body text-sm text-[var(--text-muted)] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
