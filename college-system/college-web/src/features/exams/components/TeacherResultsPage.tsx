'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { ResultEntryTable } from './ResultEntryTable'
import { ClassTestForm } from './ClassTestForm'
import { useExams } from '../hooks/useExams'
import { useMyTeachingAssignments } from '@/features/subjects/hooks/useSubjects'
import { cn } from '@/lib/utils'
import type { Exam } from '../types/exams.types'
import type { SectionCardData } from '@/components/shared/selection/types'

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  SCHEDULED: { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  ONGOING:   { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  COMPLETED: { bg: 'bg-white/5',        text: 'text-[var(--text-muted)]' },
  CANCELLED: { bg: 'bg-red-500/15',     text: 'text-red-400' },
}

export function TeacherResultsPage() {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedSectionName, setSelectedSectionName] = useState<string | null>(null)
  const [tab, setTab] = useState<'scheduled' | 'classtest'>('scheduled')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [classTestOpen, setClassTestOpen] = useState(false)

  const { data: assignments = [] } = useMyTeachingAssignments()
  const subjectsInSection = assignments.filter(a => a.sectionId === selectedSectionId)

  const { data: exams = [], isLoading: examsLoading } = useExams(
    {
      sectionId: selectedSectionId ?? undefined,
      subjectId: selectedSubjectId ?? undefined,
      isClassTest: tab === 'classtest',
    },
    !!selectedSectionId && !!selectedSubjectId
  )

  const handleSectionSelect = (section: SectionCardData) => {
    setSelectedSectionId(section.id)
    setSelectedSectionName(section.name)
    setSelectedSubjectId(null)
    setSelectedExam(null)
  }

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId === selectedSubjectId ? null : subjectId)
    setSelectedExam(null)
  }

  const handleTabChange = (t: 'scheduled' | 'classtest') => {
    setTab(t)
    setSelectedExam(null)
  }

  const handleBack = () => {
    if (selectedExam) { setSelectedExam(null); return }
    if (selectedSubjectId) { setSelectedSubjectId(null); return }
    if (selectedSectionId) { setSelectedSectionId(null); setSelectedSectionName(null) }
  }

  // ── Result entry: dedicated full-screen view ──────────────────────────────
  if (selectedExam) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSelectedExam(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface)] transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base text-[var(--text)] truncate">Enter Results</h1>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {selectedExam.subject?.name} · {selectedExam.examType?.name} · Section {selectedSectionName} · {selectedExam.totalMarks} marks
            </p>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="p-4">
          <ResultEntryTable
            examId={selectedExam.id}
            totalMarks={selectedExam.totalMarks}
            isLoading={false}
          />
        </div>
      </div>
    )
  }

  // ── STEP 1 — Section ──────────────────────────────────────────────────────
  if (!selectedSectionId) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center">
          <h1 className="font-bold text-lg text-[var(--text)]">Enter Results</h1>
        </header>
        <div className="p-4">
          <p className="text-sm text-[var(--text-muted)] mb-4">Select a section to begin</p>
          <SectionSelectorCards
            onSelect={handleSectionSelect}
            selectedId={null}
            emptyDescription="No sections assigned. Contact your administrator."
          />
        </div>
      </div>
    )
  }

  // ── STEP 2+ — Subject + Exam ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface)] transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base text-[var(--text)] truncate">Enter Results</h1>
          <p className="text-xs text-[var(--text-muted)] truncate">
            Section {selectedSectionName}
            {selectedSubjectId && ` · ${subjectsInSection.find(a => a.subjectId === selectedSubjectId)?.subject?.name}`}
          </p>
        </div>
        {tab === 'classtest' && selectedSubjectId && (
          <button
            onClick={() => setClassTestOpen(true)}
            className="shrink-0 w-9 h-9 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] flex items-center justify-center hover:bg-[var(--gold)]/25 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSectionId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 space-y-4"
        >
          {/* Tab pills */}
          <div className="flex gap-2">
            {(['scheduled', 'classtest'] as const).map(t => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={cn(
                  'h-9 px-4 rounded-full text-sm font-medium transition-colors',
                  tab === t
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)]'
                )}
              >
                {t === 'scheduled' ? 'Scheduled' : 'Class Tests'}
              </button>
            ))}
          </div>

          {/* Subject chips */}
          {subjectsInSection.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {subjectsInSection.map(a => (
                <button
                  key={a.subjectId}
                  onClick={() => handleSubjectSelect(a.subjectId)}
                  className={cn(
                    'shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-colors',
                    selectedSubjectId === a.subjectId
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)]'
                  )}
                >
                  {a.subject?.name ?? a.subjectId}
                </button>
              ))}
            </div>
          )}

          {/* Exam list */}
          {selectedSubjectId && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedSubjectId}-${tab}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {examsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
                  ))
                ) : exams.length === 0 ? (
                  <p className="text-center text-sm text-[var(--text-muted)] py-8">
                    {tab === 'classtest' ? 'No class tests yet. Create one with + above.' : 'No exams for this subject.'}
                  </p>
                ) : (
                  exams.map(exam => {
                    const style = STATUS_STYLE[exam.status ?? 'SCHEDULED'] ?? STATUS_STYLE.SCHEDULED
                    const date = new Date(exam.date)
                    return (
                      <button
                        key={exam.id}
                        onClick={() => setSelectedExam(exam)}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl flex overflow-hidden transition-all active:scale-[0.99] hover:border-[var(--primary)]/50"
                      >
                        <div className="w-14 bg-[var(--primary)] flex flex-col items-center justify-center py-3 shrink-0">
                          <span className="text-[10px] font-semibold text-white/70 uppercase">
                            {date.toLocaleDateString('en-PK', { month: 'short' })}
                          </span>
                          <span className="text-xl font-bold text-white leading-tight">
                            {date.toLocaleDateString('en-PK', { day: 'numeric' })}
                          </span>
                        </div>
                        <div className="p-3 flex-1 min-w-0 text-left">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-sm text-[var(--text)] truncate">
                              {exam.examType?.name}
                            </p>
                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0', style.bg, style.text)}>
                              {exam.status}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)]">{exam.totalMarks} marks · tap to enter results</p>
                        </div>
                      </button>
                    )
                  })
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </AnimatePresence>

      <Modal isOpen={classTestOpen} onClose={() => setClassTestOpen(false)} title="Create Class Test" size="md">
        <ClassTestForm
          sectionId={selectedSectionId}
          subjectId={selectedSubjectId!}
          subjectName={subjectsInSection.find(a => a.subjectId === selectedSubjectId)?.subject?.name ?? ''}
          onSuccess={() => setClassTestOpen(false)}
          onCancel={() => setClassTestOpen(false)}
        />
      </Modal>
    </div>
  )
}
