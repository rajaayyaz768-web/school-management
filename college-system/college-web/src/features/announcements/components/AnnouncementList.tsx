'use client'

import { Megaphone } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnnouncementCard } from './AnnouncementCard'
import { Announcement } from '../types/announcements.types'

interface AnnouncementListProps {
  announcements: Announcement[]
  isLoading: boolean
  onEdit?: (announcement: Announcement) => void
  onDelete?: (id: string) => void
  showActions?: boolean
}

export function AnnouncementList({
  announcements,
  isLoading,
  onEdit,
  onDelete,
  showActions = false,
}: AnnouncementListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <EmptyState
        title="No announcements found"
        description="Try adjusting your filters or create a new announcement"
        icon={<Megaphone className="w-10 h-10" />}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {announcements.map((a) => (
        <AnnouncementCard
          key={a.id}
          announcement={a}
          showActions={showActions}
          onEdit={onEdit ? () => onEdit(a) : undefined}
          onDelete={onDelete ? () => onDelete(a.id) : undefined}
        />
      ))}
    </div>
  )
}

export default AnnouncementList
