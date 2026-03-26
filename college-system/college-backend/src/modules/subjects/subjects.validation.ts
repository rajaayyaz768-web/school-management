import { z } from "zod";
import { SubjectType } from "@prisma/client";

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    code: z.string().min(1).max(10),
    type: z.nativeEnum(SubjectType),
    creditHours: z.number().min(1).max(10),
  }),
});

export const updateSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    code: z.string().min(1).max(10).optional(),
    type: z.nativeEnum(SubjectType).optional(),
    creditHours: z.number().min(1).max(10).optional(),
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
