'use client'

import { useState } from 'react'
import axios from '@/lib/axios'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select, Input, Button, ConfirmDialog } from '@/components/ui'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { usePrograms } from '@/features/programs/hooks/usePrograms'
import {
  useStudentsForAttendance,
  useSectionAttendanceReport,
  useMarkStudentAttendance
} from '@/features/student-attendance/hooks/useStudentAttendance'
import { AttendanceStatus, SingleStudentAttendanceInput } from '@/features/student-attendance/types/student-attendance.types'
import { AttendanceReportCard } from '@/features/student-attendance/components/AttendanceReportCard'
import { StudentAttendanceTable } from '@/features/student-attendance/components/StudentAttendanceTable'

export default function StudentAttendancePage() {
  const [selectedCampusId, setSelectedCampusId] = useState<string>('')
  const [selectedProgramId, setSelectedProgramId] = useState<string>('')
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [pendingAttendances, setPendingAttendances] = useState<Record<string, SingleStudentAttendanceInput>>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  const [grades, setGrades] = useState<{ id: string; name: string }[]>([])
  const [sections, setSections] = useState<{ id: string; name: string }[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([])
  
  const [gradesLoading, setGradesLoading] = useState(false)
  const [sectionsLoading, setSectionsLoading] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(false)

  const { data: campuses } = useCampuses()
  const { data: programs } = usePrograms(selectedCampusId)
  
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

  const handleCampusChange = (campusId: string) => {
    setSelectedCampusId(campusId)
    setSelectedProgramId('')
    setSelectedGradeId('')
    setSelectedSectionId('')
    setSelectedSubjectId('')
    setPendingAttendances({})
    setGrades([])
    setSections([])
    setSubjects([])
  }

  const handleProgramChange = async (programId: string) => {
    setSelectedProgramId(programId)
    setSelectedGradeId('')
    setSelectedSectionId('')
    setSelectedSubjectId('')
    setPendingAttendances({})
    setSections([])
    setSubjects([])
    
    if (!programId) { setGrades([]); return }
    setGradesLoading(true)
    try {
      const res = await axios.get('/grades', { params: { program_id: programId } })
      setGrades(res.data.data ?? [])
    } catch { setGrades([]) }
    finally { setGradesLoading(false) }
  }

  const handleGradeChange = async (gradeId: string) => {
    setSelectedGradeId(gradeId)
    setSelectedSectionId('')
    setSelectedSubjectId('')
    setPendingAttendances({})
    setSubjects([])
    if (!gradeId) { setSections([]); return }
    setSectionsLoading(true)
    try {
      const res = await axios.get('/sections', { params: { grade_id: gradeId } })
      setSections(res.data.data ?? [])
    } catch { setSections([]) }
    finally { setSectionsLoading(false) }
  }

  const handleSectionChange = async (sectionId: string) => {
    setSelectedSectionId(sectionId)
    setSelectedSubjectId('')
    setPendingAttendances({})
    if (!sectionId) { setSubjects([]); return }
    setSubjectsLoading(true)
    try {
      const res = await axios.get('/subjects/assignments', { params: { section_id: sectionId } })
      const assignments = res.data.data ?? []
      setSubjects(assignments.map((a: any) => ({
        id: a.subject.id,
        name: a.subject.name,
        code: a.subject.code,
      })))
    } catch (err) {
      console.error('[StudentAttendance] Failed to load subjects for section:', sectionId, err)
      setSubjects([])
    }
    finally { setSubjectsLoading(false) }
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Student Attendance"
        breadcrumb={[
          { label: 'Home', href: '/admin' },
          { label: 'Attendance', href: '/admin/attendance' },
          { label: 'Students' }
        ]}
      />
      <div>
        <p className="text-gray-500 mb-6">Mark daily student attendance for subjects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 align-top items-end mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Campus</label>
          <Select
            value={selectedCampusId ?? ''}
            onChange={(e) => handleCampusChange(e.target.value)}
            options={campuses?.map((c: any) => ({ value: c.id, label: c.name })) || []}
            placeholder="Select Campus..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Program</label>
          <Select
            value={selectedProgramId ?? ''}
            onChange={(e) => handleProgramChange(e.target.value)}
            disabled={!selectedCampusId}
            options={programs?.map((p: any) => ({ value: p.id, label: p.name })) || []}
            placeholder="Select Program..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Grade</label>
          <Select
            value={selectedGradeId ?? ''}
            onChange={(e) => handleGradeChange(e.target.value)}
            disabled={!selectedProgramId || gradesLoading}
            options={grades.map((g: any) => ({ value: g.id, label: g.name }))}
            placeholder="Select Grade..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Section</label>
          <Select
            value={selectedSectionId ?? ''}
            onChange={(e) => handleSectionChange(e.target.value)}
            disabled={!selectedGradeId || sectionsLoading}
            options={sections.map((s: any) => ({ value: s.id, label: s.name }))}
            placeholder="Select Section..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <Select
            value={selectedSubjectId ?? ''}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={!selectedSectionId || subjectsLoading}
            options={subjects.map((s: any) => ({ value: s.id, label: s.name }))}
            placeholder="Select Subject..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            type="date"
            value={selectedDate ?? ''}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              setPendingAttendances({})
            }}
          />
        </div>
      </div>

      <div className="flex justify-end mt-2 mb-2">
        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={!selectedSectionId || !selectedSubjectId || isPending}
          loading={isPending}
          variant="primary"
        >
          Save Attendance
        </Button>
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

          <div className="mt-4">
            <StudentAttendanceTable
              studentList={studentList || []}
              isLoading={studentsLoading}
              pendingAttendances={pendingAttendances}
              onStatusChange={handleStatusChange}
              onRemarksChange={handleRemarksChange}
            />
          </div>
        </>
      )}

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
