'use client'

import { forwardRef, type TextareaHTMLAttributes, useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Textarea component - multiline input with character count and error support
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  showCount?: boolean
  maxLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, showCount, maxLength, className, disabled, value, id: propId, ...props }, ref) => {
    const autoId = useId()
    const textareaId = propId || autoId
    const errorId = error ? `${textareaId}-error` : undefined
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2"
          >
            {label}
            {props.required && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            'w-full bg-[var(--surface)] border rounded-[var(--radius-sm)]',
            'px-4 py-3 font-body text-sm text-[var(--text)] min-h-[100px] resize-y',
            'placeholder:text-[var(--text-disabled)]',
            'outline-none',
            'transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
            'focus:border-[var(--primary)] focus:shadow-[var(--shadow-glow)]',
            error
              ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
              : 'border-[var(--border)] hover:border-[var(--border-strong)]',
            disabled && 'opacity-50 cursor-not-allowed bg-[var(--bg-secondary)] hover:border-[var(--border)]',
            className
          )}
          {...props}
        />
        <div className="flex justify-between mt-1.5">
          <div>
            {error && (
              <p id={errorId} className="text-xs text-[var(--danger)] font-body font-medium" role="alert">
                {error}
              </p>
            )}
            {hint && !error && (
              <p className="text-xs text-[var(--text-muted)] font-body">{hint}</p>
            )}
          </div>
          {showCount && maxLength && (
            <p className={cn(
              'text-xs font-body tabular-nums',
              currentLength > maxLength * 0.9 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'
            )}>
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
