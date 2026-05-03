'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Save } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { useExamResults, useEnterBulkResults } from '../hooks/useExams'
import { ExamResult } from '../types/exams.types'

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

const AVATAR_COLORS = [
  'bg-[var(--primary)]',
  'bg-[var(--gold)]',
  'bg-purple-600',
  'bg-blue-600',
  'bg-rose-600',
  'bg-emerald-600',
]

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
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
  'A+': 'success', A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger',
}

export function ResultEntryTable({ examId, totalMarks, isLoading: parentLoading }: Props) {
  const { data: results, isLoading: resultsLoading } = useExamResults(examId)
  const enterBulkMutation = useEnterBulkResults()

  const [pendingResults, setPendingResults] = useState<Record<string, PendingResult>>({})

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

  const loading = parentLoading || resultsLoading

  // ── Stats computation ─────────────────────────────────────────────────────
  const totalStudents = results?.length ?? 0
  const passCount = results?.filter((r) => {
    const pending = pendingResults[r.studentId]
    if (pending?.isAbsent ?? r.isAbsent) return false
    const marks = pending?.obtainedMarks ?? r.obtainedMarks ?? 0
    return (marks / totalMarks) * 100 >= 50
  }).length ?? 0
  const avgPct = totalStudents > 0
    ? Math.round(
        (results ?? []).reduce((sum, r) => {
          const pending = pendingResults[r.studentId]
          if (pending?.isAbsent ?? r.isAbsent) return sum
          return sum + (pending?.obtainedMarks ?? r.obtainedMarks ?? 0)
        }, 0) / totalStudents / totalMarks * 100
      )
    : 0

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
        ))}
      </div>
    )
  }

  if (!results?.length) {
    return (
      <p className="text-center text-sm text-[var(--text-muted)] py-8">
        No students found for this exam.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { label: `${totalStudents} students`,  icon: 'bg-[var(--surface)] text-[var(--text-muted)]', border: 'border-[var(--border)]' },
          { label: `Avg ${avgPct}%`,              icon: 'bg-[var(--gold)]/10 text-[var(--gold)]',        border: 'border-[var(--gold)]/30' },
          { label: `${passCount} passing`,        icon: 'bg-emerald-500/10 text-emerald-400',            border: 'border-emerald-500/30' },
        ].map((stat) => (
          <div key={stat.label} className={cn('shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold', stat.icon, stat.border)}>
            {stat.label}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {results.map((row, i) => {
          const pending = pendingResults[row.studentId]
          const isAbsent = pending?.isAbsent ?? row.isAbsent
          const currentMarks = pending?.obtainedMarks ?? row.obtainedMarks ?? undefined
          const pct = currentMarks !== undefined ? (currentMarks / totalMarks) * 100 : null
          const isPassing = pct !== null && pct >= 50
          const grade = currentMarks !== undefined ? calcGrade(currentMarks, totalMarks) : null

          return (
            <motion.article
              key={row.studentId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                'bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 flex items-center gap-3',
                isAbsent && 'opacity-60'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0',
                AVATAR_COLORS[i % AVATAR_COLORS.length],
                isAbsent && 'grayscale'
              )}>
                {getInitials(row.student?.firstName ?? '', row.student?.lastName ?? '')}
              </div>

              {/* Name + roll */}
              <div className="flex-1 min-w-0">
                <p className={cn('font-semibold text-sm truncate', isAbsent ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]')}>
                  {row.student?.firstName ?? ''} {row.student?.lastName ?? ''}
                </p>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                  {row.student?.rollNumber ?? '—'}
                </p>
              </div>

              {/* Right controls */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                {/* Absent toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] text-[var(--text-muted)] font-medium">Absent</span>
                  <div
                    onClick={() => updatePending(row.studentId, { isAbsent: !isAbsent })}
                    className={cn(
                      'w-8 h-4 rounded-full transition-colors cursor-pointer relative',
                      isAbsent ? 'bg-red-500' : 'bg-[var(--border)]'
                    )}
                  >
                    <div className={cn(
                      'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all',
                      isAbsent ? 'right-0.5' : 'left-0.5'
                    )} />
                  </div>
                </label>

                {/* Marks input + grade */}
                {!isAbsent ? (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      'flex items-baseline gap-1 px-2.5 py-1.5 rounded-lg border transition-colors',
                      currentMarks === undefined ? 'border-[var(--border)] bg-[var(--bg)]' :
                        isPassing ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'
                    )}>
                      <input
                        type="number"
                        min={0}
                        max={totalMarks}
                        value={currentMarks ?? ''}
                        onChange={(e) =>
                          updatePending(row.studentId, {
                            obtainedMarks: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        placeholder="--"
                        className={cn(
                          'bg-transparent border-none p-0 w-10 text-right font-bold text-base outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                          currentMarks === undefined ? 'text-[var(--text)]' :
                            isPassing ? 'text-emerald-400' : 'text-red-400'
                        )}
                      />
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">/{totalMarks}</span>
                    </div>
                    {grade && (
                      <Badge variant={GRADE_VARIANT[grade] ?? 'neutral'} size="sm">{grade}</Badge>
                    )}
                  </div>
                ) : (
                  <Badge variant="danger" size="sm">Absent</Badge>
                )}
              </div>
            </motion.article>
          )
        })}
      </div>

      {/* Save button — inline at the end of the list */}
      <button
        onClick={handleSave}
        disabled={enterBulkMutation.isPending}
        className="w-full h-12 bg-[var(--primary)] text-white rounded-full font-semibold disabled:opacity-40 hover:bg-[var(--primary)]/90 transition-colors flex items-center justify-center gap-2 mt-2 mb-6"
      >
        <Save className="w-4 h-4" />
        {enterBulkMutation.isPending ? 'Saving…' : 'Save All Results'}
      </button>
    </div>
  )
}
