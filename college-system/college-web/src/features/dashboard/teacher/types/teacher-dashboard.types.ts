export interface TodayScheduleSlot {
  id: string
  slotNumber: number
  startTime: string
  endTime: string
  slotType: string
  sectionName: string
  subjectName: string | null
}

export interface TeacherSection {
  id: string
  name: string
  gradeName: string
  programName: string
  studentCount: number
}

export interface TeacherUpcomingExam {
  id: string
  date: string
  startTime: string
  status: string
  sectionName: string
  subjectName: string
  examTypeName: string
}

export interface RecentAttendanceSession {
  date: string
  sectionId: string
  sectionName: string
  subjectName: string
}

export interface TeacherDashboardData {
  todaySchedule: TodayScheduleSlot[]
  mySections: TeacherSection[]
  upcomingExams: TeacherUpcomingExam[]
  recentAttendance: RecentAttendanceSession[]
}
