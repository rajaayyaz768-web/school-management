'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  breadcrumb?: Array<{ label: string; href?: string }>
  className?: string
}

export function PageHeader({
  title, subtitle, actions, breadcrumb, className,
}: PageHeaderProps) {
  return (
    <div
      className={cn('mb-6 px-6 pt-6 pb-5 relative overflow-hidden', className)}
      style={{
        background: 'linear-gradient(to right, var(--bg-tint) 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm"
        style={{ background: 'var(--primary)' }}
      />

      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 mb-2">
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 text-[var(--text-disabled)]" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="font-body font-600 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                  style={{ fontSize: 'var(--font-size-xs, 12px)' }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="font-body font-600 text-[var(--primary)]"
                  style={{ fontSize: 'var(--font-size-xs, 12px)' }}
                >
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            className="font-display font-800 text-[var(--text)] leading-[1.08]"
            style={{ fontSize: '28px', letterSpacing: '-0.02em' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="font-body font-500 text-[var(--text-muted)] mt-1"
              style={{ fontSize: 'var(--font-size-sm, 13px)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2">{actions}</div>
        )}
      </div>
    </div>
  )
}

export default PageHeader
