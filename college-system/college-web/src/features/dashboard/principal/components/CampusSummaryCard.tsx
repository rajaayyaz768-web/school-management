'use client'

import { Users, GraduationCap, CreditCard, UserX, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useCampusStore } from '@/store/campusStore'
import type { CampusBreakdown } from '../types/principal-dashboard.types'

export function CampusSummaryCard({ campus }: { campus: CampusBreakdown }) {
  const { activeCampusId, setActiveCampusId } = useCampusStore()
  const isActive = activeCampusId === campus.campusId

  const attendancePct =
    campus.totalStaff > 0
      ? Math.round((campus.presentStaff / campus.totalStaff) * 100)
      : 0

  return (
    <button
      onClick={() => setActiveCampusId(isActive ? null : campus.campusId)}
      className={cn(
        'w-full text-left rounded-[var(--radius-lg)] border p-3 sm:p-5 transition-all duration-200',
        isActive
          ? 'border-[var(--gold)] bg-[var(--gold)]/8 shadow-[0_0_20px_rgba(212,168,67,0.15)]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/4'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3
          className={cn(
            'text-xs sm:text-sm font-bold tracking-wide truncate',
            isActive ? 'text-[var(--gold)]' : 'text-[var(--text)]'
          )}
        >
          {campus.campusName}
        </h3>
        {campus.absentStaffCount > 0 && (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-[9px] sm:text-[10px] font-semibold text-red-400 shrink-0 ml-1.5">
            <UserX className="w-2.5 h-2.5" />
            <span className="hidden sm:inline">{campus.absentStaffCount} absent</span>
            <span className="sm:hidden">{campus.absentStaffCount}</span>
          </span>
        )}
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[var(--text-muted)]">
            <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-[8px] sm:text-[10px] font-medium uppercase tracking-widest">Students</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-[var(--text)]">{campus.totalStudents}</p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[var(--text-muted)]">
            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-[8px] sm:text-[10px] font-medium uppercase tracking-widest">Staff</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-[var(--text)]">
            <span
              className={cn(
                'text-xs sm:text-sm font-semibold',
                attendancePct >= 80 ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {campus.presentStaff}
            </span>
            <span className="text-[var(--text-muted)]">/{campus.totalStaff}</span>
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[var(--text-muted)]">
            <CreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-[8px] sm:text-[10px] font-medium uppercase tracking-widest">Fees</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--gold)]">
            PKR {campus.todayFeeCollection.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[8px] sm:text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
            Sections
          </span>
          <p className="text-sm sm:text-lg font-bold text-[var(--text)]">{campus.totalSections}</p>
        </div>
      </div>

      {/* Fee breakdown — desktop only */}
      <div className="hidden sm:grid mt-3 pt-3 border-t border-[var(--border)] grid-cols-3 gap-2">
        <div className="space-y-0.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">This Month</span>
          <p className="text-xs font-bold text-emerald-400">
            PKR {campus.collectedThisMonth.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Pending</span>
          <p className="text-xs font-bold text-amber-400">
            PKR {campus.totalPending.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Defaulters</span>
          <Link
            href={`/principal/fees/defaulters?campusId=${campus.campusId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 w-fit"
          >
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className={cn(
              'text-xs font-bold',
              campus.defaulterCount > 0 ? 'text-red-400 underline underline-offset-2' : 'text-[var(--text-muted)]'
            )}>
              {campus.defaulterCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile compact fee row */}
      <div className="sm:hidden mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-[9px] text-[var(--text-muted)]">
          Pending: <span className="text-amber-400 font-semibold">
            PKR {campus.totalPending >= 1000
              ? `${(campus.totalPending / 1000).toFixed(0)}K`
              : campus.totalPending.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
          </span>
        </span>
        {campus.defaulterCount > 0 && (
          <span className="flex items-center gap-0.5 text-[9px] text-red-400">
            <AlertTriangle className="w-2.5 h-2.5" />
            {campus.defaulterCount} defaulters
          </span>
        )}
      </div>

      {/* Attendance bar */}
      <div className="mt-2 sm:mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8px] sm:text-[10px] text-[var(--text-muted)]">Staff Attendance</span>
          <span
            className={cn(
              'text-[8px] sm:text-[10px] font-bold',
              attendancePct >= 80 ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {attendancePct}%
          </span>
        </div>
        <div className="h-1 sm:h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              attendancePct >= 80 ? 'bg-emerald-500' : 'bg-red-500'
            )}
            style={{ width: `${attendancePct}%` }}
          />
        </div>
      </div>

      {isActive && (
        <p className="mt-2 sm:mt-3 text-[9px] sm:text-[10px] text-[var(--gold)] font-medium text-center">
          Viewing this campus — tap to reset
        </p>
      )}
    </button>
  )
}
