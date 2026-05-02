'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SelectionContainer } from '@/components/shared/selection/SelectionContainer'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { ExamTable } from '@/features/exams/components/ExamTable'
import { useExams, useExamTypes } from '@/features/exams/hooks/useExams'
import { useMyTeachingAssignments } from '@/features/subjects/hooks/useSubjects'
import type { SectionCardData } from '@/components/shared/selection/types'

type Step = 'section' | 'exams'

const chipBase = 'px-3 py-1 rounded-full text-xs font-medium border transition-colors'
const chipActive = 'bg-[var(--primary)] text-white border-[var(--primary)]'
const chipInactive = 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function TeacherExamsPage() {
  const [step, setStep] = useState<Step>('section')
  const [sectionId, setSectionId] = useState<string | null>(null)
  const [sectionName, setSectionName] = useState<string | null>(null)
  const [filterSubjectId, setFilterSubjectId] = useState('')
  const [filterExamTypeId, setFilterExamTypeId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const { data: assignments = [] } = useMyTeachingAssignments()
  const { data: examTypes } = useExamTypes()

  // Subjects this teacher teaches in the selected section
  const subjectsInSection = assignments.filter((a) => a.sectionId === sectionId)

  const { data: exams = [], isLoading: examsLoading } = useExams(
    {
      sectionId: sectionId ?? undefined,
      subjectId: filterSubjectId || undefined,
      examTypeId: filterExamTypeId || undefined,
      status: filterStatus || undefined,
    },
    !!sectionId
  )

  const handleSectionSelect = (section: SectionCardData) => {
    setSectionId(section.id)
    setSectionName(section.name)
    setFilterSubjectId('')
    setFilterExamTypeId('')
    setFilterStatus('')
    setStep('exams')
  }

  const handleBack = () => {
    setSectionId(null)
    setSectionName(null)
    setFilterSubjectId('')
    setFilterExamTypeId('')
    setFilterStatus('')
    setStep('section')
  }

  const hasFilters = !!(filterSubjectId || filterExamTypeId || filterStatus)

  return (
    <SelectionContainer
      title="Exam Schedule"
      subtitle={step === 'section' ? 'Select a section to view its exams' : (sectionName ?? '')}
      breadcrumbState={step === 'exams' ? { sectionName } : undefined}
      onBreadcrumbNavigate={(target) => { if (target === 'section') handleBack() }}
    >
      {step === 'section' && (
        <SectionSelectorCards
          onSelect={handleSectionSelect}
          selectedId={sectionId}
          emptyDescription="You have no sections assigned yet. Contact your administrator."
        />
      )}

      {step === 'exams' && sectionId && (
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack}>← Sections</Button>
              <Badge variant="info">{sectionName}</Badge>
            </div>

            {/* Subject filter chips — only teacher's subjects for this section */}
            {subjectsInSection.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Subject
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterSubjectId('')}
                    className={`${chipBase} ${!filterSubjectId ? chipActive : chipInactive}`}
                  >
                    All
                  </button>
                  {subjectsInSection.map((a) => (
                    <button
                      key={a.subjectId}
                      onClick={() => setFilterSubjectId(filterSubjectId === a.subjectId ? '' : a.subjectId)}
                      className={`${chipBase} ${filterSubjectId === a.subjectId ? chipActive : chipInactive}`}
                    >
                      {a.subject?.name ?? a.subjectId}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Exam type + status filters */}
            <div className="flex flex-wrap items-end gap-4">
              <Select
                label="Exam Type"
                value={filterExamTypeId}
                onChange={(e) => setFilterExamTypeId(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  ...(examTypes ?? []).map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
              <Select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={STATUS_OPTIONS}
              />
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilterSubjectId(''); setFilterExamTypeId(''); setFilterStatus('') }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <ExamTable
              exams={exams}
              isLoading={examsLoading}
              onEdit={() => {}}
              onDelete={() => {}}
              onEnterResults={() => {}}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </SelectionContainer>
  )
}
