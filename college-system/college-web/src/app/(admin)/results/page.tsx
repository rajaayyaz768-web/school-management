'use client'

import { useState } from 'react'
import { BarChart2, FileText, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { Tooltip } from '@/components/ui/Tooltip'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { useStudentsBySection } from '@/features/students/hooks/useStudents'
import { useAssignmentsBySection } from '@/features/subjects/hooks/useSubjects'
import { useExams } from '@/features/exams/hooks/useExams'
import { useStudentReportCard, useSectionResults } from '@/features/results/hooks/useResults'
import { ReportCard } from '@/features/results/components/ReportCard'
import { SectionResultsTable } from '@/features/results/components/SectionResultsTable'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import type { SectionCardData } from '@/components/shared/selection/types'

type Step = 'section' | 'content'

const TABS = [
  { id: 'report-card', label: 'Student Report Card', icon: <FileText className="w-4 h-4" /> },
  { id: 'section-results', label: 'Section Results', icon: <BarChart2 className="w-4 h-4" /> },
]

export default function ResultsPage() {
  const [step, setStep] = useState<Step>('section')
  const [selectedSection, setSelectedSection] = useState<SectionCardData | null>(null)
  const [activeTab, setActiveTab] = useState('report-card')
  const [rcStudentId, setRcStudentId] = useState('')
  const [srSubjectId, setSrSubjectId] = useState('')
  const [srExamId, setSrExamId] = useState('')

  const { data: campuses } = useCampuses()
  const campusId = campuses?.[0]?.id ?? ''
  const sectionId = selectedSection?.id ?? ''

  const { data: rcStudents } = useStudentsBySection(sectionId)
  const { data: srAssignments } = useAssignmentsBySection(sectionId)
  const { data: srExams } = useExams({ sectionId: sectionId || undefined, subjectId: srSubjectId || undefined })
  const { data: reportCard, isLoading: reportCardLoading, error: reportCardError } = useStudentReportCard(rcStudentId)
  const { data: sectionResults, isLoading: sectionResultsLoading } = useSectionResults({
    sectionId,
    subjectId: srSubjectId || undefined,
    examId: srExamId || undefined,
  })

  const handleSectionSelect = (section: SectionCardData) => {
    setSelectedSection(section)
    setRcStudentId('')
    setSrSubjectId('')
    setSrExamId('')
    setStep('content')
  }

  const handleChangeSection = () => {
    setStep('section')
    setSelectedSection(null)
    setRcStudentId('')
    setSrSubjectId('')
    setSrExamId('')
  }

  if (step === 'section' && campusId) {
    return (
      <div className="p-8 space-y-6">
        <PageHeader
          title="Results"
          subtitle="Select a section to view student report cards or exam results"
        />
        <SectionSelectorCards
          campusId={campusId}
          onSelect={handleSectionSelect}
          selectedId={selectedSection?.id}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8">
      <PageHeader
        title="Results"
        subtitle="View student report cards and section exam results"
      />

      <div className="flex items-center gap-3 mt-4 mb-2">
        <Button variant="ghost" size="sm" onClick={handleChangeSection}>
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

      <Card className="flex-1 overflow-hidden flex flex-col bg-[var(--surface)] border-[var(--border)]">
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab)
            setRcStudentId('')
            setSrSubjectId('')
            setSrExamId('')
          }}
        />

        <div className="flex-1 overflow-auto p-6 bg-[var(--background)]">
          {/* ── Tab 1: Student Report Card ── */}
          <TabPanel tabId="report-card" activeTab={activeTab}>
            <div className="space-y-6">
              <div className="max-w-xs">
                <Select
                  label="Student"
                  value={rcStudentId}
                  onChange={(e) => setRcStudentId(e.target.value)}
                  options={[
                    { value: '', label: rcStudents?.length ? 'Select Student' : 'Loading students…' },
                    ...(rcStudents ?? []).map((s) => ({
                      value: s.id,
                      label: `${s.firstName} ${s.lastName}${s.rollNumber ? ` (#${s.rollNumber})` : ''}`,
                    })),
                  ]}
                />
              </div>

              {!rcStudentId && (
                <EmptyState
                  title="No student selected"
                  description="Select a student above to view their report card"
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
          <TabPanel tabId="section-results" activeTab={activeTab}>
            <div className="space-y-6">
              <div className="flex flex-wrap items-end gap-4">
                <Select
                  label="Subject (optional)"
                  value={srSubjectId}
                  onChange={(e) => { setSrSubjectId(e.target.value); setSrExamId('') }}
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
                <Tooltip content="Export is coming soon">
                  <span>
                    <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} disabled>
                      Export
                    </Button>
                  </span>
                </Tooltip>
              </div>

              {sectionResultsLoading && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} variant="card" />)}
                  </div>
                  <Skeleton variant="table" />
                </div>
              )}
              {!sectionResultsLoading && (!sectionResults || sectionResults.length === 0) && (
                <EmptyState
                  title="No results found"
                  description="No exam results have been recorded for this section yet"
                  icon={<BarChart2 className="w-10 h-10" />}
                />
              )}
              {!sectionResultsLoading && sectionResults && sectionResults.length > 0 && (
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
