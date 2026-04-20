'use client'

import { useState } from 'react'
import { FileBarChart, CalendarCheck, CreditCard, ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, Tabs, TabPanel } from '@/components/ui'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { ReportFilters } from '@/features/reports/components/ReportFilters'
import {
  useDownloadAttendanceExcel,
  usePrintAttendanceReport,
  useDownloadFeeExcel,
  usePrintFeeReport,
  useDownloadResultsExcel,
  usePrintResultsReport,
} from '@/features/reports/hooks/useReports'
import {
  AttendanceReportFilters,
  FeeReportFilters,
  ResultsReportFilters,
} from '@/features/reports/types/reports.types'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import type { SectionCardData } from '@/components/shared/selection/types'

const TABS = [
  { id: 'attendance', label: 'Attendance Reports', icon: <CalendarCheck className="w-4 h-4" /> },
  { id: 'fees', label: 'Fee Reports', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'results', label: 'Results Reports', icon: <ClipboardList className="w-4 h-4" /> },
]

interface AdminReportsContentProps {
  campusId?: string
}

export function AdminReportsContent({ campusId }: AdminReportsContentProps) {
  const [activeTab, setActiveTab] = useState('attendance')

  const [attendanceSection, setAttendanceSection] = useState<SectionCardData | null>(null)
  const [resultsSection, setResultsSection] = useState<SectionCardData | null>(null)
  const [attendanceSectionStep, setAttendanceSectionStep] = useState<'section' | 'filters'>('section')
  const [resultsSectionStep, setResultsSectionStep] = useState<'section' | 'filters'>('section')

  const downloadAttendance = useDownloadAttendanceExcel()
  const printAttendance = usePrintAttendanceReport()
  const downloadFee = useDownloadFeeExcel()
  const printFee = usePrintFeeReport()
  const downloadResults = useDownloadResultsExcel()
  const printResults = usePrintResultsReport()

  const resolvedCampusId = campusId ?? ''

  return (
    <Card className="flex-1 overflow-hidden mt-6 flex flex-col bg-[var(--surface)] border-[var(--border)]">
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex-1 overflow-auto p-6 bg-[var(--background)]">

        {/* ── Attendance Reports ── */}
        <TabPanel tabId="attendance" activeTab={activeTab}>
          {attendanceSectionStep === 'section' ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Select a Section (optional)
              </p>
              {resolvedCampusId && (
                <SectionSelectorCards
                  campusId={resolvedCampusId}
                  onSelect={(s) => { setAttendanceSection(s); setAttendanceSectionStep('filters') }}
                  selectedId={attendanceSection?.id}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setAttendanceSection(null); setAttendanceSectionStep('filters') }}
              >
                Skip — generate campus-wide report
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setAttendanceSectionStep('section')}>
                  ← Change Section
                </Button>
                {attendanceSection
                  ? <Badge variant="info">{attendanceSection.name}</Badge>
                  : <Badge variant="neutral">Campus-Wide</Badge>
                }
              </div>
              <ReportFilters
                reportType="attendance"
                initialCampusId={resolvedCampusId}
                initialSectionId={attendanceSection?.id ?? ''}
                isLoading={downloadAttendance.isPending || printAttendance.isPending}
                onDownloadExcel={(f) => downloadAttendance.mutate(f as AttendanceReportFilters)}
                onPrint={(f) => printAttendance.mutate(f as AttendanceReportFilters)}
              />
              <EmptyHint />
            </div>
          )}
        </TabPanel>

        {/* ── Fee Reports ── */}
        <TabPanel tabId="fees" activeTab={activeTab}>
          <div className="space-y-8">
            <ReportFilters
              reportType="fees"
              initialCampusId={resolvedCampusId}
              isLoading={downloadFee.isPending || printFee.isPending}
              onDownloadExcel={(f) => downloadFee.mutate(f as FeeReportFilters)}
              onPrint={(f) => printFee.mutate(f as FeeReportFilters)}
            />
            <EmptyHint />
          </div>
        </TabPanel>

        {/* ── Results Reports ── */}
        <TabPanel tabId="results" activeTab={activeTab}>
          {resultsSectionStep === 'section' ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Select a Section
              </p>
              {resolvedCampusId && (
                <SectionSelectorCards
                  campusId={resolvedCampusId}
                  onSelect={(s) => { setResultsSection(s); setResultsSectionStep('filters') }}
                  selectedId={resultsSection?.id}
                />
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setResultsSectionStep('section')}>
                  ← Change Section
                </Button>
                {resultsSection && <Badge variant="info">{resultsSection.name}</Badge>}
              </div>
              <ReportFilters
                reportType="results"
                initialCampusId={resolvedCampusId}
                initialSectionId={resultsSection?.id ?? ''}
                isLoading={downloadResults.isPending || printResults.isPending}
                onDownloadExcel={(f) => downloadResults.mutate(f as ResultsReportFilters)}
                onPrint={(f) => printResults.mutate(f as ResultsReportFilters)}
              />
              <EmptyHint />
            </div>
          )}
        </TabPanel>

      </div>
    </Card>
  )
}

export default function ReportsPage() {
  const { data: campuses } = useCampuses()
  const campusId = campuses?.[0]?.id

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8">
      <PageHeader
        title="Reports"
        subtitle="Generate and download attendance, fee, and results reports"
        breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Reports' }]}
      />
      <AdminReportsContent campusId={campusId} />
    </div>
  )
}

function EmptyHint() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
      <FileBarChart className="w-12 h-12 mb-3 opacity-25" />
      <p className="text-sm font-medium">Configure filters above, then download or preview your report</p>
    </div>
  )
}
