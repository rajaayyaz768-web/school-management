import prisma from "../../config/database";
import bcrypt from "bcryptjs";
import { CreateStaffDto, UpdateStaffDto } from "./staff.types";
import { Gender, Role, Prisma } from "@prisma/client";
import crypto from "crypto";

const extractNames = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
};

export const getAllStaff = async (filters: { campusId?: string; employmentType?: string; isActive?: boolean }) => {
  const whereClause: Prisma.StaffProfileWhereInput = {};

  if (filters.campusId) {
    whereClause.campusAssignments = {
      some: {
        campusId: filters.campusId,
        isPrimary: true,
      },
    };
  }
  if (filters.employmentType) {
    whereClause.employmentType = filters.employmentType as any;
  }
  if (filters.isActive !== undefined) {
    // Only fetch via associated user if provided
    whereClause.user = {
      isActive: filters.isActive,
    };
  }

  const staffList = await prisma.staffProfile.findMany({
    where: whereClause,
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

export const getStaffById = async (id: string) => {
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

export const createStaff = async (data: CreateStaffDto) => {
  return await prisma.$transaction(async (tx) => {
    const campus = await tx.campus.findUnique({ where: { id: data.primaryCampusId } });
    if (!campus) throw Object.assign(new Error("Campus not found"), { statusCode: 404 });

    const duplicateEmployee = await tx.staffProfile.findUnique({ where: { staffCode: data.staffCode } });
    if (duplicateEmployee) throw Object.assign(new Error("Staff code already exists"), { statusCode: 409 });

    const duplicateEmail = await tx.user.findUnique({ where: { email: data.email } });
    if (duplicateEmail) throw Object.assign(new Error("Email already registered"), { statusCode: 409 });

    const tempPassword = crypto.randomBytes(4).toString("hex").toUpperCase();
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
        staffCode: data.staffCode,
        firstName: data.firstName,
        lastName: data.lastName || "",
        gender: (data.gender as Gender) || Gender.MALE,
        phone: data.phone || null,
        cnic: data.cnic || null,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
        employmentType: data.employmentType,
        designation: data.designation || null,
        photoUrl: data.photoUrl || null,
        campusAssignments: {
          create: {
            campusId: data.primaryCampusId,
            isPrimary: true,
          },
        },
      },
      include: {
        user: {
          select: { id: true, email: true, role: true, isActive: true },
        },
        campusAssignments: {
          include: {
            campus: true,
          },
        },
      },
    });

    return {
      staff: {
        ...staffProfile,
        campus: staffProfile.campusAssignments[0]?.campus || null,
        campusAssignments: undefined,
      },
      temporaryPassword: tempPassword,
    };
  });
};

export const updateStaff = async (id: string, data: UpdateStaffDto) => {
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

export const toggleStaffStatus = async (id: string) => {
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

export const getStaffByCampus = async (campusId: string) => {
  const staffList = await prisma.staffProfile.findMany({
    where: {
      user: { isActive: true },
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
