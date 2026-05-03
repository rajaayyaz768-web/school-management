'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { cn } from '@/lib/utils'
import { useExams } from '@/features/exams/hooks/useExams'
import { useMyTeachingAssignments } from '@/features/subjects/hooks/useSubjects'
import type { SectionCardData } from '@/components/shared/selection/types'
import type { Exam } from '@/features/exams/types/exams.types'

type Step = 'section' | 'exams'

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  SCHEDULED: { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  ONGOING:   { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  COMPLETED: { bg: 'bg-white/5',        text: 'text-[var(--text-muted)]' },
  CANCELLED: { bg: 'bg-red-500/15',     text: 'text-red-400' },
}

function ExamCard({ exam }: { exam: Exam }) {
  const style = STATUS_STYLE[exam.status ?? 'SCHEDULED'] ?? STATUS_STYLE.SCHEDULED
  const date = new Date(exam.date)
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl flex overflow-hidden">
      <div className="w-14 bg-[var(--primary)] flex flex-col items-center justify-center py-3 shrink-0">
        <span className="text-[10px] font-semibold text-white/70 uppercase leading-tight">
          {date.toLocaleDateString('en-PK', { month: 'short' })}
        </span>
        <span className="text-xl font-bold text-white leading-tight">
          {date.toLocaleDateString('en-PK', { day: 'numeric' })}
        </span>
      </div>
      <div className="p-3 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm text-[var(--text)] truncate">
            {exam.isClassTest ? 'Class Test' : exam.examType?.name ?? 'Exam'}
          </h3>
          {exam.status && (
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0', style.bg, style.text)}>
              {exam.status}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)] truncate">
          {exam.subject?.name} · {exam.section?.name}
        </p>
        {exam.startTime && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{exam.startTime}</p>
        )}
      </div>
    </div>
  )
}

export default function TeacherExamsPage() {
  const [step, setStep] = useState<Step>('section')
  const [sectionId, setSectionId] = useState<string | null>(null)
  const [sectionName, setSectionName] = useState<string | null>(null)
  const [filterSubjectId, setFilterSubjectId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const { data: assignments = [] } = useMyTeachingAssignments()
  const subjectsInSection = assignments.filter(a => a.sectionId === sectionId)

  const { data: exams = [], isLoading: examsLoading } = useExams(
    {
      sectionId: sectionId ?? undefined,
      subjectId: filterSubjectId || undefined,
      status: filterStatus || undefined,
    },
    !!sectionId
  )

  const handleSectionSelect = (section: SectionCardData) => {
    setSectionId(section.id)
    setSectionName(section.name)
    setFilterSubjectId('')
    setFilterStatus('')
    setStep('exams')
  }

  const handleBack = () => {
    setSectionId(null); setSectionName(null)
    setFilterSubjectId(''); setFilterStatus('')
    setStep('section')
  }

  // ── STEP 1 ────────────────────────────────────────────────────────────────
  if (step === 'section') {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center">
          <h1 className="font-bold text-lg text-[var(--text)]">Exam Schedule</h1>
        </header>
        <div className="p-4">
          <p className="text-sm text-[var(--text-muted)] mb-4">Select a section to view exams</p>
          <SectionSelectorCards
            onSelect={handleSectionSelect}
            selectedId={sectionId}
            emptyDescription="No sections assigned. Contact your administrator."
          />
        </div>
      </div>
    )
  }

  // ── STEP 2 — Exam list ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center gap-3">
        <button onClick={handleBack} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface)] transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
        </button>
        <h1 className="font-bold text-base text-[var(--text)] flex-1 truncate">Section {sectionName} — Exams</h1>
        <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
          {sectionName}
        </span>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={sectionId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 space-y-4"
        >
          {/* Subject filter chips */}
          {subjectsInSection.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[{ id: '', name: 'All Subjects' }, ...subjectsInSection.map(a => ({ id: a.subjectId, name: a.subject?.name ?? '' }))].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setFilterSubjectId(filterSubjectId === sub.id ? '' : sub.id)}
                  className={cn(
                    'shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-colors',
                    filterSubjectId === sub.id
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)]'
                  )}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          {/* Status filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { value: '', label: 'All' },
              { value: 'SCHEDULED', label: 'Scheduled' },
              { value: 'ONGOING', label: 'Ongoing' },
              { value: 'COMPLETED', label: 'Completed' },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => setFilterStatus(filterStatus === s.value ? '' : s.value)}
                className={cn(
                  'shrink-0 h-8 px-3 rounded-full text-xs font-medium transition-colors',
                  filterStatus === s.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)]'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Exam list */}
          {examsLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
              ))}
            </div>
          ) : exams.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-muted)] py-12">
              No exams found for the selected filters.
            </p>
          ) : (
            <div className="space-y-2">
              {exams.map(exam => <ExamCard key={exam.id} exam={exam} />)}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
