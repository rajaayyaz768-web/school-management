'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import Button from './Button'

/**
 * ErrorState component for error displays with retry action
 */
export interface ErrorStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function ErrorState({
  icon,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  action,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('py-16 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center mx-auto">
        {icon || <AlertCircle className="w-7 h-7 text-[#EF4444]" />}
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

export default ErrorState
