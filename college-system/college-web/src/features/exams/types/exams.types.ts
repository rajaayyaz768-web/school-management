export type ExamStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export interface ExamType {
  id: string
  name: string
  campusId: string
  createdAt: string
}

export interface Exam {
  id: string
  examTypeId: string
  sectionId: string
  subjectId: string
  date: string
  startTime: string
  durationMins: number
  totalMarks: number
  venue: string | null
  status: ExamStatus
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

export interface ExamSchedule {
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

export interface CreateExamScheduleInput {
  examTypeId: string
  campusId: string
  academicYear: string
  date: string
  startTime: string
  sections: Array<{
    sectionId: string
    subjects: Array<{ subjectId: string; totalMarks: number; durationMins: number }>
  }>
}

export interface CreateClassTestInput {
  sectionId: string
  subjectId: string
  date: string
  startTime: string
  durationMins: number
  totalMarks: number
  venue?: string
}

export interface ExamResult {
  id: string
  examId: string
  studentId: string
  obtainedMarks: number | null
  isAbsent: boolean
  remarks: string | null
  gradedById: string | null
  createdAt: string
  updatedAt: string
  student: {
    id: string
    firstName: string
    lastName: string
    rollNumber: string | null
  }
  grade: string | null
  percentage: number | null
}

export interface CreateExamInput {
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

export interface UpdateExamInput {
  date?: string
  startTime?: string
  durationMins?: number
  totalMarks?: number
  venue?: string
  status?: ExamStatus
  supervisorStaffId?: string
}

export interface EnterResultInput {
  examId: string
  studentId: string
  obtainedMarks?: number
  isAbsent: boolean
  remarks?: string
}

export interface BulkEnterResultsInput {
  results: EnterResultInput[]
}
