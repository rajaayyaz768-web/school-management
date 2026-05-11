'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: [
    'bg-[var(--primary)] text-white',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(19,38,67,0.18)]',
    'hover:bg-[var(--primary-hover)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),var(--shadow-md)]',
    'active:bg-[var(--primary-dark)] active:shadow-[var(--shadow-xs)]',
    'focus-visible:shadow-[var(--shadow-focus)]',
  ].join(' '),

  secondary: [
    'bg-[var(--surface)] text-[var(--text)]',
    'border border-[var(--border)]',
    'shadow-[var(--shadow-xs)]',
    'hover:bg-[var(--bg-secondary)] hover:border-[var(--border-strong)]',
    'focus-visible:border-[var(--primary)] focus-visible:shadow-[var(--shadow-focus)]',
  ].join(' '),

  danger: [
    'bg-[var(--red-500)] text-white',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
    'hover:bg-[var(--red-700)]',
    'focus-visible:shadow-[0_0_0_4px_rgba(209,69,69,0.22)]',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--slate-700)]',
    'hover:bg-[var(--slate-50)] hover:text-[var(--slate-900)]',
    'focus-visible:shadow-[var(--shadow-focus)]',
  ].join(' '),

  gold: [
    'bg-[var(--amber-500)] text-[var(--slate-900)]',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',
    'hover:bg-[var(--amber-700)] hover:text-white',
    'focus-visible:shadow-[0_0_0_4px_rgba(224,161,27,0.22)]',
  ].join(' '),

  outline: [
    'bg-transparent text-[var(--primary-hover)]',
    'border border-[var(--primary)]',
    'hover:bg-[var(--bg-tint)]',
    'focus-visible:shadow-[var(--shadow-focus)]',
  ].join(' '),
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-[7px] text-[var(--font-size-base)] gap-1.5 rounded-[var(--radius-md)]',
  md: 'px-[14px] py-[9px] text-[var(--font-size-base)] gap-[7px] rounded-[var(--radius-md)]',
  lg: 'px-[22px] py-[11px] text-[15px] gap-2 rounded-[var(--radius-md)]',
}

const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, icon, fullWidth = false,
     disabled, className, children, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'font-body font-700 inline-flex items-center justify-center',
          'transition-all duration-[var(--dur-fast)] ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          'outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          loading && 'pointer-events-none',
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner className={size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
        ) : icon ? (
          <span className="shrink-0 flex items-center">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
