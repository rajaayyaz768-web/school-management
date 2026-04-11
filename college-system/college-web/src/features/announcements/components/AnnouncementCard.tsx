'use client'

import { useState } from 'react'
import { Edit2, Trash2, MapPin, Clock, User, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { Announcement, AnnouncementAudience } from '../types/announcements.types'

const AUDIENCE_BADGE_VARIANT: Record<AnnouncementAudience, 'success' | 'info' | 'warning' | 'neutral' | 'danger'> = {
  ALL: 'success',
  TEACHERS: 'info',
  STUDENTS: 'warning',
  PARENTS: 'neutral',
  SECTION: 'danger',
}

const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
  ALL: 'All',
  TEACHERS: 'Teachers',
  STUDENTS: 'Students',
  PARENTS: 'Parents',
  SECTION: 'Section',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

const TRUNCATE_LENGTH = 150

interface AnnouncementCardProps {
  announcement: Announcement
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
  showActions = false,
}: AnnouncementCardProps) {
  const [expanded, setExpanded] = useState(false)

  const { title, content, audience, campus, section, author, publishedAt, expiresAt } = announcement

  const isTruncated = content.length > TRUNCATE_LENGTH
  const displayContent =
    isTruncated && !expanded ? content.slice(0, TRUNCATE_LENGTH) + '…' : content

  const expired = isExpired(expiresAt)

  return (
    <Card hoverable className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={AUDIENCE_BADGE_VARIANT[audience]}>
            {AUDIENCE_LABEL[audience]}
          </Badge>
          {expired && (
            <Badge variant="neutral">Expired</Badge>
          )}
        </div>
        {showActions && (
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip content="Edit">
              <Button variant="ghost" size="sm" onClick={onEdit} icon={<Edit2 className="w-3.5 h-3.5" />} />
            </Tooltip>
            <Tooltip content="Delete">
              <Button variant="ghost" size="sm" onClick={onDelete} icon={<Trash2 className="w-3.5 h-3.5 text-[var(--danger)]" />} />
            </Tooltip>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-base font-semibold text-[var(--text)] leading-snug">
        {title}
      </h3>

      {/* Meta row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="font-body text-xs">
            {campus?.name ?? 'All Campuses'}
            {section && ` · ${section.name}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <User className="w-3 h-3 shrink-0" />
          <span className="font-body text-xs">{author.email}</span>
        </div>
      </div>

      {/* Content */}
      <div>
        <p className="font-body text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
          {displayContent}
        </p>
        {isTruncated && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            {expanded ? (
              <>Show less <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Read more <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/50 mt-auto flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <Clock className="w-3 h-3" />
          <span className="font-body text-xs">
            Published {formatDate(publishedAt)}
          </span>
        </div>
        {expiresAt && (
          <span
            className={`font-body text-xs font-medium ${expired ? 'text-[var(--danger)]' : 'text-[#D97706]'}`}
          >
            Expires: {formatDate(expiresAt)}
          </span>
        )}
      </div>
    </Card>
  )
}

export default AnnouncementCard
