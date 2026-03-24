import { z } from "zod";
import { Relationship } from "@prisma/client";

export const createParentSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    email: z.string().email("Invalid email format"),
    phone: z.string().regex(/^03\d{9}$/, "Must be an 11-digit Pakistani number starting with 03").optional(),
    cnic: z.string().regex(/^\d{13}$/, "CNIC must be exactly 13 digits without dashes").optional(),
    occupation: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const updateParentSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(100).optional(),
    lastName: z.string().min(2).max(100).optional(),
    phone: z.string().regex(/^03\d{9}$/, "Must be an 11-digit Pakistani number starting with 03").optional(),
    cnic: z.string().regex(/^\d{13}$/, "CNIC must be exactly 13 digits without dashes").optional(),
    occupation: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const linkStudentSchema = z.object({
  body: z.object({
    studentId: z.string().uuid("Invalid student ID format"),
    relationship: z.nativeEnum(Relationship),
    isPrimary: z.boolean().default(false),
  }),
});
