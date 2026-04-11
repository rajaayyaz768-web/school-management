'use client'

import { Users, TrendingUp, TrendingDown, Award, UserX } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Table, TableColumn } from '@/components/ui/Table'
import { SectionResultSummary, SectionStudentResult } from '../types/results.types'

interface SectionResultsTableProps {
  data: SectionResultSummary
}

function gradeVariant(grade: string | null): 'aplus' | 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  if (!grade) return 'neutral'
  if (grade === 'A+') return 'aplus'
  if (grade === 'A') return 'success'
  if (grade === 'B') return 'info'
  if (grade === 'C' || grade === 'D') return 'warning'
  return 'danger'
}

export function SectionResultsTable({ data }: SectionResultsTableProps) {
  // Sort students by obtainedMarks descending (absent at bottom)
  const sortedStudents = [...data.studentResults].sort((a, b) => {
    if (a.isAbsent && !b.isAbsent) return 1
    if (!a.isAbsent && b.isAbsent) return -1
    if (a.obtainedMarks === null && b.obtainedMarks !== null) return 1
    if (a.obtainedMarks !== null && b.obtainedMarks === null) return -1
    return (b.obtainedMarks ?? 0) - (a.obtainedMarks ?? 0)
  })

  const columns: TableColumn<SectionStudentResult>[] = [
    {
      key: 'rank',
      header: '#',
      render: (_row, index) => (
        <span className="font-mono text-[var(--text-muted)] text-xs">{index + 1}</span>
      ),
    },
    {
      key: 'name',
      header: 'Student',
      render: (row) => (
        <div>
          <p className="font-body text-sm font-medium text-[var(--text)]">
            {row.firstName} {row.lastName}
          </p>
          {row.rollNumber && (
            <p className="font-mono text-xs text-[var(--text-muted)] mt-0.5">#{row.rollNumber}</p>
          )}
        </div>
      ),
    },
    {
      key: 'obtainedMarks',
      header: `Marks / ${data.totalMarks}`,
      render: (row) =>
        row.isAbsent ? (
          <Badge variant="absent">Absent</Badge>
        ) : (
          <span className="font-mono font-semibold">{row.obtainedMarks ?? '—'}</span>
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

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Class Average"
          value={data.classAverage !== null ? `${data.classAverage}` : '—'}
          subtitle={`out of ${data.totalMarks}`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Highest"
          value={data.highestMarks !== null ? `${data.highestMarks}` : '—'}
          subtitle={`out of ${data.totalMarks}`}
          icon={<Award className="w-5 h-5" />}
          variant="gold"
        />
        <StatCard
          title="Pass / Fail"
          value={`${data.passCount} / ${data.failCount}`}
          subtitle={`${data.absentCount} absent`}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Lowest"
          value={data.lowestMarks !== null ? `${data.lowestMarks}` : '—'}
          subtitle={`out of ${data.totalMarks}`}
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </div>

      {/* Student results table */}
      <Table<SectionStudentResult>
        columns={columns}
        data={sortedStudents}
        emptyMessage="No student results found"
        caption={`${data.subjectName} · ${data.examTypeName} · ${data.date}`}
      />
    </div>
  )
}

export default SectionResultsTable
