import { z } from "zod";

export const updateGradeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    is_active: z.boolean().optional(),
    teaching_mode: z.enum(["SUBJECT_WISE", "CLASS_TEACHER", "DUAL_TEACHER"]).optional(),
    is_transitional: z.boolean().optional(),
  }),
});
