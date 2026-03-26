import { Avatar, Badge, Select, Input, Table } from '@/components/ui'
import { StaffWithAttendance, StaffAttendanceStatus, SingleAttendanceInput } from '../types/staff-attendance.types'
import { TableColumn } from '@/components/ui/Table'

interface Props {
  staffList: StaffWithAttendance[]
  isLoading: boolean
  pendingAttendances: Record<string, SingleAttendanceInput>
  onStatusChange: (staffId: string, status: StaffAttendanceStatus) => void
  onRemarksChange: (staffId: string, remarks: string) => void
}

export function StaffAttendanceTable({
  staffList,
  isLoading,
  pendingAttendances,
  onStatusChange,
  onRemarksChange
}: Props) {
  const columns: TableColumn<StaffWithAttendance>[] = [
    {
      key: 'staff',
      header: 'Staff',
      render: (row) => {
        const { firstName, lastName, photoUrl, staffCode } = row.staff
        const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <Avatar src={photoUrl || undefined} name={`${firstName} ${lastName}`} />
            <div>
              <div className="font-medium">{`${firstName} ${lastName}`}</div>
              <div className="text-xs text-gray-500 mt-0.5">{staffCode}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (row) => row.staff.designation || '—'
    },
    {
      key: 'currentStatus',
      header: 'Current Status',
      render: (row) => {
        const status = row.attendance?.status
        if (!status) {
          return <Badge variant="warning">Not Marked</Badge>
        }
        
        const variants: Record<StaffAttendanceStatus, any> = {
          PRESENT: 'success',
          ABSENT: 'danger',
          ON_LEAVE: 'info',
          HALF_DAY: 'warning',
          HOLIDAY: 'default'
        }
        
        const labels: Record<StaffAttendanceStatus, string> = {
          PRESENT: 'Present',
          ABSENT: 'Absent',
          ON_LEAVE: 'On Leave',
          HALF_DAY: 'Half Day',
          HOLIDAY: 'Holiday'
        }
        
        return <Badge variant={variants[status]}>{labels[status]}</Badge>
      }
    },
    {
      key: 'markAs',
      header: 'Mark As',
      render: (row) => {
        const staffId = row.staff.id
        const value = pendingAttendances[staffId]?.status ?? row.attendance?.status ?? 'PRESENT'
        
        return (
          <Select
            value={value}
            onChange={(e) => onStatusChange(staffId, e.target.value as StaffAttendanceStatus)}
            options={[
              { value: 'PRESENT', label: 'Present' },
              { value: 'ABSENT', label: 'Absent' },
              { value: 'ON_LEAVE', label: 'On Leave' },
              { value: 'HALF_DAY', label: 'Half Day' },
              { value: 'HOLIDAY', label: 'Holiday' }
            ]}
          />
        )
      }
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (row) => {
        const staffId = row.staff.id
        const value = pendingAttendances[staffId]?.remarks ?? row.attendance?.remarks ?? ''
        
        return (
          <Input
            value={value}
            onChange={(e) => onRemarksChange(staffId, e.target.value)}
            placeholder="Optional remarks"
          />
        )
      }
    }
  ]

  return (
    <Table
      columns={columns}
      data={staffList || []}
      loading={isLoading}
      emptyMessage="No staff found for this campus."
    />
  )
}
