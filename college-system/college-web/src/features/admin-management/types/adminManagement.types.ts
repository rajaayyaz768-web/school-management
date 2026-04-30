export interface AdminCampus {
  id: string;
  name: string;
}

export interface AdminStaffProfile {
  id: string;
  firstName: string;
  lastName: string;
  staffCode: string;
}

export interface Admin {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  staffProfile: AdminStaffProfile | null;
  campus: AdminCampus | null;
}

export interface CreateAdminInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  employeeCode?: string;
  campusId: string;
}

// ── Device Registration Requests ─────────────────────────────────────────────

export type DeviceRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DeviceRequest {
  id: string;
  adminUserId: string;
  deviceToken: string;
  userAgent: string | null;
  requestedFromIp: string | null;
  status: DeviceRequestStatus;
  isRead: boolean;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  adminUser: {
    id: string;
    email: string;
    staffProfile: { firstName: string; lastName: string } | null;
  };
}

export interface ReviewDeviceRequestInput {
  action: "APPROVE" | "REJECT";
  note?: string;
}

// ── Registered Devices ───────────────────────────────────────────────────────

export type DeviceStatus = "ACTIVE" | "INACTIVE";

export interface RegisteredDevice {
  id: string;
  adminUserId: string;
  deviceToken: string;
  label: string | null;
  userAgent: string | null;
  status: DeviceStatus;
  registeredAt: string;
}

export interface UpdateDeviceInput {
  label?: string;
  status?: DeviceStatus;
}

// ── Campus Allowed Networks ───────────────────────────────────────────────────

export interface AllowedNetwork {
  id: string;
  campusId: string;
  cidr: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateNetworkInput {
  campusId: string;
  cidr: string;
  label?: string;
}

export interface UpdateNetworkInput {
  cidr?: string;
  label?: string;
  isActive?: boolean;
}
