import prisma from "../../config/database";
import bcrypt from "bcryptjs";
import { CreateStudentDto, UpdateStudentDto } from "./students.types";
import { Role, StudentStatus, Prisma } from "@prisma/client";
import crypto from "crypto";
import { assertStudentCampus, assertSectionCampus } from "../../utils/campusGuard";

interface RequestUser { id: string; role: Role; campusId: string | null }

export const getAllStudents = async (
  filters: { campusId?: string; sectionId?: string; status?: string; gradeId?: string },
  pagination: { page: number; limit: number }
) => {
  const whereClause: Prisma.StudentProfileWhereInput = {};

  if (filters.campusId) whereClause.campusId = filters.campusId;
  if (filters.sectionId) whereClause.sectionId = filters.sectionId;
  if (filters.status) whereClause.status = filters.status as StudentStatus;

  if (filters.gradeId) {
    whereClause.OR = [
      { section: { gradeId: filters.gradeId } },
      { 
        status: StudentStatus.UNASSIGNED,
        campus: { programs: { some: { grades: { some: { id: filters.gradeId } } } } }
      }
    ];
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    prisma.studentProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        section: { select: { id: true, name: true } },
        campus: { select: { id: true, name: true, code: true } },
        parentLinks: {
          where: { isPrimary: true },
          select: { parent: { select: { phone: true } } },
          take: 1,
        },
      },
      orderBy: { firstName: 'asc' },
      skip,
      take: limit,
    }),
    prisma.studentProfile.count({ where: whereClause })
  ]);

  return {
    data: students,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getStudentById = async (id: string, user?: RequestUser) => {
  if (user) await assertStudentCampus(id, user)

  const student = await prisma.studentProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, isActive: true } },
      section: { select: { id: true, name: true } },
      campus: { select: { id: true, name: true, code: true } },
      parentLinks: {
        where: { isPrimary: true },
        select: { parent: { select: { phone: true } } },
        take: 1,
      },
    },
  });

  if (!student) {
    throw Object.assign(new Error("Student not found"), { statusCode: 404 });
  }

  return student;
};

export const getMyProfile = async (userId: string) => {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, email: true, isActive: true } },
      section: {
        include: {
          grade: {
            include: {
              program: {
                include: { campus: true },
              },
            },
          },
        },
      },
      campus: { select: { id: true, name: true, code: true } },
    },
  });

  if (!student) {
    throw Object.assign(new Error("Student profile not found"), { statusCode: 404 });
  }

  return student;
};

export const createStudent = async (data: CreateStudentDto) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify campus
    const campus = await tx.campus.findUnique({ where: { id: data.campusId } });
    if (!campus) throw Object.assign(new Error("Campus not found"), { statusCode: 404 });

    // 2. Verify grade context
    const grade = await tx.grade.findUnique({ where: { id: data.gradeId } });
    if (!grade) {
      throw Object.assign(new Error("Grade not found"), { statusCode: 404 });
    }

    // 3. Verify duplicate email
    const duplicateEmail = await tx.user.findUnique({ where: { email: data.email } });
    if (duplicateEmail) {
      throw Object.assign(new Error("Email already registered"), { statusCode: 409 });
    }

    // 4. Generate user account
    const tempPassword = crypto.randomBytes(4).toString("hex").toUpperCase();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: Role.STUDENT,
      },
    });

    // 5. Create student profile mapped natively without bypassing constraints
    const studentProfile = await tx.studentProfile.create({
      data: {
        userId: user.id,
        campusId: data.campusId,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        guardianPhone: data.guardianPhone || null,
        dob: data.dob ? new Date(data.dob) : null,
        address: data.address || null,
        phone: data.phone || null,
        photoUrl: data.photoUrl || null,
        rankingMarks: data.rankingMarks ?? null,
        enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : new Date(),
        status: StudentStatus.UNASSIGNED,
        sectionId: null,
        rollNumber: null,
      },
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        section: { select: { id: true, name: true } },
        campus: { select: { id: true, name: true, code: true } }
      }
    });

    return {
      student: studentProfile,
      temporaryPassword: tempPassword,
    };
  });
};

export const updateStudent = async (id: string, data: UpdateStudentDto, user?: RequestUser) => {
  if (user) await assertStudentCampus(id, user)
  if (user && user.role !== Role.SUPER_ADMIN && data.campusId !== undefined) {
    throw Object.assign(new Error("Campus reassignment requires SUPER_ADMIN role"), { statusCode: 403 })
  }

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.studentProfile.findUnique({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error("Student not found"), { statusCode: 404 });
    }

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.guardianPhone !== undefined) updateData.guardianPhone = data.guardianPhone;
    if (data.dob !== undefined) updateData.dob = data.dob ? new Date(data.dob) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
    if (data.rankingMarks !== undefined) updateData.rankingMarks = data.rankingMarks;
    if (data.enrollmentDate !== undefined) updateData.enrollmentDate = data.enrollmentDate ? new Date(data.enrollmentDate) : null;
    if (data.campusId !== undefined) updateData.campusId = data.campusId;

    const updated = await tx.studentProfile.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        section: { select: { id: true, name: true } },
        campus: { select: { id: true, name: true, code: true } }
      }
    });

    return updated;
  });
};

export const getUnassignedStudents = async (gradeId: string) => {
  const grade = await prisma.grade.findUnique({
    where: { id: gradeId },
    include: { program: true }
  });

  if (!grade) {
    throw Object.assign(new Error("Grade not found"), { statusCode: 404 });
  }

  const students = await prisma.studentProfile.findMany({
    where: { 
      status: StudentStatus.UNASSIGNED,
      campusId: grade.program.campusId 
    },
    include: {
      user: { select: { id: true, email: true, isActive: true } },
      section: { select: { id: true, name: true } }, // Should inherently be null
      campus: { select: { id: true, name: true, code: true } }
    },
    orderBy: [
      { rankingMarks: 'desc' },
      { id: 'asc' } // stable backup sort for nulls
    ]
  });

  return students;
};

export const getStudentsBySection = async (sectionId: string, user?: RequestUser) => {
  if (user) await assertSectionCampus(sectionId, user)

  // Teachers may only access sections they are assigned to teach
  if (user && user.role === Role.TEACHER) {
    const assignment = await prisma.sectionSubjectTeacher.findFirst({
      where: { sectionId, staff: { userId: user.id } },
    });
    if (!assignment) {
      throw Object.assign(new Error("You are not assigned to this section"), { statusCode: 403 });
    }
  }

  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section) {
    throw Object.assign(new Error("Section not found"), { statusCode: 404 });
  }

  const students = await prisma.studentProfile.findMany({
    where: { sectionId, status: StudentStatus.ACTIVE },
    include: {
      user: { select: { id: true, email: true, isActive: true } },
      campus: { select: { id: true, name: true, code: true } },
      parentLinks: {
        where: { isPrimary: true },
        select: { parent: { select: { phone: true } } },
        take: 1,
      },
    },
    orderBy: { rollNumber: 'asc' }
  });

  return students;
};
