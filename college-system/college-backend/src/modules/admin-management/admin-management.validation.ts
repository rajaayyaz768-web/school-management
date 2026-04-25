import { z } from "zod";

export const createAdminSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional().default(""),
    employeeCode: z.string().optional(),
    campusId: z.string().uuid("Invalid campus ID"),
  }),
});
