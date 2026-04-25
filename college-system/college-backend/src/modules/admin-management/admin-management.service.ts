import prisma from "../../config/database";
import bcrypt from "bcryptjs";
import { Gender, Role } from "@prisma/client";

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
