'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/**
 * PageHeader component for page titles and actions
 * @param title - Page title
 * @param subtitle - Page subtitle
 * @param actions - Action buttons
 * @param breadcrumb - Breadcrumb items
 */
export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  breadcrumb?: Array<{ label: string; href?: string }>
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-2 mb-3">
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-gold-400">/</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="font-body text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-body text-xs text-[var(--text-muted)]">
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text)]">
            {title}
          </h1>
          {subtitle && (
            <p className="font-body text-sm text-[var(--text-muted)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
    </div>
  )
}

export default PageHeader
