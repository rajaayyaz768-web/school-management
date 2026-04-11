export interface ExamResultEntry {
  examId: string
  examTypeName: string
  date: string
  totalMarks: number
  obtainedMarks: number | null
  isAbsent: boolean
  grade: string | null
  percentage: number | null
}

export interface SubjectResultSummary {
  subjectId: string
  subjectName: string
  subjectCode: string
  exams: ExamResultEntry[]
  overallPercentage: number | null
  overallGrade: string | null
}

export interface StudentReportCard {
  studentId: string
  firstName: string
  lastName: string
  rollNumber: string | null
  sectionName: string
  programName: string
  gradeName: string
  campusName: string
  academicYear: string
  subjects: SubjectResultSummary[]
  overallPercentage: number | null
  overallGrade: string | null
  totalExams: number
  passedExams: number
}

export interface SectionStudentResult {
  studentId: string
  firstName: string
  lastName: string
  rollNumber: string | null
  obtainedMarks: number | null
  isAbsent: boolean
  grade: string | null
  percentage: number | null
}

export interface SectionResultSummary {
  sectionId: string
  sectionName: string
  subjectId: string
  subjectName: string
  examId: string
  examTypeName: string
  date: string
  totalMarks: number
  studentResults: SectionStudentResult[]
  classAverage: number | null
  highestMarks: number | null
  lowestMarks: number | null
  passCount: number
  failCount: number
  absentCount: number
}

export interface TopStudent {
  studentId: string
  firstName: string
  lastName: string
  rollNumber: string | null
  overallPercentage: number
  overallGrade: string
}
