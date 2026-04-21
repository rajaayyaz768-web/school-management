import { Role } from '@prisma/client'
import prisma from '../../config/database'
import {
  CreateExamTypeDto,
  CreateExamDto,
  UpdateExamDto,
  ExamResponse,
  ExamTypeResponse,
  EnterResultDto,
  BulkEnterResultsDto,
  ExamResultResponse,
} from './exams.types'
import { assertSectionCampus, assertStudentCampus } from '../../utils/campusGuard'

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

const examInclude = {
  examType: { select: { id: true, name: true } },
  section: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
}

function mapToExamResponse(exam: any): ExamResponse {
  return {
    id: exam.id,
    examTypeId: exam.examTypeId,
    sectionId: exam.sectionId,
    subjectId: exam.subjectId,
    date: exam.date instanceof Date ? exam.date.toISOString().split('T')[0] : exam.date,
    startTime: exam.startTime,
    durationMins: exam.durationMins,
    totalMarks: exam.totalMarks,
    venue: exam.venue ?? null,
    status: exam.status,
    supervisorStaffId: exam.supervisorStaffId ?? null,
    createdAt: exam.createdAt.toISOString(),
    updatedAt: exam.updatedAt.toISOString(),
    examType: exam.examType,
    section: exam.section,
    subject: exam.subject,
  }
}

function mapToResultResponse(result: any, totalMarks: number): ExamResultResponse {
  let grade: string | null = null
  let percentage: number | null = null

  if (result.obtainedMarks !== null && result.obtainedMarks !== undefined && !result.isAbsent) {
    const calc = calculateGrade(result.obtainedMarks, totalMarks)
    grade = calc.grade
    percentage = calc.percentage
  }

  return {
    id: result.id,
    examId: result.examId,
    studentId: result.studentId,
    obtainedMarks: result.obtainedMarks ?? null,
    isAbsent: result.isAbsent,
    remarks: result.remarks ?? null,
    gradedById: result.gradedById ?? null,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
    student: {
      id: result.student.id,
      firstName: result.student.firstName,
      lastName: result.student.lastName,
      rollNumber: result.student.rollNumber ?? null,
    },
    grade,
    percentage,
  }
}

export const getAllExamTypes = async (campusId?: string): Promise<ExamTypeResponse[]> => {
  const where: any = {}
  if (campusId) where.campusId = campusId

  const records = await prisma.examType.findMany({
    where,
    orderBy: { name: 'asc' },
  })

  return records.map((r) => ({
    id: r.id,
    name: r.name,
    campusId: r.campusId,
    createdAt: r.createdAt.toISOString(),
  }))
}

export const createExamType = async (data: CreateExamTypeDto): Promise<ExamTypeResponse> => {
  const existing = await prisma.examType.findFirst({
    where: { name: data.name, campusId: data.campusId },
  })
  if (existing) {
    const error = new Error('Exam type with this name already exists for this campus') as any
    error.status = 409
    throw error
  }

  const record = await prisma.examType.create({
    data: {
      name: data.name,
      campusId: data.campusId,
    },
  })

  return {
    id: record.id,
    name: record.name,
    campusId: record.campusId,
    createdAt: record.createdAt.toISOString(),
  }
}

export const getAllExams = async (filters: {
  sectionId?: string
  subjectId?: string
  examTypeId?: string
  status?: string
  campusId?: string
}): Promise<ExamResponse[]> => {
  const where: any = {}
  if (filters.sectionId) where.sectionId = filters.sectionId
  if (filters.subjectId) where.subjectId = filters.subjectId
  if (filters.examTypeId) where.examTypeId = filters.examTypeId
  if (filters.status) where.status = filters.status
  if (filters.campusId) {
    where.section = { grade: { program: { campusId: filters.campusId } } }
  }

  const records = await prisma.exam.findMany({
    where,
    include: examInclude,
    orderBy: { date: 'desc' },
  })

  return records.map(mapToExamResponse)
}

export const getExamById = async (id: string, user?: RequestUser): Promise<ExamResponse> => {
  const record = await prisma.exam.findUnique({
    where: { id },
    include: examInclude,
  })

  if (!record) {
    const error = new Error('Exam not found') as any
    error.status = 404
    throw error
  }

  if (user) await assertSectionCampus(record.sectionId, user)

  return mapToExamResponse(record)
}

export const createExam = async (data: CreateExamDto, user?: RequestUser): Promise<ExamResponse> => {
  if (user) await assertSectionCampus(data.sectionId, user)

  const section = await prisma.section.findUnique({ where: { id: data.sectionId } })
  if (!section) {
    const error = new Error('Section not found') as any
    error.status = 404
    throw error
  }

  const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } })
  if (!subject) {
    const error = new Error('Subject not found') as any
    error.status = 404
    throw error
  }

  const examType = await prisma.examType.findUnique({ where: { id: data.examTypeId } })
  if (!examType) {
    const error = new Error('Exam type not found') as any
    error.status = 404
    throw error
  }

  const record = await prisma.exam.create({
    data: {
      examTypeId: data.examTypeId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      date: new Date(data.date),
      startTime: data.startTime,
      durationMins: data.durationMins,
      totalMarks: data.totalMarks,
      venue: data.venue,
      supervisorStaffId: data.supervisorStaffId,
      status: 'SCHEDULED',
    },
    include: examInclude,
  })

  return mapToExamResponse(record)
}

