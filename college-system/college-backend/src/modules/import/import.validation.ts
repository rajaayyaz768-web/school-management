import { z } from "zod";

export const validateImportSchema = z.object({
  params: z.object({
    sectionId: z.string().uuid("Invalid section ID"),
  }),
});

export const confirmImportSchema = z.object({
  params: z.object({
    sectionId: z.string().uuid("Invalid section ID"),
  }),
  body: z.object({
    validationToken: z.string().min(1, "Validation token is required"),
    acknowledgeWarnings: z.boolean().default(false),
  }),
});

export const credentialsSchema = z.object({
  params: z.object({
    importId: z.string().uuid("Invalid import ID"),
  }),
});
