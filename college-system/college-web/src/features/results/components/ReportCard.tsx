'use client'

import { useState } from 'react'
import { Printer, User, BookOpen, TrendingUp, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, TableColumn } from '@/components/ui/Table'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { StudentReportCard, ExamResultEntry } from '../types/results.types'

interface ReportCardProps {
  data: StudentReportCard
}

function gradeVariant(grade: string | null): 'aplus' | 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  if (!grade) return 'neutral'
  if (grade === 'A+') return 'aplus'
  if (grade === 'A') return 'success'
  if (grade === 'B') return 'info'
  if (grade === 'C' || grade === 'D') return 'warning'
  return 'danger'
}

const examColumns: TableColumn<ExamResultEntry>[] = [
  { key: 'examTypeName', header: 'Exam Type' },
  { key: 'date', header: 'Date' },
  {
    key: 'totalMarks',
    header: 'Total Marks',
    render: (row) => <span className="font-mono">{row.totalMarks}</span>,
  },
  {
    key: 'obtainedMarks',
    header: 'Obtained',
    render: (row) =>
      row.isAbsent ? (
        <Badge variant="absent">Absent</Badge>
      ) : (
        <span className="font-mono">{row.obtainedMarks ?? '—'}</span>
      ),
  },
  {
    key: 'percentage',
    header: 'Percentage',
    render: (row) =>
      row.isAbsent || row.percentage === null ? (
        <span className="text-[var(--text-muted)]">—</span>
      ) : (
        <span className="font-mono">{row.percentage}%</span>
      ),
  },
  {
    key: 'grade',
    header: 'Grade',
    render: (row) =>
      row.isAbsent || !row.grade ? (
        <span className="text-[var(--text-muted)]">—</span>
      ) : (
        <Badge variant={gradeVariant(row.grade)}>{row.grade}</Badge>
      ),
  },
]

export function ReportCard({ data }: ReportCardProps) {
  const [activeTab, setActiveTab] = useState(data.subjects[0]?.subjectId ?? '')

  const tabs = data.subjects.map((s) => ({
    id: s.subjectId,
    label: s.subjectName,
    icon: <BookOpen className="w-3.5 h-3.5" />,
  }))

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Student info header */}
      <Card>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--text)]">
                {data.firstName} {data.lastName}
              </h2>
              <p className="font-body text-sm text-[var(--text-muted)] mt-0.5">
                Roll #{data.rollNumber ?? 'N/A'} · {data.sectionName} · {data.gradeName}
              </p>
              <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
                {data.programName} · {data.campusName}
                {data.academicYear && ` · ${data.academicYear}`}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Report
          </Button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[var(--border)]">
          <div className="text-center">
            <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Overall %</p>
            <p className="font-display text-2xl font-bold text-[var(--text)]">
              {data.overallPercentage !== null ? `${data.overallPercentage}%` : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Overall Grade</p>
            <div className="flex justify-center">
              {data.overallGrade ? (
                <Badge variant={gradeVariant(data.overallGrade)} size="md">
                  {data.overallGrade}
                </Badge>
              ) : (
                <span className="font-display text-2xl font-bold text-[var(--text-muted)]">—</span>
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Exams</p>
            <p className="font-display text-2xl font-bold text-[var(--text)]">{data.totalExams}</p>
          </div>
          <div className="text-center">
            <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Passed</p>
            <p className="font-display text-2xl font-bold text-[var(--text)]">
              {data.passedExams}
              <span className="text-sm font-body font-normal text-[var(--text-muted)] ml-1">/ {data.totalExams}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Subject tabs */}
      {data.subjects.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="w-10 h-10 text-[var(--text-muted)] mb-3" />
            <p className="font-body text-[var(--text-muted)]">No exam results available yet</p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="px-6 pt-6">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {data.subjects.map((subject) => (
            <TabPanel key={subject.subjectId} tabId={subject.subjectId} activeTab={activeTab} className="px-6 pb-6">
              {/* Subject summary row */}
              <div className="flex items-center gap-6 mb-5 flex-wrap">
                <div>
                  <span className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider">Subject Code</span>
                  <p className="font-mono text-sm font-semibold text-[var(--text)] mt-0.5">{subject.subjectCode}</p>
                </div>
                <div>
                  <span className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider">Overall %</span>
                  <p className="font-body text-sm font-semibold text-[var(--text)] mt-0.5">
                    {subject.overallPercentage !== null ? `${subject.overallPercentage}%` : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider">Overall Grade</span>
                  <div className="mt-0.5">
                    {subject.overallGrade ? (
                      <Badge variant={gradeVariant(subject.overallGrade)}>{subject.overallGrade}</Badge>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="font-body text-xs">{subject.exams.length} exam{subject.exams.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <Table<ExamResultEntry>
                columns={examColumns}
                data={subject.exams}
                emptyMessage="No exams recorded for this subject"
              />
            </TabPanel>
          ))}
        </Card>
      )}
    </div>
  )
}

export default ReportCard
