'use client'

import { useState, useEffect } from 'react'
import { Button, Badge, Input, Table } from '@/components/ui'
import { TableColumn } from '@/components/ui/Table'
import { useExamResults, useEnterBulkResults } from '../hooks/useExams'
import { ExamResult } from '../types/exams.types'
import { Save } from 'lucide-react'

interface PendingResult {
  obtainedMarks?: number
  isAbsent: boolean
  remarks?: string
}

interface Props {
  examId: string
  totalMarks: number
  isLoading: boolean
}

function calcGrade(obtained: number, total: number): string {
  const pct = (obtained / total) * 100
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  return 'F'
}

const GRADE_VARIANT: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  'A+': 'success',
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'warning',
  F: 'danger',
}

export function ResultEntryTable({ examId, totalMarks, isLoading: parentLoading }: Props) {
  const { data: results, isLoading: resultsLoading } = useExamResults(examId)
  const enterBulkMutation = useEnterBulkResults()

  const [pendingResults, setPendingResults] = useState<Record<string, PendingResult>>({})

  // Pre-fill pending state from existing results whenever they load
  useEffect(() => {
    if (results) {
      const initial: Record<string, PendingResult> = {}
      results.forEach((r) => {
        initial[r.studentId] = {
          obtainedMarks: r.obtainedMarks ?? undefined,
          isAbsent: r.isAbsent,
          remarks: r.remarks ?? undefined,
        }
      })
      setPendingResults(initial)
    }
  }, [results])

  const updatePending = (studentId: string, patch: Partial<PendingResult>) => {
    setPendingResults((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], ...patch },
    }))
  }

  const handleSave = () => {
    if (!results?.length) return
    const payload = results.map((r) => {
      const pending = pendingResults[r.studentId]
      return {
        examId,
        studentId: r.studentId,
        obtainedMarks: pending?.isAbsent ? undefined : pending?.obtainedMarks,
        isAbsent: pending?.isAbsent ?? false,
        remarks: pending?.remarks,
      }
    })
    enterBulkMutation.mutate({ results: payload })
  }

  const columns: TableColumn<ExamResult>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div>
          <div className="font-medium">
            {row.student?.firstName ?? ''} {row.student?.lastName ?? ''}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">
            Roll: {row.student?.rollNumber ?? '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'absent',
      header: 'Status',
      render: (row) => {
        const isAbsent = pendingResults[row.studentId]?.isAbsent ?? row.isAbsent
        return (
          <select
            value={isAbsent ? 'absent' : 'present'}
            onChange={(e) =>
              updatePending(row.studentId, { isAbsent: e.target.value === 'absent' })
            }
            className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] cursor-pointer"
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        )
      },
    },
    {
      key: 'marks',
      header: `Marks (/${totalMarks})`,
      render: (row) => {
        const pending = pendingResults[row.studentId]
        const isAbsent = pending?.isAbsent ?? row.isAbsent
        const currentMarks = pending?.obtainedMarks ?? row.obtainedMarks ?? undefined
        return (
          <Input
            type="number"
            min={0}
            max={totalMarks}
            value={currentMarks ?? ''}
            disabled={isAbsent}
            onChange={(e) =>
              updatePending(row.studentId, {
                obtainedMarks: e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
            className="w-24"
            placeholder="0"
          />
        )
      },
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (row) => {
        const currentRemarks = pendingResults[row.studentId]?.remarks ?? row.remarks ?? ''
        return (
          <Input
            type="text"
            value={currentRemarks ?? ''}
            onChange={(e) => updatePending(row.studentId, { remarks: e.target.value })}
            placeholder="Optional remarks"
            className="min-w-[160px]"
          />
        )
      },
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (row) => {
        const pending = pendingResults[row.studentId]
        const isAbsent = pending?.isAbsent ?? row.isAbsent
        if (isAbsent) {
          return <Badge variant="danger">Absent</Badge>
        }
        const marks = pending?.obtainedMarks ?? row.obtainedMarks
        if (marks === null || marks === undefined) {
          return <span className="text-[var(--text-muted)] text-xs">—</span>
        }
        const grade = calcGrade(marks, totalMarks)
        return <Badge variant={GRADE_VARIANT[grade] ?? 'neutral'}>{grade}</Badge>
      },
    },
  ]

  const loading = parentLoading || resultsLoading

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={results ?? []}
        loading={loading}
        emptyMessage="No students found for this exam."
      />
      {(results?.length ?? 0) > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            loading={enterBulkMutation.isPending}
            icon={<Save className="w-4 h-4" />}
          >
            Save Results
          </Button>
        </div>
      )}
    </div>
  )
}