export const updateExam = async (id: string, data: UpdateExamDto, user?: RequestUser): Promise<ExamResponse> => {
  const existing = await prisma.exam.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('Exam not found') as any
    error.status = 404
    throw error
  }

  if (user) await assertSectionCampus(existing.sectionId, user)

  const updateData: any = {}
  if (data.date !== undefined) updateData.date = new Date(data.date)
  if (data.startTime !== undefined) updateData.startTime = data.startTime
  if (data.durationMins !== undefined) updateData.durationMins = data.durationMins
  if (data.totalMarks !== undefined) updateData.totalMarks = data.totalMarks
  if (data.venue !== undefined) updateData.venue = data.venue
  if (data.status !== undefined) updateData.status = data.status
  if (data.supervisorStaffId !== undefined) updateData.supervisorStaffId = data.supervisorStaffId

  const record = await prisma.exam.update({
    where: { id },
    data: updateData,
    include: examInclude,
  })

  return mapToExamResponse(record)
}

export const deleteExam = async (id: string, user?: RequestUser): Promise<void> => {
  const existing = await prisma.exam.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('Exam not found') as any
    error.status = 404
    throw error
  }

  if (user) await assertSectionCampus(existing.sectionId, user)

  const resultsCount = await prisma.examResult.count({ where: { examId: id } })
  if (resultsCount > 0) {
    const error = new Error('Cannot delete exam with existing results') as any
    error.status = 400
    throw error
  }

  await prisma.exam.delete({ where: { id } })
}

export const getExamResults = async (examId: string): Promise<ExamResultResponse[]> => {
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) {
    const error = new Error('Exam not found') as any
    error.status = 404
    throw error
  }

  // Fetch existing results
  const existingResults = await prisma.examResult.findMany({
    where: { examId },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } },
    },
  })

  const existingByStudentId = new Map(existingResults.map((r) => [r.studentId, r]))

  // Get ALL students in the section so the result entry table always shows a full roster
  const sectionStudents = await prisma.studentProfile.findMany({
    where: { sectionId: exam.sectionId, status: 'ACTIVE' },
    select: { id: true, firstName: true, lastName: true, rollNumber: true },
    orderBy: [{ rollNumber: 'asc' }, { firstName: 'asc' }],
  })

  const now = new Date().toISOString()

  return sectionStudents.map((student) => {
    const existing = existingByStudentId.get(student.id)
    if (existing) {
      return mapToResultResponse({ ...existing, exam: { totalMarks: exam.totalMarks } }, exam.totalMarks)
    }
    // Placeholder for students without a result yet
    return {
      id: '',
      examId,
      studentId: student.id,
      obtainedMarks: null,
      isAbsent: false,
      remarks: null,
      gradedById: null,
      createdAt: now,
      updatedAt: now,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        rollNumber: student.rollNumber ?? null,
      },
      grade: null,
      percentage: null,
    }
  })
}

export const enterBulkResults = async (
  data: BulkEnterResultsDto,
  gradedById: string,
  user?: RequestUser
): Promise<ExamResultResponse[]> => {
  for (const item of data.results) {
    const exam = await prisma.exam.findUnique({ where: { id: item.examId } })
    if (!exam) {
      const error = new Error(`Exam not found: ${item.examId}`) as any
      error.status = 404
      throw error
    }

    if (user) await assertSectionCampus(exam.sectionId, user)
    if (user) await assertStudentCampus(item.studentId, user)

    if (item.obtainedMarks !== undefined && item.obtainedMarks > exam.totalMarks) {
      const error = new Error('Marks cannot exceed total marks') as any
      error.status = 400
      throw error
    }

    await prisma.examResult.upsert({
      where: { examId_studentId: { examId: item.examId, studentId: item.studentId } },
      create: {
        examId: item.examId,
        studentId: item.studentId,
        obtainedMarks: item.obtainedMarks,
        isAbsent: item.isAbsent,
        remarks: item.remarks,
        gradedById,
      },
      update: {
        obtainedMarks: item.obtainedMarks,
        isAbsent: item.isAbsent,
        remarks: item.remarks,
        gradedById,
      },
    })
  }

  const firstExamId = data.results[0].examId
  return getExamResults(firstExamId)
}

export const getStudentResults = async (studentId: string): Promise<ExamResultResponse[]> => {
  const results = await prisma.examResult.findMany({
    where: { studentId },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } },
      exam: {
        select: {
          id: true,
          totalMarks: true,
          date: true,
          examType: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true, code: true } },
          section: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { exam: { date: 'desc' } },
  })

  return results.map((r) => mapToResultResponse(r, r.exam.totalMarks))
}
