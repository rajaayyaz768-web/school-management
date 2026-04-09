import { PrismaClient, FeeStatus } from '@prisma/client'
import {
  CreateFeeStructureDto,
  UpdateFeeStructureDto,
  FeeStructureResponse,
  CollectFeeDto,
  MarkFeeAsPaidDto,
  FeeRecordResponse,
  FeeDefaulter
} from './fees.types'

const prisma = new PrismaClient()

const feeStructureInclude = {
  program: { select: { id: true, name: true, code: true } },
  grade: { select: { id: true, name: true, displayOrder: true } },
  campus: { select: { id: true, name: true, code: true } },
}

const feeRecordInclude = {
  student: {
    select: { id: true, firstName: true, lastName: true, rollNumber: true }
  },
  feeStructure: {
    select: {
      id: true, totalFee: true, academicYear: true,
      program: { select: { id: true, name: true } },
      grade: { select: { id: true, name: true } },
    }
  }
}

function mapToFeeStructureResponse(record: any): FeeStructureResponse {
  return {
    id: record.id,
    programId: record.programId,
    gradeId: record.gradeId,
    campusId: record.campusId,
    academicYear: record.academicYear,
    admissionFee: record.admissionFee,
    tuitionFee: record.tuitionFee,
    examFee: record.examFee,
    miscFee: record.miscFee,
    lateFeePerDay: record.lateFeePerDay,
    totalFee: record.totalFee,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    program: record.program,
    grade: record.grade,
    campus: record.campus,
  }
}

function mapToFeeRecordResponse(record: any): FeeRecordResponse {
  return {
    id: record.id,
    studentId: record.studentId,
    feeStructureId: record.feeStructureId,
    academicYear: record.academicYear,
    dueDate: record.dueDate.toISOString(),
    amountDue: record.amountDue,
    amountPaid: record.amountPaid,
    discount: record.discount,
    status: record.status,
    paidAt: record.paidAt ? record.paidAt.toISOString() : null,
    receiptNumber: record.receiptNumber ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    student: {
      id: record.student.id,
      firstName: record.student.firstName,
      lastName: record.student.lastName,
      rollNumber: record.student.rollNumber ?? null,
    },
    feeStructure: {
      id: record.feeStructure.id,
      totalFee: record.feeStructure.totalFee,
      academicYear: record.feeStructure.academicYear,
      program: record.feeStructure.program,
      grade: record.feeStructure.grade,
    }
  }
}

export const getAllFeeStructures = async (filters: {
  campusId?: string
  academicYear?: string
}): Promise<FeeStructureResponse[]> => {
  const where: any = {}
  if (filters.campusId) where.campusId = filters.campusId
  if (filters.academicYear) where.academicYear = filters.academicYear

  const records = await prisma.feeStructure.findMany({
    where,
    include: feeStructureInclude,
    orderBy: [
      { academicYear: 'desc' },
      { program: { name: 'asc' } },
    ],
  })

  return records.map(mapToFeeStructureResponse)
}

export const getFeeStructureById = async (id: string): Promise<FeeStructureResponse> => {
  const record = await prisma.feeStructure.findUnique({
    where: { id },
    include: feeStructureInclude,
  })

  if (!record) {
    const error = new Error('Fee structure not found') as any
    error.status = 404
    throw error
  }

  return mapToFeeStructureResponse(record)
}

export const createFeeStructure = async (data: CreateFeeStructureDto): Promise<FeeStructureResponse> => {
  const program = await prisma.program.findUnique({ where: { id: data.programId } })
  if (!program) {
    const error = new Error('Program not found') as any
    error.status = 404
    throw error
  }

  const grade = await prisma.grade.findUnique({ where: { id: data.gradeId } })
  if (!grade) {
    const error = new Error('Grade not found') as any
    error.status = 404
    throw error
  }

  const campus = await prisma.campus.findUnique({ where: { id: data.campusId } })
  if (!campus) {
    const error = new Error('Campus not found') as any
    error.status = 404
    throw error
  }

  const existing = await prisma.feeStructure.findFirst({
    where: {
      programId: data.programId,
      gradeId: data.gradeId,
      academicYear: data.academicYear,
    },
  })
  if (existing) {
    const error = new Error('Fee structure already exists for this program, grade, and academic year') as any
    error.status = 409
    throw error
  }

  const totalFee = data.admissionFee + data.tuitionFee + data.examFee + data.miscFee

  const record = await prisma.feeStructure.create({
    data: {
      programId: data.programId,
      gradeId: data.gradeId,
      campusId: data.campusId,
      academicYear: data.academicYear,
      admissionFee: data.admissionFee,
      tuitionFee: data.tuitionFee,
      examFee: data.examFee,
      miscFee: data.miscFee,
      lateFeePerDay: data.lateFeePerDay,
      totalFee,
    },
    include: feeStructureInclude,
  })

  return mapToFeeStructureResponse(record)
}

