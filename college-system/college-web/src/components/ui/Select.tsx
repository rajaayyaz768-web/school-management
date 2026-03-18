'use client'

import { forwardRef, type SelectHTMLAttributes, useId } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

/**
 * Select component with label and error support
 * Refined focus ring, chevron animation, consistent with Input styling
 */
export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  options: SelectOption[]
  error?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, placeholder, className, disabled, id: propId, ...props }, ref) => {
    const autoId = useId()
    const selectId = propId || autoId
    const errorId = error ? `${selectId}-error` : undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2"
          >
            {label}
            {props.required && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={cn(
              'w-full bg-[var(--surface)] border rounded-[var(--radius-sm)]',
              'px-4 py-2.5 pr-10 font-body text-sm text-[var(--text)]',
              'appearance-none cursor-pointer outline-none',
              'transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
              'focus:border-[var(--primary)] focus:shadow-[var(--shadow-glow)]',
              error
                ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
                : 'border-[var(--border)] hover:border-[var(--border-strong)]',
              disabled && 'opacity-50 cursor-not-allowed bg-[var(--bg-secondary)] hover:border-[var(--border)]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
              'text-[var(--text-muted)] transition-colors duration-[180ms]',
              'group-focus-within:text-[var(--primary)]'
            )}
          />
        </div>
        {error && (
          <p id={errorId} className="text-xs text-[var(--danger)] mt-1.5 font-body font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
