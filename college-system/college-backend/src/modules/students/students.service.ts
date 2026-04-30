import prisma from "../../config/database";
import bcrypt from "bcryptjs";
import { CreateStudentDto, UpdateStudentDto } from "./students.types";
import { Role, StudentStatus, Prisma } from "@prisma/client";
import crypto from "crypto";
import { assertStudentCampus, assertSectionCampus } from "../../utils/campusGuard";
import { sendCredentialsWhatsApp } from "../../services/whatsapp/metaClient";
import { logger } from "../../utils/logger";

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
    whereClause.gradeId = filters.gradeId;
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
  const txResult = await prisma.$transaction(async (tx) => {
    // 1. Verify campus
    const campus = await tx.campus.findUnique({ where: { id: data.campusId } });
    if (!campus) throw Object.assign(new Error("Campus not found"), { statusCode: 404 });

    // 2. Verify grade and ensure it belongs to this campus
    const grade = await tx.grade.findUnique({
      where: { id: data.gradeId },
      include: { program: true },
    });
    if (!grade) throw Object.assign(new Error("Grade not found"), { statusCode: 404 });
    if (grade.program.campusId !== data.campusId)
      throw Object.assign(new Error("Grade does not belong to the specified campus"), { statusCode: 400 });

    // 3. Validate sectionId if provided (legacy direct-assign path)
    let directSection: {
      id: string; name: string; gradeId: string;
      grade: { displayOrder: number; program: { code: string; campus: { code: string } } };
    } | null = null;

    if (data.sectionId) {
      const sec = await tx.section.findUnique({
        where: { id: data.sectionId },
        include: { grade: { include: { program: { include: { campus: true } } } } },
      });
      if (!sec) throw Object.assign(new Error("Section not found"), { statusCode: 404 });
      if (sec.gradeId !== data.gradeId)
        throw Object.assign(new Error("Section does not belong to the specified grade"), { statusCode: 400 });
      directSection = {
        id: sec.id, name: sec.name, gradeId: sec.gradeId,
        grade: {
          displayOrder: sec.grade.displayOrder,
          program: { code: sec.grade.program.code, campus: { code: sec.grade.program.campus.code } },
        },
      };
    }

    // 4. Verify duplicate email
    const duplicateEmail = await tx.user.findUnique({ where: { email: data.email } });
    if (duplicateEmail) throw Object.assign(new Error("Email already registered"), { statusCode: 409 });

    // 5. Generate user account
    const tempPassword = crypto.randomBytes(4).toString("hex").toUpperCase();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await tx.user.create({
      data: { email: data.email, passwordHash, role: Role.STUDENT },
    });

    // 6. Build roll number for direct-assign (sequential within section)
    let rollNumber: string | null = null;
    if (directSection) {
      const count = await tx.studentProfile.count({
        where: { sectionId: directSection.id, status: StudentStatus.ACTIVE },
      });
      const seq = String(count + 1).padStart(3, "0");
      rollNumber = `${directSection.grade.program.campus.code}-${directSection.grade.program.code}-${directSection.grade.displayOrder}-${directSection.name}-${seq}`;
    }

    // 7. Create student profile
    const studentProfile = await tx.studentProfile.create({
      data: {
        userId: user.id,
        campusId: data.campusId,
        gradeId: data.gradeId,
        fatherName: data.fatherName || null,
        fatherCnic: data.fatherCnic || null,
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
        status: directSection ? StudentStatus.ACTIVE : StudentStatus.UNASSIGNED,
        sectionId: directSection ? directSection.id : null,
        rollNumber,
      },
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        section: { select: { id: true, name: true } },
        campus: { select: { id: true, name: true, code: true } },
      },
    });

    // 8. If fatherCnic provided, check if a parent with that CNIC exists and auto-link
    if (data.fatherCnic) {
      const matchingParent = await tx.parentProfile.findUnique({ where: { cnic: data.fatherCnic } });
      if (matchingParent) {
        const linkExists = await tx.studentParentLink.findUnique({
          where: { studentId_parentId: { studentId: studentProfile.id, parentId: matchingParent.id } },
        });
        if (!linkExists) {
          await tx.studentParentLink.create({
            data: { studentId: studentProfile.id, parentId: matchingParent.id, relationship: 'FATHER', isPrimary: true },
          });
        }
      }
    }

    return {
      student: studentProfile,
      temporaryPassword: tempPassword,
      guardianPhone: data.guardianPhone ?? null,
      fatherName: data.fatherName ?? null,
      fatherCnic: data.fatherCnic ?? null,
    };
  });

  // ── Fire-and-forget WhatsApp — never blocks enrollment ───────────────────
  if (txResult.guardianPhone && txResult.student.rollNumber) {
    const appUrl = process.env.APP_URL ?? 'https://your-school-portal.com';
    let sectionLabel = 'Pending section assignment';
    let campusName = '';

    if (txResult.student.sectionId) {
      try {
        const sec = await prisma.section.findUnique({
          where: { id: txResult.student.sectionId },
          include: { grade: { include: { program: { include: { campus: true } } } } },
        });
        if (sec) {
          sectionLabel = `${sec.grade.program.name} ${sec.grade.name} — Section ${sec.name}`;
          campusName = sec.grade.program.campus.name;
        }
      } catch { /* ignore */ }
    }

    sendCredentialsWhatsApp(txResult.guardianPhone, {
      parentName: txResult.fatherName ?? 'Guardian',
      studentName: `${txResult.student.firstName} ${txResult.student.lastName}`,
      campusName,
      sectionLabel,
      rollNumber: txResult.student.rollNumber,
      studentPassword: txResult.temporaryPassword,
      parentCnic: txResult.fatherCnic ?? '—',
      parentPassword: 'Use CNIC to login at parent portal',
      appUrl,
    }).catch((err) => {
      logger.warn('[Student] WhatsApp credential send failed', { studentId: txResult.student.id, err });
    });
  }

  return { student: txResult.student, temporaryPassword: txResult.temporaryPassword };
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
    if (data.gradeId !== undefined) updateData.gradeId = data.gradeId;
    if (data.fatherName !== undefined) updateData.fatherName = data.fatherName;
    if (data.fatherCnic !== undefined) updateData.fatherCnic = data.fatherCnic;

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
      gradeId,
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

