import prisma from "../../config/database";
import bcrypt from "bcryptjs";
import { CreateStaffDto, UpdateStaffDto } from "./staff.types";
import { Gender, Role, Prisma } from "@prisma/client";
import crypto from "crypto";
import { assertStaffCampus } from "../../utils/campusGuard";
import { sendStaffWelcomeEmail } from "../../services/email.service";
import logger from "../../utils/logger";

interface RequestUser { id: string; role: Role; campusId: string | null }

const extractNames = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
};

export const getAllStaff = async (
  filters: { campusId?: string; employmentType?: string; isActive?: boolean },
  pagination: { page?: number; limit?: number } = {}
) => {
  const whereClause: Prisma.StaffProfileWhereInput = {};

  if (filters.campusId) {
    whereClause.campusAssignments = {
      some: { campusId: filters.campusId },
    };
  }
  if (filters.employmentType) {
    whereClause.employmentType = filters.employmentType as any;
  }

  whereClause.user = {
    ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
    role: { notIn: [Role.SUPER_ADMIN, Role.ADMIN] },
  };

  const page = Math.max(1, pagination.page ?? 1);
  const limit = Math.min(100, Math.max(1, pagination.limit ?? 20));
  const skip = (page - 1) * limit;

  const [staffList, total] = await Promise.all([
    prisma.staffProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
        campusAssignments: {
          where: { isPrimary: true },
          include: { campus: true },
        },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      skip,
      take: limit,
    }),
    prisma.staffProfile.count({ where: whereClause }),
  ]);

  return {
    data: staffList.map((staff) => ({
      ...staff,
      campus: staff.campusAssignments[0]?.campus || null,
      campusAssignments: undefined,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getStaffById = async (id: string, user?: RequestUser) => {
  if (user) await assertStaffCampus(id, user)

  const staff = await prisma.staffProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, email: true, role: true, isActive: true },
      },
      campusAssignments: {
        where: { isPrimary: true },
        include: {
          campus: true,
        },
      },
    },
  });

  if (!staff) {
    throw Object.assign(new Error("Staff not found"), { statusCode: 404 });
  }

  return {
    ...staff,
    campus: staff.campusAssignments[0]?.campus || null,
    campusAssignments: undefined,
  };
};

const generateUniqueStaffCode = async (tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<string> => {
  const total = await tx.staffProfile.count();
  let seq = total + 1;
  while (true) {
    const code = `EMP-${String(seq).padStart(3, "0")}`;
    const exists = await tx.staffProfile.findUnique({ where: { staffCode: code } });
    if (!exists) return code;
    seq++;
  }
};

export const createStaff = async (data: CreateStaffDto) => {
  // ── Pre-flight checks (outside transaction) ──────────────────────────────
  const campus = await prisma.campus.findUnique({ where: { id: data.primaryCampusId } });
  if (!campus) throw Object.assign(new Error("Campus not found"), { statusCode: 404 });

  const duplicateEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (duplicateEmail) throw Object.assign(new Error("Email already registered in the system"), { statusCode: 409 });

  // Generate credentials before touching the DB so we can test email delivery first
  const tempPassword = crypto.randomBytes(4).toString("hex").toUpperCase();
  const staffCode = data.staffCode?.trim() || await generateUniqueStaffCode(prisma);

  const duplicateCode = await prisma.staffProfile.findUnique({ where: { staffCode } });
  if (duplicateCode) throw Object.assign(new Error("Staff code already exists"), { statusCode: 409 });

  // ── Send welcome email BEFORE creating anything ──────────────────────────
  // If delivery fails (invalid address / non-existent mailbox), abort without
  // creating the account so the admin sees the problem immediately.
  try {
    await sendStaffWelcomeEmail({
      to: data.email,
      firstName: data.firstName,
      lastName: data.lastName || "",
      staffCode,
      loginEmail: data.email,
      temporaryPassword: tempPassword,
    });
  } catch (err: unknown) {
    const e = err as Error;
    const msg = e.message ?? "Unknown error";
    logger.warn("Welcome email rejected for " + data.email + ": " + msg);
    throw Object.assign(
      new Error("Could not deliver the welcome email to '" + data.email + "'. Teacher was NOT created. Check that the email address is valid and can receive mail. (" + msg + ")"),
      { statusCode: 400 }
    );
  }

  // ── Create staff in DB (email confirmed deliverable) ─────────────────────
  return await prisma.$transaction(async (tx) => {
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: Role.TEACHER,
      },
    });

    const staffProfile = await tx.staffProfile.create({
      data: {
        userId: user.id,
        staffCode,
        firstName: data.firstName,
        lastName: data.lastName || "",
        gender: (data.gender as Gender) || Gender.MALE,
        phone: data.phone || null,
        cnic: data.cnic || null,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
        employmentType: data.employmentType,
        designation: data.designation || null,
        photoUrl: data.photoUrl || null,
        temporaryPassword: tempPassword,
        campusAssignments: {
          create: { campusId: data.primaryCampusId, isPrimary: true },
        },
      },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
        campusAssignments: { include: { campus: true } },
      },
    });

    return {
      staff: {
        ...staffProfile,
        campus: staffProfile.campusAssignments[0]?.campus || null,
        campusAssignments: undefined,
      },
      temporaryPassword: tempPassword,
      emailSent: true,
      emailError: null,
    };
  });
};

