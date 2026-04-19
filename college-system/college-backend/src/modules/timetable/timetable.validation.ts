import { z } from 'zod'
import { DayOfWeek, SlotType } from '@prisma/client'

export const periodConfigSchema = z.object({
  body: z.object({
    campusId: z.string().uuid(),
    gradeId: z.string().uuid(),
    totalPeriods: z.number().int().min(1).max(12),
    periodDurationMins: z.number().int().min(30).max(90),
    breakAfterPeriod: z.number().int().min(1).max(12),
  }),
})

// Flat shape — reused inside bulkCreateSlotsSchema array
const slotShape = z.object({
  sectionId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  staffId: z.string().uuid().optional(),
  dayOfWeek: z.nativeEnum(DayOfWeek),
  slotNumber: z.number().int().min(1).max(12),
  slotType: z.nativeEnum(SlotType),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  academicYear: z.string().min(4),
})

export const createSlotSchema = z.object({
  body: slotShape,
})

export const updateSlotSchema = z.object({
  body: z.object({
    subjectId: z.string().uuid().optional(),
    staffId: z.string().uuid().optional(),
    slotType: z.nativeEnum(SlotType).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  }),
})

export const bulkCreateSlotsSchema = z.object({
  body: z.object({
    slots: z.array(slotShape).min(1),
  }),
})

export const conflictCheckSchema = z.object({
  query: z.object({
    staffId: z.string().uuid(),
    dayOfWeek: z.nativeEnum(DayOfWeek),
    slotNumber: z.coerce.number().int().min(1),
    academicYear: z.string().min(4),
    excludeSectionId: z.string().uuid().optional(),
  }),
})
