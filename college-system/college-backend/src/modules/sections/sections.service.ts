import prisma from "../../config/database";
import { Role } from "@prisma/client";
import { CreateSectionDto, UpdateSectionDto } from "./sections.types";
import { Prisma } from "@prisma/client";

type RequestUser = { id: string; role: Role; campusId: string | null };

export const getAllSections = async (
  filters: { gradeId?: string; campusId?: string; academicYear?: string },
  user: RequestUser
) => {
  if (user.role === Role.PARENT || user.role === Role.STUDENT) return [];

  const whereClause: Prisma.SectionWhereInput = {};

  if (user.role === Role.TEACHER) {
    const staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!staffProfile) return [];
    const sst = await prisma.sectionSubjectTeacher.findMany({
      where: { staffId: staffProfile.id },
      select: { sectionId: true },
      distinct: ["sectionId"],
    });
    if (sst.length === 0) return [];
    whereClause.id = { in: sst.map((r) => r.sectionId) };
  }

  if (filters.gradeId) {
    whereClause.gradeId = filters.gradeId;
  }
  if (filters.campusId) {
    whereClause.grade = {
      program: {
        campusId: filters.campusId,
      },
    };
  }

  const sections = await prisma.section.findMany({
    where: whereClause,
    include: {
      grade: {
        include: {
          program: {
            include: {
              campus: true,
            },
          },
        },
      },
      _count: {
        select: { students: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return sections.map((sec) => ({
    ...sec,
    campus: sec.grade?.program?.campus ?? null,
    classTeacher: null,
    gradeName: sec.grade?.name ?? null,
    programId: sec.grade?.program?.id ?? null,
    programName: sec.grade?.program?.name ?? null,
    programCode: sec.grade?.program?.code ?? null,
    campusId: sec.grade?.program?.campus?.id ?? null,
    studentCount: sec._count?.students ?? 0,
  }));
};

export const getSectionById = async (id: string) => {
  const section = await prisma.section.findUnique({
    where: { id },
    include: {
      grade: {
        include: {
          program: {
            include: {
              campus: true,
            },
          },
        },
      },
    },
  });

  if (!section) {
    throw Object.assign(new Error("Section not found"), { statusCode: 404 });
  }

  return {
    ...section,
    campus: section.grade?.program?.campus || null,
    classTeacher: null,
  };
};

export const createSection = async (data: CreateSectionDto) => {
  return await prisma.$transaction(async (tx) => {
    const grade = await tx.grade.findUnique({
      where: { id: data.gradeId },
      include: {
        program: {
          include: {
            campus: true,
          },
        },
      },
    });
    if (!grade) {
      throw Object.assign(new Error("Grade not found"), { statusCode: 404 });
    }

    const existing = await tx.section.findFirst({
      where: { name: data.name, gradeId: data.gradeId },
    });
    if (existing) {
      throw Object.assign(new Error("Section name already exists for this grade"), { statusCode: 409 });
    }

    const section = await tx.section.create({
      data: {
        gradeId: data.gradeId,
        name: data.name,
        roomNumber: data.roomNumber || null,
        capacity: data.capacity ?? 40,
      },
      include: {
        grade: {
          include: {
            program: {
              include: {
                campus: true,
              },
            },
          },
        },
      },
    });

    return {
      ...section,
      campus: section.grade?.program?.campus || null,
      classTeacher: null,
    };
  });
};

export const updateSection = async (id: string, data: UpdateSectionDto) => {
  const existing = await prisma.section.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Section not found"), { statusCode: 404 });
  }

  if (data.name) {
    const duplicate = await prisma.section.findFirst({
      where: {
        name: data.name,
        gradeId: data.gradeId || existing.gradeId,
        id: { not: id },
      },
    });
    if (duplicate) {
      throw Object.assign(new Error("Section name already exists for this grade"), { statusCode: 409 });
    }
  }

  const updateData: {
    gradeId?: string;
    name?: string;
    roomNumber?: string;
    capacity?: number;
  } = {};

  if (data.gradeId !== undefined) updateData.gradeId = data.gradeId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.roomNumber !== undefined) updateData.roomNumber = data.roomNumber;
  if (data.capacity !== undefined) updateData.capacity = data.capacity;

  const section = await prisma.section.update({
    where: { id },
    data: updateData,
    include: {
      grade: {
        include: {
          program: {
            include: {
              campus: true,
            },
          },
        },
      },
    },
  });

  return {
    ...section,
    campus: section.grade?.program?.campus || null,
    classTeacher: null,
  };
};

export const toggleSectionStatus = async (id: string) => {
  const existing = await prisma.section.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Section not found"), { statusCode: 404 });
  }

  // Explicit return type matches existing mapping seamlessly
  return await prisma.section.update({
    where: { id },
    data: {
      isActive: !existing.isActive,
    },
  });
};

export const getSectionStudentCount = async (id: string) => {
  const existing = await prisma.section.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Section not found"), { statusCode: 404 });
  }

  const studentCount = await prisma.studentProfile.count({
    where: { sectionId: id },
  });

  return {
    section_id: id,
    student_count: studentCount,
  };
};
