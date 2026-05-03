'use client'

import { useEffect } from 'react'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import type { CampusCardData } from './types'

interface CampusSelectorCardsProps {
  onSelect: (campus: CampusCardData) => void
  selectedId?: string | null
  showAllOption?: boolean
  onSelectAll?: () => void
}

export function CampusSelectorCards({
  onSelect,
  selectedId,
  showAllOption = false,
  onSelectAll,
}: CampusSelectorCardsProps) {
  const { data, isLoading } = useCampuses()
  const campuses = data ?? []

  // Auto-skip: if exactly one campus returned, select it immediately and render nothing
  useEffect(() => {
    if (!isLoading && campuses.length === 1) {
      const c = campuses[0]
      onSelect({
        id: c.id,
        name: c.name,
        campus_code: c.campus_code,
        student_count: c.student_count ?? 0,
        staff_count: c.staff_count ?? 0,
        is_active: c.is_active,
      })
    }
  }, [isLoading, campuses.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} variant="card" />)}
      </div>
    )
  }

  if (!isLoading && campuses.length === 1) return null

  if (campuses.length === 0) {
    return <EmptyState title="No campuses available" description="You are not assigned to any campus." />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {showAllOption && (
        <button
          onClick={onSelectAll}
          className={cn(
            'text-left rounded-[var(--radius-card)] border-2 p-4 sm:p-6 transition-all duration-[var(--transition-base)]',
            'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)]'
          )}
        >
          <p className="text-sm sm:text-lg font-semibold text-[var(--text)]">All Campuses</p>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">View data across all campuses</p>
        </button>
      )}

      {campuses.map((campus) => (
        <button
          key={campus.id}
          onClick={() =>
            onSelect({
              id: campus.id,
              name: campus.name,
              campus_code: campus.campus_code,
              student_count: campus.student_count ?? 0,
              staff_count: campus.staff_count ?? 0,
              is_active: campus.is_active,
            })
          }
          className={cn(
            'text-left rounded-[var(--radius-card)] border-2 p-4 sm:p-6 transition-all duration-[var(--transition-base)]',
            'bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)]',
            selectedId === campus.id
              ? 'border-[var(--primary)] bg-[var(--surface-hover)]'
              : 'border-[var(--border)]'
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <p className="text-sm sm:text-lg font-semibold text-[var(--text)] leading-tight">{campus.name}</p>
            <Badge variant="info" className="text-[10px] shrink-0 mt-0.5">{campus.campus_code}</Badge>
          </div>
          <div className="flex gap-3 text-xs sm:text-sm text-[var(--text-muted)]">
            <span>{campus.student_count ?? 0} students</span>
            <span>{campus.staff_count ?? 0} staff</span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default CampusSelectorCards
