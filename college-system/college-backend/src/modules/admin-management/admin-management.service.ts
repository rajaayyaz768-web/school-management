import prisma from "../../config/database";
import bcrypt from "bcryptjs";
import { DeviceRequestStatus, DeviceStatus, Gender, Role } from "@prisma/client";
import { AppError } from "../../middlewares/error.middleware";
import { isValidCidr } from "../../utils/ipUtils";

export const listAdmins = async () => {
  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN },
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
      staffProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          staffCode: true,
          campusAssignments: {
            where: { isPrimary: true },
            include: { campus: { select: { id: true, name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return admins.map((a) => ({
    ...a,
    campus: a.staffProfile?.campusAssignments[0]?.campus ?? null,
  }));
};

export const createAdmin = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  employeeCode?: string;
  campusId: string;
}) => {
  const campus = await prisma.campus.findUnique({ where: { id: data.campusId } });
  if (!campus) throw Object.assign(new Error("Campus not found"), { statusCode: 404 });
  if (!campus.isActive) throw Object.assign(new Error("Campus is inactive"), { statusCode: 400 });

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw Object.assign(new Error("Email already registered"), { statusCode: 409 });

  const staffCode = data.employeeCode || `ADM-${Date.now()}`;
  const existingCode = await prisma.staffProfile.findUnique({ where: { staffCode } });
  if (existingCode) throw Object.assign(new Error("Employee code already in use"), { statusCode: 409 });

  const passwordHash = await bcrypt.hash(data.password, 12);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: data.email, passwordHash, role: Role.ADMIN },
    });

    const staffProfile = await tx.staffProfile.create({
      data: {
        userId: user.id,
        staffCode,
        firstName: data.firstName,
        lastName: data.lastName || "",
        gender: Gender.MALE,
        campusAssignments: {
          create: { campusId: data.campusId, isPrimary: true },
        },
      },
      include: {
        campusAssignments: {
          where: { isPrimary: true },
          include: { campus: { select: { id: true, name: true } } },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      staffProfile: {
        id: staffProfile.id,
        firstName: staffProfile.firstName,
        lastName: staffProfile.lastName,
        staffCode: staffProfile.staffCode,
      },
      campus: staffProfile.campusAssignments[0]?.campus ?? null,
    };
  });
};

// ── Device Registration Requests ─────────────────────────────────────────────

export const listDeviceRequests = async (status?: DeviceRequestStatus) => {
  return prisma.deviceRegistrationRequest.findMany({
    where: status ? { status } : undefined,
    include: {
      adminUser: {
        select: {
          id: true,
          email: true,
          staffProfile: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const countUnreadDeviceRequests = async () => {
  return prisma.deviceRegistrationRequest.count({
    where: { isRead: false, status: DeviceRequestStatus.PENDING },
  });
};

export const reviewDeviceRequest = async (
  requestId: string,
  action: "APPROVE" | "REJECT",
  note?: string
) => {
  const request = await prisma.deviceRegistrationRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError("Device request not found", 404);
  if (request.status !== DeviceRequestStatus.PENDING) {
    throw new AppError("Request has already been reviewed", 400);
  }

  return prisma.$transaction(async (tx) => {
    if (action === "APPROVE") {
      await tx.registeredDevice.create({
        data: {
          adminUserId: request.adminUserId,
          deviceToken: request.deviceToken,
          userAgent: request.userAgent,
          status: DeviceStatus.ACTIVE,
        },
      });
    }

    return tx.deviceRegistrationRequest.update({
      where: { id: requestId },
      data: {
        status: action === "APPROVE" ? DeviceRequestStatus.APPROVED : DeviceRequestStatus.REJECTED,
        isRead: true,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });
  });
};

export const markDeviceRequestsRead = async () => {
  return prisma.deviceRegistrationRequest.updateMany({
    where: { isRead: false, status: DeviceRequestStatus.PENDING },
    data: { isRead: true },
  });
};

// ── Registered Devices ───────────────────────────────────────────────────────

export const listAdminDevices = async (adminUserId: string) => {
  return prisma.registeredDevice.findMany({
    where: { adminUserId },
    orderBy: { registeredAt: "desc" },
  });
};

export const updateRegisteredDevice = async (
  deviceId: string,
  data: { label?: string; status?: DeviceStatus }
) => {
  const device = await prisma.registeredDevice.findUnique({ where: { id: deviceId } });
  if (!device) throw new AppError("Device not found", 404);
  return prisma.registeredDevice.update({ where: { id: deviceId }, data });
};

export const deleteRegisteredDevice = async (deviceId: string) => {
  const device = await prisma.registeredDevice.findUnique({ where: { id: deviceId } });
  if (!device) throw new AppError("Device not found", 404);
  return prisma.registeredDevice.delete({ where: { id: deviceId } });
};

// ── Campus Allowed Networks ───────────────────────────────────────────────────

export const listAllowedNetworks = async (campusId: string) => {
  return prisma.campusAllowedNetwork.findMany({
    where: { campusId },
    orderBy: { createdAt: "asc" },
  });
};

export const createAllowedNetwork = async (data: {
  campusId: string;
  cidr: string;
  label?: string;
}) => {
  if (!isValidCidr(data.cidr)) throw new AppError("Invalid CIDR notation", 400);
  return prisma.campusAllowedNetwork.create({ data });
};

export const updateAllowedNetwork = async (
  networkId: string,
  data: { cidr?: string; label?: string; isActive?: boolean }
) => {
  if (data.cidr && !isValidCidr(data.cidr)) throw new AppError("Invalid CIDR notation", 400);
  const network = await prisma.campusAllowedNetwork.findUnique({ where: { id: networkId } });
  if (!network) throw new AppError("Network rule not found", 404);
  return prisma.campusAllowedNetwork.update({ where: { id: networkId }, data });
};

export const deleteAllowedNetwork = async (networkId: string) => {
  const network = await prisma.campusAllowedNetwork.findUnique({ where: { id: networkId } });
  if (!network) throw new AppError("Network rule not found", 404);
  return prisma.campusAllowedNetwork.delete({ where: { id: networkId } });
};
