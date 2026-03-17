'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Input component with label, error, hint, and icon support
 * @param label - Field label
 * @param error - Error message
 * @param hint - Helper text
 * @param icon - Icon element to display on the left
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-[var(--surface)] border rounded-[var(--radius-sm)]',
              'px-4 py-2.5 font-body text-sm text-[var(--text)]',
              'placeholder:text-[var(--text-disabled)]',
              'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400',
              'transition-all duration-200',
              icon && 'pl-10',
              error
                ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
                : 'border-[var(--border)]',
              disabled && 'opacity-60 cursor-not-allowed bg-[var(--bg-secondary)]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1 font-body">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--text-muted)] mt-1 font-body">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
