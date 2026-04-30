import prisma from "../../config/database";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  CreateParentDto,
  UpdateParentDto,
  LinkStudentDto,
} from "./parents.types";
import { Role, Prisma } from "@prisma/client";

export const getAllParents = async (
  filters: { search?: string; campusId?: string },
  pagination: { page?: number; limit?: number } = {}
) => {
  const whereClause: Prisma.ParentProfileWhereInput = {};

  if (filters.campusId) {
    whereClause.studentLinks = {
      some: { student: { campusId: filters.campusId } },
    };
  }

  if (filters.search) {
    whereClause.OR = [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search } },
    ];
  }

  const page = Math.max(1, pagination.page ?? 1);
  const limit = Math.min(100, Math.max(1, pagination.limit ?? 20));
  const skip = (page - 1) * limit;

  const [parentsData, total] = await Promise.all([
    prisma.parentProfile.findMany({
    where: whereClause,
    include: {
      user: { select: { id: true, email: true, isActive: true } },
      studentLinks: {
        select: {
          id: true,
          relationship: true,
          isPrimary: true,
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              rollNumber: true,
              status: true,
              section: { select: { id: true, name: true } }
            }
          }
        }
      }
    },
    orderBy: { firstName: "asc" },
    skip,
    take: limit,
  }),
    prisma.parentProfile.count({ where: whereClause }),
  ]);

  return {
    data: parentsData,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getParentById = async (id: string) => {
  const parent = await prisma.parentProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, isActive: true } },
      studentLinks: {
        select: {
          id: true,
          relationship: true,
          isPrimary: true,
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              rollNumber: true,
              status: true,
              section: { select: { id: true, name: true } }
            }
          }
        }
      }
    }
  });

  if (!parent) {
    throw Object.assign(new Error("Parent not found"), { statusCode: 404 });
  }

  return parent;
};

export const getParentByStudentId = async (studentId: string) => {
  const parents = await prisma.studentParentLink.findMany({
    where: { studentId },
    include: {
      parent: {
        include: {
          user: { select: { id: true, email: true, isActive: true } },
          studentLinks: {
            select: {
              id: true,
              relationship: true,
              isPrimary: true,
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  rollNumber: true,
                  status: true,
                  section: { select: { id: true, name: true } }
                }
              }
            }
          }
        }
      }
    }
  });

  return parents.map(link => link.parent);
};

export const createParent = async (data: CreateParentDto) => {
  return await prisma.$transaction(async (tx) => {
    const existingEmail = await tx.user.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      throw Object.assign(new Error("Email already registered"), { statusCode: 409 });
    }

    if (data.phone) {
      const existingPhone = await tx.parentProfile.findUnique({ where: { phone: data.phone } });
      if (existingPhone) {
        throw Object.assign(new Error("Phone number already registered"), { statusCode: 409 });
      }
    }

    if (data.cnic) {
      const existingCnic = await tx.parentProfile.findUnique({ where: { cnic: data.cnic } });
      if (existingCnic) {
        throw Object.assign(new Error("CNIC already registered"), { statusCode: 409 });
      }
    }

    const tempPassword = crypto.randomBytes(4).toString("hex").toUpperCase();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: Role.PARENT,
      }
    });

    const parentProfile = await tx.parentProfile.create({
      data: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        cnic: data.cnic || null,
        occupation: data.occupation || null,
        address: data.address || null,
      },
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        studentLinks: {
          select: {
            id: true,
            relationship: true,
            isPrimary: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rollNumber: true,
                status: true,
                section: { select: { id: true, name: true } }
              }
            }
          }
        }
      }
    });

    // Auto-link all students whose fatherCnic matches this parent's CNIC
    let autoLinkedStudents = 0;
    if (data.cnic) {
      const matchingStudents = await tx.studentProfile.findMany({
        where: { fatherCnic: data.cnic },
        select: { id: true },
      });
      for (const s of matchingStudents) {
        const linkExists = await tx.studentParentLink.findUnique({
          where: { studentId_parentId: { studentId: s.id, parentId: parentProfile.id } },
        });
        if (!linkExists) {
          await tx.studentParentLink.updateMany({
            where: { studentId: s.id, isPrimary: true },
            data: { isPrimary: false },
          });
          await tx.studentParentLink.create({
            data: { studentId: s.id, parentId: parentProfile.id, relationship: 'FATHER', isPrimary: true },
          });
          autoLinkedStudents++;
        }
      }
    }

    return { parent: parentProfile, temporaryPassword: tempPassword, autoLinkedStudents };
  });
};

