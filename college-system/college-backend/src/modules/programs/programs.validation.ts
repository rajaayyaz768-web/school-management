import { z } from "zod";

const programBodySchema = z.object({
  campus_id: z.string().uuid("Invalid campus ID"),
  name: z.string().min(2).max(100),
  code: z.string().min(1).max(15),
  durationYears: z.number().min(1).max(5).optional(),
});

export const createProgramSchema = z.object({
  body: programBodySchema,
});

export const updateProgramSchema = z.object({
  body: programBodySchema.partial(),
});
