export interface AttendanceReportFilters {
  campusId: string
  sectionId?: string
  studentId?: string
  startDate: string
  endDate: string
}

export interface FeeReportFilters {
  campusId: string
  academicYear: string
  status?: string
}

export interface ResultsReportFilters {
  sectionId: string
  examId?: string
  subjectId?: string
}

export type ReportFormat = 'json' | 'excel' | 'html'

export interface ReportResult {
  data?: any
  buffer?: Buffer
  html?: string
  filename: string
}
