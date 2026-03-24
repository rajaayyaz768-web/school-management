import prisma from "../../config/database";
import { StudentStatus } from "@prisma/client";
import {
  ConfirmAssignmentDto,
  AssignmentPreview,
  SectionCapacityItem,
  StudentAssignmentItem,
} from "./section-assignment.types";

export const getAssignmentData = async (gradeId: string) => {
  const grade = await prisma.grade.findUnique({
    where: { id: gradeId },
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

  const sectionsData = await prisma.section.findMany({
    where: { gradeId },
    include: {
      students: {
        where: { status: StudentStatus.ACTIVE },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const sections: SectionCapacityItem[] = sectionsData.map((s) => ({
    id: s.id,
    name: s.name,
    capacity: s.capacity,
    currentCount: s.students.length,
  }));

  const unassignedStudents = await prisma.studentProfile.findMany({
    where: {
      status: StudentStatus.UNASSIGNED,
      campusId: grade.program.campusId, // Students belong to the campus of this grade's program
    },
    orderBy: {
      rankingMarks: { sort: "desc", nulls: "last" },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rankingMarks: true,
      sectionId: true,
    },
  });

  // Map to precisely match StudentAssignmentItem Shape replacing sectionId with currentSectionId cleanly
  const mappedUnassignedStudents: StudentAssignmentItem[] = unassignedStudents.map(st => ({
    id: st.id,
    firstName: st.firstName,
    lastName: st.lastName,
    rankingMarks: st.rankingMarks,
    currentSectionId: st.sectionId,
  }));

  return {
    grade,
    program: grade.program,
    campus: grade.program.campus,
    unassignedStudents: mappedUnassignedStudents,
    sections,
  };
};

export const autoAssign = async (
  gradeId: string,
  sectionCapacities: { sectionId: string; capacity: number }[]
) => {
  const data = await getAssignmentData(gradeId);
  const students = data.unassignedStudents; // Pre-sorted descending natively

  const result: Record<string, AssignmentPreview> = {};

  // Build maps capturing boundaries explicitly limiting counts correctly
  data.sections.forEach((sec) => {
    result[sec.id] = {
      sectionId: sec.id,
      sectionName: sec.name,
      students: [],
    };
  });

  const limitMap: Record<string, number> = {};
  sectionCapacities.forEach((c) => {
    limitMap[c.sectionId] = c.capacity;
  });

  // Fallback limits matching database raw capacities cleanly
  data.sections.forEach((sec) => {
    if (limitMap[sec.id] === undefined) {
      limitMap[sec.id] = sec.capacity - sec.currentCount;
    }
  });

  let studentIndex = 0;
  for (const sec of data.sections) {
    const available = limitMap[sec.id];
    let added = 0;
    while (studentIndex < students.length && added < available) {
      result[sec.id].students.push(students[studentIndex]);
      added++;
      studentIndex++;
    }
  }

  // If overflow, dump remainder perfectly sorting into the final section
  if (studentIndex < students.length && data.sections.length > 0) {
    const lastSecId = data.sections[data.sections.length - 1].id;
    while (studentIndex < students.length) {
      result[lastSecId].students.push(students[studentIndex]);
      studentIndex++;
    }
  }

  return Object.values(result);
};

export const confirmAssignment = async (data: ConfirmAssignmentDto) => {
  return await prisma.$transaction(async (tx) => {
    // Collect sequence states securely ensuring cross-request overlaps lock successfully explicitly
    const sectionCaches: Record<string, {
      id: string;
      name: string;
      currentCount: number;
      grade: {
        displayOrder: number;
        program: { code: string; campus: { code: string } };
      };
    }> = {};

    let totalAssigned = 0;
    const assignmentsSummary: Array<{
      studentId: string;
      studentName: string;
      sectionName: string;
      rollNumber: string;
    }> = [];
    const skippedSummary: Array<{
      studentId: string;
      reason: string;
    }> = [];

    for (const assignment of data.assignments) {
      const student = await tx.studentProfile.findUnique({
        where: { id: assignment.studentId },
      });

      if (!student) {
        skippedSummary.push({ studentId: assignment.studentId, reason: "Student not found" });
        continue;
      }

      if (student.status === StudentStatus.ACTIVE) {
        skippedSummary.push({ studentId: student.id, reason: "Student already ACTIVE" });
        continue;
      }

      // Pre-fetch explicit section paths caching structurally strictly avoiding repetitive database edges natively
      if (!sectionCaches[assignment.sectionId]) {
        const sec = await tx.section.findUnique({
          where: { id: assignment.sectionId },
          include: {
            grade: {
              include: {
                program: { include: { campus: true } },
              },
            },
            students: {
              where: { status: StudentStatus.ACTIVE },
              select: { id: true },
            },
          },
        });

        if (!sec || sec.gradeId !== data.gradeId) {
          throw Object.assign(new Error(`Invalid section ID: ${assignment.sectionId}`), { statusCode: 400 });
        }

        sectionCaches[assignment.sectionId] = {
          id: sec.id,
          name: sec.name,
          currentCount: sec.students.length, // Local memory counting correctly tracks sequence offsets directly inherently
          grade: {
            displayOrder: sec.grade.displayOrder,
            program: {
              code: sec.grade.program.code,
              campus: { code: sec.grade.program.campus.code },
            },
          },
        };
      }

      const cs = sectionCaches[assignment.sectionId];
      cs.currentCount++; // Increment native sequence inherently

      // Format: {campus.code}-{program.code}-{grade.displayOrder}-{section.name}-{padded_sequence}
      const seqStr = String(cs.currentCount).padStart(3, "0");
      const rollNumber = `${cs.grade.program.campus.code}-${cs.grade.program.code}-${cs.grade.displayOrder}-${cs.name}-${seqStr}`;

      const updated = await tx.studentProfile.update({
        where: { id: student.id },
        data: {
          sectionId: cs.id,
          rollNumber: rollNumber,
          status: StudentStatus.ACTIVE,
        },
      });

      totalAssigned++;
      assignmentsSummary.push({
        studentId: updated.id,
        studentName: `${updated.firstName} ${updated.lastName}`,
        sectionName: cs.name,
        rollNumber: updated.rollNumber || rollNumber,
      });
    }

    return {
      totalAssigned,
      assignments: assignmentsSummary,
      skipped: skippedSummary,
    };
  });
};

export const getSectionFillStatus = async (gradeId: string) => {
  const sectionsData = await prisma.section.findMany({
    where: { gradeId },
    include: {
      students: {
        where: { status: StudentStatus.ACTIVE },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return sectionsData.map((s) => {
    const activeStudentCount = s.students.length;
    const availableSpots = Math.max(0, s.capacity - activeStudentCount);
    const fillPercentage = s.capacity > 0 ? (activeStudentCount / s.capacity) * 100 : 0;

    return {
      id: s.id,
      name: s.name,
      capacity: s.capacity,
      activeStudentCount,
      availableSpots,
      fillPercentage: Math.round(fillPercentage),
    };
  });
};
