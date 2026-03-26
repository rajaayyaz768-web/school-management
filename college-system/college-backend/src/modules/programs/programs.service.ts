import prisma from "../../config/database";
import { CreateProgramDto, UpdateProgramDto } from "./programs.types";

const mapToResponse = (program: any) => {
  if (!program) return program;
  const { campusId, isActive, grades, ...rest } = program;
  
  const mappedGrades = grades?.map((g: any) => {
    const { isActive: gIsActive, ...gRest } = g;
    return { ...gRest, is_active: gIsActive };
  });

  return {
    ...rest,
    campus_id: campusId,
    is_active: isActive,
    ...(mappedGrades ? { grades: mappedGrades } : {}),
  };
};

export const getAllPrograms = async (campusId?: string) => {
  const programs = await prisma.program.findMany({
    where: campusId ? { campusId } : undefined,
    include: {
      campus: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return programs.map(mapToResponse);
};

export const getProgramById = async (id: string) => {
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      campus: true,
      grades: true,
    },
  });

  if (!program) {
    throw Object.assign(new Error("Program not found"), { statusCode: 404 });
  }

  return mapToResponse(program);
};

export const createProgram = async (data: CreateProgramDto) => {
  return await prisma.$transaction(async (tx) => {
    const campus = await tx.campus.findUnique({
      where: { id: data.campus_id },
    });
    if (!campus) {
      throw Object.assign(new Error("Campus not found"), { statusCode: 404 });
    }

    const existingCode = await tx.program.findFirst({
      where: { code: data.code, campusId: data.campus_id },
    });
    if (existingCode) {
      throw Object.assign(new Error("Program code already exists in this campus"), {
        statusCode: 409,
      });
    }

    const program = await tx.program.create({
      data: {
        campusId: data.campus_id,
        name: data.name,
        code: data.code,
        durationYears: data.durationYears ?? 2,
        grades: {
          create: [
            { name: "Part 1", displayOrder: 1 },
            { name: "Part 2", displayOrder: 2 },
          ],
        },
      },
      include: {
        grades: true,
      },
    });

    return mapToResponse(program);
  });
};

export const updateProgram = async (id: string, data: UpdateProgramDto) => {
  const existing = await prisma.program.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Program not found"), { statusCode: 404 });
  }

  if (data.code || data.campus_id) {
    const codeToCheck = data.code ?? existing.code;
    const campusToCheck = data.campus_id ?? existing.campusId;
    
    const duplicate = await prisma.program.findFirst({
      where: { 
        code: codeToCheck, 
        campusId: campusToCheck,
        id: { not: id } 
      },
    });

    if (duplicate) {
      throw Object.assign(new Error("Program code already exists in this campus"), {
        statusCode: 409,
      });
    }
  }

  const updateData: {
    name?: string;
    code?: string;
    campusId?: string;
    durationYears?: number;
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.campus_id !== undefined) updateData.campusId = data.campus_id;
  if (data.durationYears !== undefined) updateData.durationYears = data.durationYears;

  const program = await prisma.program.update({
    where: { id },
    data: updateData,
  });
  return mapToResponse(program);
};

export const toggleProgramStatus = async (id: string) => {
  const existing = await prisma.program.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Program not found"), { statusCode: 404 });
  }

  const program = await prisma.program.update({
    where: { id },
    data: {
      isActive: !existing.isActive,
    },
  });
  return mapToResponse(program);
};
