import { Avatar, Badge, Select, Input, Table } from '@/components/ui'
import { StudentWithAttendance, AttendanceStatus, SingleStudentAttendanceInput } from '../types/student-attendance.types'
import { TableColumn } from '@/components/ui/Table'

interface Props {
  studentList: StudentWithAttendance[]
  isLoading: boolean
  pendingAttendances: Record<string, SingleStudentAttendanceInput>
  onStatusChange: (studentId: string, status: AttendanceStatus) => void
  onRemarksChange: (studentId: string, remarks: string) => void
}

export function StudentAttendanceTable({
  studentList,
  isLoading,
  pendingAttendances,
  onStatusChange,
  onRemarksChange
}: Props) {
  const columns: TableColumn<StudentWithAttendance>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (row) => {
        const { firstName, lastName, photoUrl, rollNumber } = row.student
        return (
          <div className="flex items-center gap-3">
            <Avatar src={photoUrl || undefined} name={`${firstName} ${lastName}`} />
            <div>
              <div className="font-medium">{`${firstName} ${lastName}`}</div>
              {rollNumber && <div className="text-xs text-gray-500 mt-0.5">{rollNumber}</div>}
            </div>
          </div>
        )
      }
    },
    {
      key: 'rollNo',
      header: 'Roll No',
      render: (row) => row.student.rollNumber || <Badge variant="warning">Unassigned</Badge>
    },
    {
      key: 'currentStatus',
      header: 'Current Status',
      render: (row) => {
        const status = row.attendance?.status
        if (!status) {
          return <Badge variant="neutral">Not Marked</Badge>
        }
        
        const variants: Record<AttendanceStatus, any> = {
          PRESENT: 'success',
          ABSENT: 'danger',
          LATE: 'warning',
          LEAVE: 'info'
        }
        
        const labels: Record<AttendanceStatus, string> = {
          PRESENT: 'Present',
          ABSENT: 'Absent',
          LATE: 'Late',
          LEAVE: 'Leave'
        }
        
        return <Badge variant={variants[status]}>{labels[status]}</Badge>
      }
    },
    {
      key: 'markAs',
      header: 'Mark As',
      render: (row) => {
        const studentId = row.student.id
        const value = pendingAttendances[studentId]?.status ?? row.attendance?.status ?? 'PRESENT'
        
        return (
          <Select
            value={value}
            onChange={(e) => onStatusChange(studentId, e.target.value as AttendanceStatus)}
            options={[
              { value: 'PRESENT', label: 'Present' },
              { value: 'ABSENT', label: 'Absent' },
              { value: 'LATE', label: 'Late' },
              { value: 'LEAVE', label: 'Leave' }
            ]}
          />
        )
      }
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (row) => {
        const studentId = row.student.id
        const value = pendingAttendances[studentId]?.remarks ?? row.attendance?.remarks ?? ''
        
        return (
          <Input
            value={value}
            onChange={(e) => onRemarksChange(studentId, e.target.value)}
            placeholder="Optional remarks"
          />
        )
      }
    }
  ]

  // For 10 skeleton rows, the Table component automatically uses its own Skeleton variant, 
  // but if we need exactly 10, passing loading={isLoading} handles it internally based on the Table implementation.

  return (
    <Table
      columns={columns}
      data={studentList || []}
      loading={isLoading}
      emptyMessage="No students found in this section."
    />
  )
}
