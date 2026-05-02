'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { ResultEntryTable } from './ResultEntryTable'
import { ClassTestForm } from './ClassTestForm'
import { useExams } from '../hooks/useExams'
import { useMyTeachingAssignments } from '@/features/subjects/hooks/useSubjects'
import type { Exam } from '../types/exams.types'
import type { SectionCardData } from '@/components/shared/selection/types'

const chipBase = 'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer'
const chipActive = 'bg-[var(--primary)] text-white border-[var(--primary)]'
const chipInactive = 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--text)]'

function statusBadge(status: string) {
  if (status === 'SCHEDULED') return <Badge variant="info" size="sm">Upcoming</Badge>
  if (status === 'ONGOING') return <Badge variant="warning" size="sm">Ongoing</Badge>
  if (status === 'COMPLETED') return <Badge variant="success" size="sm">Completed</Badge>
  return <Badge variant="neutral" size="sm">{status}</Badge>
}

export function TeacherResultsPage() {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedSectionName, setSelectedSectionName] = useState<string | null>(null)
  const [tab, setTab] = useState<'scheduled' | 'classtest'>('scheduled')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [classTestOpen, setClassTestOpen] = useState(false)

  const { data: assignments = [] } = useMyTeachingAssignments()

  // Subjects the teacher teaches in the selected section
  const subjectsInSection = assignments.filter((a) => a.sectionId === selectedSectionId)

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

  const handleExamSelect = (exam: Exam) => {
    setSelectedExam(exam === selectedExam ? null : exam)
  }

  const handleTabChange = (t: 'scheduled' | 'classtest') => {
    setTab(t)
    setSelectedExam(null)
  }

  const handleBack = () => {
    if (selectedExam) { setSelectedExam(null); return }
    if (selectedSubjectId) { setSelectedSubjectId(null); return }
    if (selectedSectionId) { setSelectedSectionId(null); setSelectedSectionName(null); }
  }

  // Step 1 — Section
  if (!selectedSectionId) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader title="Exams & Results" subtitle="Select a section to begin" />
        <SectionSelectorCards
          onSelect={handleSectionSelect}
          selectedId={null}
          emptyDescription="You have no sections assigned yet. Contact your administrator."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader
        title="Exams & Results"
        subtitle={selectedSectionName ?? ''}
        actions={
          <Button variant="ghost" size="sm" onClick={handleBack}>← Back</Button>
        }
      />

      {/* Breadcrumb chips */}
      <div className="flex flex-wrap items-center gap-2 -mt-4">
        <button onClick={() => { setSelectedSectionId(null); setSelectedSectionName(null); setSelectedSubjectId(null); setSelectedExam(null) }}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
          Sections
        </button>
        <span className="text-[var(--text-muted)] text-xs">›</span>
        <Badge variant="info">{selectedSectionName}</Badge>
        {selectedSubjectId && (
          <>
            <span className="text-[var(--text-muted)] text-xs">›</span>
            <Badge variant="neutral">
              {subjectsInSection.find((a) => a.subjectId === selectedSubjectId)?.subject?.name ?? ''}
            </Badge>
          </>
        )}
        {selectedExam && (
          <>
            <span className="text-[var(--text-muted)] text-xs">›</span>
            <Badge variant="success">{selectedExam.examType?.name}</Badge>
          </>
        )}
      </div>

      {/* Tab chips */}
      <div className="flex gap-2">
        <button onClick={() => handleTabChange('scheduled')}
          className={`${chipBase} ${tab === 'scheduled' ? chipActive : chipInactive}`}>
          Scheduled Exams
        </button>
        <button onClick={() => handleTabChange('classtest')}
          className={`${chipBase} ${tab === 'classtest' ? chipActive : chipInactive}`}>
          Class Tests
        </button>
      </div>

      {/* Subject chips */}
      {subjectsInSection.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Subject
          </p>
          <div className="flex flex-wrap gap-2">
            {subjectsInSection.map((a) => (
              <button
                key={a.subjectId}
                onClick={() => handleSubjectSelect(a.subjectId)}
                className={`${chipBase} ${selectedSubjectId === a.subjectId ? chipActive : chipInactive}`}
              >
                {a.subject?.name ?? a.subjectId}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exam list */}
      {selectedSubjectId && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedSubjectId}-${tab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {tab === 'classtest' ? 'Class Tests' : 'Exams'}
              </p>
              {tab === 'classtest' && (
                <Button size="sm" variant="gold" onClick={() => setClassTestOpen(true)}>
                  + New Class Test
                </Button>
              )}
            </div>

            {examsLoading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading…</p>
            ) : exams.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                {tab === 'classtest' ? 'No class tests yet. Create one above.' : 'No exams scheduled for this subject.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {exams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => handleExamSelect(exam)}
                    className={`text-left rounded-[var(--radius-card)] border p-4 transition-all ${
                      selectedExam?.id === exam.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-sm text-[var(--text)]">{exam.examType?.name}</p>
                      {statusBadge(exam.status)}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(exam.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Total: {exam.totalMarks} marks</p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Result entry */}
      {selectedExam && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-[var(--border)] pt-6"
        >
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 mb-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wide">Subject</span>
                <p className="font-medium mt-0.5">{selectedExam.subject?.name} <span className="text-[var(--text-muted)]">({selectedExam.subject?.code})</span></p>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wide">Exam Type</span>
                <p className="font-medium mt-0.5">{selectedExam.examType?.name}</p>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wide">Date</span>
                <p className="font-medium mt-0.5">
                  {new Date(selectedExam.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wide">Total Marks</span>
                <p className="font-medium mt-0.5">{selectedExam.totalMarks}</p>
              </div>
            </div>
          </div>
          <ResultEntryTable examId={selectedExam.id} totalMarks={selectedExam.totalMarks} isLoading={false} />
        </motion.div>
      )}

      {/* Class test creation modal */}
      <Modal isOpen={classTestOpen} onClose={() => setClassTestOpen(false)} title="Create Class Test" size="md">
        <ClassTestForm
          sectionId={selectedSectionId}
          subjectId={selectedSubjectId!}
          subjectName={subjectsInSection.find((a) => a.subjectId === selectedSubjectId)?.subject?.name ?? ''}
          onSuccess={() => setClassTestOpen(false)}
          onCancel={() => setClassTestOpen(false)}
        />
      </Modal>
    </div>
  )
}
