import { z } from "zod";

const programBodySchema = z.object({
  campus_id: z.string().uuid("Invalid campus ID"),
  name: z.string().min(3).max(100),
  code: z.string().max(10).regex(/^[A-Z]+$/, "Uppercase letters only"),
  total_years: z.number().min(1).max(5).optional(),
});

export const createProgramSchema = z.object({
  body: programBodySchema,
});

export const updateProgramSchema = z.object({
  body: programBodySchema.partial(),
});
