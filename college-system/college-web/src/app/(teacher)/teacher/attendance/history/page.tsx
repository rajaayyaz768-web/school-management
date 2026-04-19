'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { SelectionContainer } from '@/components/shared/selection/SelectionContainer'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AttendanceReportCard } from '@/features/student-attendance/components/AttendanceReportCard'
import { StudentAttendanceTable } from '@/features/student-attendance/components/StudentAttendanceTable'
import {
  useStudentsForAttendance,
  useSectionAttendanceReport,
  useMarkStudentAttendance,
} from '@/features/student-attendance/hooks/useStudentAttendance'
import type {
  AttendanceStatus,
  SingleStudentAttendanceInput,
} from '@/features/student-attendance/types/student-attendance.types'
import type { CampusCardData, SectionCardData, SelectionState } from '@/components/shared/selection/types'

type Step = 'campus' | 'section' | 'subject' | 'marking'

interface SubjectOption {
  id: string
  name: string
  code: string
}

export default function TeacherAttendancePage() {
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
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [pendingAttendances, setPendingAttendances] = useState<Record<string, SingleStudentAttendanceInput>>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const isMarkingReady = !!selection.sectionId && !!selectedSubjectId && !!selectedDate

  const { data: studentList, isLoading: studentsLoading } = useStudentsForAttendance(
    selection.sectionId ?? '',
    selectedSubjectId ?? '',
    selectedDate
  )

  const { data: report, isLoading: reportLoading } = useSectionAttendanceReport(
    selection.sectionId ?? '',
    selectedSubjectId ?? '',
    selectedDate
  )

  const { mutate: submitAttendance, isPending } = useMarkStudentAttendance()

  // Load subjects when a section is selected
  useEffect(() => {
    if (!selection.sectionId) return
    const sectionId = selection.sectionId
    let cancelled = false

    async function load() {
      try {
        setSubjectsLoading(true)
        const res = await axios.get('/subjects/assignments', { params: { section_id: sectionId } })
        if (cancelled) return
        const assignments: { subject: SubjectOption }[] = res.data.data ?? []
        setSubjects(assignments.map((a) => ({ id: a.subject.id, name: a.subject.name, code: a.subject.code })))
      } catch {
        if (!cancelled) setSubjects([])
      } finally {
        if (!cancelled) setSubjectsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [selection.sectionId])

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
    setSubjects([])
    setSelectedSubjectId(null)
    setSelectedSubjectName(null)
    setPendingAttendances({})
    setStep('subject')
  }

  const handleSubjectSelect = (subjectId: string, subjectName: string) => {
    setSelectedSubjectId(subjectId)
    setSelectedSubjectName(subjectName)
    setPendingAttendances({})
    setStep('marking')
  }

  const handleNavigate = (target: 'campus' | 'program' | 'grade' | 'section') => {
    if (target === 'campus') {
      setSelection({
        campusId: null, campusName: null,
        programId: null, programName: null,
        gradeId: null, gradeName: null,
        sectionId: null, sectionName: null,
      })
      setSelectedSubjectId(null)
      setSelectedSubjectName(null)
      setSubjects([])
      setPendingAttendances({})
      setStep('campus')
    } else if (target === 'section') {
      setSelection((prev) => ({ ...prev, sectionId: null, sectionName: null }))
      setSelectedSubjectId(null)
      setSelectedSubjectName(null)
      setSubjects([])
      setPendingAttendances({})
      setStep('section')
    }
  }

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setPendingAttendances((prev) => ({ ...prev, [studentId]: { ...prev[studentId], studentId, status } }))
  }

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setPendingAttendances((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], studentId, status: prev[studentId]?.status ?? 'PRESENT', remarks },
    }))
  }

  const handleConfirmSubmit = () => {
    if (!selection.sectionId || !selectedSubjectId) return
    submitAttendance(
      {
        sectionId: selection.sectionId,
        subjectId: selectedSubjectId,
        date: selectedDate,
        attendances:
          studentList?.map(({ student, attendance }) => ({
            studentId: student.id,
            status: pendingAttendances[student.id]?.status ?? attendance?.status ?? 'PRESENT',
            remarks: pendingAttendances[student.id]?.remarks ?? attendance?.remarks ?? undefined,
          })) ?? [],
      },
      {
        onSuccess: () => {
          setShowConfirmDialog(false)
          setPendingAttendances({})
        },
      }
    )
  }

  const breadcrumbState: Partial<SelectionState> = {
    campusName: selection.campusName,
    sectionName: selection.sectionName,
    ...(selectedSubjectName ? { gradeName: selectedSubjectName } : {}),
  }

  return (
    <SelectionContainer
      title="Student Attendance"
      subtitle="Mark daily attendance for your assigned sections"
      breadcrumbState={step === 'marking' ? breadcrumbState : undefined}
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

      {step === 'subject' && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Select Subject
            </p>
            {subjectsLoading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading subjects…</p>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No subjects assigned to you for this section.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((sub) => (
                  <Button
                    key={sub.id}
                    variant={selectedSubjectId === sub.id ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleSubjectSelect(sub.id, sub.name)}
                  >
                    {sub.name} <span className="ml-1 opacity-60">({sub.code})</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="max-w-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Date
            </p>
            <DatePicker
              value={selectedDate}
              onChange={(v) => { setSelectedDate(v); setPendingAttendances({}) }}
            />
          </div>

          {selectedSubjectId && (
            <Button variant="primary" onClick={() => setStep('marking')}>
              Continue to Marking
            </Button>
          )}
        </div>
      )}

      {step === 'marking' && isMarkingReady && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={() => setStep('subject')}>
              ← Change selection
            </Button>
            <div className="flex items-center gap-3">
              <DatePicker
                value={selectedDate}
                onChange={(v) => { setSelectedDate(v); setPendingAttendances({}) }}
              />
              <Button
                variant="primary"
                onClick={() => setShowConfirmDialog(true)}
                disabled={!studentList?.length || isPending}
                loading={isPending}
              >
                Save Attendance
              </Button>
            </div>
          </div>

          <AttendanceReportCard
            totalStudents={report?.totalStudents ?? 0}
            present={report?.present ?? 0}
            absent={report?.absent ?? 0}
            late={report?.late ?? 0}
            onLeave={report?.onLeave ?? 0}
            isLoading={reportLoading}
          />

          <StudentAttendanceTable
            studentList={studentList ?? []}
            isLoading={studentsLoading}
            pendingAttendances={pendingAttendances}
            onStatusChange={handleStatusChange}
            onRemarksChange={handleRemarksChange}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Student Attendance"
        message="Save attendance for all students in this section for the selected subject and date?"
      />
    </SelectionContainer>
  )
}
