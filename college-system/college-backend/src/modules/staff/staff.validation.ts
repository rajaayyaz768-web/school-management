import { z } from "zod";
import { EmploymentType } from "@prisma/client";

export const createStaffSchema = z.object({
  body: z.object({
    fullName: z.string().min(3).max(200),
    email: z.string().email("Invalid email format"),
    primaryCampusId: z.string().uuid("Invalid campus ID"),
    employeeId: z.string().min(2).max(50),
    designation: z.string().optional(),
    specialization: z.string().optional(),
    cnic: z.string().length(13, "CNIC must be 13 digits").optional(),
    phone: z.string().regex(/^03\d{9}$/, "Must be an 11-digit Pakistani number starting with 03").optional(),
    dateOfJoining: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    employmentType: z.nativeEnum(EmploymentType),
    profilePhotoUrl: z.string().url("Invalid URL").optional(),
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    fullName: z.string().min(3).max(200).optional(),
    email: z.string().email("Invalid email format").optional(),
    primaryCampusId: z.string().uuid("Invalid campus ID").optional(),
    employeeId: z.string().min(2).max(50).optional(),
    designation: z.string().optional(),
    specialization: z.string().optional(),
    cnic: z.string().length(13, "CNIC must be 13 digits").optional(),
    phone: z.string().regex(/^03\d{9}$/, "Must be an 11-digit Pakistani number starting with 03").optional(),
    dateOfJoining: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    profilePhotoUrl: z.string().url("Invalid URL").optional(),
  }),
});
