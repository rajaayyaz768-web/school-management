export interface AdminDashboardStats {
  totalStudents: number
  totalStaff: number
  pendingFeeCount: number
  totalSections: number
}

export interface AdminStaffAttendance {
  present: number
  absent: number
  onLeave: number
  halfDay: number
}

export interface AdminFeeStats {
  pendingCount: number
  pendingAmount: number
  overdueCount: number
}

export interface AdminUpcomingExam {
  id: string
  date: string
  startTime: string
  status: string
  sectionName: string
  subjectName: string
  examTypeName: string
}

export interface AdminRecentPayment {
  id: string
  amountPaid: number
  paidAt: string
  receiptNumber: string | null
  studentName: string
  rollNumber: string | null
}

export interface AdminDashboardData {
  stats: AdminDashboardStats
  staffAttendance: AdminStaffAttendance
  feeStats: AdminFeeStats
  upcomingExams: AdminUpcomingExam[]
  recentPayments: AdminRecentPayment[]
}
