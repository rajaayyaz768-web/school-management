'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Badge component for status indicators
 * Refined status chips with soft backgrounds, micro-borders, and pulsing dot variants
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

// Soft backgrounds at 10% opacity + matching text + micro-border
const variantStyles: Record<string, string> = {
  // Attendance
  present: 'bg-[#10B981]/10 text-[#059669] border border-[#10B981]/25',
  absent: 'bg-[#EF4444]/10 text-[#DC2626] border border-[#EF4444]/25',
  late: 'bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/25',
  leave: 'bg-[#3B82F6]/10 text-[#2563EB] border border-[#3B82F6]/25',
  // Fee
  paid: 'bg-[#10B981]/10 text-[#059669] border border-[#10B981]/25',
  pending: 'bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/25',
  overdue: 'bg-[#EF4444]/10 text-[#DC2626] border border-[#EF4444]/25',
  partial: 'bg-[#8B5CF6]/10 text-[#7C3AED] border border-[#8B5CF6]/25',
  waived: 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/25',
  // Grades
  aplus: 'bg-[var(--gold)]/12 text-[var(--gold-dark)] border border-[var(--gold)]/30',
  pass: 'bg-[#10B981]/10 text-[#059669] border border-[#10B981]/25',
  fail: 'bg-[#EF4444]/10 text-[#DC2626] border border-[#EF4444]/25',
  // General
  success: 'bg-[#10B981]/10 text-[#059669] border border-[#10B981]/25',
  warning: 'bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/25',
  danger: 'bg-[#EF4444]/10 text-[#DC2626] border border-[#EF4444]/25',
  info: 'bg-[#3B82F6]/10 text-[#2563EB] border border-[#3B82F6]/25',
  neutral: 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]',
}

const dotColors: Record<string, string> = {
  present: 'bg-[#10B981]',
  absent: 'bg-[#EF4444]',
  late: 'bg-[#F59E0B]',
  leave: 'bg-[#3B82F6]',
  paid: 'bg-[#10B981]',
  pending: 'bg-[#F59E0B]',
  overdue: 'bg-[#EF4444]',
  partial: 'bg-[#8B5CF6]',
  waived: 'bg-[var(--primary)]',
  aplus: 'bg-[var(--gold)]',
  pass: 'bg-[#10B981]',
  fail: 'bg-[#EF4444]',
  success: 'bg-[#10B981]',
  warning: 'bg-[#F59E0B]',
  danger: 'bg-[#EF4444]',
  info: 'bg-[#3B82F6]',
  neutral: 'bg-[var(--text-muted)]',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-[11px]',
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
        'inline-flex items-center gap-1.5 rounded-full font-semibold font-body',
        'uppercase tracking-[0.04em] leading-tight',
        'transition-colors duration-[var(--transition-base)]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant],
            'animate-pulse-dot'
          )}
        />
      )}
      {children}
    </span>
  )
}

export default Badge
