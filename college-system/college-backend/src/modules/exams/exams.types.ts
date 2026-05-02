export interface CreateExamTypeDto {
  name: string
  campusId: string
}

export interface ExamTypeResponse {
  id: string
  name: string
  campusId: string
  createdAt: string
}

export interface CreateExamDto {
  examTypeId: string
  sectionId: string
  subjectId: string
  date: string
  startTime: string
  durationMins: number
  totalMarks: number
  venue?: string
  supervisorStaffId?: string
}

export interface UpdateExamDto {
  date?: string
  startTime?: string
  durationMins?: number
  totalMarks?: number
  venue?: string
  status?: string
  supervisorStaffId?: string
}

export interface CreateExamScheduleDto {
  examTypeId: string
  campusId: string
  academicYear: string
  date: string
  startTime: string
  sections: Array<{
    sectionId: string
    subjects: Array<{
      subjectId: string
      totalMarks: number
      durationMins: number
    }>
  }>
}

export interface ExamScheduleResponse {
  id: string
  examTypeId: string
  campusId: string
  academicYear: string
  date: string
  startTime: string
  status: string
  createdAt: string
  examType: { id: string; name: string }
  examCount: number
}

export interface CreateClassTestDto {
  sectionId: string
  subjectId: string
  date: string
  startTime: string
  durationMins: number
  totalMarks: number
  venue?: string
}

export interface ExamResponse {
  id: string
  examTypeId: string
  sectionId: string
  subjectId: string
  date: string
  startTime: string
  durationMins: number
  totalMarks: number
  venue: string | null
  status: string
  supervisorStaffId: string | null
  isClassTest: boolean
  examScheduleId: string | null
  createdByStaffId: string | null
  createdAt: string
  updatedAt: string
  examType: { id: string; name: string }
  section: { id: string; name: string }
  subject: { id: string; name: string; code: string }
}

export interface EnterResultDto {
  examId: string
  studentId: string
  obtainedMarks?: number
  isAbsent: boolean
  remarks?: string
}

export interface BulkEnterResultsDto {
  results: EnterResultDto[]
}

export interface ExamResultResponse {
  id: string
  examId: string
  studentId: string
  obtainedMarks: number | null
  isAbsent: boolean
  remarks: string | null
  gradedById: string | null
  createdAt: string
  updatedAt: string
  student: { id: string; firstName: string; lastName: string; rollNumber: string | null }
  grade: string | null
  percentage: number | null
}
