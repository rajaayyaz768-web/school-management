'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Exam } from '../types/exams.types'
import { CalendarDays, Clock, BookOpen } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  COMPLETED: 'success',
  ONGOING: 'warning',
  SCHEDULED: 'info',
  CANCELLED: 'danger',
}

interface ExamSelectorCardsProps {
  exams: Exam[]
  selectedId?: string | null
  onSelect: (exam: Exam) => void
  isLoading?: boolean
}

export function ExamSelectorCards({ exams, selectedId, onSelect, isLoading }: ExamSelectorCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} variant="card" />)}
      </div>
    )
  }

  if (exams.length === 0) {
    return <EmptyState title="No exams available" description="No exams found for results entry in this section." />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exams.map((exam) => (
        <button
          key={exam.id}
          onClick={() => onSelect(exam)}
          className={cn(
            'text-left rounded-[var(--radius-card)] border-2 p-5 transition-all duration-[var(--transition-base)]',
            'bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)]',
            selectedId === exam.id
              ? 'border-[var(--primary)] bg-[var(--surface-hover)]'
              : 'border-[var(--border)]'
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-[var(--text)] leading-tight">
                {exam.subject?.name ?? '—'}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[exam.status] ?? 'neutral'}>{exam.status}</Badge>
          </div>

          <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>
                {exam.date
                  ? new Date(exam.date).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
                  : '—'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{exam.examType?.name ?? '—'}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Total Marks</span>
            <span className="text-sm font-semibold text-[var(--text)]">{exam.totalMarks}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
