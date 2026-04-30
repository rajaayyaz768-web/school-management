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

export const reviewDeviceRequestSchema = z.object({
  params: z.object({ requestId: z.string().uuid("Invalid request ID") }),
  body: z.object({
    action: z.enum(["APPROVE", "REJECT"]),
    note: z.string().optional(),
  }),
});

export const updateDeviceSchema = z.object({
  params: z.object({ deviceId: z.string().uuid("Invalid device ID") }),
  body: z.object({
    label: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});

export const createNetworkSchema = z.object({
  body: z.object({
    campusId: z.string().uuid("Invalid campus ID"),
    cidr: z.string().min(7, "CIDR required"),
    label: z.string().optional(),
  }),
});

export const updateNetworkSchema = z.object({
  params: z.object({ networkId: z.string().uuid("Invalid network ID") }),
  body: z.object({
    cidr: z.string().optional(),
    label: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
