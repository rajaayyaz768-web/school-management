'use client'

import { cn } from '@/lib/utils'

/**
 * AttendanceCard component for marking student attendance
 * @param student - Student info with rollNo and name
 * @param status - Current attendance status
 * @param onChange - Status change handler
 */
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | null

export interface AttendanceCardProps {
  student: {
    rollNo: string
    name: string
  }
  status: AttendanceStatus
  onChange: (status: AttendanceStatus) => void
  className?: string
}

const statusConfig = {
  present: {
    bg: 'bg-green-50 dark:bg-green-950/20 border-l-green-500',
    button: {
      active: 'bg-green-500 text-white border-green-500',
      inactive: 'border-green-200 text-green-600 dark:border-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30',
    },
  },
  absent: {
    bg: 'bg-red-50 dark:bg-red-950/20 border-l-red-500',
    button: {
      active: 'bg-red-500 text-white border-red-500',
      inactive: 'border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30',
    },
  },
  late: {
    bg: 'bg-amber-50 dark:bg-amber-950/20 border-l-amber-500',
    button: {
      active: 'bg-amber-500 text-white border-amber-500',
      inactive: 'border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30',
    },
  },
  leave: {
    bg: 'bg-blue-50 dark:bg-blue-950/20 border-l-blue-500',
    button: {
      active: 'bg-blue-500 text-white border-blue-500',
      inactive: 'border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30',
    },
  },
}

export function AttendanceCard({
  student,
  status,
  onChange,
  className,
}: AttendanceCardProps) {
  return (
    <div
      className={cn(
        'rounded-card-sm border p-4 transition-all duration-200',
        status
          ? cn('border-l-4', statusConfig[status].bg)
          : 'bg-[var(--surface)] border-[var(--border)]',
        className
      )}
    >
      {/* Roll Number */}
      <span className="inline-block font-mono text-[10px] bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-[6px] px-2 py-0.5 mb-2">
        {student.rollNo}
      </span>

      {/* Name */}
      <p className="font-body font-semibold text-sm text-[var(--text)] mb-3 truncate">
        {student.name}
      </p>

      {/* Status Buttons */}
      <div className="grid grid-cols-2 gap-1.5">
        {(['present', 'absent', 'late', 'leave'] as const).map((s) => (
          <button
            key={s}
            onClick={() => onChange(status === s ? null : s)}
            className={cn(
              'py-1.5 text-[10px] font-semibold font-body rounded-[6px] border transition-all duration-150',
              status === s
                ? statusConfig[s].button.active
                : statusConfig[s].button.inactive
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default AttendanceCard
