'use client'

import { Badge } from '@/components/ui/Badge'
import { MyStudentProfile } from '@/features/students/api/students.api'

interface StudentContextStripProps {
  profile: MyStudentProfile
}

export function StudentContextStrip({ profile }: StudentContextStripProps) {
  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase()
  const sectionName = profile.section?.name ?? null
  const gradeName = profile.section?.grade?.name ?? null
  const campusName = profile.section?.grade?.program?.campus?.name ?? profile.campus?.name ?? null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] mb-4">
      <div className="w-9 h-9 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[var(--primary)]">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text)] truncate">
          {profile.firstName} {profile.lastName}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {profile.rollNumber && (
          <Badge variant="neutral" size="sm">Roll: {profile.rollNumber}</Badge>
        )}
        {sectionName && (
          <Badge variant="info" size="sm">{gradeName ? `${gradeName} · ${sectionName}` : `Section ${sectionName}`}</Badge>
        )}
        {campusName && (
          <Badge variant="success" size="sm">{campusName}</Badge>
        )}
      </div>
    </div>
  )
}
