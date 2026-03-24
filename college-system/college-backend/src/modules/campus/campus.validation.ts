import { z } from "zod";

const campusBodySchema = z.object({
  name: z.string().min(3).max(100),
  campus_code: z.string().max(10).regex(/^[A-Z]+$/, "Uppercase letters only"),
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
