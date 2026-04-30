'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { BookOpen, Users, CalendarCheck, GraduationCap, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useMyTeachingAssignments } from '@/features/subjects/hooks/useSubjects'
import { SectionSubjectTeacher } from '@/features/subjects/types/subjects.types'

interface SectionGroup {
  sectionId: string
  sectionName: string
  gradeName: string
  programName: string
  programCode: string
  campusName: string
  subjects: SectionSubjectTeacher[]
}

export default function TeacherTeachingPage() {
  const { data: assignments = [], isLoading } = useMyTeachingAssignments()

  const sections: SectionGroup[] = useMemo(() => {
    const map = new Map<string, SectionGroup>()
    for (const a of assignments) {
      const sid = a.sectionId
      if (!map.has(sid)) {
        map.set(sid, {
          sectionId: sid,
          sectionName: a.section?.name ?? '—',
          gradeName: a.section?.grade?.name ?? '—',
          programName: a.section?.grade?.program?.name ?? '—',
          programCode: a.section?.grade?.program?.code ?? '—',
          campusName: a.section?.grade?.program?.campus?.name ?? '—',
          subjects: [],
        })
      }
      map.get(sid)!.subjects.push(a)
    }
    return Array.from(map.values()).sort((a, b) =>
      `${a.programName}${a.gradeName}${a.sectionName}`.localeCompare(
        `${b.programName}${b.gradeName}${b.sectionName}`
      )
    )
  }, [assignments])

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Teaching"
        breadcrumb={[
          { label: 'Home', href: '/teacher/dashboard' },
          { label: 'My Teaching' },
        ]}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="card" className="h-48" />)}
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <EmptyState
            icon={<BookOpen size={28} style={{ color: 'var(--primary)' }} />}
            title="No subjects assigned yet"
            description="Ask your administrator to assign you to sections and subjects."
          />
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--text-muted)]">
            {sections.length} section{sections.length !== 1 ? 's' : ''} ·{' '}
            {assignments.length} subject assignment{assignments.length !== 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((sec, i) => (
              <motion.div
                key={sec.sectionId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
              >
                {/* Section header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-hover)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text)] text-sm">Section {sec.sectionName}</p>
                      <p className="text-xs text-[var(--text-muted)]">{sec.gradeName} · {sec.programName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="info">{sec.programCode}</Badge>
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Building2 className="w-3 h-3" />{sec.campusName}
                    </span>
                  </div>
                </div>

                {/* Subjects list */}
                <div className="divide-y divide-[var(--border)]">
                  {sec.subjects.map(a => (
                    <div key={a.id} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                        <span className="text-sm font-medium text-[var(--text)]">{a.subject?.name}</span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">{a.subject?.code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teacher/attendance?section=${sec.sectionId}&subject=${a.subjectId}`}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                        >
                          <CalendarCheck className="w-3 h-3" />
                          Attendance
                        </Link>
                        <Link
                          href={`/teacher/my-classes/${sec.sectionId}`}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                        >
                          <Users className="w-3 h-3" />
                          Students
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-hover)]">
                  <span className="text-xs text-[var(--text-muted)]">
                    {sec.subjects.length} subject{sec.subjects.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
