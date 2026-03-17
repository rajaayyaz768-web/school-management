'use client'

import { cn } from '@/lib/utils'
import Badge from '../ui/Badge'

/**
 * MarksEntryRow component for entering student marks
 * @param student - Student info with rollNo and name
 * @param totalMarks - Maximum marks possible
 * @param value - Current marks value
 * @param isAbsent - Whether student was absent
 * @param onChange - Marks change handler
 * @param onAbsentChange - Absent checkbox change handler
 */
export interface MarksEntryRowProps {
  student: {
    rollNo: string
    name: string
  }
  totalMarks: number
  value: string
  isAbsent: boolean
  onChange: (value: string) => void
  onAbsentChange: (absent: boolean) => void
}

// Calculate grade based on marks
function getGrade(marks: number, total: number): { grade: string; variant: 'aplus' | 'pass' | 'fail' | 'neutral' } {
  const percentage = (marks / total) * 100
  if (percentage >= 90) return { grade: 'A+', variant: 'aplus' }
  if (percentage >= 80) return { grade: 'A', variant: 'pass' }
  if (percentage >= 70) return { grade: 'B', variant: 'pass' }
  if (percentage >= 60) return { grade: 'C', variant: 'pass' }
  if (percentage >= 50) return { grade: 'D', variant: 'pass' }
  return { grade: 'F', variant: 'fail' }
}

export function MarksEntryRow({
  student,
  totalMarks,
  value,
  isAbsent,
  onChange,
  onAbsentChange,
}: MarksEntryRowProps) {
  const marks = parseInt(value) || 0
  const isOverLimit = marks > totalMarks
  const gradeInfo = value && !isAbsent ? getGrade(marks, totalMarks) : null

  return (
    <tr
      className={cn(
        'border-b border-[var(--border)] last:border-b-0',
        isAbsent && 'bg-red-50 dark:bg-red-950/10'
      )}
    >
      {/* Roll Number */}
      <td className="font-mono text-xs text-[var(--text-muted)] py-3 px-6">
        {student.rollNo}
      </td>

      {/* Name */}
      <td className="font-body text-sm font-medium text-[var(--text)] py-3 px-6">
        {student.name}
      </td>

      {/* Marks Input */}
      <td className="py-3 px-6">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isAbsent}
          className={cn(
            'w-[100px] text-center font-mono text-sm py-2',
            'bg-[var(--bg-secondary)] border rounded-[6px]',
            'focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400',
            'transition-all duration-150',
            isOverLimit
              ? 'border-red-400'
              : 'border-[var(--border)]',
            isAbsent && 'bg-red-50 dark:bg-red-950/20 opacity-60 cursor-not-allowed'
          )}
          placeholder="—"
        />
      </td>

      {/* Grade Badge */}
      <td className="py-3 px-6">
        {isAbsent ? (
          <Badge variant="absent">Absent</Badge>
        ) : gradeInfo ? (
          <Badge variant={gradeInfo.variant}>{gradeInfo.grade}</Badge>
        ) : (
          <span className="text-[var(--text-disabled)] text-sm">—</span>
        )}
      </td>

      {/* Absent Checkbox */}
      <td className="py-3 px-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={isAbsent}
              onChange={(e) => onAbsentChange(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className={cn(
                'w-[18px] h-[18px] rounded-[4px] border-2 transition-all',
                'peer-checked:bg-red-500 peer-checked:border-red-500',
                'peer-focus:ring-2 peer-focus:ring-red-300',
                !isAbsent && 'border-[var(--border)] bg-[var(--surface)]'
              )}
            />
            {isAbsent && (
              <svg
                className="absolute top-0.5 left-0.5 w-3 h-3 text-white pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <span className="font-body text-xs text-[var(--text-muted)]">Absent</span>
        </label>
      </td>
    </tr>
  )
}

export default MarksEntryRow
