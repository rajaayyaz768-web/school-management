import { z } from "zod";

export const createAcademicYearSchema = z.object({
  body: z.object({
    name: z.string().regex(/^\d{4}-\d{4}$/, "Format must be YYYY-YYYY e.g. 2024-2025"),
  }),
});

const studentAssignmentSchema = z.object({
  studentId: z.string().uuid(),
  toSectionId: z.string().uuid().nullable().optional(),
  status: z.enum(["PROMOTED", "DETAINED", "WITHDRAWN"]),
});

export const runTransitionalSchema = z.object({
  body: z.object({
    academicYearId: z.string().uuid(),
    assignments: z.array(studentAssignmentSchema).min(1),
  }),
});

export const runAnnualSchema = z.object({
  body: z.object({
    academicYearId: z.string().uuid(),
    gradeAssignments: z.array(
      z.object({
        gradeId: z.string().uuid(),
        studentAssignments: z.array(studentAssignmentSchema),
      })
    ).min(1),
  }),
});
