import { Role } from '@prisma/client'
import prisma from '../../config/database'
import { StudentReportCard, SectionResultSummary, SubjectResultSummary, ExamReportCard } from './results.types'
import { assertStudentCampus, assertSectionCampus } from '../../utils/campusGuard'

interface RequestUser { id: string; role: Role; campusId: string | null }

function calculateGrade(obtained: number, total: number): { grade: string; percentage: number } {
  const percentage = (obtained / total) * 100
  let grade = 'F'
  if (percentage >= 90) grade = 'A+'
  else if (percentage >= 80) grade = 'A'
  else if (percentage >= 70) grade = 'B'
  else if (percentage >= 60) grade = 'C'
  else if (percentage >= 50) grade = 'D'
  return { grade, percentage: Math.round(percentage * 100) / 100 }
}

// ─────────────────────────────────────────────────────────────────────────────
// getStudentReportCard
// ─────────────────────────────────────────────────────────────────────────────
export const getStudentReportCard = async (
  studentId: string,
  academicYear?: string,
  user?: RequestUser
): Promise<StudentReportCard> => {
  if (user) await assertStudentCampus(studentId, user)
  // Fetch student with full hierarchy
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      section: {
        include: {
          grade: {
            include: {
              program: {
                include: { campus: true },
              },
            },
          },
        },
      },
      campus: true,
    },
  })

  if (!student) {
    const error = new Error('Student not found') as any
    error.status = 404
    throw error
  }

  // Fetch all exam results for this student with exam details
  const rawResults = await prisma.examResult.findMany({
    where: { studentId },
    include: {
      exam: {
        include: {
          examType: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true, code: true } },
        },
      },
    },
    orderBy: { exam: { date: 'asc' } },
  })

  // Group by subjectId
  const subjectMap = new Map<string, typeof rawResults>()
  for (const r of rawResults) {
    const sid = r.exam.subjectId
    if (!subjectMap.has(sid)) subjectMap.set(sid, [])
    subjectMap.get(sid)!.push(r)
  }

  // Build SubjectResultSummary list
  const subjects: SubjectResultSummary[] = []
  let totalPassedExams = 0
  let totalExams = 0
  const subjectOverallPercentages: number[] = []

  for (const [, results] of subjectMap) {
    const firstExam = results[0].exam
    const subjectId = firstExam.subjectId
    const subjectName = firstExam.subject.name
    const subjectCode = firstExam.subject.code

    const examEntries = results.map((r) => {
      totalExams++

      let grade: string | null = null
      let percentage: number | null = null

      if (!r.isAbsent && r.obtainedMarks !== null && r.obtainedMarks !== undefined) {
        const calc = calculateGrade(r.obtainedMarks, r.exam.totalMarks)
        grade = calc.grade
        percentage = calc.percentage
        if (calc.percentage >= 50) totalPassedExams++
      }

      return {
        examId: r.examId,
        examTypeName: r.exam.examType.name,
        date: r.exam.date instanceof Date
          ? r.exam.date.toISOString().split('T')[0]
          : r.exam.date,
        totalMarks: r.exam.totalMarks,
        obtainedMarks: r.obtainedMarks ?? null,
        isAbsent: r.isAbsent,
        grade,
        percentage,
      }
    })

    // Subject overall: average of non-absent percentages
    const gradedEntries = examEntries.filter(
      (e) => !e.isAbsent && e.percentage !== null
    )
    let overallPercentage: number | null = null
    let overallGrade: string | null = null

    if (gradedEntries.length > 0) {
      const avg =
        gradedEntries.reduce((sum, e) => sum + (e.percentage as number), 0) /
        gradedEntries.length
      overallPercentage = Math.round(avg * 100) / 100
      overallGrade = calculateGrade(overallPercentage, 100).grade
      subjectOverallPercentages.push(overallPercentage)
    }

    subjects.push({
      subjectId,
      subjectName,
      subjectCode,
      exams: examEntries,
      overallPercentage,
      overallGrade,
    })
  }

  // Student overall: average of subject overall percentages
  let overallPercentage: number | null = null
  let overallGrade: string | null = null

  if (subjectOverallPercentages.length > 0) {
    const avg =
      subjectOverallPercentages.reduce((sum, p) => sum + p, 0) /
      subjectOverallPercentages.length
    overallPercentage = Math.round(avg * 100) / 100
    overallGrade = calculateGrade(overallPercentage, 100).grade
  }

  return {
    studentId: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    rollNumber: student.rollNumber ?? null,
    sectionName: student.section?.name ?? '',
    programName: student.section?.grade?.program?.name ?? '',
    gradeName: student.section?.grade?.name ?? '',
    campusName: student.campus?.name ?? '',
    academicYear: academicYear ?? '',
    subjects,
    overallPercentage,
    overallGrade,
    totalExams,
    passedExams: totalPassedExams,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getSectionResults
// ─────────────────────────────────────────────────────────────────────────────
export const getSectionResults = async (
  sectionId: string,
  subjectId?: string,
  examId?: string,
  user?: RequestUser
): Promise<SectionResultSummary[]> => {
  if (user) await assertSectionCampus(sectionId, user)
  // Build exam query
  const examWhere: any = { sectionId }
  if (examId) examWhere.id = examId
  if (subjectId) examWhere.subjectId = subjectId

  const exams = await prisma.exam.findMany({
    where: examWhere,
    include: {
      examType: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      section: { select: { id: true, name: true } },
      results: {
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, rollNumber: true },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  })

  const summaries: SectionResultSummary[] = exams.map((exam) => {
    const studentResults = exam.results.map((r) => {
      let grade: string | null = null
      let percentage: number | null = null

      if (!r.isAbsent && r.obtainedMarks !== null && r.obtainedMarks !== undefined) {
        const calc = calculateGrade(r.obtainedMarks, exam.totalMarks)
        grade = calc.grade
        percentage = calc.percentage
      }

      return {
        studentId: r.studentId,
        firstName: r.student.firstName,
        lastName: r.student.lastName,
        rollNumber: r.student.rollNumber ?? null,
        obtainedMarks: r.obtainedMarks ?? null,
        isAbsent: r.isAbsent,
        grade,
        percentage,
      }
    })

    // Aggregate stats — only present students with marks
    const gradedResults = studentResults.filter(
      (r) => !r.isAbsent && r.obtainedMarks !== null
    )
    const absentCount = studentResults.filter((r) => r.isAbsent).length
    const passThreshold = exam.totalMarks * 0.5

    let classAverage: number | null = null
    let highestMarks: number | null = null
    let lowestMarks: number | null = null
    let passCount = 0
    let failCount = 0

    if (gradedResults.length > 0) {
      const marks = gradedResults.map((r) => r.obtainedMarks as number)
      classAverage =
        Math.round((marks.reduce((s, m) => s + m, 0) / marks.length) * 100) / 100
      highestMarks = Math.max(...marks)
      lowestMarks = Math.min(...marks)
      passCount = marks.filter((m) => m >= passThreshold).length
      failCount = marks.filter((m) => m < passThreshold).length
    }

    return {
      sectionId: exam.sectionId,
      sectionName: exam.section.name,
      subjectId: exam.subjectId,
      subjectName: exam.subject.name,
      examId: exam.id,
      examTypeName: exam.examType.name,
      date: exam.date instanceof Date
        ? exam.date.toISOString().split('T')[0]
        : exam.date,
      totalMarks: exam.totalMarks,
      studentResults,
      classAverage,
      highestMarks,
      lowestMarks,
      passCount,
      failCount,
      absentCount,
    }
  })

  return summaries
}

// ─────────────────────────────────────────────────────────────────────────────
// getTopStudents
// ─────────────────────────────────────────────────────────────────────────────
export const getTopStudents = async (
  sectionId: string,
  limit: number = 10,
  user?: RequestUser
): Promise<
  Array<{
    studentId: string
    firstName: string
    lastName: string
    rollNumber: string | null
    overallPercentage: number
    overallGrade: string
  }>
> => {
  if (user) await assertSectionCampus(sectionId, user)

  // All students in section
  const students = await prisma.studentProfile.findMany({
    where: { sectionId },
    select: { id: true, firstName: true, lastName: true, rollNumber: true },
  })

  // All exam results in this section (exams belong to this section)
  const allResults = await prisma.examResult.findMany({
    where: {
      exam: { sectionId },
    },
    include: {
      exam: { select: { totalMarks: true } },
    },
  })

  // Group results by studentId
  const resultsByStudent = new Map<string, typeof allResults>()
  for (const r of allResults) {
    if (!resultsByStudent.has(r.studentId)) resultsByStudent.set(r.studentId, [])
    resultsByStudent.get(r.studentId)!.push(r)
  }

  // Calculate per-student overall percentage
  const ranked: Array<{
    studentId: string
    firstName: string
    lastName: string
    rollNumber: string | null
    overallPercentage: number
    overallGrade: string
  }> = []

  for (const student of students) {
    const results = resultsByStudent.get(student.id) ?? []
    const gradedResults = results.filter(
      (r) => !r.isAbsent && r.obtainedMarks !== null && r.obtainedMarks !== undefined
    )

    if (gradedResults.length === 0) continue

    const percentages = gradedResults.map((r) =>
      calculateGrade(r.obtainedMarks as number, r.exam.totalMarks).percentage
    )
    const avg =
      Math.round(
        (percentages.reduce((sum, p) => sum + p, 0) / percentages.length) * 100
      ) / 100
    const overallGrade = calculateGrade(avg, 100).grade

    ranked.push({
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      rollNumber: student.rollNumber ?? null,
      overallPercentage: avg,
      overallGrade,
    })
  }

  // Sort descending and take top N
  return ranked
    .sort((a, b) => b.overallPercentage - a.overallPercentage)
    .slice(0, limit)
}

// ─────────────────────────────────────────────────────────────────────────────
// getStudentExamReportCard — single exam type, one row per subject
// ─────────────────────────────────────────────────────────────────────────────
export const getStudentExamReportCard = async (
  studentId: string,
  examTypeId: string,
  user?: RequestUser
): Promise<ExamReportCard> => {
  if (user) await assertStudentCampus(studentId, user)

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      section: {
        include: {
          grade: {
            include: {
              program: { include: { campus: true } },
            },
          },
        },
      },
      campus: true,
      parentLinks: {
        where: { isPrimary: true },
        include: { parent: { select: { firstName: true, lastName: true } } },
        take: 1,
      },
    },
  })

  if (!student) {
    const err = new Error('Student not found') as any
    err.status = 404
    throw err
  }

  const examType = await prisma.examType.findUnique({ where: { id: examTypeId } })
  if (!examType) {
    const err = new Error('Exam type not found') as any
    err.status = 404
    throw err
  }

  // Find all exams of this type in the student's section
  const sectionId = student.sectionId
  if (!sectionId) {
    const err = new Error('Student has no section assigned') as any
    err.status = 400
    throw err
  }

  const exams = await prisma.exam.findMany({
    where: { sectionId, examTypeId },
    include: { subject: { select: { id: true, name: true, code: true } } },
    orderBy: { date: 'asc' },
  })

  // Get results for this student in those exams
  const examIds = exams.map((e) => e.id)
  const results = await prisma.examResult.findMany({
    where: { studentId, examId: { in: examIds } },
    select: { examId: true, obtainedMarks: true, isAbsent: true },
  })
  const resultMap = new Map(results.map((r) => [r.examId, r]))

  // Build subject rows
  const subjects: ExamReportCard['subjects'] = exams.map((exam, i) => {
    const result = resultMap.get(exam.id)
    const obtained = result?.obtainedMarks ?? null
    const absent = result?.isAbsent ?? false
    let percentage: number | null = null
    let grade: string | null = null
    if (!absent && obtained !== null) {
      const calc = calculateGrade(obtained, exam.totalMarks)
      percentage = calc.percentage
      grade = calc.grade
    }
    return {
      sn: i + 1,
      subjectId: exam.subjectId,
      subjectName: exam.subject.name,
      subjectCode: exam.subject.code,
      maxMarks: exam.totalMarks,
      obtainedMarks: absent ? null : obtained,
      isAbsent: absent,
      percentage,
      grade,
    }
  })

  // Totals
  const totalMaxMarks = subjects.reduce((s, r) => s + r.maxMarks, 0)
  const totalObtainedMarks = subjects.every((r) => r.obtainedMarks !== null)
    ? subjects.reduce((s, r) => s + (r.obtainedMarks ?? 0), 0)
    : null
  let overallPercentage: number | null = null
  let overallGrade: string | null = null
  if (totalObtainedMarks !== null && totalMaxMarks > 0) {
    const calc = calculateGrade(totalObtainedMarks, totalMaxMarks)
    overallPercentage = calc.percentage
    overallGrade = calc.grade
  }

  const parent = student.parentLinks[0]?.parent
  const fatherName = parent ? `${parent.firstName} ${parent.lastName}` : null
  const latestExamDate = exams.length > 0
    ? (exams[exams.length - 1].date instanceof Date
        ? exams[exams.length - 1].date.toISOString().split('T')[0]
        : exams[exams.length - 1].date as unknown as string)
    : null

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      rollNumber: student.rollNumber ?? null,
      fatherName,
      photoUrl: student.photoUrl ?? null,
      sectionName: student.section?.name ?? '—',
      gradeName: student.section?.grade?.name ?? '—',
      programName: student.section?.grade?.program?.name ?? '—',
      campusName: student.campus?.name ?? student.section?.grade?.program?.campus?.name ?? '—',
      campusType: student.section?.grade?.program?.campus?.campusType ?? 'COLLEGE',
    },
    examType: { id: examType.id, name: examType.name },
    academicYear: (exams[0] as any)?.academicYear ?? new Date().getFullYear().toString(),
    examDate: latestExamDate,
    subjects,
    totalMaxMarks,
    totalObtainedMarks,
    overallPercentage,
    overallGrade,
    generatedAt: new Date().toISOString(),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getSectionStudentList — list students in a section for report card selection
// ─────────────────────────────────────────────────────────────────────────────
export const getSectionStudentList = async (
  sectionId: string,
  user?: RequestUser
): Promise<{ id: string; firstName: string; lastName: string; rollNumber: string | null }[]> => {
  if (user) await assertSectionCampus(sectionId, user)

  const students = await prisma.studentProfile.findMany({
    where: { sectionId, status: 'ACTIVE' },
    select: { id: true, firstName: true, lastName: true, rollNumber: true },
    orderBy: { rollNumber: 'asc' },
  })

  return students
}