export const updateFeeStructure = async (id: string, data: UpdateFeeStructureDto): Promise<FeeStructureResponse> => {
  const existing = await prisma.feeStructure.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('Fee structure not found') as any
    error.status = 404
    throw error
  }

  const admissionFee = data.admissionFee ?? existing.admissionFee
  const tuitionFee = data.tuitionFee ?? existing.tuitionFee
  const examFee = data.examFee ?? existing.examFee
  const miscFee = data.miscFee ?? existing.miscFee
  const lateFeePerDay = data.lateFeePerDay ?? existing.lateFeePerDay
  const totalFee = admissionFee + tuitionFee + examFee + miscFee

  const record = await prisma.feeStructure.update({
    where: { id },
    data: {
      admissionFee,
      tuitionFee,
      examFee,
      miscFee,
      lateFeePerDay,
      totalFee,
    },
    include: feeStructureInclude,
  })

  return mapToFeeStructureResponse(record)
}

export const generateFeeRecordsForSection = async (
  feeStructureId: string,
  sectionId: string
): Promise<{ created: number }> => {
  const feeStructure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } })
  if (!feeStructure) {
    const error = new Error('Fee structure not found') as any
    error.status = 404
    throw error
  }

  const students = await prisma.studentProfile.findMany({
    where: {
      sectionId,
      status: 'ACTIVE',
    },
    select: { id: true },
  })

  let created = 0

  for (const student of students) {
    const existingRecord = await prisma.feeRecord.findFirst({
      where: {
        studentId: student.id,
        feeStructureId,
      },
    })

    if (!existingRecord) {
      await prisma.feeRecord.create({
        data: {
          studentId: student.id,
          feeStructureId,
          academicYear: feeStructure.academicYear,
          dueDate: new Date(),
          amountDue: feeStructure.totalFee,
          amountPaid: 0,
          discount: 0,
          status: FeeStatus.PENDING,
        },
      })
      created++
    }
  }

  return { created }
}

export const getStudentFeeRecords = async (studentId: string): Promise<FeeRecordResponse[]> => {
  const records = await prisma.feeRecord.findMany({
    where: { studentId },
    include: feeRecordInclude,
    orderBy: { createdAt: 'desc' },
  })

  return records.map(mapToFeeRecordResponse)
}

export const getAllFeeRecords = async (filters: {
  campusId?: string
  status?: FeeStatus
  academicYear?: string
}): Promise<FeeRecordResponse[]> => {
  const where: any = {}

  if (filters.academicYear) where.academicYear = filters.academicYear
  if (filters.status) where.status = filters.status
  if (filters.campusId) {
    where.student = { campusId: filters.campusId }
  }

  const records = await prisma.feeRecord.findMany({
    where,
    include: feeRecordInclude,
    orderBy: { createdAt: 'desc' },
  })

  return records.map(mapToFeeRecordResponse)
}

export const markFeeAsPaid = async (id: string, data: MarkFeeAsPaidDto): Promise<FeeRecordResponse> => {
  const record = await prisma.feeRecord.findUnique({
    where: { id },
    include: feeRecordInclude,
  })

  if (!record) {
    const error = new Error('Fee record not found') as any
    error.status = 404
    throw error
  }

  if (record.status === FeeStatus.PAID) {
    const error = new Error('Fee already marked as paid') as any
    error.status = 400
    throw error
  }

  const existingReceipt = await prisma.feeRecord.findFirst({
    where: { receiptNumber: data.receiptNumber, NOT: { id } },
  })
  if (existingReceipt) {
    const error = new Error('Receipt number already in use') as any
    error.status = 409
    throw error
  }

  const discount = data.discount ?? 0
  const newStatus: FeeStatus =
    data.amountPaid >= record.amountDue - discount
      ? FeeStatus.PAID
      : FeeStatus.PARTIAL

  const updated = await prisma.feeRecord.update({
    where: { id },
    data: {
      amountPaid: data.amountPaid,
      discount,
      receiptNumber: data.receiptNumber,
      status: newStatus,
      paidAt: new Date(),
    },
    include: feeRecordInclude,
  })

  return mapToFeeRecordResponse(updated)
}

export const getFeeDefaulters = async (
  campusId: string,
  academicYear: string
): Promise<FeeDefaulter[]> => {
  const records = await prisma.feeRecord.findMany({
    where: {
      academicYear,
      status: { in: [FeeStatus.PENDING, FeeStatus.OVERDUE, FeeStatus.PARTIAL] },
      student: { campusId },
    },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, rollNumber: true },
      },
    },
  })

  const grouped = new Map<string, typeof records>()
  for (const record of records) {
    const existing = grouped.get(record.studentId) ?? []
    existing.push(record)
    grouped.set(record.studentId, existing)
  }

  const defaulters: FeeDefaulter[] = []

  for (const [studentId, studentRecords] of grouped) {
    const first = studentRecords[0]
    const totalDue = studentRecords.reduce((sum, r) => sum + r.amountDue, 0)
    const totalPaid = studentRecords.reduce((sum, r) => sum + r.amountPaid, 0)
    const balance = totalDue - totalPaid
    const overdueRecords = studentRecords.filter((r) => r.status === FeeStatus.OVERDUE).length

    defaulters.push({
      studentId,
      firstName: first.student.firstName,
      lastName: first.student.lastName,
      rollNumber: first.student.rollNumber ?? null,
      totalDue,
      totalPaid,
      balance,
      overdueRecords,
    })
  }

  return defaulters.sort((a, b) => b.balance - a.balance)
}
