import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];

export const sendRecoveryOtpSchema = z.object({
  body: z.object({
    recoveryEmail: z.string().email("Invalid email address"),
  }),
});

export const verifyRecoveryEmailSchema = z.object({
  body: z.object({
    recoveryEmail: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const sendPasswordResetOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    recoveryEmail: z.string().email("Invalid recovery email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z
      .string()
      .trim()
      .min(1, "Email, roll number, or CNIC is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
