export type StaffAttendanceStatus = 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | 'HALF_DAY' | 'HOLIDAY'

export interface StaffBasicInfo {
  id: string
  firstName: string
  lastName: string
  staffCode: string
  designation: string | null
  photoUrl: string | null
}

export interface StaffAttendanceRecord {
  id: string
  staffId: string
  campusId: string
  date: string
  status: StaffAttendanceStatus
  checkIn: string | null
  checkOut: string | null
  remarks: string | null
  markedById: string | null
  createdAt: string
  staff: StaffBasicInfo
}

export interface StaffWithAttendance {
  staff: StaffBasicInfo
  attendance: StaffAttendanceRecord | null
}

export interface SingleAttendanceInput {
  staffId: string
  status: StaffAttendanceStatus
  checkIn?: string
  checkOut?: string
  remarks?: string
}

export interface MarkAttendanceInput {
  campusId: string
  date: string
  attendances: SingleAttendanceInput[]
}

export interface DailyAttendanceReport {
  date: string
  campusId: string
  totalStaff: number
  present: number
  absent: number
  onLeave: number
  halfDay: number
  holiday: number
  attendances: StaffAttendanceRecord[]
}
