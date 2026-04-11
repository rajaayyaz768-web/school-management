export interface StudentInfo {
  id: string
  firstName: string
  lastName: string
  rollNumber: string | null
  sectionName: string | null
  gradeName: string | null
  programName: string | null
  campusName: string | null
}

export interface TimetableSlot {
  id: string
  slotNumber: number
  startTime: string
  endTime: string
  slotType: string
  subjectName: string | null
  teacherName: string | null
}

export interface SubjectAttendance {
  subjectName: string
  presentDays: number
  totalDays: number
  pct: number
}

export interface AttendanceSummary {
  presentDays: number
  absentDays: number
  totalDays: number
  attendancePct: number
  bySubject: SubjectAttendance[]
}

export interface ExamResult {
  id: string
  subjectName: string
  examTypeName: string
  date: string
  obtainedMarks: number
  totalMarks: number
  grade: string
  isAbsent: boolean
}

export interface Announcement {
  id: string
  title: string
  content: string
  audience: string
  publishedAt: string
}

export interface StudentDashboardData {
  student: StudentInfo | null
  todayTimetable: TimetableSlot[]
  attendanceSummary: AttendanceSummary
  recentResults: ExamResult[]
  announcements: Announcement[]
}
