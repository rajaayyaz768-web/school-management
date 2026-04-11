export interface AttendanceReportFilters {
  campusId?: string
  sectionId?: string
  startDate: string
  endDate: string
}

export interface FeeReportFilters {
  campusId?: string
  academicYear: string
  status?: string
}

export interface ResultsReportFilters {
  sectionId: string
  subjectId?: string
  examId?: string
}
