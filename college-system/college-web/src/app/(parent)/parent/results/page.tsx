'use client'

import { useState } from 'react'
import { Trophy, BookOpen, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useParentDashboard } from '@/features/dashboard/parent/hooks/useParentDashboard'
import { useStudentReportCard } from '@/features/results/hooks/useResults'
import { SubjectResultSummary } from '@/features/results/types/results.types'

function gradeVariant(grade: string | null): 'success' | 'warning' | 'danger' | 'neutral' {
  if (!grade) return 'neutral'
  if (grade === 'A+' || grade === 'A') return 'success'
  if (grade === 'B' || grade === 'C') return 'warning'
  if (grade === 'D') return 'neutral'
  return 'danger'
}

function SubjectCard({ subject }: { subject: SubjectResultSummary }) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--text)] text-sm">{subject.subjectName}</p>
            <p className="text-xs text-[var(--text-muted)]">{subject.subjectCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            {subject.overallPercentage !== null && (
              <p className="text-sm font-bold text-[var(--text)]">{subject.overallPercentage.toFixed(1)}%</p>
            )}
            <Badge variant={gradeVariant(subject.overallGrade)}>{subject.overallGrade ?? '—'}</Badge>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
        </div>
      </div>

      {open && (
        <div className="overflow-x-auto border-t border-[var(--border)] pt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="pb-2 pr-4">Exam</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Marks</th>
                <th className="pb-2">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {subject.exams.map((exam) => (
                <tr key={exam.examId}>
                  <td className="py-2 pr-4 font-medium">{exam.examTypeName}</td>
                  <td className="py-2 pr-4 text-[var(--text-muted)]">
                    {new Date(exam.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-2 pr-4">
                    {exam.isAbsent ? (
                      <span className="text-[var(--danger)]">Absent</span>
                    ) : (
                      <span>{exam.obtainedMarks ?? '—'} / {exam.totalMarks}</span>
                    )}
                  </td>
                  <td className="py-2">
                    <Badge variant={gradeVariant(exam.grade)} size="sm">{exam.grade ?? '—'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default function ParentResultsPage() {
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')

  const { data: dashboard, isLoading: dashLoading } = useParentDashboard()
  const linkedStudents = dashboard?.linkedStudents ?? []
  const studentId = selectedStudentId || dashboard?.primaryStudent?.id || ''

  const { data: reportCard, isLoading: rcLoading } = useStudentReportCard(studentId, academicYear)

  const isLoading = dashLoading || rcLoading

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Results"
        breadcrumb={[{ label: 'Home', href: '/parent/dashboard' }, { label: 'Results' }]}
      />

      <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 max-w-md gap-4">
          {linkedStudents.length > 1 && (
            <Select
              label="Select Child"
              id="student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              options={linkedStudents.map((s) => ({
                value: s.id,
                label: `${s.firstName} ${s.lastName}${s.isPrimary ? ' (Primary)' : ''}`,
              }))}
            />
          )}
          <Input label="Academic Year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} id="academic-year" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
      ) : !studentId ? (
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <EmptyState icon={<Users size={28} style={{ color: 'var(--primary)' }} />} title="No Child Linked" description="No student has been linked to your account." />
        </div>
      ) : !reportCard?.subjects?.length ? (
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <EmptyState icon={<Trophy size={28} style={{ color: 'var(--primary)' }} />} title="No Results Yet" description="No exam results have been recorded for this academic year." />
        </div>
      ) : (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-[var(--text-muted)]">
                {reportCard.firstName} {reportCard.lastName} · {reportCard.sectionName}
              </p>
              <p className="text-2xl font-bold text-[var(--text)] mt-0.5">
                {reportCard.overallPercentage?.toFixed(1) ?? '—'}%
              </p>
              <p className="text-xs text-[var(--text-muted)]">{reportCard.passedExams} / {reportCard.totalExams} exams passed</p>
            </div>
            <Badge variant={gradeVariant(reportCard.overallGrade)} size="md">
              Grade {reportCard.overallGrade ?? '—'}
            </Badge>
          </Card>
          <div className="space-y-3">
            {reportCard.subjects.map((subject) => (
              <SubjectCard key={subject.subjectId} subject={subject} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
