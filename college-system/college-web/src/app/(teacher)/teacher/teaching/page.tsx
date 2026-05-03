'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { BookOpen, CalendarCheck, Users, Building2, GraduationCap } from 'lucide-react'
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
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center">
        <div>
          <h1 className="font-bold text-lg text-[var(--text)]">My Teaching</h1>
          {!isLoading && (
            <p className="text-xs text-[var(--text-muted)]">
              {sections.length} section{sections.length !== 1 ? 's' : ''} · {assignments.length} subject{assignments.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
          ))
        ) : sections.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              icon={<BookOpen size={32} className="text-[var(--primary)]" />}
              title="No subjects assigned yet"
              description="Ask your administrator to assign you to sections and subjects."
            />
          </div>
        ) : (
          sections.map((sec, i) => (
            <motion.article
              key={sec.sectionId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden"
            >
              {/* Section header */}
              <div className="bg-[var(--primary)]/10 border-b border-[var(--border)] px-4 py-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text)]">Section {sec.sectionName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{sec.gradeName} · {sec.programName}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
                    {sec.programCode}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    <Building2 className="w-3 h-3" />{sec.campusName}
                  </span>
                </div>
              </div>

              {/* Subject rows */}
              <div className="divide-y divide-[var(--border)]">
                {sec.subjects.map(a => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                      <span className="text-sm font-medium text-[var(--text)] truncate">{a.subject?.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--text-muted)] shrink-0">
                        {a.subject?.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/teacher/attendance/history?section=${sec.sectionId}&subject=${a.subjectId}`}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                      >
                        <CalendarCheck className="w-3 h-3" />
                        Attend
                      </Link>
                      <Link
                        href={`/teacher/my-classes/${sec.sectionId}`}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                      >
                        <Users className="w-3 h-3" />
                        Students
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-[var(--bg)] border-t border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)]">
                  {sec.subjects.length} subject{sec.subjects.length !== 1 ? 's' : ''}
                </span>
              </div>
            </motion.article>
          ))
        )}
      </div>
    </div>
  )
}
