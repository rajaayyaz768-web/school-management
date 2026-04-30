'use client';

import { useState, useEffect, useMemo } from 'react';

import { useCampusStore } from '@/store/campusStore';
import { useRole } from '@/store/authStore';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { useProgramGrades } from '@/features/sections/hooks/useSections';
import { useAssignmentData, useAutoAssign, useConfirmAssignment } from '@/features/section-assignment/hooks/useSectionAssignment';

import {
  ManualAssignment,
  AssignmentPreview,
  AssignmentResult,
} from '@/features/section-assignment/types/section-assignment.types';

import { StudentRankingList } from '@/features/section-assignment/components/StudentRankingList';
import { SectionCapacityPanel } from '@/features/section-assignment/components/SectionCapacityPanel';
import { AssignmentPreviewTable } from '@/features/section-assignment/components/AssignmentPreviewTable';
import { ProgramSelectorCards } from '@/components/shared/selection/ProgramSelectorCards';

import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  StatCard,
  ConfirmDialog,
  Modal,
  Table,
  Badge,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ProgramCardData } from '@/components/shared/selection/types';

type Step = 'program' | 'grade' | 'assign'

export default function SectionAssignmentPage() {
  const [step, setStep] = useState<Step>('program')
  const [selectedProgram, setSelectedProgram] = useState<ProgramCardData | null>(null)
  const [selectedGradeId, setSelectedGradeId] = useState('')
  const [selectedGradeName, setSelectedGradeName] = useState('')

  const role = useRole()
  const { activeCampusId } = useCampusStore()
  const { data: campuses = [] } = useCampuses()
  const campusId = role === 'SUPER_ADMIN'
    ? (activeCampusId ?? campuses[0]?.id ?? '')
    : (campuses[0]?.id ?? '')

  const { data: grades = [], isLoading: gradesLoading } = useProgramGrades(selectedProgram?.id)

  // Assignment Stateful Contexts
  const [sectionCapacities, setSectionCapacities] = useState<{ sectionId: string; capacity: number }[]>([])
  const [manualAssignments, setManualAssignments] = useState<ManualAssignment[]>([])
  const [previewData, setPreviewData] = useState<AssignmentPreview[]>([])

  // Results State
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const { data: assignmentData, isLoading: isDataLoading, isFetching: isDataFetching } = useAssignmentData(selectedGradeId)
  const autoAssignMutation = useAutoAssign()
  const confirmMutation = useConfirmAssignment()

  useEffect(() => {
    if (assignmentData?.sections) {
      setSectionCapacities(
        assignmentData.sections.map((s: any) => ({ sectionId: s.id, capacity: s.capacity }))
      )
      setManualAssignments([])
      setPreviewData([])
    }
  }, [assignmentData])

  const handleCapacityChange = (sectionId: string, capacity: number) => {
    setSectionCapacities((prev) =>
      prev.map((c) => (c.sectionId === sectionId ? { ...c, capacity } : c))
    )
  }

  const handleManualAssign = (studentId: string, sectionId: string) => {
    setManualAssignments((prev) => {
      if (!sectionId) return prev.filter((a) => a.studentId !== studentId)
      const filtered = prev.filter((a) => a.studentId !== studentId)
      return [...filtered, { studentId, sectionId }]
    })
  }

  const handleRemoveFromPreview = (studentId: string) => {
    setManualAssignments((prev) => prev.filter((a) => a.studentId !== studentId))
  }

  const handleClearAssignments = () => {
    setManualAssignments([])
    setPreviewData([])
  }

  const handleAutoAssign = () => {
    if (!selectedGradeId) return
    autoAssignMutation.mutate(
      { gradeId: selectedGradeId, sectionCapacities },
      { onSuccess: (data: any) => setPreviewData(data) }
    )
  }

  const combinedPreview = useMemo(() => {
    if (!assignmentData) return []

    const structuredRecord: Record<string, AssignmentPreview> = {}
    assignmentData.sections.forEach((s: any) => {
      structuredRecord[s.id] = { sectionId: s.id, sectionName: s.name, students: [] }
    })

    if (previewData.length > 0) {
      previewData.forEach((sectionGroup) => {
        sectionGroup.students.forEach((st) => {
          if (!manualAssignments.find((ma) => ma.studentId === st.id)) {
            if (structuredRecord[sectionGroup.sectionId]) {
              structuredRecord[sectionGroup.sectionId].students.push(st)
            }
          }
        })
      })
    }

    manualAssignments.forEach((ma) => {
      const student = assignmentData.unassignedStudents.find((s: any) => s.id === ma.studentId)
      if (student && structuredRecord[ma.sectionId]) {
        structuredRecord[ma.sectionId].students.push(student)
      }
    })

    return Object.values(structuredRecord).filter((group) => group.students.length > 0)
  }, [assignmentData, previewData, manualAssignments])

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const handleConfirmExecute = () => {
    if (!selectedGradeId) return

    const assignments: ManualAssignment[] = []
    combinedPreview.forEach((group) => {
      group.students.forEach((student) => {
        assignments.push({ studentId: student.id, sectionId: group.sectionId })
      })
    })

    if (assignments.length === 0) return

    confirmMutation.mutate(
      { gradeId: selectedGradeId, assignments },
      {
        onSuccess: (result: any) => {
          setAssignmentResult(result)
          setShowResultModal(true)
          setIsConfirmDialogOpen(false)
          handleClearAssignments()
        }
      }
    )
  }

  const totalUnassigned = assignmentData?.unassignedStudents.length || 0
  const totalAvailableSections = assignmentData?.sections.length || 0
  const totalRawCapacity = sectionCapacities.reduce((sum, item) => sum + item.capacity, 0)
  const previewAssignedCount = combinedPreview.reduce((sum, g) => sum + g.students.length, 0)

  const resultColumns = [
    { key: 'studentName', header: 'Student', render: (row: any) => (<span className="font-medium text-sm text-[var(--text)]">{row.studentName}</span>) },
    { key: 'sectionName', header: 'Section', render: (row: any) => (<Badge variant="info">{row.sectionName}</Badge>) },
    { key: 'rollNumber', header: 'Official Roll No', render: (row: any) => (<span className="font-mono text-sm">{row.rollNumber}</span>) },
  ]

  const breadcrumb = [
    { label: 'Home', href: '/' },
    { label: 'Configurations' },
    { label: 'Section Assignments' },
  ]

  if (step === 'program') {
    return (
      <div className="space-y-6">
        <PageHeader title="Section Assignment Tool" breadcrumb={breadcrumb} />
        <p className="text-[var(--text-muted)]">Select a program to begin</p>
        {campusId && (
          <ProgramSelectorCards
            campusId={campusId}
            onSelect={(program) => {
              setSelectedProgram(program)
              setSelectedGradeId('')
              setSelectedGradeName('')
              setStep('grade')
            }}
            selectedId={selectedProgram?.id}
          />
        )}
      </div>
    )
  }

  if (step === 'grade') {
    return (
      <div className="space-y-6">
        <PageHeader title="Section Assignment Tool" breadcrumb={breadcrumb} />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setStep('program')}>← Back</Button>
          {selectedProgram && <Badge variant="info">{selectedProgram.name}</Badge>}
        </div>
        <p className="text-[var(--text-muted)]">Select a grade / year to assign students</p>
        {gradesLoading ? (
          <p className="text-sm text-[var(--text-muted)]">Loading grades…</p>
        ) : grades.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No grades found for this program.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {grades.map((g: any) => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGradeId(g.id)
                  setSelectedGradeName(g.name)
                  setStep('assign')
                }}
                className={cn(
                  'px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                  'bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)]',
                  selectedGradeId === g.id
                    ? 'border-[var(--primary)] bg-[var(--surface-hover)]'
                    : 'border-[var(--border)]'
                )}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Section Assignment Tool" breadcrumb={breadcrumb} />

      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => { setStep('grade'); setSelectedGradeId(''); handleClearAssignments() }}>
          ← Change Grade
        </Button>
        {selectedProgram && <Badge variant="neutral">{selectedProgram.name}</Badge>}
        {selectedGradeName && <Badge variant="info">{selectedGradeName}</Badge>}
      </div>

      {assignmentData && !isDataFetching && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total Unassigned Students" value={totalUnassigned.toString()} variant="default" />
            <StatCard title="Total Sections" value={totalAvailableSections.toString()} variant="default" />
            <StatCard title="Total Capacity Configuration" value={totalRawCapacity.toString()} variant="default" />
          </div>

          <div className="flex justify-between items-center py-4">
            <h3 className="text-xl font-bold text-[var(--text)]">Configure and Assign</h3>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleClearAssignments}
                disabled={manualAssignments.length === 0 && previewData.length === 0}
              >
                Clear
              </Button>
              <Button
                variant="primary"
                onClick={handleAutoAssign}
                loading={autoAssignMutation.isPending}
                disabled={totalUnassigned === 0}
              >
                Auto Assign Preview
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 border-b border-[var(--border)]">
            <div className="lg:col-span-8 h-[600px]">
              <StudentRankingList
                students={assignmentData.unassignedStudents}
                isLoading={isDataLoading}
                sections={assignmentData.sections}
                selectedAssignments={manualAssignments}
                onManualAssign={handleManualAssign}
              />
            </div>
            <div className="lg:col-span-4 max-h-[600px] overflow-y-auto pr-2">
              <SectionCapacityPanel
                sections={assignmentData.sections}
                sectionCapacities={sectionCapacities}
                onCapacityChange={handleCapacityChange}
                previewData={combinedPreview}
              />
            </div>
          </div>

          {combinedPreview.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[var(--text)]">Review and Execute</h3>
                <Button
                  variant="primary"
                  onClick={() => setIsConfirmDialogOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white! border-amber-600"
                  size="lg"
                >
                  Confirm {previewAssignedCount} Assignments
                </Button>
              </div>
              <AssignmentPreviewTable
                preview={combinedPreview}
                onRemoveStudent={handleRemoveFromPreview}
              />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Confirm Section Assignment"
        message={`This will assign ${previewAssignedCount} students to their respective sections and generate their official Roll Numbers. This action cannot be undone. Continue?`}
        confirmText="Confirm Assignments"
        onConfirm={handleConfirmExecute}
        onClose={() => setIsConfirmDialogOpen(false)}
        variant="warning"
      />

      <Modal
        isOpen={showResultModal}
        title="Assignment Execution Complete"
        onClose={() => setShowResultModal(false)}
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center bg-[var(--surface-container-low)] p-6 rounded-xl border border-[var(--border)]">
            <p className="text-sm font-semibold uppercase text-[var(--success)] tracking-wider">Total Assignments Executed</p>
            <p className="text-5xl font-black text-[var(--text)] mt-2">{assignmentResult?.totalAssigned || 0}</p>
          </div>

          {assignmentResult?.skipped && assignmentResult.skipped.length > 0 && (
            <div className="bg-[var(--danger-tint)] border border-[var(--danger)] text-[var(--danger)] p-4 rounded-lg text-sm">
              <strong>Attention:</strong> {assignmentResult.skipped.length} records were skipped (already ACTIVE or missing).
            </div>
          )}

          <div>
            <h4 className="font-semibold text-sm text-[var(--text-muted)] mb-3">Allocated Roll Numbers Overview</h4>
            <div className="max-h-80 overflow-y-auto rounded-lg border border-[var(--border)]">
              <Table columns={resultColumns} data={assignmentResult?.assignments || []} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--border)]">
            <Button variant="primary" onClick={() => setShowResultModal(false)}>
              Acknowledge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
