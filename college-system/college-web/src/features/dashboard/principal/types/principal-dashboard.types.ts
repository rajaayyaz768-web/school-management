export interface DashboardStats {
  totalStudents: number
  totalStaff: number
  totalSections: number
  presentStaff: number
  totalStaffForCampus: number
  todayFeeCollection: number
}

export interface StaffAttendanceSummary {
  present: number
  absent: number
  onLeave: number
  halfDay: number
}

export interface AbsentStaffMember {
  id: string
  firstName: string
  lastName: string
  staffCode: string
  designation: string | null
}

export interface FeeSummary {
  totalPending: number
  collectedThisMonth: number
  defaulterCount: number
}

export interface RecentAnnouncement {
  id: string
  title: string
  audience: string
  publishedAt: string
}

export interface UpcomingExam {
  id: string
  date: string
  startTime: string
  status?: string
  sectionName: string
  subjectName: string
  examTypeName: string
}

export interface CampusBreakdown {
  campusId: string
  campusName: string
  totalStudents: number
  totalStaff: number
  totalSections: number
  presentStaff: number
  absentStaffCount: number
  todayFeeCollection: number
  collectedThisMonth: number
  totalPending: number
  defaulterCount: number
  defaulterAmount: number
}

export interface PrincipalDashboardData {
  stats: DashboardStats
  staffAttendanceSummary: StaffAttendanceSummary
  absentStaff: AbsentStaffMember[]
  feeSummary: FeeSummary
  recentAnnouncements: RecentAnnouncement[]
  upcomingExams: UpcomingExam[]
  campusBreakdown: CampusBreakdown[]
}
