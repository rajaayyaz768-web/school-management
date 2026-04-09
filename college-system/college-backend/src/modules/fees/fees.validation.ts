import { z } from 'zod'
import { FeeStatus } from '@prisma/client'

export const createFeeStructureSchema = z.object({
  programId: z.string().uuid(),
  gradeId: z.string().uuid(),
  campusId: z.string().uuid(),
  academicYear: z.string().min(4),
  admissionFee: z.number().min(0),
  tuitionFee: z.number().min(0),
  examFee: z.number().min(0),
  miscFee: z.number().min(0),
  lateFeePerDay: z.number().min(0),
})

export const updateFeeStructureSchema = z.object({
  admissionFee: z.number().min(0).optional(),
  tuitionFee: z.number().min(0).optional(),
  examFee: z.number().min(0).optional(),
  miscFee: z.number().min(0).optional(),
  lateFeePerDay: z.number().min(0).optional(),
})

export const collectFeeSchema = z.object({
  studentId: z.string().uuid(),
  feeStructureId: z.string().uuid(),
  academicYear: z.string().min(4),
  dueDate: z.string(),
  amountDue: z.number().min(0),
  amountPaid: z.number().min(0),
  discount: z.number().min(0),
  receiptNumber: z.string().min(1),
})

export const markAsPaidSchema = z.object({
  amountPaid: z.number().min(0),
  receiptNumber: z.string().min(1),
  discount: z.number().min(0).optional(),
})
