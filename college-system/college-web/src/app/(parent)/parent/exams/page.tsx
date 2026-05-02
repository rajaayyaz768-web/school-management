'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChildSwitcher } from '@/components/shared/selection/ChildSwitcher'
import { ChildInfoStrip } from '@/components/shared/selection/ChildInfoStrip'
import { useMyChildren } from '@/features/parents/hooks/useParents'
import { useExams } from '@/features/exams/hooks/useExams'
import type { Exam } from '@/features/exams/types/exams.types'

const chipBase = 'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer'
const chipActive = 'bg-[var(--primary)] text-white border-[var(--primary)]'
const chipInactive = 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]'

function statusBadge(status: string) {
  if (status === 'SCHEDULED') return <Badge variant="info" size="sm">Upcoming</Badge>
  if (status === 'ONGOING') return <Badge variant="warning" size="sm">In Progress</Badge>
  if (status === 'COMPLETED') return <Badge variant="success" size="sm">Completed</Badge>
  if (status === 'CANCELLED') return <Badge variant="danger" size="sm">Cancelled</Badge>
  return null
}

function ExamCard({ exam }: { exam: Exam }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-card)] p-4 space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-[var(--text)]">{exam.subject?.name}</p>
          <p className="text-xs text-[var(--text-muted)]">{exam.examType?.name}</p>
        </div>
        {statusBadge(exam.status)}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
        <span>📅 {new Date(exam.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span>⏱ {exam.startTime}</span>
        <span>📝 {exam.totalMarks} marks</span>
      </div>
      {exam.venue && <p className="text-xs text-[var(--text-muted)]">📍 {exam.venue}</p>}
    </motion.div>
  )
}

export default function ParentExamsPage() {
  const [tab, setTab] = useState<'scheduled' | 'classtest'>('scheduled')
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const { data: children, isLoading: childrenLoading } = useMyChildren()
  const activeChild = children?.find(
    (c) => c.student.id === (selectedStudentId || children?.[0]?.student.id)
  )
  const sectionId = activeChild?.student.section?.id

  const { data: exams = [], isLoading: examsLoading } = useExams(
    { sectionId, isClassTest: tab === 'classtest' },
    !!sectionId
  )

  const upcoming = exams.filter((e) => e.status === 'SCHEDULED')
  const ongoing = exams.filter((e) => e.status === 'ONGOING')
  const completed = exams.filter((e) => e.status === 'COMPLETED')

  const isLoading = childrenLoading || examsLoading

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Exams"
        breadcrumb={[{ label: 'Home', href: '/parent/dashboard' }, { label: 'Exams' }]}
      />

      {!childrenLoading && children && (
        <>
          <ChildSwitcher
            items={children}
            activeId={activeChild?.student.id ?? ''}
            onChange={setSelectedStudentId}
          />
          {activeChild && <ChildInfoStrip child={activeChild} />}
        </>
      )}

      {/* Tab chips */}
      <div className="flex gap-2">
        <button onClick={() => setTab('scheduled')}
          className={`${chipBase} ${tab === 'scheduled' ? chipActive : chipInactive}`}>
          Scheduled Exams
        </button>
        <button onClick={() => setTab('classtest')}
          className={`${chipBase} ${tab === 'classtest' ? chipActive : chipInactive}`}>
          Class Tests
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
      ) : !sectionId ? (
        <EmptyState title="No section assigned" description="This child hasn't been assigned to a section yet." />
      ) : exams.length === 0 ? (
        <EmptyState title={tab === 'classtest' ? 'No class tests' : 'No exams scheduled'} description="Nothing to show right now." />
      ) : (
        <div className="space-y-6">
          {ongoing.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">In Progress</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ongoing.map((e) => <ExamCard key={e.id} exam={e} />)}
              </div>
            </section>
          )}
          {upcoming.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Upcoming</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcoming.map((e) => <ExamCard key={e.id} exam={e} />)}
              </div>
            </section>
          )}
          {completed.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Completed</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {completed.map((e) => <ExamCard key={e.id} exam={e} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