export const resequenceRollNumbers = async (sectionId: string, user?: RequestUser) => {
  if (user) await assertSectionCampus(sectionId, user);

  return await prisma.$transaction(async (tx) => {
    // Block resequence if any fee or exam records already exist for students in this section
    const locked = await tx.studentProfile.findFirst({
      where: {
        sectionId,
        status: StudentStatus.ACTIVE,
        OR: [
          { feeRecords: { some: {} } },
          { examResults: { some: {} } },
        ],
      },
      select: { id: true },
    });
    if (locked) {
      throw Object.assign(
        new Error("Roll numbers are locked — fee or exam records already exist for students in this section"),
        { statusCode: 409 }
      );
    }

    const section = await tx.section.findUnique({
      where: { id: sectionId },
      include: { grade: { include: { program: { include: { campus: true } } } } },
    });
    if (!section) throw Object.assign(new Error("Section not found"), { statusCode: 404 });

    const students = await tx.studentProfile.findMany({
      where: { sectionId, status: StudentStatus.ACTIVE },
      select: { id: true, firstName: true, lastName: true, rollNumber: true },
    });

    students.sort((a, b) => {
      const fa = a.firstName.toLowerCase(), fb = b.firstName.toLowerCase();
      if (fa !== fb) return fa < fb ? -1 : 1;
      return a.lastName.toLowerCase() < b.lastName.toLowerCase() ? -1 : 1;
    });

    const { code: campusCode } = section.grade.program.campus;
    const { code: programCode } = section.grade.program;
    const { displayOrder } = section.grade;
    const sectionName = section.name;

    const results: {
      studentId: string; firstName: string; lastName: string;
      oldRollNumber: string | null; newRollNumber: string;
    }[] = [];

    for (let i = 0; i < students.length; i++) {
      const seq = String(i + 1).padStart(3, "0");
      const newRollNumber = `${campusCode}-${programCode}-${displayOrder}-${sectionName}-${seq}`;
      await tx.studentProfile.update({ where: { id: students[i].id }, data: { rollNumber: newRollNumber } });
      results.push({
        studentId: students[i].id,
        firstName: students[i].firstName,
        lastName: students[i].lastName,
        oldRollNumber: students[i].rollNumber,
        newRollNumber,
      });
    }

    return { resequenced: results.length, students: results };
  });
};
