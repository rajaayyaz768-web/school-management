import { AttendanceStatus } from '@prisma/client'

export interface SingleStudentAttendanceInput {
  studentId: string
  status: AttendanceStatus
  remarks?: string
}

export interface MarkStudentAttendanceDto {
  sectionId: string
  subjectId: string
  date: string
  attendances: SingleStudentAttendanceInput[]
}

export interface UpdateStudentAttendanceDto {
  status?: AttendanceStatus
  remarks?: string
}

export interface StudentBasicInfo {
  id: string
  firstName: string
  lastName: string
  rollNumber: string | null
  photoUrl: string | null
}

export interface SubjectBasicInfo {
  id: string
  name: string
  code: string
}

export interface SectionBasicInfo {
  id: string
  name: string
}

export interface StudentAttendanceResponse {
  id: string
  studentId: string
  subjectId: string
  sectionId: string
  date: string
  status: string
  remarks: string | null
  markedById: string
  createdAt: string
  student: StudentBasicInfo
  subject: SubjectBasicInfo
  section: SectionBasicInfo
}

export interface StudentWithAttendance {
  student: StudentBasicInfo
  attendance: StudentAttendanceResponse | null
}

export interface SectionAttendanceReport {
  date: string
  sectionId: string
  subjectId: string
  totalStudents: number
  present: number
  absent: number
  late: number
  onLeave: number
  attendances: StudentAttendanceResponse[]
}

export interface StudentAttendanceSummary {
  studentId: string
  student: StudentBasicInfo
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  leaveDays: number
  attendancePercentage: number
}