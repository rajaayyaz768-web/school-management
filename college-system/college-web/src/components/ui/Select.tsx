'use client'

import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

/**
 * Select component with label and error support
 * @param label - Field label
 * @param options - Array of options with value and label
 * @param error - Error message
 * @param placeholder - Placeholder text
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
  ({ label, options, error, placeholder, className, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-[var(--surface)] border rounded-[var(--radius-sm)]',
              'px-4 py-2.5 pr-10 font-body text-sm text-[var(--text)]',
              'appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400',
              'transition-all duration-200',
              error
                ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
                : 'border-[var(--border)]',
              disabled && 'opacity-60 cursor-not-allowed bg-[var(--bg-secondary)]',
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
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1 font-body">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
