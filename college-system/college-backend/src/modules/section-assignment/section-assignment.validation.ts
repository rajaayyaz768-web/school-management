import { z } from "zod";

export const confirmAssignmentSchema = z.object({
  body: z.object({
    gradeId: z.string().uuid("Invalid grade ID format"),
    assignments: z
      .array(
        z.object({
          studentId: z.string().uuid("Invalid student ID format"),
          sectionId: z.string().uuid("Invalid section ID format"),
        })
      )
      .min(1, "At least one assignment is required"),
  }),
});
