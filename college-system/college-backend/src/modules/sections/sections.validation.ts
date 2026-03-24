import { z } from "zod";

const sectionBodySchema = z.object({
  grade_id: z.string().uuid("Invalid grade ID"),
  campus_id: z.string().uuid("Invalid campus ID"),
  name: z.string().min(1).max(10),
  room_number: z.string().optional(),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, "Required format YYYY-YYYY"),
  max_students: z.number().min(1).max(200).optional(),
  class_teacher_id: z.string().uuid("Invalid teacher ID").optional(),
});

export const createSectionSchema = z.object({
  body: sectionBodySchema,
});

export const updateSectionSchema = z.object({
  body: sectionBodySchema.partial(),
});
