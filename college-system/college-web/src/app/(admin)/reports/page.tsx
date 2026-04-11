'use client'

import { FileBarChart, CalendarCheck, CreditCard, ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Tabs, TabPanel } from '@/components/ui'
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
import { useState } from 'react'

const TABS = [
  { id: 'attendance', label: 'Attendance Reports', icon: <CalendarCheck className="w-4 h-4" /> },
  { id: 'fees', label: 'Fee Reports', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'results', label: 'Results Reports', icon: <ClipboardList className="w-4 h-4" /> },
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('attendance')

  const downloadAttendance = useDownloadAttendanceExcel()
  const printAttendance = usePrintAttendanceReport()
  const downloadFee = useDownloadFeeExcel()
  const printFee = usePrintFeeReport()
  const downloadResults = useDownloadResultsExcel()
  const printResults = usePrintResultsReport()

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8">
      <PageHeader
        title="Reports"
        subtitle="Generate and download attendance, fee, and results reports"
        breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Reports' }]}
      />

      <Card className="flex-1 overflow-hidden mt-6 flex flex-col bg-[var(--surface)] border-[var(--border)]">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex-1 overflow-auto p-6 bg-[var(--background)]">

          {/* ── Tab 1: Attendance Reports ── */}
          <TabPanel tabId="attendance" activeTab={activeTab}>
            <div className="space-y-8">
              <ReportFilters
                reportType="attendance"
                isLoading={downloadAttendance.isPending || printAttendance.isPending}
                onDownloadExcel={(filters) =>
                  downloadAttendance.mutate(filters as AttendanceReportFilters)
                }
                onPrint={(filters) =>
                  printAttendance.mutate(filters as AttendanceReportFilters)
                }
              />
              <EmptyHint />
            </div>
          </TabPanel>

          {/* ── Tab 2: Fee Reports ── */}
          <TabPanel tabId="fees" activeTab={activeTab}>
            <div className="space-y-8">
              <ReportFilters
                reportType="fees"
                isLoading={downloadFee.isPending || printFee.isPending}
                onDownloadExcel={(filters) =>
                  downloadFee.mutate(filters as FeeReportFilters)
                }
                onPrint={(filters) =>
                  printFee.mutate(filters as FeeReportFilters)
                }
              />
              <EmptyHint />
            </div>
          </TabPanel>

          {/* ── Tab 3: Results Reports ── */}
          <TabPanel tabId="results" activeTab={activeTab}>
            <div className="space-y-8">
              <ReportFilters
                reportType="results"
                isLoading={downloadResults.isPending || printResults.isPending}
                onDownloadExcel={(filters) =>
                  downloadResults.mutate(filters as ResultsReportFilters)
                }
                onPrint={(filters) =>
                  printResults.mutate(filters as ResultsReportFilters)
                }
              />
              <EmptyHint />
            </div>
          </TabPanel>

        </div>
      </Card>
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
