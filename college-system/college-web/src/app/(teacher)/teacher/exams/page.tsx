'use client'

import { useState } from 'react'
import { SelectionContainer } from '@/components/shared/selection/SelectionContainer'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ExamTable } from '@/features/exams/components/ExamTable'
import { useExams, useExamTypes } from '@/features/exams/hooks/useExams'
import type { CampusCardData, SectionCardData, SelectionState } from '@/components/shared/selection/types'

type Step = 'campus' | 'section' | 'exams'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function TeacherExamsPage() {
  const [step, setStep] = useState<Step>('campus')
  const [selection, setSelection] = useState<SelectionState>({
    campusId: null,
    campusName: null,
    programId: null,
    programName: null,
    gradeId: null,
    gradeName: null,
    sectionId: null,
    sectionName: null,
  })
  const [filterExamTypeId, setFilterExamTypeId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const { data: examTypes } = useExamTypes()
  const { data: exams, isLoading: examsLoading } = useExams({
    sectionId: selection.sectionId ?? undefined,
    examTypeId: filterExamTypeId || undefined,
    status: filterStatus || undefined,
  })

  const handleCampusSelect = (campus: CampusCardData) => {
    setSelection((prev) => ({ ...prev, campusId: campus.id, campusName: campus.name }))
    setStep('section')
  }

  const handleSectionSelect = (section: SectionCardData) => {
    setSelection((prev) => ({
      ...prev,
      sectionId: section.id,
      sectionName: section.name,
      programName: section.programName,
      gradeName: section.gradeName,
    }))
    setFilterExamTypeId('')
    setFilterStatus('')
    setStep('exams')
  }

  const handleNavigate = (target: 'campus' | 'program' | 'grade' | 'section') => {
    if (target === 'campus') {
      setSelection({ campusId: null, campusName: null, programId: null, programName: null, gradeId: null, gradeName: null, sectionId: null, sectionName: null })
      setStep('campus')
    } else if (target === 'section') {
      setSelection((prev) => ({ ...prev, sectionId: null, sectionName: null }))
      setStep('section')
    }
  }

  const breadcrumbState: Partial<SelectionState> = {
    campusName: selection.campusName,
    sectionName: selection.sectionName,
  }

  return (
    <SelectionContainer
      title="Exam Schedule"
      subtitle="View exams for your assigned sections"
      breadcrumbState={step === 'exams' ? breadcrumbState : undefined}
      onBreadcrumbNavigate={handleNavigate}
    >
      {step === 'campus' && (
        <CampusSelectorCards onSelect={handleCampusSelect} selectedId={selection.campusId} />
      )}

      {step === 'section' && selection.campusId && (
        <SectionSelectorCards
          campusId={selection.campusId}
          onSelect={handleSectionSelect}
          selectedId={selection.sectionId}
        />
      )}

      {step === 'exams' && selection.sectionId && (
        <div className="space-y-4">
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
            {(filterExamTypeId || filterStatus) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFilterExamTypeId(''); setFilterStatus('') }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <ExamTable
            exams={exams ?? []}
            isLoading={examsLoading}
            onEdit={() => {}}
            onDelete={() => {}}
            onEnterResults={() => {}}
          />
        </div>
      )}
    </SelectionContainer>
  )
}
