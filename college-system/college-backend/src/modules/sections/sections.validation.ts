import { z } from "zod";

const sectionBodySchema = z.object({
  gradeId: z.string().uuid("Invalid grade ID"),
  name: z.string().min(1).max(10),
  roomNumber: z.string().optional(),
  capacity: z.number().min(1).max(200).optional(),
});

export const createSectionSchema = z.object({
  body: sectionBodySchema,
});

export const updateSectionSchema = z.object({
  body: sectionBodySchema.partial(),
});
