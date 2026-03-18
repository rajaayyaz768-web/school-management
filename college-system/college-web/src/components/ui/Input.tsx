'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Input component with label, error, hint, and icon support
 * Premium: float label, inner glow focus, error shake, icon transitions
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightIcon, className, disabled, id: propId, ...props }, ref) => {
    const autoId = useId()
    const inputId = propId || autoId
    const errorId = error ? `${inputId}-error` : undefined
    const hintId = hint && !error ? `${inputId}-hint` : undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2"
          >
            {label}
            {props.required && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <span className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]',
              'transition-colors duration-[180ms]',
              'group-focus-within:text-[var(--primary)]'
            )}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={errorId || hintId}
            className={cn(
              'w-full bg-[var(--surface)] border rounded-[var(--radius-sm)]',
              'px-4 py-2.5 font-body text-sm text-[var(--text)]',
              'placeholder:text-[var(--text-disabled)]',
              'outline-none',
              'transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
              // Focus styles
              'focus:border-[var(--primary)] focus:shadow-[var(--shadow-glow)]',
              // Icon padding
              icon && 'pl-10',
              rightIcon && 'pr-10',
              // Error styles
              error
                ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)] animate-shake'
                : 'border-[var(--border)] hover:border-[var(--border-strong)]',
              // Disabled
              disabled && 'opacity-50 cursor-not-allowed bg-[var(--bg-secondary)] hover:border-[var(--border)]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]',
              'transition-colors duration-[180ms]',
              'group-focus-within:text-[var(--primary)]'
            )}>
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-xs text-[var(--danger)] mt-1.5 font-body font-medium" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-[var(--text-muted)] mt-1.5 font-body">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
