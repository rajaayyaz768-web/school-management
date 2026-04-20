'use client'

import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input, Button, Badge, ConfirmDialog } from '@/components/ui'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import {
  useStaffForAttendance,
  useMarkDailyAttendance
} from '@/features/staff-attendance/hooks/useStaffAttendance'
import { SingleAttendanceInput, StaffAttendanceStatus, StaffWithAttendance } from '@/features/staff-attendance/types/staff-attendance.types'
import { StaffAttendanceTable } from '@/features/staff-attendance/components/StaffAttendanceTable'

const today = new Date()
const todayFormatted = today.toLocaleDateString('en-PK', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export default function StaffAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0])
  const [pendingAttendances, setPendingAttendances] = useState<Record<string, SingleAttendanceInput>>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { data: campuses } = useCampuses()
  const campusId = campuses?.[0]?.id ?? ''

  const { data: staffList, isLoading } = useStaffForAttendance(campusId, selectedDate)
  const { mutate: submitAttendance, isPending } = useMarkDailyAttendance()

  const hasUnsaved = Object.keys(pendingAttendances).length > 0

  const handleStatusChange = (staffId: string, status: StaffAttendanceStatus) => {
    setPendingAttendances(prev => ({ ...prev, [staffId]: { ...prev[staffId], staffId, status } }))
  }

  const handleRemarksChange = (staffId: string, remarks: string) => {
    setPendingAttendances(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], staffId, status: prev[staffId]?.status ?? 'PRESENT', remarks },
    }))
  }

  const handleConfirmSubmit = () => {
    submitAttendance(
      {
        campusId,
        date: selectedDate,
        attendances: staffList?.map(({ staff, attendance }) => ({
          staffId: staff.id,
          status: pendingAttendances[staff.id]?.status ?? attendance?.status ?? 'PRESENT',
          remarks: pendingAttendances[staff.id]?.remarks ?? attendance?.remarks ?? undefined,
        })) ?? [],
      },
      {
        onSuccess: () => {
          setShowConfirmDialog(false)
          setPendingAttendances({})
        },
      }
    )
  }

  // ── Live summary counts ────────────────────────────────────────────────────
  const summaryCounts = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, ON_LEAVE: 0, HALF_DAY: 0 }
    for (const row of staffList ?? []) {
      const s = (pendingAttendances[row.staff.id]?.status ?? row.attendance?.status ?? 'PRESENT') as StaffAttendanceStatus
      if (s in counts) counts[s as keyof typeof counts]++
    }
    return counts
  }, [staffList, pendingAttendances])

  // ── Group staff by designation ────────────────────────────────────────────
  const byDesignation = useMemo(() => {
    const groups: Record<string, StaffWithAttendance[]> = {}
    for (const row of staffList ?? []) {
      const key = row.staff.designation || 'Other'
      if (!groups[key]) groups[key] = []
      groups[key].push(row)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [staffList])

  return (
    <div className="flex flex-col gap-6 pb-24 sm:pb-6">
      <PageHeader
        title="Staff Attendance"
        subtitle={todayFormatted}
        breadcrumb={[
          { label: 'Home', href: '/admin' },
          { label: 'Attendance', href: '/admin/attendance' },
          { label: 'Staff' },
        ]}
      />

      {/* Date picker */}
      <div className="max-w-xs">
        <Input
          label="Date"
          type="date"
          value={selectedDate}
          onChange={(e) => { setSelectedDate(e.target.value); setPendingAttendances({}) }}
        />
      </div>

      {/* Live four-badge summary row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2">
          <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">Present</span>
          <Badge variant="success">{summaryCounts.PRESENT}</Badge>
        </div>
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2">
          <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">Absent</span>
          <Badge variant="danger">{summaryCounts.ABSENT}</Badge>
        </div>
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2">
          <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">On Leave</span>
          <Badge variant="info">{summaryCounts.ON_LEAVE}</Badge>
        </div>
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2">
          <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">Half Day</span>
          <Badge variant="warning">{summaryCounts.HALF_DAY}</Badge>
        </div>
      </div>

      {/* Staff list grouped by designation */}
      {byDesignation.length > 0 && !isLoading ? (
        <div className="space-y-8">
          {byDesignation.map(([designation, group]) => (
            <div key={designation}>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {designation}
                </p>
                <Badge variant="neutral">{group.length}</Badge>
              </div>
              <StaffAttendanceTable
                staffList={group}
                isLoading={false}
                pendingAttendances={pendingAttendances}
                onStatusChange={handleStatusChange}
                onRemarksChange={handleRemarksChange}
              />
            </div>
          ))}
        </div>
      ) : (
        <StaffAttendanceTable
          staffList={staffList ?? []}
          isLoading={isLoading}
          pendingAttendances={pendingAttendances}
          onStatusChange={handleStatusChange}
          onRemarksChange={handleRemarksChange}
        />
      )}

      {/* Desktop save button */}
      <div className="hidden sm:flex justify-end">
        <div className="relative inline-flex">
          {hasUnsaved && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 z-10" />
          )}
          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={!campusId || isPending}
            loading={isPending}
            variant="primary"
          >
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Mobile sticky save button */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] p-4 z-40">
        <div className="relative inline-flex w-full">
          {hasUnsaved && (
            <span className="absolute -top-1 right-0 w-2.5 h-2.5 rounded-full bg-amber-400 z-10" />
          )}
          <Button
            className="w-full"
            onClick={() => setShowConfirmDialog(true)}
            disabled={!campusId || isPending}
            loading={isPending}
            variant="primary"
          >
            Save Attendance
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Attendance"
        message="Save attendance for all staff for this date? This will overwrite any existing records."
      />
    </div>
  )
}
