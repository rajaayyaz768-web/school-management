import { StaffAttendanceStatus } from '@prisma/client'

export interface SingleAttendanceInput {
  staffId: string
  status: StaffAttendanceStatus
  checkIn?: string
  checkOut?: string
  remarks?: string
}

export interface MarkStaffAttendanceDto {
  campusId: string
  date: string
  attendances: SingleAttendanceInput[]
}

export interface UpdateAttendanceDto {
  status?: StaffAttendanceStatus
  checkIn?: string
  checkOut?: string
  remarks?: string
}

export interface StaffBasicInfo {
  id: string
  firstName: string
  lastName: string
  staffCode: string
  designation: string | null
  photoUrl: string | null
}

export interface StaffAttendanceResponse {
  id: string
  staffId: string
  campusId: string
  date: string
  status: string
  checkIn: string | null
  checkOut: string | null
  remarks: string | null
  markedById: string | null
  createdAt: string
  staff: StaffBasicInfo
}

export interface StaffWithAttendance {
  staff: StaffBasicInfo
  attendance: StaffAttendanceResponse | null
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
  attendances: StaffAttendanceResponse[]
}

export interface StaffAttendanceSummaryItem {
  staffId: string
  presentDays: number
  totalDays: number
  percentage: number
}

export interface AbsentByCampusGroup {
  campusId: string
  campusName: string
  campusCode: string
  absentCount: number
  staff: StaffBasicInfo[]
}