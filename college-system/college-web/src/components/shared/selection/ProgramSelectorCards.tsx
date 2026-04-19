'use client'

import { usePrograms } from '@/features/programs/hooks/usePrograms'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import type { ProgramCardData } from './types'

interface ProgramSelectorCardsProps {
  campusId: string
  onSelect: (program: ProgramCardData) => void
  selectedId?: string | null
}

export function ProgramSelectorCards({ campusId, onSelect, selectedId }: ProgramSelectorCardsProps) {
  const { data, isLoading } = usePrograms(campusId)
  const raw = data ?? []

  const programs: ProgramCardData[] = raw.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    durationYears: p.durationYears ?? 0,
  }))

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} variant="card" />)}
      </div>
    )
  }

  if (programs.length === 0) {
    return <EmptyState title="No programs available" description="No programs found for this campus." />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {programs.map((program) => (
        <button
          key={program.id}
          onClick={() => onSelect(program)}
          className={cn(
            'text-left rounded-[var(--radius-card)] border-2 p-6 transition-all duration-[var(--transition-base)]',
            'bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)]',
            selectedId === program.id
              ? 'border-[var(--primary)] bg-[var(--surface-hover)]'
              : 'border-[var(--border)]'
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-lg font-semibold text-[var(--text)] leading-tight">{program.name}</p>
            <Badge variant="info">{program.code}</Badge>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{program.durationYears} year program</p>
        </button>
      ))}
    </div>
  )
}

export default ProgramSelectorCards