export const updateStaff = async (id: string, data: UpdateStaffDto, user?: RequestUser) => {
  if (user) await assertStaffCampus(id, user)
  if (user && user.role !== Role.SUPER_ADMIN && data.primaryCampusId !== undefined) {
    throw Object.assign(new Error("Campus reassignment requires SUPER_ADMIN role"), { statusCode: 403 })
  }

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.staffProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw Object.assign(new Error("Staff not found"), { statusCode: 404 });
    }

    if (data.staffCode && data.staffCode !== existing.staffCode) {
      const duplicate = await tx.staffProfile.findUnique({ where: { staffCode: data.staffCode } });
      if (duplicate) throw Object.assign(new Error("Staff code already exists"), { statusCode: 409 });
    }

    const updateData: any = {};

    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.staffCode !== undefined) updateData.staffCode = data.staffCode;
    if (data.cnic !== undefined) updateData.cnic = data.cnic;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.joiningDate !== undefined) updateData.joiningDate = data.joiningDate ? new Date(data.joiningDate) : null;
    if (data.employmentType !== undefined) updateData.employmentType = data.employmentType;
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;

    if (data.primaryCampusId) {
      const campus = await tx.campus.findUnique({ where: { id: data.primaryCampusId } });
      if (!campus) throw Object.assign(new Error("Campus not found"), { statusCode: 404 });

      await tx.staffCampusAssignment.deleteMany({
        where: { staffId: id, isPrimary: true },
      });

      await tx.staffCampusAssignment.create({
        data: {
          staffId: id,
          campusId: data.primaryCampusId,
          isPrimary: true,
        },
      });
    }

    const updated = await tx.staffProfile.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, email: true, role: true, isActive: true },
        },
        campusAssignments: {
          where: { isPrimary: true },
          include: {
            campus: true,
          },
        },
      },
    });

    return {
      ...updated,
      campus: updated.campusAssignments[0]?.campus || null,
      campusAssignments: undefined,
    };
  });
};

export const toggleStaffStatus = async (id: string, user?: RequestUser) => {
  if (user) await assertStaffCampus(id, user)

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.staffProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing || !existing.user) {
      throw Object.assign(new Error("Staff not found"), { statusCode: 404 });
    }

    await tx.user.update({
      where: { id: existing.userId },
      data: {
        isActive: !existing.user.isActive,
      },
    });

    return { message: "Staff status toggled successfully", isActive: !existing.user.isActive };
  });
};

export const deleteStaff = async (id: string, user?: RequestUser) => {
  if (user) await assertStaffCampus(id, user);

  const staff = await prisma.staffProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!staff) throw Object.assign(new Error("Staff not found"), { statusCode: 404 });

  await prisma.$transaction(async (tx) => {
    // Clear nullable FK first (exam supervisor)
    await tx.exam.updateMany({ where: { supervisorStaffId: id }, data: { supervisorStaffId: null } });
    // Clear nullable timetable FK
    await tx.timetableSlot.updateMany({ where: { staffId: id }, data: { staffId: null } });

    // Delete all non-nullable FK records referencing StaffProfile
    await tx.sectionSubjectTeacher.deleteMany({ where: { staffId: id } });
    await tx.staffAttendance.deleteMany({ where: { staffId: id } });
    await tx.staffLeave.deleteMany({ where: { staffId: id } });
    await tx.staffCampusAssignment.deleteMany({ where: { staffId: id } });

    // Delete the profile itself
    await tx.staffProfile.delete({ where: { id } });

    // Delete the login account
    await tx.user.delete({ where: { id: staff.userId } });
  });

  return { message: "Staff deleted successfully" };
};

export const getStaffByCampus = async (campusId: string) => {
  const staffList = await prisma.staffProfile.findMany({
    where: {
      user: { isActive: true, role: { notIn: [Role.SUPER_ADMIN, Role.ADMIN] } },
      campusAssignments: {
        some: { campusId },
      },
    },
    include: {
      user: {
        select: { id: true, email: true, role: true, isActive: true },
      },
      campusAssignments: {
        where: { campusId, isPrimary: true },
        include: {
          campus: true,
        },
      },
    },
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" },
    ],
  });

  return staffList.map((staff) => ({
    ...staff,
    campus: staff.campusAssignments[0]?.campus || null,
    campusAssignments: undefined,
  }));
};

export const resendStaffCredentials = async (id: string) => {
  const staff = await prisma.staffProfile.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!staff) throw Object.assign(new Error("Staff not found"), { statusCode: 404 });
  if (!staff.temporaryPassword)
    throw Object.assign(new Error("No temporary password on record. The teacher may have already changed their password."), { statusCode: 400 });

  await sendStaffWelcomeEmail({
    to: staff.user.email,
    firstName: staff.firstName,
    lastName: staff.lastName,
    staffCode: staff.staffCode,
    loginEmail: staff.user.email,
    temporaryPassword: staff.temporaryPassword,
  });

  return { message: "Credentials resent to " + staff.user.email };
};
