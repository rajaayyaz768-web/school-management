'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Button component with multiple variants and sizes
 * Premium micro-interactions: hover lift, active press, focus ring
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

const variantStyles = {
  primary: `
    bg-gradient-to-b from-[var(--primary)] to-[var(--primary-dark)] text-white
    hover:from-[var(--primary-light)] hover:to-[var(--primary)]
    shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]
    hover:shadow-[var(--shadow-md)]
    focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]
  `,
  secondary: `
    bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]
    hover:bg-[var(--surface-alt)] hover:border-[var(--border-strong)]
    shadow-[var(--shadow-sm)]
    focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]
  `,
  danger: `
    bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white
    hover:from-[#F87171] hover:to-[#EF4444]
    shadow-[0_1px_2px_rgba(220,38,38,0.2)]
    hover:shadow-[0_4px_12px_rgba(239,68,68,0.25)]
    focus-visible:ring-[3px] focus-visible:ring-[#EF4444]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]
  `,
  ghost: `
    bg-transparent text-[var(--text-secondary)]
    hover:bg-[var(--surface-hover)] hover:text-[var(--text)]
    focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]
  `,
  gold: `
    bg-gradient-to-b from-[var(--gold-light)] via-[var(--gold)] to-[var(--gold-dark)]
    text-[#1a1a1a] font-semibold
    shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25)]
    hover:shadow-[var(--shadow-gold-glow),0_4px_16px_rgba(212,168,67,0.3)]
    focus-visible:ring-[3px] focus-visible:ring-[var(--gold)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]
  `,
  outline: `
    border-[1.5px] border-[var(--primary)] text-[var(--primary)] bg-transparent
    hover:bg-[var(--primary)] hover:text-white
    focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]
  `,
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2.5',
}

const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'font-body font-medium rounded-[var(--radius-sm)] inline-flex items-center justify-center',
          'transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          'outline-none',
          // Hover lift
          'hover:-translate-y-[1px]',
          // Active press
          'active:translate-y-0 active:scale-[0.98]',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:scale-100',
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
