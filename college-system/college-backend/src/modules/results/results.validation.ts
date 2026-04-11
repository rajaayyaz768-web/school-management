import { z } from 'zod'

export const reportCardQuerySchema = z.object({
  studentId: z.string().uuid(),
  academicYear: z.string().min(4).optional(),
})

export const sectionResultsQuerySchema = z.object({
  sectionId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  examId: z.string().uuid().optional(),
})
