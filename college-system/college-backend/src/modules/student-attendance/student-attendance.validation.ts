import { z } from 'zod'
import { AttendanceStatus } from '@prisma/client'

export const markStudentAttendanceSchema = z.object({
  sectionId: z.string().uuid(),
  subjectId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  attendances: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.nativeEnum(AttendanceStatus),
    remarks: z.string().optional(),
  })).min(1, 'At least one attendance record required'),
})

export const updateStudentAttendanceSchema = z.object({
  status: z.nativeEnum(AttendanceStatus).optional(),
  remarks: z.string().optional(),
})