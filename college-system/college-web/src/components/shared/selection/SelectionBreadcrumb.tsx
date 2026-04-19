'use client'

import Button from '@/components/ui/Button'
import type { SelectionState } from './types'

type Step = 'campus' | 'program' | 'grade' | 'section'

interface SelectionBreadcrumbProps {
  state: Partial<SelectionState>
  onNavigate: (step: Step) => void
}

export function SelectionBreadcrumb({ state, onNavigate }: SelectionBreadcrumbProps) {
  const segments: { label: string; step: Step }[] = []

  if (state.campusName) segments.push({ label: state.campusName, step: 'campus' })
  if (state.programName) segments.push({ label: state.programName, step: 'program' })
  if (state.gradeName) segments.push({ label: state.gradeName, step: 'grade' })
  if (state.sectionName) segments.push({ label: state.sectionName, step: 'section' })

  if (segments.length === 0) return null

  return (
    <nav className="flex items-center flex-wrap gap-1 text-sm mb-6">
      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1
        return (
          <span key={seg.step} className="flex items-center gap-1">
            {idx > 0 && (
              <span className="text-[var(--text-muted)] select-none"> › </span>
            )}
            {isLast ? (
              <span className="font-medium text-[var(--primary)]">{seg.label}</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(seg.step)}
                className="px-1 py-0 h-auto text-[var(--text-muted)] hover:text-[var(--primary)]"
              >
                {seg.label}
              </Button>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export default SelectionBreadcrumb
