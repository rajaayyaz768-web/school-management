'use client'

import { useCampuses } from '@/features/campus/hooks/useCampus'
import { useCampusStore } from '@/store/campusStore'
import { useRole } from '@/store/authStore'
import { Badge } from '@/components/ui/Badge'
import { ProgramsPage } from './ProgramsPage'

export function AdminProgramsPage() {
  const role = useRole()
  const { activeCampusId } = useCampusStore()
  const { data: campuses } = useCampuses()

  const campus = role === 'SUPER_ADMIN'
    ? (campuses?.find(c => c.id === activeCampusId) ?? campuses?.[0])
    : campuses?.[0]

  const navigation = campus ? (
    <div className="flex items-center gap-3 mb-4 -mt-2">
      <span className="text-sm text-[var(--text-muted)]">Campus</span>
      <Badge variant="info">{campus.name}</Badge>
    </div>
  ) : null

  return (
    <ProgramsPage
      campusId={campus?.id}
      navigation={navigation}
    />
  )
}
