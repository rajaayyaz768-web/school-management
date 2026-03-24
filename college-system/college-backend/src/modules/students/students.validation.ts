import { z } from "zod";
import { Gender } from "@prisma/client";

export const createStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    email: z.string().email("Invalid email format"),
    gender: z.nativeEnum(Gender),
    campusId: z.string().uuid("Invalid campus ID"),
    gradeId: z.string().uuid("Invalid grade ID"),
    dob: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    phone: z.string().regex(/^03\d{9}$/, "Must be an 11-digit Pakistani number starting with 03").optional(),
    guardianPhone: z.string().regex(/^03\d{9}$/, "Must be an 11-digit Pakistani number starting with 03").optional(),
    address: z.string().optional(),
    photoUrl: z.string().url("Invalid URL").optional(),
    rankingMarks: z.number().min(0).max(1100).optional(),
    enrollmentDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(100).optional(),
    lastName: z.string().min(2).max(100).optional(),
    gender: z.nativeEnum(Gender).optional(),
    campusId: z.string().uuid("Invalid campus ID").optional(),
    dob: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    phone: z.string().regex(/^03\d{9}$/, "Must be an 11-digit Pakistani number starting with 03").optional(),
    guardianPhone: z.string().regex(/^03\d{9}$/, "Must be an 11-digit Pakistani number starting with 03").optional(),
    address: z.string().optional(),
    photoUrl: z.string().url("Invalid URL").optional(),
    rankingMarks: z.number().min(0).max(1100).optional(),
    enrollmentDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  }),
});
