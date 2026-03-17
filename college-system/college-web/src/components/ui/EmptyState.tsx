'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'
import Button from './Button'

/**
 * EmptyState component for empty data displays
 * @param icon - Icon element or emoji
 * @param title - Title text
 * @param description - Description text
 * @param action - Action button config
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
      <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center mx-auto text-3xl">
        {icon || <Inbox className="w-8 h-8 text-[var(--text-muted)]" />}
      </div>
      <h3 className="font-display text-lg text-[var(--text)] mt-4">{title}</h3>
      {description && (
        <p className="font-body text-sm text-[var(--text-muted)] mt-2 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Button variant="gold" onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
