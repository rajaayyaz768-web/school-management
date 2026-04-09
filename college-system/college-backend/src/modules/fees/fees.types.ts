import { FeeStatus } from '@prisma/client'

export interface CreateFeeStructureDto {
  programId: string
  gradeId: string
  campusId: string
  academicYear: string
  admissionFee: number
  tuitionFee: number
  examFee: number
  miscFee: number
  lateFeePerDay: number
}

export interface UpdateFeeStructureDto {
  admissionFee?: number
  tuitionFee?: number
  examFee?: number
  miscFee?: number
  lateFeePerDay?: number
}

export interface FeeStructureResponse {
  id: string
  programId: string
  gradeId: string
  campusId: string
  academicYear: string
  admissionFee: number
  tuitionFee: number
  examFee: number
  miscFee: number
  lateFeePerDay: number
  totalFee: number
  createdAt: string
  updatedAt: string
  program: { id: string; name: string; code: string }
  grade: { id: string; name: string; displayOrder: number }
  campus: { id: string; name: string; code: string }
}

export interface CollectFeeDto {
  studentId: string
  feeStructureId: string
  academicYear: string
  dueDate: string
  amountDue: number
  amountPaid: number
  discount: number
  receiptNumber: string
}

export interface MarkFeeAsPaidDto {
  amountPaid: number
  receiptNumber: string
  discount?: number
}

export interface FeeRecordResponse {
  id: string
  studentId: string
  feeStructureId: string
  academicYear: string
  dueDate: string
  amountDue: number
  amountPaid: number
  discount: number
  status: string
  paidAt: string | null
  receiptNumber: string | null
  createdAt: string
  updatedAt: string
  student: {
    id: string
    firstName: string
    lastName: string
    rollNumber: string | null
  }
  feeStructure: {
    id: string
    totalFee: number
    academicYear: string
    program: { id: string; name: string }
    grade: { id: string; name: string }
  }
}

export interface FeeDefaulter {
  studentId: string
  firstName: string
  lastName: string
  rollNumber: string | null
  totalDue: number
  totalPaid: number
  balance: number
  overdueRecords: number
}
