'use client'

import { useSections } from '@/features/sections/hooks/useSections'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import type { SectionCardData } from './types'

interface SectionSelectorCardsProps {
  campusId: string
  onSelect: (section: SectionCardData) => void
  selectedId?: string | null
}

export function SectionSelectorCards({ campusId, onSelect, selectedId }: SectionSelectorCardsProps) {
  const { data, isLoading } = useSections(undefined, campusId)
  const raw = data ?? []

  const sections: SectionCardData[] = raw.map((s) => ({
    id: s.id,
    name: s.name,
    gradeId: s.gradeId ?? s.grade?.id ?? null,
    programName: s.programName ?? s.grade?.program?.name ?? null,
    programCode: s.programCode ?? s.grade?.program?.code ?? null,
    gradeName: s.gradeName ?? s.grade?.name ?? null,
    studentCount: s.studentCount ?? 0,
    capacity: s.capacity ?? 40,
  }))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      </div>
    )
  }

  if (sections.length === 0) {
    return <EmptyState title="No sections available" description="No sections are assigned to this campus." />
  }

  const grouped = sections.reduce<Record<string, SectionCardData[]>>((acc, sec) => {
    const key = sec.programName ?? 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(sec)
    return acc
  }, {})

  const sortedGroups = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([program, secs]) => ({
      program,
      sections: [...secs].sort((a, b) => a.name.localeCompare(b.name)),
    }))

  return (
    <div className="space-y-6">
      {sortedGroups.map(({ program, sections: groupSections }) => (
        <div key={program}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            {program}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupSections.map((sec) => {
              const fillPct = sec.capacity > 0
                ? Math.min((sec.studentCount / sec.capacity) * 100, 100)
                : 0

              return (
                <button
                  key={sec.id}
                  onClick={() => onSelect(sec)}
                  className={cn(
                    'text-left rounded-[var(--radius-card)] border-2 p-5 transition-all duration-[var(--transition-base)]',
                    'bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)]',
                    selectedId === sec.id
                      ? 'border-[var(--primary)] bg-[var(--surface-hover)]'
                      : 'border-[var(--border)]'
                  )}
                >
                  <p className="text-xl font-bold text-[var(--text)] mb-1">{sec.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    {[sec.programCode, sec.gradeName].filter(Boolean).join(' · ')}
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-[var(--border)] overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {sec.studentCount} / {sec.capacity} students
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SectionSelectorCards
