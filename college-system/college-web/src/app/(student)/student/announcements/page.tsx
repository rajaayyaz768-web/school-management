'use client'

import { Megaphone, Clock, ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAnnouncementsForMe } from '@/features/announcements/hooks/useAnnouncements'
import { Announcement } from '@/features/announcements/types/announcements.types'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}

const AUDIENCE_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  ALL: 'success', STUDENTS: 'info', PARENTS: 'warning', TEACHERS: 'neutral',
}

function AnnouncementCard({ item }: { item: Announcement }) {
  const [expanded, setExpanded] = useState(false)
  const isTruncated = item.content.length > 180
  const display = isTruncated && !expanded ? item.content.slice(0, 180) + '…' : item.content

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <Badge variant={AUDIENCE_VARIANT[item.audience] ?? 'neutral'}>
          {item.audience === 'ALL' ? 'All' : item.audience}
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

export default function StudentAnnouncementsPage() {
  const { data: announcements, isLoading } = useAnnouncementsForMe()

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Notices & Announcements"
        breadcrumb={[{ label: 'Home', href: '/student/dashboard' }, { label: 'Notices' }]}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-36" />)}
        </div>
      ) : !announcements?.length ? (
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <EmptyState
            icon={<Megaphone size={28} style={{ color: 'var(--primary)' }} />}
            title="No Notices Yet"
            description="There are no announcements or notices for you right now."
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
