'use client'

import { Megaphone, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChildSwitcher } from '@/components/shared/selection/ChildSwitcher'
import { ChildInfoStrip } from '@/components/shared/selection/ChildInfoStrip'
import { useMyChildren } from '@/features/parents/hooks/useParents'
import { useAnnouncementsForMe } from '@/features/announcements/hooks/useAnnouncements'
import { Announcement } from '@/features/announcements/types/announcements.types'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}

function AnnouncementCard({ item }: { item: Announcement }) {
  const [expanded, setExpanded] = useState(false)
  const isTruncated = item.content.length > 180
  const display = isTruncated && !expanded ? item.content.slice(0, 180) + '…' : item.content

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <Badge variant={item.audience === 'ALL' ? 'success' : item.audience === 'PARENTS' ? 'warning' : 'info'}>
          {item.audience === 'ALL' ? 'All' : item.audience === 'PARENTS' ? 'Parents' : item.audience}
        </Badge>
        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(item.publishedAt)}
        </span>
      </div>
      <h3 className="font-semibold text-[var(--text)]">{item.title}</h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{display}</p>
      {isTruncated && (
        <button
          className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
        </button>
      )}
      {item.campus && (
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <MapPin className="w-3 h-3" />
          {item.campus.name}
        </div>
      )}
    </Card>
  )
}

export default function ParentAnnouncementsPage() {
  const { data: announcements, isLoading } = useAnnouncementsForMe()
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const { data: children } = useMyChildren()
  const activeChild = children?.find(c => c.student.id === (selectedStudentId || children?.[0]?.student.id))

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Announcements"
        breadcrumb={[{ label: 'Home', href: '/parent/dashboard' }, { label: 'Announcements' }]}
      />

      {children && (
        <>
          <ChildSwitcher
            children={children}
            activeId={activeChild?.student.id ?? ''}
            onChange={setSelectedStudentId}
          />
          {activeChild && <ChildInfoStrip child={activeChild} />}
        </>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-36" />)}
        </div>
      ) : !announcements?.length ? (
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <EmptyState
            icon={<Megaphone size={28} style={{ color: 'var(--primary)' }} />}
            title="No Announcements"
            description="There are no announcements for you right now. Check back later."
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((item) => <AnnouncementCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}
