import prisma from "../../config/database";
import { Role } from "@prisma/client";
import { CreateCampusDto, UpdateCampusDto } from "./campus.types";

type RequestUser = { id: string; role: Role; campusId: string | null };

const countInclude = {
  _count: {
    select: {
      studentProfiles: true,
      staffAssignments: { where: { removedAt: null as null } },
    },
  },
} as const;

const mapToResponse = (campus: any): any => {
  const { code, phone, isActive, campusType, _count, ...rest } = campus;
  return {
    ...rest,
    campus_code: code,
    campus_type: campusType,
    contact_number: phone,
    is_active: isActive,
    student_count: _count?.studentProfiles ?? 0,
    staff_count: _count?.staffAssignments ?? 0,
  };
};

export const getAllCampuses = async (user: RequestUser) => {
  if (user.role === Role.SUPER_ADMIN) {
    const campuses = await prisma.campus.findMany({
      orderBy: { name: "asc" },
      include: countInclude,
    });
    return campuses.map(mapToResponse);
  }

  if (user.role === Role.ADMIN) {
    if (!user.campusId) {
      throw Object.assign(new Error("Admin has no assigned campus"), { statusCode: 403 });
    }
    const campuses = await prisma.campus.findMany({
      where: { id: user.campusId, isActive: true },
      orderBy: { name: "asc" },
      include: countInclude,
    });
    return campuses.map(mapToResponse);
  }

  if (user.role === Role.TEACHER) {
    const staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!staffProfile) return [];
    const assignments = await prisma.staffCampusAssignment.findMany({
      where: { staffId: staffProfile.id, removedAt: null },
      select: { campusId: true },
    });
    const campusIds = assignments.map((a) => a.campusId);
    if (campusIds.length === 0) return [];
    const campuses = await prisma.campus.findMany({
      where: { id: { in: campusIds }, isActive: true },
      orderBy: { name: "asc" },
      include: countInclude,
    });
    return campuses.map(mapToResponse);
  }

  // PARENT and STUDENT have no campus picker
  console.warn(`[Campus Service] getAllCampuses called by role ${user.role} — returning empty array`);
  return [];
};

export const getCampusById = async (id: string) => {
  const campus = await prisma.campus.findUnique({
    where: { id },
  });

  if (!campus) {
    throw Object.assign(new Error("Campus not found"), { statusCode: 404 });
  }

  return mapToResponse(campus);
};

async function generateUniqueCode(baseName: string): Promise<string> {
  const base = baseName
    .trim()
    .split(/\s+/)[0]
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);

  const taken = await prisma.campus.findUnique({ where: { code: base } });
  if (!taken) return base;

  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`;
    const conflict = await prisma.campus.findUnique({ where: { code: candidate } });
    if (!conflict) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export const createCampus = async (data: CreateCampusDto) => {
  const code = data.campus_code ?? await generateUniqueCode(data.name);

  const existing = await prisma.campus.findUnique({ where: { code } });
  if (existing) {
    throw Object.assign(new Error("Campus code already exists"), { statusCode: 409 });
  }

  const campus = await prisma.campus.create({
    data: {
      name: data.name,
      code,
      campusType: (data.campus_type as any) ?? "COLLEGE",
      address: data.address,
      phone: data.contact_number,
    },
  });

  return mapToResponse(campus);
};

export const updateCampus = async (id: string, data: UpdateCampusDto) => {
  const existing = await prisma.campus.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Campus not found"), { statusCode: 404 });
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.campus_code !== undefined) updateData.code = data.campus_code;
  if (data.campus_type !== undefined) updateData.campusType = data.campus_type;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.contact_number !== undefined) updateData.phone = data.contact_number;

  const campus = await prisma.campus.update({
    where: { id },
    data: updateData,
  });
  
  return mapToResponse(campus);
};

export const toggleCampusStatus = async (id: string) => {
  const existing = await prisma.campus.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Campus not found"), { statusCode: 404 });
  }

  const campus = await prisma.campus.update({
    where: { id },
    data: {
      isActive: !existing.isActive,
    },
  });
  
  return mapToResponse(campus);
};
