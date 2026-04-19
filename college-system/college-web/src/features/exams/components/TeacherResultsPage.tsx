'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { ExamSelectorCards } from './ExamSelectorCards'
import { ResultEntryTable } from './ResultEntryTable'
import { useExams } from '../hooks/useExams'
import type { Exam } from '../types/exams.types'
import type { CampusCardData, SectionCardData } from '@/components/shared/selection/types'
import { ClipboardList } from 'lucide-react'

type Step = 'campus' | 'section' | 'exam' | 'results'

const RESULT_STATUSES = ['SCHEDULED', 'ONGOING', 'COMPLETED'] as const

export function TeacherResultsPage() {
  const [step, setStep] = useState<Step>('campus')
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null)
  const [selectedCampusName, setSelectedCampusName] = useState<string | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedSectionName, setSelectedSectionName] = useState<string | null>(null)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)

  const { data: exams, isLoading: examsLoading } = useExams({
    sectionId: selectedSectionId ?? undefined,
  })

  const resultExams = (exams ?? []).filter((e) =>
    (RESULT_STATUSES as readonly string[]).includes(e.status)
  )

  const handleCampusSelect = (campus: CampusCardData) => {
    setSelectedCampusId(campus.id)
    setSelectedCampusName(campus.name)
    setSelectedSectionId(null)
    setSelectedSectionName(null)
    setSelectedExam(null)
    setStep('section')
  }

  const handleSectionSelect = (section: SectionCardData) => {
    setSelectedSectionId(section.id)
    setSelectedSectionName(section.name)
    setSelectedExam(null)
    setStep('exam')
  }

  const handleExamSelect = (exam: Exam) => {
    setSelectedExam(exam)
    setStep('results')
  }

  if (step === 'campus') {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader title="Enter Results" subtitle="Select a campus to begin" />
        <CampusSelectorCards onSelect={handleCampusSelect} selectedId={selectedCampusId} />
      </div>
    )
  }

  if (step === 'section' && selectedCampusId) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader title="Enter Results" subtitle="Select a section" />
        <div className="flex items-center gap-3 -mt-4">
          <Button variant="ghost" size="sm" onClick={() => setStep('campus')}>← Back</Button>
          <Badge variant="info">{selectedCampusName}</Badge>
        </div>
        <SectionSelectorCards
          campusId={selectedCampusId}
          onSelect={handleSectionSelect}
          selectedId={selectedSectionId}
        />
      </div>
    )
  }

  if (step === 'exam' && selectedSectionId) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader title="Enter Results" subtitle="Select an exam to enter results" />
        <div className="flex items-center gap-3 -mt-4">
          <Button variant="ghost" size="sm" onClick={() => setStep('section')}>← Back</Button>
          <Badge variant="info">{selectedCampusName}</Badge>
          <Badge variant="neutral">{selectedSectionName}</Badge>
        </div>
        <ExamSelectorCards
          exams={resultExams}
          selectedId={selectedExam?.id}
          onSelect={handleExamSelect}
          isLoading={examsLoading}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader
        title="Enter Results"
        subtitle="Record student marks for the selected exam"
        actions={
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
        }
      />
      <div className="flex items-center gap-3 -mt-4">
        <Button variant="ghost" size="sm" onClick={() => setStep('exam')}>← Change Exam</Button>
        <Badge variant="info">{selectedCampusName}</Badge>
        <Badge variant="neutral">{selectedSectionName}</Badge>
        {selectedExam && <Badge variant="success">{selectedExam.subject?.name}</Badge>}
      </div>

      {selectedExam && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">Subject</span>
              <p className="font-medium mt-0.5">
                {selectedExam.subject?.name ?? '—'}{' '}
                <span className="text-[var(--text-muted)]">({selectedExam.subject?.code ?? ''})</span>
              </p>
            </div>
            <div>
              <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">Exam Type</span>
              <p className="font-medium mt-0.5">{selectedExam.examType?.name ?? '—'}</p>
            </div>
            <div>
              <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">Date</span>
              <p className="font-medium mt-0.5">
                {selectedExam.date
                  ? new Date(selectedExam.date).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </p>
            </div>
            <div>
              <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">Total Marks</span>
              <p className="font-medium mt-0.5">{selectedExam.totalMarks}</p>
            </div>
          </div>
        </div>
      )}

      {selectedExam && (
        <ResultEntryTable
          examId={selectedExam.id}
          totalMarks={selectedExam.totalMarks}
          isLoading={false}
        />
      )}
    </div>
  )
}
