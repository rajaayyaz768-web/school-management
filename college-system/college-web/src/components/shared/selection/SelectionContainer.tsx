'use client'

import { type ReactNode } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SelectionBreadcrumb } from './SelectionBreadcrumb'
import type { SelectionState } from './types'

type Step = 'campus' | 'program' | 'grade' | 'section'

interface SelectionContainerProps {
  title: string
  subtitle?: string
  children: ReactNode
  breadcrumbState?: Partial<SelectionState>
  onBreadcrumbNavigate?: (step: Step) => void
}

export function SelectionContainer({
  title,
  subtitle,
  children,
  breadcrumbState,
  onBreadcrumbNavigate,
}: SelectionContainerProps) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      {breadcrumbState && onBreadcrumbNavigate && (
        <SelectionBreadcrumb state={breadcrumbState} onNavigate={onBreadcrumbNavigate} />
      )}
      {children}
    </div>
  )
}

export default SelectionContainer
