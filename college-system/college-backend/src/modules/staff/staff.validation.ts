import { z } from "zod";
import { EmploymentType } from "@prisma/client";

const optionalUrl = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z.string().url("Invalid URL").optional()
);

export const createStaffSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().max(100).optional(),
    email: z.string().email("Invalid email format"),
    primaryCampusId: z.string().uuid("Invalid campus ID"),
    staffCode: z.string().min(2).max(50).optional(), // auto-generated if omitted
    designation: z.string().optional(),
    cnic: z.string().length(13, "CNIC must be 13 digits").optional(),
    phone: z.string().optional(),
    joiningDate: z.string().optional(),
    gender: z.string().optional(),
    employmentType: z.nativeEnum(EmploymentType),
    photoUrl: optionalUrl,
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(100).optional(),
    lastName: z.string().max(100).optional(),
    email: z.string().email("Invalid email format").optional(),
    primaryCampusId: z.string().uuid("Invalid campus ID").optional(),
    staffCode: z.string().min(2).max(50).optional(),
    designation: z.string().optional(),
    cnic: z.string().length(13, "CNIC must be 13 digits").optional(),
    phone: z.string().optional(),
    joiningDate: z.string().optional(),
    gender: z.string().optional(),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    photoUrl: optionalUrl,
  }),
});
