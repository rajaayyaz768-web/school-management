'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Button component with multiple variants and sizes
 * @param variant - Visual style: primary, secondary, danger, ghost, gold, outline
 * @param size - Size: sm, md, lg
 * @param loading - Show loading spinner
 * @param icon - Icon element to display
 * @param fullWidth - Make button full width
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
    bg-[var(--primary)] text-white hover:bg-[var(--primary-light)]
    dark:bg-gold-400 dark:text-charcoal-900 dark:hover:bg-gold-300
  `,
  secondary: `
    bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]
    hover:bg-[var(--bg-secondary)] hover:border-[var(--border-strong)]
  `,
  danger: `
    bg-red-600 text-white hover:bg-red-700
  `,
  ghost: `
    bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]
  `,
  gold: `
    bg-gradient-to-r from-gold-600 to-gold-400 text-charcoal-900
    font-semibold shadow-gold hover:brightness-105
  `,
  outline: `
    border-2 border-[var(--primary)] text-[var(--primary)] bg-transparent
    hover:bg-[var(--primary)] hover:text-white
    dark:border-gold-400 dark:text-gold-400 dark:hover:bg-gold-400 dark:hover:text-charcoal-900
  `,
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
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
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'font-body font-semibold rounded-[var(--radius-sm)] transition-all duration-200',
          'inline-flex items-center justify-center gap-2',
          'hover:shadow-[var(--shadow-sm)] hover:-translate-y-[1px]',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          loading && 'opacity-80 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {loading ? <Spinner /> : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
