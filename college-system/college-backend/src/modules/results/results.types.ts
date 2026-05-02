export interface SubjectResultSummary {
  subjectId: string
  subjectName: string
  subjectCode: string
  exams: Array<{
    examId: string
    examTypeName: string
    date: string
    totalMarks: number
    obtainedMarks: number | null
    isAbsent: boolean
    grade: string | null
    percentage: number | null
  }>
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

// ── Exam-specific Report Card ─────────────────────────────────────────────────
export interface ExamReportCardSubject {
  sn: number
  subjectId: string
  subjectName: string
  subjectCode: string
  maxMarks: number
  obtainedMarks: number | null
  isAbsent: boolean
  percentage: number | null
  grade: string | null
}

export interface ExamReportCard {
  student: {
    id: string
    firstName: string
    lastName: string
    rollNumber: string | null
    fatherName: string | null
    photoUrl: string | null
    sectionName: string
    gradeName: string
    programName: string
    campusName: string
    campusType: string
  }
  examType: { id: string; name: string }
  academicYear: string
  examDate: string | null
  subjects: ExamReportCardSubject[]
  totalMaxMarks: number
  totalObtainedMarks: number | null
  overallPercentage: number | null
  overallGrade: string | null
  generatedAt: string
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
  studentResults: Array<{
    studentId: string
    firstName: string
    lastName: string
    rollNumber: string | null
    obtainedMarks: number | null
    isAbsent: boolean
    grade: string | null
    percentage: number | null
  }>
  classAverage: number | null
  highestMarks: number | null
  lowestMarks: number | null
  passCount: number
  failCount: number
  absentCount: number
}
