export interface LinkedStudent {
  id: string
  firstName: string
  lastName: string
  rollNumber: string | null
  sectionName: string | null
  gradeName: string | null
  programName: string | null
  isPrimary: boolean
  campusId: string
  sectionId: string | null
}

export interface PrimaryStudent extends LinkedStudent {
  attendancePct: number
}

export interface AttendanceDayEntry {
  date: string
  status: string | null
}

export interface AttendanceSummary {
  presentDays: number
  absentDays: number
  totalDays: number
  attendancePct: number
  sevenDayStrip: AttendanceDayEntry[]
}

export interface PendingFee {
  id: string
  academicYear: string
  amountDue: number
  amountPaid: number
  balance: number
  status: string
  dueDate: string
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
  remarks: string | null
}

export interface Announcement {
  id: string
  title: string
  content: string
  audience: string
  publishedAt: string
}

export interface ParentDashboardData {
  linkedStudents: LinkedStudent[]
  primaryStudent: PrimaryStudent | null
  attendanceSummary: AttendanceSummary | null
  feeStatus: PendingFee[]
  recentResults: ExamResult[]
  announcements: Announcement[]
}
