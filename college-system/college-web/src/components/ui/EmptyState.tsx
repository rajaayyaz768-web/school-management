'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'
import Button from './Button'

/**
 * EmptyState component for empty data displays
 * Enhanced icon container with teal tint and refined spacing
 */
export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('py-16 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-[var(--primary)]/8 border border-[var(--border)] flex items-center justify-center mx-auto">
        {icon || <Inbox className="w-7 h-7 text-[var(--primary)]/60" />}
      </div>
      <h3 className="font-display text-lg font-semibold text-[var(--text)] mt-5">{title}</h3>
      {description && (
        <p className="font-body text-sm text-[var(--text-muted)] mt-2 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
