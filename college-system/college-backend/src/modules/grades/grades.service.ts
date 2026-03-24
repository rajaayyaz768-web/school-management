import prisma from "../../config/database";
import { UpdateGradeDto } from "./grades.types";

export const getGradesByProgram = async (programId: string) => {
  const program = await prisma.program.findUnique({
    where: { id: programId },
  });

  if (!program) {
    throw Object.assign(new Error("Program not found"), { statusCode: 404 });
  }

  return await prisma.grade.findMany({
    where: { programId },
    include: {
      program: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      displayOrder: "asc",
    },
  });
};

export const getGradeById = async (id: string) => {
  const grade = await prisma.grade.findUnique({
    where: { id },
    include: {
      program: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!grade) {
    throw Object.assign(new Error("Grade not found"), { statusCode: 404 });
  }

  return grade;
};

export const updateGrade = async (id: string, data: UpdateGradeDto) => {
  const existing = await prisma.grade.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Grade not found"), { statusCode: 404 });
  }

  const updateData: {
    name?: string;
    isActive?: boolean;
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.is_active !== undefined) updateData.isActive = data.is_active;

  return await prisma.grade.update({
    where: { id },
    data: updateData,
    include: {
      program: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
};

export const toggleGradeStatus = async (id: string) => {
  const existing = await prisma.grade.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Grade not found"), { statusCode: 404 });
  }

  return await prisma.grade.update({
    where: { id },
    data: {
      isActive: !existing.isActive,
    },
    include: {
      program: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
};
