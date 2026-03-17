'use client'

import { cn } from '@/lib/utils'

/**
 * Skeleton component for loading states
 * @param variant - Shape: text, card, stat, table, circle
 * @param lines - Number of text lines for text variant
 */
export interface SkeletonProps {
  variant?: 'text' | 'card' | 'stat' | 'table' | 'circle'
  lines?: number
  className?: string
}

export function Skeleton({ variant = 'text', lines = 3, className }: SkeletonProps) {
  if (variant === 'circle') {
    return (
      <div
        className={cn(
          'shimmer rounded-full bg-[var(--border)]',
          className || 'w-12 h-12'
        )}
      />
    )
  }

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 shimmer rounded-[var(--radius-sm)]',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    )
  }

  if (variant === 'stat') {
    return (
      <div
        className={cn(
          'rounded-card p-6 bg-[var(--surface)] border border-[var(--border)]',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-3 w-24 shimmer rounded" />
            <div className="h-8 w-32 shimmer rounded" />
            <div className="h-3 w-20 shimmer rounded" />
          </div>
          <div className="shimmer w-11 h-11 rounded-full" />
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-card p-6 bg-[var(--surface)] border border-[var(--border)]',
          className
        )}
      >
        <div className="space-y-4">
          <div className="h-5 w-1/3 shimmer rounded" />
          <div className="space-y-2">
            <div className="h-4 shimmer rounded" />
            <div className="h-4 shimmer rounded" />
            <div className="h-4 w-2/3 shimmer rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div
        className={cn(
          'rounded-card overflow-hidden bg-[var(--surface)] border border-[var(--border)]',
          className
        )}
      >
        {/* Header */}
        <div className="bg-teal-700 dark:bg-charcoal-700 p-4">
          <div className="flex gap-4">
            <div className="h-4 w-20 shimmer rounded opacity-30" />
            <div className="h-4 w-32 shimmer rounded opacity-30" />
            <div className="h-4 w-24 shimmer rounded opacity-30" />
            <div className="h-4 w-16 shimmer rounded opacity-30" />
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'p-4 border-b border-[var(--border)] last:border-b-0',
              i % 2 === 1 && 'bg-[var(--surface-alt)]'
            )}
          >
            <div className="flex gap-4">
              <div className="h-4 w-20 shimmer rounded" />
              <div className="h-4 w-32 shimmer rounded" />
              <div className="h-4 w-24 shimmer rounded" />
              <div className="h-4 w-16 shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export default Skeleton
