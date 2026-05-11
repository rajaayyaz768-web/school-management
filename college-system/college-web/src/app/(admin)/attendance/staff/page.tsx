'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Building2, ChevronRight, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input, Button, Badge, ConfirmDialog } from '@/components/ui'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import type { CampusCardData } from '@/components/shared/selection/types'
import {
  useStaffForAttendance,
  useMarkDailyAttendance,
} from '@/features/staff-attendance/hooks/useStaffAttendance'
import {
  SingleAttendanceInput,
  StaffAttendanceStatus,
  StaffWithAttendance,
} from '@/features/staff-attendance/types/staff-attendance.types'
import { StaffAttendanceTable } from '@/features/staff-attendance/components/StaffAttendanceTable'

const todayStr = new Date().toISOString().split('T')[0]

const todayFormatted = new Date().toLocaleDateString('en-PK', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
})

export default function StaffAttendancePage() {
  const [selectedCampus, setSelectedCampus] = useState<CampusCardData | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [pendingAttendances, setPendingAttendances] = useState<Record<string, SingleAttendanceInput>>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const campusId = selectedCampus?.id ?? ''

  const { data: staffList, isLoading } = useStaffForAttendance(campusId, selectedDate)
  const { mutate: submitAttendance, isPending } = useMarkDailyAttendance()

  const hasUnsaved = Object.keys(pendingAttendances).length > 0

  // ── When campus changes, clear unsaved changes ─────────────────────────────
  function handleCampusSelect(campus: CampusCardData) {
    setSelectedCampus(campus)
    setPendingAttendances({})
  }

  function handleClearCampus() {
    setSelectedCampus(null)
    setPendingAttendances({})
  }

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

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — Campus selection (CampusSelectorCards auto-skips for single campus)
  // ─────────────────────────────────────────────────────────────────────────
  if (!selectedCampus) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Staff Attendance"
          subtitle={todayFormatted}
          breadcrumb={[{ label: 'Attendance' }, { label: 'Staff' }]}
        />

        <div>
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)]">
            <Building2 className="h-4 w-4 text-[var(--primary)]" />
            Select a campus to mark attendance
          </p>
          <CampusSelectorCards onSelect={handleCampusSelect} />
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2 — Attendance marking for the selected campus
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-[var(--space-6)] pb-24 sm:pb-6">
      <PageHeader
        title="Staff Attendance"
        subtitle={todayFormatted}
        breadcrumb={[{ label: 'Attendance' }, { label: 'Staff' }]}
        actions={
          /* Change campus button — only relevant for multi-campus users;
             for single-campus ADMIN this button still works but campus
             selector will auto-reselect them immediately */
          <button
            onClick={handleClearCampus}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          >
            <Building2 className="h-3.5 w-3.5" />
            Change campus
          </button>
        }
      />

      {/* Active campus strip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCampus.id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--primary)]/30 bg-[var(--primary)]/8 px-4 py-2.5"
        >
          <Building2 className="h-4 w-4 shrink-0 text-[var(--primary)]" />
          <span className="text-sm font-bold text-[var(--primary)]">{selectedCampus.name}</span>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--primary)]/50" />
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Staff Attendance
          </span>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Users className="h-3.5 w-3.5" />
            {selectedCampus.staff_count} staff
          </div>
        </motion.div>
      </AnimatePresence>

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
        {([
          { key: 'PRESENT',  label: 'Present',  variant: 'success'  },
          { key: 'ABSENT',   label: 'Absent',   variant: 'danger'   },
          { key: 'ON_LEAVE', label: 'On Leave', variant: 'info'     },
          { key: 'HALF_DAY', label: 'Half Day', variant: 'warning'  },
        ] as const).map(({ key, label, variant }) => (
          <div key={key} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
            <Badge variant={variant}>{summaryCounts[key]}</Badge>
          </div>
        ))}
      </div>

      {/* Staff list grouped by designation */}
      {byDesignation.length > 0 && !isLoading ? (
        <div className="space-y-8">
          {byDesignation.map(([designation, group]) => (
            <div key={designation}>
              <div className="flex items-center gap-[var(--space-3)] mb-3">
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
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 z-10" />
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface)] p-[var(--space-4)]">
        <div className="relative inline-flex w-full">
          {hasUnsaved && (
            <span className="absolute -top-1 right-0 h-2.5 w-2.5 rounded-full bg-amber-400 z-10" />
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
        message={`Save attendance for all staff at ${selectedCampus.name} for this date? This will overwrite any existing records.`}
      />
    </div>
  )
}
