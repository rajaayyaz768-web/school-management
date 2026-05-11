'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

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

// Scholaris: soft semantic pill — low-sat background + matching text
const variantStyles: Record<string, string> = {
  present: 'bg-[var(--green-50)]  text-[var(--green-700)]  border border-[var(--green-50)]',
  absent:  'bg-[var(--red-50)]    text-[var(--red-700)]    border border-[var(--red-50)]',
  late:    'bg-[var(--amber-50)]  text-[var(--amber-700)]  border border-[var(--amber-50)]',
  leave:   'bg-[var(--bg-tint)]   text-[var(--primary-dark)]   border border-[var(--surface-alt)]',
  paid:    'bg-[var(--green-50)]  text-[var(--green-700)]  border border-[var(--green-50)]',
  pending: 'bg-[var(--amber-50)]  text-[var(--amber-700)]  border border-[var(--amber-50)]',
  overdue: 'bg-[var(--red-50)]    text-[var(--red-700)]    border border-[var(--red-50)]',
  partial: 'bg-[var(--violet-50)] text-[var(--violet-500)] border border-[var(--violet-50)]',
  waived:  'bg-[var(--bg-tint)]   text-[var(--primary-dark)]   border border-[var(--surface-alt)]',
  aplus:   'bg-[var(--amber-50)]  text-[var(--amber-700)]  border border-[var(--amber-50)]',
  pass:    'bg-[var(--green-50)]  text-[var(--green-700)]  border border-[var(--green-50)]',
  fail:    'bg-[var(--red-50)]    text-[var(--red-700)]    border border-[var(--red-50)]',
  success: 'bg-[var(--green-50)]  text-[var(--green-700)]  border border-[var(--green-50)]',
  warning: 'bg-[var(--amber-50)]  text-[var(--amber-700)]  border border-[var(--amber-50)]',
  danger:  'bg-[var(--red-50)]    text-[var(--red-700)]    border border-[var(--red-50)]',
  info:    'bg-[var(--bg-tint)]   text-[var(--primary-dark)]   border border-[var(--surface-alt)]',
  neutral: 'bg-[var(--slate-100)] text-[var(--slate-700)]  border border-[var(--slate-100)]',
}

const dotColors: Record<string, string> = {
  present: 'bg-[var(--green-500)]',  absent:  'bg-[var(--red-500)]',
  late:    'bg-[var(--amber-500)]',  leave:   'bg-[var(--primary)]',
  paid:    'bg-[var(--green-500)]',  pending: 'bg-[var(--amber-500)]',
  overdue: 'bg-[var(--red-500)]',    partial: 'bg-[var(--violet-500)]',
  waived:  'bg-[var(--primary)]',   aplus:   'bg-[var(--amber-500)]',
  pass:    'bg-[var(--green-500)]',  fail:    'bg-[var(--red-500)]',
  success: 'bg-[var(--green-500)]',  warning: 'bg-[var(--amber-500)]',
  danger:  'bg-[var(--red-500)]',    info:    'bg-[var(--primary)]',
  neutral: 'bg-[var(--slate-400)]',
}

const sizeStyles = {
  sm: 'px-[7px] py-[2px] text-[var(--font-size-xs)]',
  md: 'px-[9px] py-[3px] text-[var(--font-size-sm)]',
}

export function Badge({
  variant = 'neutral', size = 'md', dot = false, children, className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] rounded-full font-body font-700',
        'letter-spacing-[0.005em] leading-tight',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          dotColors[variant],
          'animate-[pulseDot_2s_ease-in-out_infinite]'
        )} />
      )}
      {children}
    </span>
  )
}

export default Badge
