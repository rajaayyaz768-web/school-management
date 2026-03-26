'use client'

import { useState, useId } from 'react'
import { cn } from '@/lib/utils'
import { Calendar } from 'lucide-react'

/**
 * DatePicker component - date input with calendar icon
 */
export interface DatePickerProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  hint?: string
  placeholder?: string
  disabled?: boolean
  min?: string
  max?: string
  required?: boolean
  className?: string
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  disabled,
  min,
  max,
  required,
  className,
}: DatePickerProps) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2"
        >
          {label}
          {required && <span className="text-[var(--danger)] ml-1">*</span>}
        </label>
      )}
      <div className="relative group">
        <Calendar
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
            'transition-colors duration-[180ms]',
            focused ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
          )}
        />
        <input
          id={id}
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          min={min}
          max={max}
          required={required}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            'w-full bg-[var(--surface)] border rounded-[var(--radius-sm)]',
            'pl-10 pr-4 py-2.5 font-body text-sm text-[var(--text)]',
            'outline-none',
            'transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
            'focus:border-[var(--primary)] focus:shadow-[var(--shadow-glow)]',
            error
              ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
              : 'border-[var(--border)] hover:border-[var(--border-strong)]',
            disabled && 'opacity-50 cursor-not-allowed bg-[var(--bg-secondary)] hover:border-[var(--border)]',
          )}
        />
      </div>
      {error && (
        <p id={errorId} className="text-xs text-[var(--danger)] mt-1.5 font-body font-medium" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--text-muted)] mt-1.5 font-body">{hint}</p>
      )}
    </div>
  )
}

export default DatePicker
