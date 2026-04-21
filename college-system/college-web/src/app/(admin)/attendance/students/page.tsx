'use client'

import { useState } from 'react'
import axios from '@/lib/axios'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input, Button, ConfirmDialog } from '@/components/ui'
import { Badge } from '@/components/ui/Badge'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import {
  useStudentsForAttendance,
  useSectionAttendanceReport,
  useMarkStudentAttendance
} from '@/features/student-attendance/hooks/useStudentAttendance'
import { AttendanceStatus, SingleStudentAttendanceInput } from '@/features/student-attendance/types/student-attendance.types'
import { AttendanceReportCard } from '@/features/student-attendance/components/AttendanceReportCard'
import { StudentAttendanceTable } from '@/features/student-attendance/components/StudentAttendanceTable'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { cn } from '@/lib/utils'
import type { SectionCardData } from '@/components/shared/selection/types'

type Step = 'section' | 'attendance'

export default function StudentAttendancePage() {
  const [step, setStep] = useState<Step>('section')
  const [selectedSection, setSelectedSection] = useState<SectionCardData | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [pendingAttendances, setPendingAttendances] = useState<Record<string, SingleStudentAttendanceInput>>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)

  const { data: campuses } = useCampuses()
  const campusId = campuses?.[0]?.id ?? ''
  const selectedSectionId = selectedSection?.id ?? ''

  const isQueryEnabled = !!selectedSectionId && !!selectedSubjectId && !!selectedDate

  const { data: studentList, isLoading: studentsLoading } = useStudentsForAttendance(
    selectedSectionId,
    selectedSubjectId,
    selectedDate
  )

  const { data: report, isLoading: reportLoading } = useSectionAttendanceReport(
    selectedSectionId,
    selectedSubjectId,
    selectedDate
  )

  const { mutate: submitAttendance, isPending } = useMarkStudentAttendance()

  const handleSectionSelect = async (section: SectionCardData) => {
    setSelectedSection(section)
    setSelectedSubjectId('')
    setPendingAttendances({})
    setSubjectsLoading(true)
    try {
      const res = await axios.get('/subjects/assignments', { params: { section_id: section.id } })
      const assignments = res.data.data ?? []
      setSubjects(assignments.map((a: any) => ({
        id: a.subject.id,
        name: a.subject.name,
        code: a.subject.code,
      })))
    } catch {
      setSubjects([])
    } finally {
      setSubjectsLoading(false)
    }
    setStep('attendance')
  }

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setPendingAttendances(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], studentId, status }
    }))
  }

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setPendingAttendances(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status: prev[studentId]?.status ?? 'PRESENT',
        remarks
      }
    }))
  }

  const handleConfirmSubmit = () => {
    submitAttendance(
      {
        sectionId: selectedSectionId,
        subjectId: selectedSubjectId,
        date: selectedDate,
        attendances: studentList?.map(({ student, attendance }) => ({
          studentId: student.id,
          status: pendingAttendances[student.id]?.status ?? attendance?.status ?? 'PRESENT',
          remarks: pendingAttendances[student.id]?.remarks ?? attendance?.remarks ?? undefined,
        })) ?? []
      },
      {
        onSuccess: () => {
          setShowConfirmDialog(false)
          setPendingAttendances({})
        }
      }
    )
  }

  const breadcrumb = [
    { label: 'Home', href: '/admin' },
    { label: 'Attendance', href: '/admin/attendance' },
    { label: 'Students' }
  ]

  if (step === 'section') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Student Attendance" breadcrumb={breadcrumb} />
        <p className="text-[var(--text-muted)]">Select a section to mark attendance</p>
        {campusId && (
          <SectionSelectorCards
            campusId={campusId}
            onSelect={handleSectionSelect}
            selectedId={selectedSection?.id}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Student Attendance" breadcrumb={breadcrumb} />

      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStep('section')
            setSelectedSection(null)
            setSelectedSubjectId('')
            setPendingAttendances({})
          }}
        >
          ← Change Section
        </Button>
        {selectedSection && <Badge variant="info">{selectedSection.name}</Badge>}
        {selectedSection?.programCode && (
          <span className="text-sm text-[var(--text-muted)]">{selectedSection.programCode}</span>
        )}
        {selectedSection?.gradeName && (
          <span className="text-sm text-[var(--text-muted)]">· {selectedSection.gradeName}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {subjectsLoading ? (
            <span className="text-sm text-[var(--text-muted)]">Loading subjects…</span>
          ) : subjects.length === 0 ? (
            <span className="text-sm text-[var(--text-muted)]">No subjects assigned to this section</span>
          ) : (
            subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedSubjectId(s.id); setPendingAttendances({}) }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                  selectedSubjectId === s.id
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--primary)]'
                )}
              >
                {s.name}
              </button>
            ))
          )}
        </div>
        <div className="ml-auto">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              setPendingAttendances({})
            }}
          />
        </div>
      </div>

      {isQueryEnabled && (
        <>
          <AttendanceReportCard
            totalStudents={report?.totalStudents ?? 0}
            present={report?.present ?? 0}
            absent={report?.absent ?? 0}
            late={report?.late ?? 0}
            onLeave={report?.onLeave ?? 0}
            isLoading={reportLoading}
          />
          <StudentAttendanceTable
            studentList={studentList || []}
            isLoading={studentsLoading}
            pendingAttendances={pendingAttendances}
            onStatusChange={handleStatusChange}
            onRemarksChange={handleRemarksChange}
          />
        </>
      )}

      <div className="flex justify-end mt-2">
        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={!selectedSectionId || !selectedSubjectId || isPending}
          loading={isPending}
          variant="primary"
        >
          Save Attendance
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Student Attendance"
        message="Save attendance for all students in this section for the selected subject and date?"
      />
    </div>
  )
}
