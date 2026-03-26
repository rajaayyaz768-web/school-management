'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select, Input, Button, ConfirmDialog } from '@/components/ui'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import {
  useStaffForAttendance,
  useDailyReport,
  useMarkDailyAttendance
} from '@/features/staff-attendance/hooks/useStaffAttendance'
import { SingleAttendanceInput, StaffAttendanceStatus } from '@/features/staff-attendance/types/staff-attendance.types'
import { AttendanceSummaryCard } from '@/features/staff-attendance/components/AttendanceSummaryCard'
import { StaffAttendanceTable } from '@/features/staff-attendance/components/StaffAttendanceTable'

export default function StaffAttendancePage() {
  const [selectedCampusId, setSelectedCampusId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [pendingAttendances, setPendingAttendances] = useState<Record<string, SingleAttendanceInput>>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { data: campuses } = useCampuses()
  const { data: staffList, isLoading } = useStaffForAttendance(selectedCampusId, selectedDate)
  const { data: report } = useDailyReport(selectedCampusId, selectedDate)
  const { mutate: submitAttendance, isPending } = useMarkDailyAttendance()

  const handleStatusChange = (staffId: string, status: StaffAttendanceStatus) => {
    setPendingAttendances(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], staffId, status }
    }))
  }

  const handleRemarksChange = (staffId: string, remarks: string) => {
    setPendingAttendances(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], staffId: staffId, status: prev[staffId]?.status ?? 'PRESENT', remarks }
    }))
  }

  const handleConfirmSubmit = () => {
    submitAttendance(
      {
        campusId: selectedCampusId,
        date: selectedDate,
        attendances: staffList?.map(({ staff, attendance }) => ({
          staffId: staff.id,
          status: pendingAttendances[staff.id]?.status ?? attendance?.status ?? 'PRESENT',
          remarks: pendingAttendances[staff.id]?.remarks ?? attendance?.remarks ?? undefined,
        })) ?? []
      },
      {
        onSuccess: () => {
          setShowConfirmDialog(false)
          setPendingAttendances({})
        }
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff Attendance"
        breadcrumb={[
          { label: 'Home', href: '/admin' },
          { label: 'Attendance', href: '/admin/attendance' },
          { label: 'Staff' }
        ]}
      />
      <div>
        <p className="text-gray-500 mb-6">Mark daily staff attendance for your campus</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 align-top items-end mb-4">
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium mb-1">Campus</label>
          <Select
            value={selectedCampusId ?? ''}
            onChange={(val) => {
              // Wait, does Select component 'onChange' pass the value string or Event? In StaffAttendanceTable I used e.target.value. Let's assume standard event if it isn't specified, wait, the instructions say `onChange sets selectedCampusId`. 
              // Wait, their codebase might use `onChange={(val) =>}` for custom Select or `(e) =>` for standard. 
              // "onChange sets selectedCampusId and resets pendingAttendances to {}"
              const value = typeof val === 'string' ? val : val.target.value;
              setSelectedCampusId(value);
              setPendingAttendances({});
            }}
            options={campuses?.map((c: any) => ({ value: c.id, label: c.name })) || []}
            placeholder="Select Campus..."
          />
        </div>
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            type="date"
            value={selectedDate ?? ''}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              setPendingAttendances({})
            }}
          />
        </div>
        <div className="ml-auto">
          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={!selectedCampusId || isPending}
            loading={isPending}
            variant="primary"
          >
            Save Attendance
          </Button>
        </div>
      </div>

      <AttendanceSummaryCard
        totalStaff={report?.totalStaff ?? 0}
        present={report?.present ?? 0}
        absent={report?.absent ?? 0}
        onLeave={report?.onLeave ?? 0}
        halfDay={report?.halfDay ?? 0}
        isLoading={isLoading}
      />

      <div className="mt-4">
        <StaffAttendanceTable
          staffList={staffList || []}
          isLoading={isLoading}
          pendingAttendances={pendingAttendances}
          onStatusChange={handleStatusChange}
          onRemarksChange={handleRemarksChange}
        />
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
