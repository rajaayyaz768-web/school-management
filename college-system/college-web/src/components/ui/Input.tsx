'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightIcon, className, disabled, id: propId, ...props }, ref) => {
    const autoId  = useId()
    const inputId = propId || autoId
    const errorId = error ? `${inputId}-error` : undefined
    const hintId  = hint && !error ? `${inputId}-hint` : undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-body text-[var(--font-size-sm)] font-700 uppercase tracking-[0.08em] text-[var(--slate-600)] mb-[6px]"
          >
            {label}
            {props.required && <span className="text-[var(--red-500)] ml-1">*</span>}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <span className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-400)]',
              'transition-colors duration-[var(--dur-fast)]',
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
              'w-full rounded-[var(--radius-md)] font-body text-[var(--font-size-base)] font-500',
              'px-4 py-[8px]',
              'text-[var(--slate-900)] placeholder:text-[var(--slate-400)]',
              'outline-none',
              'transition-all duration-[var(--dur-fast)] ease-[cubic-bezier(0.2,0.8,0.2,1)]',
              error
                ? [
                    'bg-[var(--bg)] border border-[var(--red-500)]',
                    'focus:border-[var(--red-500)]',
                    'focus:shadow-[0_0_0_4px_rgba(209,69,69,0.12)]',
                    '[animation:shake_0.4s_cubic-bezier(0.36,0.07,0.19,0.97)]',
                  ]
                : [
                    'bg-[var(--bg-secondary)] border border-[var(--border)]',
                    'hover:border-[var(--border-strong)]',
                    'focus:bg-[var(--bg)] focus:border-[var(--primary)]',
                    'focus:shadow-[var(--shadow-focus)]',
                  ],
              icon      && 'pl-[34px]',
              rightIcon && 'pr-[34px]',
              disabled  && 'opacity-50 cursor-not-allowed bg-[var(--slate-100)] hover:border-[var(--slate-200)]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-[var(--slate-400)]',
              'transition-colors duration-[var(--dur-fast)]',
              'group-focus-within:text-[var(--primary)]'
            )}>
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-[var(--font-size-sm)] font-500 text-[var(--red-700)] mt-1.5" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-[var(--font-size-sm)] font-500 text-[var(--slate-500)] mt-1.5">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