export const updateParent = async (id: string, data: UpdateParentDto) => {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.parentProfile.findUnique({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error("Parent not found"), { statusCode: 404 });
    }

    if (data.phone && data.phone !== existing.phone) {
      const phoneConflict = await tx.parentProfile.findUnique({ where: { phone: data.phone } });
      if (phoneConflict) throw Object.assign(new Error("Phone number already taken"), { statusCode: 409 });
    }

    if (data.cnic && data.cnic !== existing.cnic) {
      const cnicConflict = await tx.parentProfile.findUnique({ where: { cnic: data.cnic } });
      if (cnicConflict) throw Object.assign(new Error("CNIC already taken"), { statusCode: 409 });
    }

    const updated = await tx.parentProfile.update({
      where: { id },
      data: {
        firstName: data.firstName !== undefined ? data.firstName : undefined,
        lastName: data.lastName !== undefined ? data.lastName : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        cnic: data.cnic !== undefined ? data.cnic : undefined,
        occupation: data.occupation !== undefined ? data.occupation : undefined,
        address: data.address !== undefined ? data.address : undefined,
      },
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        studentLinks: {
          select: {
            id: true,
            relationship: true,
            isPrimary: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rollNumber: true,
                status: true,
                section: { select: { id: true, name: true } }
              }
            }
          }
        }
      }
    });

    return updated;
  });
};

export const linkStudentToParent = async (parentId: string, data: LinkStudentDto) => {
  return await prisma.$transaction(async (tx) => {
    const parent = await tx.parentProfile.findUnique({ where: { id: parentId } });
    if (!parent) throw Object.assign(new Error("Parent not found"), { statusCode: 404 });

    const student = await tx.studentProfile.findUnique({ where: { id: data.studentId } });
    if (!student) throw Object.assign(new Error("Student not found"), { statusCode: 404 });

    const existingLink = await tx.studentParentLink.findUnique({
      where: {
        studentId_parentId: {
          studentId: data.studentId,
          parentId,
        }
      }
    });

    if (existingLink) {
      throw Object.assign(new Error("Student and Parent are already linked"), { statusCode: 409 });
    }

    const isPrimary = data.isPrimary ?? false;

    if (isPrimary) {
      await tx.studentParentLink.updateMany({
        where: { studentId: data.studentId },
        data: { isPrimary: false }
      });
    }

    const newLink = await tx.studentParentLink.create({
      data: {
        studentId: data.studentId,
        parentId,
        relationship: data.relationship,
        isPrimary,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            status: true,
            section: { select: { id: true, name: true } }
          }
        }
      }
    });

    return newLink;
  });
};

export const getMyChildren = async (userId: string) => {
  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!parentProfile) {
    throw Object.assign(new Error("Parent profile not found"), { statusCode: 404 });
  }

  const links = await prisma.studentParentLink.findMany({
    where: { parentId: parentProfile.id },
    include: {
      student: {
        include: {
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
        },
      },
    },
    orderBy: { isPrimary: "desc" },
  });

  return links.map((link) => ({
    relationship: link.relationship,
    isPrimary: link.isPrimary,
    student: link.student,
  }));
};

export const unlinkStudentFromParent = async (parentId: string, studentId: string) => {
  const existingLink = await prisma.studentParentLink.findUnique({
    where: {
      studentId_parentId: { studentId, parentId }
    }
  });

  if (!existingLink) {
    throw Object.assign(new Error("Link between Student and Parent not found"), { statusCode: 404 });
  }

  await prisma.studentParentLink.delete({
    where: { id: existingLink.id }
  });

  return { message: "Student unlinked from parent successfully" };
};
