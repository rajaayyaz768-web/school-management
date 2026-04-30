import prisma from "../../config/database";
import { UpdateGradeDto } from "./grades.types";

export const createGrade = async (data: { programId: string; name: string; displayOrder?: number }) => {
  const program = await prisma.program.findUnique({ where: { id: data.programId } });
  if (!program) throw Object.assign(new Error("Program not found"), { statusCode: 404 });

  const duplicate = await prisma.grade.findFirst({
    where: { programId: data.programId, name: data.name },
  });
  if (duplicate) throw Object.assign(new Error(`"${data.name}" already exists in this program`), { statusCode: 409 });

  const maxOrder = await prisma.grade.aggregate({
    where: { programId: data.programId },
    _max: { displayOrder: true },
  });

  return await prisma.grade.create({
    data: {
      programId: data.programId,
      name: data.name,
      displayOrder: data.displayOrder ?? (maxOrder._max.displayOrder ?? 0) + 1,
    },
  });
};

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
    teachingMode?: any;
    isTransitional?: boolean;
    displayOrder?: number;
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.is_active !== undefined) updateData.isActive = data.is_active;
  if (data.teaching_mode !== undefined) updateData.teachingMode = data.teaching_mode;
  if (data.is_transitional !== undefined) updateData.isTransitional = data.is_transitional;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

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

export const deleteGrade = async (id: string) => {
  const grade = await prisma.grade.findUnique({
    where: { id },
    include: { sections: { select: { id: true }, take: 1 } },
  });
  if (!grade) throw Object.assign(new Error("Grade not found"), { statusCode: 404 });
  if (grade.sections.length > 0)
    throw Object.assign(new Error("Cannot delete a grade that has sections. Remove all sections first."), { statusCode: 409 });

  await prisma.grade.delete({ where: { id } });
  return { message: "Grade deleted" };
};

// ─── GRADE CURRICULUM (GradeSubject) ─────────────────────────────────────────

export const getSubjectsByGrade = async (gradeId: string) => {
  const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
  if (!grade) throw Object.assign(new Error("Grade not found"), { statusCode: 404 });

  const links = await prisma.gradeSubject.findMany({
    where: { gradeId },
    include: { subject: true },
    orderBy: { subject: { name: "asc" } },
  });

  return links.map((l) => l.subject);
};

export const addSubjectToGrade = async (gradeId: string, subjectId: string) => {
  const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
  if (!grade) throw Object.assign(new Error("Grade not found"), { statusCode: 404 });

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) throw Object.assign(new Error("Subject not found"), { statusCode: 404 });

  const existing = await prisma.gradeSubject.findUnique({
    where: { gradeId_subjectId: { gradeId, subjectId } },
  });
  if (existing) throw Object.assign(new Error("Subject already linked to this grade"), { statusCode: 409 });

  await prisma.gradeSubject.create({ data: { gradeId, subjectId } });
  return subject;
};

export const removeSubjectFromGrade = async (gradeId: string, subjectId: string) => {
  const link = await prisma.gradeSubject.findUnique({
    where: { gradeId_subjectId: { gradeId, subjectId } },
  });
  if (!link) throw Object.assign(new Error("Subject not linked to this grade"), { statusCode: 404 });

  await prisma.gradeSubject.delete({ where: { gradeId_subjectId: { gradeId, subjectId } } });
  return { message: "Subject removed from grade" };
};
