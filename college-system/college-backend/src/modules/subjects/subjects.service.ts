import prisma from "../../config/database";
import { 
  CreateSubjectDto, 
  UpdateSubjectDto,
  CreateSectionSubjectTeacherDto,
  UpdateSectionSubjectTeacherDto 
} from "./subjects.types";

export const getAllSubjects = async () => {
  return await prisma.subject.findMany({
    orderBy: [
      { isActive: "desc" },
      { name: "asc" },
    ],
  });
};

export const getSubjectById = async (id: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject) {
    throw Object.assign(new Error("Subject not found"), { statusCode: 404 });
  }

  return subject;
};

export const createSubject = async (data: CreateSubjectDto) => {
  const existing = await prisma.subject.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw Object.assign(new Error("Subject code already exists"), { statusCode: 409 });
  }

  return await prisma.subject.create({
    data: {
      name: data.name,
      code: data.code,
      type: data.type,
      creditHours: data.creditHours,
    },
  });
};

export const updateSubject = async (id: string, data: UpdateSubjectDto) => {
  const existing = await prisma.subject.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Subject not found"), { statusCode: 404 });
  }

  if (data.code && data.code !== existing.code) {
    const duplicate = await prisma.subject.findUnique({
      where: { code: data.code },
    });
    if (duplicate) {
      throw Object.assign(new Error("Subject code already exists"), { statusCode: 409 });
    }
  }

  const updateData: {
    name?: string;
    code?: string;
    type?: any;
    creditHours?: number;
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.creditHours !== undefined) updateData.creditHours = data.creditHours;

  return await prisma.subject.update({
    where: { id },
    data: updateData,
  });
};

export const toggleSubjectStatus = async (id: string) => {
  const existing = await prisma.subject.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Subject not found"), { statusCode: 404 });
  }

  return await prisma.subject.update({
    where: { id },
    data: {
      isActive: !existing.isActive,
    },
  });
};

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────

export const getAssignmentsBySection = async (sectionId: string) => {
  return await prisma.sectionSubjectTeacher.findMany({
    where: { sectionId },
    include: {
      subject: true,
      staff: true,
    },
  });
};

export const getAssignmentsByTeacher = async (staffId: string) => {
  return await prisma.sectionSubjectTeacher.findMany({
    where: { staffId },
    include: {
      section: true,
      subject: true,
    },
  });
};

export const createAssignment = async (data: CreateSectionSubjectTeacherDto) => {
  const section = await prisma.section.findUnique({ where: { id: data.sectionId } });
  if (!section) throw Object.assign(new Error("Section not found"), { statusCode: 404 });

  const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
  if (!subject) throw Object.assign(new Error("Subject not found"), { statusCode: 404 });

  const staff = await prisma.staffProfile.findUnique({ where: { id: data.staffId } });
  if (!staff) throw Object.assign(new Error("Staff not found"), { statusCode: 404 });

  const existing = await prisma.sectionSubjectTeacher.findUnique({
    where: {
      sectionId_subjectId_academicYear: {
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        academicYear: data.academicYear,
      },
    },
  });

  if (existing) {
    throw Object.assign(new Error("Assignment already exists for this section, subject, and academic year"), { statusCode: 409 });
  }

  return await prisma.sectionSubjectTeacher.create({
    data: {
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      staffId: data.staffId,
      academicYear: data.academicYear,
    },
    include: {
      section: true,
      subject: true,
      staff: true,
    },
  });
};

export const updateAssignment = async (id: string, data: UpdateSectionSubjectTeacherDto) => {
  const existing = await prisma.sectionSubjectTeacher.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });

  const updateData: {
    sectionId?: string;
    subjectId?: string;
    staffId?: string;
    academicYear?: string;
  } = {};

  if (data.sectionId !== undefined) updateData.sectionId = data.sectionId;
  if (data.subjectId !== undefined) updateData.subjectId = data.subjectId;
  if (data.staffId !== undefined) updateData.staffId = data.staffId;
  if (data.academicYear !== undefined) updateData.academicYear = data.academicYear;

  if (
    updateData.sectionId ||
    updateData.subjectId ||
    updateData.academicYear
  ) {
    const secId = updateData.sectionId || existing.sectionId;
    const subId = updateData.subjectId || existing.subjectId;
    const acYear = updateData.academicYear || existing.academicYear;

    const duplicate = await prisma.sectionSubjectTeacher.findUnique({
      where: {
        sectionId_subjectId_academicYear: {
          sectionId: secId,
          subjectId: subId,
          academicYear: acYear,
        },
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw Object.assign(new Error("Assignment already exists for this section, subject, and academic year"), { statusCode: 409 });
    }
  }

  return await prisma.sectionSubjectTeacher.update({
    where: { id },
    data: updateData,
    include: {
      section: true,
      subject: true,
      staff: true,
    },
  });
};

export const deleteAssignment = async (id: string) => {
  const existing = await prisma.sectionSubjectTeacher.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });

  await prisma.sectionSubjectTeacher.delete({
    where: { id },
  });

  return { message: "Assignment deleted successfully" };
};
