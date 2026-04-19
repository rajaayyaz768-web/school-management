import { z } from 'zod'
import { StaffAttendanceStatus } from '@prisma/client'

export const markAttendanceSchema = z.object({
  body: z.object({
    campusId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    attendances: z.array(z.object({
      staffId: z.string().uuid(),
      status: z.nativeEnum(StaffAttendanceStatus),
      checkIn: z.string().optional(),
      checkOut: z.string().optional(),
      remarks: z.string().optional(),
    })).min(1, 'At least one attendance record required'),
  }),
})

export const updateAttendanceSchema = z.object({
  body: z.object({
    status: z.nativeEnum(StaffAttendanceStatus).optional(),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    remarks: z.string().optional(),
  }),
})