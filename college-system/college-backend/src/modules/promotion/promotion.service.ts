import prisma from "../../config/database";
import { PromotionRecordStatus, PromotionRunStatus, PromotionType, StudentStatus } from "@prisma/client";

// ─── getPromotionStatus ────────────────────────────────────────────────────────
export const getPromotionStatus = async (campusId: string) => {
  const grades = await prisma.grade.findMany({
    where: { program: { campusId }, isActive: true },
    include: {
      program: { include: { campus: true } },
      sections: {
        include: {
          students: { where: { status: StudentStatus.ACTIVE }, select: { id: true } },
        },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return grades.map((grade, index) => {
    const activeCount = grade.sections.reduce((sum, s) => sum + s.students.length, 0);
    const nextGrade = grades[index + 1] ?? null;
    const destCount = nextGrade
      ? nextGrade.sections.reduce((sum, s) => sum + s.students.length, 0)
      : 0;

    let canPromote = false;
    let blockedReason: string | null = null;

    if (!nextGrade) {
      // Highest grade — can always "graduate" if it has students
      canPromote = activeCount > 0;
      if (!canPromote) blockedReason = "No active students to graduate";
    } else if (destCount > 0) {
      canPromote = false;
      blockedReason = `"${nextGrade.name}" still has ${destCount} students — promote them first`;
    } else {
      canPromote = activeCount > 0;
      if (!canPromote) blockedReason = "No active students to promote";
    }

    return {
      gradeId: grade.id,
      gradeName: grade.name,
      displayOrder: grade.displayOrder,
      isTransitional: grade.isTransitional,
      teachingMode: grade.teachingMode,
      activeStudentCount: activeCount,
      destinationGradeId: nextGrade?.id ?? null,
      destinationStudentCount: destCount,
      canPromote,
      blockedReason,
    };
  });
};

// ─── createAcademicYear ────────────────────────────────────────────────────────
export const createAcademicYear = async (campusId: string, name: string) => {
  const existing = await prisma.academicYear.findUnique({
    where: { campusId_name: { campusId, name } },
  });
  if (existing) throw Object.assign(new Error("Academic year already exists for this campus"), { statusCode: 409 });

  return prisma.$transaction(async (tx) => {
    await tx.academicYear.updateMany({ where: { campusId }, data: { isActive: false } });
    return tx.academicYear.create({ data: { campusId, name, isActive: true } });
  });
};

// ─── listAcademicYears ─────────────────────────────────────────────────────────
export const listAcademicYears = async (campusId: string) => {
  return prisma.academicYear.findMany({
    where: { campusId },
    orderBy: { name: "desc" },
  });
};

// ─── getPromotionHistory ───────────────────────────────────────────────────────
export const getPromotionHistory = async (campusId: string) => {
  const runs = await prisma.promotionRun.findMany({
    where: { campusId },
    include: {
      initiatedBy: { select: { id: true, email: true, staffProfile: { select: { firstName: true, lastName: true } } } },
      academicYear: { select: { name: true } },
      records: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return runs.map((run) => {
    const counts = run.records.reduce(
      (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
      {} as Record<string, number>
    );
    return {
      id: run.id,
      type: run.type,
      status: run.status,
      academicYear: run.academicYear.name,
      initiatedBy: run.initiatedBy,
      createdAt: run.createdAt,
      completedAt: run.completedAt,
      counts,
    };
  });
};

// ─── Roll number helper (mirrors section-assignment.service.ts) ────────────────
const generateRollNumber = (campusCode: string, programCode: string, displayOrder: number, sectionName: string, seq: number) =>
  `${campusCode}-${programCode}-${displayOrder}-${sectionName}-${String(seq).padStart(3, "0")}`;

// ─── runTransitionalPromotion ──────────────────────────────────────────────────
export const runTransitionalPromotion = async (
  campusId: string,
  initiatedById: string,
  body: { academicYearId: string; assignments: { studentId: string; toSectionId?: string | null; status: string }[] }
) => {
  const year = await prisma.academicYear.findUnique({ where: { id: body.academicYearId } });
  if (!year || year.campusId !== campusId)
    throw Object.assign(new Error("Academic year not found for this campus"), { statusCode: 404 });

  // Find the transitional grade (Pre-9) for this campus
  const transitionalGrade = await prisma.grade.findFirst({
    where: { isTransitional: true, program: { campusId } },
    include: {
      sections: {
        include: { students: { where: { status: StudentStatus.ACTIVE }, select: { id: true } } },
      },
    },
  });
  if (!transitionalGrade)
    throw Object.assign(new Error("No transitional grade (Pre-9) found for this campus"), { statusCode: 404 });

  const preNineActiveCount = transitionalGrade.sections.reduce((s, sec) => s + sec.students.length, 0);
  if (preNineActiveCount > 0)
    throw Object.assign(new Error(`Pre-9 still has ${preNineActiveCount} active students — run Annual Promotion first`), { statusCode: 400 });

  return prisma.$transaction(async (tx) => {
    const run = await tx.promotionRun.create({
      data: { campusId, academicYearId: body.academicYearId, type: PromotionType.TRANSITIONAL, initiatedById },
    });

    const sectionCache: Record<string, { name: string; currentCount: number; grade: { displayOrder: number; program: { code: string; campus: { code: string } } } }> = {};

    let promoted = 0, detained = 0, withdrawn = 0;

    for (const a of body.assignments) {
      const student = await tx.studentProfile.findUnique({ where: { id: a.studentId } });
      if (!student) continue;

      if (a.status === "WITHDRAWN") {
        await tx.studentProfile.update({ where: { id: a.studentId }, data: { status: StudentStatus.WITHDRAWN, sectionId: null } });
        await tx.user.update({ where: { id: student.userId }, data: { isActive: false } });
        await tx.studentPromotionRecord.create({ data: { promotionRunId: run.id, studentId: a.studentId, fromSectionId: student.sectionId, toSectionId: null, status: PromotionRecordStatus.WITHDRAWN } });
        withdrawn++;
        continue;
      }

      if (a.status === "DETAINED") {
        await tx.studentPromotionRecord.create({ data: { promotionRunId: run.id, studentId: a.studentId, fromSectionId: student.sectionId, toSectionId: student.sectionId, status: PromotionRecordStatus.DETAINED } });
        detained++;
        continue;
      }

      // PROMOTED
      if (!a.toSectionId) continue;
      if (!sectionCache[a.toSectionId]) {
        const sec = await tx.section.findUnique({
          where: { id: a.toSectionId },
          include: {
            grade: { include: { program: { include: { campus: true } } } },
            students: { where: { status: StudentStatus.ACTIVE }, select: { id: true } },
          },
        });
        if (!sec) continue;
        sectionCache[a.toSectionId] = { name: sec.name, currentCount: sec.students.length, grade: { displayOrder: sec.grade.displayOrder, program: { code: sec.grade.program.code, campus: { code: sec.grade.program.campus.code } } } };
      }

      const cs = sectionCache[a.toSectionId];
      cs.currentCount++;
      const rollNumber = generateRollNumber(cs.grade.program.campus.code, cs.grade.program.code, cs.grade.displayOrder, cs.name, cs.currentCount);

      await tx.studentProfile.update({ where: { id: a.studentId }, data: { sectionId: a.toSectionId, rollNumber } });
      await tx.studentPromotionRecord.create({ data: { promotionRunId: run.id, studentId: a.studentId, fromSectionId: student.sectionId, toSectionId: a.toSectionId, status: PromotionRecordStatus.PROMOTED, newRollNumber: rollNumber } });
      promoted++;
    }

    await tx.promotionRun.update({ where: { id: run.id }, data: { status: PromotionRunStatus.COMPLETED, completedAt: new Date() } });
    return { runId: run.id, promoted, detained, withdrawn };
  });
};

// ─── runAnnualPromotion ────────────────────────────────────────────────────────
export const runAnnualPromotion = async (
  campusId: string,
  initiatedById: string,
  body: { academicYearId: string; gradeAssignments: { gradeId: string; studentAssignments: { studentId: string; toSectionId?: string | null; status: string }[] }[] }
) => {
  const year = await prisma.academicYear.findUnique({ where: { id: body.academicYearId } });
  if (!year || year.campusId !== campusId)
    throw Object.assign(new Error("Academic year not found for this campus"), { statusCode: 404 });

  // Validate Pre-9 has students (annual can only run after transitional)
  const transitionalGrade = await prisma.grade.findFirst({
    where: { isTransitional: true, program: { campusId } },
    include: { sections: { include: { students: { where: { status: StudentStatus.ACTIVE }, select: { id: true } } } } },
  });
  if (transitionalGrade) {
    const preNineCount = transitionalGrade.sections.reduce((s, sec) => s + sec.students.length, 0);
    if (preNineCount === 0)
      throw Object.assign(new Error("Pre-9 is empty — run the Transitional Promotion (Class 8 → Pre-9) first"), { statusCode: 400 });
  }

  // Fetch all grades ordered highest first for top-down processing
  const allGrades = await prisma.grade.findMany({
    where: { program: { campusId }, isActive: true },
    orderBy: { displayOrder: "desc" },
    select: { id: true, displayOrder: true },
  });
  const highestOrder = allGrades[0]?.displayOrder ?? 0;

  return prisma.$transaction(async (tx) => {
    const run = await tx.promotionRun.create({
      data: { campusId, academicYearId: body.academicYearId, type: PromotionType.ANNUAL, initiatedById },
    });

    const sectionCache: Record<string, { name: string; currentCount: number; grade: { displayOrder: number; program: { code: string; campus: { code: string } } } }> = {};
    let promoted = 0, detained = 0, graduated = 0, withdrawn = 0;

    // Sort gradeAssignments descending by displayOrder so highest grade processes first
    const gradeMap = new Map(allGrades.map(g => [g.id, g.displayOrder]));
    const sorted = [...body.gradeAssignments].sort((a, b) => (gradeMap.get(b.gradeId) ?? 0) - (gradeMap.get(a.gradeId) ?? 0));

    for (const ga of sorted) {
      const gradeOrder = gradeMap.get(ga.gradeId) ?? 0;
      const isHighest = gradeOrder === highestOrder;

      for (const a of ga.studentAssignments) {
        const student = await tx.studentProfile.findUnique({ where: { id: a.studentId } });
        if (!student) continue;

        if (a.status === "WITHDRAWN") {
          await tx.studentProfile.update({ where: { id: a.studentId }, data: { status: StudentStatus.WITHDRAWN, sectionId: null } });
          await tx.user.update({ where: { id: student.userId }, data: { isActive: false } });
          await tx.studentPromotionRecord.create({ data: { promotionRunId: run.id, studentId: a.studentId, fromSectionId: student.sectionId, toSectionId: null, status: PromotionRecordStatus.WITHDRAWN } });
          withdrawn++;
          continue;
        }

        if (a.status === "DETAINED") {
          await tx.studentPromotionRecord.create({ data: { promotionRunId: run.id, studentId: a.studentId, fromSectionId: student.sectionId, toSectionId: student.sectionId, status: PromotionRecordStatus.DETAINED } });
          detained++;
          continue;
        }

        // PROMOTED
        if (isHighest) {
          // Graduation
          await tx.studentProfile.update({ where: { id: a.studentId }, data: { status: StudentStatus.GRADUATED, sectionId: null } });
          await tx.user.update({ where: { id: student.userId }, data: { isActive: false } });
          await tx.studentPromotionRecord.create({ data: { promotionRunId: run.id, studentId: a.studentId, fromSectionId: student.sectionId, toSectionId: null, status: PromotionRecordStatus.GRADUATED } });
          graduated++;
        } else {
          if (!a.toSectionId) continue;
          if (!sectionCache[a.toSectionId]) {
            const sec = await tx.section.findUnique({
              where: { id: a.toSectionId },
              include: { grade: { include: { program: { include: { campus: true } } } }, students: { where: { status: StudentStatus.ACTIVE }, select: { id: true } } },
            });
            if (!sec) continue;
            sectionCache[a.toSectionId] = { name: sec.name, currentCount: sec.students.length, grade: { displayOrder: sec.grade.displayOrder, program: { code: sec.grade.program.code, campus: { code: sec.grade.program.campus.code } } } };
          }

          const cs = sectionCache[a.toSectionId];
          cs.currentCount++;
          const rollNumber = generateRollNumber(cs.grade.program.campus.code, cs.grade.program.code, cs.grade.displayOrder, cs.name, cs.currentCount);

          await tx.studentProfile.update({ where: { id: a.studentId }, data: { sectionId: a.toSectionId, rollNumber } });
          await tx.studentPromotionRecord.create({ data: { promotionRunId: run.id, studentId: a.studentId, fromSectionId: student.sectionId, toSectionId: a.toSectionId, status: PromotionRecordStatus.PROMOTED, newRollNumber: rollNumber } });
          promoted++;
        }
      }
    }

    await tx.promotionRun.update({ where: { id: run.id }, data: { status: PromotionRunStatus.COMPLETED, completedAt: new Date() } });
    return { runId: run.id, graduated, promoted, detained, withdrawn };
  });
};
