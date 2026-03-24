import { z } from "zod";
import { SubjectType } from "@prisma/client";

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    code: z.string().max(10).regex(/^[A-Z0-9]+$/, "Uppercase letters and numbers only"),
    type: z.nativeEnum(SubjectType),
    credit_hours: z.number().min(1).max(10), // Mapping explicitly from creditHours
  }),
});

export const updateSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    code: z.string().max(10).regex(/^[A-Z0-9]+$/, "Uppercase letters and numbers only").optional(),
    type: z.nativeEnum(SubjectType).optional(),
    credit_hours: z.number().min(1).max(10).optional(),
  }),
});

export const createAssignmentSchema = z.object({
  body: z.object({
    sectionId: z.string().uuid("Invalid section ID"),
    subjectId: z.string().uuid("Invalid subject ID"),
    staffId: z.string().uuid("Invalid staff ID"),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Required format YYYY-YYYY"),
  }),
});

export const updateAssignmentSchema = z.object({
  body: z.object({
    sectionId: z.string().uuid("Invalid section ID").optional(),
    subjectId: z.string().uuid("Invalid subject ID").optional(),
    staffId: z.string().uuid("Invalid staff ID").optional(),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Required format YYYY-YYYY").optional(),
  }),
});
