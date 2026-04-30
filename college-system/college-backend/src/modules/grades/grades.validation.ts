import { z } from "zod";

export const createGradeSchema = z.object({
  body: z.object({
    programId: z.string().uuid("Invalid program ID"),
    name: z.string().min(1).max(50),
    displayOrder: z.number().int().positive().optional(),
  }),
});

export const updateGradeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    is_active: z.boolean().optional(),
    teaching_mode: z.enum(["SUBJECT_WISE", "CLASS_TEACHER", "DUAL_TEACHER"]).optional(),
    is_transitional: z.boolean().optional(),
    displayOrder: z.number().int().positive().optional(),
  }),
});
