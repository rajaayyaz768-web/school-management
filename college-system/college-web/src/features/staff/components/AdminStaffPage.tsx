'use client'

import { useCampuses } from '@/features/campus/hooks/useCampus'
import { Badge } from '@/components/ui/Badge'
import { StaffPage } from './StaffPage'

export function AdminStaffPage() {
  const { data: campuses } = useCampuses()
  const campus = campuses?.[0]

  const navigation = campus ? (
    <div className="flex items-center gap-3 mb-4 -mt-2">
      <span className="text-sm text-[var(--text-muted)]">Campus</span>
      <Badge variant="info">{campus.name}</Badge>
    </div>
  ) : null

  return (
    <StaffPage
      campusId={campus?.id}
      navigation={navigation}
    />
  )
}
