import { z } from "zod";

const campusBodySchema = z.object({
  name: z.string().min(3).max(100),
  campus_code: z.string().max(15).regex(/^[A-Z0-9-]+$/, "Uppercase letters, numbers, and hyphens only (e.g. BOYS, GIRLS-1)").optional(),
  campus_type: z.enum(["SCHOOL", "COLLEGE"]).optional().default("COLLEGE"),
  address: z.string().optional(),
  contact_number: z.string()
    .length(11, "Must be exactly 11 digits")
    .regex(/^03\d{9}$/, "Valid Pakistani mobile: starts with 03, exactly 11 digits")
    .optional(),
});

export const createCampusSchema = z.object({
  body: campusBodySchema,
});

export const updateCampusSchema = z.object({
  body: campusBodySchema.partial(),
});
