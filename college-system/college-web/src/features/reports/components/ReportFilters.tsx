'use client'

import { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Button, Select, Input } from '@/components/ui'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { usePrograms } from '@/features/programs/hooks/usePrograms'
import { useProgramGrades, useSections } from '@/features/sections/hooks/useSections'
import { useAssignmentsBySection } from '@/features/subjects/hooks/useSubjects'
import { useExams } from '@/features/exams/hooks/useExams'
import {
  AttendanceReportFilters,
  FeeReportFilters,
  ResultsReportFilters,
} from '../types/reports.types'

const FEE_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'WAIVED', label: 'Waived' },
]

interface Props {
  reportType: 'attendance' | 'fees' | 'results'
  onDownloadExcel: (filters: AttendanceReportFilters | FeeReportFilters | ResultsReportFilters) => void
  onPrint: (filters: AttendanceReportFilters | FeeReportFilters | ResultsReportFilters) => void
  isLoading: boolean
}

export function ReportFilters({ reportType, onDownloadExcel, onPrint, isLoading }: Props) {
  const { data: campuses } = useCampuses()

  // ── Cascade state (shared for attendance + results) ──────────────────────
  const [campusId, setCampusId] = useState('')
  const [programId, setProgramId] = useState('')
  const [gradeId, setGradeId] = useState('')
  const [sectionId, setSectionId] = useState('')

  const { data: programs } = usePrograms(campusId || undefined)
  const { data: grades } = useProgramGrades(programId || undefined)
  const { data: sections } = useSections(gradeId || undefined)

  // ── Attendance-specific ───────────────────────────────────────────────────
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // ── Fee-specific ─────────────────────────────────────────────────────────
  const [academicYear, setAcademicYear] = useState('')
  const [feeStatus, setFeeStatus] = useState('')

  // ── Results-specific ─────────────────────────────────────────────────────
  const [subjectId, setSubjectId] = useState('')
  const [examId, setExamId] = useState('')
  const { data: assignments } = useAssignmentsBySection(sectionId)
  const { data: exams } = useExams({
    sectionId: sectionId || undefined,
    subjectId: subjectId || undefined,
  })

  function getFilters() {
    if (reportType === 'attendance') {
      return {
        campusId: campusId || undefined,
        sectionId: sectionId || undefined,
        startDate,
        endDate,
      } as AttendanceReportFilters
    }
    if (reportType === 'fees') {
      return {
        campusId: campusId || undefined,
        academicYear,
        status: feeStatus || undefined,
      } as FeeReportFilters
    }
    return {
      sectionId,
      subjectId: subjectId || undefined,
      examId: examId || undefined,
    } as ResultsReportFilters
  }

  const campusOptions = [
    { value: '', label: 'All Campuses' },
    ...(campuses ?? []).map((c) => ({ value: c.id, label: c.name })),
  ]

  const programOptions = [
    { value: '', label: 'All Programs' },
    ...(programs ?? []).map((p) => ({ value: p.id, label: p.name })),
  ]

  const gradeOptions = [
    { value: '', label: 'All Grades' },
    ...(grades ?? []).map((g) => ({ value: g.id, label: g.name })),
  ]

  const sectionOptions = [
    { value: '', label: reportType === 'results' ? 'Select Section' : 'All Sections' },
    ...(sections ?? []).map((s) => ({ value: s.id, label: s.name })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">

        {/* ── Attendance filters ── */}
        {reportType === 'attendance' && (
          <>
            <Select
              label="Campus"
              value={campusId}
              onChange={(e) => {
                setCampusId(e.target.value)
                setProgramId('')
                setGradeId('')
                setSectionId('')
              }}
              options={campusOptions}
            />
            <Select
              label="Program"
              value={programId}
              onChange={(e) => {
                setProgramId(e.target.value)
                setGradeId('')
                setSectionId('')
              }}
              options={programOptions}
            />
            <Select
              label="Grade"
              value={gradeId}
              onChange={(e) => {
                setGradeId(e.target.value)
                setSectionId('')
              }}
              options={gradeOptions}
            />
            <Select
              label="Section (optional)"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              options={sectionOptions}
            />
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </>
        )}

        {/* ── Fee filters ── */}
        {reportType === 'fees' && (
          <>
            <Select
              label="Campus"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              options={campusOptions}
            />
            <Input
              label="Academic Year"
              type="text"
              placeholder="e.g. 2024-2025"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
            <Select
              label="Status"
              value={feeStatus}
              onChange={(e) => setFeeStatus(e.target.value)}
              options={FEE_STATUS_OPTIONS}
            />
          </>
        )}

        {/* ── Results filters ── */}
        {reportType === 'results' && (
          <>
            <Select
              label="Campus"
              value={campusId}
              onChange={(e) => {
                setCampusId(e.target.value)
                setProgramId('')
                setGradeId('')
                setSectionId('')
                setSubjectId('')
                setExamId('')
              }}
              options={campusOptions}
            />
            <Select
              label="Program"
              value={programId}
              onChange={(e) => {
                setProgramId(e.target.value)
                setGradeId('')
                setSectionId('')
                setSubjectId('')
                setExamId('')
              }}
              options={programOptions}
            />
            <Select
              label="Grade"
              value={gradeId}
              onChange={(e) => {
                setGradeId(e.target.value)
                setSectionId('')
                setSubjectId('')
                setExamId('')
              }}
              options={gradeOptions}
            />
            <Select
              label="Section"
              value={sectionId}
              onChange={(e) => {
                setSectionId(e.target.value)
                setSubjectId('')
                setExamId('')
              }}
              options={sectionOptions}
            />
            <Select
              label="Subject (optional)"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value)
                setExamId('')
              }}
              options={[
                { value: '', label: 'All Subjects' },
                ...(assignments ?? []).map((a) => ({
                  value: a.subjectId,
                  label: a.subject?.name ?? a.subjectId,
                })),
              ]}
            />
            <Select
              label="Exam (optional)"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              options={[
                { value: '', label: 'All Exams' },
                ...(exams ?? []).map((e) => ({
                  value: e.id,
                  label: `${e.examType?.name ?? ''} — ${e.date ? new Date(e.date).toLocaleDateString() : ''}`,
                })),
              ]}
            />
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="gold"
          icon={<Download className="w-4 h-4" />}
          loading={isLoading}
          onClick={() => onDownloadExcel(getFilters())}
        >
          Download Excel
        </Button>
        <Button
          variant="outline"
          icon={<Printer className="w-4 h-4" />}
          loading={isLoading}
          onClick={() => onPrint(getFilters())}
        >
          Print / Preview
        </Button>
      </div>
    </div>
  )
}
