'use client'

import { useState } from 'react'
import { BarChart2, FileText, Download, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { Tooltip } from '@/components/ui/Tooltip'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { usePrograms } from '@/features/programs/hooks/usePrograms'
import { useProgramGrades, useSections } from '@/features/sections/hooks/useSections'
import { useStudentsBySection } from '@/features/students/hooks/useStudents'
import { useAssignmentsBySection } from '@/features/subjects/hooks/useSubjects'
import { useExams } from '@/features/exams/hooks/useExams'
import { useStudentReportCard, useSectionResults } from '@/features/results/hooks/useResults'
import { ReportCard } from '@/features/results/components/ReportCard'
import { SectionResultsTable } from '@/features/results/components/SectionResultsTable'

const TABS = [
  { id: 'report-card', label: 'Student Report Card', icon: <FileText className="w-4 h-4" /> },
  { id: 'section', label: 'Section Results', icon: <BarChart2 className="w-4 h-4" /> },
]

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState('report-card')

  // ── Tab 1 (Report Card) state ────────────────────────────────
  const [rcSectionId, setRcSectionId] = useState('')
  const [rcStudentId, setRcStudentId] = useState('')
  const [rcCampusId, setRcCampusId] = useState('')
  const [rcProgramId, setRcProgramId] = useState('')
  const [rcGradeId, setRcGradeId] = useState('')

  // ── Tab 2 (Section Results) state ────────────────────────────
  const [srCampusId, setSrCampusId] = useState('')
  const [srProgramId, setSrProgramId] = useState('')
  const [srGradeId, setSrGradeId] = useState('')
  const [srSectionId, setSrSectionId] = useState('')
  const [srSubjectId, setSrSubjectId] = useState('')
  const [srExamId, setSrExamId] = useState('')

  // ── Shared data ──────────────────────────────────────────────
  const { data: campuses } = useCampuses()

  // ── Tab 1 data ───────────────────────────────────────────────
  const { data: rcPrograms } = usePrograms(rcCampusId || undefined)
  const { data: rcGrades } = useProgramGrades(rcProgramId || undefined)
  const { data: rcSections } = useSections(rcGradeId || undefined)
  const { data: rcStudents } = useStudentsBySection(rcSectionId)
  const {
    data: reportCard,
    isLoading: reportCardLoading,
    error: reportCardError,
  } = useStudentReportCard(rcStudentId)

  // ── Tab 2 data ───────────────────────────────────────────────
  const { data: srPrograms } = usePrograms(srCampusId || undefined)
  const { data: srGrades } = useProgramGrades(srProgramId || undefined)
  const { data: srSections } = useSections(srGradeId || undefined)
  const { data: srAssignments } = useAssignmentsBySection(srSectionId)
  const { data: srExams } = useExams({ sectionId: srSectionId || undefined, subjectId: srSubjectId || undefined })
  const {
    data: sectionResults,
    isLoading: sectionResultsLoading,
  } = useSectionResults({
    sectionId: srSectionId,
    subjectId: srSubjectId || undefined,
    examId: srExamId || undefined,
  })

  const handleClearRcFilters = () => {
    setRcCampusId('')
    setRcProgramId('')
    setRcGradeId('')
    setRcSectionId('')
    setRcStudentId('')
  }

  const handleClearSrFilters = () => {
    setSrCampusId('')
    setSrProgramId('')
    setSrGradeId('')
    setSrSectionId('')
    setSrSubjectId('')
    setSrExamId('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8">
      <PageHeader
        title="Results"
        subtitle="View student report cards and section exam results"
      />

      <Card className="flex-1 overflow-hidden mt-6 flex flex-col bg-[var(--surface)] border-[var(--border)]">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex-1 overflow-auto p-6 bg-[var(--background)]">

          {/* ── Tab 1: Student Report Card ── */}
          <TabPanel tabId="report-card" activeTab={activeTab}>
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap items-end gap-4">
                <Select
                  label="Campus"
                  value={rcCampusId}
                  onChange={(e) => {
                    setRcCampusId(e.target.value)
                    setRcProgramId('')
                    setRcGradeId('')
                    setRcSectionId('')
                    setRcStudentId('')
                  }}
                  options={[
                    { value: '', label: 'All Campuses' },
                    ...(campuses ?? []).map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
                <Select
                  label="Program"
                  value={rcProgramId}
                  onChange={(e) => {
                    setRcProgramId(e.target.value)
                    setRcGradeId('')
                    setRcSectionId('')
                    setRcStudentId('')
                  }}
                  options={[
                    { value: '', label: 'All Programs' },
                    ...(rcPrograms ?? []).map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
                <Select
                  label="Grade"
                  value={rcGradeId}
                  onChange={(e) => {
                    setRcGradeId(e.target.value)
                    setRcSectionId('')
                    setRcStudentId('')
                  }}
                  options={[
                    { value: '', label: 'All Grades' },
                    ...(rcGrades ?? []).map((g) => ({ value: g.id, label: g.name })),
                  ]}
                />
                <Select
                  label="Section"
                  value={rcSectionId}
                  onChange={(e) => {
                    setRcSectionId(e.target.value)
                    setRcStudentId('')
                  }}
                  options={[
                    { value: '', label: 'Select Section' },
                    ...(rcSections ?? []).map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
                <Select
                  label="Student"
                  value={rcStudentId}
                  onChange={(e) => setRcStudentId(e.target.value)}
                  options={[
                    { value: '', label: rcSectionId ? 'Select Student' : 'Select a section first' },
                    ...(rcStudents ?? []).map((s) => ({
                      value: s.id,
                      label: `${s.firstName} ${s.lastName}${s.rollNumber ? ` (#${s.rollNumber})` : ''}`,
                    })),
                  ]}
                />
                {(rcCampusId || rcProgramId || rcGradeId || rcSectionId || rcStudentId) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearRcFilters}
                    icon={<X className="w-3.5 h-3.5" />}
                    className="mb-0.5"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Report Card content */}
              {!rcStudentId && (
                <EmptyState
                  title="No student selected"
                  description="Select a campus, program, grade, section, and student to view the report card"
                  icon={<FileText className="w-10 h-10" />}
                />
              )}

              {rcStudentId && reportCardLoading && (
                <div className="space-y-4">
                  <Skeleton variant="card" />
                  <Skeleton variant="card" />
                </div>
              )}

              {rcStudentId && reportCardError && (
                <EmptyState
                  title="Failed to load report card"
                  description="Something went wrong. Please try again."
                />
              )}

              {rcStudentId && reportCard && !reportCardLoading && (
                <ReportCard data={reportCard} />
              )}
            </div>
          </TabPanel>

          {/* ── Tab 2: Section Results ── */}
          <TabPanel tabId="section" activeTab={activeTab}>
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap items-end gap-4">
                <Select
                  label="Campus"
                  value={srCampusId}
                  onChange={(e) => {
                    setSrCampusId(e.target.value)
                    setSrProgramId('')
                    setSrGradeId('')
                    setSrSectionId('')
                    setSrSubjectId('')
                    setSrExamId('')
                  }}
                  options={[
                    { value: '', label: 'All Campuses' },
                    ...(campuses ?? []).map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
                <Select
                  label="Program"
                  value={srProgramId}
                  onChange={(e) => {
                    setSrProgramId(e.target.value)
                    setSrGradeId('')
                    setSrSectionId('')
                    setSrSubjectId('')
                    setSrExamId('')
                  }}
                  options={[
                    { value: '', label: 'All Programs' },
                    ...(srPrograms ?? []).map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
                <Select
                  label="Grade"
                  value={srGradeId}
                  onChange={(e) => {
                    setSrGradeId(e.target.value)
                    setSrSectionId('')
                    setSrSubjectId('')
                    setSrExamId('')
                  }}
                  options={[
                    { value: '', label: 'All Grades' },
                    ...(srGrades ?? []).map((g) => ({ value: g.id, label: g.name })),
                  ]}
                />
                <Select
                  label="Section"
                  value={srSectionId}
                  onChange={(e) => {
                    setSrSectionId(e.target.value)
                    setSrSubjectId('')
                    setSrExamId('')
                  }}
                  options={[
                    { value: '', label: 'Select Section' },
                    ...(srSections ?? []).map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
                <Select
                  label="Subject (optional)"
                  value={srSubjectId}
                  onChange={(e) => {
                    setSrSubjectId(e.target.value)
                    setSrExamId('')
                  }}
                  options={[
                    { value: '', label: 'All Subjects' },
                    ...(srAssignments ?? []).map((a) => ({
                      value: a.subjectId,
                      label: a.subject?.name ?? a.subjectId,
                    })),
                  ]}
                />
                <Select
                  label="Exam (optional)"
                  value={srExamId}
                  onChange={(e) => setSrExamId(e.target.value)}
                  options={[
                    { value: '', label: 'All Exams' },
                    ...(srExams ?? []).map((e) => ({
                      value: e.id,
                      label: `${e.examType?.name ?? ''} — ${e.date ? new Date(e.date).toLocaleDateString() : ''}`,
                    })),
                  ]}
                />
                {(srCampusId || srProgramId || srGradeId || srSectionId || srSubjectId || srExamId) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSrFilters}
                    icon={<X className="w-3.5 h-3.5" />}
                    className="mb-0.5"
                  >
                    Clear Filters
                  </Button>
                )}
                <Tooltip content="Export is coming soon">
                  <span>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Download className="w-3.5 h-3.5" />}
                      disabled
                    >
                      Export
                    </Button>
                  </span>
                </Tooltip>
              </div>

              {/* Section results content */}
              {!srSectionId && (
                <EmptyState
                  title="No section selected"
                  description="Select a campus, program, grade, and section to view exam results"
                  icon={<BarChart2 className="w-10 h-10" />}
                />
              )}

              {srSectionId && sectionResultsLoading && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} variant="card" />
                    ))}
                  </div>
                  <Skeleton variant="table" />
                </div>
              )}

              {srSectionId && !sectionResultsLoading && sectionResults && sectionResults.length === 0 && (
                <EmptyState
                  title="No results found"
                  description="No exam results match the selected filters"
                  icon={<BarChart2 className="w-10 h-10" />}
                />
              )}

              {srSectionId && !sectionResultsLoading && sectionResults && sectionResults.length > 0 && (
                <div className="space-y-8">
                  {sectionResults.map((summary) => (
                    <SectionResultsTable key={summary.examId} data={summary} />
                  ))}
                </div>
              )}
            </div>
          </TabPanel>
        </div>
      </Card>
    </div>
  )
}
