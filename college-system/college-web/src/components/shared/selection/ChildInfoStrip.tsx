'use client'

import { Badge } from '@/components/ui/Badge'
import { MyChild } from '@/features/parents/types/parents.types'

interface ChildInfoStripProps {
  child: MyChild
}

export function ChildInfoStrip({ child }: ChildInfoStripProps) {
  const { student } = child
  const initials = `${student.firstName[0] ?? ''}${student.lastName[0] ?? ''}`.toUpperCase()
  const sectionName = student.section?.name ?? null
  const campusName = student.section?.grade?.program?.campus?.name ?? null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] mb-4">
      <div className="w-9 h-9 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[var(--primary)]">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text)] truncate">
          {student.firstName} {student.lastName}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {student.rollNumber && (
          <Badge variant="neutral" size="sm">Roll: {student.rollNumber}</Badge>
        )}
        {sectionName && (
          <Badge variant="info" size="sm">Section {sectionName}</Badge>
        )}
        {campusName && (
          <Badge variant="success" size="sm">{campusName}</Badge>
        )}
      </div>
    </div>
  )
}
