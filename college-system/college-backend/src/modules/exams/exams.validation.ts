import { z } from 'zod'

export const createExamTypeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    campusId: z.string().uuid(),
  }),
})

export const createExamSchema = z.object({
  body: z.object({
    examTypeId: z.string().uuid(),
    sectionId: z.string().uuid(),
    subjectId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    durationMins: z.number().int().min(15).max(480),
    totalMarks: z.number().int().min(1).max(1000),
    venue: z.string().optional(),
    supervisorStaffId: z.string().uuid().optional(),
  }),
})

export const updateExamSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    durationMins: z.number().int().min(15).max(480).optional(),
    totalMarks: z.number().int().min(1).max(1000).optional(),
    venue: z.string().optional(),
    status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
    supervisorStaffId: z.string().uuid().optional(),
  }),
})

export const enterResultSchema = z.object({
  body: z.object({
    examId: z.string().uuid(),
    studentId: z.string().uuid(),
    obtainedMarks: z.number().min(0).optional(),
    isAbsent: z.boolean(),
    remarks: z.string().optional(),
  }),
})

export const bulkEnterResultsSchema = z.object({
  body: z.object({
    results: z.array(z.object({
      examId: z.string().uuid(),
      studentId: z.string().uuid(),
      obtainedMarks: z.number().min(0).optional(),
      isAbsent: z.boolean(),
      remarks: z.string().optional(),
    })).min(1),
  }),
})
