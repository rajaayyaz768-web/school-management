import { Role } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import prisma from "../config/database";

interface GuardUser {
  id: string;
  role: Role;
  campusId: string | null;
}

// Thrown when a non-SUPER_ADMIN accesses a resource outside their campus.
export class CampusScopeError extends AppError {
  constructor(message = "Access denied: resource belongs to a different campus") {
    super(message, 403);
    this.name = "CampusScopeError";
  }
}

/**
 * Assert that a section belongs to the requesting user's campus.
 * Returns the resolved campus id on success (can be reused by the caller).
 * SUPER_ADMIN always passes.
 */
export async function assertSectionCampus(sectionId: string, user: GuardUser): Promise<string> {
  if (user.role === Role.SUPER_ADMIN) return user.campusId ?? "";

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: { grade: { select: { program: { select: { campusId: true } } } } },
  });

  if (!section) throw new AppError("Section not found", 404);

  const campusId = section.grade?.program?.campusId;
  if (!campusId) throw new AppError("Section has no associated campus", 500);

  if (campusId !== user.campusId) throw new CampusScopeError();
  return campusId;
}

/**
 * Assert that a student belongs to the requesting user's campus.
 * Returns the resolved campus id on success.
 * SUPER_ADMIN always passes.
 */
export async function assertStudentCampus(studentId: string, user: GuardUser): Promise<string> {
  if (user.role === Role.SUPER_ADMIN) return user.campusId ?? "";

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { campusId: true },
  });

  if (!student) throw new AppError("Student not found", 404);

  if (student.campusId !== user.campusId) throw new CampusScopeError();
  return student.campusId;
}

/**
 * Assert that a staff member's primary campus matches the requesting user's campus.
 * Returns the resolved campus id on success.
 * SUPER_ADMIN always passes.
 */
export async function assertStaffCampus(staffId: string, user: GuardUser): Promise<string> {
  if (user.role === Role.SUPER_ADMIN) return user.campusId ?? "";

  const assignment = await prisma.staffCampusAssignment.findFirst({
    where: { staffId, isPrimary: true, removedAt: null },
    select: { campusId: true },
  });

  if (!assignment) throw new AppError("Staff member has no primary campus assignment", 404);

  if (assignment.campusId !== user.campusId) throw new CampusScopeError();
  return assignment.campusId;
}

/**
 * Assert that a known campus id matches the requesting user's campus.
 * Used when the campus id is already on the payload (e.g. createFeeStructure).
 * SUPER_ADMIN always passes.
 */
export function requireOwnCampus(user: GuardUser, targetCampusId: string): void {
  if (user.role === Role.SUPER_ADMIN) return;
  if (targetCampusId !== user.campusId) throw new CampusScopeError();
}
