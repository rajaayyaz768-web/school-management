'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Badge component for status indicators
 * @param variant - Visual style based on status type
 * @param size - Size: sm, md
 * @param dot - Show dot indicator before text
 */
export interface BadgeProps {
  variant?:
    | 'present' | 'absent' | 'late' | 'leave'
    | 'paid' | 'pending' | 'overdue' | 'partial' | 'waived'
    | 'aplus' | 'pass' | 'fail'
    | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  dot?: boolean
  children: ReactNode
  className?: string
}

const variantStyles: Record<string, string> = {
  // Attendance
  present: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  absent: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  leave: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  // Fee
  paid: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  partial: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  waived: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  // Grades
  aplus: 'bg-gold-100 text-gold-700 dark:bg-gold-400/20 dark:text-gold-300',
  pass: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  fail: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  // General
  success: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  neutral: 'bg-[var(--bg-secondary)] text-[var(--text-muted)]',
}

const dotColors: Record<string, string> = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  late: 'bg-amber-500',
  leave: 'bg-blue-500',
  paid: 'bg-green-500',
  pending: 'bg-amber-500',
  overdue: 'bg-red-500',
  partial: 'bg-purple-500',
  waived: 'bg-teal-500',
  aplus: 'bg-gold-400',
  pass: 'bg-green-500',
  fail: 'bg-red-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-400',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-0.5 text-xs',
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill font-semibold font-body',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}

export default Badge
